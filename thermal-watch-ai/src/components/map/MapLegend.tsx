export default function MapLegend() {
  const items = [
    { color: '#dc2626', label: 'Critical anomaly',   pulse: false },
    { color: '#ea580c', label: 'High risk anomaly',  pulse: false },
    { color: '#d97706', label: 'Medium risk anomaly', pulse: false },
    { color: '#16a34a', label: 'Low risk anomaly',   pulse: false },
    { color: '#6366f1', label: 'Persistent source',  pulse: true  },
    { color: '#64748b', label: 'Industrial facility', pulse: false },
  ]

  return (
    <div className="absolute bottom-6 left-3 z-[1000] bg-white/95 backdrop-blur-sm border border-black/[0.09] rounded-lg shadow-md px-3 py-2.5 text-[11px] space-y-1.5" role="region" aria-label="Map legend">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2">Legend</p>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className="relative w-3 h-3 flex items-center justify-center shrink-0">
            <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: item.color }} />
            {item.pulse && (
              <span className="absolute inset-0 rounded-full border animate-ping opacity-50" style={{ borderColor: item.color }} />
            )}
          </div>
          <span className="text-gray-600 whitespace-nowrap">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
