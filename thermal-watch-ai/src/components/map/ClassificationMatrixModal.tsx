import { useState } from 'react'
import { X, CheckCircle2, RotateCcw, Search, ChevronRight } from 'lucide-react'
import {
  HOTSPOT_CLASSIFICATIONS,
  type HotspotClassificationKey,
} from '../../data/hotspotClassification'
import type { Detection } from '../../types'
import { resolveHotspotClassification } from '../../data/hotspotClassification'
import { cn } from '../../lib/utils'

// Ordered list of all 16 official NTIS classifications
const CLASSIFICATION_KEYS: HotspotClassificationKey[] = [
  'forest_wildland',
  'oil_gas',
  'persistent_industrial',
  'marine',
  'agricultural',
  'chemical',
  'construction',
  'volcanic',
  'industrial_fire',
  'mining',
  'urban_fire',
  'open_burning',
  'power_plant',
  'landfill',
  'transport',
  'unknown',
]

interface ClassificationMatrixModalProps {
  isOpen: boolean
  onClose: () => void
  detections: Detection[]
  selectedClassification: HotspotClassificationKey | 'ALL'
  onSelectClassification: (key: HotspotClassificationKey | 'ALL') => void
}

export default function ClassificationMatrixModal({
  isOpen,
  onClose,
  detections,
  selectedClassification,
  onSelectClassification,
}: ClassificationMatrixModalProps) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  // Calculate live counts for each classification
  const counts: Record<string, number> = {}
  detections.forEach((d) => {
    const k = resolveHotspotClassification(d)
    counts[k] = (counts[k] || 0) + 1
  })

  // Filter list by search query if user types
  const filteredKeys = CLASSIFICATION_KEYS.filter((key) => {
    const meta = HOTSPOT_CLASSIFICATIONS[key]
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      meta.label.toLowerCase().includes(q) ||
      meta.category.toLowerCase().includes(q) ||
      meta.description.toLowerCase().includes(q)
    )
  })

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/90 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-black/[0.06] bg-slate-50/90 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-slate-200/80 bg-white shrink-0">
                <img src="/ntis-logo.png" alt="NTIS Logo" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[16px] font-extrabold text-gray-900 tracking-tight leading-snug truncate">
                  NTIS Thermal Hotspot Categories
                </h2>
                <p className="text-[11px] text-gray-500 font-medium">
                  Official 16-Category Schema • Select to isolate telemetry on map
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {selectedClassification !== 'ALL' && (
                <button
                  onClick={() => onSelectClassification('ALL')}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 border border-black/[0.08] rounded-lg transition-all cursor-pointer shadow-2xs"
                  title="Clear active filter"
                >
                  <RotateCcw size={11} />
                  <span>Show All</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-black/[0.06]"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Quick Search Field */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by category name, sector, or emitter type…"
              className="w-full pl-8.5 pr-3 py-1.5 text-[12px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* ── Single-Column List of All 16 Classification Terms ── */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 divide-y-0">
          {filteredKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-[12px]">
              No classification matches "{searchQuery}".
            </div>
          ) : (
            filteredKeys.map((classKey) => {
              const meta = HOTSPOT_CLASSIFICATIONS[classKey]
              const count = counts[classKey] || 0
              const isSelected = selectedClassification === classKey

              return (
                <div
                  key={classKey}
                  onClick={() => {
                    onSelectClassification(isSelected ? 'ALL' : classKey)
                    onClose()
                  }}
                  className={cn(
                    'flex items-center justify-between p-3 px-3.5 rounded-xl border transition-all cursor-pointer group select-none',
                    isSelected
                      ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50/90 hover:border-slate-300 shadow-2xs'
                  )}
                >
                  {/* Left: SVG Logo Badge + Full Unclipped Title + Description */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-xl bg-white border-2 p-1.5 shrink-0 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105',
                        isSelected ? 'border-blue-600 shadow-blue-500/20' : 'border-slate-200'
                      )}
                      style={{ borderColor: isSelected ? undefined : meta.color + '60' }}
                    >
                      <div
                        className="w-full h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: meta.svgIcon }}
                      />
                    </div>

                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[13px] font-extrabold tracking-tight leading-tight"
                          style={{ color: isSelected ? '#1d4ed8' : meta.color }}
                        >
                          {meta.label}
                        </span>

                        <span
                          className="text-[9.5px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0"
                          style={{
                            backgroundColor: meta.bgColor,
                            color: meta.color,
                            border: `1px solid ${meta.borderColor}`,
                          }}
                        >
                          {meta.category}
                        </span>

                        {isSelected && (
                          <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-blue-600 text-white shrink-0">
                            Active Filter
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-1 sm:line-clamp-2">
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Anomaly Count Pill + Action Arrow */}
                  <div className="shrink-0 flex items-center gap-2.5 ml-2">
                    <span
                      className={cn(
                        'text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 transition-colors',
                        count > 0
                          ? isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-amber-50 text-amber-900 border-amber-200/90 font-extrabold'
                          : 'bg-slate-50 text-slate-400 border-slate-100'
                      )}
                    >
                      {count > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      )}
                      <span>
                        {count} {count === 1 ? 'hotspot' : 'hotspots'}
                      </span>
                    </span>

                    <ChevronRight
                      size={14}
                      className={cn(
                        'text-gray-300 group-hover:text-blue-600 transition-colors',
                        isSelected && 'text-blue-600'
                      )}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/[0.06] bg-slate-50/70 flex items-center justify-between text-[11px] text-gray-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Click any term to isolate on map. Click again or "Show All" to reset.</span>
          </span>
          <span className="font-mono font-bold text-gray-700">
            {detections.length} total active anomalies
          </span>
        </div>
      </div>
    </div>
  )
}
