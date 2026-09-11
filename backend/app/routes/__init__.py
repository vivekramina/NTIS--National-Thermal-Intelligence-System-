from .health import health_bp
from .fires import fires_bp
from .facilities import facilities_bp
from .persistence import persistence_bp
from .alerts import alerts_bp
from .analytics import analytics_bp
from .admin import admin_bp

__all__ = [
    'health_bp',
    'fires_bp',
    'facilities_bp',
    'persistence_bp',
    'alerts_bp',
    'analytics_bp',
    'admin_bp'
]
