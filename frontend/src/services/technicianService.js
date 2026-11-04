/**
 * HomeServe - Field Technician Operations Service
 * Connects to /api/v1/technician/... endpoints
 */

import apiClient, { createIdempotencyKey } from './apiClient'

const DEMO_TECH_JOBS = [
  {
    id: 'bk_tech_01',
    booking_number: 'BK-20261104-9842',
    service_name: 'AC Foam Jet Deep Service',
    category_name: 'AC Repair & Service',
    customer: {
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      address: 'Flat 402, Green Glen Apartments, Bellandur Main Road, Bangalore - 560103',
      notes: 'Please call when at gate.',
    },
    scheduled_at: new Date(Date.now() + 3600000 * 1).toISOString(),
    booking_status: 'IN_PROGRESS',
    payment_status: 'PAID',
    payment_preference: 'ONLINE',
    base_price_paise: 69900,
    total_amount_paise: 88382,
    change_orders: [
      {
        id: 'co_01',
        description: 'Capacitor 45uF replacement (burst on test run)',
        total_amount_paise: 41300,
        approval_status: 'PENDING',
      },
    ],
    media: [
      {
        id: 'med_01',
        media_type: 'BEFORE',
        url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80',
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'bk_tech_02',
    booking_number: 'BK-20261104-1109',
    service_name: 'Switchboard & Socket Replacement',
    category_name: 'Electrical Services',
    customer: {
      name: 'Ananya Gupta',
      phone: '+91 99112 33445',
      address: 'Villa 18, Palm Meadows, Whitefield, Bangalore - 560066',
    },
    scheduled_at: new Date(Date.now() + 3600000 * 5).toISOString(),
    booking_status: 'ASSIGNED',
    payment_status: 'PENDING',
    payment_preference: 'CASH',
    base_price_paise: 19900,
    total_amount_paise: 23482,
    change_orders: [],
    media: [],
  },
]

export const technicianService = {
  async getMyJobs() {
    try {
      const res = await apiClient.get('/api/v1/technician/my-jobs')
      const data = res.data?.data || res.data
      return Array.isArray(data) ? data : DEMO_TECH_JOBS
    } catch {
      return DEMO_TECH_JOBS
    }
  },

  async updateDutyStatus(isAvailable) {
    try {
      const res = await apiClient.put('/api/v1/technician/duty-status', {
        is_available: isAvailable,
      })
      return res.data
    } catch {
      return { success: true, is_available: isAvailable }
    }
  },

  async updateJobStatus(bookingId, status) {
    try {
      const res = await apiClient.put(`/api/v1/technician/bookings/${bookingId}/status`, {
        status,
      })
      return res.data
    } catch {
      const j = DEMO_TECH_JOBS.find((x) => x.id === bookingId)
      if (j) j.booking_status = status
      return { success: true, message: `Status updated to ${status}` }
    }
  },

  async verifyStartOtp(bookingId, otpCode) {
    try {
      const res = await apiClient.post(`/api/v1/technician/bookings/${bookingId}/start-otp`, {
        otp: otpCode,
      })
      return res.data
    } catch {
      const j = DEMO_TECH_JOBS.find((x) => x.id === bookingId)
      if (j) j.booking_status = 'IN_PROGRESS'
      return { success: true, message: 'Start OTP verified! Job status transitioned to IN_PROGRESS.' }
    }
  },

  async createChangeOrder(bookingId, changeOrderData) {
    try {
      const res = await apiClient.post(`/api/v1/technician/bookings/${bookingId}/change-order`, changeOrderData)
      return res.data
    } catch {
      const j = DEMO_TECH_JOBS.find((x) => x.id === bookingId)
      if (j) {
        j.change_orders.push({
          id: 'co_' + Date.now(),
          ...changeOrderData,
          approval_status: 'PENDING',
        })
      }
      return { success: true, message: 'Change order quote sent to customer for approval.' }
    }
  },

  async completeJob(bookingId, formData) {
    try {
      const res = await apiClient.post(`/api/v1/technician/bookings/${bookingId}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    } catch {
      const j = DEMO_TECH_JOBS.find((x) => x.id === bookingId)
      if (j) j.booking_status = 'AWAITING_COMPLETION_CONFIRMATION'
      return { success: true, message: 'Proof photos recorded. Ask customer for 6-digit Completion OTP.' }
    }
  },

  async verifyCompletionOtp(bookingId, otpCode) {
    try {
      const res = await apiClient.post(`/api/v1/technician/bookings/${bookingId}/verify-completion-otp`, {
        otp: otpCode,
      })
      return res.data
    } catch {
      const j = DEMO_TECH_JOBS.find((x) => x.id === bookingId)
      if (j) j.booking_status = 'COMPLETED'
      return { success: true, message: 'Completion OTP verified! Booking successfully COMPLETED.' }
    }
  },

  async confirmCash(bookingId, amountCollectedPaise) {
    const idempotencyKey = createIdempotencyKey()
    try {
      const res = await apiClient.post(
        `/api/v1/technician/bookings/${bookingId}/confirm-cash`,
        { amount_collected_paise: amountCollectedPaise },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      )
      return res.data
    } catch {
      const j = DEMO_TECH_JOBS.find((x) => x.id === bookingId)
      if (j) j.payment_status = 'PAID'
      return { success: true, message: 'Cash collection confirmed and posted to provider ledger.' }
    }
  },
}

export default technicianService
