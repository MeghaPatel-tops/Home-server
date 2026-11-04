import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 5)
      setToasts((prev) => [...prev, { id, title, message, type }])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const success = useCallback((message, title = 'Success') => addToast({ title, message, type: 'success' }), [addToast])
  const error = useCallback((message, title = 'Error') => addToast({ title, message, type: 'error' }), [addToast])
  const warning = useCallback((message, title = 'Warning') => addToast({ title, message, type: 'warning' }), [addToast])
  const info = useCallback((message, title = 'Notice') => addToast({ title, message, type: 'info' }), [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = 'bg-slate-900 text-white'
          let IconComponent = Info
          if (toast.type === 'success') {
            bgClass = 'bg-emerald-600 text-white'
            IconComponent = CheckCircle2
          } else if (toast.type === 'error') {
            bgClass = 'bg-rose-600 text-white'
            IconComponent = AlertCircle
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-600 text-white'
            IconComponent = AlertTriangle
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl transition-all transform animate-slide-in ${bgClass}`}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5 text-white/90" />
              <div className="flex-1 min-w-0">
                {toast.title && <p className="font-semibold text-sm leading-tight">{toast.title}</p>}
                <p className="text-xs text-white/90 mt-0.5 break-words">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/70 hover:text-white transition flex-shrink-0 ml-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastContext
