import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Clock, AlertTriangle, Building2, Repeat } from 'lucide-react'
import { getPersistentSources } from '../services/api'
import type { PersistentSource } from '../types'
import { getRiskBadgeClasses, getRiskColor, formatRelativeTime, formatDistance, cn } from '../lib/utils'

function PersistenceBar({ days, maxDays = 7 }: { days: number; maxDays?: number }) {
  const pct = Math.min(100, (days / maxDays) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', days >= 5 ? 'bg-red-500' : days >= 3 ? 'bg-orange-400' : 'bg-amber-400')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-bold text-gray-500 w-10 shrink-0">{days}d</span>
    </div>
  )
}

export default function PersistentSources() {
  const [sources, setSources] = useState<PersistentSource[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getPersistentSources().then((res) => { setSources(res.data); setLoading(false) })
  }, [])

  return (
    <div className="p-5 flex flex-col gap-4.5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4.5 rounded-2xl border border-white/80 shadow-xs">
        <div>
          <h1 className="text-[18px] font-extrabold text-gray-900">Persistent Thermal Signatures</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Recurring hotspot anomalies detected across multi-temporal orbital passes</p>
        </div>
        <span className="text-[11px] font-bold text-amber-800 bg-amber-500/10 border border-amber-200/80 rounded-full px-3 py-1 shadow-2xs">
          {sources.length} recurring emitters active
        </span>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 shrink-0">
          {[
            { label: 'Active Hotspot Locations', value: sources.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-500/10' },
            { label: 'Critical / High Watchlist', value: sources.filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-500/10' },
            { label: 'Mean Recurrence Window', value: sources.length > 0 ? `${(sources.reduce((a, s) => a + (new Date(s.lastDetected).getTime() - new Date(s.firstDetected).getTime()), 0) / sources.length / 86400000).toFixed(1)} days` : '0 days', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card p-4 border border-white/80">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-7.5 h-7.5 rounded-xl flex items-center justify-center shadow-2xs', bg)}>
                  <Icon size={15} className={color} />
                </div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-[24px] font-extrabold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Source cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-gray-200/50 animate-pulse" />)
        ) : sources.length === 0 ? (
          <div className="col-span-3 glass-card p-12 text-center text-gray-400 text-[13px] border border-white/80">
            No persistent sources currently detected
          </div>
        ) : (
          sources.map((src) => {
            const durationDays = Math.round((new Date(src.lastDetected).getTime() - new Date(src.firstDetected).getTime()) / 86400000)
            return (
              <div
                key={src.id}
                className="glass-card p-4.5 flex flex-col gap-3.5 hover:shadow-md transition-shadow cursor-pointer border border-white/80 hover:border-blue-400/40 group"
                onClick={() => navigate(`/detections/${src.detectionId}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider', getRiskBadgeClasses(src.riskLevel))}>
                      {src.riskLevel}
                    </span>
                    <p className="text-[13px] font-mono font-bold text-gray-800 mt-1 group-hover:text-blue-600 transition-colors">{src.id}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-indigo-500/10 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                    <Repeat size={12} className="text-indigo-600" />
                    <span className="text-[11px] font-bold">{src.occurrences} passes</span>
                  </div>
                </div>

                {/* Duration bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-gray-500">Persistence window</span>
                    <AlertTriangle size={12} className={cn(getRiskColor(src.riskLevel))} />
                  </div>
                  <PersistenceBar days={durationDays} />
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/60 border border-black/[0.04] rounded-xl p-2.5">
                    <p className="text-gray-400 font-medium mb-0.5">Initial Ingestion</p>
                    <p className="text-gray-800 font-bold">{formatRelativeTime(src.firstDetected)}</p>
                  </div>
                  <div className="bg-white/60 border border-black/[0.04] rounded-xl p-2.5">
                    <p className="text-gray-400 font-medium mb-0.5">Latest Pass</p>
                    <p className="text-gray-800 font-bold">{formatRelativeTime(src.lastDetected)}</p>
                  </div>
                </div>

                {/* Facility */}
                {src.facility && (
                  <div className="flex items-start gap-2 pt-2 border-t border-black/[0.05]">
                    <Building2 size={14} className="text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-gray-800 truncate">{src.facility.name}</p>
                      <p className="text-[11px] text-gray-500 font-medium">{src.facility.type} • {formatDistance(src.facility.distanceMeters)}</p>
                    </div>
                  </div>
                )}

                {/* Coords */}
                <p className="text-[10px] font-mono text-gray-400">{src.latitude.toFixed(4)}°N, {src.longitude.toFixed(4)}°E</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

