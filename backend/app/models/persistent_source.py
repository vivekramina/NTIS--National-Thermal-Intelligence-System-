import json
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey
from ..database import Base

class PersistentSource(Base):
    __tablename__ = 'persistent_sources'

    id = Column(String(64), primary_key=True, index=True)
    cluster_latitude = Column(Float, nullable=False, index=True)
    cluster_longitude = Column(Float, nullable=False, index=True)
    location = Column(String(255), nullable=True)

    first_detected = Column(DateTime, nullable=False, index=True)
    last_detected = Column(DateTime, nullable=False, index=True)
    active_days = Column(Integer, default=1)
    detection_count = Column(Integer, default=1)

    average_frp = Column(Float, default=0.0)
    max_frp = Column(Float, default=0.0)
    average_confidence = Column(Float, default=0.0)

    nearest_facility_id = Column(String(64), ForeignKey('industrial_facilities.id'), nullable=True, index=True)
    distance_to_facility_m = Column(Float, nullable=True)

    classification = Column(String(64), default='PERSISTENT_INDUSTRIAL_THERMAL_SOURCE')
    risk_level = Column(String(16), default='HIGH', index=True)
    risk_score = Column(Float, default=70.0)

    member_detection_ids_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self, facility_obj=None):
        member_ids = []
        if self.member_detection_ids_json:
            try:
                member_ids = json.loads(self.member_detection_ids_json)
            except Exception:
                pass

        nearby_fac = None
        if facility_obj:
            nearby_fac = {
                'id': facility_obj.id,
                'name': facility_obj.name,
                'type': facility_obj.facility_type,
                'distanceMeters': round(self.distance_to_facility_m or 0),
                'location': facility_obj.location
            }

        return {
            'id': self.id,
            'detectionId': member_ids[0] if member_ids else self.id,
            'latitude': self.cluster_latitude,
            'longitude': self.cluster_longitude,
            'location': self.location or f'{self.cluster_latitude:.4f}N, {self.cluster_longitude:.4f}E',
            'firstDetected': self.first_detected.isoformat() if self.first_detected else None,
            'lastDetected': self.last_detected.isoformat() if self.last_detected else None,
            'activeDays': self.active_days,
            'occurrences': self.detection_count,
            'averageFrp': round(self.average_frp, 1),
            'maxFrp': round(self.max_frp, 1),
            'averageConfidence': round(self.average_confidence, 1),
            'facility': nearby_fac,
            'distanceToFacilityM': round(self.distance_to_facility_m, 1) if self.distance_to_facility_m is not None else None,
            'classification': self.classification,
            'riskLevel': self.risk_level,
            'riskScore': round(self.risk_score, 1),
            'memberDetectionIds': member_ids,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
