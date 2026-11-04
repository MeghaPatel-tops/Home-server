import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wrench, Search, Menu, X, User, ChevronDown, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { UserRole } from '../../utils/constants'

export default function Navbar() {
  const { user, isAuthenticated, logout, switchRole } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return '/admin'
      case UserRole.PROVIDER:
        return '/provider'
      case UserRole.TECHNICIAN:
        return '/technician'
      case UserRole.CUSTOMER:
      default:
        return '/customer'
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
                Home<span className="text-indigo-600">Serve</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 -mt-1">
                Verified Services
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search electrician, plumber, AC repair..."
              className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/services" className="hover:text-indigo-600 transition">
              All Services
            </Link>
            <Link to="/about" className="hover:text-indigo-600 transition">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-indigo-600 transition">
              Contact
            </Link>
            <Link to="/faq" className="hover:text-indigo-600 transition">
              FAQ
            </Link>
          </nav>

          {/* Quick Role Switcher (For Demo Testing) */}
          <div className="hidden sm:flex items-center">
            <div className="relative inline-block text-left">
              <select
                value={user?.role || ''}
                onChange={(e) => switchRole(e.target.value)}
                className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg py-1 px-2 text-slate-700 cursor-pointer focus:outline-none"
                title="Switch demo persona"
              >
                <option value={UserRole.CUSTOMER}>Switch: Customer</option>
                <option value={UserRole.PROVIDER}>Switch: Provider</option>
                <option value={UserRole.TECHNICIAN}>Switch: Technician</option>
                <option value={UserRole.SUPER_ADMIN}>Switch: Super Admin</option>
              </select>
            </div>
          </div>

          {/* Auth & Profile Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user.full_name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register/customer"
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg shadow-sm transition"
                >
                  Book Service
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full bg-slate-100 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>
            <div className="flex flex-col gap-2 font-medium text-sm text-slate-700">
              <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="py-1">
                Browse Services
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-1">
                About Us
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-1">
                Contact & Support
              </Link>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="py-1">
                FAQ
              </Link>
              <Link to="/register/provider" onClick={() => setMobileMenuOpen(false)} className="py-1 text-indigo-600">
                Partner with us as Provider &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
