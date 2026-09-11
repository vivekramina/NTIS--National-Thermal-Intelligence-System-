import type { SystemServiceInfo } from '../../types'
import { getStatusColor, getStatusLabel, cn } from '../../lib/utils'
import { Activity } from 'lucide-react'

interface SystemStatusProps {
  services: SystemServiceInfo[]
  loading?: boolean
  className?: string
}

export default function SystemStatus({ services, loading, className }: SystemStatusProps) {
  return (
    <div className={cn('glass-panel px-4.5 py-3 rounded-2xl border border-white/80 shadow-xs', className)}>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <Activity size={13} className="text-blue-600" />
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Pipeline Telemetry</span>
        </div>
        <div className="w-px h-4 bg-black/[0.08] shrink-0" />

        {loading ? (
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-24 bg-gray-200/50 rounded-md animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-5 flex-wrap">
            {services.map((service) => (
              <div key={service.key} className="flex items-center gap-1.5 group">
                <span
                  className={cn('w-2 h-2 rounded-full shrink-0 shadow-2xs', getStatusColor(service.status))}
                  aria-label={`${service.name}: ${getStatusLabel(service.status)}`}
                />
                <span className="text-[12px] font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {service.name}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {getStatusLabel(service.status)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="ml-auto shrink-0 flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/80 rounded-full px-2.5 py-0.5 shadow-2xs">
            Telemetry Stream Active
          </span>
        </div>
      </div>
    </div>
  )
}

