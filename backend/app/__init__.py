import logging
import os
from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config
from .database import init_db, get_db_session
from .ml.predictor import AnomalyClassifier
from .models import IndustrialFacility, FireDetection
from .services.osm_service import OsmService
from .services.pipeline import TelemetryPipeline
from .routes import (
    health_bp,
    fires_bp,
    facilities_bp,
    persistence_bp,
    alerts_bp,
    analytics_bp,
    admin_bp
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger('thermal_watch')

def create_app(test_config=None) -> Flask:
    app = Flask(__name__)

    if test_config:
        app.config.update(test_config)
    else:
        app.config['ENV'] = Config.FLASK_ENV
        app.config['DEBUG'] = Config.FLASK_DEBUG

    # Enable Cross-Origin Resource Sharing
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database Schema
    init_db()

    # Load ML Model into memory
    AnomalyClassifier.load_model()

    # Register Blueprints with /api prefix
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(fires_bp, url_prefix='/api')
    app.register_blueprint(facilities_bp, url_prefix='/api')
    app.register_blueprint(persistence_bp, url_prefix='/api')
    app.register_blueprint(alerts_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')

    # Root status endpoint for cloud health checks
    @app.route('/', methods=['GET'])
    def root_status():
        return jsonify({
            'service': 'NTIS — National Thermal Intelligence System API',
            'status': 'online',
            'health': '/api/health',
            'documentation': '/api/analytics'
        }), 200

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found', 'status': 404}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error', 'status': 500}), 500

    # Seed initial data and run pipeline if database is empty
    with app.app_context():
        try:
            session = get_db_session()
            fac_count = session.query(IndustrialFacility).count()
            det_count = session.query(FireDetection).count()
            session.close()

            if fac_count == 0:
                logger.info('Empty facility database detected. Seeding industrial facilities...')
                OsmService.seed_facilities_if_empty()

            if det_count == 0:
                logger.info('Initializing thermal telemetry pipeline on startup...')
                TelemetryPipeline.run_pipeline()

        except Exception as e:
            logger.warning(f'Startup initial seeding check warning: {e}')

    return app
