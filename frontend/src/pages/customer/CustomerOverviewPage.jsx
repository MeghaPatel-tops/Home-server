import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  FileText,
  Star,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { bookingService } from '../../services/bookingService'
import { catalogService } from '../../services/catalogService'
import { formatPaise, formatDateTime } from '../../utils/formatters'
import StatusBadge from '../../components/ui/StatusBadge'

export default function CustomerOverviewPage() {
  const { user } = useAuth()
  const [activeBookings, setActiveBookings] = useState([])
  const [completedBookings, setCompletedBookings] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const all = await bookingService.getCustomerBookings()
      setActiveBookings(all.filter((b) => b.booking_status !== 'COMPLETED' && !b.booking_status.includes('CANCELLED')))
      setCompletedBookings(all.filter((b) => b.booking_status === 'COMPLETED'))

      const cats = await catalogService.getCategories()
      setCategories(cats.slice(0, 4))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Customer Portal &bull; Verified Doorstep Guarantee</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name || 'Customer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track your ongoing job progress, review your Start/End OTPs, and book certified home trade technicians.
          </p>
        </div>

        <Link
          to="/services"
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Service</span>
        </Link>
      </div>

      {/* Active Jobs Alert Card */}
      {activeBookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Job in Progress</span>
            </h2>
            <Link to="/customer/bookings" className="text-xs font-semibold text-indigo-600 hover:underline">
              View all ({activeBookings.length})
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border-2 border-indigo-100 p-6 shadow-sm hover:border-indigo-300 transition space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {b.booking_number}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {b.service_name}
                    </h3>
                  </div>
                  <StatusBadge status={b.booking_status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDateTime(b.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end font-extrabold text-slate-900">
                    <span>{formatPaise(b.total_amount_paise)}</span>
                  </div>
                </div>

                {/* Technician Preview if assigned */}
                {b.technician && (
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Technician</p>
                      <p className="font-bold text-slate-800">{b.technician.name}</p>
                    </div>
                    {b.start_otp && (
                      <div className="text-right">
                        <p className="text-[10px] text-indigo-600 font-bold uppercase">Your Start OTP</p>
                        <p className="font-mono font-extrabold text-sm text-indigo-700 tracking-wider">
                          {b.start_otp}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <Link
                  to={`/customer/bookings/${b.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2"
                >
                  <span>Open Live Tracking Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Trade Category Shortcuts */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Need Another Service?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/services?category=${c.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-500 hover:shadow-md transition text-center space-y-2 group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition">
                {c.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Completed History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Recent Completed Jobs</h2>
        {completedBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            No completed bookings yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {completedBookings.map((b) => (
              <div key={b.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700">{b.booking_number}</span>
                    <StatusBadge status={b.booking_status} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{b.service_name}</h4>
                  <p className="text-xs text-slate-400">{formatDateTime(b.scheduled_at)}</p>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <span className="font-extrabold text-sm text-slate-900">{formatPaise(b.total_amount_paise)}</span>
                  <Link
                    to={`/customer/bookings/${b.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
                  >
                    View Details & Invoice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
