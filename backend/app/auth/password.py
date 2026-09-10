"""
auth/password.py — bcrypt password hashing using the bcrypt library directly.

passlib 1.7.4 is incompatible with bcrypt >= 4.x (the __about__ attribute was
removed). We bypass passlib and call bcrypt directly to avoid the issue.
"""
import bcrypt


def hash_password(plain: str) -> str:
    """Return a bcrypt hash of the given plaintext password."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(plain.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if plain matches the stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False
