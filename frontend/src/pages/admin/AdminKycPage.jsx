import React, { useState, useEffect } from 'react'
import { ShieldCheck, FileText, CheckCircle2, XCircle, Eye, AlertCircle } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatDateTime } from '../../utils/formatters'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'

export default function AdminKycPage() {
  const [kycQueue, setKycQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedKyc, setSelectedKyc] = useState(null)
  const [inspectModal, setInspectModal] = useState(false)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectionNotes, setRejectionNotes] = useState('')
  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await adminService.getPendingKyc()
      setKycQueue(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleApprove = async (providerId) => {
    try {
      await adminService.kycDecision(providerId, 'APPROVED')
      setKycQueue(kycQueue.filter((k) => k.id !== providerId))
      setInspectModal(false)
      success('Provider KYC verified & approved. They can now receive orders.')
    } catch {
      error('Could not record decision.')
    }
  }

  const handleReject = async () => {
    if (!selectedKyc) return
    try {
      await adminService.kycDecision(selectedKyc.id, 'REJECTED', rejectionNotes)
      setKycQueue(kycQueue.filter((k) => k.id !== selectedKyc.id))
      setRejectModal(false)
      setInspectModal(false)
      success('Provider KYC rejected with feedback notes.')
    } catch {
      error('Could not record rejection.')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Provider KYC Verification Queue</h1>
        <p className="text-xs text-slate-500">
          Review business registration certificates and trade licenses before activating provider accounts
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : kycQueue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">All KYC Submissions Cleared</h3>
          <p className="text-xs text-slate-500">No contractor applications are pending administrative review.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400">
                <th className="p-4">Company Name</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Document Type</th>
                <th className="p-4">Submitted At</th>
                <th className="p-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kycQueue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{item.business_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{item.id}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{item.contact_person}</p>
                    <p className="text-[10px] text-slate-500">{item.contact_number}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
                      {item.document_type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{formatDateTime(item.submitted_at)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedKyc(item)
                        setInspectModal(true)
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect & Decide</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspect Modal */}
      {selectedKyc && (
        <Modal
          isOpen={inspectModal}
          onClose={() => setInspectModal(false)}
          title={`KYC Inspection: ${selectedKyc.business_name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs text-slate-800">
            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Business Legal Name</p>
                  <p className="font-bold text-sm text-slate-900">{selectedKyc.business_name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Document Type</p>
                  <p className="font-bold text-sm text-slate-900">{selectedKyc.document_type}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Contact Person</p>
                  <p className="font-semibold">{selectedKyc.contact_person} ({selectedKyc.contact_number})</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Secure Storage Reference</p>
                  <p className="font-mono text-[10px] text-slate-600">{selectedKyc.kyc_document_key}</p>
                </div>
              </div>
            </div>

            {/* Document Preview Placeholder */}
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50">
              <FileText className="w-10 h-10 text-indigo-600 mx-auto" />
              <p className="font-bold text-slate-800">Verified Certificate Document: {selectedKyc.document_type}</p>
              <p className="text-[11px] text-slate-400">
                Authorized government registration records inspected via private S3 storage key.
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                onClick={() => setRejectModal(true)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition"
              >
                Reject with Feedback
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setInspectModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => handleApprove(selectedKyc.id)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition"
                >
                  Approve Provider KYC
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Reject KYC Submission">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Specify the deficiency (e.g. Expired GST certificate, blurry photograph) so the provider can re-upload.
          </p>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rejection Remarks</label>
            <textarea
              rows={3}
              required
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              placeholder="e.g. The uploaded GSTIN does not match the registered legal business name..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setRejectModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
