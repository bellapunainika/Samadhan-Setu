"""
schemas/auth.py — Pydantic request/response models for authentication.

All passwords are write-only (excluded from responses via response_model).
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from app.models.user import UserRole


# ─── Registration ─────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    organization: Optional[str] = None
    district_id: Optional[str] = None

    @field_validator("role")
    @classmethod
    def role_must_be_public(cls, v: UserRole) -> UserRole:
        from app.models.user import PUBLIC_REGISTERABLE_ROLES
        if v not in PUBLIC_REGISTERABLE_ROLES:
            raise ValueError(
                "Role 'admin' cannot be registered through the public API. "
                "Contact the system administrator."
            )
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters.")
        return v

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name must not be empty.")
        return v.strip()


# ─── Login ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    full_name: str
    email: EmailStr
    user_id: str


# ─── Current User ─────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    organization: Optional[str] = None
    district_id: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
