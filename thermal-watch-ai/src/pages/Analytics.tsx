import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Flame, Activity, Building2, BarChart2 } from 'lucide-react'
import { getDetections, getDetectionActivity } from '../services/api'
import type { Detection, DetectionActivityPoint } from '../types'

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string; fill?: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel border border-white/80 rounded-xl shadow-xl px-3.5 py-2.5 text-[12px] animate-scale-in z-50">
      {label && <p className="text-gray-500 font-bold text-[11px] uppercase tracking-wider mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-extrabold text-gray-900 text-[13px]">{p.name ? `${p.name}: ` : ''}{p.value}</p>
      ))}
    </div>
  )
}

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH:     '#ea580c',
  MEDIUM:   '#d97706',
  LOW:      '#16a34a',
}

const SOURCE_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669']

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

  // Derived Analytics Data
  const riskData = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((r) => ({
    risk: r,
    count: detections.filter((d) => d.riskLevel === r).length,
    fill: RISK_COLORS[r],
  }))

  const sourceGroups: Record<string, number> = {}
  detections.forEach((d) => { sourceGroups[d.source] = (sourceGroups[d.source] ?? 0) + 1 })
  const sourceData = Object.entries(sourceGroups).map(([name, value]) => ({ name, value }))

  const frpData = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((r) => {
    const group = detections.filter((d) => d.riskLevel === r)
    const avg = group.length > 0 ? Math.round(group.reduce((a, d) => a + d.frp, 0) / group.length) : 0
    return { risk: r, avgFRP: avg, fill: RISK_COLORS[r] }
  })

  const facilityMap: Record<string, { name: string; count: number; maxRisk: string }> = {}
  detections.forEach((d) => {
    if (d.nearbyFacility) {
      const key = d.nearbyFacility.id
      if (!facilityMap[key]) facilityMap[key] = { name: d.nearbyFacility.name, count: 0, maxRisk: d.riskLevel }
      facilityMap[key].count++
    }
  })
  const topFacilities = Object.values(facilityMap).sort((a, b) => b.count - a.count).slice(0, 5)

  // Summary Metrics
  const totalDetections = detections.length
  const industrialCount = detections.filter((d) => d.nearbyFacility && d.nearbyFacility.distanceMeters <= 1000).length
  const industrialRate = totalDetections > 0 ? Math.round((industrialCount / totalDetections) * 100) : 0
  const frpValues = detections.map((d) => d.frp).filter(Boolean)
  const avgFRP = frpValues.length > 0 ? Math.round(frpValues.reduce((a, b) => a + b, 0) / frpValues.length) : 0
  const maxFRP = frpValues.length > 0 ? Math.max(...frpValues) : 0

  const Skeleton = () => <div className="h-full w-full bg-gray-200/50 rounded-xl animate-pulse" />

  return (
    <div className="p-5 flex flex-col gap-4.5 animate-fade-in pb-12">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="glass-panel px-4.5 py-3.5 rounded-2xl border border-white/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-extrabold text-gray-900">Radiometric Analytics & Statistical Trends</h1>
          <p className="text-[11.5px] text-gray-500 mt-0.5">
            Statistical anomaly distributions, radiative energy propagation, and infrastructure spatial correlations
          </p>
        </div>
      </div>

      {/* ── High-Level Statistics Cards ─────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="glass-card p-4 border border-white/80 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Activity size={14} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Anomaly Ingestions</span>
          </div>
          <p className="text-[22px] font-extrabold text-gray-900">{totalDetections}</p>
          <p className="text-[10.5px] text-gray-500 mt-0.5">Synchronized with NASA FIRMS</p>
        </div>

        <div className="glass-card p-4 border border-white/80 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Building2 size={14} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Industrial Proximity Ratio</span>
          </div>
          <p className="text-[22px] font-extrabold text-indigo-700">{industrialRate}%</p>
          <p className="text-[10.5px] text-gray-500 mt-0.5">{industrialCount} within 1,000m corridor</p>
        </div>

        <div className="glass-card p-4 border border-white/80 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Flame size={14} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mean Radiative Power</span>
          </div>
          <p className="text-[22px] font-extrabold text-orange-600">{avgFRP} MW</p>
          <p className="text-[10.5px] text-gray-500 mt-0.5">Average Fire Radiative Power</p>
        </div>

        <div className="glass-card p-4 border border-white/80 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
              <BarChart2 size={14} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Peak Radiative Output</span>
          </div>
          <p className="text-[22px] font-extrabold text-red-600">{maxFRP} MW</p>
          <p className="text-[10.5px] text-gray-500 mt-0.5">Highest thermal intensity event</p>
        </div>
      </div>

      {/* Row 1: Risk distribution + 24h trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5">
        {/* Risk distribution bar */}
        <div className="glass-card p-4.5 border border-white/80 shadow-xs">
          <h2 className="text-[13.5px] font-bold text-gray-900 mb-0.5">Anomalies by Hazard Severity Tier</h2>
          <p className="text-[11px] text-gray-400 mb-4">Operational risk level classification</p>
          {loading ? <div className="h-48"><Skeleton /></div> : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={riskData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="risk" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {riskData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 24h trend line */}
        <div className="glass-card p-4.5 border border-white/80 shadow-xs">
          <h2 className="text-[13.5px] font-bold text-gray-900 mb-0.5">24-Hour Telemetry Frequency</h2>
          <p className="text-[11px] text-gray-400 mb-4">Hourly satellite revisit timeline</p>
          {loading ? <div className="h-48"><Skeleton /></div> : (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={activity} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.05)' }} />
                <Line type="monotone" dataKey="detections" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 2: Avg FRP + Source distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5">
        {/* Avg FRP by risk */}
        <div className="glass-card p-4.5 border border-white/80 shadow-xs">
          <h2 className="text-[13.5px] font-bold text-gray-900 mb-0.5">Mean Radiative Power (FRP) by Tier</h2>
          <p className="text-[11px] text-gray-400 mb-4">Calculated in Megawatts (MW)</p>
          {loading ? <div className="h-48"><Skeleton /></div> : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={frpData} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="risk" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="avgFRP" radius={[0, 6, 6, 0]} name="Avg FRP (MW)">
                  {frpData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Source distribution pie */}
        <div className="glass-card p-4.5 border border-white/80 shadow-xs">
          <h2 className="text-[13.5px] font-bold text-gray-900 mb-0.5">Sensor Ingestion Breakdown</h2>
          <p className="text-[11px] text-gray-400 mb-4">VIIRS (NOAA-20/21) vs. MODIS (Aqua/Terra)</p>
          {loading ? <div className="h-48"><Skeleton /></div> : (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" nameKey="name">
                  {sourceData.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ fontSize: 11, fontWeight: 600, color: '#4b5563' }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 3: Top facilities table */}
      <div className="glass-card overflow-hidden border border-white/80 shadow-xs">
        <div className="px-4.5 py-3 border-b border-black/[0.06] bg-white/40 backdrop-blur-md">
          <h2 className="text-[13.5px] font-bold text-gray-900">Monitored Industrial Complexes with Adjacent Hotspots</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">Facilities correlating with the highest thermal anomaly density</p>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-200/50 rounded-xl animate-pulse" />)}</div>
        ) : (
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-black/[0.06] bg-white/30">
                <th className="text-left px-4.5 py-2.5 text-gray-500 font-bold text-[10.5px] uppercase tracking-wider">Industrial Plant</th>
                <th className="text-left px-4.5 py-2.5 text-gray-500 font-bold text-[10.5px] uppercase tracking-wider">Nearby Anomalies</th>
                <th className="text-left px-4.5 py-2.5 text-gray-500 font-bold text-[10.5px] uppercase tracking-wider">Cluster Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {topFacilities.map((fac, i) => (
                <tr key={i} className="hover:bg-white/60 transition-colors">
                  <td className="px-4.5 py-3 font-bold text-gray-800">{fac.name}</td>
                  <td className="px-4.5 py-3 font-extrabold text-blue-600">{fac.count} detections</td>
                  <td className="px-4.5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-28 h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(fac.count / (topFacilities[0]?.count ?? 1)) * 100}%` }} />
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
