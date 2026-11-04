import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Inbox,
  Users,
  DollarSign,
  CalendarCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { providerService } from '../../services/providerService'
import { formatPaise, formatCountdown } from '../../utils/formatters'

export default function ProviderOverviewPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [queue, setQueue] = useState([])
  const [fleet, setFleet] = useState([])
  const [payouts, setPayouts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const p = await providerService.getProfile()
      setProfile(p)

      const q = await providerService.getBookingsQueue()
      setQueue(q)

      const f = await providerService.getFleet()
      setFleet(f)

      const po = await providerService.getPayouts()
      setPayouts(po)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-8">
      {/* Provider Header Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>KYC Status: <strong className="text-white">{profile?.kyc_status || 'APPROVED'}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {profile?.business_name || 'Apex Cooling & Appliances Ltd'}
          </h1>
          <p className="text-xs text-slate-300">
            Fleet Operations Console &bull; {fleet.length} Registered Technicians
          </p>
        </div>

        <Link
          to="/provider/queue"
          className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2 whitespace-nowrap"
        >
          <Inbox className="w-4 h-4" />
          <span>View Routing Queue ({queue.length})</span>
        </Link>
      </div>

      {/* SLA Queue Alert Banner (If pending orders in queue) */}
      {queue.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-400 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-extrabold flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-900">
                {queue.length} Pending Booking Dispatch Offer Awaiting 15m SLA Decision
              </p>
              <p className="text-xs text-slate-600">
                Accept or reject before the timer expires to maintain top provider dispatch ranking.
              </p>
            </div>
          </div>
          <Link
            to="/provider/queue"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm text-center"
          >
            Open 15m Queue &rarr;
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wallet Balance</span>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatPaise(payouts?.wallet_balance_paise || 14250000)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">Available for bank withdrawal</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Fleet</span>
          <p className="text-2xl font-extrabold text-slate-900">
            {fleet.filter((t) => t.is_available).length} / {fleet.length}
          </p>
          <p className="text-[11px] text-indigo-600 font-semibold">Technicians on duty today</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Revenue Share</span>
          <p className="text-2xl font-extrabold text-slate-900">85%</p>
          <p className="text-[11px] text-slate-400">15% standard platform commission</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acceptance Rate</span>
          <p className="text-2xl font-extrabold text-slate-900">98.4%</p>
          <p className="text-[11px] text-emerald-600 font-semibold">SLA compliance score</p>
        </div>
      </div>

      {/* Fleet Overview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Fleet Technician Availability</h3>
            <p className="text-xs text-slate-500">Live roster ready for dispatch assignment</p>
          </div>
          <Link to="/provider/fleet" className="text-xs font-semibold text-indigo-600 hover:underline">
            Manage Fleet &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2.5">Technician</th>
                <th className="py-2.5">Skills</th>
                <th className="py-2.5">Duty Status</th>
                <th className="py-2.5">Active Jobs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fleet.map((tech) => (
                <tr key={tech.id}>
                  <td className="py-3 font-semibold text-slate-900">
                    {tech.full_name}
                    <span className="block text-[10px] text-slate-400 font-normal">{tech.phone}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {tech.skills?.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tech.is_available
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${tech.is_available ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {tech.is_available ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-800">{tech.active_jobs || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
