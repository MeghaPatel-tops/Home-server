import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  MapPin,
  ShieldCheck,
  Clock,
  Award,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { catalogService } from '../../services/catalogService'
import { reviewService } from '../../services/reviewService'
import { formatPaise } from '../../utils/formatters'
import RatingStars from '../../components/ui/RatingStars'

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [featuredServices, setFeaturedServices] = useState([])
  const [reviews, setReviews] = useState([])
  const [searchPincode, setSearchPincode] = useState('560103')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [serviceabilityResult, setServiceabilityResult] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadData() {
      const cats = await catalogService.getCategories()
      setCategories(cats)

      const srvs = await catalogService.getAllServices()
      setFeaturedServices(srvs.slice(0, 6))

      const revs = await reviewService.getAllFeaturedReviews()
      setReviews(revs)
    }
    loadData()
  }, [])

  const handleHeroSearch = (e) => {
    e.preventDefault()
    navigate(`/services?search=${encodeURIComponent(searchKeyword)}&pincode=${encodeURIComponent(searchPincode)}`)
  }

  const handlePincodeCheck = async (e) => {
    e.preventDefault()
    if (searchPincode.trim().length === 6) {
      const res = await catalogService.checkServiceability(null, searchPincode)
      setServiceabilityResult(res)
    }
  }

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>ISO 9001 Certified &bull; 15-Minute Local Dispatch SLA</span>
          </div>

          {/* Heading */}
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight">
              Verified Home Services, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300">
                Guaranteed Quality.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              Book expert electricians, plumbers, AC technicians, and cleaners. Fixed rates in integer paise, background-verified contractors, and secure OTP handshakes.
            </p>
          </div>

          {/* Search Console Card */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-5 text-slate-900 border border-slate-100">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Pincode Input */}
              <div className="sm:col-span-4 relative">
                <MapPin className="w-4 h-4 text-indigo-600 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={searchPincode}
                  onChange={(e) => setSearchPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit Pincode"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              {/* Service Input */}
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Which service do you need?"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              {/* Search CTA */}
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Live Serviceability check snippet */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Checking coverage for PIN: <strong className="text-slate-800">{searchPincode}</strong></span>
              </div>
              <button
                type="button"
                onClick={handlePincodeCheck}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Verify Pincode Now
              </button>
            </div>

            {serviceabilityResult && (
              <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium ${serviceabilityResult.is_serviceable ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                {serviceabilityResult.message}
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-white/10 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">4.8 / 5</p>
              <p className="text-xs text-slate-400 mt-1">Average Customer Rating</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">15 Min</p>
              <p className="text-xs text-slate-400 mt-1">Dispatch Acceptance SLA</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-slate-400 mt-1">KYC Verified Contractors</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">30 Days</p>
              <p className="text-xs text-slate-400 mt-1">Free Rework Warranty</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Popular Service Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a trade to view transparent base pricing and licensed technicians
            </p>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/services?category=${cat.id}`}
              className="group bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-indigo-500 hover:shadow-xl transition-all flex flex-col items-center text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 group-hover:scale-105 transition-transform shadow-xs">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Services with Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Most Booked Services
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Standardized paise rates. No hidden surcharges, no haggling.
            </p>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {service.category_name || 'Standard Service'}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{service.estimated_duration_minutes} mins</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Base Price</span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {formatPaise(service.base_price_paise)}
                  </span>
                </div>
                <Link
                  to={`/services/${service.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs transition shadow-sm"
                >
                  Book Doorstep &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How It Works (SLA & OTP Workflow) */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Transparent Execution
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              How HomeServe Protects You
            </h2>
            <p className="text-sm text-slate-400">
              From our 15-minute dispatch SLA to tamper-proof HMAC OTP job verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-white">Choose & Schedule</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select your service, choose an address with 6-digit pincode check, and select your preferred slot.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-extrabold flex items-center justify-center text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-white">15m Provider SLA</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Local certified providers in your PIN code zone are dispatched with a strict 15-minute acceptance timer.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-white">Start & End OTPs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Work begins only when you share your secret Start OTP. Finish only after inspecting and giving the End OTP.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-lg">
                4
              </div>
              <h3 className="text-base font-bold text-white">30-Day Warranty</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All services are covered by our 48-hour direct dispute arbitration and 30-day rework warranty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Real Feedback
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Trusted by 50,000+ Homeowners
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <RatingStars rating={rev.rating} />
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{rev.customer_name}</p>
                  <p className="text-[10px] text-slate-400">{rev.service_name}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Job
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Partner With Us CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-navy-950 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              For Contractors & Technicians
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Grow Your Service Business with HomeServe
            </h3>
            <p className="text-sm text-slate-300">
              Receive steady local job dispatches in your PIN code zones, automated commission settlement, weekly bank disbursements, and fleet management tools.
            </p>
          </div>
          <Link
            to="/register/provider"
            className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg hover:shadow-cyan-500/25 transition whitespace-nowrap"
          >
            Register as Service Provider &rarr;
          </Link>
        </div>
      </section>
    </div>
  )
}
