import logging
import uuid
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

            # Rule 1: Critical risk or extreme FRP (>= 55 MW) or risk score >= 70
            if detection.risk_level == 'CRITICAL' or (detection.frp and detection.frp >= 55.0) or (detection.risk_score and detection.risk_score >= 70.0):
                should_alert = True
                severity = 'CRITICAL'
                title = f'CRITICAL: Severe Anomaly ({detection.frp} MW)'
                message = f'Immediate response advisory. Radiative thermal anomaly with FRP of {detection.frp} MW detected near {facility_name or detection.location or "industrial sector"}.'

            # Rule 2: High risk or significant industrial proximity (<= 5000m with FRP >= 20 MW) or FRP >= 35 MW
            elif detection.risk_level == 'HIGH' or (detection.distance_to_facility_m is not None and detection.distance_to_facility_m <= 5000 and (detection.frp or 0) >= 20.0) or (detection.frp and detection.frp >= 35.0):
                should_alert = True
                severity = 'HIGH'
                fac_text = facility_name or (detection.location or "Industrial Corridor")
                dist_info = f" ({int(detection.distance_to_facility_m)}m from {facility_name})" if (detection.distance_to_facility_m is not None and facility_name) else ""
                title = f'HIGH HAZARD: {fac_text} Thermal Anomaly'
                message = f'Elevated thermal hotspot detected{dist_info}. FRP: {detection.frp} MW. Risk score: {detection.risk_score}.'

            # Rule 3: Confirmed multi-temporal emitter (>= 2 days)
            elif detection.is_persistent or (detection.persistence_days and detection.persistence_days >= 2):
                should_alert = True
                severity = 'HIGH' if (detection.persistence_days and detection.persistence_days >= 3) else 'MODERATE'
                title = f'PERSISTENT EMITTER: Recurrence Alarm ({detection.persistence_days} days)'
                message = f'Multi-temporal anomaly confirmed across {detection.persistence_days} observation passes near {detection.location or "sector"}.'

            # Rule 4: Radiative thermal advisory (FRP >= 20 MW or risk score >= 40)
            elif (detection.frp and detection.frp >= 20.0) or (detection.risk_score and detection.risk_score >= 40.0):
                should_alert = True
                severity = 'MODERATE'
                title = f'THERMAL ADVISORY: Heat Radiance ({detection.frp} MW)'
                message = f'Radiative thermal hotspot registered in {detection.location or "sector"} with {int(detection.confidence)}% sensor confidence.'

            if should_alert:
                alert_id = f'ALT-{datetime.now(timezone.utc).strftime("%Y%m%d")}-{uuid.uuid4().hex[:8].upper()}'
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
