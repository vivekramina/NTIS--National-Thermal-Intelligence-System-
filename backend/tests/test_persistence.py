import pytest
from app.database import get_db_session
from app.models import FireDetection, PersistentSource, IndustrialFacility
from app.services.persistence_engine import PersistenceEngine

def test_persistence_clustering():
    session = get_db_session()
    try:
        # Run persistence analysis on active DB
        sources = PersistenceEngine.run_persistence_analysis(session=session)
        assert isinstance(sources, list)

        # In our seeded telemetry, we have multi-temporal detections at Mahul and Trombay
        if len(sources) > 0:
            ps = sources[0]
            assert ps.active_days >= 2
            assert ps.detection_count >= 2
            assert ps.cluster_latitude is not None
            assert ps.cluster_longitude is not None
            assert ps.classification in [
                'PERSISTENT_INDUSTRIAL_THERMAL_SOURCE',
                'PERSISTENT_THERMAL_ANOMALY',
                'INTERMITTENT_THERMAL_SOURCE'
            ]
    finally:
        session.close()
