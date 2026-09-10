import { useNavigate } from 'react-router-dom'
import { ArrowRight, AlertTriangle, Flame, Clock, Building2, Zap, Shield, MapPin } from 'lucide-react'
import type { Detection } from '../../types'
import { getRiskBadgeClasses, getRiskColor, formatRelativeTime, formatDistance, cn } from '../../lib/utils'

export default function DetectionPopup({ detection }: { detection: Detection }) {
  const navigate = useNavigate()
  const riskLabel =
    detection.riskLevel === 'CRITICAL'
      ? 'Critical Risk'
      : detection.riskLevel === 'HIGH'
      ? 'High Risk'
      : detection.riskLevel === 'MEDIUM'
      ? 'Medium Risk'
      : 'Low Risk'

  return (
    <div className="min-w-[240px] max-w-[280px] p-1 select-none">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider', getRiskBadgeClasses(detection.riskLevel))}>
            {riskLabel}
          </span>
          <p className="text-[12px] font-bold text-gray-900 font-mono mt-1">{detection.id}</p>
        </div>
        <AlertTriangle size={18} className={cn(getRiskColor(detection.riskLevel), 'shrink-0 mt-0.5')} />
      </div>

      {/* ── Location Badge ───────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 mb-2.5">
        <div className="flex items-start gap-1.5">
          <MapPin size={13} className="text-red-500 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-gray-900 leading-snug">
              {detection.location || `${detection.latitude.toFixed(4)}°N, ${detection.longitude.toFixed(4)}°E`}
            </p>
            <p className="text-[10px] font-mono text-gray-400 mt-0.5">
              {detection.latitude.toFixed(4)}°N, {detection.longitude.toFixed(4)}°E
            </p>
          </div>
        </div>
      </div>

      {/* ── Telemetry Grid ───────────────────────────────── */}
      <div className="space-y-1.5 mb-2.5 bg-white p-2 rounded-lg border border-gray-100">
        {[
          { icon: Flame, iconCls: 'text-orange-500', label: 'FRP (Intensity)', value: `${detection.frp} MW` },
          { icon: Zap, iconCls: 'text-blue-500', label: 'Confidence', value: `${detection.confidence}%` },
          { icon: Clock, iconCls: 'text-amber-500', label: 'Persistence', value: detection.persistenceDays > 0 ? `${detection.persistenceDays} days` : 'New Hotspot' },
          { icon: Shield, iconCls: 'text-purple-500', label: 'Satellite Feed', value: detection.source },
        ].map(({ icon: Icon, iconCls, label, value }) => (
          <div key={label} className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Icon size={12} className={iconCls} />
              {label}
            </span>
            <span className="font-bold text-gray-900">{value}</span>
          </div>
        ))}
      </div>

      {/* ── Nearby Industrial Firm ───────────────────────── */}
      {detection.nearbyFacility && (
        <div className="border border-blue-100 bg-blue-50/60 rounded-lg p-2 mb-2.5">
          <div className="flex items-start gap-1.5">
            <Building2 size={13} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-gray-900 leading-tight truncate">
                {detection.nearbyFacility.name}
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {detection.nearbyFacility.type} • <span className="font-bold text-blue-700">{formatDistance(detection.nearbyFacility.distanceMeters)}</span> away
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-400 mb-2.5">
        Detected {formatRelativeTime(detection.detectedAt)} • Satellite telemetry
      </p>

      {/* ── Action CTA ───────────────────────────────────── */}
      <button
        onClick={() => navigate(`/detections/${detection.id}`)}
        className="w-full flex items-center justify-center gap-1.5 text-[12px] font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 rounded-xl py-2 transition-all shadow-2xs"
      >
        View Full Analysis <ArrowRight size={13} />
      </button>
    </div>
  )
}
