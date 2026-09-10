"""
models/district.py — District model for Jharkhand's 24 official districts.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime
from app.database import Base

class District(Base):
    __tablename__ = "districts"

    id = Column(String(50), primary_key=True, index=True) # e.g. 'gumla', 'ranchi'
    name = Column(String(100), nullable=False)
    hindi_name = Column(String(100), nullable=False)
    division = Column(String(100), nullable=False) # South Chota Nagpur, etc.
    hq = Column(String(100), nullable=False)
    base_urgency = Column(Float, default=1.0, nullable=False) # Neutral baseline 1.0 (PROTOTYPE METADATA)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<District id={self.id} name={self.name} division={self.division}>"
