import React, { useState } from 'react'
import { ChevronDown, HelpCircle, Search } from 'lucide-react'

const FAQ_ITEMS = [
  {
    category: 'Customers & Bookings',
    question: 'How does the 15-Minute Dispatch SLA work?',
    answer:
      'When you place a booking on HomeServe, our system selects eligible KYC-verified providers in your 6-digit PIN code zone. The candidate provider has exactly 15 minutes to accept the order. If they do not respond within 15 minutes, the booking automatically auto-reassigns to the next available top-rated provider.',
  },
  {
    category: 'Customers & Bookings',
    question: 'What are the Start OTP and Completion OTP?',
    answer:
      'HomeServe uses tamper-proof HMAC-SHA256 hashed OTPs to safeguard your service. Work only starts after you share your 6-digit Start OTP with the technician at your doorstep. Upon job completion and your inspection, share the Completion OTP to mark the job finished. Never share your Completion OTP if the work is unfinished.',
  },
  {
    category: 'Customers & Bookings',
    question: 'What if extra spare parts are required on site?',
    answer:
      'If the technician diagnoses that new parts are required (e.g. an AC capacitor or new brass valve), they will raise a digital "Change Order" quote through their app. You will instantly see the quote in your customer dashboard with transparent integer paise pricing. The technician cannot proceed or charge you unless you tap "Approve".',
  },
  {
    category: 'Customers & Bookings',
    question: 'What is the cancellation and refund policy?',
    answer:
      'Bookings cancelled before a provider accepts are 100% refunded with zero fees. If cancelled after technician assignment but before arrival, a minor standard logistics fee of ₹50 applies. If you paid online via Razorpay, refunds are processed back to your original source account within 5-7 working days.',
  },
  {
    category: 'Providers & Partners',
    question: 'What are the platform commission fees for providers?',
    answer:
      'HomeServe charges a standard transparent 15% platform commission on completed jobs. The remaining 85% net earnings are immediately credited to your provider wallet balance upon successful completion OTP verification.',
  },
  {
    category: 'Providers & Partners',
    question: 'How and when do providers receive payouts?',
    answer:
      'Providers can request a bank withdrawal anytime their wallet balance exceeds ₹500 (50,000 paise). Super Admins review and disburse requests via direct IMPS/NEFT bank transfer within 24-48 business hours with UTR tracking.',
  },
  {
    category: 'Technicians',
    question: 'How do I toggle my online/offline duty status?',
    answer:
      'Technicians can toggle their availability on the top right of their dashboard with one click. When marked ON DUTY, your employing provider can assign active jobs in your coverage zones. If marked OFF DUTY, you will not receive new assignments.',
  },
]

export default function FaqPage() {
  const [search, setSearch] = useState('')
  const [openIdx, setOpenIdx] = useState(0)

  const filtered = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          Knowledge Base
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-500">
          Everything you need to know about booking, OTP security, warranties, and contractor payouts.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto pt-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-7" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by keyword..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {filtered.map((item, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 block mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {item.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {item.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
