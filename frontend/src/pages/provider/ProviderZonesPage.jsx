import React, { useState, useEffect } from 'react'
import { MapPin, Plus, Check, Trash2 } from 'lucide-react'
import { providerService } from '../../services/providerService'
import { useToast } from '../../context/ToastContext'

export default function ProviderZonesPage() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPincode, setNewPincode] = useState('')
  const { success, error } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await providerService.getZones()
      setZones(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleAddZone = (e) => {
    e.preventDefault()
    if (newPincode.trim().length !== 6) return
    const newZ = {
      id: 'zn_' + Date.now(),
      pincode: newPincode.trim(),
      city: 'Bangalore',
      state: 'Karnataka',
      is_active: true,
    }
    setZones([...zones, newZ])
    setNewPincode('')
    success(`Zone ${newPincode} linked! Your fleet will now receive orders in this area.`)
  }

  const handleRemoveZone = (id) => {
    setZones(zones.filter((z) => z.id !== id))
    success('Zone unlinked.')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service Coverage Zones</h1>
        <p className="text-xs text-slate-500">
          6-digit Indian PIN codes serviced by your fleet. The dispatch engine routes matching bookings here.
        </p>
      </div>

      {/* Add Zone Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Link New Operational PIN Code</h3>
        <form onSubmit={handleAddZone} className="flex gap-3 max-w-md">
          <input
            type="text"
            required
            maxLength={6}
            value={newPincode}
            onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit Pincode (e.g. 560066)"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={newPincode.length !== 6}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            Add Pincode
          </button>
        </form>
      </div>

      {/* Zones List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Active Coverage Territories ({zones.length})</h3>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {zones.map((z) => (
              <div
                key={z.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-sm font-extrabold text-slate-900 block">{z.pincode}</span>
                    <span className="text-[11px] text-slate-500">{z.city}, {z.state}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveZone(z.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Unlink Zone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
