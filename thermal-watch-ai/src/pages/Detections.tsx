import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, ArrowUpDown, ExternalLink, Download, RotateCcw, Flame } from 'lucide-react'
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

function getClassificationBadge(classification?: string) {
  if (!classification) return null
  const upper = classification.toUpperCase()
  if (upper.includes('FLARE')) {
    return (
      <span className="text-[10px] font-bold text-amber-800 bg-amber-500/15 border border-amber-300/80 px-2 py-0.5 rounded-md">
        Flare Stack (Persistent)
      </span>
    )
  }
  if (upper.includes('INDUSTRIAL') || upper.includes('FIRE')) {
    return (
      <span className="text-[10px] font-bold text-rose-800 bg-rose-500/15 border border-rose-300/80 px-2 py-0.5 rounded-md">
        Industrial Fire
      </span>
    )
  }
  if (upper.includes('VEGETATION') || upper.includes('WILDFIRE')) {
    return (
      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-500/15 border border-emerald-300/80 px-2 py-0.5 rounded-md">
        Vegetation Wildfire
      </span>
    )
  }
  return (
    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
      Thermal Anomaly
    </span>
  )
}

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
  const PAGE_SIZE = 12

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
      const matchSearch =
        !q ||
        d.id.toLowerCase().includes(q) ||
        (d.location && d.location.toLowerCase().includes(q)) ||
        (d.nearbyFacility && d.nearbyFacility.name.toLowerCase().includes(q))
      const matchRisk = riskFilter === 'ALL' || d.riskLevel === riskFilter
      const matchSource = sourceFilter === 'ALL' || (d.source && d.source.includes(sourceFilter))
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
    const headers = ['ID', 'RiskLevel', 'Classification', 'FRP_MW', 'Confidence', 'PersistenceDays', 'NearbyFacility', 'Distance_m', 'Source', 'DetectedAt', 'Latitude', 'Longitude']
    const rows = filtered.map((d) => [
      d.id,
      d.riskLevel,
      d.classification || 'UNCLASSIFIED',
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
        className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-bold text-[12px] group"
      >
        {label}
        <ArrowUpDown size={12} className={cn('transition-colors', sortKey === k ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600')} />
      </button>
    )
  }

  return (
    <div className="p-5 flex flex-col gap-4 animate-fade-in pb-12">
      {/* ── Toolbar & Actions ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel px-4.5 py-3 rounded-2xl border border-white/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
            <Flame size={16} />
          </div>
          <div>
            <h1 className="text-[15px] font-extrabold text-gray-900">Radiometric Detection Index</h1>
            <p className="text-[11px] text-gray-500">
              Showing <span className="font-bold text-gray-800">{filtered.length}</span> validated anomaly signatures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 h-8 px-3 text-[12px] font-semibold text-gray-600 bg-white/90 hover:bg-white border border-black/[0.08] rounded-xl transition-all shadow-2xs"
            title="Reset filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 h-8 px-3.5 text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-2xs shadow-blue-500/15"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Filter & Search Bar ───────────────────────────── */}
      <div className="glass-card p-3 shadow-xs border border-white/80">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by Anomaly ID, Sector, or Facility name…"
              className="w-full h-9 pl-9 pr-3.5 text-[12.5px] bg-white/90 border border-black/[0.08] rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Risk filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-gray-400" />
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value as RiskLevel | 'ALL'); setPage(1) }}
              className="h-9 px-3 text-[12px] font-semibold bg-white/90 border border-black/[0.08] rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {RISK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }}
            className="h-9 px-3 text-[12px] font-semibold bg-white/90 border border-black/[0.08] rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Instruments' : s}</option>)}
          </select>
        </div>
      </div>

      {/* ── High-Density Radiometric Table ────────────────── */}
      <div className="glass-card overflow-hidden shadow-xs border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-black/[0.06] bg-white/50 backdrop-blur-md">
                <th className="text-left px-4 py-3"><SortBtn k="riskLevel" label="Hazard Tier" /></th>
                <th className="text-left px-4 py-3 text-gray-700 font-bold text-[12px]">Telemetry ID</th>
                <th className="text-left px-4 py-3 text-gray-700 font-bold text-[12px]">AI Classification</th>
                <th className="text-left px-4 py-3"><SortBtn k="frp" label="FRP (MW)" /></th>
                <th className="text-left px-4 py-3"><SortBtn k="confidence" label="Confidence" /></th>
                <th className="text-left px-4 py-3 text-gray-700 font-bold text-[12px]">Infrastructure Proximity</th>
                <th className="text-left px-4 py-3 text-gray-700 font-bold text-[12px]">Instrument</th>
                <th className="text-left px-4 py-3"><SortBtn k="detectedAt" label="Acquisition" /></th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200/50 rounded-md animate-pulse" /></td>
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
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/detections/${det.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('w-2 h-2 rounded-full shrink-0 shadow-2xs', getRiskDotColor(det.riskLevel))} />
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider', getRiskBadgeClasses(det.riskLevel))}>
                          {det.riskLevel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11.5px] font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {det.id}
                    </td>
                    <td className="px-4 py-3">
                      {getClassificationBadge(det.classification)}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-gray-900">{det.frp} MW</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${det.confidence}%` }} />
                        </div>
                        <span className="font-bold text-gray-700 text-[11px]">{det.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[220px]">
                      {det.nearbyFacility ? (
                        <div>
                          <p className="truncate font-bold text-gray-800 text-[12px]">{det.nearbyFacility.name}</p>
                          <p className="text-[11px] text-blue-600 font-semibold">{formatDistance(det.nearbyFacility.distanceMeters)} away</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Isolated / Remote</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-500/10 border border-purple-200/80 px-2 py-0.5 rounded-md">
                        {det.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-[11.5px] font-medium whitespace-nowrap">
                      {formatRelativeTime(det.detectedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ───────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-black/[0.05] flex items-center justify-between text-[12px] bg-white/40">
            <span className="text-gray-500 font-medium">
              Page {page} of {totalPages} ({filtered.length} total records)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-black/[0.08] text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-[11px]"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border border-black/[0.08] text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-[11px]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
