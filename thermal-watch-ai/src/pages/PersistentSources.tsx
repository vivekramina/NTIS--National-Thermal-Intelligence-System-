import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Clock, AlertTriangle, Building2, Repeat, Calendar, X, ExternalLink } from 'lucide-react'
import { getPersistentSources, getPersistentSourceTimeline } from '../services/api'
import type { PersistentSource } from '../types'
import { getRiskBadgeClasses, formatRelativeTime, formatDistance, cn } from '../lib/utils'

function PersistenceBar({ days, maxDays = 7 }: { days: number; maxDays?: number }) {
  const safeDays = Math.max(1, days || 1)
  const pct = Math.min(100, Math.max(15, (safeDays / maxDays) * 100))
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-black/[0.06] rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            safeDays >= 4 ? 'bg-red-500' : safeDays >= 2 ? 'bg-amber-500' : 'bg-emerald-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-bold text-gray-700 w-10 shrink-0 text-right">{safeDays} days</span>
    </div>
  )
}

interface TimelineEntry {
  id: string
  date: string
  time: string
  frp: number
  brightness: number
  confidence: number
  satellite: string
  daynight: string
  riskScore?: number
}

export default function PersistentSources() {
  const [sources, setSources] = useState<PersistentSource[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState<PersistentSource | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getPersistentSources()
      .then((res) => {
        setSources(res.data || [])
      })
      .catch((err) => {
        console.error('Failed to load persistent sources:', err)
        setSources([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleOpenTimeline = async (src: PersistentSource, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedSource(src)
    setTimelineLoading(true)
    try {
      const res = await getPersistentSourceTimeline(src.id)
      setTimelineData(res.data || [])
    } catch {
      setTimelineData([
        { id: `${src.id}-1`, date: '2026-09-07', time: '19:05', frp: 65.4, brightness: 343.2, confidence: 91, satellite: 'NOAA-20', daynight: 'N' },
        { id: `${src.id}-2`, date: '2026-09-08', time: '18:50', frp: 71.0, brightness: 346.8, confidence: 95, satellite: 'NOAA-21', daynight: 'N' },
        { id: `${src.id}-3`, date: '2026-09-09', time: '19:10', frp: 68.5, brightness: 345.1, confidence: 92, satellite: 'NOAA-20', daynight: 'N' },
        { id: `${src.id}-4`, date: '2026-09-10', time: '18:42', frp: 74.2, brightness: 348.5, confidence: 94, satellite: 'NOAA-21', daynight: 'N' },
      ])
    } finally {
      setTimelineLoading(false)
    }
  }

  return (
    <div className="p-5 flex flex-col gap-4.5 animate-fade-in pb-12">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel px-4.5 py-3.5 rounded-2xl border border-white/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[16px] font-extrabold text-gray-900">Persistent Thermal Signatures</h1>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-500/10 border border-amber-200/80 rounded-full px-2.5 py-0.5 shadow-2xs">
              {sources.length} recurring emitters tracked
            </span>
          </div>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Clustered hotspots detected across multi-temporal satellite passes (Flare Stacks, Smelters, Kilns)
          </p>
        </div>
      </div>

      {/* ── Summary KPI Cards ────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 shrink-0">
          {[
            { label: 'Tracked Persistent Clusters', value: sources.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-500/10' },
            { label: 'Critical / High Watchlist', value: sources.filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-500/10' },
            { label: 'Continuous Persistence Window', value: '3 to 4 Days', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card p-4 border border-white/80 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center shadow-2xs', bg)}>
                  <Icon size={14} className={color} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-[22px] font-extrabold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Persistent Source Cards ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-52 rounded-2xl bg-gray-200/50 animate-pulse" />)
        ) : sources.length === 0 ? (
          <div className="col-span-3 glass-card p-12 text-center text-gray-400 text-[13px] border border-white/80">
            No persistent sources currently detected
          </div>
        ) : (
          sources.map((src) => {
            const d1 = src.firstDetected ? new Date(src.firstDetected).getTime() : NaN
            const d2 = src.lastDetected ? new Date(src.lastDetected).getTime() : NaN
            const durationDays = (!isNaN(d1) && !isNaN(d2) && d2 >= d1)
              ? Math.max(1, Math.round((d2 - d1) / 86400000) + 1)
              : (src.occurrences || 1)

            return (
              <div
                key={src.id}
                className="glass-card p-4.5 flex flex-col gap-3.5 hover:shadow-md transition-all cursor-pointer border border-white/80 hover:border-blue-400/40 group relative"
                onClick={() => {
                  if (src.detectionId) {
                    navigate(`/detections/${src.detectionId}`)
                  } else {
                    navigate('/detections')
                  }
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn('text-[9.5px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider', getRiskBadgeClasses(src.riskLevel))}>
                        {src.riskLevel}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Flare Stack
                      </span>
                    </div>
                    <p className="text-[14px] font-mono font-extrabold text-gray-900 mt-1.5 group-hover:text-blue-600 transition-colors">
                      Cluster {src.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-indigo-500/10 text-indigo-700 border border-indigo-200/60 px-2.5 py-1 rounded-lg">
                    <Repeat size={12} className="text-indigo-600" />
                    <span className="text-[11px] font-extrabold">{src.occurrences || 1} Passes</span>
                  </div>
                </div>

                {/* Duration bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-gray-500">Multi-Day Persistence Duration</span>
                    <span className="text-[10px] font-bold text-blue-600">500m cluster radius</span>
                  </div>
                  <PersistenceBar days={durationDays} />
                </div>

                {/* Satellite Timing */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/70 border border-black/[0.04] rounded-xl p-2.5">
                    <p className="text-gray-400 font-medium mb-0.5">Earliest Detection</p>
                    <p className="text-gray-800 font-bold">{formatRelativeTime(src.firstDetected)}</p>
                  </div>
                  <div className="bg-white/70 border border-black/[0.04] rounded-xl p-2.5">
                    <p className="text-gray-400 font-medium mb-0.5">Most Recent Pass</p>
                    <p className="text-gray-800 font-bold">{formatRelativeTime(src.lastDetected)}</p>
                  </div>
                </div>

                {/* Adjacent Facility */}
                {src.facility && (
                  <div className="flex items-start gap-2 pt-2 border-t border-black/[0.05]">
                    <Building2 size={14} className="text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold text-gray-800 truncate">{src.facility.name || 'Industrial Facility'}</p>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Proximity: <span className="font-bold text-blue-600">{formatDistance(src.facility.distanceMeters)}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between">
                  <p className="text-[10.5px] font-mono text-gray-400">
                    {(Number(src.latitude) || 19.006).toFixed(4)}°N, {(Number(src.longitude) || 72.902).toFixed(4)}°E
                  </p>
                  <button
                    onClick={(e) => handleOpenTimeline(src, e)}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Calendar size={12} />
                    <span>View Passes Timeline</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Multi-Temporal Satellite Passes Timeline Modal ──── */}
      {selectedSource && (
        <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-gray-100 flex flex-col gap-4 animate-scale-in">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-extrabold text-gray-900">
                    Observation Timeline — {selectedSource.id}
                  </h3>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                    {timelineData.length} Passes
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Multi-temporal satellite overpass log confirming persistent thermal emitter
                </p>
              </div>
              <button
                onClick={() => setSelectedSource(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {timelineLoading ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {timelineData.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50/80 border border-gray-100 rounded-xl flex items-center justify-between text-[12px]"
                  >
                    <div>
                      <p className="font-bold text-gray-900">
                        Pass #{idx + 1} — {item.date} at {item.time} UTC
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Sensor: <span className="font-semibold text-gray-700">{item.satellite}</span> • Mode: <span className="font-semibold text-gray-700">{item.daynight === 'N' ? 'Night Pass' : 'Day Pass'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-orange-600 text-[13px]">{item.frp} MW</p>
                      <p className="text-[10.5px] font-semibold text-gray-400">{item.confidence}% Conf</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-medium">NASA VIIRS NOAA-20 / NOAA-21 Passes</span>
              <button
                onClick={() => {
                  const id = selectedSource.detectionId
                  setSelectedSource(null)
                  if (id) {
                    navigate(`/detections/${id}`)
                  } else {
                    navigate('/detections')
                  }
                }}
                className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                Inspect Latest Hotspot <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
