import pytest
from app.services.geospatial import haversine_distance_meters, find_nearest_facility
from app.models import IndustrialFacility

def test_haversine_distance_same_point():
    lat, lon = 19.0062, 72.9024
    dist = haversine_distance_meters(lat, lon, lat, lon)
    assert dist == 0.0

def test_haversine_distance_known_points():
    # Mumbai Mahul (19.0062, 72.9024) to Trombay (18.9984, 72.9150)
    # Expected distance: ~1.5 - 1.7 km
    dist = haversine_distance_meters(19.0062, 72.9024, 18.9984, 72.9150)
    assert 1400 < dist < 1800

def test_find_nearest_facility_empty():
    fac, dist = find_nearest_facility(19.0, 72.0, [])
    assert fac is None
    assert dist is None

def test_find_nearest_facility_selection():
    fac1 = IndustrialFacility(id='F1', name='Refinery', latitude=19.005, longitude=72.902)
    fac2 = IndustrialFacility(id='F2', name='Far Away Plant', latitude=20.0, longitude=73.0)

    fac, dist = find_nearest_facility(19.006, 72.902, [fac1, fac2])
    assert fac is not None
    assert fac.id == 'F1'
    assert dist < 200
