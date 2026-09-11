import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface MetricCardProps {
  icon?: LucideIcon
  iconImage?: string
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
  iconImage,
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
        'glass-card p-4.5 flex flex-col justify-between gap-3 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-default select-none border border-white/80 hover:border-blue-400/40 group relative overflow-hidden',
        onClick && 'cursor-pointer active:scale-98',
        className
      )}
    >
      {/* Top subtle ambient light ray */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {iconImage ? (
            <div className="w-11 h-11 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
              <img src={iconImage} alt={label} className="w-full h-full object-contain" />
            </div>
          ) : Icon ? (
            <div
              className={cn(
                'w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105 border border-black/[0.04]',
                iconClassName ?? 'bg-blue-50 text-blue-600'
              )}
            >
              <Icon size={17} />
            </div>
          ) : null}
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-700 transition-colors">
            {label}
          </span>
        </div>
      </div>

      {/* Numerical metric & delta */}
      <div className="flex items-baseline justify-between gap-2 mt-1">
        <span className="text-[28px] font-extrabold text-gray-900 leading-none tabular-nums tracking-tight">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              'text-[11px] font-semibold shrink-0 px-2 py-0.5 rounded-md bg-white/80 border border-black/[0.06] shadow-2xs',
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

