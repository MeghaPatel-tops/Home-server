import React from 'react'
import {
  getBookingStatusInfo,
  getPaymentStatusInfo,
  getKycStatusInfo,
  getChangeOrderStatusInfo,
} from '../../utils/formatters'

export default function StatusBadge({ type = 'booking', status }) {
  let info = { label: status || 'Unknown', color: 'bg-slate-100 text-slate-700 border-slate-200' }

  if (type === 'booking') {
    info = getBookingStatusInfo(status)
  } else if (type === 'payment') {
    info = getPaymentStatusInfo(status)
  } else if (type === 'kyc') {
    info = getKycStatusInfo(status)
  } else if (type === 'change_order') {
    info = getChangeOrderStatusInfo(status)
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-2xs ${info.color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {info.label}
    </span>
  )
}
