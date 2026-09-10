import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'

export default function ToastContainer() {
  const { toasts, removeToast } = useApp()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success'
        const isWarning = toast.type === 'warning'
        const isError = toast.type === 'error'

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl bg-white/95 backdrop-blur-md',
              'animate-slide-up transition-all duration-300 transform',
              isSuccess && 'border-emerald-200 shadow-emerald-500/5',
              isWarning && 'border-amber-200 shadow-amber-500/5',
              isError && 'border-red-200 shadow-red-500/5',
              !isSuccess && !isWarning && !isError && 'border-blue-200 shadow-blue-500/5'
            )}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 size={18} className="text-emerald-500 animate-scale-in" />}
              {isWarning && <AlertTriangle size={18} className="text-amber-500 animate-scale-in" />}
              {isError && <AlertCircle size={18} className="text-red-500 animate-scale-in" />}
              {!isSuccess && !isWarning && !isError && (
                <Info size={18} className="text-blue-500 animate-scale-in" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                {toast.title}
              </p>
              <p className="text-[12px] text-gray-600 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
