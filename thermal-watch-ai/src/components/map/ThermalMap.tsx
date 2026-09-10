import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Detection, Facility } from '../../types'
import { getRiskHexColor } from '../../lib/utils'
import DetectionPopup from './DetectionPopup'
import MapLegend from './MapLegend'

// Fix Leaflet default icon path issue with Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Custom marker factories ──────────────────────────────────

function createThermalMarker(color: string, isPersistent: boolean, size = 14): L.DivIcon {
  const pulseRing = isPersistent
    ? `<span style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${color};opacity:0.6;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></span>`
    : ''

  return L.divIcon({
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
        ${pulseRing}
        <span style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.95);box-shadow:0 2px 6px ${color}80,0 1px 3px rgba(0,0,0,0.25);display:block;position:relative;z-index:1;"></span>
      </div>
      <style>@keyframes ping{75%,100%{transform:scale(1.8);opacity:0}}</style>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  })
}

function createFacilityMarker(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="display:flex;align-items:center;gap:4px;cursor:pointer;">
        <div style="width:26px;height:26px;border-radius:8px;background:rgba(255,255,255,0.95);border:1.5px solid #2563eb;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.15),0 0 0 2px rgba(37,99,235,0.15);">🏭</div>
      </div>
    `,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -16],
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
      map.setView(center, zoom, { animate: true })
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

// ── Light tile layer ─────────────────────────────────────────

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

// ── ThermalMap Component ─────────────────────────────────────

interface ThermalMapProps {
  detections: Detection[]
  facilities: Facility[]
  className?: string
  center?: [number, number]
  zoom?: number
  showLegend?: boolean
}

const DEFAULT_CENTER: [number, number] = [19.1, 72.9]

export default function ThermalMap({
  detections,
  facilities,
  className,
  center = DEFAULT_CENTER,
  zoom = 10,
  showLegend = true,
}: ThermalMapProps) {
  return (
    <div className={`relative w-full h-full min-h-[250px] overflow-hidden ${className ?? ''}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <MapAutoResizer center={center} zoom={zoom} />

        {/* Thermal Detections */}
        {detections.map((det) => (
          <Marker
            key={det.id}
            position={[det.latitude, det.longitude]}
            icon={createThermalMarker(getRiskHexColor(det.riskLevel), det.isPersistent)}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
              <div className="text-[11px] font-semibold text-gray-900">
                <span className="font-bold">{det.id}</span> • {det.location || `${det.frp} MW`}
              </div>
            </Tooltip>
            <Popup minWidth={240} maxWidth={290} closeButton={true}>
              <DetectionPopup detection={det} />
            </Popup>
          </Marker>
        ))}

        {/* Industrial Facilities / Demo Firms with Rich Location Info */}
        {facilities.map((fac) => (
          <Marker
            key={fac.id}
            position={[fac.latitude, fac.longitude]}
            icon={createFacilityMarker()}
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

      <div className="absolute top-3 right-3 z-[1000] text-[10px] text-gray-600 font-semibold bg-white/95 backdrop-blur-sm border border-black/[0.08] rounded-lg px-2.5 py-1 shadow-xs">
        📍 Demo Industrial Corridors & FIRMS Stream
      </div>
    </div>
  )
}
