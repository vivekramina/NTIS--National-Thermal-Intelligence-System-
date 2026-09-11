import logging
from flask import Blueprint, request, jsonify
from sqlalchemy import desc
from ..database import get_db_session
from ..models import FireDetection, IndustrialFacility
from ..services.pipeline import TelemetryPipeline
from ..config import Config

fires_bp = Blueprint('fires', __name__)
logger = logging.getLogger('thermal_watch.api.fires')

@fires_bp.route('/fires', methods=['GET'])
def get_fires():
    session = get_db_session()
    try:
        query = session.query(FireDetection)

        # Filters
        classification = request.args.get('classification')
        if classification:
            query = query.filter(FireDetection.classification == classification)

        risk_level = request.args.get('risk_level')
        if risk_level:
            query = query.filter(FireDetection.risk_level == risk_level)

        source = request.args.get('source')
        if source:
            query = query.filter(FireDetection.source == source)

        min_frp = request.args.get('min_frp', type=float)
        if min_frp is not None:
            query = query.filter(FireDetection.frp >= min_frp)

        is_persistent = request.args.get('is_persistent')
        if is_persistent is not None:
            val = is_persistent.lower() in ('true', '1', 'yes')
            query = query.filter(FireDetection.is_persistent == val)

        start_date = request.args.get('start_date')
        if start_date:
            query = query.filter(FireDetection.acquisition_date >= start_date)

        end_date = request.args.get('end_date')
        if end_date:
            query = query.filter(FireDetection.acquisition_date <= end_date)

        total_count = query.count()
        if total_count == 0 and not any([classification, risk_level, source, min_frp, is_persistent, start_date, end_date]):
            logger.info('Database empty on /fires request. Automatically executing telemetry pipeline...')
            try:
                TelemetryPipeline.run_pipeline()
                query = session.query(FireDetection)
                total_count = query.count()
            except Exception as pe:
                logger.error(f'Auto-seeding pipeline on /fires failed: {pe}')

        # Sorting & Pagination
        query = query.order_by(desc(FireDetection.detected_at))

        limit = min(request.args.get('limit', default=100, type=int), 500)
        offset = request.args.get('offset', default=0, type=int)
        records = query.offset(offset).limit(limit).all()

        results = [r.to_dict() for r in records]

        return jsonify({
            'total': total_count,
            'limit': limit,
            'offset': offset,
            'isDemo': not Config.is_firms_key_configured(),
            'sourceNotice': 'Live NASA FIRMS feed active' if Config.is_firms_key_configured() else 'DEMO DATA / FALLBACK DATA (No FIRMS_MAP_KEY configured in backend/.env)',
            'data': results
        }), 200

    except Exception as e:
        logger.error(f'Error retrieving fires: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@fires_bp.route('/fires/latest', methods=['GET'])
def get_latest_fires():
    session = get_db_session()
    try:
        limit = min(request.args.get('limit', default=10, type=int), 50)
        records = session.query(FireDetection).order_by(desc(FireDetection.detected_at)).limit(limit).all()
        return jsonify({
            'count': len(records),
            'isDemo': not Config.is_firms_key_configured(),
            'data': [r.to_dict() for r in records]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@fires_bp.route('/fires/<detection_id>', methods=['GET'])
def get_fire_by_id(detection_id: str):
    session = get_db_session()
    try:
        det = session.query(FireDetection).filter(FireDetection.id == detection_id).first()
        if not det:
            return jsonify({'error': f'Detection with id {detection_id} not found'}), 404

        data = det.to_dict()

        # Attach facility details if present
        if det.nearest_facility_id:
            fac = session.query(IndustrialFacility).filter(IndustrialFacility.id == det.nearest_facility_id).first()
            if fac:
                data['facilityDetails'] = fac.to_dict()

        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@fires_bp.route('/fires/sync', methods=['POST'])
def sync_fires():
    try:
        payload = request.get_json(silent=True) or {}
        days = payload.get('days', 2)
        source = payload.get('source', 'VIIRS_NOAA21_NRT')
        bbox = payload.get('bbox')

        res = TelemetryPipeline.run_pipeline(source=source, bbox=bbox, days=days)
        return jsonify({
            'message': 'Telemetry pipeline executed successfully',
            'stats': res
        }), 200
    except Exception as e:
        logger.error(f'Pipeline sync trigger failed: {e}')
        return jsonify({'error': str(e)}), 500
