import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, ArrowUpDown, ExternalLink, Download, RotateCcw } from 'lucide-react'
import { getDetections } from '../services/api'
import { useApp } from '../context/AppContext'
import type { Detection, RiskLevel } from '../types'
import { getRiskBadgeClasses, getRiskDotColor, formatRelativeTime, formatDistance, cn } from '../lib/utils'

const RISK_OPTIONS: Array<{ label: string; value: RiskLevel | 'ALL' }> = [
  { label: 'All Risks', value: 'ALL' },
  { label: 'Critical',  value: 'CRITICAL' },
  { label: 'High',      value: 'HIGH' },
  { label: 'Medium',    value: 'MEDIUM' },
  { label: 'Low',       value: 'LOW' },
]

const SOURCE_OPTIONS = ['ALL', 'FIRMS', 'VIIRS', 'MODIS', 'SENTINEL']

type SortKey = 'detectedAt' | 'frp' | 'confidence' | 'riskLevel'
type SortDir = 'asc' | 'desc'

const RISK_ORDER: Record<RiskLevel, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }

export default function Detections() {
  const { addToast } = useApp()
  const [detections, setDetections] = useState<Detection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL')
  const [sourceFilter, setSourceFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('detectedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const PAGE_SIZE = 6

  useEffect(() => {
    getDetections().then((res) => {
      setDetections(res.data)
      setLoading(false)
    })
  }, [])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  const filtered = detections
    .filter((d) => {
      const q = search.toLowerCase()
      const matchSearch = !q || d.id.toLowerCase().includes(q) || d.nearbyFacility?.name.toLowerCase().includes(q)
      const matchRisk = riskFilter === 'ALL' || d.riskLevel === riskFilter
      const matchSource = sourceFilter === 'ALL' || d.source === sourceFilter
      return matchSearch && matchRisk && matchSource
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortKey === 'detectedAt')  cmp = new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime()
      else if (sortKey === 'frp')         cmp = a.frp - b.frp
      else if (sortKey === 'confidence')  cmp = a.confidence - b.confidence
      else if (sortKey === 'riskLevel')   cmp = RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel]
      return sortDir === 'asc' ? cmp : -cmp
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function exportCSV() {
    const headers = ['ID', 'RiskLevel', 'FRP_MW', 'Confidence', 'PersistenceDays', 'NearbyFacility', 'Distance_m', 'Source', 'DetectedAt', 'Latitude', 'Longitude']
    const rows = filtered.map((d) => [
      d.id,
      d.riskLevel,
      d.frp,
      d.confidence,
      d.persistenceDays,
      d.nearbyFacility ? `"${d.nearbyFacility.name}"` : 'None',
      d.nearbyFacility ? d.nearbyFacility.distanceMeters : 0,
      d.source,
      d.detectedAt,
      d.latitude,
      d.longitude,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `thermal_detections_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast('Export Complete', `Exported ${filtered.length} anomaly records to CSV`, 'success')
  }

  function resetFilters() {
    setSearch('')
    setRiskFilter('ALL')
    setSourceFilter('ALL')
    setPage(1)
    addToast('Filters Reset', 'Showing all detection records', 'info')
  }

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    return (
      <button
        onClick={() => handleSort(k)}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-bold text-[12px] group"
      >
        {label}
        <ArrowUpDown size={12} className={cn('transition-colors', sortKey === k ? 'text-blue-600' : 'text-gray-300 group-hover:text-gray-500')} />
      </button>
    )
  }

  return (
    <div className="p-5 flex flex-col gap-4 animate-fade-in">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4.5 rounded-2xl border border-white/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-extrabold text-gray-900">Radiometric Detection Index</h1>
            <span className="text-[11px] font-bold bg-blue-500/10 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200/80 shadow-2xs">
              {filtered.length} records verified
            </span>
          </div>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Geospatial thermal anomaly telemetry with automated hazard classification
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 h-8.5 px-3 text-[12px] font-bold text-gray-600 bg-white/90 hover:bg-white border border-black/[0.08] rounded-xl transition-all shadow-2xs active:scale-95"
            title="Reset active filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 h-8.5 px-3.5 text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-2xs active:scale-95 shadow-blue-500/10"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────── */}
      <div className="glass-card p-3.5 shadow-xs border border-white/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by Anomaly ID, Sector, or Facility name…"
              className="w-full h-9.5 pl-9.5 pr-3.5 text-[13px] bg-white/80 border border-black/[0.08] rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Risk filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-gray-400" />
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value as RiskLevel | 'ALL'); setPage(1) }}
              className="h-9.5 px-3 text-[12px] font-semibold bg-white/80 border border-black/[0.08] rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {RISK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }}
            className="h-9.5 px-3 text-[12px] font-semibold bg-white/80 border border-black/[0.08] rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Instruments' : s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <div className="glass-card overflow-hidden shadow-xs border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-black/[0.06] bg-white/40 backdrop-blur-md">
                <th className="text-left px-4 py-3"><SortBtn k="riskLevel" label="Hazard Rating" /></th>
                <th className="text-left px-4 py-3 text-gray-700 font-bold text-[12px]">Telemetry ID</th>
                <th className="text-left px-4 py-3"><SortBtn k="frp" label="FRP (MW)" /></th>
                <th className="text-left px-4 py-3"><SortBtn k="confidence" label="Reliability" /></th>
                <th className="text-left px-4 py-3 text-gray-700 font-bold text-[12px]">Persistence</th>
                <th className="text-left px-4 py-3 text-gray-700 font-bold text-[12px]">Adjacent Complex</th>
                <th className="text-left px-4 py-3 text-gray-700 font-bold text-[12px]">Instrument</th>
                <th className="text-left px-4 py-3"><SortBtn k="detectedAt" label="Timestamp" /></th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-4 py-3.5"><div className="h-4 bg-gray-200/50 rounded-md animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-[13px] text-gray-400">
                    No detections match the selected search & filter criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((det) => (
                  <tr
                    key={det.id}
                    className="hover:bg-white/70 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/detections/${det.id}`)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('w-2 h-2 rounded-full shrink-0 shadow-2xs', getRiskDotColor(det.riskLevel))} />
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider', getRiskBadgeClasses(det.riskLevel))}>
                          {det.riskLevel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[12px] font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {det.id}
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-gray-900">{det.frp} MW</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${det.confidence}%` }} />
                        </div>
                        <span className="font-bold text-gray-700">{det.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {det.persistenceDays > 0 ? (
                        <span className="font-bold text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded-md text-[11px] border border-amber-200/60">
                          {det.persistenceDays} days
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-500/10 border border-emerald-200/80 text-[11px] font-bold px-2 py-0.5 rounded-md">
                          New
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-[200px]">
                      {det.nearbyFacility ? (
                        <div>
                          <p className="truncate font-bold text-gray-800">{det.nearbyFacility.name}</p>
                          <p className="text-[11px] text-gray-400 font-medium">{formatDistance(det.nearbyFacility.distanceMeters)} away</p>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-500/10 border border-purple-200/80 px-2 py-0.5 rounded-md">
                        {det.source}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-[12px] font-medium">
                      {formatRelativeTime(det.detectedAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ────────────────────────────────────── */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-black/[0.06] bg-gray-50/50">
            <span className="text-[12px] text-gray-500 font-medium">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} records
            </span>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    'w-7.5 h-7.5 text-[12px] font-bold rounded-lg transition-all shadow-2xs',
                    page === i + 1
                      ? 'bg-blue-600 text-white shadow-blue-500/20'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
