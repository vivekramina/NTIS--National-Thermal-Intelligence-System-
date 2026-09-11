import time
from datetime import datetime, timezone
from flask import Blueprint, jsonify
from sqlalchemy import text
from ..config import Config
from ..database import get_db_session
from ..ml.predictor import AnomalyClassifier
from ..services.firms_service import FirmsService
from ..services.satellite_evidence import SatelliteEvidenceService

health_bp = Blueprint('health', __name__)
START_TIME = time.time()

@health_bp.route('/health', methods=['GET'])
def check_health():
    db_status = 'healthy'
    db_type = 'sqlite'
    session = None
    try:
        session = get_db_session()
        session.execute(text('SELECT 1'))
        db_type = 'postgresql_postgis' if 'postgresql' in str(session.bind.url) else 'sqlite'
    except Exception as e:
        db_status = f'unhealthy: {str(e)}'
    finally:
        if session:
            session.close()

    firms_info = FirmsService.get_service_status()
    copernicus_info = SatelliteEvidenceService.get_service_status()

    return jsonify({
        'status': 'healthy' if db_status == 'healthy' else 'degraded',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'uptimeSeconds': round(time.time() - START_TIME, 1),
        'database': {
            'status': db_status,
            'type': db_type
        },
        'services': {
            'firms': firms_info,
            'copernicus': copernicus_info,
            'openStreetMap': {
                'status': 'connected',
                'provider': 'Overpass API / Seeded Infrastructure Catalog'
            },
            'classifier': {
                'status': 'operational',
                'mode': 'RandomForestClassifier' if AnomalyClassifier.is_model_loaded() else 'Rule-Based Screening Fallback'
            }
        },
        'demoMode': not Config.is_firms_key_configured()
    }), 200
