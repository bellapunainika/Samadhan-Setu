"""
models/audit.py — Audit log model for tracking administrative governance actions.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class AdminAction(Base):
    __tablename__ = "admin_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action_type = Column(String(100), nullable=False) # APPROVE_CHALLENGE, REJECT_CHALLENGE, OVERRIDE_AI, ASSIGN_UNIVERSITY
    entity_type = Column(String(100), nullable=False) # CHALLENGE, UNIVERSITY, AI_PREDICTION
    entity_id = Column(String(255), nullable=False)
    
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    reason = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    actor = relationship("User", foreign_keys=[actor_id])

    def __repr__(self) -> str:
        return f"<AdminAction action={self.action_type} entity_id={self.entity_id} actor={self.actor_id}>"
