import logging
from datetime import datetime, timezone
from typing import List, Optional
from ..database import get_db_session
from ..models import Alert, FireDetection

logger = logging.getLogger('thermal_watch.alerts')

class AlertEngine:
    """
    Evaluates detections against automated incident alert rules and dispatches alerts.
    """
    @classmethod
    def evaluate_detection_for_alerts(cls, detection: FireDetection, facility_name: Optional[str] = None, session=None) -> Optional[Alert]:
        close_session = False
        if session is None:
            session = get_db_session()
            close_session = True
        try:
            # Check if alert already exists for this detection
            existing = session.query(Alert).filter(Alert.detection_id == detection.id).first()
            if existing:
                return existing

            should_alert = False
            title = ''
            message = ''
            severity = detection.risk_level or 'MODERATE'

            # Rule 1: Critical risk
            if detection.risk_level == 'CRITICAL':
                should_alert = True
                title = f'CRITICAL: Severe Anomaly ({detection.frp} MW)'
                message = f'Immediate response advisory. Radiative thermal anomaly with FRP of {detection.frp} MW detected near {facility_name or "industrial sector"}.'

            # Rule 2: High risk within close industrial proximity (< 500m)
            elif detection.risk_level == 'HIGH' and detection.distance_to_facility_m is not None and detection.distance_to_facility_m <= 500:
                should_alert = True
                title = f'HIGH HAZARD: {facility_name or "Industrial Facility"} Perimeter Incident'
                message = f'Thermal hotspot detected {int(detection.distance_to_facility_m)}m from {facility_name or "facility"}. FRP: {detection.frp} MW.'

            # Rule 3: Confirmed persistent emitter (>= 3 days)
            elif detection.is_persistent or detection.persistence_days >= 3:
                should_alert = True
                title = f'PERSISTENT EMITTER: Recurrence Alarm ({detection.persistence_days} days)'
                message = f'Multi-temporal anomaly confirmed across {detection.persistence_days} observation passes near {detection.location or "sector"}.'

            if should_alert:
                alert_id = f'ALT-{datetime.now(timezone.utc).strftime("%Y%m%d")}-{detection.id[-6:]}'
                alert = Alert(
                    id=alert_id,
                    detection_id=detection.id,
                    alert_type='INDUSTRIAL_FIRE_ADVISORY' if 'FIRE' in detection.classification else 'PERSISTENT_SOURCE_ALARM',
                    severity=severity,
                    title=title,
                    message=message,
                    location=detection.location or 'Industrial Sector',
                    status='ACTIVE',
                    is_read=False
                )
                session.add(alert)
                if close_session:
                    session.commit()
                logger.info(f'Dispatched alert: {alert.id} ({severity}) - {title}')
                return alert

            return None

        except Exception as e:
            if close_session:
                session.rollback()
            logger.error(f'Error evaluating alert: {e}')
            return None
        finally:
            if close_session:
                session.close()
