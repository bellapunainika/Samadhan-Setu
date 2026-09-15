"""
routers/uploads.py — Secure file evidence upload and retrieval endpoints.
"""
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.challenge import Challenge, ChallengeEvidence
from app.schemas.challenge import EvidenceOut
from app.auth.dependencies import get_current_user, bearer_scheme
from app.auth.jwt_handler import decode_access_token
from app.services.upload_service import save_evidence_file, ensure_upload_dir_exists

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])


@router.post(
    "/evidence/{challenge_id}",
    response_model=EvidenceOut,
    status_code=status.HTTP_201_CREATED,
    summary="Upload image evidence for a submitted challenge",
)
async def upload_evidence(
    challenge_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify challenge existence
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        challenge = db.query(Challenge).filter(Challenge.short_id == challenge_id).first()

    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target challenge not found.",
        )

    # Save file using secure upload service
    original_name, stored_filename, mime_type, size_bytes, storage_path = await save_evidence_file(
        file=file,
        uploaded_by_user_id=str(current_user.id)
    )

    evidence = ChallengeEvidence(
        challenge_id=challenge.id,
        original_name=original_name,
        stored_filename=stored_filename,
        mime_type=mime_type,
        size_bytes=size_bytes,
        storage_path=storage_path,
        uploaded_by=current_user.id
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    return evidence


@router.get(
    "/{filename}",
    summary="Retrieve an uploaded evidence image",
)
def get_uploaded_file(
    filename: str,
    token: Optional[str] = Query(None),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    # Validate filename to prevent path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename parameter.")

    raw_token = None
    if credentials and credentials.credentials:
        raw_token = credentials.credentials
    elif token:
        raw_token = token

    if not raw_token:
        raise HTTPException(status_code=401, detail="Could not validate credentials.")

    payload = decode_access_token(raw_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Could not validate credentials.")

    upload_dir = ensure_upload_dir_exists()
    file_path = os.path.join(upload_dir, filename)

    if not os.path.exists(file_path):
        from app.config import get_settings
        app_settings = get_settings()
        if app_settings.SUPABASE_URL and app_settings.SUPABASE_KEY:
            try:
                from supabase import create_client
                supabase_client = create_client(app_settings.SUPABASE_URL, app_settings.SUPABASE_KEY)
                res = supabase_client.storage.from_(app_settings.SUPABASE_BUCKET).download(filename)
                from fastapi.responses import Response
                ext = os.path.splitext(filename)[1].lower()
                media_type = "image/png" if ext == ".png" else ("image/webp" if ext == ".webp" else "image/jpeg")
                return Response(content=res, media_type=media_type)
            except Exception:
                pass
        raise HTTPException(status_code=404, detail="File not found.")

    return FileResponse(file_path)

