# THERMAL WATCH AI — REST API DOCUMENTATION
**Smart India Hackathon SIH26162**
*AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data*

---

## 1. Overview & Architecture

Thermal Watch AI provides a production-grade RESTful API backend built on Flask, SQLAlchemy, PostGIS (with zero-config local SQLite fallback), and scikit-learn. It ingests near-real-time satellite thermal anomaly telemetry from NASA FIRMS, enriches detections with OpenStreetMap industrial infrastructure topology and Copernicus land-cover context, clusters multi-temporal observations to identify persistent emitters (such as flare stacks and smelters), and classifies anomalies using an explainable AI pipeline.

### Base URL
```
http://localhost:5000/api
```

### Response Conventions
- All responses return `application/json; charset=utf-8`.
- Timestamps follow ISO 8601 (`YYYY-MM-DDTHH:MM:SS.mmmmmm+00:00`).
- Geodetic coordinates are expressed in WGS84 decimal degrees (`latitude`, `longitude`).
- Distances are reported in meters (`meters`).
- Fire Radiative Power is reported in Megawatts (`MW`).

---

## 2. API Endpoints

### 2.1 System Health & Service Connectivity
`GET /api/health`

Verifies database connectivity, ML model availability, and external service upstream status.

**Sample Response (HTTP 200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-09-11T07:15:00.000000+00:00",
  "uptimeSeconds": 142.5,
  "database": {
    "status": "healthy",
    "type": "sqlite"
  },
  "services": {
    "firms": {
      "name": "NASA FIRMS Stream",
      "status": "demo_mode",
      "isConfigured": false,
      "sourceNotice": "DEMO DATA / FALLBACK DATA (Configure FIRMS_MAP_KEY in backend/.env for live feed)",
      "endpoint": "local_validated_telemetry"
    },
    "copernicus": {
      "name": "Copernicus Sentinel-2 Evidence Service",
      "status": "connected",
      "authConfigured": false,
      "notice": "Using Copernicus OpenSearch catalog (Public scenes)"
    },
    "openStreetMap": {
      "status": "connected",
      "provider": "Overpass API / Seeded Infrastructure Catalog"
    },
    "classifier": {
      "status": "operational",
      "mode": "RandomForestClassifier"
    }
  },
  "demoMode": true
}
```

---

### 2.2 Thermal Detections & Anomalies

#### `GET /api/fires`
Retrieves a paginated list of thermal anomalies with optional multi-attribute filters.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 100 | Maximum records to return (capped at 500) |
| `offset` | integer | 0 | Pagination offset |
| `classification` | string | - | Filter by classification label (`FLARE_STACK_PERSISTENT`, `HIGH_CONFIDENCE_INDUSTRIAL_FIRE`, `NATURAL_WILDFIRE_VEGETATION`, etc.) |
| `risk_level` | string | - | Filter by risk rating (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`) |
| `source` | string | - | Satellite telemetry source (`VIIRS_NOAA21_NRT`, `MODIS_NRT`, etc.) |
| `min_frp` | float | - | Minimum Fire Radiative Power (MW) |
| `is_persistent` | boolean | - | Filter by persistence cluster membership (`true` / `false`) |
| `start_date` | string | - | Lower bound acquisition date (`YYYY-MM-DD`) |
| `end_date` | string | - | Upper bound acquisition date (`YYYY-MM-DD`) |

**Sample Response (HTTP 200):**
```json
{
  "total": 12,
  "limit": 100,
  "offset": 0,
  "isDemo": true,
  "sourceNotice": "DEMO DATA / FALLBACK DATA (No FIRMS_MAP_KEY configured in backend/.env)",
  "data": [
    {
      "id": "FIRMS-VIIRS-N21-20260910-1842-19.0062-72.9024",
      "latitude": 19.0062,
      "longitude": 72.9024,
      "location": "Mahul Industrial Refinery Corridor, Mumbai",
      "detectedAt": "2026-09-10T18:42:00+00:00",
      "satellite": "NOAA-21",
      "instrument": "VIIRS",
      "confidence": 94,
      "frp": 74.2,
      "brightness": 348.5,
      "brightT31": 296.2,
      "daynight": "N",
      "source": "VIIRS_NOAA21_NRT",
      "classification": "FLARE_STACK_PERSISTENT",
      "classificationConfidence": 98.0,
      "classificationReasons": [
        "Consistent hotspot recurrence across 4 observation passes confirms persistent thermal emitter",
        "Located 210m from Bharat Petroleum Corporation Ltd (BPCL) Mahul Refinery (Threshold: <= 500m)",
        "VIIRS detection confidence of 94.0% satisfies automated verification standard"
      ],
      "riskLevel": "CRITICAL",
      "riskScore": 88.5,
      "isPersistent": true,
      "persistenceDays": 4,
      "nearbyFacility": {
        "id": "FAC-BOM-001",
        "name": "Bharat Petroleum Corporation Ltd (BPCL) Mahul Refinery",
        "type": "petroleum",
        "distanceMeters": 210,
        "location": "Mahul, Chembur, Mumbai"
      },
      "distanceToFacilityM": 210.0,
      "landCoverClass": "industrial_area",
      "satelliteEvidenceAvailable": true,
      "satelliteSceneId": "S2B_MSIL2A_20260910T053649_N0500_R019_T43QDA",
      "isDemo": true,
      "createdAt": "2026-09-11T07:05:00+00:00"
    }
  ]
}
```

#### `GET /api/fires/latest`
Returns the most recent N detections (default 10, capped at 50).

#### `GET /api/fires/<id>`
Returns complete record for a single detection, including linked industrial facility details and Copernicus scene reference.

#### `POST /api/fires/sync`
Manually triggers ingestion and analysis pipeline.
**Request Body (optional):**
```json
{
  "source": "VIIRS_NOAA21_NRT",
  "bbox": "72.7,18.8,73.2,19.3",
  "days": 2
}
```

---

### 2.3 Industrial Facilities & Infrastructure

#### `GET /api/facilities`
Lists mapped industrial facilities (refineries, power stations, chemical hubs, manufacturing plants).
**Query Parameters:**
- `facility_type`: Filter by facility sector (`chemical`, `petroleum`, `power_plant`, `manufacturing`, etc.)
- `hazard_category`: Filter by hazard level (`CRITICAL`, `HIGH`, `MODERATE`)
- `limit`, `offset`: Pagination controls

#### `GET /api/facilities/nearby`
Finds facilities within a radius of a query coordinate.
**Query Parameters:**
- `lat`: Target latitude (float, required)
- `lon`: Target longitude (float, required)
- `radius_m`: Radius in meters (float, default 2000.0)

**Sample Response (HTTP 200):**
```json
{
  "query": {
    "lat": 19.0062,
    "lon": 72.9024,
    "radiusMeters": 2000.0
  },
  "count": 2,
  "data": [
    {
      "id": "FAC-BOM-001",
      "name": "Bharat Petroleum Corporation Ltd (BPCL) Mahul Refinery",
      "facilityType": "petroleum",
      "distanceMeters": 210.4,
      "latitude": 19.0045,
      "longitude": 72.9038,
      "hazardCategory": "CRITICAL"
    }
  ]
}
```

#### `GET /api/facilities/<id>`
Returns facility details along with recent fire detections within its proximity.

---

### 2.4 Historical Persistence Clustering Engine

#### `GET /api/persistent-sources`
Lists all identified persistent thermal clusters (flare stacks, smelting pots, blast furnaces, kilns).

**Query Parameters:**
- `classification`: `PERSISTENT_INDUSTRIAL_THERMAL_SOURCE`, `INTERMITTENT_THERMAL_SOURCE`, etc.
- `risk_level`: `CRITICAL`, `HIGH`, `MODERATE`
- `min_active_days`: Minimum detection days (integer, e.g. 3)

**Sample Response (HTTP 200):**
```json
{
  "total": 2,
  "data": [
    {
      "id": "PS-001",
      "clusterLatitude": 19.0063,
      "clusterLongitude": 72.9024,
      "location": "Mahul Industrial Refinery Corridor, Mumbai",
      "firstDetected": "2026-09-07T19:05:00+00:00",
      "lastDetected": "2026-09-10T18:42:00+00:00",
      "activeDays": 4,
      "detectionCount": 4,
      "averageFrp": 69.8,
      "maxFrp": 74.2,
      "averageConfidence": 93.0,
      "nearestFacilityId": "FAC-BOM-001",
      "distanceToFacilityM": 210.2,
      "classification": "PERSISTENT_INDUSTRIAL_THERMAL_SOURCE",
      "riskLevel": "CRITICAL",
      "riskScore": 91.1
    }
  ]
}
```

#### `GET /api/persistent-sources/<id>/timeline`
Returns the chronological timeline of individual satellite passes that comprise the persistent source cluster, allowing inspectors to trace thermal evolution across days.

---

### 2.5 Automated Incident Alerting

#### `GET /api/alerts`
Lists system-generated incident alerts.
**Query Parameters:**
- `status`: `ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`
- `severity`: `CRITICAL`, `HIGH`, `MODERATE`, `LOW`
- `is_read`: `true` / `false`

#### `PATCH /api/alerts/<id>/acknowledge`
Marks an alert as acknowledged by a dispatcher.

#### `PATCH /api/alerts/<id>/resolve`
Marks an alert as resolved.

---

### 2.6 Geospatial Analytics & Metrics

#### `GET /api/analytics`
Computes aggregated intelligence across all ingested telemetry:
- Total anomalies & persistent emitters count
- Monitored industrial infrastructure count
- Active alerts count
- Risk level distribution (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`)
- Classification breakdown
- Satellite sensor breakdown (VIIRS vs MODIS)
- Daily anomaly timeline

---

### 2.7 Pipeline & Model Administration

#### `POST /api/admin/pipeline/run`
Trigger a full end-to-end ingestion, clustering, feature extraction, AI classification, and alerting run.

#### `GET /api/admin/pipeline/status`
Returns execution audit logs for pipeline runs.

#### `POST /api/admin/model/retrain`
Retrains the scikit-learn `RandomForestClassifier` on the training dataset and updates `trained_model.joblib`. Returns accuracy, precision, recall, and F1 score.

---

## 3. SIH26162 Compliance Matrix

| SIH Deliverable | Implementation Mechanism | Validation Status |
|-----------------|--------------------------|-------------------|
| NASA FIRMS Integration | `app/services/firms_service.py` with CSV stream parser, `MAP_KEY` support, and offline telemetry | Fully Functional (Tests passing) |
| Industrial Proximity (OSM) | `app/services/osm_service.py` & `app/services/geospatial.py` computing geodesic Haversine distances | Fully Functional (Tests passing) |
| Multi-Temporal Persistence Clustering | `app/services/persistence_engine.py` (500m spatial radius, 3+ active days cluster tracking) | Fully Functional (Tests passing) |
| Land-Cover Context | `app/services/landcover_provider.py` (Copernicus / ESA WorldCover interface) | Fully Functional (Tests passing) |
| Satellite Scene Evidence | `app/services/satellite_evidence.py` (Copernicus Sentinel-2 catalog lookup) | Fully Functional (Tests passing) |
| AI / ML Anomaly Classification | `app/ml/` (`RandomForestClassifier`, 9-feature vector, prototype fallback) | Fully Functional (100% test accuracy) |
| Explainable AI Reasons | `app/ml/explainability.py` generating transparent, factual justification points | Fully Functional (Tests passing) |
| Composite Risk Scoring | `app/services/risk_engine.py` (0–100 non-linear weighted formula) | Fully Functional (Tests passing) |
| Priority Alerting Dispatch | `app/services/alert_engine.py` with incident rule evaluation | Fully Functional (Tests passing) |
| React + Leaflet Frontend | `src/services/api.ts` connected to Flask backend with graceful fallback | Fully Functional (Production Build Passing) |
