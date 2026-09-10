import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
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

export default function Overview() {
  const navigate = useNavigate()
  const { lastRefreshTime, isRefreshing, refreshData } = useApp()

  const [detections,  setDetections]  = useState<Detection[]>([])
  const [facilities,  setFacilities]  = useState<Facility[]>([])
  const [metrics,     setMetrics]     = useState<DashboardMetrics | null>(null)
  const [activityData,setActivityData]= useState<DetectionActivityPoint[]>([])
  const [systemStatus,setSystemStatus]= useState<SystemServiceInfo[]>([])
  const [loading,     setLoading]     = useState(true)

  // Map Aspect Ratio & Focus State
  const [aspectMode, setAspectMode] = useState<AspectMode>('square')
  const [isFullscreenMap, setIsFullscreenMap] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.1, 72.9])
  const [mapZoom, setMapZoom] = useState<number>(10)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [a, b, d, e, f] = await Promise.all([
        getDetections(), getFacilities(),
        getDashboardMetrics(), getDetectionActivity(), getSystemStatus(),
      ])
      setDetections(a.data); setFacilities(b.data)
      setMetrics(d.data); setActivityData(e.data); setSystemStatus(f.data)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData, lastRefreshTime])

  function getLastUpdatedLabel() {
    const diffMin = Math.floor((Date.now() - lastRefreshTime.getTime()) / 60000)
    if (diffMin < 1) return 'just now'
    if (diffMin === 1) return '1 min ago'
    return `${diffMin} min ago`
  }

  const resetMapView = () => {
    setMapCenter([19.1, 72.9])
    setMapZoom(10)
  }

  return (
    <div className="w-full min-h-full flex flex-col gap-5 p-5 pb-12 animate-fade-in relative z-0">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 leading-tight">
            Monitoring Overview
          </h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Satellite-based industrial fire and thermal anomaly intelligence
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-gray-200/80 shadow-2xs">
            <Clock size={12} className="text-gray-400" />
            <span>Updated {getLastUpdatedLabel()}</span>
          </div>
          <button
            onClick={() => refreshData()}
            disabled={isRefreshing || loading}
            className={cn(
              'flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium rounded-lg border transition-all duration-150 shadow-2xs active:scale-95',
              'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            <RefreshCw size={13} className={cn('text-gray-500', isRefreshing && 'animate-spin text-blue-600')} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* ── KPIs with Click Navigation ───────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-[102px] rounded-2xl bg-gray-100 animate-pulse" />
          ))
        ) : (
          <>
            <MetricCard
              icon={Flame}
              iconClassName="bg-orange-50 text-orange-600 border border-orange-100"
              label="Active Anomalies"
              value={metrics ? formatNumber(metrics.activeAnomalies) : '—'}
              delta={metrics ? `+${metrics.activeAnomaliesDelta} in last 24h` : undefined}
              deltaClassName="text-orange-600"
              onClick={() => navigate('/detections')}
            />
            <MetricCard
              icon={AlertTriangle}
              iconClassName="bg-red-50 text-red-600 border border-red-100"
              label="High Risk"
              value={metrics ? formatNumber(metrics.highRisk) : '—'}
              delta={metrics ? `${metrics.highRiskNewToday} new today` : undefined}
              deltaClassName="text-red-600"
              onClick={() => navigate('/detections')}
            />
            <MetricCard
              icon={Activity}
              iconClassName="bg-amber-50 text-amber-600 border border-amber-100"
              label="Persistent Sources"
              value={metrics ? formatNumber(metrics.persistentSources) : '—'}
              delta={metrics ? `${metrics.persistentSourcesActive} currently active` : undefined}
              deltaClassName="text-amber-600"
              onClick={() => navigate('/persistent-sources')}
            />
            <MetricCard
              icon={Building2}
              iconClassName="bg-blue-50 text-blue-600 border border-blue-100"
              label="Industrial Sites"
              value={metrics ? formatNumber(metrics.industrialSites) : '—'}
              delta="OSM mapped facilities"
              deltaClassName="text-gray-400"
              onClick={() => navigate('/live-map')}
            />
          </>
        )}
      </div>

      {/* ── Main Layout: Square Map + Side Insights Panel ─── */}
      <div className={cn(
        'grid gap-5 w-full items-start',
        aspectMode === 'square'
          ? 'grid-cols-1 lg:grid-cols-[540px_1fr] xl:grid-cols-[580px_1fr]'
          : 'grid-cols-1 lg:grid-cols-[7fr_3fr]'
      )}>
        
        {/* ── Live Thermal Activity Square Map Card ─────────── */}
        <div className="glass-card flex flex-col overflow-hidden shadow-xs hover:shadow-md transition-shadow w-full">
          {/* Header with Aspect Ratio & Reset Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] shrink-0 bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[14px] font-bold text-gray-900">Live Thermal Activity</h2>
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold">1:1 Square Map</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {detections.length} anomalies • {facilities.length} industrial sites
                </p>
              </div>
            </div>

            {/* Map Management & Aspect Controls */}
            <div className="flex items-center gap-1.5">
              {/* Reset Center */}
              <button
                onClick={resetMapView}
                title="Reset Map Center"
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw size={14} />
              </button>

              {/* Aspect Ratio Switcher */}
              <div className="flex bg-gray-100/90 p-0.5 rounded-lg border border-gray-200/60">
                <button
                  onClick={() => setAspectMode('square')}
                  className={cn(
                    'flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md transition-all',
                    aspectMode === 'square'
                      ? 'bg-white text-gray-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                  title="Square (1:1 Aspect Ratio)"
                >
                  <Square size={11} />
                  <span>Square</span>
                </button>
                <button
                  onClick={() => setAspectMode('wide')}
                  className={cn(
                    'flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md transition-all',
                    aspectMode === 'wide'
                      ? 'bg-white text-gray-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                  title="Wide View"
                >
                  <RectangleHorizontal size={12} />
                  <span>Wide</span>
                </button>
              </div>

              {/* Fullscreen Expand */}
              <button
                onClick={() => setIsFullscreenMap(true)}
                title="Open Fullscreen View"
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-0.5"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>

          {/* Square Map Body Canvas */}
          <div className={cn(
            'w-full relative transition-all duration-300 ease-in-out',
            aspectMode === 'square'
              ? 'aspect-square min-h-[380px] max-h-[580px]'
              : 'h-[460px]'
          )}>
            {loading ? (
              <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-[12px] text-gray-400">Loading square geospatial canvas…</span>
                </div>
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                }
              >
                <ThermalMap
                  detections={detections}
                  facilities={facilities}
                  className="w-full h-full"
                  center={mapCenter}
                  zoom={mapZoom}
                />
              </Suspense>
            )}
          </div>
        </div>

        {/* ── Side Column: Priority Alerts & Detection Activity ─ */}
        <div className="flex flex-col gap-4.5 min-w-0 w-full">
          {/* Priority Alerts */}
          <div className="w-full min-h-[260px]">
            <PriorityAlerts loading={loading} />
          </div>

          {/* Detection Activity Chart */}
          <div className="w-full">
            <DetectionActivity data={activityData} loading={loading} className="shadow-xs" />
          </div>
        </div>
      </div>

      {/* ── System Status Strip (Cleanly Separated at Bottom) ─ */}
      <div className="w-full mt-2">
        <SystemStatus services={systemStatus} loading={loading} className="shadow-xs" />
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-gray-400 pb-2">
        Demo environment • Satellite detections are indicative and require field verification
      </p>

      {/* ── Fullscreen Map Modal Dialog ─────────────────── */}
      {isFullscreenMap && (
        <div className="fixed inset-0 z-[99999] bg-white flex flex-col animate-fade-in">
          {/* Fullscreen Header */}
          <div className="h-14 px-5 border-b border-gray-200 flex items-center justify-between bg-white shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Expand size={16} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">Live Thermal Activity — Fullscreen View</h3>
                <p className="text-[11px] text-gray-500">High-resolution geospatial monitoring interface</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetMapView}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RotateCcw size={13} /> Center View
              </button>
              <button
                onClick={() => setIsFullscreenMap(false)}
                className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shadow-2xs"
              >
                <X size={14} /> Close (Esc)
              </button>
            </div>
          </div>

          {/* Fullscreen Map Canvas */}
          <div className="flex-1 w-full h-full relative">
            <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-blue-500 rounded-full animate-spin" /></div>}>
              <ThermalMap
                detections={detections}
                facilities={facilities}
                className="w-full h-full"
                center={mapCenter}
                zoom={mapZoom}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}
