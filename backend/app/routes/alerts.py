import logging
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from sqlalchemy import desc
from ..database import get_db_session
from ..models import Alert, FireDetection

alerts_bp = Blueprint('alerts', __name__)
logger = logging.getLogger('thermal_watch.api.alerts')

@alerts_bp.route('/alerts', methods=['GET'])
def get_alerts():
    session = get_db_session()
    try:
        query = session.query(Alert)

        status = request.args.get('status')
        if status:
            query = query.filter(Alert.status == status)

        severity = request.args.get('severity')
        if severity:
            query = query.filter(Alert.severity == severity)

        is_read = request.args.get('is_read')
        if is_read is not None:
            val = is_read.lower() in ('true', '1', 'yes')
            query = query.filter(Alert.is_read == val)

        alerts = query.order_by(desc(Alert.created_at)).all()

        return jsonify({
            'total': len(alerts),
            'unreadCount': sum(1 for a in alerts if not a.is_read),
            'data': [a.to_dict() for a in alerts]
        }), 200
    except Exception as e:
        logger.error(f'Error retrieving alerts: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@alerts_bp.route('/alerts/<alert_id>/acknowledge', methods=['PATCH'])
def acknowledge_alert(alert_id: str):
    session = get_db_session()
    try:
        alert = session.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return jsonify({'error': f'Alert with id {alert_id} not found'}), 404

        alert.status = 'ACKNOWLEDGED'
        alert.is_read = True
        alert.acknowledged_at = datetime.now(timezone.utc)
        session.commit()

        return jsonify({
            'message': f'Alert {alert_id} acknowledged successfully',
            'alert': alert.to_dict()
        }), 200
    except Exception as e:
        session.rollback()
        logger.error(f'Error acknowledging alert: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@alerts_bp.route('/alerts/<alert_id>/resolve', methods=['PATCH'])
def resolve_alert(alert_id: str):
    session = get_db_session()
    try:
        alert = session.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return jsonify({'error': f'Alert with id {alert_id} not found'}), 404

        alert.status = 'RESOLVED'
        alert.is_read = True
        session.commit()

        return jsonify({
            'message': f'Alert {alert_id} resolved successfully',
            'alert': alert.to_dict()
        }), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()
