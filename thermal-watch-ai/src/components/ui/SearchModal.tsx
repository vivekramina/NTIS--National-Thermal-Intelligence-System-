import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Flame, Building2, LayoutDashboard, Map, Activity, BarChart3, Bell, Settings, ArrowRight, X, Command } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MOCK_DETECTIONS, MOCK_FACILITIES } from '../../data/mockData'
import { getRiskBadgeClasses, cn } from '../../lib/utils'

interface SearchResult {
  id: string
  title: string
  subtitle: string
  category: 'Pages' | 'Detections' | 'Facilities'
  icon: React.ComponentType<{ size?: number; className?: string }>
  url: string
  badge?: string
  badgeClass?: string
}

const PAGE_RESULTS: SearchResult[] = [
  { id: 'page-overview', title: 'Overview Dashboard', subtitle: 'Monitoring summary & key metrics', category: 'Pages', icon: LayoutDashboard, url: '/overview' },
  { id: 'page-live-map', title: 'Live Map Explorer', subtitle: 'Interactive geospatial thermal view', category: 'Pages', icon: Map, url: '/live-map' },
  { id: 'page-detections', title: 'Detections Directory', subtitle: 'Complete anomaly records table', category: 'Pages', icon: Flame, url: '/detections' },
  { id: 'page-persistent', title: 'Persistent Sources', subtitle: 'Multi-day recurring thermal hotspots', category: 'Pages', icon: Activity, url: '/persistent-sources' },
  { id: 'page-analytics', title: 'Analytics & Trends', subtitle: 'Statistical charts & FRP comparisons', category: 'Pages', icon: BarChart3, url: '/analytics' },
  { id: 'page-alerts', title: 'Alerts Center', subtitle: 'Critical alarms & notification logs', category: 'Pages', icon: Bell, url: '/alerts' },
  { id: 'page-settings', title: 'System Settings', subtitle: 'Configuration, data feeds & preferences', category: 'Pages', icon: Settings, url: '/settings' },
]

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useApp()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isSearchOpen])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return PAGE_RESULTS.slice(0, 5)
    }

    const matchedPages: SearchResult[] = PAGE_RESULTS.filter(
      (p) => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
    )

    const matchedDetections: SearchResult[] = MOCK_DETECTIONS.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.nearbyFacility?.name.toLowerCase().includes(q) ||
        d.riskLevel.toLowerCase().includes(q) ||
        d.source.toLowerCase().includes(q)
    ).map((d) => ({
      id: d.id,
      title: `${d.id} (${d.frp} MW)`,
      subtitle: d.nearbyFacility ? `Near ${d.nearbyFacility.name} • ${d.confidence}% confidence` : `Source: ${d.source}`,
      category: 'Detections',
      icon: Flame,
      url: `/detections/${d.id}`,
      badge: d.riskLevel,
      badgeClass: getRiskBadgeClasses(d.riskLevel),
    }))

    const matchedFacilities: SearchResult[] = MOCK_FACILITIES.filter(
      (f) => f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q)
    ).map((f) => ({
      id: f.id,
      title: f.name,
      subtitle: `Type: ${f.type.replace('_', ' ')} • OSM ID: ${f.osmId || 'N/A'}`,
      category: 'Facilities',
      icon: Building2,
      url: `/live-map`,
      badge: 'Facility',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    }))

    return [...matchedPages, ...matchedDetections, ...matchedFacilities]
  }, [query])

  const handleSelect = (url: string) => {
    setIsSearchOpen(false)
    navigate(url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex].url)
      }
    }
  }

  if (!isSearchOpen) return null

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-center pt-20 px-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100 gap-3">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Search detections, facilities, routes, or risk level..."
            className="flex-1 bg-transparent text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-[13px]">
              No matches found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, index) => {
                const Icon = item.icon
                const isSelected = index === selectedIndex

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.url)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-150',
                      isSelected ? 'bg-blue-50/80 text-blue-900 shadow-sm' : 'hover:bg-gray-50 text-gray-700'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                          isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold truncate leading-tight">
                            {item.title}
                          </p>
                          {item.badge && (
                            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase', item.badgeClass)}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      <ArrowRight size={13} className={cn('transition-transform', isSelected ? 'translate-x-0.5 text-blue-600' : 'text-gray-300')} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[10px]">↑</kbd>
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[10px]">↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[10px]">↵</kbd> Select
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Command size={11} /> Quick Launch
          </div>
        </div>
      </div>
    </div>
  )
}
