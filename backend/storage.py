import io
import logging
import os
import re
import uuid
import requests

try:
    import cloudinary
    import cloudinary.uploader
    HAS_CLOUDINARY = True
except ImportError:
    HAS_CLOUDINARY = False

logger = logging.getLogger("sacredvista.storage")

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "sacred-vista"
storage_key = None

LOCAL_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(LOCAL_UPLOAD_DIR, exist_ok=True)


def get_cloudinary_credentials() -> dict:
    cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME") or os.environ.get("cloudinary_cloud") or ""
    api_key = os.environ.get("CLOUDINARY_API_KEY") or os.environ.get("cloudinary_api_key") or ""
    api_secret = os.environ.get("CLOUDINARY_API_SECRET") or os.environ.get("cloudinary_secret_key") or ""
    folder = os.environ.get("CLOUDINARY_FOLDER") or os.environ.get("root_folder") or "sacred_vista"
    return {
        "cloud_name": cloud_name.strip(),
        "api_key": api_key.strip(),
        "api_secret": api_secret.strip(),
        "folder": folder.strip() or "sacred_vista",
    }


CLOUDINARY_FOLDER = get_cloudinary_credentials()["folder"]


def is_cloudinary_configured() -> bool:
    if not HAS_CLOUDINARY:
        return False
    creds = get_cloudinary_credentials()
    return bool(creds["cloud_name"] and creds["api_key"] and creds["api_secret"])


def init_cloudinary():
    if not is_cloudinary_configured():
        return False
    creds = get_cloudinary_credentials()
    cloudinary.config(
        cloud_name=creds["cloud_name"],
        api_key=creds["api_key"],
        api_secret=creds["api_secret"],
        secure=True,
    )
    logger.info("Cloudinary configured for cloud %s, folder %s", creds["cloud_name"], creds["folder"])
    return True


def upload_to_cloudinary(data: bytes, folder: str = None, public_id: str = None, filename: str = None) -> dict:
    if not is_cloudinary_configured():
        raise RuntimeError("Cloudinary is not configured with valid credentials")
    init_cloudinary()

    creds = get_cloudinary_credentials()
    target_folder = (folder or creds["folder"]).strip("/")

    options = {
        "folder": target_folder,
        "resource_type": "image",
        "overwrite": True,
    }

    if public_id:
        options["public_id"] = public_id
    elif filename:
        base = os.path.splitext(filename)[0]
        slug = re.sub(r'[^a-zA-Z0-9_-]', '_', base)[:50].strip('_')
        options["public_id"] = f"{slug}_{uuid.uuid4().hex[:6]}" if slug else f"img_{uuid.uuid4().hex[:8]}"

    res = cloudinary.uploader.upload(io.BytesIO(data), **options)
    return {
        "url": res.get("secure_url"),
        "public_id": res.get("public_id"),
        "size": res.get("bytes", len(data)),
        "format": res.get("format"),
        "width": res.get("width"),
        "height": res.get("height"),
    }


def init_storage(force: bool = False):
    global storage_key
    if is_cloudinary_configured():
        init_cloudinary()
        storage_key = "cloudinary"
        return storage_key

    if storage_key and not force:
        return storage_key
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        logger.info("Using local disk storage for uploads in %s", LOCAL_UPLOAD_DIR)
        storage_key = "local"
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": key}, timeout=10)
        resp.raise_for_status()
        storage_key = resp.json().get("storage_key", "local")
        return storage_key
    except Exception as e:
        logger.warning("Remote storage init failed (%s), falling back to local disk storage", e)
        storage_key = "local"
        return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    if is_cloudinary_configured():
        res = upload_to_cloudinary(data, folder=CLOUDINARY_FOLDER, filename=os.path.basename(path))
        return {
            "path": res["public_id"],
            "url": res["url"],
            "size": res["size"],
            "provider": "cloudinary",
        }

    key = init_storage()
    if key == "local":
        fname = os.path.basename(path)
        dest = os.path.join(LOCAL_UPLOAD_DIR, fname)
        with open(dest, "wb") as f:
            f.write(data)
        return {"path": path, "size": len(data), "provider": "local"}

    try:
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.warning("Remote put failed, saving locally: %s", e)
        fname = os.path.basename(path)
        dest = os.path.join(LOCAL_UPLOAD_DIR, fname)
        with open(dest, "wb") as f:
            f.write(data)
        return {"path": path, "size": len(data), "provider": "local"}


def get_object(path: str) -> tuple[bytes, str]:
    if path.startswith("http://") or path.startswith("https://"):
        resp = requests.get(path, timeout=60)
        resp.raise_for_status()
        return resp.content, resp.headers.get("Content-Type", "image/jpeg")

    fname = os.path.basename(path)
    local_path = os.path.join(LOCAL_UPLOAD_DIR, fname)
    if os.path.exists(local_path):
        ctype = "image/jpeg"
        if fname.endswith(".png"):
            ctype = "image/png"
        elif fname.endswith(".webp"):
            ctype = "image/webp"
        with open(local_path, "rb") as f:
            return f.read(), ctype

    key = init_storage()
    if key in ("local", "cloudinary"):
        raise FileNotFoundError(f"Local file {path} not found")
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")
