import logging
from collections import Counter
from flask import Blueprint, jsonify
from sqlalchemy import func
from ..database import get_db_session
from ..models import FireDetection, PersistentSource, IndustrialFacility, Alert

analytics_bp = Blueprint('analytics', __name__)
logger = logging.getLogger('thermal_watch.api.analytics')

@analytics_bp.route('/analytics', methods=['GET'])
def get_analytics():
    session = get_db_session()
    try:
        detections = session.query(FireDetection).all()
        persistent_sources = session.query(PersistentSource).all()
        facilities = session.query(IndustrialFacility).all()
        alerts = session.query(Alert).all()

        total_detections = len(detections)
        if total_detections == 0:
            return jsonify({
                'totalDetections': 0,
                'persistentSourcesCount': len(persistent_sources),
                'facilitiesMonitored': len(facilities),
                'activeAlerts': len([a for a in alerts if a.status == 'ACTIVE']),
                'riskDistribution': {'LOW': 0, 'MODERATE': 0, 'HIGH': 0, 'CRITICAL': 0},
                'classificationDistribution': {},
                'sourceBreakdown': {},
                'dailyTimeline': []
            }), 200

        # Risk distribution
        risk_counts = Counter(d.risk_level for d in detections if d.risk_level)
        for lvl in ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']:
            if lvl not in risk_counts:
                risk_counts[lvl] = 0

        # Classification distribution
        class_counts = Counter(d.classification for d in detections if d.classification)

        # Source breakdown
        source_counts = Counter(d.source for d in detections if d.source)

        # Daily timeline
        date_counts = Counter(d.acquisition_date for d in detections if d.acquisition_date)
        sorted_dates = sorted(date_counts.keys())
        timeline = [{'date': dt, 'count': date_counts[dt]} for dt in sorted_dates]

        # Industrial vs non-industrial
        industrial_count = sum(1 for d in detections if d.distance_to_facility_m is not None and d.distance_to_facility_m <= 1000)
        vegetation_count = sum(1 for d in detections if 'VEGETATION' in (d.classification or ''))

        frp_values = [d.frp for d in detections if d.frp is not None]
        avg_frp = sum(frp_values) / len(frp_values) if frp_values else 0.0
        max_frp = max(frp_values) if frp_values else 0.0

        return jsonify({
            'totalDetections': total_detections,
            'persistentSourcesCount': len(persistent_sources),
            'facilitiesMonitored': len(facilities),
            'activeAlerts': len([a for a in alerts if a.status == 'ACTIVE']),
            'totalAlerts': len(alerts),
            'metrics': {
                'averageFRP': round(avg_frp, 2),
                'maxFRP': round(max_frp, 2),
                'industrialProximityCount': industrial_count,
                'vegetationWildfireCount': vegetation_count,
                'persistentRate': round((len([d for d in detections if d.is_persistent]) / total_detections) * 100, 1)
            },
            'riskDistribution': dict(risk_counts),
            'classificationDistribution': dict(class_counts),
            'sourceBreakdown': dict(source_counts),
            'dailyTimeline': timeline
        }), 200
    except Exception as e:
        logger.error(f'Error calculating analytics: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()
