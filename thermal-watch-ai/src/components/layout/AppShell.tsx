import { useState, createContext, useContext } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import SearchModal from '../ui/SearchModal'

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
      <div className="flex h-screen w-screen overflow-hidden bg-[#f0f2f5] text-gray-900 selection:bg-blue-100 selection:text-blue-900">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
            <Outlet />
          </main>
        </div>
      </div>
      <SearchModal />
    </SidebarContext.Provider>
  )
}
