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
  Radio,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { UserRole } from '../../types'
import { getRiskBadgeClasses, getRiskDotColor, formatRelativeTime, cn } from '../../lib/utils'

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/overview':           { title: 'Mission Overview',           subtitle: 'Geospatial thermal telemetry & critical industrial anomaly monitoring' },
  '/live-map':           { title: 'Live Spatial Map',           subtitle: 'Real-time thermal anomaly GIS canvas with OSM infrastructure overlays' },
  '/detections':         { title: 'Anomaly Registry',           subtitle: 'Comprehensive multi-spectral satellite thermal detection records' },
  '/persistent-sources': { title: 'Persistent Hotspot Index',   subtitle: 'Multi-pass recurring thermal signatures and flare stack verification' },
  '/analytics':          { title: 'Telemetry Analytics',        subtitle: 'Radiative power (FRP) distributions and temporal frequency curves' },
  '/alerts':             { title: 'Incident Alerts',            subtitle: 'Real-time hazard triage and rapid response notifications' },
  '/settings':           { title: 'System Configuration',       subtitle: 'Sensor calibration, ingestion pipelines, and threshold protocols' },
}

function getPageMeta(pathname: string) {
  const meta = PAGE_META[pathname]
  if (meta) return meta
  const base = '/' + pathname.split('/')[1]
  return PAGE_META[base] ?? { title: 'Thermal Watch', subtitle: 'Industrial thermal intelligence' }
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
      className="h-[64px] shrink-0 flex items-center px-6 gap-4 border-b border-slate-200/80 bg-white/70 backdrop-blur-2xl shadow-[0_2px_16px_-2px_rgba(15,23,42,0.02)] z-20 relative select-none"
      role="banner"
    >
      {/* ── Left Title ────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-[15px] font-bold text-slate-900 leading-tight truncate tracking-tight">
            {title}
          </h1>
          <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.2 rounded-full">
            <Radio size={10} className="animate-pulse text-emerald-500" /> Live Feed
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">
          {subtitle}
        </p>
      </div>

      {/* ── Right Controls ────────────────────────────────── */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Search Bar Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="relative hidden sm:flex items-center w-[230px] lg:w-[270px] h-9 pl-8 pr-12 text-[12px] bg-white/80 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-500 hover:text-slate-800 transition-all duration-150 text-left shadow-2xs backdrop-blur-md"
          aria-label="Open search dialog"
        >
          <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
          <span className="truncate">Quick search (facilities, IDs)...</span>
          <kbd className="absolute right-2 flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5">
            <span>⌃</span><span>K</span>
          </kbd>
        </button>

        {/* Simulate Live Anomaly Trigger Button */}
        <button
          onClick={addSimulatedAlert}
          title="Simulate incoming satellite thermal alert"
          className="hidden md:flex items-center gap-1.5 h-9 px-3 text-[12px] font-semibold text-amber-800 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 rounded-xl transition-all shadow-2xs active:scale-95"
        >
          <Zap size={13} className="text-amber-600 animate-pulse" />
          <span>Simulate Telemetry</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 h-9 px-3 text-[12px] font-semibold text-slate-600 bg-white/80 hover:bg-white border border-slate-200 rounded-xl hover:text-slate-900 transition-all duration-150 disabled:opacity-50 shadow-2xs active:scale-95 backdrop-blur-md"
          aria-label="Refresh telemetry data"
        >
          <RefreshCw size={13} className={cn('text-slate-500', isRefreshing && 'animate-spin text-blue-600')} />
          <span className="hidden md:inline">Sync Data</span>
        </button>

        {/* Notifications Button & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className={cn(
              'relative w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-150 shadow-2xs active:scale-95 backdrop-blur-md',
              isNotifOpen
                ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-xs'
                : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
            )}
            aria-label={`Notifications — ${unreadCount} unread`}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white shadow-xs animate-scale-in">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Frosted Dropdown Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2.5 w-[350px] sm:w-[390px] glass-dropdown rounded-2xl overflow-hidden z-50 animate-slide-down">
              {/* Header */}
              <div className="flex items-center justify-between px-4.5 py-3.5 border-b border-slate-200/70 bg-white/60">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-slate-900">Incident Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Check size={12} /> Mark read
                  </button>
                )}
              </div>

              {/* Alert List */}
              <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-[12px]">
                    No active incident notifications
                  </div>
                ) : (
                  alerts.slice(0, 6).map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        'flex items-start gap-3 p-3.5 hover:bg-white/80 transition-colors group relative cursor-pointer',
                        !alert.isRead && 'bg-blue-500/[0.04]'
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
                          <span className={cn('text-[9.5px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider', getRiskBadgeClasses(alert.severity))}>
                            {alert.severity}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatRelativeTime(alert.timestamp)}
                          </span>
                        </div>
                        <p className="text-[12.5px] font-semibold text-slate-800 leading-snug mt-1 truncate">
                          {alert.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {alert.location}
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteAlert(alert.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition-all shrink-0"
                        title="Dismiss notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 border-t border-slate-200/70 bg-white/60 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsNotifOpen(false)
                    navigate('/alerts')
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-700 py-1.5 rounded-xl transition-colors hover:bg-blue-50/50"
                >
                  View full incident feed <ArrowRight size={13} />
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
                'w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-[12px] font-bold text-white shadow-xs transition-all active:scale-95',
                isProfileOpen ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-slate-400/40'
              )}
              aria-label="User Profile menu"
            >
              {user.avatar || 'OP'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 h-9 px-3.5 text-[12px] font-bold text-blue-600 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 rounded-xl transition-all shadow-2xs"
            >
              <LogIn size={13} /> Authenticate
            </button>
          )}

          {/* Profile Dropdown */}
          {isProfileOpen && user && (
            <div className="absolute right-0 mt-2.5 w-[290px] glass-dropdown rounded-2xl overflow-hidden z-50 animate-slide-down">
              {/* Profile Header */}
              <div className="p-4 border-b border-slate-200/70 bg-white/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-[13px] font-bold text-white shadow-sm">
                    {user.avatar || 'OP'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold text-slate-900 truncate leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-500">Active Role:</span>
                  <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Quick Role Switcher */}
              <div className="p-3 border-b border-slate-200/70 bg-white/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Operational Profiles
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
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {r === 'DISPATCHER' ? 'Dispatcher' : r === 'ADMIN' ? 'Admin' : 'Inspector'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Station details */}
              <div className="px-4 py-2.5 text-[11px] text-slate-500 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-emerald-500" />
                  <span className="font-mono">Station: {user.stationId}</span>
                </div>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                </span>
              </div>

              {/* Actions */}
              <div className="p-2 bg-white/70">
                <button
                  onClick={() => {
                    setIsProfileOpen(false)
                    navigate('/settings')
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-white rounded-xl transition-colors"
                >
                  <UserCheck size={14} className="text-slate-400" />
                  <span>Telemetry Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-0.5"
                >
                  <LogOut size={14} className="text-rose-500" />
                  <span>Terminate Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
