from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from ..database import Base

class Alert(Base):
    __tablename__ = 'alerts'

    id = Column(String(64), primary_key=True, index=True)
    detection_id = Column(String(64), ForeignKey('fire_detections.id'), nullable=False, index=True)
    alert_type = Column(String(64), default='INDUSTRIAL_THERMAL_ANOMALY')
    severity = Column(String(16), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)
    location = Column(String(255), nullable=True)
    status = Column(String(32), default='ACTIVE', index=True)  # ACTIVE, ACKNOWLEDGED, RESOLVED
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    acknowledged_at = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'detectionId': self.detection_id,
            'alertType': self.alert_type,
            'severity': self.severity,
            'title': self.title,
            'message': self.message,
            'location': self.location or 'Industrial Sector',
            'status': self.status,
            'isRead': bool(self.is_read),
            'timestamp': self.created_at.isoformat() if self.created_at else None,
            'acknowledgedAt': self.acknowledged_at.isoformat() if self.acknowledged_at else None
        }
