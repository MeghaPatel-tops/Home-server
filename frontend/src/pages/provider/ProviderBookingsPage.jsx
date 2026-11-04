import React, { useState, useEffect } from 'react'
import { CalendarCheck, Search, Clock, MapPin, User, ArrowRight } from 'lucide-react'
import { bookingService } from '../../services/bookingService'
import { formatPaise, formatDateTime } from '../../utils/formatters'
import StatusBadge from '../../components/ui/StatusBadge'

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
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
    const matchSearch =
      b.booking_number.toLowerCase().includes(search.toLowerCase()) ||
      b.service_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || b.booking_status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Bookings</h1>
        <p className="text-xs text-slate-500">Comprehensive log of all jobs assigned to your fleet</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          {['ALL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_BY_CUSTOMER'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking number..."
            className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400">
              <th className="p-4">Booking Info</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Assigned Tech</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Net Share (85%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/60 transition">
                <td className="p-4 font-semibold text-slate-900">
                  <span className="font-mono text-indigo-600 block text-xs font-bold">{b.booking_number}</span>
                  {b.service_name}
                  <span className="block text-[10px] text-slate-400 font-normal">{formatDateTime(b.scheduled_at)}</span>
                </td>
                <td className="p-4">
                  <p className="font-bold text-slate-800">{b.customer_name || 'Rahul Sharma'}</p>
                  <p className="text-slate-400 text-[10px]">{b.customer_phone || '+91 98765 43210'}</p>
                </td>
                <td className="p-4">
                  {b.technician ? (
                    <span className="font-semibold text-slate-800">{b.technician.name}</span>
                  ) : (
                    <span className="text-amber-600 font-bold">Unassigned</span>
                  )}
                </td>
                <td className="p-4">
                  <StatusBadge status={b.booking_status} />
                </td>
                <td className="p-4 text-right">
                  <span className="font-extrabold text-sm text-slate-900">
                    {formatPaise(b.provider_amount_paise || Math.round(b.total_amount_paise * 0.85))}
                  </span>
                  <span className="block text-[10px] text-slate-400">Total: {formatPaise(b.total_amount_paise)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
