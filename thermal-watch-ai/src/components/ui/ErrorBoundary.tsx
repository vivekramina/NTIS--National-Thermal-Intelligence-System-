import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 border border-red-200 shadow-xl rounded-2xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-200 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-[16px] font-bold text-gray-900 mb-1">
              {this.props.fallbackTitle || 'Telemetry View Error'}
            </h3>
            <p className="text-[12px] text-gray-500 mb-4 max-w-xs">
              An unexpected error occurred while rendering this view. You can reload the page or return to the main dashboard.
            </p>
            {this.state.error && (
              <p className="text-[10.5px] font-mono text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5 mb-4 w-full text-left truncate">
                {this.state.error.message}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw size={13} /> Reload Page
              </button>
              <a
                href="/overview"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
              >
                <Home size={13} /> Dashboard
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
