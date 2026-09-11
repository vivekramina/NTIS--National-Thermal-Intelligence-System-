import json
import logging
from flask import Blueprint, request, jsonify
from ..database import get_db_session
from ..models import PersistentSource, FireDetection, IndustrialFacility

persistence_bp = Blueprint('persistence', __name__)
logger = logging.getLogger('thermal_watch.api.persistence')

@persistence_bp.route('/persistent-sources', methods=['GET'])
def get_persistent_sources():
    session = get_db_session()
    try:
        query = session.query(PersistentSource)

        classification = request.args.get('classification')
        if classification:
            query = query.filter(PersistentSource.classification == classification)

        risk_level = request.args.get('risk_level')
        if risk_level:
            query = query.filter(PersistentSource.risk_level == risk_level)

        min_days = request.args.get('min_active_days', type=int)
        if min_days is not None:
            query = query.filter(PersistentSource.active_days >= min_days)

        sources = query.order_by(PersistentSource.active_days.desc()).all()

        return jsonify({
            'total': len(sources),
            'data': [s.to_dict() for s in sources]
        }), 200
    except Exception as e:
        logger.error(f'Error retrieving persistent sources: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@persistence_bp.route('/persistent-sources/<source_id>', methods=['GET'])
def get_persistent_source_by_id(source_id: str):
    session = get_db_session()
    try:
        source = session.query(PersistentSource).filter(PersistentSource.id == source_id).first()
        if not source:
            return jsonify({'error': f'Persistent source with id {source_id} not found'}), 404

        data = source.to_dict()

        if source.nearest_facility_id:
            fac = session.query(IndustrialFacility).filter(IndustrialFacility.id == source.nearest_facility_id).first()
            if fac:
                data['facility'] = fac.to_dict()

        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@persistence_bp.route('/persistent-sources/<source_id>/timeline', methods=['GET'])
def get_source_timeline(source_id: str):
    session = get_db_session()
    try:
        source = session.query(PersistentSource).filter(PersistentSource.id == source_id).first()
        if not source:
            return jsonify({'error': f'Persistent source with id {source_id} not found'}), 404

        member_ids = []
        if source.member_detection_ids_json:
            member_ids = json.loads(source.member_detection_ids_json)

        detections = []
        if member_ids:
            detections = session.query(FireDetection).filter(
                FireDetection.id.in_(member_ids)
            ).order_by(FireDetection.detected_at.asc()).all()

        timeline_entries = [
            {
                'id': d.id,
                'date': d.acquisition_date,
                'time': d.acquisition_time,
                'detectedAt': d.detected_at.isoformat() if d.detected_at else None,
                'frp': d.frp,
                'brightness': d.brightness,
                'confidence': d.confidence,
                'satellite': d.satellite,
                'daynight': d.daynight,
                'latitude': d.latitude,
                'longitude': d.longitude,
                'riskScore': d.risk_score
            }
            for d in detections
        ]

        return jsonify({
            'sourceId': source.id,
            'location': source.location,
            'activeDays': source.active_days,
            'detectionCount': len(timeline_entries),
            'timeline': timeline_entries
        }), 200
    except Exception as e:
        logger.error(f'Error getting source timeline: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()
