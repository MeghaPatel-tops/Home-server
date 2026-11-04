import React, { useState, useEffect } from 'react'
import { AlertOctagon, CheckCircle2, RotateCcw, XCircle, ShieldCheck } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatPaise, formatDateTime } from '../../utils/formatters'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [resolveModal, setResolveModal] = useState(false)
  const [resolutionType, setResolutionType] = useState('RESOLVED_REFUND')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await adminService.getAdminDisputes()
      setDisputes(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleOpenResolve = (d) => {
    setSelectedDispute(d)
    setResolveModal(true)
  }

  const handleConfirmResolution = async () => {
    if (!selectedDispute) return
    try {
      await adminService.resolveDispute(
        selectedDispute.id,
        resolutionType,
        resolutionNotes,
        selectedDispute.refund_amount_paise
      )
      setDisputes(disputes.filter((x) => x.id !== selectedDispute.id))
      setResolveModal(false)
      success(`Dispute arbitrated as ${resolutionType.replace(/_/g, ' ')}!`)
    } catch {
      error('Could not record resolution.')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">48-Hour Dispute Arbitration</h1>
        <p className="text-xs text-slate-500">
          Super Admin legal & workmanship tribunal. Order full customer refunds, complimentary rework, or dismissal.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Zero Open Customer Disputes</h3>
          <p className="text-xs text-slate-500">All customer warranty tickets have been resolved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border-2 border-rose-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                    {d.booking_number}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    Status: {d.status}
                  </span>
                </div>
                <span className="text-xs text-slate-400">Raised: {formatDateTime(d.created_at)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Customer & Claim</p>
                  <p className="font-bold text-slate-900">{d.customer_name}</p>
                  <p className="text-slate-600 mt-1 italic leading-relaxed">"{d.reason}"</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Target Contractor</p>
                  <p className="font-bold text-slate-900">{d.provider_name}</p>
                  <p className="text-slate-400 mt-0.5">Verified Partner Roster</p>
                </div>

                <div className="sm:text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Contested Value</p>
                  <p className="text-lg font-extrabold text-rose-600">
                    {formatPaise(d.refund_amount_paise)}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleOpenResolve(d)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  Arbitrate & Resolve &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedDispute && (
        <Modal
          isOpen={resolveModal}
          onClose={() => setResolveModal(false)}
          title={`Arbitrate Dispute: ${selectedDispute.booking_number}`}
        >
          <div className="space-y-4 text-xs text-slate-800">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Arbitration Ruling</label>
              <select
                value={resolutionType}
                onChange={(e) => setResolutionType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="RESOLVED_REFUND">Issue Full Customer Refund ({formatPaise(selectedDispute.refund_amount_paise)})</option>
                <option value="RESOLVED_REWORK">Dispatch Senior Technician for Free Warranty Rework</option>
                <option value="DISMISSED">Dismiss Dispute (Workmanship Met Specifications)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Arbitration Case Notes</label>
              <textarea
                rows={3}
                required
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Reasoning for judgment, refund UTR, or rework dispatch instructions..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResolveModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm"
              >
                Execute Ruling
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
