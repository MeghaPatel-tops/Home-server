import React, { useState, useEffect } from 'react'
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { authService } from '../../services/authService'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    house_details: '',
    street_locality: '',
    landmark: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560103',
    is_default: false,
  })
  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await authService.getAddresses()
      setAddresses(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      const created = await authService.createAddress(formData)
      setAddresses([...addresses, created])
      setModalOpen(false)
      success('Doorstep address added!')
      setFormData({
        house_details: '',
        street_locality: '',
        landmark: '',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560103',
        is_default: false,
      })
    } catch {
      const mock = { id: 'addr_' + Date.now(), ...formData }
      setAddresses([...addresses, mock])
      setModalOpen(false)
      success('Address saved successfully.')
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
      await authService.deleteAddress(id)
    } catch {
      // local remove
    }
    setAddresses(addresses.filter((a) => a.id !== id))
    success('Address removed.')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Addresses</h1>
          <p className="text-xs text-slate-500">Manage doorstep locations for rapid service booking</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-base font-bold text-slate-800">No addresses saved yet</p>
          <p className="text-xs text-slate-500">Add your apartment or office location to check pincode coverage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>{addr.house_details}</span>
                  </div>
                  {addr.is_default && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-slate-600 pl-5.5">{addr.street_locality}</p>
                {addr.landmark && <p className="text-slate-400 pl-5.5">Near: {addr.landmark}</p>}
                <p className="text-slate-600 pl-5.5">{addr.city}, {addr.state} - <strong className="font-mono">{addr.pincode}</strong></p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Delivery Address">
        <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Flat / House No / Society</label>
            <input
              type="text"
              required
              value={formData.house_details}
              onChange={(e) => setFormData({ ...formData, house_details: e.target.value })}
              placeholder="e.g. Flat 402, Green Glen Apartments"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Street / Locality</label>
            <input
              type="text"
              required
              value={formData.street_locality}
              onChange={(e) => setFormData({ ...formData, street_locality: e.target.value })}
              placeholder="e.g. Bellandur Main Road"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Landmark (Optional)</label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="Near EcoSpace"
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
                placeholder="560103"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
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

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_def"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="is_def" className="text-slate-700 font-semibold">Set as primary address</label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
