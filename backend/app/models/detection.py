import json
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class FireDetection(Base):
    __tablename__ = 'fire_detections'

    id = Column(String(64), primary_key=True, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    location = Column(String(255), nullable=True)

    acquisition_date = Column(String(16), nullable=False, index=True)
    acquisition_time = Column(String(8), nullable=False)
    detected_at = Column(DateTime, nullable=False, index=True)

    satellite = Column(String(32), nullable=False, index=True)
    instrument = Column(String(32), nullable=False, index=True)
    confidence = Column(Float, nullable=False, index=True)
    frp = Column(Float, nullable=False, index=True)
    brightness = Column(Float, nullable=True)
    bright_t31 = Column(Float, nullable=True)
    scan = Column(Float, nullable=True)
    track = Column(Float, nullable=True)
    daynight = Column(String(4), nullable=True)
    source = Column(String(64), nullable=False, index=True)

    # Context & Geospatial Intelligence
    nearest_facility_id = Column(String(64), ForeignKey('industrial_facilities.id'), nullable=True, index=True)
    distance_to_facility_m = Column(Float, nullable=True)
    is_persistent = Column(Boolean, default=False, index=True)
    persistence_days = Column(Integer, default=0)

    facility = relationship('IndustrialFacility', foreign_keys=[nearest_facility_id], lazy='joined')

    # Classification & AI assessment
    classification = Column(String(64), default='UNCLASSIFIED', index=True)
    classification_confidence = Column(Float, default=0.0)
    classification_reasons_json = Column(Text, nullable=True)
    risk_level = Column(String(16), default='LOW', index=True)
    risk_score = Column(Float, default=0.0)

    # Land cover & Satellite evidence
    land_cover_class = Column(String(64), default='unknown')
    satellite_evidence_available = Column(Boolean, default=False)
    satellite_scene_id = Column(String(128), nullable=True)

    raw_data_json = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self, facility_obj=None):
        reasons = []
        if self.classification_reasons_json:
            try:
                reasons = json.loads(self.classification_reasons_json)
            except Exception:
                reasons = [self.classification_reasons_json]

        fac = facility_obj or getattr(self, 'facility', None)
        nearby_fac = None
        if fac:
            nearby_fac = {
                'id': fac.id,
                'name': fac.name,
                'type': fac.facility_type,
                'distanceMeters': round(self.distance_to_facility_m or 0),
                'location': fac.location
            }

        return {
            'id': self.id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'location': self.location or f'{self.latitude:.4f}N, {self.longitude:.4f}E',
            'detectedAt': self.detected_at.isoformat() if self.detected_at else self.acquisition_date,
            'satellite': self.satellite,
            'instrument': self.instrument,
            'confidence': round(self.confidence),
            'frp': round(self.frp, 1),
            'brightness': self.brightness,
            'brightT31': self.bright_t31,
            'daynight': self.daynight,
            'source': self.source,
            'classification': self.classification,
            'classificationConfidence': round(self.classification_confidence, 1),
            'classificationReasons': reasons,
            'riskLevel': self.risk_level,
            'riskScore': round(self.risk_score, 1),
            'isPersistent': bool(self.is_persistent),
            'persistenceDays': self.persistence_days,
            'nearbyFacility': nearby_fac,
            'distanceToFacilityM': round(self.distance_to_facility_m, 1) if self.distance_to_facility_m is not None else None,
            'landCoverClass': self.land_cover_class,
            'satelliteEvidenceAvailable': self.satellite_evidence_available,
            'satelliteSceneId': self.satellite_scene_id,
            'isDemo': bool(self.is_demo),
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
