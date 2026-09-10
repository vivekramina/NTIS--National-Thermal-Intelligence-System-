import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Flame, AlertTriangle, Building2, Clock, Zap, Shield, MapPin, Compass } from 'lucide-react'
import { getDetectionById } from '../services/api'
import type { Detection } from '../types'
import { getRiskBadgeClasses, getRiskColor, formatRelativeTime, formatDistance, cn } from '../lib/utils'

export default function DetectionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detection, setDetection] = useState<Detection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getDetectionById(id).then((res) => { setDetection(res.data); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!detection) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertTriangle size={32} className="text-gray-300" />
        <p className="text-[14px] text-gray-500">Detection not found: {id}</p>
        <button onClick={() => navigate('/detections')} className="text-[13px] text-blue-600 hover:text-blue-700">
          ← Back to Detections
        </button>
      </div>
    )
  }

  return (
    <div className="p-5 max-w-3xl animate-fade-in pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Directory
      </button>

      <div className="glass-card p-6 shadow-xs">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider', getRiskBadgeClasses(detection.riskLevel))}>
              {detection.riskLevel} Risk Anomaly
            </span>
            <h1 className="text-[22px] font-extrabold text-gray-900 mt-2 font-mono">{detection.id}</h1>
            <p className="text-[12px] text-gray-400">Detected {formatRelativeTime(detection.detectedAt)} via {detection.source} stream</p>
          </div>
          <AlertTriangle size={28} className={cn(getRiskColor(detection.riskLevel))} />
        </div>

        {/* Location Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 mb-5 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
              <MapPin size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Geographic Location & Sector
              </p>
              <p className="text-[14px] font-bold text-gray-900 mt-0.5 leading-snug">
                {detection.location || 'Industrial Anomaly Sector'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[12px] text-gray-600 font-mono">
                <span className="flex items-center gap-1">
                  <Compass size={13} className="text-gray-400" />
                  {detection.latitude.toFixed(5)}°N, {detection.longitude.toFixed(5)}°E
                </span>
                <span className="text-gray-300">•</span>
                <button
                  onClick={() => navigate('/live-map')}
                  className="text-blue-600 hover:text-blue-700 font-sans font-semibold underline text-[11px]"
                >
                  Locate on Live Map →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Fire Radiative Power', value: `${detection.frp} MW`,        icon: Flame,     color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Confidence Score',     value: `${detection.confidence}%`,   icon: Zap,       color: 'text-blue-500',   bg: 'bg-blue-50' },
            { label: 'Persistence Duration', value: detection.persistenceDays > 0 ? `${detection.persistenceDays} day${detection.persistenceDays !== 1 ? 's' : ''}` : 'New Detection', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Satellite Instrument', value: detection.source,             icon: Shield,    color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center shadow-2xs', bg)}>
                  <Icon size={14} className={color} />
                </div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-[20px] font-extrabold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Nearby facility */}
        {detection.nearbyFacility && (
          <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={14} className="text-blue-600" />
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Adjacent Industrial Facility</span>
            </div>
            <p className="text-[16px] font-bold text-gray-900">{detection.nearbyFacility.name}</p>
            <p className="text-[12px] text-gray-600 mt-1">
              Category: <span className="font-semibold text-gray-800">{detection.nearbyFacility.type}</span> • Proximity: <span className="font-bold text-blue-700">{formatDistance(detection.nearbyFacility.distanceMeters)}</span> from thermal epicenter
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5">
          <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-800 leading-relaxed">
            NASA FIRMS satellite thermal anomalies are indicative of radiative heat signatures. Multi-spectral satellite and ground truth inspection are recommended for confirmed industrial fire event dispatch.
          </p>
        </div>
      </div>
    </div>
  )
}
