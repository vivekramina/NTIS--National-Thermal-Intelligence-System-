import logging
from flask import Blueprint, request, jsonify
from ..database import get_db_session
from ..models import IndustrialFacility, FireDetection
from ..services.geospatial import haversine_distance_meters

facilities_bp = Blueprint('facilities', __name__)
logger = logging.getLogger('thermal_watch.api.facilities')

@facilities_bp.route('/facilities', methods=['GET'])
def get_facilities():
    session = get_db_session()
    try:
        query = session.query(IndustrialFacility)

        fac_type = request.args.get('facility_type')
        if fac_type:
            query = query.filter(IndustrialFacility.facility_type == fac_type)

        hazard = request.args.get('hazard_category')
        if hazard:
            query = query.filter(IndustrialFacility.hazard_category == hazard)

        limit = min(request.args.get('limit', default=100, type=int), 200)
        offset = request.args.get('offset', default=0, type=int)

        total = query.count()
        facilities = query.offset(offset).limit(limit).all()

        return jsonify({
            'total': total,
            'limit': limit,
            'offset': offset,
            'data': [f.to_dict() for f in facilities]
        }), 200
    except Exception as e:
        logger.error(f'Error retrieving facilities: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@facilities_bp.route('/facilities/nearby', methods=['GET'])
def get_nearby_facilities():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    radius_m = request.args.get('radius_m', default=2000.0, type=float)

    if lat is None or lon is None:
        return jsonify({'error': 'Missing required query parameters lat and lon'}), 400

    session = get_db_session()
    try:
        facilities = session.query(IndustrialFacility).all()
        nearby = []

        for f in facilities:
            dist = haversine_distance_meters(lat, lon, f.latitude, f.longitude)
            if dist <= radius_m:
                fac_dict = f.to_dict()
                fac_dict['distanceMeters'] = round(dist, 1)
                nearby.append(fac_dict)

        nearby.sort(key=lambda x: x['distanceMeters'])

        return jsonify({
            'query': {'lat': lat, 'lon': lon, 'radiusMeters': radius_m},
            'count': len(nearby),
            'data': nearby
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@facilities_bp.route('/facilities/<facility_id>', methods=['GET'])
def get_facility_by_id(facility_id: str):
    session = get_db_session()
    try:
        facility = session.query(IndustrialFacility).filter(IndustrialFacility.id == facility_id).first()
        if not facility:
            return jsonify({'error': f'Facility with id {facility_id} not found'}), 404

        # Also get detections associated with this facility
        detections = session.query(FireDetection).filter(
            FireDetection.nearest_facility_id == facility_id
        ).order_by(FireDetection.detected_at.desc()).limit(20).all()

        data = facility.to_dict()
        data['associatedDetections'] = [d.to_dict() for d in detections]

        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()
