"""
models/progress.py — University progress update model.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class ProgressUpdate(Base):
    __tablename__ = "progress_updates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=False)
    posted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    progress_percent = Column(Integer, default=0, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    challenge = relationship("Challenge")
    university = relationship("University")

    def __repr__(self) -> str:
        return f"<ProgressUpdate challenge_id={self.challenge_id} percent={self.progress_percent}>"
