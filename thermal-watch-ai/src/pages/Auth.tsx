import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Thermometer,
  Wifi,
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
      setError('Please provide your full operator name')
      return
    }

    setError('')
    setIsLoading(true)

    setTimeout(() => {
      login(email, role)
      setIsLoading(false)
      navigate('/overview')
    }, 600)
  }

  const handleQuickLogin = (selectedRole: UserRole) => {
    setIsLoading(true)
    setTimeout(() => {
      demoLogin(selectedRole)
      setIsLoading(false)
      navigate('/overview')
    }, 400)
  }

  return (
    <div className="min-h-screen w-screen bg-[#f0f2f5] flex items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col gap-5 relative z-10 animate-scale-in">
        {/* ── Brand Logo & Header ─────────────────────────── */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-3">
            <Thermometer size={24} />
            <Wifi size={12} className="text-orange-300 absolute bottom-1.5 right-1.5" />
          </div>
          <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">
            THERMAL WATCH <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-[12px] text-gray-500 mt-1 max-w-xs leading-relaxed">
            AI-Powered Industrial Fire & Persistent Thermal Source Intelligence (SIH26162)
          </p>
        </div>

        {/* ── Main Auth Card ───────────────────────────────── */}
        <div className="bg-white/95 backdrop-blur-md border border-black/[0.08] rounded-2xl shadow-xl p-6 sm:p-7">
          {/* Mode Switcher */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl mb-5 border border-gray-200/60">
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
              Sign In
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
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-xl p-3 mb-4 animate-slide-down">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Officer Rajesh Verma"
                  className="w-full h-10 px-3.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
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
                  className="w-full h-10 pl-10 pr-3.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-10 pr-10 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
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
                  Station Access Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full h-10 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="DISPATCHER">Senior Dispatcher (Monitoring & Alerts)</option>
                  <option value="ADMIN">System Admin (Full Configuration)</option>
                  <option value="INSPECTOR">Field Inspector (Ground Verification)</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between text-[12px] pt-1">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Remember session</span>
              </label>
              <button
                type="button"
                onClick={() => handleQuickLogin('DISPATCHER')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Quick Demo
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Operator Account' : 'Authenticate Session'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* ── Demo Quick Roles for Judges / Evaluators ────── */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              <Sparkles size={12} className="text-amber-500" />
              <span>One-Click Hackathon Evaluator Access</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('DISPATCHER')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/70 text-blue-900 transition-all text-center group"
              >
                <Zap size={15} className="text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Dispatcher</span>
                <span className="text-[9px] text-blue-600">Monitoring</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/70 text-purple-900 transition-all text-center group"
              >
                <Shield size={15} className="text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Admin</span>
                <span className="text-[9px] text-purple-600">Full Control</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('INSPECTOR')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900 transition-all text-center group"
              >
                <Building2 size={15} className="text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Inspector</span>
                <span className="text-[9px] text-emerald-600">Field Verify</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Security & Compliance Footer ─────────────────── */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>NASA FIRMS Protocol V2</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Shield size={13} className="text-blue-500" />
            <span>256-bit Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  )
}
