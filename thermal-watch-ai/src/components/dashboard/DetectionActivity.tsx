import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { DetectionActivityPoint } from '../../types'
import { cn } from '../../lib/utils'

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl px-3.5 py-2.5 text-[12px] animate-scale-in z-50">
      <p className="text-gray-400 font-medium text-[11px]">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        <p className="text-gray-900 font-bold text-[13px]">
          {payload[0].value} <span className="text-gray-500 font-normal text-[11px]">detections</span>
        </p>
      </div>
    </div>
  )
}

interface DetectionActivityProps {
  data: DetectionActivityPoint[]
  loading?: boolean
  className?: string
}

type RangeOption = '24h' | '7d' | '30d'

export default function DetectionActivity({ data, loading, className }: DetectionActivityProps) {
  const [range, setRange] = useState<RangeOption>('24h')

  // Generate responsive mock series when toggling ranges
  const chartData = useMemo(() => {
    if (range === '24h') return data
    if (range === '7d') {
      return [
        { time: 'Mon', detections: 18 },
        { time: 'Tue', detections: 24 },
        { time: 'Wed', detections: 31 },
        { time: 'Thu', detections: 22 },
        { time: 'Fri', detections: 39 },
        { time: 'Sat', detections: 28 },
        { time: 'Sun', detections: 27 },
      ]
    }
    return [
      { time: 'Week 1', detections: 142 },
      { time: 'Week 2', detections: 189 },
      { time: 'Week 3', detections: 164 },
      { time: 'Week 4', detections: 198 },
    ]
  }, [data, range])

  const peak = useMemo(() => {
    return chartData.reduce(
      (acc, pt) => (pt.detections > acc.detections ? pt : acc),
      chartData[0] ?? { time: '--', detections: 0 }
    )
  }, [chartData])

  return (
    <div className={cn('glass-card p-4.5 transition-all duration-200 overflow-hidden relative', className)}>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-bold text-gray-900">Detection Activity</h2>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
              Telemetry Trend
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {range === '24h' ? 'Last 24 hours timeline' : range === '7d' ? 'Past 7 days aggregated' : 'Past 30 days summary'}
          </p>
        </div>

        {/* Range Selector Pills & Peak Insight */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/60">
            {(['24h', '7d', '30d'] as RangeOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setRange(opt)}
                className={cn(
                  'px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all duration-150',
                  range === opt
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="text-right pl-2 border-l border-gray-100">
            <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Peak Period</p>
            <p className="text-[12px] font-bold text-gray-800 leading-tight">
              {peak.time} <span className="text-[11px] font-semibold text-blue-600">({peak.detections})</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Chart Body with safe padding ─────────────────── */}
      {loading ? (
        <div className="h-[150px] rounded-xl bg-gray-100 animate-pulse" />
      ) : (
        <div className="h-[150px] w-full pb-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 6, right: 8, left: -22, bottom: 4 }}>
              <defs>
                <linearGradient id="thermalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={range === '24h' ? 1 : 0}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(37,99,235,0.2)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="detections"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#thermalGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
