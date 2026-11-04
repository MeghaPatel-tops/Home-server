import React, { useState, useEffect } from 'react'
import { DollarSign, CheckCircle2, ArrowUpRight, ShieldCheck, X } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { formatPaise, formatDateTime } from '../../utils/formatters'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [processModal, setProcessModal] = useState(false)
  const [bankUtr, setBankUtr] = useState('UTR2026110488210')
  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await adminService.getAdminPayouts()
      setPayouts(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleConfirmDisbursement = async () => {
    if (!bankUtr || !selectedPayout) return
    try {
      await adminService.processPayout(selectedPayout.id, bankUtr)
      setPayouts(payouts.filter((p) => p.id !== selectedPayout.id))
      setProcessModal(false)
      success(`Payout disbursed with bank reference ${bankUtr}!`)
    } catch {
      error('Failed to process payout.')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Provider Withdrawal Payouts</h1>
        <p className="text-xs text-slate-500">
          Disburse contractor wallet earnings via direct bank transfer (IMPS/NEFT)
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payouts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">All Payout Requests Disbursed</h3>
          <p className="text-xs text-slate-500">No pending contractor bank withdrawals.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400">
                <th className="p-4">Provider Organization</th>
                <th className="p-4">Destination Bank Account</th>
                <th className="p-4">Requested At</th>
                <th className="p-4 text-right">Amount (₹)</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{p.provider_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {p.id}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{p.bank_account_mask}</p>
                    <p className="text-[10px] text-slate-500 font-mono">IFSC: {p.bank_ifsc}</p>
                  </td>
                  <td className="p-4 text-slate-500">{formatDateTime(p.requested_at)}</td>
                  <td className="p-4 text-right font-extrabold text-sm text-emerald-600">
                    {formatPaise(p.amount_paise)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedPayout(p)
                        setProcessModal(true)
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      Disburse Payout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Disburse Modal */}
      {selectedPayout && (
        <Modal
          isOpen={processModal}
          onClose={() => setProcessModal(false)}
          title={`Disburse Payout: ${selectedPayout.provider_name}`}
        >
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-4 bg-slate-50 rounded-xl space-y-1">
              <p className="text-slate-500">Gross Withdrawal Amount</p>
              <p className="text-2xl font-extrabold text-slate-900">{formatPaise(selectedPayout.amount_paise)}</p>
              <p className="text-slate-500 pt-1">To: {selectedPayout.bank_account_mask} ({selectedPayout.bank_ifsc})</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Reference ID / UTR Number</label>
              <input
                type="text"
                required
                value={bankUtr}
                onChange={(e) => setBankUtr(e.target.value.toUpperCase())}
                placeholder="e.g. UTR2026110488210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProcessModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisbursement}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm"
              >
                Confirm Bank Disbursement
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
