import { lazy, Suspense, useState, useEffect } from 'react'
import { Layers, Filter, Flame, ChevronRight } from 'lucide-react'
import { getDetections, getFacilities } from '../services/api'
import type { Detection, Facility, RiskLevel } from '../types'
import { getRiskBadgeClasses, getRiskDotColor, formatRelativeTime, cn } from '../lib/utils'
import { useNavigate } from 'react-router-dom'
import ToggleSwitch from '../components/ui/ToggleSwitch'

const ThermalMap = lazy(() => import('../components/map/ThermalMap'))

const RISK_FILTERS: { label: string; value: RiskLevel | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Critical', value: 'CRITICAL' },
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
]

export default function LiveMap() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL')
  const [showFacilities, setShowFacilities] = useState(true)
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.1, 72.9])
  const [mapZoom, setMapZoom] = useState<number>(10)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getDetections(), getFacilities()]).then(([d, f]) => {
      setDetections(d.data)
      setFacilities(f.data)
      setLoading(false)
    })
  }, [])

  const filtered = riskFilter === 'ALL' ? detections : detections.filter((d) => d.riskLevel === riskFilter)

  const handleSelectDetection = (det: Detection) => {
    setSelectedDetection(det)
    setMapCenter([det.latitude, det.longitude])
    setMapZoom(13)
  }

  return (
    <div className="flex h-full min-h-0 animate-fade-in relative">
      {/* ── Sidebar panel ─────────────────────────────────── */}
      <div className="w-[300px] shrink-0 flex flex-col border-r border-black/[0.07] bg-white overflow-hidden shadow-xs z-10">
        {/* Filters */}
        <div className="p-4 border-b border-black/[0.06] bg-gray-50/40">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="text-blue-600" />
              <span className="text-[13px] font-bold text-gray-900">Map Filter</span>
            </div>
            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {filtered.length} visible
            </span>
          </div>

          {/* Risk filter */}
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1.5">Risk Rating</p>
          <div className="flex flex-wrap gap-1">
            {RISK_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setRiskFilter(f.value)
                  setSelectedDetection(null)
                }}
                className={cn(
                  'text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all duration-150 shadow-2xs',
                  riskFilter === f.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/10'
                    : 'bg-white text-gray-600 border-gray-200/80 hover:bg-gray-50'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Layer toggle with 3D Switch */}
          <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-black/[0.05]">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-gray-500" />
              <span className="text-[12px] font-semibold text-gray-700">OSM Facilities</span>
            </div>
            <ToggleSwitch
              size="sm"
              checked={showFacilities}
              onChange={setShowFacilities}
              className="py-0"
            />
          </div>
        </div>

        {/* Detection list */}
        <div className="flex-1 overflow-y-auto divide-y divide-black/[0.04]">
          {loading ? (
            <div className="space-y-2 p-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            filtered.map((det) => {
              const isSelected = selectedDetection?.id === det.id

              return (
                <div
                  key={det.id}
                  onClick={() => handleSelectDetection(det)}
                  className={cn(
                    'p-3.5 hover:bg-blue-50/40 transition-all duration-150 cursor-pointer group relative',
                    isSelected && 'bg-blue-50/80 border-l-3 border-blue-600'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', getRiskDotColor(det.riskLevel))} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider', getRiskBadgeClasses(det.riskLevel))}>
                          {det.riskLevel}
                        </span>
                        <span className="text-[11px] font-bold text-gray-700">{det.frp} MW</span>
                      </div>
                      <p className="text-[12px] font-bold text-gray-900 mt-1 truncate group-hover:text-blue-600 transition-colors">
                        {det.id}
                      </p>
                      {det.nearbyFacility && (
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{det.nearbyFacility.name}</p>
                      )}
                      <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                        <span>{formatRelativeTime(det.detectedAt)}</span>
                        <span className="font-semibold text-purple-600">{det.source}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Map Canvas ────────────────────────────────────── */}
      <div className="flex-1 min-w-0 relative">
        {loading ? (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-[13px] text-gray-500 font-medium">Initializing geospatial canvas…</span>
            </div>
          </div>
        ) : (
          <Suspense fallback={<div className="absolute inset-0 bg-gray-100 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" /></div>}>
            <ThermalMap
              detections={filtered}
              facilities={showFacilities ? facilities : []}
              className="absolute inset-0 w-full h-full rounded-none"
              center={mapCenter}
              zoom={mapZoom}
              showLegend={true}
            />
          </Suspense>
        )}

        {/* Floating Stat Pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md border border-black/[0.08] rounded-full shadow-lg px-4 py-1.5 flex items-center gap-3 text-[12px] animate-slide-down">
          <span className="flex items-center gap-1.5 text-gray-700 font-semibold">
            <Flame size={14} className="text-orange-500" />
            <span>{filtered.length} anomalies visible</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 font-medium">
            {showFacilities ? `${facilities.length} industrial sites` : 'Facilities hidden'}
          </span>
        </div>

        {/* Selected Anomaly Card Preview */}
        {selectedDetection && (
          <div className="absolute bottom-6 right-6 z-[1000] w-80 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl p-4 animate-slide-up">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider', getRiskBadgeClasses(selectedDetection.riskLevel))}>
                  {selectedDetection.riskLevel}
                </span>
                <h3 className="text-[14px] font-bold text-gray-900 mt-1 font-mono">{selectedDetection.id}</h3>
              </div>
              <button
                onClick={() => setSelectedDetection(null)}
                className="text-gray-400 hover:text-gray-600 text-[12px] font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-[12px] text-gray-600 mb-3">
              FRP: <span className="font-bold text-gray-900">{selectedDetection.frp} MW</span> • Confidence: <span className="font-bold text-gray-900">{selectedDetection.confidence}%</span>
            </p>
            {selectedDetection.nearbyFacility && (
              <p className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg mb-3">
                🏢 {selectedDetection.nearbyFacility.name} ({selectedDetection.nearbyFacility.distanceMeters}m)
              </p>
            )}
            <button
              onClick={() => navigate(`/detections/${selectedDetection.id}`)}
              className="w-full flex items-center justify-center gap-1.5 text-[12px] font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-xl py-2 transition-all shadow-2xs"
            >
              Open Full Analysis <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
