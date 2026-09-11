import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Trash2, Zap, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { RiskLevel } from '../types'
import { getRiskBadgeClasses, getRiskDotColor, formatRelativeTime, cn } from '../lib/utils'

type FilterTab = 'ALL' | 'UNREAD' | RiskLevel

export default function Alerts() {
  const { alerts, unreadCount, markAsRead, markAllAsRead, deleteAlert, addSimulatedAlert, addToast } = useApp()
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')
  const navigate = useNavigate()

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (activeTab === 'ALL') return true
      if (activeTab === 'UNREAD') return !alert.isRead
      return alert.severity === activeTab
    })
  }, [alerts, activeTab])

  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    markAsRead(id)
    addToast('Incident Acknowledged', `Alert ${id} marked as acknowledged`, 'info')
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteAlert(id)
  }

  return (
    <div className="p-5 flex flex-col gap-4 max-w-4xl animate-fade-in pb-12 mx-auto w-full">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel px-4.5 py-3.5 rounded-2xl border border-white/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0 shadow-2xs border border-red-200/60">
            <Bell size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[16px] font-extrabold text-gray-900">Incident Dispatch Center</h1>
              {unreadCount > 0 ? (
                <span className="text-[10px] font-bold bg-red-500/10 text-red-700 px-2 py-0.5 rounded-full border border-red-200/80">
                  {unreadCount} requiring response
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/80">
                  All triaged
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Automated high-hazard thermal anomaly advisories and field response queue
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={addSimulatedAlert}
            className="flex items-center gap-1.5 h-8 px-3 text-[11.5px] font-bold text-amber-800 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-200/80 rounded-xl transition-all shadow-2xs active:scale-95"
          >
            <Zap size={13} className="text-amber-600 animate-pulse" />
            <span>Simulate Anomaly</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 h-8 px-3 text-[11.5px] font-bold text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-200/80 rounded-xl transition-all shadow-2xs active:scale-95"
            >
              <Check size={13} />
              <span>Acknowledge All</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Tabs ──────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: `All Incidents (${alerts.length})` },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'CRITICAL', label: 'Critical' },
          { id: 'HIGH', label: 'High' },
          { id: 'MEDIUM', label: 'Medium' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FilterTab)}
            className={cn(
              'px-3 py-1.5 text-[11.5px] font-bold rounded-xl border transition-all duration-150 whitespace-nowrap shadow-2xs',
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
            <div className="w-11 h-11 rounded-2xl bg-white/60 flex items-center justify-center text-gray-400 mb-2 border border-black/[0.04]">
              <ShieldAlert size={18} />
            </div>
            <p className="text-[13px] font-bold text-gray-700">No active alerts in this category</p>
            <p className="text-[11px] text-gray-400 mt-0.5">All incidents have been triaged and resolved</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3.5 p-4 hover:bg-blue-50/20 transition-all duration-150 group',
                !alert.isRead && 'bg-blue-50/40'
              )}
            >
              {/* Severity dot */}
              <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-2xs', getRiskDotColor(alert.severity))} />

              {/* Main Info */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => {
                  markAsRead(alert.id)
                  navigate(`/detections/${alert.detectionId}`)
                }}
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={cn(
                      'text-[9.5px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider',
                      getRiskBadgeClasses(alert.severity)
                    )}
                  >
                    {alert.severity}
                  </span>
                  {!alert.isRead ? (
                    <span className="text-[9.5px] font-bold text-blue-700 bg-blue-500/10 border border-blue-200/80 px-2 py-0.5 rounded-md">
                      NEW ADVISORY
                    </span>
                  ) : (
                    <span className="text-[9.5px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                      ACKNOWLEDGED
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400 font-medium">
                    • {formatRelativeTime(alert.timestamp)}
                  </span>
                </div>

                <p className="text-[13.5px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {alert.title}
                </p>
                <p className="text-[11.5px] text-gray-500 mt-0.5">
                  Sector: <span className="font-semibold text-gray-700">{alert.location}</span> • Telemetry ID: <span className="font-mono font-bold text-gray-600">{alert.detectionId}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {!alert.isRead ? (
                  <button
                    onClick={(e) => handleAcknowledge(alert.id, e)}
                    className="flex items-center gap-1 h-7.5 px-2.5 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all shadow-2xs"
                    title="Acknowledge alert"
                  >
                    <Check size={13} />
                    <span>Acknowledge</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 px-2 py-1">
                    <CheckCircle2 size={13} />
                    <span>Triaged</span>
                  </span>
                )}
                <button
                  onClick={(e) => handleDelete(alert.id, e)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-black/[0.06]"
                  title="Dismiss alert"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => {
                    markAsRead(alert.id)
                    navigate(`/detections/${alert.detectionId}`)
                  }}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-black/[0.06]"
                  title="Inspect detection"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
