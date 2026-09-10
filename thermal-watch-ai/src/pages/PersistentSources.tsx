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
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', days >= 5 ? 'bg-red-500' : days >= 3 ? 'bg-orange-400' : 'bg-amber-400')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-gray-500 w-10 shrink-0">{days}d</span>
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
    <div className="p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">Persistent Sources</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Thermal anomalies detected across multiple satellite passes</p>
        </div>
        <span className="text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
          {sources.length} active sources
        </span>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 shrink-0">
          {[
            { label: 'Total Persistent', value: sources.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Critical / High', value: sources.filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Avg. Duration (days)', value: sources.length > 0 ? (sources.reduce((a, s) => a + (new Date(s.lastDetected).getTime() - new Date(s.firstDetected).getTime()), 0) / sources.length / 86400000).toFixed(1) : '0', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', bg)}>
                  <Icon size={14} className={color} />
                </div>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-[24px] font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Source cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse" />)
        ) : sources.length === 0 ? (
          <div className="col-span-3 glass-card p-12 text-center text-gray-400 text-[13px]">
            No persistent sources detected
          </div>
        ) : (
          sources.map((src) => {
            const durationDays = Math.round((new Date(src.lastDetected).getTime() - new Date(src.firstDetected).getTime()) / 86400000)
            return (
              <div
                key={src.id}
                className="glass-card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/detections/${src.detectionId}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider', getRiskBadgeClasses(src.riskLevel))}>
                      {src.riskLevel}
                    </span>
                    <p className="text-[12px] font-mono text-gray-500 mt-1">{src.id}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Repeat size={13} className="text-indigo-500" />
                    <span className="text-[12px] font-semibold text-gray-700">{src.occurrences}×</span>
                  </div>
                </div>

                {/* Duration bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-400">Persistence duration</span>
                    <AlertTriangle size={11} className={cn(getRiskColor(src.riskLevel))} />
                  </div>
                  <PersistenceBar days={durationDays} />
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 mb-0.5">First detected</p>
                    <p className="text-gray-700 font-medium">{formatRelativeTime(src.firstDetected)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 mb-0.5">Last detected</p>
                    <p className="text-gray-700 font-medium">{formatRelativeTime(src.lastDetected)}</p>
                  </div>
                </div>

                {/* Facility */}
                {src.facility && (
                  <div className="flex items-start gap-2 pt-2 border-t border-black/[0.05]">
                    <Building2 size={13} className="text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-gray-800 truncate">{src.facility.name}</p>
                      <p className="text-[11px] text-gray-500">{src.facility.type} • {formatDistance(src.facility.distanceMeters)}</p>
                    </div>
                  </div>
                )}

                {/* Coords */}
                <p className="text-[10px] font-mono text-gray-300">{src.latitude.toFixed(3)}°N, {src.longitude.toFixed(3)}°E</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
