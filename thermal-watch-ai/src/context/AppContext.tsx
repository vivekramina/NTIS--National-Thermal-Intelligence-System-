import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Alert, RiskLevel, User, UserRole } from '../types'
import { MOCK_ALERTS } from '../data/mockData'
import { getPriorityAlerts } from '../services/api'

export interface ToastItem {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
}

const DEFAULT_USER: User = {
  id: 'usr-001',
  name: 'Senior Dispatcher',
  email: 'dispatcher@thermalwatch.ai',
  role: 'DISPATCHER',
  stationId: 'SIH-26162-MUMBAI',
  avatar: 'OP',
}

interface AppContextValue {
  // Auth state & methods
  user: User | null
  isAuthenticated: boolean
  login: (email: string, role?: UserRole) => void
  demoLogin: (role: UserRole) => void
  logout: () => void

  // Alerts & Notifications
  alerts: Alert[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteAlert: (id: string) => void
  addSimulatedAlert: () => void

  // Global search palette
  isSearchOpen: boolean
  setIsSearchOpen: (open: boolean | ((prev: boolean) => boolean)) => void

  // Toasts
  toasts: ToastItem[]
  addToast: (title: string, message: string, type?: ToastItem['type']) => void
  removeToast: (id: string) => void

  // Global refresh synchronization
  lastRefreshTime: Date
  isRefreshing: boolean
  refreshData: () => Promise<void>
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth state initialized from localStorage or default
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('thermal_watch_user')
      return saved ? JSON.parse(saved) : DEFAULT_USER
    } catch {
      return DEFAULT_USER
    }
  })

  const [alerts, setAlerts] = useState<Alert[]>(() => MOCK_ALERTS)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Sync alerts from backend
  useEffect(() => {
    getPriorityAlerts().then((res) => {
      if (res.data && res.data.length > 0) {
        setAlerts(res.data)
      }
    }).catch(() => {})
  }, [lastRefreshTime])

  const unreadCount = alerts.filter((a) => !a.isRead).length

  // Toast actions
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((title: string, message: string, type: ToastItem['type'] = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9)
    const newToast: ToastItem = {
      id,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
    }
    setToasts((prev) => [newToast, ...prev.slice(0, 4)])

    setTimeout(() => {
      removeToast(id)
    }, 4500)
  }, [removeToast])

  // Auth actions
  const login = useCallback((email: string, role: UserRole = 'DISPATCHER') => {
    const newUser: User = {
      id: 'usr-' + Math.floor(100 + Math.random() * 900),
      name: role === 'ADMIN' ? 'Chief Operations Officer' : role === 'INSPECTOR' ? 'Field Verification Inspector' : 'Senior Dispatcher',
      email,
      role,
      stationId: 'SIH-26162-ACTIVE',
      avatar: role.substring(0, 2),
    }
    setUser(newUser)
    localStorage.setItem('thermal_watch_user', JSON.stringify(newUser))
    addToast('Authentication Success', `Welcome back, ${newUser.name}`, 'success')
  }, [addToast])

  const demoLogin = useCallback((role: UserRole) => {
    const email = role === 'ADMIN' ? 'admin@thermalwatch.ai' : role === 'INSPECTOR' ? 'inspector@thermalwatch.ai' : 'dispatcher@thermalwatch.ai'
    login(email, role)
  }, [login])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('thermal_watch_user')
    addToast('Logged Out', 'Session terminated successfully', 'info')
  }, [addToast])

  // Alert actions
  const markAsRead = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)))
    try {
      fetch(`http://localhost:5000/api/alerts/${id}/acknowledge`, { method: 'PATCH' }).catch(() => {})
    } catch {}
  }, [])

  const markAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })))
    addToast('Alerts Cleared', 'All notifications marked as read', 'success')
  }, [addToast])

  const deleteAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
    addToast('Alert Dismissed', 'Notification removed from queue', 'info')
  }, [addToast])

  const addSimulatedAlert = useCallback(() => {
    const facilities = [
      { name: 'Demo Chemical Processing Plant', loc: 'Goregaon East, Mumbai' },
      { name: 'Demo Petroleum & Gas Refinery', loc: 'Mahape Energy Zone, Navi Mumbai' },
      { name: 'Demo Alloy & Steel Mill', loc: 'Vasai East, Palghar' },
      { name: 'Demo Warehouse Logistics Park', loc: 'Thane-Belapur Road, Thane' },
    ]
    const severities: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM']
    const pickFac = facilities[Math.floor(Math.random() * facilities.length)]
    const pickSev = severities[Math.floor(Math.random() * severities.length)]
    const newId = 'ALERT-' + Math.floor(100 + Math.random() * 900)
    const newDetId = 'FIRMS-DEMO-' + Math.floor(100 + Math.random() * 900)

    const newAlert: Alert = {
      id: newId,
      severity: pickSev,
      title: `Potential industrial thermal anomaly (${pickSev.toLowerCase()})`,
      location: `${pickFac.name}, ${pickFac.loc}`,
      timestamp: new Date().toISOString(),
      detectionId: newDetId,
      isRead: false,
    }

    setAlerts((prev) => [newAlert, ...prev])
    addToast(
      `New ${pickSev} Alert`,
      `Thermal anomaly detected at ${pickFac.loc}`,
      pickSev === 'CRITICAL' ? 'error' : pickSev === 'HIGH' ? 'warning' : 'info'
    )
  }, [addToast])

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    await new Promise((r) => setTimeout(r, 650))
    setLastRefreshTime(new Date())
    setIsRefreshing(false)
    addToast('Telemetry Refreshed', 'Satellite and OSM feeds synchronized', 'success')
  }, [addToast])

  // Global shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        demoLogin,
        logout,
        alerts,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteAlert,
        addSimulatedAlert,
        toasts,
        addToast,
        removeToast,
        isSearchOpen,
        setIsSearchOpen,
        lastRefreshTime,
        isRefreshing,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
