import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Wrench, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { UserRole } from '../../utils/constants'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, switchRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/customer'

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user = await login(email, password)
    if (user) {
      if (user.role === UserRole.SUPER_ADMIN) navigate('/admin')
      else if (user.role === UserRole.PROVIDER) navigate('/provider')
      else if (user.role === UserRole.TECHNICIAN) navigate('/technician')
      else navigate(from === '/login' ? '/customer' : from)
    }
  }

  const handleQuickLogin = (role) => {
    switchRole(role)
    if (role === UserRole.SUPER_ADMIN) navigate('/admin')
    else if (role === UserRole.PROVIDER) navigate('/provider')
    else if (role === UserRole.TECHNICIAN) navigate('/technician')
    else navigate('/customer')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Home<span className="text-indigo-600">Serve</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
        <p className="text-xs text-slate-500">Access your bookings, fleet roster, or management portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl border border-slate-200 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Quick Test Personas
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin(UserRole.CUSTOMER)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-center"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin(UserRole.PROVIDER)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-center"
              >
                Provider
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin(UserRole.TECHNICIAN)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-center"
              >
                Technician
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin(UserRole.SUPER_ADMIN)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-center"
              >
                Super Admin
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 space-y-1">
            <p>
              New customer?{' '}
              <Link to="/register/customer" className="font-bold text-indigo-600 hover:underline">
                Create Account
              </Link>
            </p>
            <p>
              Are you a service business?{' '}
              <Link to="/register/provider" className="font-bold text-cyan-600 hover:underline">
                Register as Provider
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
