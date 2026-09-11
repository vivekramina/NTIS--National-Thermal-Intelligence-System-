import logging
from flask import Blueprint, request, jsonify
from sqlalchemy import desc
from ..database import get_db_session
from ..models import AuditLog
from ..services.pipeline import TelemetryPipeline
from ..ml.training import train_anomaly_model

admin_bp = Blueprint('admin', __name__)
logger = logging.getLogger('thermal_watch.api.admin')

@admin_bp.route('/admin/pipeline/run', methods=['POST'])
def run_pipeline():
    try:
        body = request.get_json(silent=True) or {}
        source = body.get('source', 'VIIRS_NOAA21_NRT')
        bbox = body.get('bbox')
        days = body.get('days', 2)

        stats = TelemetryPipeline.run_pipeline(source=source, bbox=bbox, days=days)
        return jsonify({
            'status': 'SUCCESS',
            'message': 'Telemetry pipeline executed successfully',
            'stats': stats
        }), 200
    except Exception as e:
        logger.error(f'Admin manual pipeline run failed: {e}')
        return jsonify({'status': 'ERROR', 'error': str(e)}), 500


@admin_bp.route('/admin/pipeline/status', methods=['GET'])
def get_pipeline_status():
    session = get_db_session()
    try:
        logs = session.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(20).all()
        return jsonify({
            'count': len(logs),
            'auditLogs': [log.to_dict() for log in logs]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@admin_bp.route('/admin/model/retrain', methods=['POST'])
def retrain_model():
    try:
        metrics = train_anomaly_model()
        return jsonify({
            'message': 'Anomaly classifier model retrained successfully',
            'metrics': metrics
        }), 200
    except Exception as e:
        logger.error(f'Model retraining failed: {e}')
        return jsonify({'error': str(e)}), 500
