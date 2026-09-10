"""
routers/auth.py — Authentication endpoints.

Public endpoints:
    POST /api/auth/register  — citizen / university / industry only
    POST /api/auth/login     — all roles including admin
    GET  /api/auth/me        — any authenticated user

Admin registration is BLOCKED at the schema validation layer.
The admin account is created only via seed/create_admin.py.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserOut
from app.auth.password import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new citizen / university / industry account",
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # schema validator already rejects role == admin
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        phone=payload.phone,
        organization=payload.organization,
        district_id=payload.district_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive a JWT access token",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Use constant-time comparison to avoid timing attacks
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact the administrator.",
        )

    token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role.value,
            "email": user.email,
        }
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        full_name=user.full_name,
        email=user.email,
        user_id=str(user.id),
    )


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get the currently authenticated user's profile",
)
def me(current_user: User = Depends(get_current_user)):
    return current_user
