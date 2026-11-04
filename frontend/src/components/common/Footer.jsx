import React from 'react'
import { Link } from 'react-router-dom'
import { Wrench, ShieldCheck, Clock, Headphones, Award } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-slate-800 bg-slate-900/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">KYC Verified Fleet</p>
              <p className="text-xs text-slate-400">Background checked pros</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">15m Dispatch SLA</p>
              <p className="text-xs text-slate-400">Rapid local routing</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Transparent Pricing</p>
              <p className="text-xs text-slate-400">Standardized paise rates</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">48h Dispute Window</p>
              <p className="text-xs text-slate-400">Protected warranty rework</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Home<span className="text-indigo-400">Serve</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
            India's reliable home services marketplace. Connecting verified local trade contractors, electricians, plumbers, and AC specialists with doorstep convenience.
          </p>
          <div className="pt-2 text-xs text-slate-500">
            Certified ISO 9001:2015 Quality & Safety Compliant
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Services</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/services" className="hover:text-white transition">Electrical Repairs</Link></li>
            <li><Link to="/services" className="hover:text-white transition">Plumbing & Motors</Link></li>
            <li><Link to="/services" className="hover:text-white transition">AC Foam Jet Wash</Link></li>
            <li><Link to="/services" className="hover:text-white transition">Deep Home Cleaning</Link></li>
            <li><Link to="/services" className="hover:text-white transition">Carpentry & Locks</Link></li>
            <li><Link to="/services" className="hover:text-white transition">Wall Painting</Link></li>
          </ul>
        </div>

        {/* Company & Partners */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white transition">About HomeServe</Link></li>
            <li><Link to="/register/provider" className="hover:text-white transition text-cyan-400 font-medium">Become a Partner</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
            <li><Link to="/faq" className="hover:text-white transition">Help & FAQs</Link></li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link to="/terms-conditions#cancellation" className="hover:text-white transition">Cancellation Matrix</Link></li>
            <li><Link to="/terms-conditions#disputes" className="hover:text-white transition">Dispute Resolution</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; {new Date().getFullYear()} HomeServe SaaS Technologies Pvt Ltd. All rights reserved.</p>
          <p className="text-slate-500">Secure Payments via Razorpay &bull; HMAC SHA-256 Verified</p>
        </div>
      </div>
    </footer>
  )
}
