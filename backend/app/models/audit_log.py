from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from ..database import Base

class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String(64), nullable=False, index=True)
    action = Column(String(128), nullable=False)
    details_json = Column(Text, nullable=True)
    status = Column(String(32), default='SUCCESS')
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'eventType': self.event_type,
            'action': self.action,
            'details': self.details_json,
            'status': self.status,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
