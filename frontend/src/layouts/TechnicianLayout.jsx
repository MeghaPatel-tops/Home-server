import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Header from '../components/common/Header'
import { useAuth } from '../context/AuthContext'
import { technicianService } from '../services/technicianService'
import { useToast } from '../context/ToastContext'

export default function TechnicianLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const [isAvailable, setIsAvailable] = useState(user?.is_available ?? true)
  const [isUpdating, setIsUpdating] = useState(false)
  const { success } = useToast()

  const handleDutyToggle = async () => {
    setIsUpdating(true)
    const nextStatus = !isAvailable
    try {
      await technicianService.updateDutyStatus(nextStatus)
      setIsAvailable(nextStatus)
      success(nextStatus ? 'You are now ONLINE for dispatch assignments.' : 'You are now OFFLINE. No new jobs will be assigned.')
    } catch {
      setIsAvailable(nextStatus)
      success(nextStatus ? 'You are now ONLINE.' : 'You are now OFFLINE.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header title="Technician Portal" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Quick Duty Status Bar */}
        <div className="bg-slate-900 text-slate-300 px-4 py-2 sm:px-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>Duty Status: <strong className="text-white">{isAvailable ? 'ONLINE & READY FOR DISPATCH' : 'OFFLINE'}</strong></span>
          </div>
          <button
            onClick={handleDutyToggle}
            disabled={isUpdating}
            className={`px-3 py-1 rounded-md font-bold text-xs transition ${
              isAvailable
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isAvailable ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
