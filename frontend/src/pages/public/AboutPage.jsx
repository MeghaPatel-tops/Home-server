import React from 'react'
import { ShieldCheck, Award, Users, HeartHandshake, CheckCircle2 } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          About HomeServe
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Reinventing Home Services Across India
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          HomeServe was founded with a straightforward mission: eliminate unverified technicians, arbitrary pricing, and unreliable workmanship from the home repair industry.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Safety & KYC First</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every contractor organization and fleet technician undergoes strict police background checks and identity verification before accepting jobs.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Price Certainty</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            All prices are cataloged in integer paise. What you see is what you pay. Any on-site extra parts require explicit customer digital approval.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">30-Day Protection</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            If an issue recurs within 30 days of completion, our warranty team schedules a senior technician for a complimentary rework or arbitrates a refund.
          </p>
        </div>
      </div>

      {/* SLA & Technology Breakdown */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Our Technology</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">The Anti-Gravity Dispatch Engine</h2>
          <p className="text-sm text-slate-400">
            Our backend dispatch engine evaluates local 6-digit PIN code service zones, technician trade badges, and live GPS proximity to match orders within seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-800">
          <div>
            <p className="text-3xl font-extrabold text-cyan-400">15 min</p>
            <p className="text-xs text-slate-400 mt-1">Provider SLA Acceptance</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-cyan-400">6 Digits</p>
            <p className="text-xs text-slate-400 mt-1">HMAC-SHA256 Start/End OTP</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-cyan-400">100%</p>
            <p className="text-xs text-slate-400 mt-1">Digital Tax Invoicing</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-cyan-400">48 Hours</p>
            <p className="text-xs text-slate-400 mt-1">Dispute Arbitration Window</p>
          </div>
        </div>
      </div>
    </div>
  )
}
