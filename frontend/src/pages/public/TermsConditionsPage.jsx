import React from 'react'

export default function TermsConditionsPage() {
  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms and Conditions</h1>
        <p className="text-xs text-slate-500">Effective Date: November 4, 2026 &bull; Version 1.2.0</p>
      </div>

      <div className="prose prose-slate text-sm leading-relaxed space-y-6 text-slate-700">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or creating an account on the HomeServe platform (as a Customer, Service Provider, or Field Technician), you agree to comply with these terms of service, SLA guidelines, and dispute resolutions.
          </p>
        </section>

        <section id="cancellation" className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Cancellation & Refund Penalty Matrix</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Before Provider Acceptance:</strong> 100% full refund with zero cancellation fees.</li>
            <li><strong>After Acceptance but Before Technician Dispatched:</strong> 100% full refund.</li>
            <li><strong>While Technician is EN_ROUTE:</strong> Standard travel & logistics deduction of ₹50.00 (5,000 paise).</li>
            <li><strong>After Technician ARRIVED at doorstep:</strong> Flat cancellation charge of ₹100.00 (10,000 paise).</li>
          </ul>
        </section>

        <section id="disputes" className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. 48-Hour Dispute Window & 30-Day Rework Warranty</h2>
          <p>
            Customers may raise a formal dispute ticket within 48 hours of job completion via the customer dashboard. Super Admins will arbitrate the ticket within 24 hours, with authority to order a free senior technician rework, issue a full/partial refund, or dismiss unsupported claims.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Provider & Commission Settlements</h2>
          <p>
            Service Providers acknowledge a standard 15% platform commission cut on gross job values. Providers agree to maintain current KYC documentation and dispatch only background-verified technicians.
          </p>
        </section>
      </div>
    </div>
  )
}
