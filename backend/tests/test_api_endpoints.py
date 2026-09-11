import pytest
import json
from app import create_app

@pytest.fixture
def client():
    app = create_app({'TESTING': True})
    with app.test_client() as client:
        yield client

def test_api_health(client):
    resp = client.get('/api/health')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['status'] in ['healthy', 'degraded']
    assert 'database' in data
    assert 'services' in data

def test_api_fires(client):
    resp = client.get('/api/fires')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'data' in data
    assert 'total' in data
    assert isinstance(data['data'], list)

def test_api_facilities(client):
    resp = client.get('/api/facilities')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'data' in data
    assert isinstance(data['data'], list)

def test_api_persistent_sources(client):
    resp = client.get('/api/persistent-sources')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'data' in data
    assert isinstance(data['data'], list)

def test_api_alerts(client):
    resp = client.get('/api/alerts')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'data' in data
    assert isinstance(data['data'], list)

def test_api_analytics(client):
    resp = client.get('/api/analytics')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'totalDetections' in data
    assert 'riskDistribution' in data
    assert 'classificationDistribution' in data
