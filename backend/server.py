from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import logging
from datetime import datetime, timezone, timedelta
from typing import Annotated, List, Literal, Optional

import bcrypt
import jwt
from bson import ObjectId
from fastapi import APIRouter, BackgroundTasks, Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, ConfigDict, EmailStr, Field, field_validator
from starlette.middleware.cors import CORSMiddleware

from seed_data import DESTINATIONS, GALLERY, PACKAGES, SEGMENTS
from emailer import notify_new_inquiry
import storage

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "SacredVistaProd")
client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]
JWT_ALGORITHM = "HS256"
logger = logging.getLogger("sacredvista")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Sacred Vista API")
api = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]
SEGMENT_IDS = {s["id"] for s in SEGMENTS}
STATUSES = ("new", "contacted", "booked", "archived")


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls.model_validate(doc)

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude={"id"})
        return data


class InquiryIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str
    segment: Optional[str] = ""
    message: str = Field(min_length=10, max_length=2000)
    package_id: Optional[str] = None
    package_name: Optional[str] = None
    destination_id: Optional[str] = None
    website: Optional[str] = ""  # honeypot

    @field_validator("name", "message")
    @classmethod
    def strip(cls, v):
        return v.strip()

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, v):
        v = v.strip()
        if not re.fullmatch(r"\+?[0-9 ()-]{7,20}", v) or len(re.sub(r"\D", "", v)) < 7:
            raise ValueError("Please enter a valid phone number")
        return v

    @field_validator("segment")
    @classmethod
    def valid_segment(cls, v):
        if v and v not in SEGMENT_IDS:
            raise ValueError("Unknown travel segment")
        return v or ""


class Inquiry(BaseDocument):
    name: str
    email: str
    phone: str
    segment: str = ""
    message: str
    package_id: Optional[str] = None
    package_name: Optional[str] = None
    destination_id: Optional[str] = None
    status: str = "new"
    created_at: str


class StatusUpdate(BaseModel):
    status: Literal["new", "contacted", "booked", "archived"]


class LoginIn(BaseModel):
    email: EmailStr
    password: str


ShortText = Annotated[str, Field(min_length=1, max_length=300)]
ImageUrl = Annotated[str, Field(pattern=r"^(https://|/api/files/)", max_length=500)]
IMAGE_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
MAX_UPLOAD = 10 * 1024 * 1024


class DayIn(BaseModel):
    day: int = Field(ge=1, le=60)
    title: ShortText
    location: ShortText
    activities: List[ShortText] = Field(default_factory=list, max_length=20)
    travel: str = Field(default="", max_length=200)


class PackageUpdate(BaseModel):
    title: str = Field(default="", max_length=200)
    destination_id: Optional[str] = None
    segment_id: Optional[str] = None
    price_inr: int = Field(default=0, ge=0)
    duration_days: int = Field(default=1, ge=1)
    featured: bool = False
    image: str = Field(default="")
    gallery: List[str] = Field(default_factory=list)
    group_size: str = Field(default="", max_length=100)
    best_season: str = Field(default="", max_length=100)
    summary: str = Field(default="", max_length=2000)
    overview: str = Field(default="", max_length=10000)
    highlights: List[str] = Field(default_factory=list)
    inclusions: List[str] = Field(default_factory=list)
    exclusions: List[str] = Field(default_factory=list)
    info: List[str] = Field(default_factory=list)
    itinerary: List[DayIn] = Field(default_factory=list)


class PackageCreate(PackageUpdate):
    id: str = Field(default="", max_length=100)
    destination_id: str = Field(default="")
    segment_id: str = Field(default="")


class DestinationCreate(BaseModel):
    id: str = Field(default="")
    name: str = Field(default="")
    region: str = Field(default="")
    country: str = Field(default="")
    continent: str = Field(default="")
    lat: float = Field(default=0)
    lng: float = Field(default=0)
    tagline: str = Field(default="")
    description: str = Field(default="")
    banner: str = Field(default="")
    highlights: List[str] = Field(default_factory=list)
    wildlife: List[str] = Field(default_factory=list)
    best_time: str = Field(default="")
    best_months: List[int] = Field(default_factory=list)
    getting_there: str = Field(default="")
    gallery: List[str] = Field(default_factory=list)


class RetireIn(BaseModel):
    retired: bool


BLOG_STATUSES = ("pending", "approved", "rejected")


class BlogSubmissionIn(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    subtitle: str = Field(default="", max_length=400)
    category: str = Field(default="Wildlife", max_length=80)
    location: str = Field(default="", max_length=120)
    author: str = Field(..., min_length=2, max_length=100)
    authorRole: str = Field(default="Traveller & Contributor", max_length=120)
    email: str = Field(default="", max_length=160)
    image: str = Field(default="", max_length=1000)
    excerpt: str = Field(default="", max_length=600)
    quote: str = Field(default="", max_length=400)
    content: str = Field(..., min_length=20, max_length=20000)
    fieldNotes: List[str] = Field(default_factory=list)


class BlogStatusUpdate(BaseModel):
    status: Literal["pending", "approved", "rejected"]


REVIEW_STATUSES = ("pending", "approved", "rejected")


class ReviewSubmissionIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(default="Verified Guest", max_length=120)
    email: str = Field(default="", max_length=160)
    rating: int = Field(default=5, ge=1, le=5)
    segment: str = Field(default="Wildlife", max_length=80)
    location: str = Field(default="Tadoba", max_length=120)
    title: str = Field(..., min_length=3, max_length=200)
    review: str = Field(..., min_length=10, max_length=5000)
    travelDate: str = Field(default="", max_length=80)
    image: str = Field(default="", max_length=1000)


class ReviewStatusUpdate(BaseModel):
    status: Literal["pending", "approved", "rejected"]


def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    return bcrypt.checkpw(p.encode(), h.encode())


def create_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access", "exp": datetime.now(timezone.utc) + timedelta(hours=8)}
    secret = os.environ.get("JWT_SECRET", "475ee8b52c6cfb7781dc1bfdcd236be22198b50b63fd53efdfb249f740daf2f7")
    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)


async def current_admin(request: Request) -> dict:
    header = request.headers.get("Authorization", "")
    token = header[7:] if header.startswith("Bearer ") else request.cookies.get("access_token")
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        secret = os.environ.get("JWT_SECRET", "475ee8b52c6cfb7781dc1bfdcd236be22198b50b63fd53efdfb249f740daf2f7")
        payload = jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user or user.get("role") != "admin":
        raise HTTPException(401, "Not authorised")
    return {"id": str(user["_id"]), "email": user["email"], "name": user.get("name", "Admin"), "role": "admin"}


@api.get("/")
async def root():
    return {"message": "Sacred Vista API"}


@api.get("/catalog")
async def catalog():
    async def col(name):
        query = {"retired": {"$ne": True}} if name == "packages" else {}
        return await db[name].find(query, {"_id": 0}).sort("order", 1).to_list(500)
    return {"segments": await col("segments"), "destinations": await col("destinations"),
            "packages": await col("packages"), "gallery": await col("gallery")}


@api.post("/inquiries", status_code=201)
async def create_inquiry(body: InquiryIn, request: Request, background: BackgroundTasks):
    if body.website:
        raise HTTPException(400, "Submission rejected")
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown").split(",")[0].strip()
    since = (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat()
    if await db.inquiries.count_documents({"ip": ip, "created_at": {"$gte": since}}) >= 5:
        raise HTTPException(429, "Too many inquiries from your network. Please try again in a few minutes.")
    if body.package_id and not await db.packages.find_one({"id": body.package_id, "retired": {"$ne": True}}):
        raise HTTPException(400, "Unknown package")
    inquiry = Inquiry(**body.model_dump(exclude={"website"}), created_at=datetime.now(timezone.utc).isoformat())
    doc = inquiry.to_mongo() | {"ip": ip}
    result = await db.inquiries.insert_one(doc)
    seg = next((s["label"] for s in SEGMENTS if s["id"] == inquiry.segment), "Not specified")
    dest = await db.destinations.find_one({"id": inquiry.destination_id}, {"_id": 0, "name": 1}) if inquiry.destination_id else None
    context = inquiry.package_name or (dest or {}).get("name") or "General inquiry"
    background.add_task(notify_new_inquiry, inquiry.model_dump(), seg, context)
    return {"id": str(result.inserted_id), "status": "received"}


@api.post("/auth/login")
async def login(body: LoginIn, request: Request):
    email = body.email.lower()
    ip = request.client.host if request.client else "unknown"
    ident = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": ident})
    now = datetime.now(timezone.utc)
    if attempt and attempt.get("count", 0) >= 5 and attempt["last"] > (now - timedelta(minutes=15)).isoformat():
        raise HTTPException(429, "Too many attempts. Try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one({"identifier": ident}, {"$inc": {"count": 1}, "$set": {"last": now.isoformat()}}, upsert=True)
        raise HTTPException(401, "Invalid email or password")
    await db.login_attempts.delete_many({"identifier": ident})
    uid = str(user["_id"])
    return {"token": create_token(uid, email), "user": {"id": uid, "email": email, "name": user.get("name", "Admin"), "role": user.get("role")}}


@api.get("/auth/me")
async def me(admin: dict = Depends(current_admin)):
    return admin


@api.get("/admin/inquiries")
async def list_inquiries(status: Optional[str] = None, admin: dict = Depends(current_admin)):
    query = {"status": status} if status in STATUSES else {}
    docs = await db.inquiries.find(query).sort("created_at", -1).to_list(1000)
    return [Inquiry.from_mongo(doc).model_dump() for doc in docs]


@api.patch("/admin/inquiries/{inquiry_id}")
async def update_inquiry(inquiry_id: str, body: StatusUpdate, admin: dict = Depends(current_admin)):
    if not ObjectId.is_valid(inquiry_id):
        raise HTTPException(404, "Inquiry not found")
    res = await db.inquiries.update_one({"_id": ObjectId(inquiry_id)}, {"$set": {"status": body.status}})
    if res.matched_count == 0:
        raise HTTPException(404, "Inquiry not found")
    return {"id": inquiry_id, "status": body.status}


@api.delete("/admin/inquiries/{inquiry_id}")
async def delete_inquiry(inquiry_id: str, admin: dict = Depends(current_admin)):
    if not ObjectId.is_valid(inquiry_id):
        raise HTTPException(404, "Inquiry not found")
    res = await db.inquiries.delete_one({"_id": ObjectId(inquiry_id)})
    if res.deleted_count == 0:
        raise HTTPException(404, "Inquiry not found")
    return {"deleted": True, "id": inquiry_id}


@api.put("/admin/packages/{package_id}")
async def update_package(package_id: str, body: PackageUpdate, admin: dict = Depends(current_admin)):
    data = body.model_dump(exclude_none=True)
    if "itinerary" in data:
        data["itinerary"] = sorted(data["itinerary"], key=lambda d: d["day"])
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.packages.update_one({"id": package_id}, {"$set": data})
    if res.matched_count == 0:
        raise HTTPException(404, "Package not found")
    return await db.packages.find_one({"id": package_id}, {"_id": 0})


@api.delete("/admin/packages/{package_id}")
async def delete_package(package_id: str, admin: dict = Depends(current_admin)):
    res = await db.packages.delete_one({"id": package_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Package not found")
    return {"deleted": True, "id": package_id}


@api.get("/admin/destinations")
async def list_destinations(admin: dict = Depends(current_admin)):
    docs = await db.destinations.find({}, {"_id": 0}).sort("name", 1).to_list(500)
    return docs


@api.post("/admin/destinations", status_code=201)
async def create_destination(body: DestinationCreate, admin: dict = Depends(current_admin)):
    data = body.model_dump()
    # Auto-generate id from name if blank
    if not data["id"]:
        base = re.sub(r"[^a-z0-9]+", "-", data["name"].lower()).strip("-")
        data["id"] = base or f"dest-{uuid.uuid4().hex[:8]}"
    # Ensure unique id
    if await db.destinations.find_one({"id": data["id"]}):
        data["id"] = f"{data['id']}-{uuid.uuid4().hex[:6]}"
    # Ensure sensible lat/lng for map display if missing or 0
    if not data.get("lat") or data.get("lat") == 0:
        data["lat"] = 20.0 if data.get("continent") == "asia" or data.get("country", "").lower() == "india" else 0.0
    if not data.get("lng") or data.get("lng") == 0:
        data["lng"] = 77.0 if data.get("continent") == "asia" or data.get("country", "").lower() == "india" else 37.0
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.destinations.insert_one(data)
    return {k: v for k, v in data.items() if k != "_id"}


@api.put("/admin/destinations/{dest_id}")
async def update_destination(dest_id: str, body: DestinationCreate, admin: dict = Depends(current_admin)):
    data = body.model_dump()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.destinations.update_one({"id": dest_id}, {"$set": data})
    if res.matched_count == 0:
        raise HTTPException(404, "Destination not found")
    return await db.destinations.find_one({"id": dest_id}, {"_id": 0})


@api.delete("/admin/destinations/{dest_id}", status_code=204)
async def delete_destination(dest_id: str, admin: dict = Depends(current_admin)):
    await db.destinations.delete_one({"id": dest_id})
    return None


@api.post("/admin/uploads", status_code=201)
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(current_admin)):
    ext = IMAGE_TYPES.get(file.content_type or "")
    if not ext:
        raise HTTPException(400, "Please upload a JPG, PNG or WebP image")
    data = await file.read(MAX_UPLOAD + 1)
    if len(data) > MAX_UPLOAD:
        raise HTTPException(413, "Image is larger than 10 MB")
    path = f"{storage.APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    try:
        result = await run_in_threadpool(storage.put_object, path, data, file.content_type)
    except Exception as e:
        logger.error("Upload failed: %s", e)
        raise HTTPException(502, "Image storage is unavailable right now. Please try again.")
    await db.files.insert_one({"storage_path": result["path"], "original_filename": file.filename, "content_type": file.content_type,
                               "size": result.get("size", len(data)), "is_deleted": False, "uploaded_by": admin["email"],
                               "created_at": datetime.now(timezone.utc).isoformat()})
    return {"url": f"/api/files/{result['path']}"}


@api.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(404, "File not found")
    try:
        data, ctype = await run_in_threadpool(storage.get_object, path)
    except Exception as e:
        logger.error("File fetch failed: %s", e)
        raise HTTPException(502, "Image temporarily unavailable")
    return Response(content=data, media_type=record.get("content_type") or ctype, headers={"Cache-Control": "public, max-age=31536000, immutable"})


@api.get("/admin/packages")
async def admin_packages(admin: dict = Depends(current_admin)):
    return await db.packages.find({}, {"_id": 0}).sort("order", 1).to_list(500)


@api.post("/admin/packages", status_code=201)
async def create_package(body: PackageCreate, admin: dict = Depends(current_admin)):
    # Auto-generate ID if empty or invalid
    pkg_id = body.id.strip() if body.id else ""
    import re
    if not pkg_id or not re.match(r'^[a-z0-9]+(-[a-z0-9]+)*$', pkg_id):
        base = re.sub(r'[^a-z0-9]+', '-', (body.title or "package").lower()).strip('-')[:30]
        pkg_id = f"{base}-{uuid.uuid4().hex[:6]}" if base else f"pkg-{uuid.uuid4().hex[:8]}"
    if await db.packages.find_one({"id": pkg_id}):
        pkg_id = f"{pkg_id}-{uuid.uuid4().hex[:6]}"
    last = await db.packages.find({}, {"order": 1}).sort("order", -1).to_list(1)
    now = datetime.now(timezone.utc).isoformat()
    data = body.model_dump()
    data["id"] = pkg_id
    data["itinerary"] = sorted(data["itinerary"], key=lambda d: d["day"]) if data.get("itinerary") else []
    data.update({"gallery": data["gallery"] or ([body.image] if body.image else []), "route": [], "retired": False,
                 "order": (last[0].get("order", 0) + 1) if last else 0,
                 "created_at": now, "updated_at": now})
    await db.packages.insert_one(data)
    return await db.packages.find_one({"id": pkg_id}, {"_id": 0})


@api.patch("/admin/packages/{package_id}/retire")
async def retire_package(package_id: str, body: RetireIn, admin: dict = Depends(current_admin)):
    res = await db.packages.update_one({"id": package_id}, {"$set": {"retired": body.retired, "updated_at": datetime.now(timezone.utc).isoformat()}})
    if res.matched_count == 0:
        raise HTTPException(404, "Package not found")
    return {"id": package_id, "retired": body.retired}


@api.post("/blogs/upload", status_code=201)
async def upload_blog_image(file: UploadFile = File(...)):
    ext = IMAGE_TYPES.get(file.content_type or "")
    if not ext:
        raise HTTPException(400, "Please upload a JPG, PNG or WebP image")
    data = await file.read(MAX_UPLOAD + 1)
    if len(data) > MAX_UPLOAD:
        raise HTTPException(413, "Image is larger than 10 MB")
    path = f"{storage.APP_NAME}/uploads/blog-{uuid.uuid4()}.{ext}"
    try:
        result = await run_in_threadpool(storage.put_object, path, data, file.content_type)
    except Exception as e:
        logger.error("Blog image upload failed: %s", e)
        raise HTTPException(502, "Image storage is unavailable right now. Please try again.")
    await db.files.insert_one({
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "uploaded_by": "public-blog-submission",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": f"/api/files/{result['path']}"}


@api.get("/blogs")
async def list_approved_blogs():
    docs = await db.blogs.find({"status": "approved"}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api.post("/blogs", status_code=201)
async def submit_blog(body: BlogSubmissionIn):
    now = datetime.now(timezone.utc)
    base_slug = re.sub(r"[^a-z0-9]+", "-", body.title.lower()).strip("-")[:50]
    slug = f"{base_slug}-{uuid.uuid4().hex[:6]}" if base_slug else f"story-{uuid.uuid4().hex[:8]}"
    paragraphs = [p.strip() for p in body.content.split("\n\n") if p.strip()]
    if not paragraphs:
        paragraphs = [body.content.strip()]
    words = len(body.content.split())
    read_mins = max(2, round(words / 180))
    excerpt = body.excerpt.strip() or (paragraphs[0][:220] + ("…" if len(paragraphs[0]) > 220 else ""))
    default_img = "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80"
    doc = {
        "id": uuid.uuid4().hex,
        "slug": slug,
        "title": body.title.strip(),
        "subtitle": body.subtitle.strip() or excerpt,
        "category": body.category.strip() or "Wildlife",
        "location": body.location.strip() or "India",
        "date": now.strftime("%d %B %Y"),
        "readTime": f"{read_mins} min read",
        "author": body.author.strip(),
        "authorRole": body.authorRole.strip() or "Traveller & Contributor",
        "email": body.email.strip(),
        "featured": False,
        "image": body.image.strip() or default_img,
        "excerpt": excerpt,
        "quote": body.quote.strip(),
        "content": body.content.strip(),
        "fieldNotes": [n.strip() for n in body.fieldNotes if n.strip()],
        "sections": [{"heading": "Field Dispatch", "body": paragraphs}],
        "status": "pending",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    await db.blogs.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api.get("/admin/blogs")
async def admin_list_blogs(status: Optional[str] = None, admin: dict = Depends(current_admin)):
    query = {"status": status} if status in BLOG_STATUSES else {}
    docs = await db.blogs.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api.patch("/admin/blogs/{blog_id}")
async def admin_update_blog_status(blog_id: str, body: BlogStatusUpdate, admin: dict = Depends(current_admin)):
    now = datetime.now(timezone.utc).isoformat()
    res = await db.blogs.update_one(
        {"$or": [{"id": blog_id}, {"slug": blog_id}]},
        {"$set": {"status": body.status, "updated_at": now}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Blog not found")
    return await db.blogs.find_one({"$or": [{"id": blog_id}, {"slug": blog_id}]}, {"_id": 0})


@api.delete("/admin/blogs/{blog_id}", status_code=204)
async def admin_delete_blog(blog_id: str, admin: dict = Depends(current_admin)):
    await db.blogs.delete_one({"$or": [{"id": blog_id}, {"slug": blog_id}]})
    return None


@api.get("/reviews")
async def list_approved_reviews():
    """Public endpoint: returns only admin-approved reviews, newest first."""
    docs = await db.reviews.find({"status": "approved"}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api.post("/reviews", status_code=201)
async def submit_review(body: ReviewSubmissionIn):
    """Public endpoint: submit a guest review for admin approval (status='pending')."""
    now = datetime.now(timezone.utc)
    doc = {
        "id": f"rev-{uuid.uuid4().hex[:10]}",
        "name": body.name.strip(),
        "role": body.role.strip() or "Verified Guest",
        "email": body.email.strip(),
        "rating": body.rating,
        "segment": body.segment.strip() or "Wildlife",
        "location": body.location.strip() or "India",
        "title": body.title.strip(),
        "review": body.review.strip(),
        "travelDate": body.travelDate.strip() or now.strftime("%B %Y"),
        "image": body.image.strip(),
        "date": now.strftime("%d %B %Y"),
        "status": "pending",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    await db.reviews.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api.get("/admin/reviews")
async def admin_list_reviews(status: Optional[str] = None, admin: dict = Depends(current_admin)):
    query = {"status": status} if status in REVIEW_STATUSES else {}
    docs = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api.patch("/admin/reviews/{review_id}")
async def admin_update_review_status(review_id: str, body: ReviewStatusUpdate, admin: dict = Depends(current_admin)):
    now = datetime.now(timezone.utc).isoformat()
    res = await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"status": body.status, "updated_at": now}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Review not found")
    return await db.reviews.find_one({"id": review_id}, {"_id": 0})


@api.delete("/admin/reviews/{review_id}", status_code=204)
async def admin_delete_review(review_id: str, admin: dict = Depends(current_admin)):
    await db.reviews.delete_one({"id": review_id})
    return None


app.include_router(api)
cors_env = os.environ.get("CORS_ORIGINS", "*")
cors_origins = [o.strip() for o in cors_env.split(",") if o.strip()] or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def sync_catalog():
    """Insert seed items that don't exist yet and add any new fields; always keep segments synced."""
    for name, items in (("segments", SEGMENTS), ("destinations", DESTINATIONS), ("packages", PACKAGES), ("gallery", GALLERY)):
        for order, item in enumerate(items):
            seed = {**item, "order": order}
            existing = await db[name].find_one({"id": item["id"]})
            if existing is None:
                await db[name].insert_one(seed)
                continue
            if name == "segments":
                await db[name].update_one({"id": item["id"]}, {"$set": seed})
                continue
            missing = {k: v for k, v in seed.items() if k not in existing}
            if missing:
                await db[name].update_one({"id": item["id"]}, {"$set": missing})


@app.on_event("startup")
async def startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.login_attempts.create_index("identifier")
        await db.inquiries.create_index("created_at")
        await sync_catalog()
    except Exception as e:
        logger.error("DB startup index/sync error: %s", e)

    try:
        await run_in_threadpool(storage.init_storage)
        logger.info("Storage initialized")
    except Exception as e:
        logger.error("Storage init failed: %s", e)

    try:
        admin_email = os.environ.get("ADMIN_EMAIL", "obhalane@gmail.com").lower()
        admin_password = os.environ.get("ADMIN_PASSWORD", "123456")
        existing_admin = await db.users.find_one({"email": admin_email})
        if not existing_admin:
            await db.users.insert_one({"email": admin_email, "password_hash": hash_password(admin_password),
                                       "name": "Sacred Vista Admin", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()})
            logger.info("Seeded admin user")
        elif os.environ.get("ADMIN_PASSWORD"):
            await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
            logger.info("Updated admin user password from environment")
    except Exception as e:
        logger.error("Admin user initialization error: %s", e)


@app.on_event("shutdown")
async def shutdown():
    client.close()
