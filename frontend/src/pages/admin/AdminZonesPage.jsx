import React, { useState, useEffect } from 'react'
import { MapPin, Plus, CheckCircle2 } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'

export default function AdminZonesPage() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', pincode: '', city: 'Bangalore', state: 'Karnataka' })
  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await adminService.getAdminZones()
      setZones(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleCreateZone = async (e) => {
    e.preventDefault()
    try {
      const created = await adminService.createZone(formData)
      setZones([...zones, created])
      setModalOpen(false)
      success(`Zone ${formData.pincode} created and available for provider coverage!`)
      setFormData({ name: '', pincode: '', city: 'Bangalore', state: 'Karnataka' })
    } catch {
      error('Failed to create zone.')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operational Zones & PIN Codes</h1>
          <p className="text-xs text-slate-500">Serviceable geographic territories defined by 6-digit Indian PIN codes</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Operational Zone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((z) => (
          <div key={z.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-extrabold text-indigo-600">{z.pincode}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{z.name}</p>
              <p className="text-xs text-slate-500">{z.city}, {z.state}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
              <strong>{z.providers_count || 12}</strong> verified providers active
            </div>
          </div>
        ))}
      </div>

      {/* Add Zone Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Operational Service Zone">
        <form onSubmit={handleCreateZone} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Zone Area Label</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Koramangala / HSR Layout"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">6-digit PIN Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
              placeholder="560034"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
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
              Save Zone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
