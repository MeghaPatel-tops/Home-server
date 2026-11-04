import React, { useState, useEffect } from 'react'
import { FolderTree, Plus, Edit2, CheckCircle2 } from 'lucide-react'
import { catalogService } from '../../services/catalogService'
import { adminService } from '../../services/adminService'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', image: '', commission_percent: 15 })
  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await catalogService.getCategories()
      setCategories(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleOpenCreate = () => {
    setEditingCat(null)
    setFormData({ name: '', slug: '', description: '', image: '', commission_percent: 15 })
    setModalOpen(true)
  }

  const handleOpenEdit = (cat) => {
    setEditingCat(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      commission_percent: 15,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCat) {
        await adminService.updateCategory(editingCat.id, formData)
        setCategories(categories.map((c) => (c.id === editingCat.id ? { ...c, ...formData } : c)))
        success('Category updated successfully.')
      } else {
        const created = await adminService.createCategory(formData)
        setCategories([...categories, created])
        success('Category created successfully.')
      }
      setModalOpen(false)
    } catch {
      error('Failed to save category.')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service Categories CRUD</h1>
          <p className="text-xs text-slate-500">Master trade categories, icon assets, and default platform commission rates</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                <span className="font-mono text-[10px] text-slate-400">slug: {cat.slug}</span>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                15% Commission
              </span>
              <button
                onClick={() => handleOpenEdit(cat)}
                className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 p-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCat ? `Edit Category: ${editingCat.name}` : 'Create New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Appliance Repair"
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
              placeholder="e.g. appliance-repair"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Overview Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description of services covered..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
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
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
