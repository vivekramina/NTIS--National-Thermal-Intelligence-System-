import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Trash2, Zap, ExternalLink, ShieldAlert } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { RiskLevel } from '../types'
import { getRiskBadgeClasses, getRiskDotColor, formatRelativeTime, cn } from '../lib/utils'

type FilterTab = 'ALL' | 'UNREAD' | RiskLevel

export default function Alerts() {
  const { alerts, unreadCount, markAsRead, markAllAsRead, deleteAlert, addSimulatedAlert } = useApp()
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')
  const navigate = useNavigate()

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (activeTab === 'ALL') return true
      if (activeTab === 'UNREAD') return !alert.isRead
      return alert.severity === activeTab
    })
  }, [alerts, activeTab])

  return (
    <div className="p-5 flex flex-col gap-4.5 max-w-4xl animate-fade-in pb-12">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4.5 rounded-2xl border border-white/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0 shadow-2xs border border-red-200/60">
            <Bell size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-extrabold text-gray-900">Incident Dispatch Center</h1>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold bg-red-500/10 text-red-700 px-2.5 py-0.5 rounded-full animate-scale-in border border-red-200/80">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Live orbital incident notifications and ground team dispatch queue
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={addSimulatedAlert}
            className="flex items-center gap-1.5 h-8.5 px-3.5 text-[12px] font-bold text-amber-800 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-200/80 rounded-xl transition-all shadow-2xs active:scale-95"
          >
            <Zap size={14} className="text-amber-600 animate-pulse" />
            <span>Simulate Anomaly</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 h-8.5 px-3.5 text-[12px] font-bold text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-200/80 rounded-xl transition-all shadow-2xs active:scale-95"
            >
              <Check size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Tabs ──────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: `All Incidents (${alerts.length})` },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'CRITICAL', label: 'Critical Severity' },
          { id: 'HIGH', label: 'High Severity' },
          { id: 'MEDIUM', label: 'Medium Severity' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FilterTab)}
            className={cn(
              'px-3.5 py-1.5 text-[12px] font-bold rounded-xl border transition-all duration-150 whitespace-nowrap shadow-2xs',
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/10'
                : 'bg-white/90 text-gray-600 border-black/[0.06] hover:bg-white hover:text-gray-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Alert List ───────────────────────────────────── */}
      <div className="glass-card divide-y divide-black/[0.04] overflow-hidden shadow-xs border border-white/80">
        {filteredAlerts.length === 0 ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-gray-400 mb-2 border border-black/[0.04]">
              <ShieldAlert size={20} />
            </div>
            <p className="text-[14px] font-bold text-gray-700">No alerts found in this view</p>
            <p className="text-[12px] text-gray-400 mt-0.5">All incidents in this category have been addressed</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-4 p-4.5 hover:bg-white/80 transition-all duration-150 group',
                !alert.isRead && 'bg-blue-50/40'
              )}
            >
              {/* Severity dot */}
              <span className={cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-2xs', getRiskDotColor(alert.severity))} />

              {/* Main Info */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => {
                  markAsRead(alert.id)
                  navigate(`/detections/${alert.detectionId}`)
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider',
                      getRiskBadgeClasses(alert.severity)
                    )}
                  >
                    {alert.severity}
                  </span>
                  {!alert.isRead && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 border border-blue-200/80 px-2 py-0.5 rounded-md">
                      NEW INCIDENT
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400 font-medium">
                    • {formatRelativeTime(alert.timestamp)}
                  </span>
                </div>

                <p className="text-[14px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {alert.title}
                </p>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  Sector: <span className="font-semibold text-gray-700">{alert.location}</span> • Telemetry ID: <span className="font-mono font-bold text-gray-600">{alert.detectionId}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {!alert.isRead && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-black/[0.06]"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-black/[0.06]"
                  title="Dismiss alert"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => {
                    markAsRead(alert.id)
                    navigate(`/detections/${alert.detectionId}`)
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-black/[0.06]"
                  title="Inspect detection"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

