// ============================================================
// THERMAL WATCH AI — TypeScript Type Definitions
// ============================================================

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SystemServiceStatus = 'connected' | 'available' | 'online' | 'healthy' | 'degraded' | 'offline';

// ============================================================
// User & Authentication
// ============================================================

export type UserRole = 'DISPATCHER' | 'ADMIN' | 'INSPECTOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  stationId: string;
  avatar?: string;
  token?: string;
}

// ============================================================
// Detection / Thermal Anomaly
// ============================================================

export interface NearbyFacility {
  id: string;
  name: string;
  type: string;
  distanceMeters: number;
  location?: string;
}

export interface Detection {
  id: string;
  latitude: number;
  longitude: number;
  location?: string;
  riskLevel: RiskLevel;
  /** Fire Radiative Power in MW */
  frp: number;
  /** Confidence percentage 0–100 */
  confidence: number;
  /** Days the source has been persistently detected */
  persistenceDays: number;
  /** Whether this is classified as a persistent source */
  isPersistent: boolean;
  detectedAt: string; // ISO 8601
  nearbyFacility: NearbyFacility | null;
  source: 'FIRMS' | 'SENTINEL' | 'MODIS' | 'VIIRS';
}

// ============================================================
// Industrial Facility / Firm
// ============================================================

export type FacilityType =
  | 'chemical'
  | 'petroleum'
  | 'manufacturing'
  | 'power_plant'
  | 'warehouse'
  | 'steel'
  | 'textile'
  | 'paper'
  | 'food_processing'
  | 'other';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location: string;
  latitude: number;
  longitude: number;
  /** OSM node/way ID */
  osmId?: string;
}

// ============================================================
// Priority Alert
// ============================================================

export interface Alert {
  id: string;
  severity: RiskLevel;
  title: string;
  location: string;
  timestamp: string; // ISO 8601
  detectionId: string;
  isRead: boolean;
}

// ============================================================
// Dashboard Metrics
// ============================================================

export interface DashboardMetrics {
  activeAnomalies: number;
  activeAnomaliesDelta: number; // change in last 24h
  highRisk: number;
  highRiskNewToday: number;
  persistentSources: number;
  persistentSourcesActive: number;
  industrialSites: number;
}

// ============================================================
// Detection Activity Chart
// ============================================================

export interface DetectionActivityPoint {
  time: string; // e.g. "00:00"
  detections: number;
}

// ============================================================
// System Status
// ============================================================

export interface SystemServiceInfo {
  name: string;
  key: string;
  status: SystemServiceStatus;
  lastUpdated: string;
}

// ============================================================
// Persistent Source
// ============================================================

export interface PersistentSource {
  id: string;
  detectionId: string;
  firstDetected: string;
  lastDetected: string;
  latitude: number;
  longitude: number;
  riskLevel: RiskLevel;
  facility: NearbyFacility | null;
  occurrences: number;
}

// ============================================================
// API Response Wrapper
// ============================================================

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  success: boolean;
  message?: string;
}
