// ============================================================
// THERMAL WATCH AI — Mock Data
// ALL data in this file is DEMONSTRATION data only.
// These are simulated records and do NOT represent real
// industrial incidents or confirmed fire events.
// ============================================================

import type {
  Detection,
  Facility,
  Alert,
  DashboardMetrics,
  DetectionActivityPoint,
  SystemServiceInfo,
  PersistentSource,
} from '../types';

// ============================================================
// Mock Detections with Full Geographic Locations
// ============================================================

export const MOCK_DETECTIONS: Detection[] = [
  {
    id: 'FIRMS-DEMO-001',
    latitude: 19.186,
    longitude: 72.847,
    location: 'Goregaon East Industrial Sector, Mumbai',
    riskLevel: 'CRITICAL',
    frp: 185,
    confidence: 92,
    persistenceDays: 3,
    isPersistent: true,
    detectedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    nearbyFacility: {
      id: 'FAC-001',
      name: 'Demo Chemical Processing Plant',
      type: 'Chemical Plant',
      location: 'Goregaon Chemical Zone, Mumbai (19.184°N, 72.849°E)',
      distanceMeters: 230,
    },
    source: 'FIRMS',
  },
  {
    id: 'FIRMS-DEMO-002',
    latitude: 19.076,
    longitude: 72.877,
    location: 'Kurla West Industrial Cluster, Mumbai',
    riskLevel: 'HIGH',
    frp: 112,
    confidence: 85,
    persistenceDays: 5,
    isPersistent: true,
    detectedAt: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    nearbyFacility: {
      id: 'FAC-002',
      name: 'Demo Industrial Zone Alpha',
      type: 'Industrial Zone',
      location: 'Kurla Manufacturing Belt, Mumbai (19.072°N, 72.882°E)',
      distanceMeters: 560,
    },
    source: 'FIRMS',
  },
  {
    id: 'FIRMS-DEMO-003',
    latitude: 18.998,
    longitude: 73.1,
    location: 'Taloja MIDC Industrial Estate, Navi Mumbai',
    riskLevel: 'HIGH',
    frp: 78,
    confidence: 79,
    persistenceDays: 0,
    isPersistent: false,
    detectedAt: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
    nearbyFacility: {
      id: 'FAC-003',
      name: 'Demo Manufacturing Area B',
      type: 'Heavy Engineering',
      location: 'Taloja Phase 2, Navi Mumbai (18.994°N, 73.098°E)',
      distanceMeters: 800,
    },
    source: 'VIIRS',
  },
  {
    id: 'FIRMS-DEMO-004',
    latitude: 19.225,
    longitude: 72.97,
    location: 'Thane-Belapur Road Logistics Hub, Thane',
    riskLevel: 'MEDIUM',
    frp: 42,
    confidence: 68,
    persistenceDays: 1,
    isPersistent: false,
    detectedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    nearbyFacility: {
      id: 'FAC-004',
      name: 'Demo Warehouse Logistics Park',
      type: 'Warehouse',
      location: 'Thane Warehousing Corridor (19.222°N, 72.974°E)',
      distanceMeters: 1200,
    },
    source: 'MODIS',
  },
  {
    id: 'FIRMS-DEMO-005',
    latitude: 18.924,
    longitude: 72.832,
    location: 'Colaba Port Coastal Maritime Terminal, Mumbai',
    riskLevel: 'LOW',
    frp: 18,
    confidence: 55,
    persistenceDays: 0,
    isPersistent: false,
    detectedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    nearbyFacility: null,
    source: 'SENTINEL',
  },
  {
    id: 'FIRMS-DEMO-006',
    latitude: 19.31,
    longitude: 72.755,
    location: 'Vasai-Virar Industrial Complex, Palghar',
    riskLevel: 'MEDIUM',
    frp: 55,
    confidence: 72,
    persistenceDays: 2,
    isPersistent: true,
    detectedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    nearbyFacility: {
      id: 'FAC-005',
      name: 'Demo Alloy & Steel Mill',
      type: 'Steel Plant',
      location: 'Vasai East Foundry Zone (19.308°N, 72.758°E)',
      distanceMeters: 350,
    },
    source: 'FIRMS',
  },
  {
    id: 'FIRMS-DEMO-007',
    latitude: 19.12,
    longitude: 73.05,
    location: 'Mahape Industrial & Tech Corridor, Navi Mumbai',
    riskLevel: 'HIGH',
    frp: 95,
    confidence: 82,
    persistenceDays: 0,
    isPersistent: false,
    detectedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    nearbyFacility: {
      id: 'FAC-006',
      name: 'Demo Petroleum & Gas Refinery',
      type: 'Petroleum Refinery',
      location: 'Mahape Energy Zone (19.118°N, 73.052°E)',
      distanceMeters: 420,
    },
    source: 'VIIRS',
  },
  {
    id: 'FIRMS-DEMO-008',
    latitude: 18.875,
    longitude: 73.15,
    location: 'Panvel-Rasayani Chemical Belt, Raigad',
    riskLevel: 'LOW',
    frp: 22,
    confidence: 58,
    persistenceDays: 0,
    isPersistent: false,
    detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    nearbyFacility: {
      id: 'FAC-008',
      name: 'Demo Fertilizer & Petrochemicals',
      type: 'Chemical Plant',
      location: 'Rasayani MIDC Industrial Area (18.88°N, 73.148°E)',
      distanceMeters: 610,
    },
    source: 'MODIS',
  },
];

// ============================================================
// Mock Industrial Firms with Exact Geographic Locations
// ============================================================

export const MOCK_FACILITIES: Facility[] = [
  {
    id: 'FAC-001',
    name: 'Demo Chemical Processing Plant',
    type: 'chemical',
    location: 'Goregaon East Industrial Sector, Mumbai',
    latitude: 19.184,
    longitude: 72.849,
    osmId: 'osm-node-849201',
  },
  {
    id: 'FAC-002',
    name: 'Demo Industrial Zone Alpha',
    type: 'manufacturing',
    location: 'Kurla West Manufacturing Belt, Mumbai',
    latitude: 19.072,
    longitude: 72.882,
    osmId: 'osm-way-394821',
  },
  {
    id: 'FAC-003',
    name: 'Demo Heavy Engineering Area B',
    type: 'manufacturing',
    location: 'Taloja MIDC Industrial Estate, Navi Mumbai',
    latitude: 18.994,
    longitude: 73.098,
    osmId: 'osm-way-918234',
  },
  {
    id: 'FAC-004',
    name: 'Demo Warehouse Logistics Park',
    type: 'warehouse',
    location: 'Thane-Belapur Freight Corridor, Thane',
    latitude: 19.222,
    longitude: 72.974,
    osmId: 'osm-node-102934',
  },
  {
    id: 'FAC-005',
    name: 'Demo Alloy & Steel Mill',
    type: 'steel',
    location: 'Vasai East Foundry Sector, Palghar',
    latitude: 19.308,
    longitude: 72.758,
    osmId: 'osm-way-558291',
  },
  {
    id: 'FAC-006',
    name: 'Demo Petroleum & Gas Refinery',
    type: 'petroleum',
    location: 'Mahape Energy Zone, Navi Mumbai',
    latitude: 19.118,
    longitude: 73.052,
    osmId: 'osm-way-772910',
  },
  {
    id: 'FAC-007',
    name: 'Demo Thermal Power Station',
    type: 'power_plant',
    location: 'Trombay Coastal Power Hub, Mumbai',
    latitude: 19.002,
    longitude: 72.915,
    osmId: 'osm-node-661823',
  },
  {
    id: 'FAC-008',
    name: 'Demo Fertilizer & Petrochemicals',
    type: 'chemical',
    location: 'Rasayani MIDC Industrial Area, Raigad',
    latitude: 18.88,
    longitude: 73.148,
    osmId: 'osm-way-449102',
  },
];

// ============================================================
// Mock Priority Alerts
// ============================================================

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'ALERT-001',
    severity: 'CRITICAL',
    title: 'High FRP thermal anomaly near chemical plant',
    location: 'Demo Chemical Processing Plant, Goregaon East, Mumbai',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    detectionId: 'FIRMS-DEMO-001',
    isRead: false,
  },
  {
    id: 'ALERT-002',
    severity: 'HIGH',
    title: 'Multi-day persistent thermal hotspot detected',
    location: 'Demo Industrial Zone Alpha, Kurla West, Mumbai',
    timestamp: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    detectionId: 'FIRMS-DEMO-002',
    isRead: false,
  },
  {
    id: 'ALERT-003',
    severity: 'HIGH',
    title: 'New thermal anomaly detected near petroleum storage',
    location: 'Demo Petroleum & Gas Refinery, Mahape, Navi Mumbai',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    detectionId: 'FIRMS-DEMO-007',
    isRead: false,
  },
  {
    id: 'ALERT-004',
    severity: 'MEDIUM',
    title: 'Recurring hotspot at foundry facility',
    location: 'Demo Alloy & Steel Mill, Vasai East, Palghar',
    timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    detectionId: 'FIRMS-DEMO-006',
    isRead: false,
  },
  {
    id: 'ALERT-005',
    severity: 'MEDIUM',
    title: 'Moderate thermal signature near manufacturing zone',
    location: 'Demo Heavy Engineering Area B, Taloja MIDC, Navi Mumbai',
    timestamp: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
    detectionId: 'FIRMS-DEMO-003',
    isRead: true,
  },
];

// ============================================================
// Dashboard KPIs
// ============================================================

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  activeAnomalies: 27,
  activeAnomaliesDelta: 4,
  highRisk: 5,
  highRiskNewToday: 2,
  persistentSources: 8,
  persistentSourcesActive: 3,
  industrialSites: 1248,
};

// ============================================================
// Detection Activity (24 hours)
// ============================================================

export const MOCK_DETECTION_ACTIVITY: DetectionActivityPoint[] = [
  { time: '00:00', detections: 2 },
  { time: '02:00', detections: 1 },
  { time: '04:00', detections: 0 },
  { time: '06:00', detections: 3 },
  { time: '08:00', detections: 7 },
  { time: '10:00', detections: 12 },
  { time: '12:00', detections: 18 },
  { time: '14:00', detections: 15 },
  { time: '16:00', detections: 22 },
  { time: '18:00', detections: 14 },
  { time: '20:00', detections: 8 },
  { time: '22:00', detections: 4 },
];

// ============================================================
// System Status Info
// ============================================================

export const MOCK_SYSTEM_STATUS: SystemServiceInfo[] = [
  { name: 'NASA FIRMS',    key: 'firms',    status: 'connected', lastUpdated: new Date().toISOString() },
  { name: 'OSM',           key: 'osm',      status: 'available', lastUpdated: new Date().toISOString() },
  { name: 'Satellite Data',key: 'satellite',status: 'available', lastUpdated: new Date().toISOString() },
  { name: 'AI Model',      key: 'ai',       status: 'online',    lastUpdated: new Date().toISOString() },
  { name: 'Database',      key: 'database', status: 'healthy',   lastUpdated: new Date().toISOString() },
];

// ============================================================
// Persistent Sources
// ============================================================

export const MOCK_PERSISTENT_SOURCES: PersistentSource[] = [
  {
    id: 'PERSIST-001',
    detectionId: 'FIRMS-DEMO-002',
    firstDetected: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastDetected: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    latitude: 19.076,
    longitude: 72.877,
    riskLevel: 'HIGH',
    facility: {
      id: 'FAC-002',
      name: 'Demo Industrial Zone Alpha',
      type: 'Industrial Zone',
      location: 'Kurla West Manufacturing Belt, Mumbai',
      distanceMeters: 560,
    },
    occurrences: 8,
  },
  {
    id: 'PERSIST-002',
    detectionId: 'FIRMS-DEMO-001',
    firstDetected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastDetected: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    latitude: 19.186,
    longitude: 72.847,
    riskLevel: 'CRITICAL',
    facility: {
      id: 'FAC-001',
      name: 'Demo Chemical Processing Plant',
      type: 'Chemical Plant',
      location: 'Goregaon East Industrial Sector, Mumbai',
      distanceMeters: 230,
    },
    occurrences: 5,
  },
  {
    id: 'PERSIST-003',
    detectionId: 'FIRMS-DEMO-006',
    firstDetected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastDetected: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    latitude: 19.31,
    longitude: 72.755,
    riskLevel: 'MEDIUM',
    facility: {
      id: 'FAC-005',
      name: 'Demo Alloy & Steel Mill',
      type: 'Steel Plant',
      location: 'Vasai East Foundry Sector, Palghar',
      distanceMeters: 350,
    },
    occurrences: 4,
  },
];
