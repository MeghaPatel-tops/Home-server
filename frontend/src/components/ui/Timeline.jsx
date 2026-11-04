import React from 'react'
import { Check, Clock, AlertCircle } from 'lucide-react'
import { BookingStatus } from '../../utils/constants'
import { getBookingStatusInfo } from '../../utils/formatters'

const STAGES = [
  { key: 'PENDING_ASSIGNMENT', title: 'Order Placed', desc: 'Matching local provider within 15m' },
  { key: 'PROVIDER_ACCEPTED', title: 'Provider Confirmed', desc: 'Contractor accepted dispatch offer' },
  { key: 'ASSIGNED', title: 'Technician Assigned', desc: 'Fleet pro assigned to doorstep' },
  { key: 'EN_ROUTE', title: 'On The Way', desc: 'Technician heading to location' },
  { key: 'ARRIVED', title: 'Arrived at Doorstep', desc: 'Technician reached address' },
  { key: 'IN_PROGRESS', title: 'Job Started', desc: 'Customer Start OTP verified' },
  { key: 'AWAITING_COMPLETION_CONFIRMATION', title: 'Job Finished', desc: 'Proof photos uploaded' },
  { key: 'COMPLETED', title: 'Completed', desc: 'Customer End OTP verified & settled' },
]

export default function Timeline({ currentStatus }) {
  const currentInfo = getBookingStatusInfo(currentStatus)
  const currentStep = currentInfo.step

  if (currentStep === -1) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
        <div>
          <p className="font-semibold text-sm">Booking Cancelled / Terminated</p>
          <p className="text-xs text-rose-700">This service request was cancelled or no provider could be dispatched.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="relative">
        {/* Track */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0 hidden md:block" />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {STAGES.map((stage, idx) => {
            const stepNum = idx + 1
            const isCompleted = stepNum < currentStep
            const isCurrent = stepNum === currentStep
            const isPending = stepNum > currentStep

            return (
              <div key={stage.key} className="flex flex-col items-center text-center relative z-10">
                {/* Node */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>

                {/* Text */}
                <div className="mt-2.5">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {stage.title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden lg:block">
                    {stage.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
