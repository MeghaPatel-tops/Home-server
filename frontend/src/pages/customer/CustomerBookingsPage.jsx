import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, Clock, MapPin, ArrowRight, Search, PlusCircle } from 'lucide-react'
import { bookingService } from '../../services/bookingService'
import { formatPaise, formatDateTime } from '../../utils/formatters'
import StatusBadge from '../../components/ui/StatusBadge'

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await bookingService.getCustomerBookings()
      setBookings(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.booking_number.toLowerCase().includes(search.toLowerCase()) ||
      b.service_name.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (activeTab === 'active') {
      return b.booking_status !== 'COMPLETED' && !b.booking_status.includes('CANCELLED')
    }
    if (activeTab === 'completed') {
      return b.booking_status === 'COMPLETED'
    }
    if (activeTab === 'cancelled') {
      return b.booking_status.includes('CANCELLED')
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-xs text-slate-500">Track active job progress and view past service records</p>
        </div>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book Another Service</span>
        </Link>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          {['all', 'active', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                activeTab === tab
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking # or trade..."
            className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-base font-bold text-slate-800">No bookings found</p>
          <p className="text-xs text-slate-500">You don't have any bookings under the "{activeTab}" filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                      {b.booking_number}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {b.service_name}
                    </h3>
                  </div>
                  <StatusBadge status={b.booking_status} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Scheduled: <strong>{formatDateTime(b.scheduled_at)}</strong></span>
                  </div>
                  {b.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{b.address.house_details}, {b.address.street_locality}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {formatPaise(b.total_amount_paise)}
                  </span>
                </div>
                <Link
                  to={`/customer/bookings/${b.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition flex items-center gap-1.5"
                >
                  <span>Track Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
