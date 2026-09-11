// ============================================================
// THERMAL WATCH AI — Full Stack API Service Layer
// Connects React UI to Flask REST API backend with resilient
// offline fallback.
// ============================================================

import type {
  Detection,
  Facility,
  Alert,
  DashboardMetrics,
  DetectionActivityPoint,
  SystemServiceInfo,
  PersistentSource,
  ApiResponse,
  RiskLevel,
} from '../types';

import {
  MOCK_DETECTIONS,
  MOCK_FACILITIES,
  MOCK_ALERTS,
  MOCK_DASHBOARD_METRICS,
  MOCK_DETECTION_ACTIVITY,
  MOCK_SYSTEM_STATUS,
  MOCK_PERSISTENT_SOURCES,
} from '../data/mockData';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 3500;

/**
 * Fetch wrapper with timeout and fallback
 */
async function fetchWithTimeout<T>(
  endpoint: string,
  options: RequestInit = {},
  fallback: () => Promise<ApiResponse<T>>
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[API] ${endpoint} returned HTTP ${response.status}. Using fallback.`);
      return fallback();
    }

    const json = await response.json();
    return {
      data: (json.data !== undefined ? json.data : json) as T,
      timestamp: json.timestamp || new Date().toISOString(),
      success: true,
      message: json.message,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    // Backend offline or timeout -> use resilient fallback
    return fallback();
  }
}

function normalizeRiskLevel(level?: string): RiskLevel {
  if (!level) return 'LOW';
  const upper = level.toUpperCase();
  if (upper === 'MODERATE') return 'MEDIUM';
  if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(upper)) {
    return upper as RiskLevel;
  }
  return 'LOW';
}

// ============================================================
// Detection endpoints
// GET /api/fires
// ============================================================

export async function getDetections(): Promise<ApiResponse<Detection[]>> {
  return fetchWithTimeout<Detection[]>(
    '/fires',
    {},
    async () => ({
      data: MOCK_DETECTIONS,
      timestamp: new Date().toISOString(),
      success: true,
    })
  ).then((res) => {
    if (!res.data || !Array.isArray(res.data)) {
      return { ...res, data: MOCK_DETECTIONS };
    }
    const formatted: Detection[] = res.data.map((item: any) => ({
      id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
      location: item.location,
      riskLevel: normalizeRiskLevel(item.riskLevel),
      frp: Number(item.frp || 0),
      confidence: Number(item.confidence || 0),
      persistenceDays: Number(item.persistenceDays || 0),
      isPersistent: Boolean(item.isPersistent),
      detectedAt: item.detectedAt || new Date().toISOString(),
      nearbyFacility: item.nearbyFacility || null,
      source: (item.source && item.source.includes('MODIS')) ? 'MODIS' : 'VIIRS',
      classification: item.classification,
      classificationConfidence: item.classificationConfidence,
      classificationReasons: item.classificationReasons,
      riskScore: item.riskScore,
      landCoverClass: item.landCoverClass,
      satelliteEvidenceAvailable: item.satelliteEvidenceAvailable,
      satelliteSceneId: item.satelliteSceneId,
      isDemo: item.isDemo,
    }));
    return { ...res, data: formatted };
  });
}

export async function getDetectionById(id: string): Promise<ApiResponse<Detection | null>> {
  return fetchWithTimeout<Detection | null>(
    `/fires/${id}`,
    {},
    async () => {
      const found = MOCK_DETECTIONS.find((d) => d.id === id) || null;
      return {
        data: found,
        timestamp: new Date().toISOString(),
        success: true,
      };
    }
  );
}

// ============================================================
// Facility endpoints
// GET /api/facilities
// ============================================================

export async function getFacilities(): Promise<ApiResponse<Facility[]>> {
  return fetchWithTimeout<Facility[]>(
    '/facilities',
    {},
    async () => ({
      data: MOCK_FACILITIES,
      timestamp: new Date().toISOString(),
      success: true,
    })
  );
}

// ============================================================
// Alert endpoints
// GET /api/alerts
// ============================================================

export async function getPriorityAlerts(): Promise<ApiResponse<Alert[]>> {
  return fetchWithTimeout<Alert[]>(
    '/alerts',
    {},
    async () => ({
      data: MOCK_ALERTS,
      timestamp: new Date().toISOString(),
      success: true,
    })
  ).then((res) => {
    if (!res.data || !Array.isArray(res.data)) {
      return { ...res, data: MOCK_ALERTS };
    }
    const formatted: Alert[] = res.data.map((a: any) => ({
      id: a.id,
      severity: normalizeRiskLevel(a.severity),
      title: a.title,
      location: a.location,
      timestamp: a.timestamp || a.createdAt || new Date().toISOString(),
      detectionId: a.detectionId,
      isRead: Boolean(a.isRead),
      message: a.message,
      status: a.status,
    }));
    return { ...res, data: formatted };
  });
}

// ============================================================
// Dashboard metrics
// GET /api/analytics
// ============================================================

export async function getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
  return fetchWithTimeout<any>(
    '/analytics',
    {},
    async () => ({
      data: MOCK_DASHBOARD_METRICS,
      timestamp: new Date().toISOString(),
      success: true,
    })
  ).then((res) => {
    const raw = res.data;
    if (!raw || typeof raw !== 'object' || raw.activeAnomalies !== undefined) {
      return { ...res, data: raw || MOCK_DASHBOARD_METRICS };
    }
    // Map /analytics response to DashboardMetrics interface
    const metrics: DashboardMetrics = {
      activeAnomalies: raw.totalDetections ?? MOCK_DASHBOARD_METRICS.activeAnomalies,
      activeAnomaliesDelta: 2,
      highRisk: (raw.riskDistribution?.HIGH || 0) + (raw.riskDistribution?.CRITICAL || 0),
      highRiskNewToday: raw.riskDistribution?.CRITICAL || 1,
      persistentSources: raw.persistentSourcesCount ?? MOCK_DASHBOARD_METRICS.persistentSources,
      persistentSourcesActive: raw.persistentSourcesCount ?? MOCK_DASHBOARD_METRICS.persistentSourcesActive,
      industrialSites: raw.facilitiesMonitored ?? MOCK_DASHBOARD_METRICS.industrialSites,
    };
    return { ...res, data: metrics };
  });
}

// ============================================================
// Detection activity chart data
// GET /api/analytics
// ============================================================

export async function getDetectionActivity(): Promise<ApiResponse<DetectionActivityPoint[]>> {
  return fetchWithTimeout<any>(
    '/analytics',
    {},
    async () => ({
      data: MOCK_DETECTION_ACTIVITY,
      timestamp: new Date().toISOString(),
      success: true,
    })
  ).then((res) => {
    const raw = res.data;
    if (Array.isArray(raw)) {
      return { ...res, data: raw };
    }
    if (raw?.dailyTimeline && Array.isArray(raw.dailyTimeline) && raw.dailyTimeline.length > 0) {
      const points: DetectionActivityPoint[] = raw.dailyTimeline.map((item: any) => ({
        time: item.date ? item.date.slice(5) : '00:00',
        detections: item.count || 0,
      }));
      return { ...res, data: points };
    }
    return { ...res, data: MOCK_DETECTION_ACTIVITY };
  });
}

// ============================================================
// System status
// GET /api/health
// ============================================================

export async function getSystemStatus(): Promise<ApiResponse<SystemServiceInfo[]>> {
  return fetchWithTimeout<any>(
    '/health',
    {},
    async () => ({
      data: MOCK_SYSTEM_STATUS,
      timestamp: new Date().toISOString(),
      success: true,
    })
  ).then((res) => {
    const raw = res.data;
    if (Array.isArray(raw)) {
      return { ...res, data: raw };
    }
    if (raw?.services) {
      const statusList: SystemServiceInfo[] = [
        {
          name: 'NASA FIRMS Stream',
          key: 'nasa_firms',
          status: raw.services.firms?.status === 'connected' ? 'connected' : 'available',
          lastUpdated: '1m ago',
        },
        {
          name: 'OpenStreetMap Overpass API',
          key: 'osm_overpass',
          status: 'online',
          lastUpdated: 'Real-time cache',
        },
        {
          name: 'AI Classification Engine',
          key: 'ml_classifier',
          status: 'healthy',
          lastUpdated: raw.services.classifier?.mode || 'RandomForest Active',
        },
        {
          name: 'Geospatial DB (PostGIS / SQLite)',
          key: 'geospatial_db',
          status: raw.database?.status === 'healthy' ? 'online' : 'degraded',
          lastUpdated: raw.database?.type || 'Operational',
        },
      ];
      return { ...res, data: statusList };
    }
    return { ...res, data: MOCK_SYSTEM_STATUS };
  });
}

// ============================================================
// Persistent sources
// GET /api/persistent-sources
// ============================================================

export async function getPersistentSources(): Promise<ApiResponse<PersistentSource[]>> {
  return fetchWithTimeout<any>(
    '/persistent-sources',
    {},
    async () => ({
      data: MOCK_PERSISTENT_SOURCES,
      timestamp: new Date().toISOString(),
      success: true,
    })
  ).then((res) => {
    const raw = res.data;
    if (!Array.isArray(raw)) {
      return { ...res, data: MOCK_PERSISTENT_SOURCES };
    }
    const mapped: PersistentSource[] = raw.map((s: any) => ({
      id: s.id,
      detectionId: s.detectionId || s.id,
      firstDetected: s.firstDetected || new Date().toISOString(),
      lastDetected: s.lastDetected || new Date().toISOString(),
      latitude: Number(s.latitude ?? s.clusterLatitude ?? 19.006),
      longitude: Number(s.longitude ?? s.clusterLongitude ?? 72.902),
      riskLevel: normalizeRiskLevel(s.riskLevel),
      facility: s.facility || (s.location || s.nearestFacilityId
        ? {
            id: s.nearestFacilityId || `FAC-${s.id}`,
            name: s.location || 'Industrial Facility',
            type: 'chemical',
            distanceMeters: Math.round(s.distanceToFacilityM || 0),
          }
        : null),
      occurrences: Number(s.occurrences ?? s.detectionCount ?? s.activeDays ?? 1),
    }));
    return { ...res, data: mapped };
  });
}

export async function getPersistentSourceTimeline(id: string): Promise<ApiResponse<any[]>> {
  return fetchWithTimeout<any>(
    `/persistent-sources/${id}/timeline`,
    {},
    async () => ({
      data: [
        { id: `${id}-1`, date: '2026-09-07', time: '19:05', frp: 65.4, brightness: 343.2, confidence: 91, satellite: 'NOAA-20', daynight: 'N' },
        { id: `${id}-2`, date: '2026-09-08', time: '18:50', frp: 71.0, brightness: 346.8, confidence: 95, satellite: 'NOAA-21', daynight: 'N' },
        { id: `${id}-3`, date: '2026-09-09', time: '19:10', frp: 68.5, brightness: 345.1, confidence: 92, satellite: 'NOAA-20', daynight: 'N' },
        { id: `${id}-4`, date: '2026-09-10', time: '18:42', frp: 74.2, brightness: 348.5, confidence: 94, satellite: 'NOAA-21', daynight: 'N' },
      ],
      timestamp: new Date().toISOString(),
      success: true,
    })
  ).then((res) => {
    if (res.data && Array.isArray(res.data.timeline)) {
      return { ...res, data: res.data.timeline };
    }
    if (Array.isArray(res.data)) {
      return res;
    }
    return {
      ...res,
      data: [
        { id: `${id}-1`, date: '2026-09-07', time: '19:05', frp: 65.4, brightness: 343.2, confidence: 91, satellite: 'NOAA-20', daynight: 'N' },
        { id: `${id}-2`, date: '2026-09-08', time: '18:50', frp: 71.0, brightness: 346.8, confidence: 95, satellite: 'NOAA-21', daynight: 'N' },
        { id: `${id}-3`, date: '2026-09-09', time: '19:10', frp: 68.5, brightness: 345.1, confidence: 92, satellite: 'NOAA-20', daynight: 'N' },
        { id: `${id}-4`, date: '2026-09-10', time: '18:42', frp: 74.2, brightness: 348.5, confidence: 94, satellite: 'NOAA-21', daynight: 'N' },
      ],
    };
  });
}
