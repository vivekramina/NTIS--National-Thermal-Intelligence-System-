import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, GeoJSON, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Layers } from 'lucide-react'
import type { Detection, Facility } from '../../types'
import { getRiskHexColor, cn } from '../../lib/utils'
import DetectionPopup from './DetectionPopup'
import MapLegend from './MapLegend'
import {
  HOTSPOT_CLASSIFICATIONS,
  resolveHotspotClassification,
  type HotspotClassificationKey,
} from '../../data/hotspotClassification'
import ClassificationMatrixModal from './ClassificationMatrixModal'
import {
  INDIA_BOUNDS,
  INDIA_MASK_GEOJSON,
  INDIA_BOUNDARY_GEOJSON,
} from '../../data/indiaGeoData'

// Fix Leaflet default icon path issue with Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Classification Pin Marker Factory ────────────────────────
// Creates crisp white rounded badges displaying the official 16 NTIS classification logos

function createClassificationMarker(
  det: Detection,
  classificationKey: HotspotClassificationKey
): L.DivIcon {
  const meta = HOTSPOT_CLASSIFICATIONS[classificationKey] || HOTSPOT_CLASSIFICATIONS.unknown
  const riskColor = getRiskHexColor(det.riskLevel)

  const pulseRing = det.isPersistent
    ? `<span style="position:absolute;inset:-7px;border-radius:12px;border:2.5px solid ${riskColor};opacity:0.85;animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></span>`
    : ''

  const pinHtml = `
    <div style="position:relative;width:34px;height:40px;display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.55));transition:transform 0.15s ease;" class="ntis-classification-pin">
      ${pulseRing}
      <div style="width:32px;height:32px;background:#ffffff;border:2px solid ${riskColor};border-radius:9px;padding:3.5px;display:flex;align-items:center;justify-content:center;position:relative;z-index:2;box-shadow:0 1px 4px rgba(0,0,0,0.3);">
        ${meta.svgIcon}
      </div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${riskColor};margin-top:-1px;position:relative;z-index:1;"></div>
    </div>
    <style>
      .ntis-classification-pin:hover { transform: scale(1.18); z-index: 1000 !important; }
      @keyframes ping { 75%, 100% { transform: scale(1.7); opacity: 0; } }
    </style>
  `

  return L.divIcon({
    html: pinHtml,
    className: '',
    iconSize: [34, 40],
    iconAnchor: [17, 39],
    popupAnchor: [0, -40],
  })
}

function createFacilityMarker(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="display:flex;align-items:center;gap:4px;cursor:pointer;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.45));transition:transform 0.15s ease;" class="ntis-facility-pin">
        <div style="width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,0.98);border:2px solid #2563eb;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">🏭</div>
      </div>
      <style>.ntis-facility-pin:hover { transform: scale(1.18); z-index: 999 !important; }</style>
    `,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  })
}

// ── Automatic Map Resizer & Controller Component ─────────────

function MapAutoResizer({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  const prevCenterRef = useRef<string>('')

  // Handle center/zoom changes smoothly
  useEffect(() => {
    const centerKey = `${center[0]},${center[1]}_${zoom}`
    if (prevCenterRef.current !== centerKey) {
      if (prevCenterRef.current !== '') {
        map.flyTo(center, zoom, { duration: 0.6 })
      } else {
        map.setView(center, zoom)
      }
      prevCenterRef.current = centerKey
    }
  }, [map, center, zoom])

  // Handle container resizing (ResizeObserver + window resize + sidebar toggle)
  useEffect(() => {
    const container = map.getContainer()
    if (!container) return

    // Immediately invalidate to fix initial layout
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)

    let resizeTimer: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        map.invalidateSize({ animate: false })
      }, 50)
    }

    const observer = new ResizeObserver(() => {
      handleResize()
    })
    observer.observe(container)

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      clearTimeout(resizeTimer)
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [map])

  return null
}

// ── Bounds Fitter on Filter Change ────────────────────────────

function MapBoundsController({
  detections,
  filterKey,
  resetTrigger,
  defaultCenter,
  defaultZoom,
  autoFitOnFilter = true,
}: {
  detections: Detection[]
  filterKey?: string
  resetTrigger?: number
  defaultCenter: [number, number]
  defaultZoom: number
  autoFitOnFilter?: boolean
}) {
  const map = useMap()
  const prevFilterKeyRef = useRef<string | undefined>(filterKey)
  const prevResetTriggerRef = useRef<number | undefined>(resetTrigger)
  const isInitialMountRef = useRef<boolean>(true)

  useEffect(() => {
    // Check if explicit reset was triggered by parent
    const isReset = resetTrigger !== undefined && resetTrigger !== prevResetTriggerRef.current
    if (isReset) {
      prevResetTriggerRef.current = resetTrigger
      if (detections && detections.length > 0) {
        const bounds = L.latLngBounds(detections.map((d) => [d.latitude, d.longitude]))
        if (bounds.isValid()) {
          map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 13, duration: 0.6 })
          return
        }
      }
      map.flyTo(defaultCenter, defaultZoom, { duration: 0.6 })
      return
    }

    // Skip auto-flying on the first mount so the initial center/zoom is preserved
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      prevFilterKeyRef.current = filterKey
      return
    }

    // When filterKey changes, fly to fit the matching detections!
    if (autoFitOnFilter && filterKey !== undefined && filterKey !== prevFilterKeyRef.current) {
      prevFilterKeyRef.current = filterKey

      if (!detections || detections.length === 0) return

      if (detections.length === 1) {
        map.flyTo([detections[0].latitude, detections[0].longitude], 13, { duration: 0.6 })
      } else {
        const bounds = L.latLngBounds(detections.map((d) => [d.latitude, d.longitude]))
        if (bounds.isValid()) {
          map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 13, duration: 0.6 })
        }
      }
    }
  }, [detections, filterKey, resetTrigger, defaultCenter, defaultZoom, autoFitOnFilter, map])

  return null
}

function MapIndiaController({ fitTrigger }: { fitTrigger: number }) {
  const map = useMap()
  const prevTriggerRef = useRef(fitTrigger)

  useEffect(() => {
    if (fitTrigger > 0 && fitTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = fitTrigger
      map.fitBounds(INDIA_BOUNDS, { padding: [30, 30], duration: 0.8 })
    }
  }, [fitTrigger, map])

  return null
}

// ── Basemap Definitions ─────────────────────────────────────
export type BaseMapId = 'satellite_hybrid' | 'satellite' | 'terrain' | 'dark' | 'light'

export interface BaseMapConfig {
  id: BaseMapId
  label: string
  icon: string
  url: string
  subdomains?: string[]
  maxZoom: number
  attribution: string
}

export const BASE_MAPS: Record<BaseMapId, BaseMapConfig> = {
  satellite_hybrid: {
    id: 'satellite_hybrid',
    label: 'Google Satellite Hybrid',
    icon: '🛰️',
    url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps Satellite & Street Telemetry',
  },
  satellite: {
    id: 'satellite',
    label: 'Pure Satellite',
    icon: '🌍',
    url: 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps Satellite Imagery',
  },
  terrain: {
    id: 'terrain',
    label: 'Topographic Terrain',
    icon: '⛰️',
    url: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps Terrain',
  },
  dark: {
    id: 'dark',
    label: 'Tactical Dark',
    icon: '🌑',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  light: {
    id: 'light',
    label: 'Carto Light Street',
    icon: '🗺️',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
}

// ── ThermalMap Component ─────────────────────────────────────

interface ThermalMapProps {
  detections: Detection[]
  facilities: Facility[]
  className?: string
  center?: [number, number]
  zoom?: number
  showLegend?: boolean
  filterKey?: string
  resetTrigger?: number
  autoFitOnFilter?: boolean
  initialBaseMap?: BaseMapId
  restrictToIndia?: boolean
  classificationFilter?: HotspotClassificationKey | 'ALL'
  onClassificationChange?: (classification: HotspotClassificationKey | 'ALL') => void
  onSelectDetection?: (detection: Detection) => void
  onSelectFacility?: (facility: Facility) => void
}

const DEFAULT_CENTER: [number, number] = [19.1, 72.9]

export default function ThermalMap({
  detections,
  facilities,
  className,
  center = DEFAULT_CENTER,
  zoom = 10,
  showLegend = true,
  filterKey,
  resetTrigger,
  autoFitOnFilter = true,
  initialBaseMap = 'satellite_hybrid',
  restrictToIndia: initialRestrictToIndia = true,
  classificationFilter,
  onClassificationChange,
  onSelectDetection,
  onSelectFacility,
}: ThermalMapProps) {
  const [currentBaseMap, setCurrentBaseMap] = useState<BaseMapId>(initialBaseMap)
  const [restrictToIndia, setRestrictToIndia] = useState<boolean>(initialRestrictToIndia)
  const [fitIndiaTrigger, setFitIndiaTrigger] = useState<number>(0)
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false)
  const [showClassificationModal, setShowClassificationModal] = useState<boolean>(false)
  const [internalClassification, setInternalClassification] = useState<HotspotClassificationKey | 'ALL'>('ALL')
  const layerMenuRef = useRef<HTMLDivElement>(null)

  const activeClassification = classificationFilter !== undefined ? classificationFilter : internalClassification

  const handleSelectClassification = (key: HotspotClassificationKey | 'ALL') => {
    setInternalClassification(key)
    onClassificationChange?.(key)
  }

  // Filter detections by classification if active
  const visibleDetections = activeClassification === 'ALL'
    ? detections
    : detections.filter((d) => resolveHotspotClassification(d) === activeClassification)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (layerMenuRef.current && !layerMenuRef.current.contains(e.target as Node)) {
        setShowLayerMenu(false)
      }
    }
    if (showLayerMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLayerMenu])

  return (
    <div className={`relative w-full h-full min-h-[250px] overflow-hidden ${className ?? ''}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={restrictToIndia ? 4.2 : 3}
        maxBounds={restrictToIndia ? INDIA_BOUNDS : undefined}
        maxBoundsViscosity={1.0}
        maxZoom={BASE_MAPS[currentBaseMap].maxZoom}
        className="w-full h-full"
        zoomControl={false}
        scrollWheelZoom={false}
        preferCanvas={true}
        attributionControl={true}
      >
        <TileLayer
          key={currentBaseMap}
          url={BASE_MAPS[currentBaseMap].url}
          subdomains={BASE_MAPS[currentBaseMap].subdomains}
          maxZoom={BASE_MAPS[currentBaseMap].maxZoom}
          attribution={BASE_MAPS[currentBaseMap].attribution}
        />
        <ZoomControl position="bottomright" />
        <MapAutoResizer center={center} zoom={zoom} />
        <MapBoundsController
          detections={visibleDetections}
          filterKey={filterKey}
          resetTrigger={resetTrigger}
          defaultCenter={center}
          defaultZoom={zoom}
          autoFitOnFilter={autoFitOnFilter}
        />
        <MapIndiaController fitTrigger={fitIndiaTrigger} />

        {/* Territory Mask: Masks all countries and territories outside India */}
        {restrictToIndia && (
          <>
            <GeoJSON
              key={`india-mask-${currentBaseMap}`}
              data={INDIA_MASK_GEOJSON as any}
              style={{
                fillColor: currentBaseMap === 'light' ? '#f1f5f9' : '#080d1a',
                fillOpacity: 0.96,
                weight: 0,
                stroke: false,
                interactive: false,
              }}
            />
            <GeoJSON
              key={`india-boundary-${currentBaseMap}`}
              data={INDIA_BOUNDARY_GEOJSON as any}
              style={{
                color: '#06b6d4',
                weight: 2,
                opacity: 0.85,
                fill: false,
                interactive: false,
                dashArray: '4, 4',
              }}
            />
          </>
        )}

        {/* Thermal Detections Classified by Category Logo */}
        {visibleDetections.map((det) => {
          const classKey = resolveHotspotClassification(det)
          const classMeta = HOTSPOT_CLASSIFICATIONS[classKey]

          return (
            <Marker
              key={det.id}
              position={[det.latitude, det.longitude]}
              icon={createClassificationMarker(det, classKey)}
              eventHandlers={{
                click: () => onSelectDetection?.(det),
              }}
            >
              <Tooltip direction="top" offset={[0, -38]} opacity={0.95}>
                <div className="text-[11px] font-semibold text-gray-900 flex items-center gap-1.5">
                  <span className="font-bold">{det.id}</span>
                  <span className="text-gray-300">•</span>
                  <span className="font-extrabold" style={{ color: classMeta.color }}>
                    {classMeta.label}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="font-mono text-gray-700">{det.frp} MW</span>
                </div>
              </Tooltip>
              <Popup minWidth={250} maxWidth={300} closeButton={true}>
                <DetectionPopup detection={det} />
              </Popup>
            </Marker>
          )
        })}

        {/* Industrial Facilities / Demo Firms with Rich Location Info */}
        {facilities.map((fac) => (
          <Marker
            key={fac.id}
            position={[fac.latitude, fac.longitude]}
            icon={createFacilityMarker()}
            eventHandlers={{
              click: () => onSelectFacility?.(fac),
            }}
          >
            <Tooltip direction="top" offset={[0, -16]} opacity={0.95}>
              <div className="text-[11px] font-bold text-gray-900">
                🏭 {fac.name}
              </div>
            </Tooltip>
            <Popup minWidth={220} maxWidth={280} closeButton={true}>
              <div className="p-1 select-none">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                    {fac.type.replace('_', ' ')} Plant
                  </span>
                  {fac.osmId && (
                    <span className="text-[10px] font-mono text-gray-400">
                      {fac.osmId}
                    </span>
                  )}
                </div>

                <h4 className="text-[13px] font-bold text-gray-900 leading-snug mb-1">
                  {fac.name}
                </h4>

                {/* Location Banner */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 my-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Verified Location & Sector
                  </p>
                  <p className="text-[11px] font-semibold text-gray-800 leading-tight">
                    {fac.location}
                  </p>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">
                    Coordinates: {fac.latitude.toFixed(4)}°N, {fac.longitude.toFixed(4)}°E
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                  <span>OSM Verified Node</span>
                  <span className="text-emerald-600 font-semibold">● Active Site</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {showLegend && <MapLegend />}

      {/* Floating Classification Matrix & Legend Launcher */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col items-start gap-1.5 select-none pointer-events-auto max-w-[calc(100%-175px)]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowClassificationModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 shadow-xl text-[11px] font-bold transition-all cursor-pointer group hover:scale-[1.02]"
            title="Open NTIS Thermal Hotspot Categories"
          >
            <span>🏷️</span>
            <span className="text-[11px] tracking-tight">Categories</span>
            <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded-full font-mono font-bold">16</span>
          </button>

          <button
            onClick={() => setFitIndiaTrigger((c) => c + 1)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 shadow-xl text-[11px] font-bold transition-all cursor-pointer group hover:scale-[1.02]"
            title="Zoom to Fit Full Republic of India"
          >
            <span>🇮🇳</span>
            <span className="text-[11px] tracking-tight">India</span>
          </button>
        </div>

        {activeClassification !== 'ALL' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-600/95 text-white backdrop-blur-md border border-blue-400/50 shadow-md text-[11px] font-bold animate-slide-down">
            <span className="truncate max-w-[140px] sm:max-w-[200px]">Filtered: {HOTSPOT_CLASSIFICATIONS[activeClassification].label}</span>
            <button
              onClick={() => handleSelectClassification('ALL')}
              className="text-blue-200 hover:text-white p-0.5 cursor-pointer ml-0.5 shrink-0"
              title="Clear classification filter"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Floating Basemap & Earth Imagery Switcher */}
      <div ref={layerMenuRef} className="absolute top-3 right-3 z-[1000] flex flex-col items-end select-none">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 shadow-xl text-[11px] font-bold transition-all cursor-pointer group"
          title="Switch Satellite & Base Map Layer"
        >
          <span className="text-[13px]">{BASE_MAPS[currentBaseMap].icon}</span>
          <span className="text-[11px] tracking-tight max-w-[125px] sm:max-w-none truncate">{BASE_MAPS[currentBaseMap].label}</span>
          <Layers size={13} className="text-blue-400 group-hover:rotate-12 transition-transform shrink-0" />
        </button>

        {showLayerMenu && (
          <div className="mt-1.5 p-1.5 bg-slate-950/95 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl flex flex-col gap-1 w-56 text-left animate-slide-down z-[1001]">
            <div className="px-2.5 py-1 border-b border-white/10">
              <p className="text-[9.5px] font-extrabold text-gray-400 uppercase tracking-wider">
                Basemap & Earth Imagery
              </p>
            </div>
            {Object.values(BASE_MAPS).map((layer) => {
              const isSelected = currentBaseMap === layer.id
              return (
                <button
                  key={layer.id}
                  onClick={() => {
                    setCurrentBaseMap(layer.id)
                    setShowLayerMenu(false)
                  }}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer',
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13px]">{layer.icon}</span>
                    <span>{layer.label}</span>
                  </div>
                  {isSelected && <span className="text-[11px] font-extrabold text-white">✓</span>}
                </button>
              )
            })}

            {/* India Territory Constraint Toggle */}
            <div className="pt-1.5 mt-1 border-t border-white/10">
              <div className="px-2.5 py-1">
                <p className="text-[9.5px] font-extrabold text-cyan-400 uppercase tracking-wider">
                  Territorial Scope
                </p>
              </div>
              <button
                onClick={() => setRestrictToIndia(!restrictToIndia)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer',
                  restrictToIndia
                    ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-gray-400 hover:bg-white/10'
                )}
              >
                <div className="flex items-center gap-2">
                  <span>🇮🇳</span>
                  <span>Mask Other Countries</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40">
                  {restrictToIndia ? 'ON' : 'OFF'}
                </span>
              </button>
              <button
                onClick={() => {
                  setFitIndiaTrigger((c) => c + 1)
                  setShowLayerMenu(false)
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 mt-0.5 rounded-lg text-[11px] text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <span>🔍</span>
                <span>Zoom to Full India</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4x4 Classification Matrix Modal */}
      <ClassificationMatrixModal
        isOpen={showClassificationModal}
        onClose={() => setShowClassificationModal(false)}
        detections={detections}
        selectedClassification={activeClassification}
        onSelectClassification={handleSelectClassification}
      />
    </div>
  )
}
