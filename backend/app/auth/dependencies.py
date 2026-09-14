"""
auth/dependencies.py — Reusable FastAPI dependencies for authentication
and role-based authorization.

Usage in routers:
    current_user: User = Depends(get_current_user)
    admin_user:   User = Depends(require_role("admin"))
"""
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.jwt_handler import decode_access_token
from app.models.user import User, UserRole

bearer_scheme = HTTPBearer(auto_error=False)

CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials.",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extract and verify the Bearer JWT from the Authorization header.
    Returns the User ORM object or raises 401.
    """
    if credentials is None:
        raise CREDENTIALS_EXCEPTION

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise CREDENTIALS_EXCEPTION

    sub: str = payload.get("sub")
    user_id_claim: str = payload.get("user_id")
    if not sub and not user_id_claim:
        raise CREDENTIALS_EXCEPTION

    user = None
    # Try querying by user_id or sub if it is a valid UUID
    for candidate in [user_id_claim, sub]:
        if candidate:
            try:
                val = uuid.UUID(candidate)
                user = db.query(User).filter(User.id == str(val), User.is_active == True).first()
                if user:
                    break
            except (ValueError, AttributeError):
                pass

    # If not found by UUID, fallback to email query (since sub may be email)
    if user is None and sub:
        user = db.query(User).filter(User.email == sub, User.is_active == True).first()

    if user is None:
        raise CREDENTIALS_EXCEPTION

    return user


def require_role(*roles: UserRole):
    """
    Factory that returns a FastAPI dependency which enforces that the
    authenticated user has one of the specified roles.

    Example:
        @router.get("/admin/pending", dependencies=[Depends(require_role("admin"))])
    """
    def _checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {[r for r in roles]}.",
            )
        return current_user
    return _checker
