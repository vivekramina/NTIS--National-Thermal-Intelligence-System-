import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, Zap, Check } from 'lucide-react'
import type { Alert } from '../../types'
import { useApp } from '../../context/AppContext'
import { getRiskBadgeClasses, getRiskDotColor, formatRelativeTime, cn } from '../../lib/utils'

interface PriorityAlertsProps {
  alerts?: Alert[]
  loading?: boolean
}

export default function PriorityAlerts({ alerts: propAlerts, loading }: PriorityAlertsProps) {
  const navigate = useNavigate()
  const { alerts: contextAlerts, markAsRead, addSimulatedAlert } = useApp()
  const alerts = propAlerts ?? contextAlerts
  const displayed = alerts.slice(0, 4)
  const unreadCount = alerts.filter((a) => !a.isRead).length

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden transition-all duration-200">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] shrink-0 bg-gray-50/40">
        <div>
          <h2 className="text-[14px] font-bold text-gray-900">Priority Alerts</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread incident${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full shadow-2xs animate-scale-in">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* ── Alert list ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto divide-y divide-black/[0.04] px-1 py-1 min-h-0">
        {loading ? (
          <div className="space-y-2 p-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Check size={18} />
            </div>
            <p className="text-[13px] font-semibold text-gray-700">No active priority alerts</p>
            <p className="text-[11px] text-gray-400 mt-0.5 mb-3">All thermal anomalies are nominal</p>
            <button
              onClick={addSimulatedAlert}
              className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
            >
              <Zap size={12} className="text-amber-600" /> Simulate Alert
            </button>
          </div>
        ) : (
          displayed.map((alert) => (
            <div
              key={alert.id}
              onClick={() => {
                markAsRead(alert.id)
                navigate(`/detections/${alert.detectionId}`)
              }}
              className={cn(
                'w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all duration-150 group cursor-pointer animate-fade-in-up relative',
                !alert.isRead && 'bg-blue-50/20'
              )}
            >
              {/* Dot */}
              <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', getRiskDotColor(alert.severity))} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={cn(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider',
                      getRiskBadgeClasses(alert.severity)
                    )}
                  >
                    {alert.severity}
                  </span>
                  {!alert.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-[13px] font-semibold text-gray-800 leading-snug truncate group-hover:text-blue-600 transition-colors">
                  {alert.title}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">{alert.location}</p>
                <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(alert.timestamp)}</p>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={14}
                className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 shrink-0 mt-1.5 transition-all"
              />
            </div>
          ))
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="shrink-0 border-t border-black/[0.06] p-2.5 bg-gray-50/40">
        <button
          onClick={() => navigate('/alerts')}
          className="w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1.5 rounded-lg hover:bg-blue-50/50"
        >
          View all alerts <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}
