import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Flame, TrendingUp, Building2, Sparkles, Layers, Calendar, Zap, Activity
} from 'lucide-react'
import type { DetectionActivityPoint } from '../../types'
import { formatNumber, cn } from '../../lib/utils'
import {
  getTelemetryForRange,
  calculateTelemetryMetrics,
} from '../../data/telemetryTrends'
import type { RangeOption, TelemetryMetricView } from '../../data/telemetryTrends'

// ── Rich Interactive Tooltip ─────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
  viewMode,
}: {
  active?: boolean
  payload?: Array<{ value: number; payload: DetectionActivityPoint }>
  label?: string
  viewMode: TelemetryMetricView
}) {
  if (!active || !payload?.length) return null

  const pt: DetectionActivityPoint = payload[0].payload
  const industrial = pt.industrial ?? Math.round(pt.detections * 0.63)
  const biomass = pt.biomass ?? Math.max(0, pt.detections - industrial)
  const indPct = pt.detections > 0 ? Math.round((industrial / pt.detections) * 100) : 0
  const bioPct = 100 - indPct
  const avgFrp = pt.avgFrp ?? 46.5
  const fullDate = pt.fullDate || label

  return (
    <div className="glass-panel border border-white/90 rounded-xl shadow-2xl p-3.5 text-[12px] animate-scale-in z-50 min-w-[220px] bg-white/95 backdrop-blur-md">
      {/* Tooltip Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-black/[0.06]">
        <div className="flex items-center gap-1.5 text-gray-700 font-bold">
          <Calendar size={13} className="text-blue-600 shrink-0" />
          <span className="text-[11px] text-gray-900 tracking-tight">{fullDate}</span>
        </div>
        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          FIRMS Telemetry
        </span>
      </div>

      {/* Primary Value */}
      <div className="mt-2.5 mb-2">
        {viewMode === 'frp' ? (
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Radiative Power (FRP)</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[18px] font-black text-purple-700">{avgFrp}</span>
              <span className="text-[12px] font-bold text-gray-500">MegaWatts (MW)</span>
            </div>
          </div>
        ) : (
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Hotspot Anomalies</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[18px] font-black text-blue-700">{pt.detections}</span>
              <span className="text-[12px] font-bold text-gray-500">detected</span>
            </div>
          </div>
        )}
      </div>

      {/* Sector Classification Breakdown */}
      <div className="space-y-1.5 pt-2 border-t border-black/[0.05]">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            <span className="text-gray-600 font-medium">Industrial & Flares</span>
          </div>
          <span className="font-extrabold text-gray-900">
            {industrial} <span className="text-gray-400 text-[10px]">({indPct}%)</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-gray-600 font-medium">Biomass & Agriculture</span>
          </div>
          <span className="font-extrabold text-gray-900">
            {biomass} <span className="text-gray-400 text-[10px]">({bioPct}%)</span>
          </span>
        </div>

        {viewMode !== 'frp' && (
          <div className="flex items-center justify-between text-[11px] pt-1 text-gray-500">
            <span>Avg Fire Power</span>
            <span className="font-bold text-purple-700">{avgFrp} MW</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface DetectionActivityProps {
  data?: DetectionActivityPoint[]
  loading?: boolean
  className?: string
}

export default function DetectionActivity({ data, loading, className }: DetectionActivityProps) {
  const [range, setRange] = useState<RangeOption>('24h')
  const [viewMode, setViewMode] = useState<TelemetryMetricView>('stacked')

  // Pick dataset based on requested range, falling back to rich realistic time series
  const chartData = useMemo(() => {
    if (range === '24h') {
      // If parent provided at least 12 hourly entries, use them; otherwise use our verified 24h diurnal series
      if (data && data.length >= 12) {
        return data
      }
      return getTelemetryForRange('24h')
    }
    return getTelemetryForRange(range)
  }, [data, range])

  // Aggregate telemetry metrics for the active timeframe
  const metrics = useMemo(() => {
    return calculateTelemetryMetrics(chartData, range)
  }, [chartData, range])

  // Adaptive X-Axis interval so tick labels never collide
  const xAxisInterval = useMemo(() => {
    if (range === '24h') return 2 // Every 3rd hour: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
    if (range === '7d') return 0  // Every day: Sep 05, Sep 06, Sep 07...
    if (range === '30d') return 4 // Every 5 days
    if (range === '90d') return 3 // Every 10-12 days
    return 0
  }, [range])

  return (
    <div className={cn('glass-card p-5 transition-all duration-200 overflow-hidden relative border border-white/80', className)}>
      {/* ── Top Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
              <Activity size={16} className="text-blue-600" />
              <span>Detection Telemetry Trend</span>
            </h2>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-200/80 px-2 py-0.5 rounded-full shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Stream
            </span>
            <span className="hidden sm:inline-block text-[11px] font-bold text-gray-500 bg-black/[0.04] px-2 py-0.5 rounded-full">
              {metrics.timeframeLabel}
            </span>
          </div>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Continuous multi-satellite radiometric frequency, thermal flux & sector classification
          </p>
        </div>

        {/* View Mode & Range Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layer/Metric Switcher */}
          <div className="flex bg-black/[0.04] p-0.5 rounded-xl border border-black/[0.04]">
            <button
              onClick={() => setViewMode('stacked')}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all duration-150',
                viewMode === 'stacked'
                  ? 'bg-white text-gray-900 shadow-2xs font-extrabold'
                  : 'text-gray-500 hover:text-gray-900'
              )}
              title="Stacked Sector Breakdown (Industrial vs Biomass)"
            >
              <Layers size={12} />
              <span>Sectors</span>
            </button>
            <button
              onClick={() => setViewMode('total')}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all duration-150',
                viewMode === 'total'
                  ? 'bg-white text-gray-900 shadow-2xs font-extrabold'
                  : 'text-gray-500 hover:text-gray-900'
              )}
              title="Total Ingestion Volume"
            >
              <Flame size={12} />
              <span>Total</span>
            </button>
            <button
              onClick={() => setViewMode('frp')}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all duration-150',
                viewMode === 'frp'
                  ? 'bg-white text-purple-900 shadow-2xs font-extrabold'
                  : 'text-gray-500 hover:text-gray-900'
              )}
              title="Fire Radiative Power (MW)"
            >
              <Zap size={12} className="text-purple-600" />
              <span>Power (MW)</span>
            </button>
          </div>

          {/* Timeframe Range Selector (Including Extended 90-Day View) */}
          <div className="flex bg-black/[0.04] p-0.5 rounded-xl border border-black/[0.04]">
            {(['24h', '7d', '30d', '90d'] as RangeOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setRange(opt)}
                className={cn(
                  'px-3 py-1 text-[11px] font-bold rounded-lg transition-all duration-150',
                  range === opt
                    ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4 Key Telemetry Stat Cards (At-a-Glance Clarity) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        {/* Total Anomalies */}
        <div className="glass-panel p-2.5 rounded-xl border border-black/[0.05] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Flame size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Hotspots</p>
            <p className="text-[16px] font-extrabold text-gray-900 leading-tight">
              {formatNumber(metrics.totalDetections)}
            </p>
            <p className="text-[10px] text-gray-400 truncate">{range === '90d' ? '3-month archive' : 'in current scope'}</p>
          </div>
        </div>

        {/* Peak Spike */}
        <div className="glass-panel p-2.5 rounded-xl border border-black/[0.05] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            <TrendingUp size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Peak Activity Spike</p>
            <p className="text-[16px] font-extrabold text-gray-900 leading-tight">
              {metrics.peakPoint.time} <span className="text-blue-600 text-[13px]">({metrics.peakPoint.detections})</span>
            </p>
            <p className="text-[10px] text-gray-400 truncate">Max sensor overpass surge</p>
          </div>
        </div>

        {/* Sector Classification Ratio */}
        <div className="glass-panel p-2.5 rounded-xl border border-black/[0.05] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[10px] font-bold mb-1">
              <span className="text-blue-700">{metrics.industrialPct}% Industrial</span>
              <span className="text-amber-700">{metrics.biomassPct}% Agri</span>
            </div>
            {/* Visual ratio bar */}
            <div className="w-full h-1.5 rounded-full bg-amber-200 overflow-hidden flex">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${metrics.industrialPct}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 truncate">Continuous vs Biomass</p>
          </div>
        </div>

        {/* Average Radiative Power */}
        <div className="glass-panel p-2.5 rounded-xl border border-black/[0.05] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Zap size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Mean Radiative Power</p>
            <p className="text-[16px] font-extrabold text-purple-700 leading-tight">
              {metrics.avgFrp} <span className="text-[11px] font-bold text-gray-500">MW</span>
            </p>
            <p className="text-[10px] text-gray-400 truncate">Thermal energy intensity</p>
          </div>
        </div>
      </div>

      {/* ── Chart Body with Clear Legibility ─────────────────── */}
      {loading ? (
        <div className="h-[200px] rounded-xl bg-gray-200/50 animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-[11px] text-gray-400">Aggregating multi-satellite telemetry…</span>
          </div>
        </div>
      ) : (
        <div className="h-[200px] sm:h-[220px] w-full pb-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -4, bottom: 4 }}>
              <defs>
                {/* Industrial Gradient (Blue) */}
                <linearGradient id="industrialGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.40} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>

                {/* Biomass Gradient (Amber) */}
                <linearGradient id="biomassGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                </linearGradient>

                {/* Total Hotspots Gradient (Cyan-Blue) */}
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.01} />
                </linearGradient>

                {/* Fire Radiative Power Gradient (Purple) */}
                <linearGradient id="frpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />

              <XAxis
                dataKey="time"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
                tickLine={false}
                interval={xAxisInterval}
              />

              <YAxis
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={36}
                unit={viewMode === 'frp' ? ' MW' : ''}
              />

              <Tooltip
                content={<CustomTooltip viewMode={viewMode} />}
                cursor={{ stroke: 'rgba(37,99,235,0.3)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              />

              {viewMode === 'stacked' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="industrial"
                    name="Industrial Facilities"
                    stackId="1"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#industrialGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="biomass"
                    name="Biomass & Agriculture"
                    stackId="1"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#biomassGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#f97316', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </>
              ) : viewMode === 'total' ? (
                <Area
                  type="monotone"
                  dataKey="detections"
                  name="Total Hotspots"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fill="url(#totalGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="avgFrp"
                  name="Avg Radiative Power (MW)"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#frpGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Deep Detail Commentary & Legend Strip ───────────── */}
      <div className="mt-3 pt-3 border-t border-black/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-gray-500">
        <div className="flex items-start gap-2 max-w-3xl">
          <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-gray-800 mr-1.5">Telemetry Pattern Analysis:</span>
            <span>{metrics.trendDescription}</span>
          </div>
        </div>

        {/* Color Legend for Immediate Understanding */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          {viewMode === 'stacked' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-[11px] font-semibold text-gray-700">Industrial / Flares</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[11px] font-semibold text-gray-700">Biomass / Agri</span>
              </div>
            </>
          ) : viewMode === 'total' ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              <span className="text-[11px] font-semibold text-gray-700">Total Detections</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span className="text-[11px] font-semibold text-gray-700">Radiative Power (MW)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
