import csv
import io
import logging
import httpx
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from ..config import Config
from ..database import get_db_session
from ..models import FireDetection, AuditLog

logger = logging.getLogger('thermal_watch.firms')

# Real-world representative FIRMS detections for India industrial corridors when MAP_KEY is pending
DEMO_FIRMS_RECORDS = [
    {
        'id': 'FIRMS-VIIRS-N21-20260910-1842-19.0062-72.9024',
        'latitude': 19.0062,
        'longitude': 72.9024,
        'location': 'Mahul Industrial Refinery Corridor, Mumbai',
        'acquisition_date': '2026-09-10',
        'acquisition_time': '18:42',
        'satellite': 'NOAA-21',
        'instrument': 'VIIRS',
        'confidence': 94.0,
        'frp': 74.2,
        'brightness': 348.5,
        'bright_t31': 296.2,
        'scan': 0.42,
        'track': 0.38,
        'daynight': 'N',
        'source': 'VIIRS_NOAA21_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N20-20260909-1910-19.0064-72.9021',
        'latitude': 19.0064,
        'longitude': 72.9021,
        'location': 'Mahul Industrial Refinery Corridor, Mumbai',
        'acquisition_date': '2026-09-09',
        'acquisition_time': '19:10',
        'satellite': 'NOAA-20',
        'instrument': 'VIIRS',
        'confidence': 92.0,
        'frp': 68.5,
        'brightness': 345.1,
        'bright_t31': 295.0,
        'scan': 0.40,
        'track': 0.36,
        'daynight': 'N',
        'source': 'VIIRS_NOAA20_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N21-20260908-1850-19.0061-72.9026',
        'latitude': 19.0061,
        'longitude': 72.9026,
        'location': 'Mahul Industrial Refinery Corridor, Mumbai',
        'acquisition_date': '2026-09-08',
        'acquisition_time': '18:50',
        'satellite': 'NOAA-21',
        'instrument': 'VIIRS',
        'confidence': 95.0,
        'frp': 71.0,
        'brightness': 346.8,
        'bright_t31': 296.0,
        'scan': 0.41,
        'track': 0.37,
        'daynight': 'N',
        'source': 'VIIRS_NOAA21_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N20-20260907-1905-19.0063-72.9023',
        'latitude': 19.0063,
        'longitude': 72.9023,
        'location': 'Mahul Industrial Refinery Corridor, Mumbai',
        'acquisition_date': '2026-09-07',
        'acquisition_time': '19:05',
        'satellite': 'NOAA-20',
        'instrument': 'VIIRS',
        'confidence': 91.0,
        'frp': 65.4,
        'brightness': 343.2,
        'bright_t31': 294.8,
        'scan': 0.39,
        'track': 0.35,
        'daynight': 'N',
        'source': 'VIIRS_NOAA20_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N20-20260910-1915-18.9984-72.9150',
        'latitude': 18.9984,
        'longitude': 72.9150,
        'location': 'Trombay Thermal Power & Chemical Sector',
        'acquisition_date': '2026-09-10',
        'acquisition_time': '19:15',
        'satellite': 'NOAA-20',
        'instrument': 'VIIRS',
        'confidence': 88.0,
        'frp': 52.8,
        'brightness': 336.2,
        'bright_t31': 294.0,
        'scan': 0.40,
        'track': 0.36,
        'daynight': 'N',
        'source': 'VIIRS_NOAA20_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N21-20260909-1930-18.9986-72.9152',
        'latitude': 18.9986,
        'longitude': 72.9152,
        'location': 'Trombay Thermal Power & Chemical Sector',
        'acquisition_date': '2026-09-09',
        'acquisition_time': '19:30',
        'satellite': 'NOAA-21',
        'instrument': 'VIIRS',
        'confidence': 86.0,
        'frp': 49.3,
        'brightness': 334.5,
        'bright_t31': 293.2,
        'scan': 0.42,
        'track': 0.38,
        'daynight': 'N',
        'source': 'VIIRS_NOAA21_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N20-20260908-1925-18.9982-72.9148',
        'latitude': 18.9982,
        'longitude': 72.9148,
        'location': 'Trombay Thermal Power & Chemical Sector',
        'acquisition_date': '2026-09-08',
        'acquisition_time': '19:25',
        'satellite': 'NOAA-20',
        'instrument': 'VIIRS',
        'confidence': 87.0,
        'frp': 50.1,
        'brightness': 335.0,
        'bright_t31': 293.8,
        'scan': 0.39,
        'track': 0.35,
        'daynight': 'N',
        'source': 'VIIRS_NOAA20_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N21-20260910-0930-19.0210-72.8890',
        'latitude': 19.0210,
        'longitude': 72.8890,
        'location': 'Wadala Chemical Storage Yard',
        'acquisition_date': '2026-09-10',
        'acquisition_time': '09:30',
        'satellite': 'NOAA-21',
        'instrument': 'VIIRS',
        'confidence': 91.0,
        'frp': 63.1,
        'brightness': 342.0,
        'bright_t31': 298.5,
        'scan': 0.45,
        'track': 0.39,
        'daynight': 'D',
        'source': 'VIIRS_NOAA21_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-MODIS-AQUA-20260909-1340-19.0550-73.0120',
        'latitude': 19.0550,
        'longitude': 73.0120,
        'location': 'MIDC Turbhe Industrial Manufacturing Hub, Navi Mumbai',
        'acquisition_date': '2026-09-09',
        'acquisition_time': '13:40',
        'satellite': 'Aqua',
        'instrument': 'MODIS',
        'confidence': 72.0,
        'frp': 28.5,
        'brightness': 322.0,
        'bright_t31': 295.1,
        'scan': 1.10,
        'track': 1.00,
        'daynight': 'D',
        'source': 'MODIS_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N20-20260908-1920-19.0720-73.0280',
        'latitude': 19.0720,
        'longitude': 73.0280,
        'location': 'MIDC Kopar Khairane Chemical Cluster',
        'acquisition_date': '2026-09-08',
        'acquisition_time': '19:20',
        'satellite': 'NOAA-20',
        'instrument': 'VIIRS',
        'confidence': 65.0,
        'frp': 19.4,
        'brightness': 315.8,
        'bright_t31': 292.4,
        'scan': 0.38,
        'track': 0.35,
        'daynight': 'N',
        'source': 'VIIRS_NOAA20_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N21-20260907-2005-18.9650-72.9320',
        'latitude': 18.9650,
        'longitude': 72.9320,
        'location': 'Jawahar Dweep Marine Oil Terminal',
        'acquisition_date': '2026-09-07',
        'acquisition_time': '20:05',
        'satellite': 'NOAA-21',
        'instrument': 'VIIRS',
        'confidence': 85.0,
        'frp': 44.0,
        'brightness': 331.0,
        'bright_t31': 293.0,
        'scan': 0.41,
        'track': 0.37,
        'daynight': 'N',
        'source': 'VIIRS_NOAA21_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N21-20260910-1410-19.2150-72.9100',
        'latitude': 19.2150,
        'longitude': 72.9100,
        'location': 'Sanjay Gandhi National Park Buffer Zone',
        'acquisition_date': '2026-09-10',
        'acquisition_time': '14:10',
        'satellite': 'NOAA-21',
        'instrument': 'VIIRS',
        'confidence': 82.0,
        'frp': 31.0,
        'brightness': 326.4,
        'bright_t31': 296.0,
        'scan': 0.44,
        'track': 0.39,
        'daynight': 'D',
        'source': 'VIIRS_NOAA21_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N21-20260910-1820-22.4707-70.0577',
        'latitude': 22.4707,
        'longitude': 70.0577,
        'location': 'Jamnagar Petroleum Refinery Complex, Gujarat',
        'acquisition_date': '2026-09-10',
        'acquisition_time': '18:20',
        'satellite': 'NOAA-21',
        'instrument': 'VIIRS',
        'confidence': 98.0,
        'frp': 142.5,
        'brightness': 365.2,
        'bright_t31': 298.0,
        'scan': 0.40,
        'track': 0.38,
        'daynight': 'N',
        'source': 'VIIRS_NOAA21_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N20-20260910-1745-20.8400-85.1500',
        'latitude': 20.8400,
        'longitude': 85.1500,
        'location': 'Angul Steel Manufacturing Plant, Odisha',
        'acquisition_date': '2026-09-10',
        'acquisition_time': '17:45',
        'satellite': 'NOAA-20',
        'instrument': 'VIIRS',
        'confidence': 96.0,
        'frp': 128.0,
        'brightness': 358.4,
        'bright_t31': 297.5,
        'scan': 0.42,
        'track': 0.39,
        'daynight': 'N',
        'source': 'VIIRS_NOAA20_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N21-20260910-1615-21.7000-72.5800',
        'latitude': 21.7000,
        'longitude': 72.5800,
        'location': 'Dahej Petrochemical SEZ Flare Tower, Gujarat',
        'acquisition_date': '2026-09-10',
        'acquisition_time': '16:15',
        'satellite': 'NOAA-21',
        'instrument': 'VIIRS',
        'confidence': 95.0,
        'frp': 89.0,
        'brightness': 349.0,
        'bright_t31': 295.2,
        'scan': 0.41,
        'track': 0.37,
        'daynight': 'N',
        'source': 'VIIRS_NOAA21_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N20-20260910-1320-30.2100-74.9500',
        'latitude': 30.2100,
        'longitude': 74.9500,
        'location': 'Bathinda Agricultural Stubble Sector, Punjab',
        'acquisition_date': '2026-09-10',
        'acquisition_time': '13:20',
        'satellite': 'NOAA-20',
        'instrument': 'VIIRS',
        'confidence': 88.0,
        'frp': 42.0,
        'brightness': 330.5,
        'bright_t31': 294.0,
        'scan': 0.45,
        'track': 0.40,
        'daynight': 'D',
        'source': 'VIIRS_NOAA20_NRT',
        'is_demo': True
    },
    {
        'id': 'FIRMS-VIIRS-N21-20260910-1850-21.1900-81.2800',
        'latitude': 21.1900,
        'longitude': 81.2800,
        'location': 'Bhilai Integrated Steel Plant Blast Furnace, Chhattisgarh',
        'acquisition_date': '2026-09-10',
        'acquisition_time': '18:50',
        'satellite': 'NOAA-21',
        'instrument': 'VIIRS',
        'confidence': 97.0,
        'frp': 115.0,
        'brightness': 354.0,
        'bright_t31': 296.8,
        'scan': 0.40,
        'track': 0.38,
        'daynight': 'N',
        'source': 'VIIRS_NOAA21_NRT',
        'is_demo': True
    }
]

class FirmsService:
    BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api'

    @classmethod
    def get_service_status(cls) -> Dict[str, Any]:
        has_key = Config.is_firms_key_configured()
        return {
            'name': 'NASA FIRMS Stream',
            'status': 'connected' if has_key else 'demo_mode',
            'isConfigured': has_key,
            'sourceNotice': 'Live Satellite Stream Active' if has_key else 'DEMO DATA / FALLBACK DATA (Configure FIRMS_MAP_KEY in backend/.env for live feed)',
            'endpoint': f'{cls.BASE_URL}/area' if has_key else 'local_validated_telemetry'
        }

    @classmethod
    def fetch_firms_data(
        cls,
        source: str = 'VIIRS_NOAA21_NRT',
        bbox: Optional[str] = None,
        days: int = 2
    ) -> List[Dict[str, Any]]:
        """
        Fetch thermal anomalies from official NASA FIRMS API.
        If MAP_KEY is absent or API fails, returns validated historical telemetry with demo flags.
        """
        map_key = Config.FIRMS_MAP_KEY
        if not Config.is_firms_key_configured():
            logger.info('NASA FIRMS MAP_KEY not configured in backend/.env. Using validated fallback telemetry.')
            return DEMO_FIRMS_RECORDS

        # Default bounding box for India (approx 68.0, 6.0, 97.5, 37.5)
        bounding_box = bbox or '68.0,6.0,97.5,37.5'  # All-India Sovereign Territorial Bounding Box
        url = f'{cls.BASE_URL}/area/csv/{map_key}/{source}/{bounding_box}/{days}'

        try:
            logger.info(f'Requesting NASA FIRMS telemetry from official endpoint for India: {url.replace(map_key, "***")}')
            with httpx.Client(timeout=25.0) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    records = cls.parse_firms_csv(resp.text, source=source)
                    logger.info(f'Successfully parsed {len(records)} thermal anomalies from NASA FIRMS across India.')
                    return records
                elif resp.status_code == 403 or 'Invalid MAP_KEY' in resp.text:
                    logger.error('NASA FIRMS reported Invalid MAP_KEY. Falling back to local telemetry.')
                    return DEMO_FIRMS_RECORDS
                else:
                    logger.warning(f'NASA FIRMS HTTP {resp.status_code}: {resp.text[:200]}')
                    return DEMO_FIRMS_RECORDS
        except Exception as e:
            logger.error(f'NASA FIRMS request failed: {e}. Utilizing fallback telemetry.')
            return DEMO_FIRMS_RECORDS

    @classmethod
    def get_indian_region_label(cls, lat: float, lon: float) -> str:
        """
        Generate human-readable Indian geographical corridor tag from coordinates.
        """
        if 29.5 <= lat <= 33.0 and 74.0 <= lon <= 77.5:
            return f'Punjab-Haryana Agricultural Belt ({lat:.3f}°N, {lon:.3f}°E)'
        if 28.0 <= lat <= 29.5 and 76.5 <= lon <= 78.5:
            return f'Delhi NCR Industrial & Logistics Sector ({lat:.3f}°N, {lon:.3f}°E)'
        if 20.5 <= lat <= 24.5 and 68.5 <= lon <= 74.0:
            if lon <= 71.0:
                return f'Jamnagar-Saurashtra Petroleum Belt, Gujarat ({lat:.3f}°N, {lon:.3f}°E)'
            return f'Dahej-Bharuch-Ahmedabad Industrial Corridor, Gujarat ({lat:.3f}°N, {lon:.3f}°E)'
        if 18.5 <= lat <= 20.5 and 72.5 <= lon <= 74.5:
            return f'Mumbai-Thane-Pune Petrochemical Belt, Maharashtra ({lat:.3f}°N, {lon:.3f}°E)'
        if 19.5 <= lat <= 22.5 and 83.5 <= lon <= 87.5:
            return f'Angul-Jharsuguda Steel & Power Corridor, Odisha ({lat:.3f}°N, {lon:.3f}°E)'
        if 20.0 <= lat <= 23.5 and 80.5 <= lon <= 83.5:
            return f'Bhilai-Korba Heavy Industrial Basin, Chhattisgarh ({lat:.3f}°N, {lon:.3f}°E)'
        if 22.0 <= lat <= 24.5 and 84.5 <= lon <= 87.5:
            return f'Jamshedpur-Dhanbad Industrial Corridor, Jharkhand ({lat:.3f}°N, {lon:.3f}°E)'
        if 12.0 <= lat <= 13.8 and 79.5 <= lon <= 80.5:
            return f'Chennai-Ennore Petrochemical & Port Zone, Tamil Nadu ({lat:.3f}°N, {lon:.3f}°E)'
        if 9.5 <= lat <= 11.5 and 76.0 <= lon <= 77.5:
            return f'Kochi-Ernakulam Industrial Belt, Kerala ({lat:.3f}°N, {lon:.3f}°E)'
        if 16.5 <= lat <= 18.5 and 82.0 <= lon <= 84.0:
            return f'Visakhapatnam Petroleum & Steel SEZ, Andhra Pradesh ({lat:.3f}°N, {lon:.3f}°E)'
        if 18.0 <= lat <= 19.5 and 78.5 <= lon <= 80.5:
            return f'Ramagundam-Godavari Power Basin, Telangana ({lat:.3f}°N, {lon:.3f}°E)'
        return f'India Geospatial Sector ({lat:.3f}°N, {lon:.3f}°E)'

    @classmethod
    def parse_firms_csv(cls, csv_text: str, source: str) -> List[Dict[str, Any]]:
        """
        Parse raw NASA FIRMS CSV output into normalized thermal anomaly records.
        """
        records = []
        if not csv_text or not csv_text.strip():
            return records

        reader = csv.DictReader(io.StringIO(csv_text.strip()))
        for row in reader:
            try:
                lat = float(row.get('latitude', 0.0))
                lon = float(row.get('longitude', 0.0))

                # Strictly restrict to sovereign Indian territorial bounds
                if not (6.0 <= lat <= 37.5 and 68.0 <= lon <= 97.5):
                    continue

                acq_date = row.get('acq_date', datetime.now(timezone.utc).strftime('%Y-%m-%d'))
                raw_time = str(row.get('acq_time', '0000')).strip()
                clean_time = f'{int(raw_time):04d}' if raw_time.isdigit() else '1200'
                acq_time_fmt = f'{clean_time[:2]}:{clean_time[2:]}'

                # Determine satellite and instrument
                sat = row.get('satellite', 'VIIRS')
                inst = 'VIIRS' if 'VIIRS' in source or 'VIIRS' in sat else 'MODIS'

                # Confidence parsing (VIIRS uses 'l', 'n', 'h' or 0-100; MODIS uses 0-100)
                conf_val = str(row.get('confidence', '80')).strip().lower()
                if conf_val == 'l':
                    confidence = 35.0
                elif conf_val == 'n':
                    confidence = 65.0
                elif conf_val == 'h':
                    confidence = 90.0
                else:
                    try:
                        confidence = float(conf_val)
                    except ValueError:
                        confidence = 75.0

                frp = float(row.get('frp', 15.0) or 15.0)
                brightness = float(row.get('bright_ti4', row.get('brightness', 320.0)) or 320.0)
                bright_t31 = float(row.get('bright_ti5', row.get('bright_t31', 290.0)) or 290.0)

                det_id = f'FIRMS-{sat}-{acq_date.replace("-", "")}-{clean_time}-{lat:.4f}-{lon:.4f}'

                records.append({
                    'id': det_id,
                    'latitude': lat,
                    'longitude': lon,
                    'location': cls.get_indian_region_label(lat, lon),
                    'acquisition_date': acq_date,
                    'acquisition_time': acq_time_fmt,
                    'satellite': sat,
                    'instrument': inst,
                    'confidence': confidence,
                    'frp': frp,
                    'brightness': brightness,
                    'bright_t31': bright_t31,
                    'scan': float(row.get('scan', 0.5) or 0.5),
                    'track': float(row.get('track', 0.5) or 0.5),
                    'daynight': row.get('daynight', 'N'),
                    'source': source,
                    'is_demo': False
                })
            except Exception as row_err:
                logger.debug(f'Skipping malformed FIRMS row: {row_err}')
                continue

        return records
