import json
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from ..config import Config
from ..database import get_db_session
from ..models import FireDetection, PersistentSource, IndustrialFacility
from .geospatial import haversine_distance_meters, find_nearest_facility

logger = logging.getLogger('thermal_watch.persistence')

class PersistenceEngine:
    """
    Detects and classifies persistent thermal emitters by clustering historical observations.
    """

    @classmethod
    def run_persistence_analysis(cls, radius_meters: float = None, min_active_days: int = None, session = None) -> List[PersistentSource]:
        radius = radius_meters or Config.PERSISTENCE_RADIUS_METERS
        min_days = min_active_days or Config.PERSISTENCE_MIN_DAYS
        should_close = False
        if session is None:
            session = get_db_session()
            should_close = True

        try:
            detections = session.query(FireDetection).all()
            if not detections:
                return []

            facilities = session.query(IndustrialFacility).all()

            # Group detections spatially into clusters within radius
            clusters: List[List[FireDetection]] = []
            visited = set()

            for det in detections:
                if det.id in visited:
                    continue

                cluster = [det]
                visited.add(det.id)

                for other in detections:
                    if other.id in visited:
                        continue
                    dist = haversine_distance_meters(det.latitude, det.longitude, other.latitude, other.longitude)
                    if dist <= radius:
                        cluster.append(other)
                        visited.add(other.id)

                clusters.append(cluster)

            persistent_records = []

            for idx, group in enumerate(clusters):
                if not group:
                    continue

                dates = set(d.acquisition_date for d in group)
                active_days = len(dates)
                detection_count = len(group)

                avg_lat = sum(d.latitude for d in group) / detection_count
                avg_lon = sum(d.longitude for d in group) / detection_count
                avg_frp = sum(d.frp for d in group) / detection_count
                max_frp = max(d.frp for d in group)
                avg_conf = sum(d.confidence for d in group) / detection_count

                dt_list = [d.detected_at for d in group if d.detected_at]
                first_dt = min(dt_list) if dt_list else datetime.now(timezone.utc)
                last_dt = max(dt_list) if dt_list else datetime.now(timezone.utc)

                # Match nearest facility
                nearest_fac, fac_dist = find_nearest_facility(avg_lat, avg_lon, facilities)

                # Classification of cluster
                if active_days >= min_days:
                    classification = 'PERSISTENT_INDUSTRIAL_THERMAL_SOURCE' if (nearest_fac and fac_dist <= 1500) else 'PERSISTENT_THERMAL_ANOMALY'
                    risk_lvl = 'CRITICAL' if (max_frp > 100 and nearest_fac) else 'HIGH'
                    risk_score = min(98.0, 60.0 + (active_days * 5) + (max_frp * 0.15))
                elif active_days >= 2 or detection_count >= 3:
                    classification = 'INTERMITTENT_THERMAL_SOURCE'
                    risk_lvl = 'HIGH' if nearest_fac else 'MODERATE'
                    risk_score = 55.0
                else:
                    classification = 'SINGLE_EVENT_ANOMALY'
                    risk_lvl = 'MODERATE'
                    risk_score = 40.0

                # Mark detections within cluster
                for d in group:
                    d.is_persistent = (active_days >= min_days)
                    d.persistence_days = active_days

                # Only persist clusters with >= 2 detections or active_days >= min_days as tracked sources
                if active_days >= min_days or detection_count >= 2:
                    cluster_id = f'PS-{idx + 1:03d}'
                    existing_ps = session.query(PersistentSource).filter(PersistentSource.id == cluster_id).first()

                    member_ids = [d.id for d in group]

                    if not existing_ps:
                        existing_ps = PersistentSource(id=cluster_id)
                        session.add(existing_ps)

                    existing_ps.cluster_latitude = avg_lat
                    existing_ps.cluster_longitude = avg_lon
                    existing_ps.location = group[0].location
                    existing_ps.first_detected = first_dt
                    existing_ps.last_detected = last_dt
                    existing_ps.active_days = active_days
                    existing_ps.detection_count = detection_count
                    existing_ps.average_frp = avg_frp
                    existing_ps.max_frp = max_frp
                    existing_ps.average_confidence = avg_conf
                    existing_ps.nearest_facility_id = nearest_fac.id if nearest_fac else None
                    existing_ps.distance_to_facility_m = fac_dist
                    existing_ps.classification = classification
                    existing_ps.risk_level = risk_lvl
                    existing_ps.risk_score = risk_score
                    existing_ps.member_detection_ids_json = json.dumps(member_ids)

                    persistent_records.append(existing_ps)

            session.commit()
            logger.info(f'Persistence analysis completed. Identified {len(persistent_records)} persistent / recurring clusters.')
            return persistent_records

        except Exception as e:
            session.rollback()
            logger.error(f'Persistence analysis error: {e}')
            return []
        finally:
            if should_close:
                session.close()
