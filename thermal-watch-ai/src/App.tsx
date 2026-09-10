import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Overview from './pages/Overview'
import LiveMap from './pages/LiveMap'
import Detections from './pages/Detections'
import DetectionDetail from './pages/DetectionDetail'
import PersistentSources from './pages/PersistentSources'
import Analytics from './pages/Analytics'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import { AppProvider } from './context/AppContext'
import ToastContainer from './components/ui/ToastContainer'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Auth Routes */}
          <Route path="/login" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />

          {/* Main App Layout */}
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="live-map" element={<LiveMap />} />
            <Route path="detections" element={<Detections />} />
            <Route path="detections/:id" element={<DetectionDetail />} />
            <Route path="persistent-sources" element={<PersistentSources />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </AppProvider>
  )
}
