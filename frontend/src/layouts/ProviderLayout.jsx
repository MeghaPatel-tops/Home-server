import React, { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Header from '../components/common/Header'
import { useAuth } from '../context/AuthContext'
import { KycStatus } from '../utils/constants'
import { AlertCircle } from 'lucide-react'

export default function ProviderLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const isKycPending = user?.kyc_status === KycStatus.PENDING || user?.kyc_status === KycStatus.IN_REVIEW

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header title="Provider Operations Console" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* KYC Alert Banner if not verified */}
        {isKycPending && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Your provider business KYC is currently <strong>{user?.kyc_status || 'PENDING'}</strong>. Submit required business licenses to activate direct dispatch orders.
              </span>
            </div>
            <Link
              to="/provider/profile"
              className="font-bold underline hover:text-amber-700 whitespace-nowrap"
            >
              Upload KYC &rarr;
            </Link>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
