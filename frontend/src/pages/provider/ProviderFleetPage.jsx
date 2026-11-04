import React, { useState, useEffect } from 'react'
import { Users, Plus, ShieldCheck, Phone, Mail, ToggleLeft, ToggleRight } from 'lucide-react'
import { providerService } from '../../services/providerService'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'

export default function ProviderFleetPage() {
  const [fleet, setFleet] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', skills: 'AC Repair, HVAC, Wiring' })
  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await providerService.getFleet()
      setFleet(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleAddTechnician = async (e) => {
    e.preventDefault()
    try {
      const skillsArr = formData.skills.split(',').map((s) => s.trim())
      const created = await providerService.createTechnician({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        skills: skillsArr,
      })
      setFleet([...fleet, created])
      setModalOpen(false)
      success(`Technician ${created.full_name} onboarded to your fleet!`)
      setFormData({ full_name: '', email: '', phone: '', skills: 'AC Repair, HVAC, Wiring' })
    } catch {
      error('Failed to create technician account.')
    }
  }

  const handleToggleStatus = async (techId, currentActive) => {
    try {
      await providerService.updateTechnicianStatus(techId, !currentActive)
      setFleet(
        fleet.map((t) => (t.id === techId ? { ...t, is_active: !currentActive } : t))
      )
      success(`Technician marked as ${!currentActive ? 'Active' : 'Suspended'}`)
    } catch {
      error('Could not update status.')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fleet Technicians</h1>
          <p className="text-xs text-slate-500">Manage field staff, trade qualifications, and dispatch availability</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Technician</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fleet.map((tech) => (
            <div
              key={tech.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{tech.full_name}</h3>
                    <p className="text-xs text-slate-500">{tech.phone}</p>
                    <p className="text-[11px] text-slate-400">{tech.email}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tech.is_available
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tech.is_available ? 'On Duty' : 'Off Duty'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Specialized Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tech.skills?.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Account: {tech.is_active ? 'Active' : 'Suspended'}</span>
                <button
                  onClick={() => handleToggleStatus(tech.id, tech.is_active)}
                  className={`text-xs font-semibold ${tech.is_active ? 'text-rose-600 hover:underline' : 'text-emerald-600 hover:underline'}`}
                >
                  {tech.is_active ? 'Suspend' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onboard Tech Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Onboard New Fleet Technician">
        <form onSubmit={handleAddTechnician} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. Suresh Patil"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (For dispatch SMS & OTP login)</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 99887 77665"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="suresh.tech@homeserve.test"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Trade Skills (Comma separated)</label>
            <input
              type="text"
              required
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="Plumbing, Water Motor, AC Repair"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm"
            >
              Add Technician
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
