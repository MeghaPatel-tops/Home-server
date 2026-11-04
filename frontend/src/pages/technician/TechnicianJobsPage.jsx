import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Clock, MapPin, User, ArrowRight } from 'lucide-react'
import { technicianService } from '../../services/technicianService'
import { formatPaise, formatDateTime } from '../../utils/formatters'
import StatusBadge from '../../components/ui/StatusBadge'

export default function TechnicianJobsPage() {
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Job Roster</h1>
        <p className="text-xs text-slate-500">
          Field execution orders. Customer verification OTPs are strictly hidden from technician views.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-500 uppercase block">
                    {job.booking_number}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{job.service_name}</h3>
                </div>
                <StatusBadge status={job.booking_status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Customer</p>
                  <p className="font-bold text-slate-900">{job.customer?.name}</p>
                  <p className="text-slate-600 font-semibold">{job.customer?.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Scheduled Time</p>
                  <p className="font-bold text-slate-900">{formatDateTime(job.scheduled_at)}</p>
                  <p className="text-slate-500">Payment: {job.payment_preference}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Destination Doorstep</p>
                  <p className="text-slate-700">{job.customer?.address}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Price</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {formatPaise(job.total_amount_paise)}
                  </span>
                </div>
                <Link
                  to={`/technician/jobs/${job.id}`}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open Job Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
