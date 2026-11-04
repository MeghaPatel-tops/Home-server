import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { catalogService } from '../../services/catalogService'
import { reviewService } from '../../services/reviewService'
import { formatPaise } from '../../utils/formatters'
import { useBooking } from '../../context/BookingContext'
import RatingStars from '../../components/ui/RatingStars'

export default function ServiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setSelectedService, checkServiceability, serviceability, pincode, setPincode } = useBooking()

  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingPin, setCheckingPin] = useState(false)
  const [pinInput, setPinInput] = useState(pincode || '560103')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await catalogService.getServiceById(id)
      setService(data)
      setSelectedService(data)

      const revs = await reviewService.getServiceReviews(id)
      setReviews(revs)
      setLoading(false)
    }
    load()
  }, [id, setSelectedService])

  const handleVerifyPincode = async (e) => {
    e.preventDefault()
    if (pinInput.trim().length === 6) {
      setCheckingPin(true)
      await checkServiceability(pinInput, service?.category_id)
      setCheckingPin(false)
    }
  }

  const handleStartBooking = () => {
    setSelectedService(service)
    navigate('/customer/checkout')
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-lg font-bold text-slate-800">Service Not Found</p>
        <Link to="/services" className="text-sm text-indigo-600 underline">
          &larr; Back to all services
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/services" className="hover:text-indigo-600">Services</Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">{service.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              {service.category_name || 'Trade Service'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {service.name}
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              {service.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Estimated Duration: <strong>{service.estimated_duration_minutes} mins</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Coverage: <strong>30-Day Free Rework Warranty</strong></span>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">What's Included in this Service</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Complete on-site diagnosis & inspection</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Professional certified technician labor</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Post-service cleanup & test run</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Digital GST tax invoice with CGST/SGST</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>OTP-protected start & completion verification</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Direct 48-hour customer dispute protection</span>
              </li>
            </ul>
          </div>

          {/* Serviceability Checker Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Check 6-Digit Doorstep Serviceability</span>
            </h3>
            <form onSubmit={handleVerifyPincode} className="flex gap-3 max-w-md">
              <input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={checkingPin || pinInput.length !== 6}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition"
              >
                {checkingPin ? 'Checking...' : 'Verify'}
              </button>
            </form>

            {serviceability && (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${serviceability.is_serviceable ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{serviceability.message || `Pincode ${pinInput} is serviceable by HomeServe verified partners.`}</span>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Verified Customer Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400">No reviews yet for this service.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl p-4 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{r.customer_name}</span>
                      <RatingStars rating={r.rating} size="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Pricing Card */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Fixed Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {formatPaise(service.base_price_paise)}
                </span>
                <span className="text-xs text-slate-500 font-medium">+ GST & Travel</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Base Service Labor</span>
                <span className="font-semibold text-slate-900">{formatPaise(service.base_price_paise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Doorstep Travel & Tech Logistics</span>
                <span className="font-semibold text-slate-900">{formatPaise(5000)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% split 9% CGST + 9% SGST)</span>
                <span className="font-semibold text-slate-900">
                  {formatPaise(Math.round((service.base_price_paise + 5000) * 0.18))}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Estimated</span>
                <span className="text-indigo-600">
                  {formatPaise(
                    service.base_price_paise +
                      5000 +
                      Math.round((service.base_price_paise + 5000) * 0.18)
                  )}
                </span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>15m Local Provider Dispatch SLA</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pay online or cash on completion</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleStartBooking}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition flex items-center justify-center gap-2"
            >
              <span>Continue to Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
