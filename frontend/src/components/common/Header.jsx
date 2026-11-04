import React from 'react'
import { Menu, Bell, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { UserRole } from '../../utils/constants'

export default function Header({ title, onToggleSidebar }) {
  const { user, switchRole } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Role Tester Switcher */}
        <select
          value={user?.role || ''}
          onChange={(e) => switchRole(e.target.value)}
          className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg py-1 px-2 text-slate-700 cursor-pointer focus:outline-none"
        >
          <option value={UserRole.CUSTOMER}>Role: Customer</option>
          <option value={UserRole.PROVIDER}>Role: Provider</option>
          <option value={UserRole.TECHNICIAN}>Role: Technician</option>
          <option value={UserRole.SUPER_ADMIN}>Role: Super Admin</option>
        </select>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-xs font-semibold text-slate-800">{user?.full_name}</p>
            <p className="text-[10px] text-slate-500 font-medium">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
