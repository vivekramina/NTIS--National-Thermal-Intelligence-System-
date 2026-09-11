import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame,
  AlertTriangle,
  Activity,
  Building2,
  RefreshCw,
  Clock,
  Maximize2,
  RotateCcw,
  Expand,
  X,
  Square,
  RectangleHorizontal,
  Radio,
} from 'lucide-react'
import MetricCard from '../components/dashboard/MetricCard'
import PriorityAlerts from '../components/dashboard/PriorityAlerts'
import DetectionActivity from '../components/dashboard/DetectionActivity'
import SystemStatus from '../components/dashboard/SystemStatus'
import type { Detection, Facility, DashboardMetrics, DetectionActivityPoint, SystemServiceInfo } from '../types'
import { getDetections, getFacilities, getDashboardMetrics, getDetectionActivity, getSystemStatus } from '../services/api'
import { useApp } from '../context/AppContext'
import { formatNumber, cn } from '../lib/utils'

const ThermalMap = lazy(() => import('../components/map/ThermalMap'))

type AspectMode = 'square' | 'wide'
type MapFilter = 'ALL' | 'CRITICAL' | 'PERSISTENT' | 'INDUSTRIAL'

export default function Overview() {
  const navigate = useNavigate()
  const { lastRefreshTime, isRefreshing, refreshData, addToast } = useApp()

  const [detections,   setDetections]   = useState<Detection[]>([])
  const [facilities,   setFacilities]   = useState<Facility[]>([])
  const [metrics,      setMetrics]      = useState<DashboardMetrics | null>(null)
  const [activityData, setActivityData] = useState<DetectionActivityPoint[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemServiceInfo[]>([])
  const [loading,      setLoading]      = useState(true)

  // Map Controls & Filters
  const [aspectMode, setAspectMode] = useState<AspectMode>('square')
  const [mapFilter, setMapFilter] = useState<MapFilter>('ALL')
  const [isFullscreenMap, setIsFullscreenMap] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.03, 72.95])
  const [mapZoom, setMapZoom] = useState<number>(11)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [a, b, d, e, f] = await Promise.all([
        getDetections(),
        getFacilities(),
        getDashboardMetrics(),
        getDetectionActivity(),
        getSystemStatus(),
      ])
      setDetections(a.data)
      setFacilities(b.data)
      setMetrics(d.data)
      setActivityData(e.data)
      setSystemStatus(f.data)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      addToast('Sync Error', 'Failed to synchronize with backend telemetry feed', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    loadData()
  }, [loadData, lastRefreshTime])

  function getLastUpdatedLabel() {
    const diffMin = Math.floor((Date.now() - lastRefreshTime.getTime()) / 60000)
    if (diffMin < 1) return 'just now'
    if (diffMin === 1) return '1m ago'
    return `${diffMin}m ago`
  }

  const [viewResetTrigger, setViewResetTrigger] = useState(0)

  const resetMapView = () => {
    setMapFilter('ALL')
    setMapCenter([19.03, 72.95])
    setMapZoom(11)
    setViewResetTrigger((prev) => prev + 1)
  }

  const handleFilterChange = (filterId: MapFilter) => {
    if (mapFilter === filterId) {
      setViewResetTrigger((prev) => prev + 1)
    } else {
      setMapFilter(filterId)
    }
  }

  // Pre-calculated counts for filter tabs
  const filterCounts = useMemo(() => {
    let critical = 0
    let persistent = 0
    let industrial = 0
    for (const d of detections) {
      if (d.riskLevel === 'CRITICAL') critical++
      if (d.isPersistent || (d.persistenceDays != null && d.persistenceDays >= 2)) persistent++
      if (
        (d.nearbyFacility && d.nearbyFacility.distanceMeters <= 500) ||
        ((d as any).distanceToFacilityM != null && (d as any).distanceToFacilityM <= 500)
      ) {
        industrial++
      }
    }
    return {
      ALL: detections.length,
      CRITICAL: critical,
      PERSISTENT: persistent,
      INDUSTRIAL: industrial,
    }
  }, [detections])

  // Filtered detections displayed on the map
  const mapDetections = useMemo(() => {
    return detections.filter((d) => {
      if (mapFilter === 'CRITICAL') return d.riskLevel === 'CRITICAL'
      if (mapFilter === 'PERSISTENT') return Boolean(d.isPersistent || (d.persistenceDays != null && d.persistenceDays >= 2))
      if (mapFilter === 'INDUSTRIAL') {
        return Boolean(
          (d.nearbyFacility && d.nearbyFacility.distanceMeters <= 500) ||
          ((d as any).distanceToFacilityM != null && (d as any).distanceToFacilityM <= 500)
        )
      }
      return true
    })
  }, [detections, mapFilter])

  return (
    <div className="w-full min-h-full flex flex-col gap-4.5 p-5 pb-12 animate-fade-in relative z-0">
      
      {/* ── Operational Status & Sync Bar ───────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel px-4 py-3 rounded-2xl border border-white/80 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full shadow-2xs">
            <Radio size={12} className="text-emerald-600 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wide">Surveillance Active</span>
          </div>
          <span className="text-gray-300 hidden sm:inline">•</span>
          <span className="text-[12px] font-semibold text-gray-700">
            Corridor: <span className="font-bold text-gray-900">Mumbai–Thane–Navi Mumbai Industrial Belt</span>
          </span>
          <span className="text-gray-300 hidden sm:inline">•</span>
          <span className="text-[12px] text-gray-500">
            {detections.length} Anomaly Hotspots Synchronized
          </span>
        </div>

        <div className="flex items-center gap-2.5 ml-auto shrink-0">
          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold glass-pill px-2.5 py-1 rounded-xl border border-white/80">
            <Clock size={12} className="text-gray-400" />
            <span>Synced {getLastUpdatedLabel()}</span>
          </div>
          <button
            onClick={() => refreshData()}
            disabled={isRefreshing || loading}
            className={cn(
              'flex items-center gap-1.5 h-8 px-3.5 text-[12px] font-bold rounded-xl border transition-all duration-150 shadow-2xs active:scale-95',
              'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-blue-500/15',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <RefreshCw size={13} className={cn(isRefreshing && 'animate-spin')} />
            <span>Sync Feeds</span>
          </button>
        </div>
      </div>

      {/* ── Top Priority KPI Intelligence Cards ─────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-[96px] rounded-2xl bg-gray-200/50 animate-pulse" />
          ))
        ) : (
          <>
            <MetricCard
              iconImage="/icons/kpi-active-anomalies.png"
              icon={Flame}
              iconClassName="bg-orange-500/10 text-orange-600 border border-orange-200/60"
              label="Active Thermal Anomalies"
              value={metrics ? formatNumber(metrics.activeAnomalies) : '—'}
              delta={metrics ? `+${metrics.activeAnomaliesDelta} (24h)` : undefined}
              deltaClassName="text-orange-700 bg-orange-500/10 border-orange-200/60"
              onClick={() => navigate('/detections')}
            />
            <MetricCard
              iconImage="/icons/kpi-critical-hazards.png"
              icon={AlertTriangle}
              iconClassName="bg-red-500/10 text-red-600 border border-red-200/60"
              label="Critical / High Hazards"
              value={metrics ? formatNumber(metrics.highRisk) : '—'}
              delta={metrics ? `${metrics.highRiskNewToday} require triage` : undefined}
              deltaClassName="text-red-700 bg-red-500/10 border-red-200/60"
              onClick={() => navigate('/detections')}
            />
            <MetricCard
              iconImage="/icons/kpi-persistent-sources.png"
              icon={Activity}
              iconClassName="bg-amber-500/10 text-amber-600 border border-amber-200/60"
              label="Persistent Sources"
              value={metrics ? formatNumber(metrics.persistentSources) : '—'}
              delta="Flare stacks / Furnaces"
              deltaClassName="text-amber-700 bg-amber-500/10 border-amber-200/60"
              onClick={() => navigate('/persistent-sources')}
            />
            <MetricCard
              iconImage="/icons/kpi-monitored-facilities.png"
              icon={Building2}
              iconClassName="bg-blue-500/10 text-blue-600 border border-blue-200/60"
              label="Monitored Facilities"
              value={metrics ? formatNumber(metrics.industrialSites) : '—'}
              delta="OSM Infrastructure"
              deltaClassName="text-blue-700 bg-blue-500/10 border-blue-200/60"
              onClick={() => navigate('/live-map')}
            />
          </>
        )}
      </div>

      {/* ── Core Layout: Priority Incident Feed (Left) + Radiometric Map (Right) ── */}
      <div className={cn(
        'grid gap-4.5 w-full items-stretch',
        aspectMode === 'square'
          ? 'grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[440px_1fr]'
          : 'grid-cols-1 lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr]'
      )}>
        
        {/* ── Priority Incident Feed (Left) ─────────────────── */}
        <div className="w-full h-full min-w-0">
          <PriorityAlerts loading={loading} />
        </div>

        {/* ── Live Radiometric Map Canvas (Right) ──────────── */}
        <div className="glass-card flex flex-col overflow-hidden shadow-xs hover:shadow-md transition-shadow w-full border border-white/80">
          
          {/* Canvas Header with Filters & Controls */}
          <div className="px-4 py-3 border-b border-black/[0.05] shrink-0 bg-white/50 backdrop-blur-md">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-extrabold text-gray-900 tracking-tight">Live Radiometric Canvas</h2>
                <span className="text-[11px] font-bold text-gray-500 bg-black/[0.04] px-2 py-0.5 rounded-full border border-black/[0.04]">
                  {mapDetections.length} visible
                </span>
              </div>

              {/* View Aspect & Fullscreen Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={resetMapView}
                  title="Reset Map Center"
                  className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white/80 rounded-lg transition-colors"
                >
                  <RotateCcw size={14} />
                </button>

                <div className="flex bg-black/[0.04] p-0.5 rounded-xl border border-black/[0.04]">
                  <button
                    onClick={() => setAspectMode('square')}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-lg transition-all',
                      aspectMode === 'square'
                        ? 'bg-white text-gray-900 shadow-2xs font-extrabold'
                        : 'text-gray-500 hover:text-gray-900'
                    )}
                    title="1:1 Square Aspect Ratio"
                  >
                    <Square size={11} />
                    <span>Square</span>
                  </button>
                  <button
                    onClick={() => setAspectMode('wide')}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-lg transition-all',
                      aspectMode === 'wide'
                        ? 'bg-white text-gray-900 shadow-2xs font-extrabold'
                        : 'text-gray-500 hover:text-gray-900'
                    )}
                    title="Wide View Aspect Ratio"
                  >
                    <RectangleHorizontal size={12} />
                    <span>Wide</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsFullscreenMap(true)}
                  title="Expand to Fullscreen Map"
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-0.5"
                >
                  <Maximize2 size={15} />
                </button>
              </div>
            </div>

            {/* In-Map Quick Filter Chips with Live Counts */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-black/[0.04]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1 shrink-0">Filter:</span>
              {[
                { id: 'ALL' as const, label: 'All Telemetry', count: filterCounts.ALL },
                { id: 'CRITICAL' as const, label: 'Critical Only', count: filterCounts.CRITICAL },
                { id: 'PERSISTENT' as const, label: 'Persistent Emitters', count: filterCounts.PERSISTENT },
                { id: 'INDUSTRIAL' as const, label: 'Plant Perimeter (≤500m)', count: filterCounts.INDUSTRIAL },
              ].map((chip) => {
                const isActive = mapFilter === chip.id
                return (
                  <button
                    key={chip.id}
                    onClick={() => handleFilterChange(chip.id)}
                    className={cn(
                      'flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all duration-150 shrink-0 shadow-2xs',
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/10'
                        : 'bg-white/80 text-gray-600 border-black/[0.06] hover:bg-white hover:text-gray-900'
                    )}
                  >
                    <span>{chip.label}</span>
                    <span
                      className={cn(
                        'text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-black/[0.05] text-gray-500'
                      )}
                    >
                      {chip.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Compact Map Body Canvas */}
          <div className={cn(
            'w-full relative transition-all duration-300 ease-in-out',
            aspectMode === 'square'
              ? 'h-[340px] sm:h-[360px]'
              : 'h-[300px] sm:h-[320px]'
          )}>
            {/* Empty Filter Notification Overlay */}
            {mapDetections.length === 0 && !loading && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] glass-panel px-3.5 py-1.5 rounded-full border border-amber-300/80 shadow-md flex items-center gap-2 text-[11px] font-semibold text-amber-900 animate-slide-down">
                <span>0 hotspots match this filter.</span>
                <button
                  onClick={() => setMapFilter('ALL')}
                  className="text-blue-600 underline hover:text-blue-800 font-bold cursor-pointer"
                >
                  View All Telemetry
                </button>
              </div>
            )}

            {loading ? (
              <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-[12px] text-gray-500 font-medium">Loading satellite coordinates…</span>
                </div>
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                }
              >
                <ThermalMap
                  detections={mapDetections}
                  facilities={facilities}
                  className="w-full h-full"
                  center={mapCenter}
                  zoom={mapZoom}
                  filterKey={mapFilter}
                  resetTrigger={viewResetTrigger}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {/* ── 24h Frequency Telemetry Trend (Extended Towards Right) ── */}
      <div className="w-full">
        <DetectionActivity data={activityData} loading={loading} className="shadow-xs" />
      </div>

      {/* ── System Pipeline Telemetry Strip ─────────────── */}
      <div className="w-full">
        <SystemStatus services={systemStatus} loading={loading} className="shadow-xs" />
      </div>

      {/* ── Fullscreen Map Modal ────────────────────────── */}
      {isFullscreenMap && (
        <div className="fixed inset-0 z-[99999] bg-white flex flex-col animate-fade-in">
          <div className="h-14 px-5 border-b border-gray-200 flex items-center justify-between bg-white shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Expand size={16} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">Live Thermal Surveillance — Fullscreen</h3>
                <p className="text-[11px] text-gray-500">Real-time geospatial radiometry</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetMapView}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RotateCcw size={13} /> Reset Center
              </button>
              <button
                onClick={() => setIsFullscreenMap(false)}
                className="flex items-center gap-1 px-3.5 py-1.5 text-[12px] font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shadow-2xs"
              >
                <X size={14} /> Close
              </button>
            </div>
          </div>

          <div className="flex-1 w-full h-full relative">
            <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-blue-500 rounded-full animate-spin" /></div>}>
              <ThermalMap
                detections={mapDetections}
                facilities={facilities}
                className="w-full h-full"
                center={mapCenter}
                zoom={mapZoom}
                filterKey={mapFilter}
                resetTrigger={viewResetTrigger}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}
