import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  Flame,
  Activity,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  Satellite,
} from 'lucide-react'
import { useSidebar } from './AppShell'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'

interface NavItem {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  to: string
  isAlert?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview',           icon: LayoutDashboard, to: '/overview' },
  { label: 'Live Spatial Map',   icon: Map,             to: '/live-map' },
  { label: 'Anomaly Registry',   icon: Flame,           to: '/detections' },
  { label: 'Persistent Hotspots',icon: Activity,        to: '/persistent-sources' },
  { label: 'Telemetry Trends',   icon: BarChart3,       to: '/analytics' },
  { label: 'Incident Alerts',    icon: Bell,            to: '/alerts', isAlert: true },
]

export default function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebar()
  const { unreadCount, user } = useApp()
  const location = useLocation()

  return (
    <aside
      className={cn(
        'flex flex-col h-full shrink-0 border-r border-slate-200/80 bg-white/75 backdrop-blur-2xl transition-sidebar overflow-hidden z-30 select-none shadow-[4px_0_24px_-4px_rgba(15,23,42,0.03)]',
        collapsed ? 'w-[72px]' : 'w-[236px]'
      )}
      aria-label="Primary navigation"
    >
      {/* ── Brand / Header ───────────────────────────────── */}
      <div className="flex items-center gap-3 px-3.5 h-[64px] shrink-0 border-b border-slate-200/70 bg-white/40">
        <div className="relative flex items-center justify-center w-9.5 h-9.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 shrink-0">
          <Satellite size={19} className="text-white" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-fade-in">
            <p className="text-[13.5px] font-extrabold text-slate-900 leading-tight tracking-tight truncate">
              THERMAL WATCH
            </p>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase truncate mt-0.5">
              Geospatial Telemetry
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation Links ─────────────────────────────── */}
      <nav className="flex-1 py-3.5 px-2.5 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.to === '/overview'
                ? location.pathname === '/overview' || location.pathname === '/'
                : location.pathname.startsWith(item.to)

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative',
                    collapsed ? 'justify-center px-0' : '',
                    isActive
                      ? 'bg-blue-600/10 text-blue-700 font-semibold shadow-xs border border-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  )}
                  aria-label={collapsed ? item.label : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full shadow-sm" />
                  )}
                  <item.icon
                    size={17}
                    className={cn(
                      'shrink-0 transition-transform duration-200 group-hover:scale-110',
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.isAlert && unreadCount > 0 && (
                    <span className="ml-auto text-[10.5px] font-bold bg-rose-500 text-white px-2 py-0.2 rounded-full shadow-xs animate-scale-in">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── Footer / Operator Meta ───────────────────────── */}
      <div className="shrink-0 border-t border-slate-200/70 py-2.5 px-2.5 space-y-1 bg-slate-50/50">
        <NavLink
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors text-slate-500 hover:text-slate-900 hover:bg-white/80',
            collapsed ? 'justify-center px-0' : ''
          )}
          aria-label={collapsed ? 'Settings' : undefined}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={16} className="shrink-0 text-slate-400" />
          {!collapsed && <span>System Config</span>}
        </NavLink>

        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-500">
            <Radio size={12} className="text-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">FIRMS / Sentinel-2 Live</span>
          </div>
        )}

        <button
          onClick={toggleCollapsed}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors text-slate-400 hover:text-slate-700 hover:bg-white/80',
            collapsed ? 'justify-center px-0' : ''
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span>Collapse menu</span></>}
        </button>

        {/* User Card */}
        <div className={cn('flex items-center gap-2.5 px-2.5 py-2 mt-1 pt-2 border-t border-slate-200/60', collapsed ? 'justify-center' : '')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-xs">
            {user?.avatar || 'OP'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-slate-800 truncate">{user?.name || 'Mission Operator'}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user?.stationId || 'SIH-26162'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
