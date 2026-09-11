import { useState, createContext, useContext } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import SearchModal from '../ui/SearchModal'
import ErrorBoundary from '../ui/ErrorBoundary'

interface SidebarContextValue {
  collapsed: boolean
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggleCollapsed: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed: () => setCollapsed((p) => !p) }}>
      <div className="flex h-screen w-screen overflow-hidden bg-[#f1f4f8] text-slate-900 selection:bg-blue-500/15 selection:text-blue-900 relative">
        {/* Soft Ambient Background Lighting */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-blue-500/[0.03] blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-orange-500/[0.025] blur-[120px] pointer-events-none rounded-full" />

        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
          <Topbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <SearchModal />
    </SidebarContext.Provider>
  )
}
