import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  TrendingUp,
  CalendarCheck,
  Users,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  PieChart,
} from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatPaise } from '../../utils/formatters'

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await adminService.getAnalytics()
      setAnalytics(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Super Admin Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Executive Overview
          </h1>
          <p className="text-xs text-slate-300">
            Real-time financial GMV, 15% platform commission cut, and operational SLA monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/kyc"
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-sm"
          >
            Review KYC ({analytics?.pending_kyc_count || 3})
          </Link>
          <Link
            to="/admin/disputes"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15"
          >
            Disputes ({analytics?.open_disputes_count || 2})
          </Link>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Platform GMV</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {formatPaise(analytics?.total_gmv_paise || 485000000)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% month-over-month</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net 15% Commission</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
            {formatPaise(analytics?.net_commission_revenue_paise || 72750000)}
          </p>
          <p className="text-[11px] text-slate-500">Net platform revenue</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active In-Flight Orders</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {analytics?.active_bookings_count || 28}
          </p>
          <p className="text-[11px] text-cyan-600 font-semibold">Under 15m routing & dispatch</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verified Fleet</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {analytics?.active_technicians_count || 245}
          </p>
          <p className="text-[11px] text-slate-500">Across {analytics?.active_providers_count || 84} contractors</p>
        </div>
      </div>

      {/* Category GMV Share Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Booking Volume by Trade Category</h3>
            <p className="text-xs text-slate-500">Market share distribution across urban service categories</p>
          </div>
          <Link to="/admin/categories" className="text-xs font-semibold text-indigo-600 hover:underline">
            Manage Categories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics?.top_categories?.map((cat, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{cat.name}</span>
                <span className="font-bold text-indigo-600">{cat.share}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: cat.share }}
                />
              </div>
              <p className="text-[11px] text-slate-400">{cat.bookings} completed bookings</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
