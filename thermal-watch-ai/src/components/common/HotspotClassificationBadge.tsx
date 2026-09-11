import {
  HOTSPOT_CLASSIFICATIONS,
  resolveHotspotClassification,
  type HotspotClassificationKey,
} from '../../data/hotspotClassification'
import { cn } from '../../lib/utils'

interface HotspotClassificationBadgeProps {
  classificationKey?: HotspotClassificationKey | string | null
  detection?: {
    classification?: string | null
    location?: string | null
    isPersistent?: boolean
    nearbyFacility?: { name?: string; type?: string } | null
    source?: string
    id?: string
  } | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export default function HotspotClassificationBadge({
  classificationKey,
  detection,
  size = 'sm',
  showLabel = true,
  className,
}: HotspotClassificationBadgeProps) {
  const resolvedKey: HotspotClassificationKey =
    (classificationKey as HotspotClassificationKey) in HOTSPOT_CLASSIFICATIONS
      ? (classificationKey as HotspotClassificationKey)
      : detection
      ? resolveHotspotClassification(detection)
      : 'unknown'

  const meta = HOTSPOT_CLASSIFICATIONS[resolvedKey] || HOTSPOT_CLASSIFICATIONS.unknown

  const sizeClasses = {
    xs: 'w-4 h-4 p-0.5',
    sm: 'w-5 h-5 p-0.5',
    md: 'w-6 h-6 p-1',
    lg: 'w-8 h-8 p-1.5',
  }[size]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border font-bold select-none transition-all',
        size === 'xs' && 'px-1.5 py-0.5 text-[10px]',
        size === 'sm' && 'px-2 py-0.5 text-[11px]',
        size === 'md' && 'px-2.5 py-1 text-[12px]',
        size === 'lg' && 'px-3 py-1.5 text-[13px]',
        className
      )}
      style={{
        backgroundColor: meta.bgColor,
        borderColor: meta.borderColor,
        color: meta.color,
      }}
      title={`${meta.label}: ${meta.description}`}
    >
      <div
        className={cn('shrink-0 bg-white rounded-md shadow-2xs border border-black/[0.06] flex items-center justify-center', sizeClasses)}
        dangerouslySetInnerHTML={{ __html: meta.svgIcon }}
      />
      {showLabel && <span className="tracking-tight">{meta.label}</span>}
    </div>
  )
}
