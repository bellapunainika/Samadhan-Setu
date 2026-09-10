"""
models/assignment.py — Persistence model for challenge university assignments.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class ChallengeAssignment(Base):
    __tablename__ = "challenge_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), unique=True, nullable=False)
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=False)
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    assigned_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    started_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False) # ACTIVE, RESCINDED
    notes = Column(Text, nullable=True)

    challenge = relationship("Challenge", back_populates="assignment")
    university = relationship("University", foreign_keys=[university_id])
    assigner = relationship("User", foreign_keys=[assigned_by])

    @property
    def university_name(self) -> str:
        return self.university.name if self.university else None

    def __repr__(self) -> str:
        return f"<ChallengeAssignment challenge_id={self.challenge_id} university_id={self.university_id}>"

