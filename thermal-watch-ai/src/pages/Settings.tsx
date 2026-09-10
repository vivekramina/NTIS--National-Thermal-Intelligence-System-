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
      <div className="glass-card p-5 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-black/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
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
      <div className="bg-white p-4.5 rounded-2xl border border-black/[0.06] shadow-xs">
        <h1 className="text-[18px] font-bold text-gray-900">System Settings & Controls</h1>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Manage satellite streaming parameters, automated alert dispatch thresholds, and display profiles
        </p>
      </div>

      {/* ── Data Sources ─────────────────────────────────── */}
      <Section title="Data Ingestion Feeds" icon={Database}>
        <div className="divide-y divide-black/[0.05]">
          <ToggleSwitch
            checked={firmsEnabled}
            onChange={setFirmsEnabled}
            label="NASA FIRMS Real-time Ingestion"
            description="Continuous thermal anomaly feed from MODIS and VIIRS satellite instruments"
          />
          <ToggleSwitch
            checked={osmEnabled}
            onChange={setOsmEnabled}
            label="OpenStreetMap Industrial Registry Sync"
            description="Synchronize manufacturing, chemical, refinery, and power plant facilities"
          />
          <ToggleSwitch
            checked={satelliteEnabled}
            onChange={setSatelliteEnabled}
            label="High-Resolution Optical Satellite Feed"
            description="Secondary multispectral sensor verification stream"
          />
          <ToggleSwitch
            checked={aiEnabled}
            onChange={setAiEnabled}
            label="AI Hazard Classification Pipeline"
            description="Machine learning model evaluating industrial fire risk scores"
          />
        </div>
        <div className="mt-4 pt-3.5 border-t border-black/[0.05] flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-gray-800">Telemetry Refresh Interval</p>
            <p className="text-[11px] text-gray-400">Automated polling cadence for thermal scans</p>
          </div>
          <select
            value={updateInterval}
            onChange={(e) => setUpdateInterval(e.target.value)}
            className="h-9 px-3 text-[12px] font-medium bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            {['5', '10', '15', '30', '60'].map((v) => <option key={v} value={v}>Every {v} minutes</option>)}
          </select>
        </div>
        <div className="mt-3.5 bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
          <Info size={15} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-800 leading-relaxed">
            NASA FIRMS API credentials and PostGIS database connections are secured server-side. Zero API keys or secrets are exposed in the client.
          </p>
        </div>
      </Section>

      {/* ── Alert Notifications ──────────────────────────── */}
      <Section title="Notification Rules" icon={Bell}>
        <div className="divide-y divide-black/[0.05]">
          <ToggleSwitch
            checked={notifCritical}
            onChange={setNotifCritical}
            label="Immediate Critical Hazard Broadcasts"
            description="Flash popups and sound indicators for confirmed high FRP anomalies"
          />
          <ToggleSwitch
            checked={notifHigh}
            onChange={setNotifHigh}
            label="High Risk Anomalies Notification"
            description="Alert when anomalies are detected within 500m of industrial facilities"
          />
          <ToggleSwitch
            checked={notifMedium}
            onChange={setNotifMedium}
            label="Medium Risk Watchlist Alerts"
            description="Queue warnings for elevated background thermal signatures"
          />
          <ToggleSwitch
            checked={notifPersistent}
            onChange={setNotifPersistent}
            label="Persistent Source Recurrence Alarms"
            description="Trigger alerts when a location fires across 3+ consecutive satellite passes"
          />
        </div>
      </Section>

      {/* ── Display Preferences ──────────────────────────── */}
      <Section title="Geospatial Display Preferences" icon={Monitor}>
        <div className="divide-y divide-black/[0.05]">
          <ToggleSwitch
            checked={showFacilities}
            onChange={setShowFacilities}
            label="Overlay Industrial Facilities by Default"
            description="Render industrial plants and factories as reference markers on the map"
          />
          <ToggleSwitch
            checked={showConfidence}
            onChange={setShowConfidence}
            label="Display AI & Satellite Confidence Badges"
            description="Show confidence percentage bars next to thermal records"
          />
          <ToggleSwitch
            checked={compactMode}
            onChange={setCompactMode}
            label="Compact Data Grid Density"
            description="Reduce row padding in detection tables for high-density monitors"
          />
        </div>
      </Section>

      {/* ── Security ─────────────────────────────────────── */}
      <Section title="System Architecture & Compliance" icon={Shield}>
        <div className="space-y-2.5 text-[12px] text-gray-600">
          <div className="flex items-center gap-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
            <Check size={15} className="text-emerald-600 shrink-0" />
            <span className="text-emerald-900 font-medium">NASA FIRMS API Key: Stored in isolated backend vault</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
            <Check size={15} className="text-emerald-600 shrink-0" />
            <span className="text-emerald-900 font-medium">PostgreSQL / PostGIS: Role-based authenticated connection</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
            <Check size={15} className="text-emerald-600 shrink-0" />
            <span className="text-emerald-900 font-medium">Zero telemetry credentials exposed to browser client</span>
          </div>
        </div>
      </Section>

      {/* ── About ────────────────────────────────────────── */}
      <Section title="Platform Metadata" icon={Satellite}>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-gray-400">SIH Project ID</p>
            <p className="font-mono font-bold text-gray-800 text-[13px] mt-0.5">SIH26162</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-gray-400">Release Version</p>
            <p className="font-bold text-gray-800 text-[13px] mt-0.5">v1.2.0-step1</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-gray-400">Environment</p>
            <p className="font-bold text-amber-600 text-[13px] mt-0.5">Demo / Simulated Feeds</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-gray-400">AI Risk Classifier</p>
            <p className="font-bold text-purple-600 text-[13px] mt-0.5">Integrated</p>
          </div>
        </div>
      </Section>

      {/* ── Action Buttons ───────────────────────────────── */}
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 h-9.5 px-4 text-[13px] font-semibold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-2xs active:scale-95"
        >
          <RotateCcw size={14} /> Reset Defaults
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 h-9.5 px-5 text-[13px] font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95"
        >
          <Check size={15} /> Save Changes
        </button>
      </div>
    </div>
  )
}
