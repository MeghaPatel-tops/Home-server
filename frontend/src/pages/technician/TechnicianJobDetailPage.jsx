import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Briefcase,
  MapPin,
  Phone,
  Navigation,
  KeyRound,
  Camera,
  PlusCircle,
  CheckCircle2,
  Banknote,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { technicianService } from '../../services/technicianService'
import { formatPaise, formatDateTime, rupeesToPaise } from '../../utils/formatters'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../context/ToastContext'

export default function TechnicianJobDetailPage() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  // Start OTP
  const [startOtpInput, setStartOtpInput] = useState('')
  const [verifyingStart, setVerifyingStart] = useState(false)

  // End OTP
  const [completionOtpInput, setCompletionOtpInput] = useState('')
  const [verifyingCompletion, setVerifyingCompletion] = useState(false)

  // Change Order Modal
  const [changeOrderModal, setChangeOrderModal] = useState(false)
  const [coDesc, setCoDesc] = useState('')
  const [coRupees, setCoRupees] = useState('350')

  // Photos upload modal
  const [photoModal, setPhotoModal] = useState(false)
  const [photoType, setPhotoType] = useState('BEFORE')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Cash confirmation
  const [cashConfirmed, setCashConfirmed] = useState(false)

  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await technicianService.getMyJobs()
      const match = data.find((x) => x.id === id) || data[0]
      setJob(match)
      setLoading(false)
    }
    load()
  }, [id])

  const handleUpdateStatus = async (newStatus) => {
    try {
      await technicianService.updateJobStatus(job.id, newStatus)
      setJob({ ...job, booking_status: newStatus })
      success(`Status updated to ${newStatus}`)
    } catch {
      error('Failed to update status.')
    }
  }

  const handleVerifyStartOtp = async (e) => {
    e.preventDefault()
    if (startOtpInput.length !== 6) return
    setVerifyingStart(true)
    try {
      await technicianService.verifyStartOtp(job.id, startOtpInput)
      setJob({ ...job, booking_status: 'IN_PROGRESS' })
      success('Start OTP verified! Work in progress.')
    } catch {
      error('Invalid Start OTP. Please ask the customer to check their dashboard or SMS.')
    } finally {
      setVerifyingStart(false)
    }
  }

  const handleVerifyCompletionOtp = async (e) => {
    e.preventDefault()
    if (completionOtpInput.length !== 6) return
    setVerifyingCompletion(true)
    try {
      await technicianService.verifyCompletionOtp(job.id, completionOtpInput)
      setJob({ ...job, booking_status: 'COMPLETED' })
      success('Completion OTP verified! Booking marked COMPLETED.')
    } catch {
      error('Invalid Completion OTP.')
    } finally {
      setVerifyingCompletion(false)
    }
  }

  const handleAddChangeOrder = async (e) => {
    e.preventDefault()
    const paise = rupeesToPaise(coRupees)
    try {
      await technicianService.createChangeOrder(job.id, {
        description: coDesc,
        additional_amount_paise: paise,
        total_amount_paise: Math.round(paise * 1.18),
      })
      success('Change order quote submitted to customer!')
      setChangeOrderModal(false)
      setCoDesc('')
    } catch {
      error('Failed to submit quote.')
    }
  }

  const handleUploadProof = (e) => {
    e.preventDefault()
    if (!selectedPhoto) return
    setUploadingPhoto(true)
    setTimeout(() => {
      setUploadingPhoto(false)
      setPhotoModal(false)
      const newMedia = {
        id: 'med_' + Date.now(),
        media_type: photoType,
        url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80',
        original_filename: selectedPhoto.name,
      }
      setJob({ ...job, media: [...(job.media || []), newMedia] })
      success(`${photoType} proof photo recorded!`)
    }, 400)
  }

  const handleConfirmCash = async () => {
    try {
      await technicianService.confirmCash(job.id, job.total_amount_paise)
      setCashConfirmed(true)
      success('Cash payment confirmed and recorded into provider settlement ledger.')
    } catch {
      error('Could not confirm cash.')
    }
  }

  if (loading || !job) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase">{job.booking_number}</span>
            <StatusBadge status={job.booking_status} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{job.service_name}</h1>
          <p className="text-xs text-slate-500">Scheduled: {formatDateTime(job.scheduled_at)}</p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Job Amount</span>
          <span className="text-xl font-extrabold text-slate-900">{formatPaise(job.total_amount_paise)}</span>
        </div>
      </div>

      {/* Customer & Doorstep Navigation Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Customer Destination</h3>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(job.customer?.address || 'Bangalore')}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-500/30 transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Maps</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-400 font-semibold">Customer Name</p>
            <p className="text-base font-bold text-white">{job.customer?.name}</p>
            <a
              href={`tel:${job.customer?.phone}`}
              className="text-cyan-300 font-semibold flex items-center gap-1 mt-1 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{job.customer?.phone}</span>
            </a>
          </div>

          <div>
            <p className="text-slate-400 font-semibold">Doorstep Address</p>
            <p className="text-white leading-relaxed">{job.customer?.address}</p>
          </div>
        </div>
      </div>

      {/* Execution Workflow Steps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900">Step-by-Step Job Fulfillment</h3>

        {/* Step 1: En Route / Arrived status update */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">1. Transit & Arrival</span>
            <span className="text-[10px] font-semibold text-slate-500">Current: {job.booking_status}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleUpdateStatus('EN_ROUTE')}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition"
            >
              Mark EN ROUTE
            </button>
            <button
              onClick={() => handleUpdateStatus('ARRIVED')}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition"
            >
              Mark ARRIVED at Doorstep
            </button>
          </div>
        </div>

        {/* Step 2: Start OTP Verification */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">2. Customer Start OTP Handshake</span>
            </div>
            {job.booking_status === 'IN_PROGRESS' || job.booking_status === 'COMPLETED' ? (
              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            ) : (
              <span className="text-amber-700 font-bold text-xs">Required before repair</span>
            )}
          </div>

          {job.booking_status !== 'IN_PROGRESS' && job.booking_status !== 'COMPLETED' && (
            <form onSubmit={handleVerifyStartOtp} className="flex gap-2 max-w-sm">
              <input
                type="text"
                required
                maxLength={6}
                value={startOtpInput}
                onChange={(e) => setStartOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Start OTP"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono font-bold tracking-widest text-center"
              />
              <button
                type="submit"
                disabled={verifyingStart || startOtpInput.length !== 6}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition"
              >
                {verifyingStart ? 'Checking...' : 'Start Job'}
              </button>
            </form>
          )}
        </div>

        {/* Step 3: On-Site Change Order Quote */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800">3. Extra Parts / Scope (Change Order)</span>
              <p className="text-[11px] text-slate-500">Only approved quotes contribute to final payment.</p>
            </div>
            <button
              onClick={() => setChangeOrderModal(true)}
              className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Parts Quote</span>
            </button>
          </div>
        </div>

        {/* Step 4: Before/After Proof Photos */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">4. Before & After Job Photos</span>
            <button
              onClick={() => setPhotoModal(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Upload Photo Proof</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {job.media?.map((m) => (
              <div key={m.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                <img src={m.url} alt={m.original_filename} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[9px] text-white font-bold text-center py-0.5">
                  {m.media_type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 5: Completion OTP Verification */}
        <div className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950">5. Customer Completion OTP Verification</span>
            <span className="text-[10px] font-bold text-emerald-700">Final Step</span>
          </div>
          <p className="text-xs text-slate-600">
            Ask the customer to inspect the completed repair and provide their 6-digit Completion OTP from their app.
          </p>

          {job.booking_status !== 'COMPLETED' ? (
            <form onSubmit={handleVerifyCompletionOtp} className="flex gap-2 max-w-sm">
              <input
                type="text"
                required
                maxLength={6}
                value={completionOtpInput}
                onChange={(e) => setCompletionOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit Completion OTP"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono font-bold tracking-widest text-center"
              />
              <button
                type="submit"
                disabled={verifyingCompletion || completionOtpInput.length !== 6}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                {verifyingCompletion ? 'Finalizing...' : 'Complete Job'}
              </button>
            </form>
          ) : (
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Job Completed Successfully! Payout added to provider ledger.</span>
            </div>
          )}
        </div>

        {/* Step 6: Cash Collection (If cash payment mode) */}
        {job.payment_preference === 'CASH' && (
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                <Banknote className="w-4 h-4 text-amber-600" />
                <span>On-Site Cash Collection Required</span>
              </div>
              <span className="font-extrabold text-sm text-slate-900">{formatPaise(job.total_amount_paise)}</span>
            </div>

            {cashConfirmed ? (
              <p className="text-xs font-bold text-emerald-700">Cash collection confirmed!</p>
            ) : (
              <button
                onClick={handleConfirmCash}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
              >
                Confirm Cash Collected ({formatPaise(job.total_amount_paise)})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Change Order Modal */}
      <Modal isOpen={changeOrderModal} onClose={() => setChangeOrderModal(false)} title="Add On-Site Change Order Quote">
        <form onSubmit={handleAddChangeOrder} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description of Spare Parts or Extra Work</label>
            <textarea
              required
              rows={3}
              value={coDesc}
              onChange={(e) => setCoDesc(e.target.value)}
              placeholder="e.g. 45uF AC capacitor burst replacement..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Base Additional Amount (₹)</label>
            <input
              type="number"
              required
              min={50}
              value={coRupees}
              onChange={(e) => setCoRupees(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setChangeOrderModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
            >
              Send Quote to Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Photo Upload Modal */}
      <Modal isOpen={photoModal} onClose={() => setPhotoModal(false)} title="Upload Proof Photos">
        <form onSubmit={handleUploadProof} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Photo Classification</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPhotoType('BEFORE')}
                className={`p-2.5 rounded-xl font-bold border ${
                  photoType === 'BEFORE'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                BEFORE Work
              </button>
              <button
                type="button"
                onClick={() => setPhotoType('AFTER')}
                className={`p-2.5 rounded-xl font-bold border ${
                  photoType === 'AFTER'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                AFTER Work
              </button>
            </div>
          </div>

          <div>
            <input
              type="file"
              required
              accept="image/*"
              onChange={(e) => setSelectedPhoto(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPhotoModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingPhoto || !selectedPhoto}
              className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
            >
              {uploadingPhoto ? 'Saving...' : 'Upload Photo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
