import logging
import os
import requests

logger = logging.getLogger("sacredvista.storage")

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "sacred-vista"
storage_key = None

LOCAL_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(LOCAL_UPLOAD_DIR, exist_ok=True)


def init_storage(force: bool = False):
    global storage_key
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
    key = init_storage()
    if key == "local":
        fname = os.path.basename(path)
        dest = os.path.join(LOCAL_UPLOAD_DIR, fname)
        with open(dest, "wb") as f:
            f.write(data)
        return {"path": path, "size": len(data)}

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
        return {"path": path, "size": len(data)}


def get_object(path: str) -> tuple[bytes, str]:
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
    if key == "local":
        raise FileNotFoundError(f"Local file {path} not found")
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")
