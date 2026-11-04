import React, { useState, useEffect } from 'react'
import { CalendarCheck, Search, Filter, Eye, ArrowRight } from 'lucide-react'
import { bookingService } from '../../services/bookingService'
import { formatPaise, formatDateTime } from '../../utils/formatters'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import Timeline from '../../components/ui/Timeline'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedBooking, setSelectedBooking] = useState(null)
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Bookings Console</h1>
        <p className="text-xs text-slate-500">Super Admin visibility across all active, pending, and completed service orders</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'PENDING_ASSIGNMENT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_BY_CUSTOMER'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
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
            placeholder="Search booking #..."
            className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400">
              <th className="p-4">Booking #</th>
              <th className="p-4">Service</th>
              <th className="p-4">Scheduled (IST)</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">GMV (₹)</th>
              <th className="p-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/60 transition">
                <td className="p-4 font-mono font-bold text-indigo-600">{b.booking_number}</td>
                <td className="p-4 font-semibold text-slate-900">{b.service_name}</td>
                <td className="p-4 text-slate-500">{formatDateTime(b.scheduled_at)}</td>
                <td className="p-4">
                  <StatusBadge status={b.booking_status} />
                </td>
                <td className="p-4 text-right font-extrabold text-slate-900">
                  {formatPaise(b.total_amount_paise)}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Audit: ${selectedBooking.booking_number}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs text-slate-800">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Fulfillment State Machine</p>
              <Timeline currentStatus={selectedBooking.booking_status} />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Customer</p>
                <p className="font-bold text-slate-900">{selectedBooking.customer_name || 'Rahul Sharma'}</p>
                <p className="text-slate-500">{selectedBooking.address?.house_details}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Provider</p>
                <p className="font-bold text-slate-900">{selectedBooking.provider?.business_name || 'In SLA Dispatch Queue'}</p>
                <p className="text-slate-500">Tech: {selectedBooking.technician?.name || 'Pending assignment'}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-400">Financial Breakdown (Paise & INR)</p>
              <div className="flex justify-between">
                <span>Total Customer Gross Amount</span>
                <span className="font-bold">{formatPaise(selectedBooking.total_amount_paise)}</span>
              </div>
              <div className="flex justify-between text-indigo-600">
                <span>Platform Commission (15%)</span>
                <span className="font-bold">{formatPaise(Math.round(selectedBooking.total_amount_paise * 0.15))}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Provider Net Share (85%)</span>
                <span className="font-bold">{formatPaise(Math.round(selectedBooking.total_amount_paise * 0.85))}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold"
              >
                Close Audit
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
