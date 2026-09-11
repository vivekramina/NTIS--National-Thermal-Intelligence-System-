import { lazy, Suspense, useState, useEffect, useMemo } from 'react'
import {
  Layers,
  Filter,
  Flame,
  X,
  Compass,
  Building2,
  Thermometer,
  MapPin,
  ExternalLink,
} from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getDetections, getFacilities } from '../services/api'
import type { Detection, Facility, RiskLevel } from '../types'
import { getRiskBadgeClasses, formatRelativeTime, cn } from '../lib/utils'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import { getFacilityIntelligence } from '../data/facilityIntelligence'
import { HOTSPOT_CLASSIFICATIONS, resolveHotspotClassification } from '../data/hotspotClassification'
import HotspotClassificationBadge from '../components/common/HotspotClassificationBadge'

const ThermalMap = lazy(() => import('../components/map/ThermalMap'))

const RISK_FILTERS: { label: string; value: RiskLevel | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Critical', value: 'CRITICAL' },
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
]

export default function LiveMap() {
  const [searchParams] = useSearchParams()
  const queryDetectionId = searchParams.get('detectionId')
  const queryLat = searchParams.get('lat')
  const queryLng = searchParams.get('lng')

  const [detections, setDetections] = useState<Detection[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL')
  const [showFacilities, setShowFacilities] = useState(true)
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.5, 80.0])
  const [mapZoom, setMapZoom] = useState<number>(5)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getDetections(), getFacilities()]).then(([d, f]) => {
      setDetections(d.data)
      setFacilities(f.data)
      setLoading(false)

      // Handle deep linking via query parameters
      if (queryDetectionId) {
        const found = d.data.find((item) => item.id === queryDetectionId)
        if (found) {
          setSelectedDetection(found)
          setMapCenter([found.latitude, found.longitude])
          setMapZoom(14)
          return
        }
      }

      if (queryLat && queryLng) {
        const lat = parseFloat(queryLat)
        const lng = parseFloat(queryLng)
        if (!isNaN(lat) && !isNaN(lng)) {
          setMapCenter([lat, lng])
          setMapZoom(14)
          const matched = d.data.find(
            (item) => Math.abs(item.latitude - lat) < 0.008 && Math.abs(item.longitude - lng) < 0.008
          )
          if (matched) {
            setSelectedDetection(matched)
          }
        }
      }
    })
  }, [queryDetectionId, queryLat, queryLng])

  const filtered = riskFilter === 'ALL' ? detections : detections.filter((d) => d.riskLevel === riskFilter)

  const handleSelectDetection = (det: Detection) => {
    setSelectedDetection(det)
    setSelectedFacility(null)
    setMapCenter([det.latitude, det.longitude])
    setMapZoom(14)
  }

  const handleSelectFacility = (fac: Facility) => {
    setSelectedFacility(fac)
    const matchingDetection = detections.find(
      (d) =>
        d.nearbyFacility?.id === fac.id ||
        (Math.abs(d.latitude - fac.latitude) < 0.006 && Math.abs(d.longitude - fac.longitude) < 0.006)
    )
    if (matchingDetection) {
      setSelectedDetection(matchingDetection)
    } else {
      setSelectedDetection(null)
    }
    setMapCenter([fac.latitude, fac.longitude])
    setMapZoom(14)
  }

  const activeIntel = useMemo(() => {
    if (selectedDetection) {
      return getFacilityIntelligence(
        selectedDetection.nearbyFacility?.id || selectedDetection.nearbyFacility?.name,
        selectedDetection.location,
        selectedDetection.frp
      )
    }
    if (selectedFacility) {
      return getFacilityIntelligence(
        selectedFacility.id || selectedFacility.name,
        selectedFacility.location,
        45
      )
    }
    return null
  }, [selectedDetection, selectedFacility])

  const activeLat = selectedDetection?.latitude ?? selectedFacility?.latitude
  const activeLng = selectedDetection?.longitude ?? selectedFacility?.longitude

  return (
    <div className="flex h-full min-h-0 animate-fade-in relative">
      {/* ── Sidebar panel ─────────────────────────────────── */}
      <div className="w-[310px] shrink-0 flex flex-col border-r border-white/60 bg-white/80 backdrop-blur-2xl overflow-hidden shadow-xs z-10">
        {/* Filters */}
        <div className="p-4 border-b border-black/[0.05] bg-white/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="text-blue-600" />
              <span className="text-[13px] font-bold text-gray-900">Geospatial Filters</span>
            </div>
            <span className="text-[11px] font-bold text-gray-600 bg-black/[0.04] px-2 py-0.5 rounded-full border border-black/[0.04]">
              {filtered.length} visible
            </span>
          </div>

          {/* Risk filter */}
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1.5">Hazard Severity</p>
          <div className="flex flex-wrap gap-1">
            {RISK_FILTERS.map((f) => {
              const count = f.value === 'ALL' ? detections.length : detections.filter((d) => d.riskLevel === f.value).length
              const isActive = riskFilter === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    setRiskFilter(f.value)
                    setSelectedDetection(null)
                  }}
                  className={cn(
                    'flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all duration-150 shadow-2xs',
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/10'
                      : 'bg-white/90 text-gray-600 border-black/[0.06] hover:bg-white hover:text-gray-900'
                  )}
                >
                  <span>{f.label}</span>
                  <span
                    className={cn(
                      'text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-none',
                      isActive ? 'bg-white/20 text-white' : 'bg-black/[0.05] text-gray-500'
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Layer toggle with 3D Switch */}
          <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-black/[0.05]">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-gray-500" />
              <span className="text-[12px] font-bold text-gray-700">OSM Industrial Layer</span>
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
              {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-200/50 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            filtered.map((det) => {
              const isSelected = selectedDetection?.id === det.id
              const classKey = resolveHotspotClassification(det)
              const classification = HOTSPOT_CLASSIFICATIONS[classKey]

              return (
                <div
                  key={det.id}
                  onClick={() => handleSelectDetection(det)}
                  className={cn(
                    'p-3 hover:bg-white/90 transition-all duration-150 cursor-pointer group relative',
                    isSelected && 'bg-blue-50/80 border-l-3 border-blue-600 shadow-2xs'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg bg-white shadow-2xs border flex items-center justify-center shrink-0 p-1 mt-0.5 group-hover:scale-105 transition-transform"
                      style={{ borderColor: classification.color + '40' }}
                      title={classification.label}
                    >
                      <span className="w-4 h-4 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: classification.svgIcon }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-extrabold truncate" style={{ color: classification.color }}>
                          {classification.label}
                        </span>
                        <span className="text-[11px] font-extrabold text-gray-800 shrink-0">{det.frp} MW</span>
                      </div>
                      <p className="text-[12px] font-bold text-gray-900 mt-0.5 truncate group-hover:text-blue-600 transition-colors">
                        {det.nearbyFacility?.name || det.id}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className={cn('font-bold px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider', getRiskBadgeClasses(det.riskLevel))}>
                          {det.riskLevel}
                        </span>
                        <span className="text-gray-400 font-medium">{formatRelativeTime(det.detectedAt)}</span>
                        <span className="font-bold text-purple-600">{det.source}</span>
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
          <div className="absolute inset-0 bg-gray-100/60 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-[13px] text-gray-500 font-medium">Initializing geospatial telemetry canvas…</span>
            </div>
          </div>
        ) : (
          <Suspense fallback={<div className="absolute inset-0 bg-gray-100/60 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" /></div>}>
            <ThermalMap
              detections={filtered}
              facilities={showFacilities ? facilities : []}
              className="absolute inset-0 w-full h-full rounded-none"
              center={mapCenter}
              zoom={mapZoom}
              showLegend={true}
              filterKey={riskFilter}
              onSelectDetection={handleSelectDetection}
              onSelectFacility={handleSelectFacility}
            />
          </Suspense>
        )}

        {/* Floating Stat Pill with Translucent Glass */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] glass-panel rounded-full shadow-lg px-4.5 py-1.5 flex items-center gap-3 text-[12px] animate-slide-down border border-white/80 pointer-events-none">
          <span className="flex items-center gap-1.5 text-gray-800 font-bold">
            <Flame size={14} className="text-orange-500" />
            <span>{filtered.length} active anomalies</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600 font-medium">
            {showFacilities ? `${facilities.length} industrial sites indexed` : 'Facilities hidden'}
          </span>
        </div>

        {/* ── Facility & Thermal Heat Intelligence Drawer ──── */}
        {(selectedDetection || selectedFacility) && activeIntel && (
          <div className="absolute bottom-4 right-4 z-[1000] w-[94vw] sm:w-[460px] max-h-[86vh] flex flex-col bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/90 overflow-hidden animate-slide-up">
            {/* Drawer Header */}
            <div className="p-4 pb-3 border-b border-black/[0.06] bg-slate-50/70">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedDetection ? (
                      <>
                        <HotspotClassificationBadge detection={selectedDetection} size="sm" />
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider', getRiskBadgeClasses(selectedDetection.riskLevel))}>
                          {selectedDetection.riskLevel} Anomaly
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                        OSM Industrial Node
                      </span>
                    )}
                    {selectedDetection?.isPersistent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                        Persistent Emitter
                      </span>
                    )}
                  </div>
                  <h3 className="text-[15px] font-extrabold text-gray-900 mt-1.5 leading-snug">
                    {activeIntel.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                    {activeIntel.sector}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {activeLat && activeLng && (
                    <button
                      onClick={() => {
                        setMapCenter([activeLat, activeLng])
                        setMapZoom(15)
                      }}
                      title="Focus on hotspot coordinates"
                      className="text-gray-500 hover:text-blue-600 p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-black/[0.06]"
                    >
                      <Compass size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedDetection(null)
                      setSelectedFacility(null)
                    }}
                    title="Close intelligence drawer"
                    className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-black/[0.06]"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Exact Coordinates Strip */}
              {activeLat && activeLng && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-black/[0.04] text-[11px] font-mono text-gray-600">
                  <MapPin size={12} className="text-red-500 shrink-0" />
                  <span>
                    {activeLat.toFixed(5)}°N, {activeLng.toFixed(5)}°E
                  </span>
                  {selectedDetection?.nearbyFacility && (
                    <span className="text-gray-400 text-[10px] font-sans">
                      • {selectedDetection.nearbyFacility.distanceMeters}m from plant core
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Scrollable Intelligence Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-left divide-y divide-black/[0.04]">
              {/* Plant Meta Details */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50/90 border border-slate-200/60 rounded-xl p-2.5">
                  <p className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider">Industrial Capacity</p>
                  <p className="font-bold text-gray-900 mt-0.5 leading-tight">{activeIntel.capacity}</p>
                </div>
                <div className="bg-slate-50/90 border border-slate-200/60 rounded-xl p-2.5">
                  <p className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider">Parent Organization</p>
                  <p className="font-bold text-gray-900 mt-0.5 leading-tight truncate" title={activeIntel.parentEntity}>
                    {activeIntel.parentEntity}
                  </p>
                </div>
              </div>

              {/* Section: What the company actually does */}
              <div className="pt-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Building2 size={14} className="text-blue-600" />
                  <span className="text-[11px] font-extrabold text-gray-900 uppercase tracking-wider">
                    What This Facility Actually Does
                  </span>
                </div>
                <p className="text-[12px] text-gray-700 leading-relaxed font-normal bg-blue-50/40 border border-blue-100/80 rounded-xl p-3">
                  {activeIntel.whatItDoes}
                </p>

                {/* Operations & Products Tags */}
                <div className="mt-2.5 space-y-2">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Core Industrial Operations & Units
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {activeIntel.operations.map((op, i) => (
                        <span
                          key={i}
                          className="text-[10.5px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200/70"
                        >
                          {op}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Manufactured Outputs / Products
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {activeIntel.products.map((p, i) => (
                        <span
                          key={i}
                          className="text-[10.5px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200/70"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: How much heat it produces */}
              <div className="pt-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Flame size={14} className="text-orange-600" />
                    <span className="text-[11px] font-extrabold text-gray-900 uppercase tracking-wider">
                      Thermal & Heat Output Profile
                    </span>
                  </div>
                  {selectedDetection && (
                    <span className="text-[12px] font-extrabold text-orange-600 font-mono">
                      {selectedDetection.frp} MW
                    </span>
                  )}
                </div>

                {/* Heat Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <div className="bg-orange-50/70 border border-orange-200/80 rounded-xl p-2.5">
                    <p className="text-[9.5px] font-bold text-orange-800 uppercase tracking-wider flex items-center gap-1">
                      <Flame size={11} /> Baseline FRP Range
                    </p>
                    <p className="text-[11px] font-extrabold text-orange-950 mt-1">
                      {activeIntel.heatProduced.baselineFRP}
                    </p>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5">
                    <p className="text-[9.5px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                      <Thermometer size={11} /> Operating Temp
                    </p>
                    <p className="text-[11px] font-extrabold text-amber-950 mt-1">
                      {activeIntel.heatProduced.typicalTemperature}
                    </p>
                  </div>
                </div>

                <p className="text-[12px] text-gray-700 leading-relaxed font-normal bg-orange-50/30 border border-orange-100/70 rounded-xl p-3 mb-2.5">
                  {activeIntel.heatProduced.heatDescription}
                </p>

                {/* Primary Heat Sources */}
                <div className="space-y-1.5 mb-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Primary Heat Emission Sources
                  </p>
                  <div className="space-y-1">
                    {activeIntel.heatProduced.heatSources.map((source, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-gray-700">
                        <span className="text-orange-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{source}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cooling System & Environmental Buffer */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-gray-500 font-medium">Cooling Mechanism: </span>
                    <span className="text-gray-800 font-semibold">{activeIntel.heatProduced.coolingMechanism}</span>
                  </div>
                  <div className="pt-1 border-t border-black/[0.04]">
                    <span className="text-gray-500 font-medium">Safety Buffer: </span>
                    <span className="text-gray-800 font-semibold">
                      {activeIntel.safetyBufferMeters}m perimeter ({activeIntel.riskClassification})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="p-3 bg-white border-t border-black/[0.06] flex items-center gap-2">
              {activeLat && activeLng && (
                <button
                  onClick={() => {
                    setMapCenter([activeLat, activeLng])
                    setMapZoom(15)
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-bold text-gray-700 hover:text-gray-900 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <Compass size={13} />
                  <span>Focus Epicenter</span>
                </button>
              )}
              {selectedDetection && (
                <button
                  onClick={() => navigate(`/detections/${selectedDetection.id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <span>Full Forensics</span>
                  <ExternalLink size={13} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

