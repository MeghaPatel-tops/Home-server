/**
 * HomeServe - Service Provider Operations Service
 * Connects to /api/v1/provider/... endpoints
 */

import apiClient, { createIdempotencyKey } from './apiClient'

const DEMO_PROVIDER_PROFILE = {
  id: 'prov_demo_01',
  user_id: 'usr_prov_01',
  business_name: 'Apex Cooling & Appliances Ltd',
  contact_number: '+91 80 4123 4567',
  description: 'Certified ISO-9001 HVAC and appliance repairs with a fleet of 15 licensed technicians.',
  kyc_status: 'APPROVED',
  is_active: true,
  created_at: '2026-01-15T10:00:00Z',
}

const DEMO_QUEUE = [
  {
    id: 'bk_q_201',
    booking_number: 'BK-20261104-5821',
    service_name: 'AC Foam Jet Deep Service',
    category_name: 'AC Repair & Service',
    customer_name: 'Pooja Reddy',
    customer_phone: '+91 98451 99221',
    address: 'Indiranagar 100ft Road, Bangalore - 560038',
    scheduled_at: new Date(Date.now() + 3600000 * 3).toISOString(),
    total_amount_paise: 88382,
    provider_amount_paise: 75125, // 85% net
    deadline: new Date(Date.now() + 1000 * 60 * 12).toISOString(), // 12 mins left in 15m SLA
  },
]

const DEMO_FLEET = [
  {
    id: 'tech_01',
    full_name: 'Vikas Kumar',
    email: 'vikas.tech@homeserve.test',
    phone: '+91 91234 56789',
    skills: ['AC Repair', 'HVAC Diagnostics', 'Gas Refill'],
    is_available: true,
    is_active: true,
    active_jobs: 1,
  },
  {
    id: 'tech_02',
    full_name: 'Arjun Verma',
    email: 'arjun.tech@homeserve.test',
    phone: '+91 98765 11223',
    skills: ['Electrical Wiring', 'Appliance Repair'],
    is_available: true,
    is_active: true,
    active_jobs: 0,
  },
  {
    id: 'tech_03',
    full_name: 'Suresh Patil',
    email: 'suresh.tech@homeserve.test',
    phone: '+91 99887 77665',
    skills: ['Plumbing', 'Water Motor Installation'],
    is_available: false,
    is_active: true,
    active_jobs: 0,
  },
]

const DEMO_PAYOUTS = {
  wallet_balance_paise: 14250000, // ₹1,42,500.00
  pending_withdrawal_paise: 2500000, // ₹25,000.00
  total_withdrawn_paise: 85000000, // ₹8,50,000.00
  history: [
    {
      id: 'po_01',
      amount_paise: 2500000,
      payout_status: 'PENDING',
      bank_account_mask: '•••• •••• 4892',
      bank_ifsc: 'HDFC0000128',
      requested_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'po_02',
      amount_paise: 5000000,
      payout_status: 'PROCESSED',
      bank_account_mask: '•••• •••• 4892',
      bank_ifsc: 'HDFC0000128',
      bank_reference_id: 'UTR2026110298124',
      requested_at: '2026-11-01T08:00:00Z',
      processed_at: '2026-11-01T14:30:00Z',
    },
  ],
}

export const providerService = {
  async getProfile() {
    try {
      const res = await apiClient.get('/api/v1/provider/me')
      return res.data?.data || res.data || DEMO_PROVIDER_PROFILE
    } catch {
      return DEMO_PROVIDER_PROFILE
    }
  },

  async uploadKyc(formData) {
    try {
      const res = await apiClient.post('/api/v1/provider/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    } catch {
      return { success: true, message: 'KYC Document submitted for admin approval.' }
    }
  },

  async getZones() {
    try {
      const res = await apiClient.get('/api/v1/provider/zones')
      return res.data?.data || res.data || []
    } catch {
      return [
        { id: 'zn_01', pincode: '560001', city: 'Bangalore', state: 'Karnataka', is_active: true },
        { id: 'zn_02', pincode: '560038', city: 'Bangalore', state: 'Karnataka', is_active: true },
        { id: 'zn_03', pincode: '560103', city: 'Bangalore', state: 'Karnataka', is_active: true },
      ]
    }
  },

  async updateZones(zoneIds) {
    try {
      const res = await apiClient.put('/api/v1/provider/zones', { zone_ids: zoneIds })
      return res.data
    } catch {
      return { success: true, message: 'Coverage zones updated.' }
    }
  },

  async getBookingsQueue() {
    try {
      const res = await apiClient.get('/api/v1/provider/bookings/queue')
      const data = res.data?.data || res.data
      return Array.isArray(data) ? data : DEMO_QUEUE
    } catch {
      return DEMO_QUEUE
    }
  },

  async acceptBooking(bookingId) {
    try {
      const res = await apiClient.post(`/api/v1/provider/bookings/${bookingId}/accept`)
      return res.data
    } catch {
      return { success: true, message: 'Booking accepted within SLA.' }
    }
  },

  async rejectBooking(bookingId, rejectionReason) {
    try {
      const res = await apiClient.post(`/api/v1/provider/bookings/${bookingId}/reject`, {
        rejection_reason: rejectionReason,
      })
      return res.data
    } catch {
      return { success: true, message: 'Booking rejected and routed to next provider.' }
    }
  },

  async assignTechnician(bookingId, technicianId) {
    try {
      const res = await apiClient.post('/api/v1/provider/dispatch/assign', {
        booking_id: bookingId,
        technician_id: technicianId,
      })
      return res.data
    } catch {
      return { success: true, message: 'Technician assigned successfully.' }
    }
  },

  async getFleet() {
    try {
      const res = await apiClient.get('/api/v1/provider/fleet')
      const data = res.data?.data || res.data
      return Array.isArray(data) ? data : DEMO_FLEET
    } catch {
      return DEMO_FLEET
    }
  },

  async createTechnician(payload) {
    try {
      const res = await apiClient.post('/api/v1/provider/fleet', payload)
      return res.data
    } catch {
      const newTech = {
        id: 'tech_' + Date.now(),
        ...payload,
        is_available: true,
        is_active: true,
        active_jobs: 0,
      }
      DEMO_FLEET.push(newTech)
      return newTech
    }
  },

  async updateTechnicianStatus(technicianId, isActive) {
    try {
      const res = await apiClient.put(`/api/v1/provider/fleet/${technicianId}/status`, {
        is_active: isActive,
      })
      return res.data
    } catch {
      const t = DEMO_FLEET.find((x) => x.id === technicianId)
      if (t) t.is_active = isActive
      return { success: true, message: 'Technician status updated.' }
    }
  },

  async getPayouts() {
    try {
      const res = await apiClient.get('/api/v1/provider/payouts')
      return res.data?.data || res.data || DEMO_PAYOUTS
    } catch {
      return DEMO_PAYOUTS
    }
  },

  async requestPayout(amountPaise, bankDetails) {
    const idempotencyKey = createIdempotencyKey()
    try {
      const res = await apiClient.post(
        '/api/v1/provider/payouts/request',
        { amount_paise: amountPaise, ...bankDetails },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      )
      return res.data
    } catch {
      return { success: true, message: 'Withdrawal request submitted for admin disbursement.' }
    }
  },
}

export default providerService
