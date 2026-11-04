/**
 * HomeServe - Formatting & Localization Utilities
 * Standards:
 * - Currency stored in integer paise: ₹1 = 100 paise
 * - Timestamps stored in UTC, formatted to Indian Standard Time (Asia/Kolkata)
 */

import { BookingStatus, PaymentStatus, KycStatus, ChangeOrderStatus } from './constants'

/**
 * Format integer paise into Indian Rupee (INR) representation
 * Example: 49900 -> ₹499.00 or ₹499
 */
export function formatPaise(paise, includeDecimals = true) {
  if (paise === null || paise === undefined || isNaN(paise)) return '₹0'
  const rupees = Number(paise) / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(rupees)
}

/**
 * Convert Rupees to integer paise for API payloads
 */
export function rupeesToPaise(rupees) {
  if (!rupees || isNaN(rupees)) return 0
  return Math.round(Number(rupees) * 100)
}

/**
 * Format UTC ISO string to readable IST date & time
 */
export function formatDateTime(isoString) {
  if (!isoString) return '-'
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  } catch {
    return isoString
  }
}

/**
 * Format UTC ISO string to readable IST date only
 */
export function formatDate(isoString) {
  if (!isoString) return '-'
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch {
    return isoString
  }
}

/**
 * Format UTC ISO string to readable IST time only
 */
export function formatTime(isoString) {
  if (!isoString) return '-'
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  } catch {
    return isoString
  }
}

/**
 * Format seconds countdown into MM:SS format
 */
export function formatCountdown(totalSeconds) {
  if (totalSeconds <= 0) return '00:00'
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Returns human-readable label and styling classes for any BookingStatus
 */
export function getBookingStatusInfo(status) {
  switch (status) {
    case BookingStatus.PENDING_ASSIGNMENT:
      return { label: 'Finding Provider', color: 'bg-amber-100 text-amber-800 border-amber-200', step: 1 }
    case BookingStatus.PROVIDER_ACCEPTED:
      return { label: 'Provider Accepted', color: 'bg-blue-100 text-blue-800 border-blue-200', step: 2 }
    case BookingStatus.ASSIGNED:
      return { label: 'Technician Assigned', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', step: 3 }
    case BookingStatus.EN_ROUTE:
      return { label: 'Technician En Route', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', step: 4 }
    case BookingStatus.ARRIVED:
      return { label: 'Technician Arrived', color: 'bg-teal-100 text-teal-800 border-teal-200', step: 5 }
    case BookingStatus.IN_PROGRESS:
      return { label: 'Service In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200', step: 6 }
    case BookingStatus.AWAITING_COMPLETION_CONFIRMATION:
      return { label: 'Awaiting OTP Confirmation', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', step: 7 }
    case BookingStatus.COMPLETED:
      return { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', step: 8 }
    case BookingStatus.CANCELLED_BY_CUSTOMER:
      return { label: 'Cancelled by Customer', color: 'bg-rose-100 text-rose-800 border-rose-200', step: -1 }
    case BookingStatus.CANCELLED_BY_PROVIDER:
      return { label: 'Cancelled by Provider', color: 'bg-rose-100 text-rose-800 border-rose-200', step: -1 }
    case BookingStatus.TIMEOUT_AUTO_REASSIGNED:
      return { label: 'Re-routing Provider', color: 'bg-orange-100 text-orange-800 border-orange-200', step: 1 }
    case BookingStatus.NO_PROVIDER_AVAILABLE:
      return { label: 'No Provider Available', color: 'bg-slate-200 text-slate-800 border-slate-300', step: -1 }
    case BookingStatus.DISPUTED:
      return { label: 'Disputed', color: 'bg-red-100 text-red-800 border-red-200', step: 9 }
    default:
      return { label: status || 'Unknown', color: 'bg-slate-100 text-slate-700 border-slate-200', step: 0 }
  }
}

/**
 * Returns human-readable label and styling classes for PaymentStatus
 */
export function getPaymentStatusInfo(status) {
  switch (status) {
    case PaymentStatus.PAID:
      return { label: 'Paid', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    case PaymentStatus.PENDING:
      return { label: 'Payment Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' }
    case PaymentStatus.FAILED:
      return { label: 'Payment Failed', color: 'bg-rose-100 text-rose-800 border-rose-200' }
    case PaymentStatus.REFUNDED:
      return { label: 'Refunded', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
    case PaymentStatus.PARTIALLY_REFUNDED:
      return { label: 'Partially Refunded', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    default:
      return { label: status || 'Unknown', color: 'bg-slate-100 text-slate-700 border-slate-200' }
  }
}

/**
 * Returns label and color for KYC verification status
 */
export function getKycStatusInfo(status) {
  switch (status) {
    case KycStatus.APPROVED:
      return { label: 'Verified & Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    case KycStatus.IN_REVIEW:
      return { label: 'Under Review', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    case KycStatus.PENDING:
      return { label: 'Pending Submission', color: 'bg-amber-100 text-amber-800 border-amber-200' }
    case KycStatus.REJECTED:
      return { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-200' }
    default:
      return { label: status || 'Pending', color: 'bg-slate-100 text-slate-700 border-slate-200' }
  }
}

/**
 * Returns label and color for ChangeOrderStatus
 */
export function getChangeOrderStatusInfo(status) {
  switch (status) {
    case ChangeOrderStatus.APPROVED:
      return { label: 'Approved by Customer', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    case ChangeOrderStatus.PENDING:
      return { label: 'Pending Customer Approval', color: 'bg-amber-100 text-amber-800 border-amber-200' }
    case ChangeOrderStatus.REJECTED:
      return { label: 'Rejected by Customer', color: 'bg-rose-100 text-rose-800 border-rose-200' }
    default:
      return { label: status || 'Unknown', color: 'bg-slate-100 text-slate-700 border-slate-200' }
  }
}
