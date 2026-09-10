// ============================================================
// THERMAL WATCH AI — Mock Service / API Layer
// This module simulates the future Flask REST API interface.
// Replace the mock implementations with real fetch() calls
// when the backend is ready. UI components should NOT change.
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

// ============================================================
// Simulated network delay (ms)
// ============================================================
const MOCK_DELAY = 400;

function mockDelay<T>(data: T): Promise<ApiResponse<T>> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          data,
          timestamp: new Date().toISOString(),
          success: true,
        }),
      MOCK_DELAY
    )
  );
}

// ============================================================
// Detection endpoints
// Future: GET /api/v1/detections
// ============================================================

export async function getDetections(): Promise<ApiResponse<Detection[]>> {
  return mockDelay(MOCK_DETECTIONS);
}

export async function getDetectionById(id: string): Promise<ApiResponse<Detection | null>> {
  const detection = MOCK_DETECTIONS.find((d) => d.id === id) ?? null;
  return mockDelay(detection);
}

// ============================================================
// Facility endpoints
// Future: GET /api/v1/facilities
// ============================================================

export async function getFacilities(): Promise<ApiResponse<Facility[]>> {
  return mockDelay(MOCK_FACILITIES);
}

// ============================================================
// Alert endpoints
// Future: GET /api/v1/alerts
// ============================================================

export async function getPriorityAlerts(): Promise<ApiResponse<Alert[]>> {
  const sorted = [...MOCK_ALERTS].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return mockDelay(sorted);
}

// ============================================================
// Dashboard metrics
// Future: GET /api/v1/dashboard/metrics
// ============================================================

export async function getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
  return mockDelay(MOCK_DASHBOARD_METRICS);
}

// ============================================================
// Detection activity chart data
// Future: GET /api/v1/dashboard/activity?range=24h
// ============================================================

export async function getDetectionActivity(): Promise<ApiResponse<DetectionActivityPoint[]>> {
  return mockDelay(MOCK_DETECTION_ACTIVITY);
}

// ============================================================
// System status
// Future: GET /api/v1/system/status
// ============================================================

export async function getSystemStatus(): Promise<ApiResponse<SystemServiceInfo[]>> {
  return mockDelay(MOCK_SYSTEM_STATUS);
}

// ============================================================
// Persistent sources
// Future: GET /api/v1/persistent-sources
// ============================================================

export async function getPersistentSources(): Promise<ApiResponse<PersistentSource[]>> {
  return mockDelay(MOCK_PERSISTENT_SOURCES);
}
