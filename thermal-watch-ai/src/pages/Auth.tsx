import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Zap,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { UserRole } from '../types'

export default function Auth() {
  const navigate = useNavigate()
  const { login, demoLogin } = useApp()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('DISPATCHER')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in both email and password fields')
      return
    }
    if (isSignUp && !name) {
      setError('Please provide your operator name')
      return
    }

    setError('')
    setIsLoading(true)

    setTimeout(() => {
      login(email, role)
      setIsLoading(false)
      navigate('/overview')
    }, 500)
  }

  const handleQuickLogin = (selectedRole: UserRole) => {
    setIsLoading(true)
    setTimeout(() => {
      demoLogin(selectedRole)
      setIsLoading(false)
      navigate('/overview')
    }, 350)
  }

  return (
    <div className="min-h-screen w-screen bg-[#edf2f7] flex items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Dynamic Ambient Mesh Lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-blue-400/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-orange-400/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-[350px] h-[350px] rounded-full bg-indigo-400/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col gap-5 relative z-10 animate-scale-in">
        {/* ── Brand Logo & Header ─────────────────────────── */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden shadow-xl shadow-blue-500/20 mb-3 border border-white/80 bg-white">
            <img src="/ntis-logo.png" alt="NTIS Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-[26px] font-black text-gray-900 tracking-tight">
            NTIS
          </h1>
          <p className="text-[13px] text-blue-700 font-extrabold tracking-wide uppercase mt-0.5">
            National Thermal Intelligence System
          </p>
          <p className="text-[11.5px] text-gray-500 mt-1 max-w-xs leading-relaxed font-medium">
            Geospatial Radiometric Surveillance & Incident Telemetry Command
          </p>
        </div>

        {/* ── Main Frosted Auth Card ───────────────────────── */}
        <div className="glass-panel border border-white/90 rounded-3xl shadow-2xl p-6 sm:p-7 backdrop-blur-2xl">
          {/* Mode Switcher */}
          <div className="flex bg-black/[0.04] p-1 rounded-xl mb-5 border border-black/[0.04]">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false)
                setError('')
              }}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Authenticate
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true)
                setError('')
              }}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${
                isSignUp
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Register Operator
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-200 text-red-700 text-[12px] font-semibold rounded-xl p-3 mb-4 animate-slide-down">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Operator Designation
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Officer Rajesh Verma"
                  className="w-full h-10 px-3.5 text-[13px] bg-white/80 border border-black/[0.08] rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Operator Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@thermalwatch.ai"
                  className="w-full h-10 pl-10 pr-3.5 text-[13px] bg-white/80 border border-black/[0.08] rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Security Passkey
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-10 pr-10 text-[13px] bg-white/80 border border-black/[0.08] rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Station Access Clearance
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full h-10 px-3 text-[13px] font-semibold bg-white/80 border border-black/[0.08] rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value="DISPATCHER">Senior Dispatcher (Monitoring & Incident Feed)</option>
                  <option value="ADMIN">Command Admin (Full Configuration & Streams)</option>
                  <option value="INSPECTOR">Field Officer (Ground Truth & Verification)</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between text-[12px] pt-1">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Persist session</span>
              </label>
              <button
                type="button"
                onClick={() => handleQuickLogin('DISPATCHER')}
                className="text-blue-600 hover:text-blue-700 font-bold"
              >
                Instant Access
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/25 active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Register Operator Account' : 'Authenticate Session'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* ── Evaluator Quick Access ───────────────────────── */}
          <div className="mt-6 pt-5 border-t border-black/[0.06]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              <Sparkles size={12} className="text-amber-500" />
              <span>One-Click Role Authentication</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('DISPATCHER')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-blue-200/80 bg-blue-50/60 hover:bg-blue-100/80 text-blue-950 transition-all text-center group shadow-2xs"
              >
                <Zap size={16} className="text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Dispatcher</span>
                <span className="text-[9px] text-blue-600 font-semibold">Monitoring</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-purple-200/80 bg-purple-50/60 hover:bg-purple-100/80 text-purple-950 transition-all text-center group shadow-2xs"
              >
                <Shield size={16} className="text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Admin</span>
                <span className="text-[9px] text-purple-600 font-semibold">Config & Feeds</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('INSPECTOR')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-950 transition-all text-center group shadow-2xs"
              >
                <Building2 size={16} className="text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Inspector</span>
                <span className="text-[9px] text-emerald-600 font-semibold">Ground Verify</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Security & Compliance Footer ─────────────────── */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>NASA FIRMS API Protocol</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Shield size={13} className="text-blue-600" />
            <span>256-Bit Encrypted Telemetry</span>
          </div>
        </div>
      </div>
    </div>
  )
}

