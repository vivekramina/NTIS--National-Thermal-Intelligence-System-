import { cn } from '../../lib/utils'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className,
}: ToggleSwitchProps) {
  const isSm = size === 'sm'
  const isLg = size === 'lg'

  // Dimensions
  const trackWidth = isSm ? 'w-10' : isLg ? 'w-14' : 'w-12'
  const trackHeight = isSm ? 'h-6' : isLg ? 'h-8' : 'h-7'
  const knobSize = isSm ? 'w-5 h-5' : isLg ? 'w-7 h-7' : 'w-6 h-6'
  const knobTranslate = isSm
    ? checked ? 'translate-x-4' : 'translate-x-0.5'
    : isLg
    ? checked ? 'translate-x-6' : 'translate-x-0.5'
    : checked ? 'translate-x-5' : 'translate-x-0.5'

  return (
    <div className={cn('flex items-center justify-between py-2 select-none group', className)}>
      {(label || description) && (
        <div className="pr-4 cursor-pointer" onClick={() => !disabled && onChange(!checked)}>
          {label && (
            <p className="text-[13px] font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
              {label}
            </p>
          )}
          {description && (
            <p className="text-[11px] text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}

      {/* ── 3D Toggle Switch Button ───────────────────────── */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 active:scale-95',
          trackWidth,
          trackHeight,
          disabled && 'opacity-50 cursor-not-allowed',
          // 3D Recessed Track with Inner Shadows and Glossy Bevel
          checked
            ? 'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25),inset_0_-1px_2px_rgba(255,255,255,0.2),0_1px_3px_rgba(37,99,235,0.4)] border border-blue-600/40'
            : 'bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.18),inset_0_-1px_1px_rgba(255,255,255,0.6)] border border-gray-300/60'
        )}
      >
        {/* ── 3D Tactile Physical Knob ──────────────────────── */}
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-gradient-to-b from-white via-gray-50 to-gray-200 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative',
            knobSize,
            knobTranslate,
            // 3D Dome Drop Shadow & Highlights
            'shadow-[0_3px_6px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.95),inset_0_-1px_2px_rgba(0,0,0,0.1)] border border-black/[0.08]'
          )}
        >
          {/* Knob Center Power Glow Indicator */}
          <span className="absolute inset-0 m-auto flex items-center justify-center">
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all duration-300',
                checked
                  ? 'bg-blue-600 shadow-[0_0_5px_rgba(37,99,235,0.8),inset_0_1px_1px_rgba(255,255,255,0.8)]'
                  : 'bg-gray-300 shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]'
              )}
            />
          </span>
        </span>
      </button>
    </div>
  )
}
