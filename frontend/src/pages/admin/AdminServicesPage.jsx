import React, { useState, useEffect } from 'react'
import { Wrench, Plus, Edit2, Clock, CheckCircle2 } from 'lucide-react'
import { catalogService } from '../../services/catalogService'
import { adminService } from '../../services/adminService'
import { formatPaise, rupeesToPaise } from '../../utils/formatters'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'

export default function AdminServicesPage() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    base_price_rupees: '499',
    estimated_duration_minutes: 60,
    description: '',
  })
  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const srvs = await catalogService.getAllServices()
      setServices(srvs)
      const cats = await catalogService.getCategories()
      setCategories(cats)
      if (cats.length > 0) {
        setFormData((prev) => ({ ...prev, category_id: cats[0].id }))
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleOpenCreate = () => {
    setEditingService(null)
    setFormData({
      name: '',
      slug: '',
      category_id: categories[0]?.id || '',
      base_price_rupees: '499',
      estimated_duration_minutes: 60,
      description: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (srv) => {
    setEditingService(srv)
    setFormData({
      name: srv.name,
      slug: srv.slug || '',
      category_id: srv.category_id,
      base_price_rupees: (srv.base_price_paise / 100).toString(),
      estimated_duration_minutes: srv.estimated_duration_minutes || 60,
      description: srv.description || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const paise = rupeesToPaise(formData.base_price_rupees)
    const payload = {
      ...formData,
      base_price_paise: paise,
    }
    try {
      if (editingService) {
        await adminService.updateService(editingService.id, payload)
        setServices(services.map((s) => (s.id === editingService.id ? { ...s, ...payload } : s)))
        success('Service updated successfully.')
      } else {
        const created = await adminService.createService(payload)
        setServices([...services, created])
        success('New bookable service catalog item created!')
      }
      setModalOpen(false)
    } catch {
      error('Failed to save service.')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catalog Services CRUD</h1>
          <p className="text-xs text-slate-500">Configure bookable trade jobs, standard integer paise prices, and SLAs</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400">
              <th className="p-4">Service Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Base Rate (₹)</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60 transition">
                <td className="p-4 font-bold text-slate-900">
                  {s.name}
                  <span className="block text-[10px] text-slate-400 font-mono font-normal">slug: {s.slug}</span>
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                    {s.category_name || 'Standard'}
                  </span>
                </td>
                <td className="p-4 text-slate-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.estimated_duration_minutes} mins</span>
                  </div>
                </td>
                <td className="p-4 font-extrabold text-sm text-slate-900">
                  {formatPaise(s.base_price_paise)}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? `Edit Service: ${editingService.name}` : 'Create New Service Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Service Title</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Switchboard Replacement"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">URL Slug</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. switchboard-replacement"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parent Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Base Price (in INR)</label>
              <input
                type="number"
                required
                min={49}
                value={formData.base_price_rupees}
                onChange={(e) => setFormData({ ...formData, base_price_rupees: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Estimated Duration (Minutes)</label>
            <input
              type="number"
              required
              min={15}
              value={formData.estimated_duration_minutes}
              onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description & Scope</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Save Service
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
