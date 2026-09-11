// ============================================================
// NTIS — National Thermal Intelligence System
// Thermal Hotspot Classification Registry & Visual Badge System
// Matches official SIH26162 Classification Schema
// ============================================================

export type HotspotClassificationKey =
  | 'forest_wildland'
  | 'oil_gas'
  | 'persistent_industrial'
  | 'marine'
  | 'agricultural'
  | 'chemical'
  | 'construction'
  | 'volcanic'
  | 'industrial_fire'
  | 'mining'
  | 'urban_fire'
  | 'open_burning'
  | 'power_plant'
  | 'landfill'
  | 'transport'
  | 'unknown'

export interface ClassificationMeta {
  key: HotspotClassificationKey
  label: string
  category: 'Industrial' | 'Vegetation' | 'Infrastructure' | 'Natural' | 'Other'
  color: string
  bgColor: string
  borderColor: string
  description: string
  svgIcon: string
}

export const HOTSPOT_CLASSIFICATIONS: Record<HotspotClassificationKey, ClassificationMeta> = {
  // ── Row 1 ───────────────────────────────────────────────────
  forest_wildland: {
    key: 'forest_wildland',
    label: 'Forest/Wildland',
    category: 'Vegetation',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#86efac',
    description: 'Wildland forest canopy fire or natural vegetation burn.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M10 2L4 12h3l-3 6h6v4h2v-4h1" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="#22c55e" fill-opacity="0.3"/>
      <path d="M10 2L5 11h2.5l-2.5 5h5" fill="#16a34a" fill-opacity="0.4"/>
      <path d="M16 11c0-2-1.5-3.5-1.5-3.5s-.5 1.5-.5 2.5c-.8-.5-1.5-.2-1.8.8-.4 1.2.5 2.7 1.8 3.2 2 .7 2.2 2 1.2 3.5 2.5-.5 3.8-2.2 3.8-4 0-1.2-.8-2-1.5-2.5 0 .5-.7 1-1.5 0z" fill="#ea580c"/>
      <path d="M15 15c-.4-.5-.4-1.2 0-1.8.4-.5.8-.8.8-1.2 0 0 .5.7.3 1.5.5.3.7.8.6 1.4-.2.8-.9 1.1-1.7.1z" fill="#fbbf24"/>
    </svg>`,
  },

  oil_gas: {
    key: 'oil_gas',
    label: 'Oil & Gas',
    category: 'Industrial',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
    description: 'Petroleum refinery, extraction pumpjack, or petrochemical crude processing.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M4 21h16M7 21l3-9M13 21l-3-9M10 12v-2" stroke="#0369a1" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M5 10l12-4M17 6c1 0 3 .5 3 2s-1.5 2-3 2l-3-1" stroke="#0284c7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 10c-1 0-2.5.8-2.5 2.2S3.5 14 5 14l2-1" stroke="#0284c7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 14v6M17 9v11" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="10" cy="10" r="1.5" fill="#0369a1"/>
      <circle cx="17" cy="20" r="1" fill="#0369a1"/>
    </svg>`,
  },

  persistent_industrial: {
    key: 'persistent_industrial',
    label: 'Persistent Industrial',
    category: 'Industrial',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    description: 'Long-term recurring industrial emitter, flare stack, or multi-day furnace.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M3 21h11v-8l-4 2.5V12L6 14.5V9L3 11v10z" fill="#7c3aed" fill-opacity="0.25" stroke="#6d28d9" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="17.5" cy="8.5" r="4.5" fill="#ffffff" stroke="#7c3aed" stroke-width="1.8"/>
      <path d="M17.5 6v2.5l2 1" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M14 17h6M14 20h4" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M5 7c0-1.5.5-2.5 1.5-3" stroke="#a78bfa" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,
  },

  marine: {
    key: 'marine',
    label: 'Marine',
    category: 'Infrastructure',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
    description: 'Offshore oil tanker vessel, container ship fire, or marine port offloading plume.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M2 19c2 1 4 1 6 0s4-1 6 0 4 1 6 0" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/>
      <path d="M4 16l2 3h12l2-3-3-3H7L4 16z" fill="#0369a1" stroke="#075985" stroke-width="1.6" stroke-linejoin="round"/>
      <rect x="7" y="10" width="3" height="3" fill="#bae6fd" stroke="#0369a1" stroke-width="1"/>
      <rect x="11" y="10" width="3" height="3" fill="#bae6fd" stroke="#0369a1" stroke-width="1"/>
      <path d="M16 6c0 1.5-.8 2.5-.8 2.5s1-.8 1.5 0c.4.8-.4 1.5-.4 2.2s1.2.8.8 2.2c1.5-.8 1.8-2.2 1.5-3.5S17.5 8 17.5 7 16 6 16 6z" fill="#ea580c"/>
      <path d="M16.8 9c0 .7-.4 1-.4 1s.6-.3.8 0c.2.4-.2.7-.2 1s.6.4.4 1c.8-.4.9-1 .8-1.5s-.6-1-.6-1.5S16.8 9 16.8 9z" fill="#fbbf24"/>
    </svg>`,
  },

  // ── Row 2 ───────────────────────────────────────────────────
  agricultural: {
    key: 'agricultural',
    label: 'Agricultural',
    category: 'Vegetation',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    description: 'Crop residue, stubble burning, or agricultural biomass combustion.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M4 20c2-5 6-8 10-10M6 13c1.5-2 3.5-3 5-3.5M9 8c1-1.5 2.5-2.2 4-2.5M12 4c.8-.8 2-1 3-1" stroke="#b45309" stroke-width="1.8" stroke-linecap="round"/>
      <ellipse cx="6.5" cy="11.5" rx="1.5" ry="3" transform="rotate(-30 6.5 11.5)" fill="#f59e0b"/>
      <ellipse cx="9.5" cy="7.5" rx="1.5" ry="3" transform="rotate(-30 9.5 7.5)" fill="#f59e0b"/>
      <ellipse cx="13" cy="3.5" rx="1.5" ry="3" transform="rotate(-30 13 3.5)" fill="#f59e0b"/>
      <ellipse cx="10" cy="14" rx="1.5" ry="3" transform="rotate(30 10 14)" fill="#f59e0b"/>
      <ellipse cx="13" cy="10" rx="1.5" ry="3" transform="rotate(30 13 10)" fill="#f59e0b"/>
      <path d="M18 10c0-1.8-1.2-3-1.2-3s-.4 1.2-.4 2c-.6-.4-1.2-.2-1.4.6-.3 1 .4 2.2 1.4 2.6 1.6.6 1.8 1.6 1 2.8 2-.4 3-1.8 3-3.2 0-1-.6-1.6-1.2-2 0 .4-.6.8-1.2 0z" fill="#ea580c"/>
      <path d="M17 14c-.3-.4-.3-1 0-1.4.3-.4.6-.6.6-1 0 0 .4.6.2 1.2.4.2.6.6.5 1.1-.2.6-.7.9-1.3.1z" fill="#fbbf24"/>
    </svg>`,
  },

  chemical: {
    key: 'chemical',
    label: 'Chemical',
    category: 'Industrial',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    description: 'Chemical synthesis, fertilizer reforming reactor, or hazardous solvent processing.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M9 3h6M10 3v5l-5.5 10.5A2 2 0 006.3 21h11.4a2 2 0 001.8-2.5L14 8V3" stroke="#047857" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 17l2.5-4.5c1 .5 2 .5 3 0s2-.5 3 0l3 4.5H6z" fill="#10b981" fill-opacity="0.35"/>
      <circle cx="9" cy="18" r="1" fill="#059669"/>
      <circle cx="13" cy="16" r="1.2" fill="#059669"/>
      <circle cx="15" cy="18.5" r="0.8" fill="#059669"/>
      <path d="M12 12v3M10.5 13.5l3 0" stroke="#047857" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,
  },

  construction: {
    key: 'construction',
    label: 'Construction',
    category: 'Infrastructure',
    color: '#0891b2',
    bgColor: '#ecfeff',
    borderColor: '#a5f3fc',
    description: 'Heavy construction zone, bitumen paving, welding, or earthwork machinery heat.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M4 21h10M7 21V5M11 21V9M7 5l14-2v4L7 9" stroke="#0e7490" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 9l4-4M7 13l4-4M7 17l4-4" stroke="#0891b2" stroke-width="1.4"/>
      <path d="M17 5v8M16 13h2l-1 2-1-2z" stroke="#0891b2" stroke-width="1.4" fill="#0891b2"/>
      <rect x="2" y="6" width="3" height="3" fill="#67e8f9" stroke="#0e7490" stroke-width="1.2"/>
    </svg>`,
  },

  volcanic: {
    key: 'volcanic',
    label: 'Volcanic',
    category: 'Natural',
    color: '#b45309',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    description: 'Active volcanic eruption, geothermal fissure, or subterranean hot magma vent.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M3 21l6.5-12h5L21 21H3z" fill="#78350f" fill-opacity="0.3" stroke="#78350f" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M9.5 9l1 3 1.5-2 1.5 2.5 1-3.5" stroke="#ea580c" stroke-width="1.5" stroke-linecap="round" fill="#ea580c"/>
      <path d="M12 2v4M9 3l2 3M15 3l-2 3" stroke="#f97316" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="8" cy="4" r="1" fill="#ea580c"/>
      <circle cx="16" cy="4" r="1.2" fill="#ea580c"/>
      <circle cx="12" cy="1" r="1" fill="#f59e0b"/>
    </svg>`,
  },

  // ── Row 3 ───────────────────────────────────────────────────
  industrial_fire: {
    key: 'industrial_fire',
    label: 'Industrial Fire',
    category: 'Industrial',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    description: 'Confirmed or probable factory fire, chemical blaze, or warehouse incident.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M3 21h18v-9l-5 3v-3l-5 3V7L3 11v10z" fill="#334155" stroke="#1e293b" stroke-width="1.6" stroke-linejoin="round"/>
      <rect x="5.5" y="14" width="2.5" height="4" fill="#94a3b8"/>
      <rect x="10" y="14" width="2.5" height="4" fill="#94a3b8"/>
      <rect x="14.5" y="14" width="2.5" height="4" fill="#94a3b8"/>
      <path d="M15 3c0 2-1 3-1 3s1.5-1 2 0c.5 1-.5 2-.5 3s1.5 1 1 3c2-1 2.5-3 2-4.5S17 6 17 4.5 15 3 15 3z" fill="#ea580c"/>
      <path d="M16 6.5c0 1-.5 1.5-.5 1.5s.8-.5 1 0c.3.5-.2 1-.2 1.5s.8.5.5 1.5c1-.5 1.2-1.5 1-2.2s-.8-1.5-.8-2.3S16 6.5 16 6.5z" fill="#fbbf24"/>
    </svg>`,
  },

  mining: {
    key: 'mining',
    label: 'Mining',
    category: 'Industrial',
    color: '#475569',
    bgColor: '#f8fafc',
    borderColor: '#cbd5e1',
    description: 'Foundry metal smelting, stone quarrying, or mineral extraction kiln.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M15 4l5 5M18.5 7.5L8 18l-2-2 10.5-10.5" stroke="#334155" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M13 3c2 0 5 1.5 7 3.5s3.5 5 3.5 7l-2-2c-.5-2.5-2-4-4.5-4.5L13 3z" fill="#64748b" stroke="#334155" stroke-width="1.2"/>
      <path d="M5 19l-2 2M3 15l4 6h10l4-6-4-2H7l-4 2z" fill="#cbd5e1" stroke="#475569" stroke-width="1.4" stroke-linejoin="round"/>
      <circle cx="9" cy="17" r="1" fill="#f59e0b"/>
      <circle cx="13" cy="16.5" r="1" fill="#f59e0b"/>
      <circle cx="15" cy="18" r="0.8" fill="#f59e0b"/>
    </svg>`,
  },

  urban_fire: {
    key: 'urban_fire',
    label: 'Urban Fire',
    category: 'Other',
    color: '#e11d48',
    bgColor: '#fff1f2',
    borderColor: '#fecdd3',
    description: 'Residential structural fire, commercial building, or urban area blaze.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M3 11l9-8 9 8v10H3V11z" fill="#f43f5e" fill-opacity="0.15" stroke="#be123c" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M9 21v-6h6v6" stroke="#be123c" stroke-width="1.6"/>
      <path d="M17 12c0-2-1.2-3.2-1.2-3.2s-.4 1.2-.4 2.2c-.7-.5-1.3-.2-1.5.7-.3 1.1.4 2.4 1.5 2.8 1.8.6 2 1.8 1.1 3.1 2.2-.4 3.3-2 3.3-3.6 0-1.1-.7-1.8-1.3-2.2 0 .4-.7.8-1.5.2z" fill="#ea580c"/>
      <path d="M16 15.5c-.3-.4-.3-1 0-1.5.3-.4.7-.7.7-1 0 0 .4.6.3 1.3.4.3.6.7.5 1.2-.2.6-.8.9-1.5.1z" fill="#fbbf24"/>
    </svg>`,
  },

  open_burning: {
    key: 'open_burning',
    label: 'Open Burning',
    category: 'Other',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#ffedd5',
    description: 'Open bonfire, backyard trash combustion, or controlled outdoor biomass fire.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M4 19l16-3M4 16l16 3" stroke="#78350f" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M12 3c0 3.5-3 5-3 8 0 3 2 5 3 5s3-2 3-5c0-3-3-4.5-3-8z" fill="#ea580c"/>
      <path d="M12 8c0 2-1.5 3-1.5 5 0 1.8 1.2 3 1.5 3s1.5-1.2 1.5-3c0-2-1.5-3-1.5-5z" fill="#fbbf24"/>
      <circle cx="8" cy="10" r="1" fill="#f97316"/>
      <circle cx="16" cy="9" r="1" fill="#f97316"/>
    </svg>`,
  },

  // ── Row 4 ───────────────────────────────────────────────────
  power_plant: {
    key: 'power_plant',
    label: 'Power Plant',
    category: 'Industrial',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    description: 'Thermal or combined cycle generating station boiler exhaust or cooling plume.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M6 21l2.5-14h7L18 21H6z" fill="#3b82f6" fill-opacity="0.15" stroke="#1d4ed8" stroke-width="1.8" stroke-linejoin="round"/>
      <ellipse cx="12" cy="7" rx="3.5" ry="1.2" fill="#93c5fd" stroke="#1d4ed8" stroke-width="1.4"/>
      <path d="M8 3c0 1.5 1 2 2 2.5s2 1 2 2.5" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M13 2c0 1.2.8 1.8 1.6 2.2s1.6.8 1.6 2" stroke="#cbd5e1" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M12.5 10l-2 4.5h3l-1.5 4.5 4-5.5h-3l1.5-3.5h-2z" fill="#f59e0b" stroke="#d97706" stroke-width="0.8" stroke-linejoin="round"/>
    </svg>`,
  },

  landfill: {
    key: 'landfill',
    label: 'Landfill',
    category: 'Other',
    color: '#78716c',
    bgColor: '#fafaf9',
    borderColor: '#e7e5e4',
    description: 'Municipal solid waste dump, landfill methane flaring, or trash fire.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M4 7h16M10 3h4M6 7l1.2 13.2A2 2 0 009.2 22h5.6a2 2 0 002-1.8L18 7" stroke="#44403c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 11v6M14 11v6" stroke="#a8a29e" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M18 4c0-1.5-1-2.5-1-2.5s-.3 1-.3 1.7c-.5-.3-1-.2-1.2.5-.3.8.3 1.8 1.2 2.2 1.4.5 1.5 1.4.8 2.4 1.7-.3 2.5-1.5 2.5-2.7 0-.8-.5-1.4-1-1.7 0 .3-.5.6-1 .1z" fill="#ea580c"/>
      <path d="M17 7.5c-.2-.3-.2-.8 0-1.2.2-.3.5-.5.5-.8 0 0 .3.5.2 1 .3.2.5.5.4 1-.1.4-.6.6-1.1 0z" fill="#fbbf24"/>
    </svg>`,
  },

  transport: {
    key: 'transport',
    label: 'Transport',
    category: 'Infrastructure',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    description: 'Vehicle highway accident, chemical fuel tanker truck, or railway transport fire.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <path d="M2 17h14V7H2v10z" fill="#64748b" fill-opacity="0.2" stroke="#334155" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M16 10h4l3 3.5V17h-7v-7z" stroke="#334155" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="6.5" cy="17.5" r="2.5" fill="#334155"/>
      <circle cx="18.5" cy="17.5" r="2.5" fill="#334155"/>
      <path d="M9 4c0 2-1.2 3-1.2 3s1.5-1 2 0c.5 1-.5 2-.5 3s1.5 1 1 3c2-1 2.2-3 1.8-4.5S11 7 11 5.5 9 4 9 4z" fill="#ea580c"/>
      <path d="M10 7.5c0 1-.5 1.5-.5 1.5s.8-.5 1 0c.3.5-.2 1-.2 1.5s.8.5.5 1.5c1-.5 1.2-1.5 1-2.2s-.8-1.5-.8-2.3S10 7.5 10 7.5z" fill="#fbbf24"/>
    </svg>`,
  },

  unknown: {
    key: 'unknown',
    label: 'Unknown',
    category: 'Other',
    color: '#6b7280',
    bgColor: '#f9fafb',
    borderColor: '#e5e7eb',
    description: 'Unclassified satellite thermal radiometric anomaly requiring field inspection.',
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="#9ca3af" stroke-width="1.8" fill="#f3f4f6"/>
      <path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2 2-2 3.5" stroke="#7c3aed" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="12.5" cy="16.5" r="1.2" fill="#7c3aed"/>
    </svg>`,
  },
}

/**
 * Robust classifier that matches any detection or facility to one of the 16 NTIS classifications
 */
export function resolveHotspotClassification(
  item: {
    classification?: string | null
    location?: string | null
    isPersistent?: boolean
    nearbyFacility?: { name?: string; type?: string } | null
    source?: string
    id?: string
  }
): HotspotClassificationKey {
  const text = [
    item.classification || '',
    item.location || '',
    item.nearbyFacility?.name || '',
    item.nearbyFacility?.type || '',
    item.id || '',
  ]
    .join(' ')
    .toLowerCase()

  // 1. Oil & Gas
  if (
    text.includes('oil') ||
    text.includes('petroleum') ||
    text.includes('refinery') ||
    text.includes('gas flare') ||
    text.includes('bpcl') ||
    text.includes('hpcl') ||
    text.includes('hydrocarbon') ||
    text.includes('mahul') ||
    text.includes('distillation')
  ) {
    return 'oil_gas'
  }

  // 2. Chemical
  if (
    text.includes('chemical') ||
    text.includes('fertilizer') ||
    text.includes('rcf') ||
    text.includes('ammonia') ||
    text.includes('acid') ||
    text.includes('pharmaceutical') ||
    text.includes('api')
  ) {
    return 'chemical'
  }

  // 3. Power Plant
  if (
    text.includes('power') ||
    text.includes('thermal power') ||
    text.includes('tata power') ||
    text.includes('generator') ||
    text.includes('turbine') ||
    text.includes('trombay thermal') ||
    text.includes('electricity')
  ) {
    return 'power_plant'
  }

  // 4. Marine
  if (
    text.includes('marine') ||
    text.includes('port') ||
    text.includes('ship') ||
    text.includes('vessel') ||
    text.includes('terminal') ||
    text.includes('island') ||
    text.includes('jawahar') ||
    text.includes('butcher') ||
    text.includes('harbour') ||
    text.includes('offshore') ||
    text.includes('colaba')
  ) {
    return 'marine'
  }

  // 5. Mining & Metallurgy
  if (
    text.includes('mining') ||
    text.includes('smelt') ||
    text.includes('foundry') ||
    text.includes('steel') ||
    text.includes('quarry') ||
    text.includes('kiln') ||
    text.includes('furnace') ||
    text.includes('alloy') ||
    text.includes('metal') ||
    text.includes('vasai')
  ) {
    return 'mining'
  }

  // 6. Construction
  if (
    text.includes('construction') ||
    text.includes('crane') ||
    text.includes('infrastructure') ||
    text.includes('cement') ||
    text.includes('concrete') ||
    text.includes('paving') ||
    text.includes('jasai') ||
    text.includes('airport development')
  ) {
    return 'construction'
  }

  // 7. Transport
  if (
    text.includes('transport') ||
    text.includes('truck') ||
    text.includes('tanker') ||
    text.includes('highway') ||
    text.includes('logistics') ||
    text.includes('rail') ||
    text.includes('expressway') ||
    text.includes('thane-belapur road') ||
    text.includes('warehouse')
  ) {
    return 'transport'
  }

  // 8. Landfill
  if (
    text.includes('landfill') ||
    text.includes('garbage') ||
    text.includes('trash') ||
    text.includes('dump') ||
    text.includes('deonar') ||
    text.includes('waste')
  ) {
    return 'landfill'
  }

  // 9. Forest / Wildland
  if (
    text.includes('forest') ||
    text.includes('wildland') ||
    text.includes('sanjay gandhi') ||
    text.includes('national park') ||
    text.includes('jungle') ||
    text.includes('woods') ||
    text.includes('vegetation')
  ) {
    return 'forest_wildland'
  }

  // 10. Agricultural
  if (
    text.includes('agricultural') ||
    text.includes('crop') ||
    text.includes('stubble') ||
    text.includes('farm') ||
    text.includes('paddy') ||
    text.includes('harvest')
  ) {
    return 'agricultural'
  }

  // 11. Volcanic / Geothermal
  if (text.includes('volcanic') || text.includes('geothermal') || text.includes('magma') || text.includes('volcano')) {
    return 'volcanic'
  }

  // 12. Persistent Industrial
  if (
    item.isPersistent ||
    text.includes('persistent') ||
    text.includes('continuous') ||
    text.includes('flare stack') ||
    text.includes('taloja') ||
    text.includes('kopar') ||
    text.includes('ttc')
  ) {
    return 'persistent_industrial'
  }

  // 13. Urban Fire
  if (text.includes('urban') || text.includes('house') || text.includes('residential') || text.includes('slum') || text.includes('commercial building') || text.includes('kurla')) {
    return 'urban_fire'
  }

  // 14. Open Burning
  if (text.includes('open burning') || text.includes('bonfire') || text.includes('campfire') || text.includes('biomass')) {
    return 'open_burning'
  }

  // 15. Industrial Fire
  if (text.includes('industrial fire') || text.includes('factory fire') || text.includes('industrial') || text.includes('plant fire') || text.includes('goregaon')) {
    return 'industrial_fire'
  }

  return 'unknown'
}
