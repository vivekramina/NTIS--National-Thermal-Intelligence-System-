from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime
from ..database import Base

class IndustrialFacility(Base):
    __tablename__ = 'industrial_facilities'

    id = Column(String(64), primary_key=True, index=True)
    osm_id = Column(String(64), nullable=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    facility_type = Column(String(64), nullable=False, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    location = Column(String(255), nullable=True)
    geometry_wkt = Column(Text, nullable=True)
    tags_json = Column(Text, nullable=True)
    source = Column(String(64), default='OpenStreetMap')
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'osmId': self.osm_id,
            'name': self.name,
            'type': self.facility_type,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'location': self.location or f'{self.latitude:.4f}N, {self.longitude:.4f}E',
            'source': self.source,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
