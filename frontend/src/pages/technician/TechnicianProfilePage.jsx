import React, { useState } from 'react'
import { User, ShieldCheck, Award, Phone, Mail, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function TechnicianProfilePage() {
  const { user } = useAuth()
  const [phone, setPhone] = useState(user?.phone || '+91 91234 56789')
  const { success } = useToast()

  const skills = ['AC Repair & Diagnostics', 'Coil Foam Jet Cleaning', 'Refrigerant R32 / R410A Refill', 'Capacitor Testing']

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Technician Profile & Badges</h1>
        <p className="text-xs text-slate-500">Verified field qualifications, employ status, and contact info</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.full_name?.charAt(0) || 'V'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.full_name || 'Vikas Kumar'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Police Background Verified</span>
              </span>
              <span className="text-xs text-slate-400">&bull; Rating: 4.8 / 5.0</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs pt-4 border-t border-slate-100">
          <div>
            <span className="font-semibold text-slate-400 uppercase text-[10px] block mb-1">
              Employing Provider
            </span>
            <p className="font-bold text-slate-800">Apex Cooling & Appliances Ltd</p>
            <p className="text-[11px] text-slate-500">Partner Organization #prov_demo_01</p>
          </div>

          <div className="pt-2">
            <span className="font-semibold text-slate-400 uppercase text-[10px] block mb-1.5">
              Verified Trade Specializations
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Registered Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => success('Contact phone updated.')}
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
            >
              Update Phone
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
