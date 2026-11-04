import React from 'react'

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: November 4, 2026 &bull; Version 1.2.0</p>
      </div>

      <div className="prose prose-slate text-sm leading-relaxed space-y-6 text-slate-700">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            HomeServe SaaS Technologies Pvt Ltd collects information to provide transparent, safe home service fulfillment. This includes your name, verified phone number, email address, physical delivery addresses, and geographic PIN code.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Storage & Cookie Security</h2>
          <p>
            We implement strict security isolation. Sensitive authentication refresh tokens are transmitted via <code>__Host-refresh_token</code> cookies configured with <code>Path=/</code>, <code>HttpOnly</code>, <code>Secure</code>, and <code>SameSite=Lax</code>. Access tokens are held exclusively in volatile browser memory and are never persisted in localStorage or sessionStorage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. OTP & Job Proof Privacy</h2>
          <p>
            Verification OTPs are computed using keyed HMAC-SHA256 digests on our secure servers. Plaintext OTP codes are never logged, stored in databases, or shared with contractors before customer authorization. Before and after photos uploaded by technicians are held in private cloud buckets accessible solely for warranty auditing and dispute arbitration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Payment Gateway Security</h2>
          <p>
            All online monetary settlements are handled via Razorpay in full compliance with PCI-DSS guidelines. HomeServe does not process or retain raw credit/debit card numbers or net banking credentials on our infrastructure.
          </p>
        </section>
      </div>
    </div>
  )
}
