import os
from pathlib import Path
from dotenv import load_dotenv

# Locate .env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Config:
    FIRMS_MAP_KEY = os.getenv("FIRMS_MAP_KEY", "").strip()
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/thermal_watch")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() in ("true", "1", "yes")
    FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))
    CORS_ORIGINS = [orig.strip() for orig in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if orig.strip()]
    
    COPERNICUS_CLIENT_ID = os.getenv("COPERNICUS_CLIENT_ID", "").strip()
    COPERNICUS_CLIENT_SECRET = os.getenv("COPERNICUS_CLIENT_SECRET", "").strip()
    
    DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
    OVERPASS_TIMEOUT = int(os.getenv("OVERPASS_TIMEOUT", 30))
    
    # Persistence screening prototype parameters (configurable, not hardcoded scientific absolutes)
    PERSISTENCE_RADIUS_METERS = float(os.getenv("PERSISTENCE_RADIUS_METERS", 500.0))
    PERSISTENCE_MIN_DAYS = int(os.getenv("PERSISTENCE_MIN_DAYS", 3))
    LOOKBACK_DAYS = int(os.getenv("LOOKBACK_DAYS", 7))
    
    @classmethod
    def is_firms_key_configured(cls) -> bool:
        return bool(cls.FIRMS_MAP_KEY and cls.FIRMS_MAP_KEY != "YOUR_NASA_FIRMS_MAP_KEY")
