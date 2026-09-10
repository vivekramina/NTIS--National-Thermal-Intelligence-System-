import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Map, Flame, Activity, BarChart3, Bell,
  Settings, ChevronLeft, ChevronRight, Thermometer, Wifi,
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
  { label: 'Live Map',           icon: Map,             to: '/live-map' },
  { label: 'Detections',         icon: Flame,           to: '/detections' },
  { label: 'Persistent Sources', icon: Activity,        to: '/persistent-sources' },
  { label: 'Analytics',          icon: BarChart3,       to: '/analytics' },
  { label: 'Alerts',             icon: Bell,            to: '/alerts', isAlert: true },
]

export default function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebar()
  const { unreadCount, user } = useApp()
  const location = useLocation()

  return (
    <aside
      className={cn(
        'flex flex-col h-full shrink-0 border-r border-black/[0.07] bg-white transition-sidebar overflow-hidden z-30 shadow-xs select-none',
        collapsed ? 'w-[72px]' : 'w-[228px]'
      )}
      aria-label="Primary navigation"
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 h-[64px] shrink-0 border-b border-black/[0.07]">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 shrink-0 shadow-2xs">
          <Thermometer size={18} className="text-blue-600" />
          <Wifi size={10} className="text-orange-500 absolute bottom-1 right-1" />
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-fade-in-up">
            <p className="text-[13px] font-bold text-gray-900 leading-tight tracking-tight truncate">
              THERMAL WATCH
            </p>
            <p className="text-[10px] text-blue-600 font-bold tracking-widest truncate">
              AI INTELLIGENCE
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 py-3.5 px-2 overflow-y-auto overflow-x-hidden">
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
                    'flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group relative',
                    collapsed ? 'justify-center' : '',
                    isActive
                      ? 'bg-blue-50/90 text-blue-700 font-semibold shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  )}
                  aria-label={collapsed ? item.label : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full animate-scale-in" />
                  )}
                  <item.icon
                    size={18}
                    className={cn(
                      'shrink-0 transition-transform duration-150 group-hover:scale-110',
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.isAlert && unreadCount > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full shadow-2xs animate-scale-in">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── Bottom ───────────────────────────────────────── */}
      <div className="shrink-0 border-t border-black/[0.07] py-2.5 px-2 space-y-1 bg-gray-50/30">
        <NavLink
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-100/80',
            collapsed ? 'justify-center' : ''
          )}
          aria-label={collapsed ? 'Settings' : undefined}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={17} className="shrink-0 text-gray-400" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {!collapsed && (
          <div className="flex items-center gap-2 px-2.5 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] font-medium text-gray-500">Live Satellite Stream</span>
          </div>
        )}

        <button
          onClick={toggleCollapsed}
          className={cn(
            'w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-[12px] font-medium transition-colors text-gray-400 hover:text-gray-700 hover:bg-gray-100/80',
            collapsed ? 'justify-center' : ''
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse menu</span></>}
        </button>

        <div className={cn('flex items-center gap-2.5 px-2.5 py-2 mt-1 pt-2 border-t border-black/[0.05]', collapsed ? 'justify-center' : '')}>
          <div className="w-7.5 h-7.5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-2xs">
            {user?.avatar || 'OP'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-gray-800 truncate">{user?.name || 'Senior Dispatcher'}</p>
              <p className="text-[10px] text-gray-400 truncate">Station: {user?.stationId || 'SIH-26162'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
