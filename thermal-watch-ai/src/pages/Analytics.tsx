import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getDetections, getDetectionActivity } from '../services/api'
import type { Detection, DetectionActivityPoint } from '../types'

// ── Custom tooltips ──────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string; fill?: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-[12px]">
      {label && <p className="text-gray-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold text-gray-900">{p.name ? `${p.name}: ` : ''}{p.value}</p>
      ))}
    </div>
  )
}

// ── Risk colors ──────────────────────────────────────────────

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH:     '#ea580c',
  MEDIUM:   '#d97706',
  LOW:      '#16a34a',
}

// ── Source colors ────────────────────────────────────────────

const SOURCE_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669']

// ── Analytics page ───────────────────────────────────────────

export default function Analytics() {
  const [detections, setDetections]   = useState<Detection[]>([])
  const [activity,   setActivity]     = useState<DetectionActivityPoint[]>([])
  const [loading,    setLoading]      = useState(true)

  useEffect(() => {
    Promise.all([getDetections(), getDetectionActivity()]).then(([d, a]) => {
      setDetections(d.data)
      setActivity(a.data)
      setLoading(false)
    })
  }, [])

  // ── Derived data ─────────────────────────────────────────

  // By risk level
  const riskData = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((r) => ({
    risk: r,
    count: detections.filter((d) => d.riskLevel === r).length,
    fill: RISK_COLORS[r],
  }))

  // By source
  const sourceGroups: Record<string, number> = {}
  detections.forEach((d) => { sourceGroups[d.source] = (sourceGroups[d.source] ?? 0) + 1 })
  const sourceData = Object.entries(sourceGroups).map(([name, value]) => ({ name, value }))

  // Avg FRP by risk
  const frpData = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((r) => {
    const group = detections.filter((d) => d.riskLevel === r)
    const avg = group.length > 0 ? Math.round(group.reduce((a, d) => a + d.frp, 0) / group.length) : 0
    return { risk: r, avgFRP: avg, fill: RISK_COLORS[r] }
  })

  // Top facilities
  const facilityMap: Record<string, { name: string; count: number; maxRisk: string }> = {}
  detections.forEach((d) => {
    if (d.nearbyFacility) {
      const key = d.nearbyFacility.id
      if (!facilityMap[key]) facilityMap[key] = { name: d.nearbyFacility.name, count: 0, maxRisk: d.riskLevel }
      facilityMap[key].count++
    }
  })
  const topFacilities = Object.values(facilityMap).sort((a, b) => b.count - a.count).slice(0, 5)

  const Skeleton = () => <div className="h-full w-full bg-gray-100 rounded-lg animate-pulse" />

  return (
    <div className="p-5 flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-bold text-gray-900">Analytics</h1>
        <p className="text-[12px] text-gray-400 mt-0.5">Detection trends and statistical analysis</p>
      </div>

      {/* Row 1: Risk distribution + 24h trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk distribution bar */}
        <div className="glass-card p-4">
          <h2 className="text-[14px] font-semibold text-gray-900 mb-1">Detections by Risk Level</h2>
          <p className="text-[11px] text-gray-400 mb-4">Current monitoring period</p>
          {loading ? <div className="h-48"><Skeleton /></div> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={riskData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="risk" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 24h trend line */}
        <div className="glass-card p-4">
          <h2 className="text-[14px] font-semibold text-gray-900 mb-1">24-Hour Detection Trend</h2>
          <p className="text-[11px] text-gray-400 mb-4">Hourly detection frequency</p>
          {loading ? <div className="h-48"><Skeleton /></div> : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={activity} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.05)' }} />
                <Line type="monotone" dataKey="detections" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 2: Avg FRP + Source distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Avg FRP by risk */}
        <div className="glass-card p-4">
          <h2 className="text-[14px] font-semibold text-gray-900 mb-1">Average FRP by Risk Level</h2>
          <p className="text-[11px] text-gray-400 mb-4">Fire Radiative Power (MW)</p>
          {loading ? <div className="h-48"><Skeleton /></div> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={frpData} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="risk" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="avgFRP" radius={[0, 4, 4, 0]} name="Avg FRP (MW)">
                  {frpData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Source distribution pie */}
        <div className="glass-card p-4">
          <h2 className="text-[14px] font-semibold text-gray-900 mb-1">Detections by Source</h2>
          <p className="text-[11px] text-gray-400 mb-4">Satellite instrument breakdown</p>
          {loading ? <div className="h-48"><Skeleton /></div> : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                  {sourceData.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ fontSize: 11, color: '#6b7280' }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 3: Top facilities table */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06]">
          <h2 className="text-[14px] font-semibold text-gray-900">Top Facilities by Detection Count</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Industrial facilities with highest nearby anomaly activity</p>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-black/[0.06] bg-gray-50/50">
                <th className="text-left px-4 py-2.5 text-gray-400 font-medium text-[11px] uppercase tracking-wider">Facility</th>
                <th className="text-left px-4 py-2.5 text-gray-400 font-medium text-[11px] uppercase tracking-wider">Detections</th>
                <th className="text-left px-4 py-2.5 text-gray-400 font-medium text-[11px] uppercase tracking-wider">Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {topFacilities.map((fac, i) => (
                <tr key={i} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-800">{fac.name}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{fac.count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(fac.count / (topFacilities[0]?.count ?? 1)) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
