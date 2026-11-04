import React, { useState, useEffect } from 'react'
import { DollarSign, ArrowUpRight, Clock, CheckCircle2, ShieldCheck, Plus } from 'lucide-react'
import { providerService } from '../../services/providerService'
import { formatPaise, formatDateTime, rupeesToPaise } from '../../utils/formatters'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'

export default function ProviderPayoutsPage() {
  const [payouts, setPayouts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [withdrawRupees, setWithdrawRupees] = useState('25000')
  const [bankAccount, setBankAccount] = useState('50100239482910')
  const [bankIfsc, setBankIfsc] = useState('HDFC0000128')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await providerService.getPayouts()
      setPayouts(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleRequestPayout = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const amountPaise = rupeesToPaise(withdrawRupees)

    if (amountPaise < 50000) {
      error('Minimum payout request is ₹500 (50,000 paise).')
      setIsSubmitting(false)
      return
    }

    try {
      await providerService.requestPayout(amountPaise, {
        bank_account_mask: '•••• •••• ' + bankAccount.slice(-4),
        bank_ifsc: bankIfsc,
      })
      success(`Withdrawal request for ₹${withdrawRupees} submitted for admin disbursement!`)
      setModalOpen(false)
      const data = await providerService.getPayouts()
      setPayouts(data)
    } catch {
      error('Could not process payout request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Earnings & Bank Payouts</h1>
          <p className="text-xs text-slate-500">Track net earnings (85%), commission deductions, and withdrawal history</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Request Bank Withdrawal</span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Available Wallet Balance</span>
          <p className="text-3xl font-extrabold text-slate-900">
            {formatPaise(payouts?.wallet_balance_paise || 14250000)}
          </p>
          <p className="text-xs text-emerald-600 font-semibold">Immediate withdrawal eligible</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pending In-Flight Payouts</span>
          <p className="text-3xl font-extrabold text-amber-600">
            {formatPaise(payouts?.pending_withdrawal_paise || 2500000)}
          </p>
          <p className="text-xs text-slate-400">Under admin bank processing</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Lifetime Total Disbursed</span>
          <p className="text-3xl font-extrabold text-slate-900">
            {formatPaise(payouts?.total_withdrawn_paise || 85000000)}
          </p>
          <p className="text-xs text-slate-400">Credited to registered bank account</p>
        </div>
      </div>

      {/* Commission Explainer */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs">
        <div>
          <p className="font-bold">Transparent 15% Platform Commission Model</p>
          <p className="text-slate-400">
            For every completed job, HomeServe deducts a 15% platform fee for payment gateway processing, customer acquisition, and 30-day rework insurance. 85% goes directly to you.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold text-xs whitespace-nowrap ml-4">
          85% Net Split
        </span>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <h3 className="text-base font-bold text-slate-900">Withdrawal Transaction Ledger</h3>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400">
              <th className="p-3">Reference ID</th>
              <th className="p-3">Destination Account</th>
              <th className="p-3">Requested At</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payouts?.history?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60">
                <td className="p-3 font-mono font-bold text-slate-800">
                  {item.bank_reference_id || item.id}
                </td>
                <td className="p-3">
                  <p className="font-semibold text-slate-900">{item.bank_account_mask}</p>
                  <p className="text-[10px] text-slate-400">IFSC: {item.bank_ifsc}</p>
                </td>
                <td className="p-3 text-slate-500">{formatDateTime(item.requested_at)}</td>
                <td className="p-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.payout_status === 'PROCESSED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.payout_status}
                  </span>
                </td>
                <td className="p-3 text-right font-extrabold text-sm text-slate-900">
                  {formatPaise(item.amount_paise)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Withdrawal Request Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Request Bank Payout Withdrawal">
        <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Withdrawal Amount (in INR)</label>
            <input
              type="number"
              required
              min={500}
              value={withdrawRupees}
              onChange={(e) => setWithdrawRupees(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900"
            />
            <p className="text-[10px] text-slate-400 mt-1">Minimum threshold: ₹500 (50,000 paise)</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
            <input
              type="text"
              required
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bank IFSC Code</label>
            <input
              type="text"
              required
              value={bankIfsc}
              onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono font-bold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Withdrawal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
