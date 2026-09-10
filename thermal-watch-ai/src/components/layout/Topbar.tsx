import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Search,
  RefreshCw,
  Bell,
  Check,
  Trash2,
  Zap,
  ArrowRight,
  LogOut,
  Shield,
  UserCheck,
  LogIn,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { UserRole } from '../../types'
import { getRiskBadgeClasses, getRiskDotColor, formatRelativeTime, cn } from '../../lib/utils'

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/overview':           { title: 'Monitoring Overview',      subtitle: 'Satellite-based thermal intelligence' },
  '/live-map':           { title: 'Live Map',                 subtitle: 'Real-time thermal anomaly geospatial view' },
  '/detections':         { title: 'Detections',               subtitle: 'Thermal anomaly detection records' },
  '/persistent-sources': { title: 'Persistent Sources',       subtitle: 'Recurring and persistent thermal sources' },
  '/analytics':          { title: 'Analytics',                subtitle: 'Detection trends and statistical analysis' },
  '/alerts':             { title: 'Alerts',                   subtitle: 'Priority notification center' },
  '/settings':           { title: 'Settings',                 subtitle: 'Application configuration' },
}

function getPageMeta(pathname: string) {
  const meta = PAGE_META[pathname]
  if (meta) return meta
  const base = '/' + pathname.split('/')[1]
  return PAGE_META[base] ?? { title: 'Thermal Watch AI', subtitle: 'Industrial fire intelligence' }
}

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { title, subtitle } = getPageMeta(location.pathname)
  const {
    user,
    isAuthenticated,
    demoLogin,
    logout,
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    addSimulatedAlert,
    isRefreshing,
    refreshData,
    setIsSearchOpen,
  } = useApp()

  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRoleSwitch = (role: UserRole) => {
    demoLogin(role)
    setIsProfileOpen(false)
  }

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
    navigate('/login')
  }

  return (
    <header
      className="h-[64px] shrink-0 flex items-center px-5 gap-4 border-b border-black/[0.07] bg-white/95 backdrop-blur-md shadow-xs z-20 relative"
      role="banner"
    >
      {/* ── Left Title ────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold text-gray-900 leading-tight truncate">
          {title}
        </h1>
        <p className="text-[11px] text-gray-400 leading-tight mt-0.5 truncate">
          {subtitle}
        </p>
      </div>

      {/* ── Right Controls ────────────────────────────────── */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Search Bar Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="relative hidden sm:flex items-center w-[240px] lg:w-[280px] h-8.5 pl-8 pr-12 text-[12px] bg-gray-50/80 hover:bg-gray-100 border border-gray-200/80 hover:border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 transition-all duration-150 text-left shadow-2xs"
          aria-label="Open search dialog"
        >
          <Search size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
          <span className="truncate">Search facilities, detections...</span>
          <kbd className="absolute right-2 flex items-center gap-0.5 text-[10px] text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5 shadow-2xs">
            <span>⌃</span><span>K</span>
          </kbd>
        </button>

        {/* Simulate Live Anomaly Trigger Button */}
        <button
          onClick={addSimulatedAlert}
          title="Simulate incoming satellite thermal alert"
          className="hidden md:flex items-center gap-1.5 h-8.5 px-3 text-[12px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 rounded-lg transition-all shadow-2xs active:scale-95"
        >
          <Zap size={13} className="text-amber-600 animate-pulse" />
          <span>Simulate Alert</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 h-8.5 px-3 text-[12px] font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg hover:text-gray-900 transition-all duration-150 disabled:opacity-50 shadow-2xs active:scale-95"
          aria-label="Refresh telemetry data"
        >
          <RefreshCw size={13} className={cn('text-gray-500', isRefreshing && 'animate-spin text-blue-600')} />
          <span className="hidden md:inline">Refresh</span>
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className={cn(
              'relative w-8.5 h-8.5 flex items-center justify-center rounded-lg border transition-all duration-150 shadow-2xs active:scale-95',
              isNotifOpen
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
            aria-label={`Notifications — ${unreadCount} unread`}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white shadow-xs animate-scale-in">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Popover Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50 animate-slide-down">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-gray-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                  >
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>

              {/* Alert List */}
              <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-100">
                {alerts.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 text-[12px]">
                    No notifications available
                  </div>
                ) : (
                  alerts.slice(0, 6).map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        'flex items-start gap-3 p-3.5 hover:bg-gray-50/80 transition-colors group relative cursor-pointer',
                        !alert.isRead && 'bg-blue-50/30'
                      )}
                      onClick={() => {
                        markAsRead(alert.id)
                        setIsNotifOpen(false)
                        navigate(`/detections/${alert.detectionId}`)
                      }}
                    >
                      <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', getRiskDotColor(alert.severity))} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider', getRiskBadgeClasses(alert.severity))}>
                            {alert.severity}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatRelativeTime(alert.timestamp)}
                          </span>
                        </div>
                        <p className="text-[12px] font-semibold text-gray-800 leading-snug mt-1 truncate">
                          {alert.title}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {alert.location}
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteAlert(alert.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-1 rounded hover:bg-gray-100 transition-all shrink-0"
                        title="Dismiss notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsNotifOpen(false)
                    navigate('/alerts')
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-[12px] font-medium text-blue-600 hover:text-blue-700 py-1 transition-colors"
                >
                  View full alert log <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── User Profile Popover & Avatar ────────────────── */}
        <div className="relative" ref={profileRef}>
          {isAuthenticated && user ? (
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className={cn(
                'w-8.5 h-8.5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[12px] font-bold text-white shadow-xs transition-all active:scale-95',
                isProfileOpen ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-400/40'
              )}
              aria-label="User Profile menu"
            >
              {user.avatar || 'OP'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 h-8.5 px-3 text-[12px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all shadow-2xs"
            >
              <LogIn size={13} /> Sign In
            </button>
          )}

          {/* Profile Dropdown */}
          {isProfileOpen && user && (
            <div className="absolute right-0 mt-2 w-[280px] bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50 animate-slide-down">
              {/* Profile Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[14px] font-bold text-white shadow-xs">
                    {user.avatar || 'OP'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-gray-900 truncate leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/60 text-[11px]">
                  <span className="text-gray-500">Access Level:</span>
                  <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Quick Role Switcher */}
              <div className="p-3 border-b border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Switch Active Role
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['DISPATCHER', 'ADMIN', 'INSPECTOR'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSwitch(r)}
                      className={cn(
                        'py-1.5 text-[10px] font-bold rounded-lg border transition-all text-center',
                        user.role === r
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      )}
                    >
                      {r === 'DISPATCHER' ? 'Dispatcher' : r === 'ADMIN' ? 'Admin' : 'Inspector'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Station details */}
              <div className="px-4 py-2.5 text-[11px] text-gray-500 bg-gray-50/40 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-emerald-500" />
                  <span>Station: {user.stationId}</span>
                </div>
                <span className="text-emerald-600 font-semibold">● Online</span>
              </div>

              {/* Actions */}
              <div className="p-2 bg-white">
                <button
                  onClick={() => {
                    setIsProfileOpen(false)
                    navigate('/settings')
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <UserCheck size={14} className="text-gray-400" />
                  <span>Security & Preferences</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-0.5"
                >
                  <LogOut size={14} className="text-red-500" />
                  <span>Terminate Session (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
