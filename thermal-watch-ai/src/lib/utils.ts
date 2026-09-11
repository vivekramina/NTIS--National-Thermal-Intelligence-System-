// ============================================================
// THERMAL WATCH AI — Utility Functions
// ============================================================

import type { RiskLevel, SystemServiceStatus } from '../types';

// ============================================================
// Class name merging helper
// ============================================================

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ============================================================
// Risk level → Tailwind color utilities
// ============================================================

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'CRITICAL':
      return 'text-red-400';
    case 'HIGH':
      return 'text-orange-400';
    case 'MEDIUM':
      return 'text-amber-400';
    case 'LOW':
      return 'text-green-400';
  }
}

export function getRiskBgColor(risk: RiskLevel): string {
  switch (risk) {
    case 'CRITICAL':
      return 'bg-red-500/10 border-red-500/30';
    case 'HIGH':
      return 'bg-orange-500/10 border-orange-500/30';
    case 'MEDIUM':
      return 'bg-amber-500/10 border-amber-500/30';
    case 'LOW':
      return 'bg-green-500/10 border-green-500/30';
  }
}

export function getRiskBadgeClasses(risk: RiskLevel): string {
  switch (risk) {
    case 'CRITICAL':
      return 'bg-red-500/20 text-red-400 border border-red-500/40';
    case 'HIGH':
      return 'bg-orange-500/20 text-orange-400 border border-orange-500/40';
    case 'MEDIUM':
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
    case 'LOW':
      return 'bg-green-500/20 text-green-400 border border-green-500/40';
  }
}

export function getRiskHexColor(risk: RiskLevel): string {
  switch (risk) {
    case 'CRITICAL':
      return '#dc2626';
    case 'HIGH':
      return '#ea580c';
    case 'MEDIUM':
      return '#d97706';
    case 'LOW':
      return '#16a34a';
  }
}

export function getRiskDotColor(risk: RiskLevel): string {
  switch (risk) {
    case 'CRITICAL':
      return 'bg-red-500';
    case 'HIGH':
      return 'bg-orange-500';
    case 'MEDIUM':
      return 'bg-amber-500';
    case 'LOW':
      return 'bg-green-500';
  }
}

// ============================================================
// System status → color utilities
// ============================================================

export function getStatusColor(status: SystemServiceStatus): string {
  switch (status) {
    case 'connected':
    case 'available':
    case 'online':
    case 'healthy':
      return 'bg-green-500';
    case 'degraded':
      return 'bg-amber-500';
    case 'offline':
      return 'bg-red-500';
  }
}

export function getStatusLabel(status: SystemServiceStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'available':
      return 'Available';
    case 'online':
      return 'Online';
    case 'healthy':
      return 'Healthy';
    case 'degraded':
      return 'Degraded';
    case 'offline':
      return 'Offline';
  }
}

// ============================================================
// Time formatting
// ============================================================

export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  return `${diffDay}d ago`;
}

export function formatTimestamp(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// ============================================================
// Number formatting
// ============================================================

export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

export function formatDistance(meters?: number | null): string {
  if (meters == null || isNaN(meters)) return 'Nearby';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// ============================================================
// Risk level label (human-friendly)
// ============================================================

export function getRiskLabel(risk: RiskLevel): string {
  switch (risk) {
    case 'CRITICAL':
      return 'Critical Risk';
    case 'HIGH':
      return 'High Risk';
    case 'MEDIUM':
      return 'Medium Risk';
    case 'LOW':
      return 'Low Risk';
  }
}
