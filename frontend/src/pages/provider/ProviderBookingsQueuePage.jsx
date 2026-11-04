import React, { useState, useEffect } from 'react'
import { Clock, MapPin, Check, X, Users, AlertCircle, ArrowRight } from 'lucide-react'
import { providerService } from '../../services/providerService'
import { formatPaise, formatDateTime, formatCountdown } from '../../utils/formatters'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'

export default function ProviderBookingsQueuePage() {
  const [queue, setQueue] = useState([])
  const [fleet, setFleet] = useState([])
  const [loading, setLoading] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(720) // 12 mins

  // Assign Tech Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedTechId, setSelectedTechId] = useState('')

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const q = await providerService.getBookingsQueue()
      setQueue(q)
      const f = await providerService.getFleet()
      setFleet(f.filter((t) => t.is_available && t.is_active))
      setLoading(false)
    }
    load()
  }, [])

  // 15-minute countdown clock
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAcceptClick = (item) => {
    setSelectedBooking(item)
    setAssignModalOpen(true)
  }

  const handleConfirmAssignment = async () => {
    if (!selectedTechId) {
      error('Please select an available technician from your fleet.')
      return
    }
    try {
      await providerService.acceptBooking(selectedBooking.id)
      await providerService.assignTechnician(selectedBooking.id, selectedTechId)
      success(`Booking ${selectedBooking.booking_number} accepted and technician assigned!`)
      setAssignModalOpen(false)
      setQueue(queue.filter((q) => q.id !== selectedBooking.id))
    } catch {
      error('Could not assign technician.')
    }
  }

  const handleConfirmReject = async () => {
    try {
      await providerService.rejectBooking(selectedBooking.id, rejectionReason)
      success('Booking rejected. The dispatch engine has re-routed it to the next candidate.')
      setRejectModalOpen(false)
      setQueue(queue.filter((q) => q.id !== selectedBooking.id))
    } catch {
      error('Failed to reject offer.')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Routing Queue (15-Minute Acceptance SLA)
        </h1>
        <p className="text-xs text-slate-500">
          Orders currently routed to your organization based on 6-digit PIN code coverage
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : queue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Routing Queue is Clear</h3>
          <p className="text-xs text-slate-500">
            No incoming dispatch offers pending. New requests appear automatically when customers book in your zones.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border-2 border-indigo-200 p-6 shadow-md hover:shadow-lg transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                    {item.booking_number}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{item.service_name}</span>
                </div>

                {/* 15m Countdown Timer */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold animate-pulse">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>SLA Timer: {formatCountdown(secondsLeft)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Customer & Destination</p>
                  <p className="font-bold text-slate-900">{item.customer_name}</p>
                  <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{item.address}</span>
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Requested Fulfillment</p>
                  <p className="font-bold text-slate-900">{formatDateTime(item.scheduled_at)}</p>
                  <p className="text-slate-500">Doorstep scheduled appointment</p>
                </div>

                <div className="sm:text-right">
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Your Net Payout (85%)</p>
                  <p className="text-xl font-extrabold text-emerald-600">
                    {formatPaise(item.provider_amount_paise || item.total_amount_paise * 0.85)}
                  </p>
                  <p className="text-[10px] text-slate-400">Total job value: {formatPaise(item.total_amount_paise)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedBooking(item)
                    setRejectModalOpen(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Decline Offer</span>
                </button>

                <button
                  onClick={() => handleAcceptClick(item)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept & Assign Fleet</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Technician Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Fleet Technician to Order"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Select an available on-duty technician to fulfill{' '}
            <strong className="text-slate-900">{selectedBooking?.service_name}</strong>.
          </p>

          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">Available Technicians</label>
            {fleet.length === 0 ? (
              <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
                No technicians currently ON DUTY. Please check your fleet roster.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {fleet.map((tech) => (
                  <div
                    key={tech.id}
                    onClick={() => setSelectedTechId(tech.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
                      selectedTechId === tech.id
                        ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-100'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900">{tech.full_name}</p>
                      <p className="text-slate-500">{tech.phone}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Available
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAssignment}
              disabled={!selectedTechId}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Dispatch Offer"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Declining this order will automatically route it to the next candidate provider in this PIN zone.
          </p>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Rejection</label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="NO_TECHNICIAN_AVAILABLE">All fleet technicians currently on job</option>
              <option value="DISTANCE_TOO_FAR">Outside immediate response distance</option>
              <option value="SKILL_UNAVAILABLE">Specialized tooling/part currently unavailable</option>
              <option value="OTHER">Other operational reason</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
            >
              Back
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl"
            >
              Confirm Decline
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
