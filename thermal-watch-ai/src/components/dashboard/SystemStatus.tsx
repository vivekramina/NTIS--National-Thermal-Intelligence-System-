import type { SystemServiceInfo } from '../../types'
import { getStatusColor, getStatusLabel, cn } from '../../lib/utils'

interface SystemStatusProps {
  services: SystemServiceInfo[]
  loading?: boolean
  className?: string
}

export default function SystemStatus({ services, loading, className }: SystemStatusProps) {
  return (
    <div className={cn('glass-card px-4 py-3', className)}>
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">System Status</span>
        <div className="w-px h-4 bg-gray-200 shrink-0" />

        {loading ? (
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-4 w-24 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="flex items-center gap-5 flex-wrap">
            {services.map((service) => (
              <div key={service.key} className="flex items-center gap-1.5">
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', getStatusColor(service.status))} aria-label={`${service.name}: ${getStatusLabel(service.status)}`} />
                <span className="text-[12px] font-medium text-gray-600">{service.name}</span>
                <span className="text-[11px] text-gray-400">{getStatusLabel(service.status)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="ml-auto shrink-0">
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">DEMO DATA</span>
        </div>
      </div>
    </div>
  )
}
