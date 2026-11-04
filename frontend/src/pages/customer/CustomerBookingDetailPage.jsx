import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  Clock,
  MapPin,
  ShieldCheck,
  Phone,
  AlertTriangle,
  FileText,
  Star,
  CheckCircle2,
  XCircle,
  Camera,
  RefreshCw,
  HelpCircle,
  Printer,
} from 'lucide-react'
import { bookingService } from '../../services/bookingService'
import { reviewService } from '../../services/reviewService'
import { disputeService } from '../../services/disputeService'
import { formatPaise, formatDateTime } from '../../utils/formatters'
import StatusBadge from '../../components/ui/StatusBadge'
import Timeline from '../../components/ui/Timeline'
import Modal from '../../components/ui/Modal'
import RatingStars from '../../components/ui/RatingStars'
import { useToast } from '../../context/ToastContext'

export default function CustomerBookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resendingOtp, setResendingOtp] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Modals state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)

  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await bookingService.getBookingById(id)
      setBooking(data)
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResendOtp = async () => {
    if (cooldown > 0) return
    setResendingOtp(true)
    try {
      await bookingService.resendOtp(booking.id)
      setCooldown(60)
      success('Fresh 6-digit OTP dispatched to your registered mobile.')
    } catch {
      error('Failed to regenerate OTP. Please wait before retrying.')
    } finally {
      setResendingOtp(false)
    }
  }

  const handleCancelBooking = async () => {
    try {
      await bookingService.cancelBooking(booking.id, cancelReason)
      setCancelModalOpen(false)
      success('Booking cancelled successfully.')
      setBooking({ ...booking, booking_status: 'CANCELLED_BY_CUSTOMER', cancellation_reason: cancelReason })
    } catch {
      error('Failed to cancel booking.')
    }
  }

  const handleApproveChangeOrder = async (changeOrderId) => {
    try {
      await bookingService.approveChangeOrder(booking.id, changeOrderId)
      success('Change order approved. Additional scope will be fulfilled.')
      const updated = await bookingService.getBookingById(id)
      setBooking(updated)
    } catch {
      error('Failed to record approval.')
    }
  }

  const handleRejectChangeOrder = async (changeOrderId) => {
    try {
      await bookingService.rejectChangeOrder(booking.id, changeOrderId)
      success('Change order declined.')
      const updated = await bookingService.getBookingById(id)
      setBooking(updated)
    } catch {
      error('Failed to record response.')
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    try {
      await reviewService.submitReview({
        booking_id: booking.id,
        service_id: booking.service_id,
        rating,
        comment: reviewComment,
      })
      setReviewModalOpen(false)
      success('Thank you for rating your service!')
      setBooking({ ...booking, has_review: true })
    } catch {
      error('Could not post review.')
    }
  }

  const handleRaiseDispute = async (e) => {
    e.preventDefault()
    try {
      const res = await disputeService.createDispute({
        booking_id: booking.id,
        booking_number: booking.booking_number,
        description: disputeReason,
      })
      setDisputeModalOpen(false)
      success('Dispute ticket raised. A Super Admin will review within 24 hours.')
      navigate(`/customer/disputes`)
    } catch {
      error('Could not submit dispute.')
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-base font-bold text-slate-800">Booking Not Found</p>
        <Link to="/customer/bookings" className="text-xs text-indigo-600 underline">
          &larr; Back to all bookings
        </Link>
      </div>
    )
  }

  const isCompleted = booking.booking_status === 'COMPLETED'
  const isCancelled = booking.booking_status.includes('CANCELLED')

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-extrabold text-slate-900 tracking-wider">
              {booking.booking_number}
            </span>
            <StatusBadge status={booking.booking_status} />
            <StatusBadge type="payment" status={booking.payment_status} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{booking.service_name}</h1>
          <p className="text-xs text-slate-500">Scheduled on: {formatDateTime(booking.scheduled_at)}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isCompleted && (
            <>
              <button
                onClick={() => setInvoiceModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Tax Invoice</span>
              </button>

              {!booking.has_review && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Star className="w-4 h-4" />
                  <span>Leave Review</span>
                </button>
              )}

              <button
                onClick={() => setDisputeModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Raise Dispute (48h)</span>
              </button>
            </>
          )}

          {!isCompleted && !isCancelled && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold transition"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Live Timeline Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Job Execution Status</h3>
        <Timeline currentStatus={booking.booking_status} />
      </div>

      {/* Secret OTP Display Card (Security Core) */}
      {!isCompleted && !isCancelled && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold">HMAC-SHA256 Job Verification Codes</h3>
            </div>
            <button
              onClick={handleResendOtp}
              disabled={resendingOtp || cooldown > 0}
              className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resendingOtp ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Start OTP */}
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                1. Service Start OTP
              </span>
              <p className="font-mono text-3xl font-extrabold tracking-widest text-white">
                {booking.start_otp || '••••••'}
              </p>
              <p className="text-[11px] text-slate-300 leading-tight pt-1">
                Share this with your technician only when they arrive at your doorstep to begin work.
              </p>
            </div>

            {/* End OTP */}
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                2. Completion OTP
              </span>
              <p className="font-mono text-3xl font-extrabold tracking-widest text-white">
                {booking.end_otp || '••••••'}
              </p>
              <p className="text-[11px] text-slate-300 leading-tight pt-1">
                <strong>Do NOT share this code</strong> until you have thoroughly inspected the completed repair.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Change Orders Section (If technician requested on-site additions) */}
      {booking.change_orders && booking.change_orders.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900">On-Site Change Order Requested</h3>
              <p className="text-xs text-slate-500">The technician quoted additional required parts or labor.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {booking.change_orders.map((co) => (
              <div key={co.id} className="py-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{co.description}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Status: {co.approval_status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">
                      {formatPaise(co.total_amount_paise)}
                    </span>
                    <span className="block text-[10px] text-slate-400">inc. 18% GST</span>
                  </div>
                </div>

                {co.approval_status === 'PENDING' && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleApproveChangeOrder(co.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Quote</span>
                    </button>
                    <button
                      onClick={() => handleRejectChangeOrder(co.id)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Key Info: Provider & Technician, Address, Photos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personnel & Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Assigned Partner & Field Staff</h3>
          <div className="space-y-4 text-xs">
            {booking.provider ? (
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Service Provider Organization</p>
                <p className="font-bold text-slate-900">{booking.provider.business_name}</p>
                <p className="text-slate-500">{booking.provider.contact_number}</p>
              </div>
            ) : (
              <p className="text-slate-400 italic">Matching candidate provider within 15-minute SLA...</p>
            )}

            {booking.technician ? (
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase font-bold text-indigo-600">Assigned Field Technician</p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">KYC Verified</span>
                </div>
                <p className="font-bold text-slate-900">{booking.technician.name}</p>
                <p className="text-slate-600 font-semibold">{booking.technician.phone}</p>
              </div>
            ) : (
              <p className="text-slate-400 italic">Technician will be assigned once provider accepts.</p>
            )}
          </div>
        </div>

        {/* Doorstep Address & Financials */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Doorstep & Financials</h3>
          {booking.address && (
            <div className="text-xs space-y-1 text-slate-600">
              <p className="font-bold text-slate-800">{booking.address.house_details}</p>
              <p>{booking.address.street_locality}</p>
              <p className="font-semibold text-slate-800">{booking.address.city} - {booking.address.pincode}</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Base Price</span>
              <span className="font-semibold">{formatPaise(booking.base_price_paise)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Travel & Logistics</span>
              <span className="font-semibold">{formatPaise(booking.travel_fee_paise)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">18% GST</span>
              <span className="font-semibold">{formatPaise(booking.gst_amount_paise)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Price</span>
              <span className="text-indigo-600">{formatPaise(booking.total_amount_paise)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Before & After Proof Photos Gallery */}
      {booking.media && booking.media.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Job Proof Photos (Before & After)</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {booking.media.map((m) => (
              <div key={m.id} className="space-y-1 text-center">
                <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={m.url} alt={m.original_filename} className="w-full h-full object-cover" />
                </div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {m.media_type} WORK
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Cancel Booking Modal */}
      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Service Booking">
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-900 space-y-1 border border-amber-200">
            <p className="font-bold">Cancellation Policy Summary:</p>
            <p>
              If your technician is already EN_ROUTE, a standard ₹50 travel fee applies. Zero fees if cancelled before dispatch.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Cancellation</label>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict, problem solved..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancelBooking}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </Modal>

      {/* 2. Review Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Rate Your Service Experience">
        <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-2">Select Star Rating</label>
            <RatingStars rating={rating} onChange={setRating} size="w-6 h-6" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Your Review & Comments</label>
            <textarea
              rows={3}
              required
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell others about the technician's punctuality, skill, and cleanliness..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
            >
              Publish Review
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Dispute Modal */}
      <Modal isOpen={disputeModalOpen} onClose={() => setDisputeModalOpen(false)} title="Raise Dispute / Request Rework">
        <form onSubmit={handleRaiseDispute} className="space-y-4 text-xs">
          <div className="p-3 bg-indigo-50 text-indigo-900 rounded-xl border border-indigo-200">
            <p className="font-bold">48-Hour Protection Window</p>
            <p>
              Our Super Admin arbitration team will review your report within 24 hours. A free warranty rework or refund will be issued if workmanship standards were not met.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Describe the Issue</label>
            <textarea
              rows={4}
              required
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Please explain what went wrong or why the repair failed..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDisputeModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Tax Invoice Modal */}
      <Modal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} title="GST Tax Invoice" maxWidth="max-w-2xl">
        <div className="p-6 bg-white space-y-6 text-xs text-slate-800" id="printable-invoice">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-indigo-600">HomeServe</h2>
              <p className="text-[10px] text-slate-400">HomeServe SaaS Technologies Pvt Ltd</p>
              <p className="text-[10px] text-slate-400">GSTIN: 29AAACH7409R1ZX</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold text-slate-900 block">INV-202611-{booking.id.slice(-4)}</span>
              <p className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Customer & Booking Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-slate-400 uppercase text-[10px]">Billed To</p>
              <p className="font-bold text-slate-900">{booking.customer_name || 'Rahul Sharma'}</p>
              <p>{booking.address?.house_details}</p>
              <p>{booking.address?.city} - {booking.address?.pincode}</p>
            </div>
            <div>
              <p className="font-bold text-slate-400 uppercase text-[10px]">Booking Reference</p>
              <p className="font-mono font-bold text-slate-900">{booking.booking_number}</p>
              <p>Payment Mode: {booking.payment_preference}</p>
              <p className="text-emerald-600 font-bold">Status: {booking.payment_status}</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 font-medium">{booking.service_name}</td>
                <td className="py-2 text-right">{formatPaise(booking.base_price_paise)}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500">Doorstep Travel & Tech Logistics</td>
                <td className="py-2 text-right">{formatPaise(booking.travel_fee_paise)}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500">CGST (9%)</td>
                <td className="py-2 text-right">{formatPaise(Math.round(booking.gst_amount_paise / 2))}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500">SGST (9%)</td>
                <td className="py-2 text-right">{formatPaise(Math.round(booking.gst_amount_paise / 2))}</td>
              </tr>
              <tr className="border-t-2 border-slate-900 font-extrabold text-sm">
                <td className="py-3">Total Paid</td>
                <td className="py-3 text-right text-indigo-600">{formatPaise(booking.total_amount_paise)}</td>
              </tr>
            </tbody>
          </table>

          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            This is a computer-generated digital tax invoice authorized under Section 31 of CGST Act, 2017.
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
