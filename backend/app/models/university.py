"""
models/university.py — University & expertise models for Jharkhand institutions.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class University(Base):
    __tablename__ = "universities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    name = Column(String(255), nullable=False, unique=True)
    short_name = Column(String(100), nullable=False)
    type = Column(String(100), nullable=False) # e.g. Institute of National Importance, State University, Central University
    city = Column(String(100), nullable=False)
    district_id = Column(String(50), ForeignKey("districts.id"), nullable=False)
    state = Column(String(50), default="Jharkhand", nullable=False)
    
    # Simulation metadata (clearly tagged PROTOTYPE_METADATA)
    active_capacity = Column(Integer, default=10, nullable=False)
    current_load = Column(Integer, default=3, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    expertise_list = relationship("UniversityExpertise", back_populates="university", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<University id={self.id} name={self.short_name}>"


class UniversityExpertise(Base):
    __tablename__ = "university_expertise"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=False)
    domain = Column(String(100), nullable=False) # Water, Agriculture, Environment, etc.
    subdomain = Column(String(150), nullable=True) # Fluoride Remediation, Mining Reclamation, etc.
    score = Column(Float, default=8.0, nullable=False) # Domain score 1-10
    source_type = Column(String(50), default="OFFICIAL_DEPARTMENT", nullable=False) # OFFICIAL_DEPARTMENT vs PROTOTYPE_METADATA
    derivation_notes = Column(String(255), nullable=True)

    university = relationship("University", back_populates="expertise_list")

    def __repr__(self) -> str:
        return f"<UniversityExpertise domain={self.domain} score={self.score}>"
