import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from ..database import get_db_session
from ..models import FireDetection, IndustrialFacility, AuditLog
from .firms_service import FirmsService
from .osm_service import OsmService
from .geospatial import find_nearest_facility
from .persistence_engine import PersistenceEngine
from .landcover_provider import LandCoverProvider
from .satellite_evidence import SatelliteEvidenceService
from .risk_engine import RiskEngine
from .alert_engine import AlertEngine
from ..ml.predictor import AnomalyClassifier

logger = logging.getLogger('thermal_watch.pipeline')

class TelemetryPipeline:
    """
    End-to-End SIH26162 Telemetry Ingestion & Intelligence Pipeline:
    NASA FIRMS -> Geospatial Context -> Persistence -> Land Cover -> ML Classification -> Risk -> Alerts
    """

    @classmethod
    def run_pipeline(cls, source: str = 'VIIRS_NOAA21_NRT', bbox: str = None, days: int = 2) -> Dict[str, Any]:
        session = get_db_session()
        start_time = datetime.now(timezone.utc)
        stats = {
            'fetched': 0,
            'ingested': 0,
            'persistentSources': 0,
            'alertsGenerated': 0,
            'status': 'SUCCESS'
        }

        try:
            logger.info('=== Starting Thermal Watch Telemetry Pipeline ===')

            # Step 1: Ensure OSM facilities are seeded in database
            OsmService.seed_initial_facilities()
            facilities = session.query(IndustrialFacility).all()

            # Step 2: Fetch raw NASA FIRMS detections
            raw_records = FirmsService.fetch_firms_data(source=source, bbox=bbox, days=days)
            stats['fetched'] = len(raw_records)

            # Step 3: Ingest & calculate geospatial distance to facilities
            ingested_detections = []
            for rec in raw_records:
                det = session.query(FireDetection).filter(FireDetection.id == rec['id']).first()
                if not det:
                    det = FireDetection(id=rec['id'])
                    session.add(det)

                det.latitude = rec['latitude']
                det.longitude = rec['longitude']
                det.location = rec.get('location') or f'Sector ({rec["latitude"]:.3f}N, {rec["longitude"]:.3f}E)'
                det.acquisition_date = rec['acquisition_date']
                det.acquisition_time = rec['acquisition_time']

                # Parse detected_at datetime
                try:
                    time_parts = rec['acquisition_time'].replace(':', '')
                    hour = int(time_parts[:2]) if len(time_parts) >= 2 else 0
                    minute = int(time_parts[2:4]) if len(time_parts) >= 4 else 0
                    dt = datetime.strptime(rec['acquisition_date'], '%Y-%m-%d').replace(
                        hour=hour, minute=minute, tzinfo=timezone.utc
                    )
                except Exception:
                    dt = datetime.now(timezone.utc)

                det.detected_at = dt
                det.satellite = rec['satellite']
                det.instrument = rec['instrument']
                det.confidence = rec['confidence']
                det.frp = rec['frp']
                det.brightness = rec.get('brightness')
                det.bright_t31 = rec.get('bright_t31')
                det.scan = rec.get('scan', 0.5)
                det.track = rec.get('track', 0.5)
                det.daynight = rec.get('daynight', 'N')
                det.source = rec['source']
                det.is_demo = rec.get('is_demo', False)

                # Find nearest industrial facility
                nearest_fac, fac_dist = find_nearest_facility(det.latitude, det.longitude, facilities)
                if nearest_fac:
                    det.nearest_facility_id = nearest_fac.id
                    det.distance_to_facility_m = fac_dist
                else:
                    det.nearest_facility_id = None
                    det.distance_to_facility_m = None

                ingested_detections.append((det, nearest_fac))

            session.commit()
            stats['ingested'] = len(ingested_detections)

            # Step 4: Run historical persistence clustering
            ps_records = PersistenceEngine.run_persistence_analysis(session=session)
            stats['persistentSources'] = len(ps_records)

            # Step 5: Feature Engineering, Land-Cover, AI Classification & Risk Engine
            alerts_created = 0
            for det, nearest_fac in ingested_detections:
                # Land cover context
                lc = LandCoverProvider.get_landcover_context(det.latitude, det.longitude, det.distance_to_facility_m)
                det.land_cover_class = lc['primaryClass']

                # Satellite evidence search
                sat_ev = SatelliteEvidenceService.find_evidence_scene(det.latitude, det.longitude, det.acquisition_date)
                det.satellite_evidence_available = sat_ev['available']
                det.satellite_scene_id = sat_ev.get('tileId')

                # Prepare feature dictionary
                det_features = {
                    'id': det.id,
                    'frp': det.frp,
                    'confidence': det.confidence,
                    'brightness': det.brightness,
                    'daynight': det.daynight,
                    'source': det.source,
                    'distanceToFacilityM': det.distance_to_facility_m,
                    'facilityName': nearest_fac.name if nearest_fac else None,
                    'persistenceDays': det.persistence_days,
                    'isPersistent': det.is_persistent,
                    'landCoverClass': det.land_cover_class
                }

                # AI / ML Classification
                classification, class_conf, reasons = AnomalyClassifier.classify(det_features)
                det.classification = classification
                det.classification_confidence = class_conf
                det.classification_reasons_json = json.dumps(reasons)

                # Composite Risk Assessment
                risk_score, risk_lvl = RiskEngine.calculate_risk(
                    frp=det.frp,
                    confidence=det.confidence,
                    distance_to_facility_m=det.distance_to_facility_m,
                    is_persistent=det.is_persistent,
                    persistence_days=det.persistence_days,
                    daynight=det.daynight
                )
                det.risk_score = risk_score
                det.risk_level = risk_lvl

                # Step 6: Alert evaluation
                alert = AlertEngine.evaluate_detection_for_alerts(det, facility_name=nearest_fac.name if nearest_fac else None, session=session)
                if alert:
                    alerts_created += 1

            session.commit()
            stats['alertsGenerated'] = alerts_created

            # Audit Log
            elapsed_sec = (datetime.now(timezone.utc) - start_time).total_seconds()
            audit = AuditLog(
                event_type='TELEMETRY_PIPELINE_RUN',
                action=f'Processed {stats["ingested"]} anomalies via {source}',
                details_json=json.dumps({**stats, 'elapsedSeconds': elapsed_sec}),
                status='SUCCESS'
            )
            session.add(audit)
            session.commit()

            logger.info(f'Telemetry pipeline completed in {elapsed_sec:.2f}s: {stats}')
            return stats

        except Exception as e:
            session.rollback()
            logger.error(f'Telemetry pipeline failure: {e}')
            stats['status'] = 'ERROR'
            stats['error'] = str(e)
            return stats
        finally:
            session.close()
