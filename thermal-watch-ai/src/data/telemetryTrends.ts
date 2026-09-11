// ============================================================
// NTIS — Continuous Telemetry Trends & Historical Datasets
// Supports 24h, 7d, 30d, and extended 90-day multi-satellite
// radiometric time-series with sector classifications.
// ============================================================

import type { DetectionActivityPoint } from '../types'

export type RangeOption = '24h' | '7d' | '30d' | '90d'
export type TelemetryMetricView = 'stacked' | 'total' | 'frp'

// ── 24-Hour Hourly Telemetry (Diurnal Satellite Overpasses) ──
export const HOURLY_24H_TELEMETRY: DetectionActivityPoint[] = [
  { time: '00:00', detections: 7,  industrial: 5,  biomass: 2,  avgFrp: 34.2, peakFrp: 58.0,  criticalCount: 0, confidence: 91, fullDate: 'Today 00:00 IST' },
  { time: '01:00', detections: 5,  industrial: 4,  biomass: 1,  avgFrp: 31.5, peakFrp: 49.0,  criticalCount: 0, confidence: 90, fullDate: 'Today 01:00 IST' },
  { time: '02:00', detections: 4,  industrial: 3,  biomass: 1,  avgFrp: 29.8, peakFrp: 46.0,  criticalCount: 0, confidence: 88, fullDate: 'Today 02:00 IST' },
  { time: '03:00', detections: 3,  industrial: 3,  biomass: 0,  avgFrp: 28.4, peakFrp: 42.0,  criticalCount: 0, confidence: 89, fullDate: 'Today 03:00 IST' },
  { time: '04:00', detections: 4,  industrial: 3,  biomass: 1,  avgFrp: 30.1, peakFrp: 45.0,  criticalCount: 0, confidence: 90, fullDate: 'Today 04:00 IST' },
  { time: '05:00', detections: 6,  industrial: 4,  biomass: 2,  avgFrp: 33.6, peakFrp: 52.0,  criticalCount: 0, confidence: 92, fullDate: 'Today 05:00 IST' },
  { time: '06:00', detections: 9,  industrial: 6,  biomass: 3,  avgFrp: 37.0, peakFrp: 61.0,  criticalCount: 1, confidence: 93, fullDate: 'Today 06:00 IST' },
  { time: '07:00', detections: 14, industrial: 9,  biomass: 5,  avgFrp: 40.5, peakFrp: 68.0,  criticalCount: 1, confidence: 94, fullDate: 'Today 07:00 IST' },
  { time: '08:00', detections: 19, industrial: 12, biomass: 7,  avgFrp: 44.2, peakFrp: 74.0,  criticalCount: 1, confidence: 93, fullDate: 'Today 08:00 IST' },
  { time: '09:00', detections: 24, industrial: 15, biomass: 9,  avgFrp: 47.8, peakFrp: 82.0,  criticalCount: 2, confidence: 95, fullDate: 'Today 09:00 IST' },
  { time: '10:00', detections: 29, industrial: 18, biomass: 11, avgFrp: 52.3, peakFrp: 91.0,  criticalCount: 2, confidence: 94, fullDate: 'Today 10:00 IST' },
  { time: '11:00', detections: 34, industrial: 21, biomass: 13, avgFrp: 58.1, peakFrp: 104.0, criticalCount: 3, confidence: 96, fullDate: 'Today 11:00 IST' },
  { time: '12:00', detections: 39, industrial: 24, biomass: 15, avgFrp: 63.7, peakFrp: 112.0, criticalCount: 3, confidence: 97, fullDate: 'Today 12:00 IST' },
  { time: '13:00', detections: 44, industrial: 27, biomass: 17, avgFrp: 71.4, peakFrp: 128.0, criticalCount: 4, confidence: 98, fullDate: 'Today 13:00 IST' },
  { time: '14:00', detections: 48, industrial: 30, biomass: 18, avgFrp: 78.9, peakFrp: 146.0, criticalCount: 5, confidence: 98, fullDate: 'Today 14:00 IST (Peak Overpass)' },
  { time: '15:00', detections: 41, industrial: 26, biomass: 15, avgFrp: 69.2, peakFrp: 119.0, criticalCount: 4, confidence: 97, fullDate: 'Today 15:00 IST' },
  { time: '16:00', detections: 32, industrial: 21, biomass: 11, avgFrp: 59.5, peakFrp: 98.0,  criticalCount: 2, confidence: 95, fullDate: 'Today 16:00 IST' },
  { time: '17:00', detections: 25, industrial: 17, biomass: 8,  avgFrp: 50.8, peakFrp: 85.0,  criticalCount: 2, confidence: 93, fullDate: 'Today 17:00 IST' },
  { time: '18:00', detections: 21, industrial: 14, biomass: 7,  avgFrp: 46.1, peakFrp: 77.0,  criticalCount: 1, confidence: 92, fullDate: 'Today 18:00 IST' },
  { time: '19:00', detections: 17, industrial: 12, biomass: 5,  avgFrp: 43.4, peakFrp: 71.0,  criticalCount: 1, confidence: 91, fullDate: 'Today 19:00 IST' },
  { time: '20:00', detections: 15, industrial: 11, biomass: 4,  avgFrp: 41.0, peakFrp: 67.0,  criticalCount: 1, confidence: 91, fullDate: 'Today 20:00 IST' },
  { time: '21:00', detections: 12, industrial: 9,  biomass: 3,  avgFrp: 38.6, peakFrp: 62.0,  criticalCount: 0, confidence: 90, fullDate: 'Today 21:00 IST' },
  { time: '22:00', detections: 9,  industrial: 7,  biomass: 2,  avgFrp: 36.0, peakFrp: 55.0,  criticalCount: 0, confidence: 90, fullDate: 'Today 22:00 IST' },
  { time: '23:00', detections: 8,  industrial: 6,  biomass: 2,  avgFrp: 34.5, peakFrp: 51.0,  criticalCount: 0, confidence: 89, fullDate: 'Today 23:00 IST' },
]

// ── 7-Day Daily Telemetry ─────────────────────────────────────
export const DAILY_7D_TELEMETRY: DetectionActivityPoint[] = [
  { time: 'Sep 05', detections: 138, industrial: 88,  biomass: 50, avgFrp: 45.4, peakFrp: 135.0, criticalCount: 12, confidence: 93, fullDate: 'Friday, Sep 05, 2026' },
  { time: 'Sep 06', detections: 126, industrial: 82,  biomass: 44, avgFrp: 43.1, peakFrp: 118.0, criticalCount: 9,  confidence: 92, fullDate: 'Saturday, Sep 06, 2026' },
  { time: 'Sep 07', detections: 115, industrial: 76,  biomass: 39, avgFrp: 40.8, peakFrp: 110.0, criticalCount: 8,  confidence: 91, fullDate: 'Sunday, Sep 07, 2026' },
  { time: 'Sep 08', detections: 158, industrial: 102, biomass: 56, avgFrp: 48.9, peakFrp: 142.0, criticalCount: 15, confidence: 95, fullDate: 'Monday, Sep 08, 2026' },
  { time: 'Sep 09', detections: 174, industrial: 112, biomass: 62, avgFrp: 52.4, peakFrp: 155.0, criticalCount: 17, confidence: 96, fullDate: 'Tuesday, Sep 09, 2026' },
  { time: 'Sep 10', detections: 194, industrial: 124, biomass: 70, avgFrp: 57.1, peakFrp: 168.0, criticalCount: 21, confidence: 97, fullDate: 'Wednesday, Sep 10, 2026' },
  { time: 'Sep 11', detections: 182, industrial: 116, biomass: 66, avgFrp: 54.3, peakFrp: 159.0, criticalCount: 19, confidence: 96, fullDate: 'Thursday, Sep 11, 2026 (Live)' },
]

// ── 30-Day Daily Telemetry ────────────────────────────────────
export const DAILY_30D_TELEMETRY: DetectionActivityPoint[] = [
  { time: 'Aug 13', detections: 112, industrial: 72, biomass: 40, avgFrp: 41.2, fullDate: 'Aug 13, 2026' },
  { time: 'Aug 14', detections: 125, industrial: 79, biomass: 46, avgFrp: 43.0, fullDate: 'Aug 14, 2026' },
  { time: 'Aug 15', detections: 108, industrial: 71, biomass: 37, avgFrp: 40.1, fullDate: 'Aug 15, 2026' },
  { time: 'Aug 16', detections: 132, industrial: 84, biomass: 48, avgFrp: 44.5, fullDate: 'Aug 16, 2026' },
  { time: 'Aug 17', detections: 145, industrial: 92, biomass: 53, avgFrp: 46.8, fullDate: 'Aug 17, 2026' },
  { time: 'Aug 18', detections: 154, industrial: 98, biomass: 56, avgFrp: 48.0, fullDate: 'Aug 18, 2026' },
  { time: 'Aug 19', detections: 148, industrial: 95, biomass: 53, avgFrp: 47.1, fullDate: 'Aug 19, 2026' },
  { time: 'Aug 20', detections: 162, industrial: 103, biomass: 59, avgFrp: 49.6, fullDate: 'Aug 20, 2026' },
  { time: 'Aug 21', detections: 171, industrial: 108, biomass: 63, avgFrp: 51.3, fullDate: 'Aug 21, 2026' },
  { time: 'Aug 22', detections: 159, industrial: 101, biomass: 58, avgFrp: 49.0, fullDate: 'Aug 22, 2026' },
  { time: 'Aug 23', detections: 140, industrial: 89, biomass: 51, avgFrp: 45.8, fullDate: 'Aug 23, 2026' },
  { time: 'Aug 24', detections: 188, industrial: 118, biomass: 70, avgFrp: 55.4, fullDate: 'Aug 24, 2026' },
  { time: 'Aug 25', detections: 195, industrial: 122, biomass: 73, avgFrp: 57.0, fullDate: 'Aug 25, 2026' },
  { time: 'Aug 26', detections: 178, industrial: 112, biomass: 66, avgFrp: 53.2, fullDate: 'Aug 26, 2026' },
  { time: 'Aug 27', detections: 167, industrial: 106, biomass: 61, avgFrp: 50.9, fullDate: 'Aug 27, 2026' },
  { time: 'Aug 28', detections: 152, industrial: 97, biomass: 55, avgFrp: 47.8, fullDate: 'Aug 28, 2026' },
  { time: 'Aug 29', detections: 144, industrial: 92, biomass: 52, avgFrp: 46.1, fullDate: 'Aug 29, 2026' },
  { time: 'Aug 30', detections: 139, industrial: 89, biomass: 50, avgFrp: 45.0, fullDate: 'Aug 30, 2026' },
  { time: 'Aug 31', detections: 165, industrial: 105, biomass: 60, avgFrp: 50.2, fullDate: 'Aug 31, 2026' },
  { time: 'Sep 01', detections: 173, industrial: 110, biomass: 63, avgFrp: 51.8, fullDate: 'Sep 01, 2026' },
  { time: 'Sep 02', detections: 181, industrial: 114, biomass: 67, avgFrp: 53.5, fullDate: 'Sep 02, 2026' },
  { time: 'Sep 03', detections: 169, industrial: 107, biomass: 62, avgFrp: 51.0, fullDate: 'Sep 03, 2026' },
  { time: 'Sep 04', detections: 156, industrial: 99, biomass: 57, avgFrp: 48.7, fullDate: 'Sep 04, 2026' },
  { time: 'Sep 05', detections: 138, industrial: 88, biomass: 50, avgFrp: 45.4, fullDate: 'Sep 05, 2026' },
  { time: 'Sep 06', detections: 126, industrial: 82, biomass: 44, avgFrp: 43.1, fullDate: 'Sep 06, 2026' },
  { time: 'Sep 07', detections: 115, industrial: 76, biomass: 39, avgFrp: 40.8, fullDate: 'Sep 07, 2026' },
  { time: 'Sep 08', detections: 158, industrial: 102, biomass: 56, avgFrp: 48.9, fullDate: 'Sep 08, 2026' },
  { time: 'Sep 09', detections: 174, industrial: 112, biomass: 62, avgFrp: 52.4, fullDate: 'Sep 09, 2026' },
  { time: 'Sep 10', detections: 194, industrial: 124, biomass: 70, avgFrp: 57.1, fullDate: 'Sep 10, 2026' },
  { time: 'Sep 11', detections: 182, industrial: 116, biomass: 66, avgFrp: 54.3, fullDate: 'Sep 11, 2026' },
]

// ── 90-Day Extended Seasonal Telemetry (June 14 - September 11) ──
// Captures:
// 1. Late Summer Pre-Monsoon Peak (June 14-30): Intense thermal activity
// 2. Active Southwest Monsoon (July): Cloud attenuation + rain dampening open fires; industrial continuous base
// 3. Post-Monsoon Clearance & Early Kharif harvest (August - September): Rising detections
export const EXTENDED_90D_TELEMETRY: DetectionActivityPoint[] = [
  // June (Summer baseline & dry season)
  { time: 'Jun 14', detections: 218, industrial: 134, biomass: 84, avgFrp: 59.8, fullDate: 'Jun 14, 2026 — Pre-Monsoon Peak' },
  { time: 'Jun 17', detections: 226, industrial: 138, biomass: 88, avgFrp: 61.2, fullDate: 'Jun 17, 2026' },
  { time: 'Jun 20', detections: 212, industrial: 131, biomass: 81, avgFrp: 58.5, fullDate: 'Jun 20, 2026' },
  { time: 'Jun 23', detections: 198, industrial: 124, biomass: 74, avgFrp: 55.3, fullDate: 'Jun 23, 2026' },
  { time: 'Jun 26', detections: 184, industrial: 118, biomass: 66, avgFrp: 52.7, fullDate: 'Jun 26, 2026' },
  { time: 'Jun 29', detections: 169, industrial: 110, biomass: 59, avgFrp: 49.6, fullDate: 'Jun 29, 2026' },
  // July (Monsoon Cloud Attenuation & Heavy Rains: Ground fires suppressed, industrial stacks steady)
  { time: 'Jul 02', detections: 142, industrial: 98,  biomass: 44, avgFrp: 45.0, fullDate: 'Jul 02, 2026 — Monsoon Influx' },
  { time: 'Jul 05', detections: 118, industrial: 86,  biomass: 32, avgFrp: 41.5, fullDate: 'Jul 05, 2026' },
  { time: 'Jul 08', detections: 96,  industrial: 74,  biomass: 22, avgFrp: 38.2, fullDate: 'Jul 08, 2026 — Dense Cloud Cover' },
  { time: 'Jul 11', detections: 84,  industrial: 68,  biomass: 16, avgFrp: 36.1, fullDate: 'Jul 11, 2026' },
  { time: 'Jul 14', detections: 92,  industrial: 72,  biomass: 20, avgFrp: 37.4, fullDate: 'Jul 14, 2026' },
  { time: 'Jul 17', detections: 104, industrial: 79,  biomass: 25, avgFrp: 39.8, fullDate: 'Jul 17, 2026' },
  { time: 'Jul 20', detections: 88,  industrial: 70,  biomass: 18, avgFrp: 36.9, fullDate: 'Jul 20, 2026' },
  { time: 'Jul 23', detections: 98,  industrial: 75,  biomass: 23, avgFrp: 38.6, fullDate: 'Jul 23, 2026' },
  { time: 'Jul 26', detections: 112, industrial: 82,  biomass: 30, avgFrp: 41.0, fullDate: 'Jul 26, 2026' },
  { time: 'Jul 29', detections: 124, industrial: 88,  biomass: 36, avgFrp: 43.2, fullDate: 'Jul 29, 2026' },
  // August (Break in monsoon, increasing clear-sky satellite detection)
  { time: 'Aug 01', detections: 135, industrial: 92,  biomass: 43, avgFrp: 44.8, fullDate: 'Aug 01, 2026' },
  { time: 'Aug 04', detections: 148, industrial: 99,  biomass: 49, avgFrp: 47.1, fullDate: 'Aug 04, 2026' },
  { time: 'Aug 07', detections: 156, industrial: 102, biomass: 54, avgFrp: 48.5, fullDate: 'Aug 07, 2026' },
  { time: 'Aug 10', detections: 143, industrial: 95,  biomass: 48, avgFrp: 46.2, fullDate: 'Aug 10, 2026' },
  { time: 'Aug 13', detections: 112, industrial: 72,  biomass: 40, avgFrp: 41.2, fullDate: 'Aug 13, 2026' },
  { time: 'Aug 16', detections: 132, industrial: 84,  biomass: 48, avgFrp: 44.5, fullDate: 'Aug 16, 2026' },
  { time: 'Aug 19', detections: 148, industrial: 95,  biomass: 53, avgFrp: 47.1, fullDate: 'Aug 19, 2026' },
  { time: 'Aug 22', detections: 159, industrial: 101, biomass: 58, avgFrp: 49.0, fullDate: 'Aug 22, 2026' },
  { time: 'Aug 25', detections: 195, industrial: 122, biomass: 73, avgFrp: 57.0, fullDate: 'Aug 25, 2026' },
  { time: 'Aug 28', detections: 152, industrial: 97,  biomass: 55, avgFrp: 47.8, fullDate: 'Aug 28, 2026' },
  { time: 'Aug 31', detections: 165, industrial: 105, biomass: 60, avgFrp: 50.2, fullDate: 'Aug 31, 2026' },
  // September (Post-Monsoon skies, early residue burning, full industrial cadence)
  { time: 'Sep 03', detections: 169, industrial: 107, biomass: 62, avgFrp: 51.0, fullDate: 'Sep 03, 2026' },
  { time: 'Sep 06', detections: 126, industrial: 82,  biomass: 44, avgFrp: 43.1, fullDate: 'Sep 06, 2026' },
  { time: 'Sep 09', detections: 174, industrial: 112, biomass: 62, avgFrp: 52.4, fullDate: 'Sep 09, 2026' },
  { time: 'Sep 10', detections: 194, industrial: 124, biomass: 70, avgFrp: 57.1, fullDate: 'Sep 10, 2026 — Weekly Spike' },
  { time: 'Sep 11', detections: 182, industrial: 116, biomass: 66, avgFrp: 54.3, fullDate: 'Sep 11, 2026 (Live Current)' },
]

/**
 * Returns telemetry data for requested range.
 */
export function getTelemetryForRange(range: RangeOption): DetectionActivityPoint[] {
  switch (range) {
    case '24h':
      return HOURLY_24H_TELEMETRY
    case '7d':
      return DAILY_7D_TELEMETRY
    case '30d':
      return DAILY_30D_TELEMETRY
    case '90d':
      return EXTENDED_90D_TELEMETRY
    default:
      return HOURLY_24H_TELEMETRY
  }
}

export interface TelemetrySummaryMetrics {
  totalDetections: number
  peakPoint: DetectionActivityPoint
  industrialTotal: number
  biomassTotal: number
  industrialPct: number
  biomassPct: number
  avgFrp: number
  criticalTotal: number
  timeframeLabel: string
  trendDescription: string
}

/**
 * Computes deep aggregate summary metrics for the active telemetry timeframe.
 */
export function calculateTelemetryMetrics(data: DetectionActivityPoint[], range: RangeOption): TelemetrySummaryMetrics {
  if (!data || data.length === 0) {
    return {
      totalDetections: 0,
      peakPoint: { time: '--', detections: 0 },
      industrialTotal: 0,
      biomassTotal: 0,
      industrialPct: 0,
      biomassPct: 0,
      avgFrp: 0,
      criticalTotal: 0,
      timeframeLabel: '',
      trendDescription: '',
    }
  }

  let totalDetections = 0
  let industrialTotal = 0
  let biomassTotal = 0
  let weightedFrpSum = 0
  let criticalTotal = 0
  let peakPoint = data[0]

  for (const pt of data) {
    totalDetections += pt.detections
    const ind = pt.industrial ?? Math.round(pt.detections * 0.63)
    const bio = pt.biomass ?? (pt.detections - ind)
    industrialTotal += ind
    biomassTotal += bio
    weightedFrpSum += (pt.avgFrp ?? 45.0) * pt.detections
    criticalTotal += pt.criticalCount ?? Math.max(0, Math.round(pt.detections * 0.1))

    if (pt.detections > peakPoint.detections) {
      peakPoint = pt
    }
  }

  const industrialPct = totalDetections > 0 ? Math.round((industrialTotal / totalDetections) * 100) : 0
  const biomassPct = totalDetections > 0 ? 100 - industrialPct : 0
  const avgFrp = totalDetections > 0 ? Math.round((weightedFrpSum / totalDetections) * 10) / 10 : 0

  let timeframeLabel = 'Last 24 Hours'
  let trendDescription = ''

  if (range === '24h') {
    timeframeLabel = 'Last 24 Hours (Hourly Stream)'
    trendDescription = 'Peak thermal intensity occurred at 14:00 IST (48 hotspots, 78.9 MW) coinciding with afternoon Aqua/Terra MODIS & VIIRS satellite passes and peak industrial furnace cycles.'
  } else if (range === '7d') {
    timeframeLabel = 'Past 7 Days (Daily Telemetry)'
    trendDescription = 'Weekly telemetry shows consistent industrial baseline (~115/day) with mid-week surges in Maharashtra & Gujarat petrochemical belts.'
  } else if (range === '30d') {
    timeframeLabel = 'Past 30 Days (Daily Aggregations)'
    trendDescription = 'Persistent industrial emitters contributed 62% of all detections; clear skies in late August yielded high sensor confidence (>95%).'
  } else if (range === '90d') {
    timeframeLabel = '90-Day Extended Surveillance (Seasonal Cycles)'
    trendDescription = 'Extended 3-month analysis captures the July monsoon cloud dampening period (July 08-20) followed by sharp post-monsoon clearing and industrial resumption in August-September.'
  }

  return {
    totalDetections,
    peakPoint,
    industrialTotal,
    biomassTotal,
    industrialPct,
    biomassPct,
    avgFrp,
    criticalTotal,
    timeframeLabel,
    trendDescription,
  }
}
