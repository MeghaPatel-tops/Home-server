import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  Wrench,
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  HelpCircle,
  User,
  Users,
  ShieldCheck,
  FolderTree,
  DollarSign,
  Radio,
  FileCheck,
  Inbox,
  Briefcase,
  AlertOctagon,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { UserRole } from '../../utils/constants'

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const role = user?.role || UserRole.CUSTOMER

  // Navigation schema per role
  let navItems = []

  if (role === UserRole.CUSTOMER) {
    navItems = [
      { label: 'Overview', to: '/customer', icon: LayoutDashboard, end: true },
      { label: 'My Bookings', to: '/customer/bookings', icon: CalendarCheck },
      { label: 'Saved Addresses', to: '/customer/addresses', icon: MapPin },
      { label: 'Disputes & Warranty', to: '/customer/disputes', icon: HelpCircle },
      { label: 'My Profile', to: '/customer/profile', icon: User },
    ]
  } else if (role === UserRole.PROVIDER) {
    navItems = [
      { label: 'Overview', to: '/provider', icon: LayoutDashboard, end: true },
      { label: 'Routing Queue (15m)', to: '/provider/queue', icon: Inbox, badge: 'SLA' },
      { label: 'All Bookings', to: '/provider/bookings', icon: CalendarCheck },
      { label: 'Fleet Technicians', to: '/provider/fleet', icon: Users },
      { label: 'Service Zones', to: '/provider/zones', icon: MapPin },
      { label: 'Payouts & Ledger', to: '/provider/payouts', icon: DollarSign },
      { label: 'KYC & Business', to: '/provider/profile', icon: ShieldCheck },
    ]
  } else if (role === UserRole.TECHNICIAN) {
    navItems = [
      { label: 'Today’s Duty', to: '/technician', icon: Radio, end: true },
      { label: 'Assigned Jobs', to: '/technician/jobs', icon: Briefcase },
      { label: 'My Profile & Skills', to: '/technician/profile', icon: User },
    ]
  } else if (role === UserRole.SUPER_ADMIN) {
    navItems = [
      { label: 'Platform Analytics', to: '/admin', icon: LayoutDashboard, end: true },
      { label: 'User Management', to: '/admin/users', icon: Users },
      { label: 'Provider KYC', to: '/admin/kyc', icon: ShieldCheck },
      { label: 'Categories CRUD', to: '/admin/categories', icon: FolderTree },
      { label: 'Services CRUD', to: '/admin/services', icon: Wrench },
      { label: 'Zones & Pincodes', to: '/admin/zones', icon: MapPin },
      { label: 'All Bookings', to: '/admin/bookings', icon: CalendarCheck },
      { label: 'Disputes (48h)', to: '/admin/disputes', icon: AlertOctagon },
      { label: 'Payout Approvals', to: '/admin/payouts', icon: DollarSign },
    ]
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">
                Home<span className="text-indigo-400">Serve</span>
              </span>
              <span className="block text-[9px] uppercase font-bold text-indigo-400 tracking-wider">
                {role.replace('_', ' ')}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Quick Links */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/services"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <Wrench className="w-3.5 h-3.5 text-indigo-400" />
            Browse Catalog
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
