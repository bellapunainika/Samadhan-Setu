"""
models/user.py — User table definition.

Roles:
    citizen    — public registration allowed
    university — public registration allowed
    industry   — public registration allowed
    admin      — NOT publicly registerable; created via seed/create_admin.py only

district_id is nullable (FK to districts table added in Stage 2 migration).
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    citizen    = "citizen"
    university = "university"
    industry   = "industry"
    admin      = "admin"


# Roles that can self-register via the public API
PUBLIC_REGISTERABLE_ROLES = {UserRole.citizen, UserRole.university, UserRole.industry}


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole, name="userrole"), nullable=False)

    # Optional fields — expanded in later stages
    phone = Column(String(20), nullable=True)
    district_id = Column(String(50), nullable=True)   # FK added in Stage 2
    organization = Column(String(255), nullable=True)
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
