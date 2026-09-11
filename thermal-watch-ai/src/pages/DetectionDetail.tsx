import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Flame,
  AlertTriangle,
  Building2,
  Clock,
  Zap,
  Shield,
  MapPin,
  Compass,
  CheckCircle2,
  Cpu,
  Layers,
  Satellite,
} from 'lucide-react'
import { getDetectionById } from '../services/api'
import type { Detection } from '../types'
import { getRiskBadgeClasses, getRiskColor, formatRelativeTime, formatDistance, cn } from '../lib/utils'
import { getFacilityIntelligence } from '../data/facilityIntelligence'

export default function DetectionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detection, setDetection] = useState<Detection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getDetectionById(id).then((res) => {
      setDetection(res.data)
      setLoading(false)
    })
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
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <AlertTriangle size={32} className="text-gray-300" />
        <p className="text-[14px] text-gray-600 font-medium">Detection signature not found: {id}</p>
        <button
          onClick={() => navigate('/detections')}
          className="text-[13px] text-blue-600 hover:text-blue-700 font-bold"
        >
          ← Return to Detections Directory
        </button>
      </div>
    )
  }

  return (
    <div className="p-5 max-w-4xl animate-fade-in pb-12 mx-auto">
      {/* ── Back button ──────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Telemetry Index
      </button>

      <div className="glass-card p-6 shadow-xs border border-white/80 flex flex-col gap-5">
        
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-black/[0.05]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider', getRiskBadgeClasses(detection.riskLevel))}>
                {detection.riskLevel} Risk Hazard
              </span>
              {detection.isPersistent && (
                <span className="text-[11px] font-bold bg-amber-500/15 text-amber-800 border border-amber-300/80 px-2 py-0.5 rounded-md">
                  Persistent Heat Emitter
                </span>
              )}
            </div>
            <h1 className="text-[20px] font-extrabold text-gray-900 mt-2 font-mono tracking-tight">{detection.id}</h1>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Detected {formatRelativeTime(detection.detectedAt)} via {detection.source} stream
            </p>
          </div>
          <AlertTriangle size={28} className={cn('shrink-0', getRiskColor(detection.riskLevel))} />
        </div>

        {/* ── Geographic Epicenter ────────────────────────── */}
        <div className="bg-white/80 border border-black/[0.06] rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8.5 h-8.5 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0 shadow-2xs border border-red-200/60">
              <MapPin size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Geographic Epicenter & Location
              </p>
              <p className="text-[14px] font-bold text-gray-900 mt-0.5 leading-snug">
                {detection.location || 'Industrial Corridor Anomaly Sector'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[12px] text-gray-600 font-mono flex-wrap">
                <span className="flex items-center gap-1">
                  <Compass size={13} className="text-gray-400" />
                  {detection.latitude.toFixed(5)}°N, {detection.longitude.toFixed(5)}°E
                </span>
                <span className="text-gray-300">•</span>
                <button
                  onClick={() =>
                    navigate(`/live-map?detectionId=${encodeURIComponent(detection.id)}&lat=${detection.latitude}&lng=${detection.longitude}`)
                  }
                  className="text-blue-600 hover:text-blue-700 font-sans font-bold underline text-[11px] cursor-pointer inline-flex items-center gap-1"
                >
                  Locate on Geospatial Map →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Key Metrics Grid ────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Fire Radiative Power', value: `${detection.frp} MW`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Detection Confidence', value: `${detection.confidence}%`, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Persistence Window', value: detection.persistenceDays > 0 ? `${detection.persistenceDays} days` : 'Single Pass', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Sensor Payload', value: detection.source, icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white/60 border border-black/[0.04] rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center shrink-0', bg)}>
                  <Icon size={13} className={color} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{label}</span>
              </div>
              <p className="text-[17px] font-extrabold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Explainable AI Classification & Rationale ───── */}
        <div className="bg-blue-50/40 border border-blue-200/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-blue-600" />
              <h3 className="text-[13px] font-bold text-blue-900">AI Hazard Classification & Decision Rationale</h3>
            </div>
            {detection.classificationConfidence && (
              <span className="text-[11px] font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                {Math.round(detection.classificationConfidence)}% Confidence
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-gray-500 font-semibold">Predicted Category:</span>
            <span className="text-[12px] font-extrabold text-gray-900 font-mono bg-white px-2 py-0.5 rounded-lg border border-black/[0.06] shadow-2xs">
              {detection.classification || 'HIGH_CONFIDENCE_INDUSTRIAL_FIRE'}
            </span>
          </div>

          {/* AI Evidence Bullet Points */}
          <div className="space-y-2 mt-2">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Deterministic Evidence Factors:</p>
            <ul className="space-y-1.5">
              {detection.classificationReasons && detection.classificationReasons.length > 0 ? (
                detection.classificationReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[12px] text-gray-800 leading-snug">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2 text-[12px] text-gray-800 leading-snug">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>Thermal anomaly detected within industrial manufacturing corridor.</span>
                  </li>
                  <li className="flex items-start gap-2 text-[12px] text-gray-800 leading-snug">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>FRP output exceeds standard non-industrial background thermal signatures.</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* ── Adjacent Industrial Complex & Company Intelligence ── */}
        {(() => {
          const facIntel = getFacilityIntelligence(
            detection.nearbyFacility?.id || detection.nearbyFacility?.name,
            detection.location,
            detection.frp
          )
          return (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-200/70">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-blue-600" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Industrial Plant Intelligence
                    </span>
                    {detection.nearbyFacility && (
                      <span className="text-[10px] font-bold bg-blue-100/70 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                        OSM Verified Node
                      </span>
                    )}
                  </div>
                  <h3 className="text-[16px] font-extrabold text-gray-900 mt-1">{facIntel.name}</h3>
                  <p className="text-[12px] text-gray-500 font-medium">
                    {facIntel.sector} • {facIntel.capacity}
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate(`/live-map?detectionId=${encodeURIComponent(detection.id)}&lat=${detection.latitude}&lng=${detection.longitude}`)
                  }
                  className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <Compass size={14} />
                  <span>Open on Geospatial Map →</span>
                </button>
              </div>

              {/* What the company actually does */}
              <div className="bg-white/90 border border-black/[0.04] rounded-xl p-4 shadow-2xs">
                <p className="text-[10.5px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>🏢 What This Facility Actually Does</span>
                </p>
                <p className="text-[13px] text-gray-800 leading-relaxed font-medium">
                  {facIntel.whatItDoes}
                </p>
                <div className="mt-3 pt-3 border-t border-black/[0.04]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Core Industrial Processes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facIntel.operations.map((op, idx) => (
                      <span key={idx} className="text-[10.5px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80">
                        {op}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* How much heat it produces */}
              <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-200/80 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Flame size={16} className="text-orange-600 animate-pulse" />
                    <p className="text-[11.5px] font-extrabold text-orange-950 uppercase tracking-wider">
                      Thermal Output & Heat Generation Profile
                    </p>
                  </div>
                  <span className="text-[11px] font-extrabold bg-orange-500/20 text-orange-800 px-2.5 py-0.5 rounded-md border border-orange-300/60">
                    Active Radiative FRP: {detection.frp} MW
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                  <div className="bg-white/85 border border-orange-100 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estimated Core Combustion Temp</p>
                    <p className="text-[16px] font-black text-gray-900 mt-0.5">{facIntel.heatProduced.typicalTemperature}</p>
                  </div>
                  <div className="bg-white/85 border border-orange-100 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Baseline Thermal Range</p>
                    <p className="text-[16px] font-black text-orange-600 mt-0.5">{facIntel.heatProduced.baselineFRP}</p>
                  </div>
                </div>

                <p className="text-[12px] text-gray-700 leading-relaxed font-medium">
                  {facIntel.heatProduced.heatDescription}
                </p>

                <div className="mt-3 pt-2.5 border-t border-orange-200/60">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Primary Plant Heat Sources:</p>
                  <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-1 font-medium">
                    {facIntel.heatProduced.heatSources.map((hs, i) => (
                      <li key={i}>{hs}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Proximity Details */}
              {detection.nearbyFacility && (
                <div className="text-[11.5px] text-gray-600 font-medium flex items-center justify-between flex-wrap gap-2 pt-1">
                  <span>
                    📍 Distance: <span className="font-extrabold text-blue-700">{formatDistance(detection.nearbyFacility.distanceMeters)}</span> from anomaly epicenter
                  </span>
                  <span>
                    Safety Buffer Perimeter: <span className="font-bold text-gray-900">{facIntel.safetyBufferMeters} meters</span>
                  </span>
                </div>
              )}
            </div>
          )
        })()}

        {/* ── Copernicus Satellite Optical & Land Cover Metadata ─ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white/60 border border-black/[0.04] rounded-2xl p-3.5 flex items-start gap-2.5">
            <Satellite size={15} className="text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Copernicus Sentinel-2 Scene</p>
              <p className="text-[12px] font-bold text-gray-800 mt-0.5 font-mono truncate max-w-[280px]">
                {detection.satelliteSceneId || 'S2B_MSIL2A_20260910T053649_T43QDA'}
              </p>
            </div>
          </div>

          <div className="bg-white/60 border border-black/[0.04] rounded-2xl p-3.5 flex items-start gap-2.5">
            <Layers size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ESA WorldCover Land-Cover</p>
              <p className="text-[12px] font-bold text-gray-800 mt-0.5 font-mono">
                {detection.landCoverClass || 'industrial_builtup'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
