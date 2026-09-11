import pytest
from app.services.firms_service import FirmsService

SAMPLE_FIRMS_CSV = """latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
19.0062,72.9024,348.5,0.42,0.38,2026-09-10,1842,NOAA-21,VIIRS,94.0,2.0NRT,296.2,74.2,N
18.9984,72.9150,336.2,0.40,0.36,2026-09-10,1915,NOAA-20,VIIRS,88.0,2.0NRT,294.0,52.8,N
"""

def test_parse_firms_csv():
    records = FirmsService.parse_firms_csv(SAMPLE_FIRMS_CSV, 'VIIRS_NOAA21_NRT')
    assert len(records) == 2

    rec1 = records[0]
    assert rec1['latitude'] == 19.0062
    assert rec1['longitude'] == 72.9024
    assert rec1['frp'] == 74.2
    assert rec1['confidence'] == 94.0
    assert rec1['daynight'] == 'N'
    assert rec1['acquisition_date'] == '2026-09-10'
    assert rec1['acquisition_time'] == '18:42'
    assert rec1['is_demo'] is False

def test_firms_service_status():
    status = FirmsService.get_service_status()
    assert 'status' in status
    assert 'sourceNotice' in status
    assert 'isConfigured' in status
