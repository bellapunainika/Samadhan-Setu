"""
seed/create_admin.py — Bootstrap admin account.

This script creates the admin user ONLY if no admin exists yet.
Run from the backend/ directory after migrations:

    python seed/create_admin.py

Credentials are read from the .env file (ADMIN_EMAIL, ADMIN_PASSWORD).
This script must NEVER be called from any HTTP endpoint.
"""
import os
import sys

# Allow imports from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.auth.password import hash_password
from app.config import get_settings


def create_admin() -> None:
    settings = get_settings()
    db = SessionLocal()

    try:
        existing = db.query(User).filter(User.role == UserRole.admin).first()
        if existing:
            print(f"[INFO] Admin already exists: {existing.email} — skipping creation.")
            return

        admin = User(
            email=settings.ADMIN_EMAIL,
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
            full_name=settings.ADMIN_FULL_NAME,
            role=UserRole.admin,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"[OK]   Admin created successfully.")
        print(f"       Email : {admin.email}")
        print(f"       ID    : {admin.id}")
        print(f"       Role  : {admin.role.value}")
        print()
        print("[SECURITY] The admin password is in your .env file (ADMIN_PASSWORD).")
        print("           Do not share or commit the .env file.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to create admin: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
