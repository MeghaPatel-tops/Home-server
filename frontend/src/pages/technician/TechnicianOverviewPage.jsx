import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Clock, MapPin, CheckCircle2, Radio, ArrowRight, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { technicianService } from '../../services/technicianService'
import { formatPaise, formatDateTime } from '../../utils/formatters'
import StatusBadge from '../../components/ui/StatusBadge'

export default function TechnicianOverviewPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await technicianService.getMyJobs()
      setJobs(data)
      setLoading(false)
    }
    load()
  }, [])

  const activeJob = jobs.find((j) => j.booking_status !== 'COMPLETED')

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Technician Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Field Service Mobility Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.full_name || 'Vikas Kumar'}
          </h1>
          <p className="text-xs text-slate-300">
            {jobs.length} total assigned orders &bull; Certified HVAC & Electrical Technician
          </p>
        </div>

        <Link
          to="/technician/jobs"
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <Briefcase className="w-4 h-4" />
          <span>View All Assigned Jobs</span>
        </Link>
      </div>

      {/* Immediate Active Job Card */}
      {activeJob && (
        <div className="bg-white rounded-2xl border-2 border-indigo-500 p-6 shadow-md space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-xs font-bold text-slate-500 uppercase block">
                {activeJob.booking_number}
              </span>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {activeJob.service_name}
              </h2>
            </div>
            <StatusBadge status={activeJob.booking_status} />
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Customer: {activeJob.customer?.name} ({activeJob.customer?.phone})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{activeJob.customer?.address}</span>
            </div>
          </div>

          <Link
            to={`/technician/jobs/${activeJob.id}`}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-center"
          >
            <span>Open Job Execution Action Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Jobs Overview List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Assigned Orders ({jobs.length})</h3>
        <div className="space-y-3">
          {jobs.map((j) => (
            <div
              key={j.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700">{j.booking_number}</span>
                  <StatusBadge status={j.booking_status} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{j.service_name}</h4>
                <p className="text-xs text-slate-500">{j.customer?.address}</p>
              </div>

              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <span className="font-extrabold text-sm text-slate-900">{formatPaise(j.total_amount_paise)}</span>
                <Link
                  to={`/technician/jobs/${j.id}`}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition"
                >
                  Action Console &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
