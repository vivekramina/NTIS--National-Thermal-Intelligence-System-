import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface MetricCardProps {
  icon: LucideIcon
  iconClassName?: string
  label: string
  value: string | number
  delta?: string
  deltaClassName?: string
  className?: string
  onClick?: () => void
}

export default function MetricCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  delta,
  deltaClassName,
  className,
  onClick,
}: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card p-4.5 flex flex-col gap-3.5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-default select-none border border-black/[0.06] hover:border-black/[0.12]',
        onClick && 'cursor-pointer active:scale-98',
        className
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105',
              iconClassName ?? 'bg-blue-50 text-blue-600'
            )}
          >
            <Icon size={17} />
          </div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            {label}
          </span>
        </div>
      </div>

      {/* Numerical metric & delta */}
      <div className="flex items-baseline justify-between gap-2 mt-0.5">
        <span className="text-[28px] font-extrabold text-gray-900 leading-none tabular-nums tracking-tight">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              'text-[11px] font-semibold mb-0.5 shrink-0 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100',
              deltaClassName ?? 'text-gray-500'
            )}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  )
}
