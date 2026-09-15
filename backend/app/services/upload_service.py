"""
services/upload_service.py — File upload service with security validation.

Validates image MIME types, extensions, size limits, and generates UUID-based
filenames stored in backend/uploads/. Original filenames are NEVER used on disk.
"""
import os
import uuid
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from app.config import get_settings

settings = get_settings()

ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
BLOCKED_EXTENSIONS = {".exe", ".bat", ".cmd", ".sh", ".py", ".js", ".html", ".php", ".dll", ".so"}


def ensure_upload_dir_exists() -> str:
    """Ensure the uploads directory exists relative to current backend folder."""
    upload_path = os.path.abspath(settings.UPLOAD_DIR)
    os.makedirs(upload_path, exist_ok=True)
    return upload_path


async def save_evidence_file(file: UploadFile, uploaded_by_user_id: str) -> Tuple[str, str, str, int, str]:
    """
    Validates and saves an uploaded image file safely.

    Returns:
        (original_name, stored_filename, mime_type, size_bytes, storage_path)
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload request.",
        )

    filename_lower = file.filename.lower()
    ext = os.path.splitext(filename_lower)[1]

    # 1. Extension Security Check
    if ext in BLOCKED_EXTENSIONS or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Security Violation: File extension '{ext}' is not permitted. Only images (JPG, PNG, WEBP) are allowed.",
        )

    # 2. Content-Type / MIME Type Check
    content_type = file.content_type.lower() if file.content_type else ""
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME type '{content_type}'. Only JPEG, PNG, and WEBP images are supported.",
        )

    # 3. Read content & check file size limit
    content = await file.read()
    size_bytes = len(content)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size ({size_bytes / (1024*1024):.2f} MB) exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )

    if size_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )

    # 4. Generate UUID-based filename
    target_ext = ALLOWED_MIME_TYPES[content_type]
    stored_filename = f"{uuid.uuid4().hex}{target_ext}"

    # 5. Persistent Supabase Storage vs Local Storage
    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        try:
            from supabase import create_client
            supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            bucket = settings.SUPABASE_BUCKET
            supabase_client.storage.from_(bucket).upload(
                path=stored_filename,
                file=content,
                file_options={"content-type": content_type}
            )
            storage_path = f"supabase://{bucket}/{stored_filename}"
            return (file.filename, stored_filename, content_type, size_bytes, storage_path)
        except Exception:
            # Fallback to local storage if bucket upload is unavailable
            pass

    upload_dir = ensure_upload_dir_exists()
    file_path = os.path.join(upload_dir, stored_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    return (file.filename, stored_filename, content_type, size_bytes, file_path)
