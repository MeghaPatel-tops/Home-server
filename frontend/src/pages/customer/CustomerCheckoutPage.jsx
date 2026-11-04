import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard,
  Banknote,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { useBooking } from '../../context/BookingContext'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { formatPaise } from '../../utils/formatters'
import { PaymentPreference } from '../../utils/constants'

export default function CustomerCheckoutPage() {
  const {
    selectedService,
    pricing,
    pincode,
    checkServiceability,
    serviceability,
    selectedAddress,
    setSelectedAddress,
    scheduledDate,
    setScheduledDate,
    scheduledSlot,
    setScheduledSlot,
    paymentPreference,
    setPaymentPreference,
    specialInstructions,
    setSpecialInstructions,
    submitBooking,
    isSubmitting,
  } = useBooking()

  const { user } = useAuth()
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState([])
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddr, setNewAddr] = useState({
    house_details: '',
    street_locality: '',
    landmark: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: pincode || '560103',
  })

  useEffect(() => {
    async function loadAddresses() {
      const data = await authService.getAddresses()
      setAddresses(data)
      if (data.length > 0 && !selectedAddress) {
        setSelectedAddress(data[0])
      }
    }
    loadAddresses()
  }, [selectedAddress, setSelectedAddress])

  const handleCreateAddress = (e) => {
    e.preventDefault()
    const created = { id: 'addr_' + Date.now(), ...newAddr }
    setAddresses([...addresses, created])
    setSelectedAddress(created)
    setShowNewAddress(false)
  }

  const handlePlaceOrder = async () => {
    const booking = await submitBooking()
    if (booking) {
      navigate(`/customer/bookings/${booking.id}`)
    }
  }

  if (!selectedService) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-base font-bold text-slate-800">No service selected for booking.</p>
        <Link to="/services" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-block">
          Browse Service Catalog
        </Link>
      </div>
    )
  }

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
  ]

  return (
    <div className="py-4 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Booking Checkout</h1>
        <p className="text-xs text-slate-500">Review schedule, verify doorstep address, and confirm payment preference</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Flow Steps */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Selected Service Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Step 1: Selected Service</span>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedService.name}</h3>
                <p className="text-xs text-slate-500">{selectedService.category_name} &bull; {selectedService.estimated_duration_minutes} mins estimated</p>
              </div>
              <span className="text-base font-extrabold text-slate-900">{formatPaise(pricing.base_price_paise)}</span>
            </div>
          </div>

          {/* 2. Doorstep Address Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Step 2: Service Delivery Address</span>
              <button
                type="button"
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showNewAddress ? 'Cancel' : 'Add New Address'}</span>
              </button>
            </div>

            {showNewAddress ? (
              <form onSubmit={handleCreateAddress} className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-800">Add New Doorstep Address</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="House / Flat No / Building"
                    value={newAddr.house_details}
                    onChange={(e) => setNewAddr({ ...newAddr, house_details: e.target.value })}
                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street / Locality"
                    value={newAddr.street_locality}
                    onChange={(e) => setNewAddr({ ...newAddr, street_locality: e.target.value })}
                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={newAddr.landmark}
                    onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit PIN Code"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, '') })}
                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                >
                  Save & Use Address
                </button>
              </form>
            ) : (
              <div className="space-y-2">
                {addresses.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
                    No saved addresses. Please click "Add New Address".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddress?.id === addr.id
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                            isSelected
                              ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-100'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <MapPin className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <div className="text-xs space-y-0.5">
                            <p className="font-bold text-slate-800">{addr.house_details}</p>
                            <p className="text-slate-500">{addr.street_locality}, {addr.city}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-[10px] text-slate-700">
                              PIN: {addr.pincode}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Schedule Date & Slot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Step 3: Service Fulfillment Slot</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Arrival Window</label>
                <select
                  value={scheduledSlot}
                  onChange={(e) => setScheduledSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-800"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Special Doorstep Instructions (Optional)</label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Gate code, landmark notes, pet warnings..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white"
              />
            </div>
          </div>

          {/* 4. Payment Preference */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Step 4: Payment Preference</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentPreference(PaymentPreference.ONLINE)}
                className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                  paymentPreference === PaymentPreference.ONLINE
                    ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-100'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Pay Online (Razorpay)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Recommended</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  UPI, Credit/Debit cards, NetBanking. Funds protected until Completion OTP verification.
                </p>
              </div>

              <div
                onClick={() => setPaymentPreference(PaymentPreference.CASH)}
                className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                  paymentPreference === PaymentPreference.CASH
                    ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-100'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Cash on Completion</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Pay cash to the technician after verifying the work and completing the job with OTP.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Summary & Confirm */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-slate-900">Price Breakdown</h3>

            <div className="space-y-3 text-xs text-slate-600 border-b border-slate-100 pb-4">
              <div className="flex justify-between">
                <span>Catalogue Base Price</span>
                <span className="font-semibold text-slate-900">{formatPaise(pricing.base_price_paise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Doorstep Travel Fee</span>
                <span className="font-semibold text-slate-900">{formatPaise(pricing.travel_fee_paise)}</span>
              </div>
              <div className="flex justify-between">
                <span>18% GST (CGST 9% + SGST 9%)</span>
                <span className="font-semibold text-slate-900">{formatPaise(pricing.gst_amount_paise)}</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Payable</span>
              <span className="text-indigo-600">{formatPaise(pricing.total_amount_paise)}</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] space-y-1 border border-emerald-200">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero Risk Guarantee</span>
              </div>
              <p className="leading-relaxed">
                Work begins only with Start OTP. Free 30-day rework warranty covered on all completed orders.
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || !selectedAddress}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Book Service'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
