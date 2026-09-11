import { useState } from 'react'
import { Check, Database, Satellite, Bell, Monitor, Shield, Info, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ToggleSwitch from '../components/ui/ToggleSwitch'

export default function Settings() {
  const { addToast } = useApp()

  // Data source settings
  const [firmsEnabled, setFirmsEnabled]       = useState(true)
  const [osmEnabled, setOsmEnabled]           = useState(true)
  const [satelliteEnabled, setSatelliteEnabled] = useState(true)
  const [aiEnabled, setAiEnabled]             = useState(true)
  const [updateInterval, setUpdateInterval]   = useState('10')

  // Notification settings
  const [notifCritical, setNotifCritical]     = useState(true)
  const [notifHigh, setNotifHigh]             = useState(true)
  const [notifMedium, setNotifMedium]         = useState(false)
  const [notifPersistent, setNotifPersistent] = useState(true)

  // Display settings
  const [showFacilities, setShowFacilities]   = useState(true)
  const [showConfidence, setShowConfidence]   = useState(true)
  const [compactMode, setCompactMode]         = useState(false)

  function handleSave() {
    addToast('Configuration Saved', 'System preferences and alert thresholds updated successfully', 'success')
  }

  function handleReset() {
    setFirmsEnabled(true)
    setOsmEnabled(true)
    setSatelliteEnabled(true)
    setAiEnabled(true)
    setUpdateInterval('10')
    setNotifCritical(true)
    setNotifHigh(true)
    setNotifMedium(false)
    setNotifPersistent(true)
    setShowFacilities(true)
    setShowConfidence(true)
    setCompactMode(false)
    addToast('Defaults Restored', 'All settings reset to system recommended defaults', 'info')
  }

  function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{size?: number; className?: string}>; children: React.ReactNode }) {
    return (
      <div className="glass-card p-5.5 shadow-xs border border-white/80">
        <div className="flex items-center gap-2.5 mb-4 pb-3.5 border-b border-black/[0.05]">
          <div className="w-8.5 h-8.5 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-2xs border border-blue-200/60">
            <Icon size={16} />
          </div>
          <h2 className="text-[14px] font-bold text-gray-900">{title}</h2>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="p-5 flex flex-col gap-5 max-w-3xl animate-fade-in pb-12">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="glass-panel p-4.5 rounded-2xl border border-white/80 shadow-xs">
        <h1 className="text-[18px] font-extrabold text-gray-900">System Telemetry & Engine Configuration</h1>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Manage orbital streaming parameters, automated hazard classification thresholds, and display layers
        </p>
      </div>

      {/* ── Data Sources ─────────────────────────────────── */}
      <Section title="Data Ingestion Streams" icon={Database}>
        <div className="divide-y divide-black/[0.04]">
          <ToggleSwitch
            checked={firmsEnabled}
            onChange={setFirmsEnabled}
            label="NASA FIRMS Radiometric Stream"
            description="Continuous thermal anomaly feed from MODIS and VIIRS satellite sensors"
          />
          <ToggleSwitch
            checked={osmEnabled}
            onChange={setOsmEnabled}
            label="OpenStreetMap Industrial Registry Integration"
            description="Correlate anomalies with chemical plants, refineries, and manufacturing complexes"
          />
          <ToggleSwitch
            checked={satelliteEnabled}
            onChange={setSatelliteEnabled}
            label="Copernicus Sentinel-2 Optical Verification"
            description="Multi-spectral high-resolution optical feed for false-positive reduction"
          />
          <ToggleSwitch
            checked={aiEnabled}
            onChange={setAiEnabled}
            label="Hazard Evaluation Neural Pipeline"
            description="Machine learning classifier computing composite risk and FRP propagation scores"
          />
        </div>
        <div className="mt-4 pt-3.5 border-t border-black/[0.05] flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-gray-800">Telemetry Ingestion Cadence</p>
            <p className="text-[11px] text-gray-400">Automated polling interval for new satellite tile passes</p>
          </div>
          <select
            value={updateInterval}
            onChange={(e) => setUpdateInterval(e.target.value)}
            className="h-9.5 px-3 text-[12px] font-semibold bg-white/80 border border-black/[0.08] rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            {['5', '10', '15', '30', '60'].map((v) => <option key={v} value={v}>Every {v} minutes</option>)}
          </select>
        </div>
        <div className="mt-3.5 bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
          <Info size={15} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
            NASA FIRMS API credentials and spatial PostGIS data stores are securely managed server-side. Zero sensitive tokens are exposed to browser clients.
          </p>
        </div>
      </Section>

      {/* ── Alert Notifications ──────────────────── */}
      <Section title="Automated Incident Dispatch Rules" icon={Bell}>
        <div className="divide-y divide-black/[0.04]">
          <ToggleSwitch
            checked={notifCritical}
            onChange={setNotifCritical}
            label="Immediate Critical Hazard Broadcasts"
            description="Real-time alert dispatch for confirmed anomalies with FRP exceeding 250 MW"
          />
          <ToggleSwitch
            checked={notifHigh}
            onChange={setNotifHigh}
            label="Industrial Proximity Hazard Alarms"
            description="Trigger alerts when anomalies occur within 500m of designated industrial facilities"
          />
          <ToggleSwitch
            checked={notifMedium}
            onChange={setNotifMedium}
            label="Medium Risk Telemetry Queue"
            description="Queue elevated background thermal anomalies for dispatcher review"
          />
          <ToggleSwitch
            checked={notifPersistent}
            onChange={setNotifPersistent}
            label="Persistent Hotspot Recurrence Alarms"
            description="Automated alarm when a coordinate emits thermal heat across 3+ satellite passes"
          />
        </div>
      </Section>

      {/* ── Display Preferences ──────────────────── */}
      <Section title="Geospatial Display Preferences" icon={Monitor}>
        <div className="divide-y divide-black/[0.04]">
          <ToggleSwitch
            checked={showFacilities}
            onChange={setShowFacilities}
            label="Overlay Industrial Facilities by Default"
            description="Render industrial plants and factories as reference markers on the map"
          />
          <ToggleSwitch
            checked={showConfidence}
            onChange={setShowConfidence}
            label="Display Radiometric Reliability Confidence"
            description="Show confidence percentage bars and instrument tags on detection cards"
          />
          <ToggleSwitch
            checked={compactMode}
            onChange={setCompactMode}
            label="High-Density Table Row Density"
            description="Reduce row padding in detection tables for multi-monitor command consoles"
          />
        </div>
      </Section>

      {/* ── Security ─────────────────────────────── */}
      <Section title="Security Architecture & Protocol" icon={Shield}>
        <div className="space-y-2.5 text-[12px] text-gray-600">
          <div className="flex items-center gap-2 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-200/60">
            <Check size={15} className="text-emerald-700 shrink-0" />
            <span className="text-emerald-900 font-bold">NASA FIRMS API Key: Secured in backend encrypted key vault</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-200/60">
            <Check size={15} className="text-emerald-700 shrink-0" />
            <span className="text-emerald-900 font-bold">PostgreSQL / PostGIS: Role-based spatial indexing</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-200/60">
            <Check size={15} className="text-emerald-700 shrink-0" />
            <span className="text-emerald-900 font-bold">Zero telemetry credentials exposed to client browser</span>
          </div>
        </div>
      </Section>

      {/* ── About ────────────────────────────────── */}
      <Section title="Platform Specifications" icon={Satellite}>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div className="bg-white/60 border border-black/[0.04] p-3 rounded-xl">
            <p className="text-gray-400 font-medium">SIH Project ID</p>
            <p className="font-mono font-bold text-gray-800 text-[13px] mt-0.5">SIH26162</p>
          </div>
          <div className="bg-white/60 border border-black/[0.04] p-3 rounded-xl">
            <p className="text-gray-400 font-medium">Release Build</p>
            <p className="font-bold text-gray-800 text-[13px] mt-0.5">v2.0.0-mission-control</p>
          </div>
          <div className="bg-white/60 border border-black/[0.04] p-3 rounded-xl">
            <p className="text-gray-400 font-medium">Environment</p>
            <p className="font-bold text-blue-700 text-[13px] mt-0.5">Active Telemetry Node</p>
          </div>
          <div className="bg-white/60 border border-black/[0.04] p-3 rounded-xl">
            <p className="text-gray-400 font-medium">AI Risk Classifier</p>
            <p className="font-bold text-purple-700 text-[13px] mt-0.5">Operational</p>
          </div>
        </div>
      </Section>

      {/* ── Action Buttons ───────────────────────── */}
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 h-9.5 px-4 text-[13px] font-bold text-gray-600 bg-white/90 hover:bg-white border border-black/[0.08] rounded-xl transition-all shadow-2xs active:scale-95"
        >
          <RotateCcw size={14} /> Reset Defaults
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 h-9.5 px-5 text-[13px] font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95"
        >
          <Check size={15} /> Apply Settings
        </button>
      </div>
    </div>
  )
}

