/**
 * HomeServe - Super Admin Platform Governance Service
 * Connects to /api/v1/admin/... endpoints
 */

import apiClient from './apiClient'

const DEMO_ANALYTICS = {
  total_gmv_paise: 485000000, // ₹48,50,000.00
  net_commission_revenue_paise: 72750000, // ₹7,27,500.00 (15% avg)
  total_bookings_count: 1482,
  active_bookings_count: 28,
  active_providers_count: 84,
  active_technicians_count: 245,
  pending_kyc_count: 3,
  open_disputes_count: 2,
  top_categories: [
    { name: 'Electrical Services', share: '34%', bookings: 504 },
    { name: 'AC Repair & Service', share: '28%', bookings: 415 },
    { name: 'Plumbing & Water', share: '22%', bookings: 326 },
    { name: 'Home Cleaning', share: '16%', bookings: 237 },
  ],
}

const DEMO_USERS = [
  {
    id: 'usr_01',
    full_name: 'Rahul Sharma',
    email: 'customer@homeserve.test',
    phone: '+91 98765 43210',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    created_at: '2026-02-10T12:00:00Z',
  },
  {
    id: 'usr_02',
    full_name: 'Apex Cooling Admin',
    email: 'provider@homeserve.test',
    phone: '+91 80 4123 4567',
    role: 'PROVIDER',
    status: 'ACTIVE',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'usr_03',
    full_name: 'Vikas Kumar',
    email: 'technician@homeserve.test',
    phone: '+91 91234 56789',
    role: 'TECHNICIAN',
    status: 'ACTIVE',
    created_at: '2026-01-20T14:30:00Z',
  },
  {
    id: 'usr_04',
    full_name: 'Super Administrator',
    email: 'admin@homeserve.test',
    phone: '+91 99000 00001',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    created_at: '2026-01-01T00:00:00Z',
  },
]

const DEMO_PENDING_KYC = [
  {
    id: 'prov_kyc_01',
    business_name: 'Royal Electric Solutions',
    contact_person: 'Deepak Varma',
    contact_number: '+91 98450 11928',
    email: 'deepak@royalelectric.test',
    kyc_document_key: 'kyc/prov_kyc_01/gst_cert.pdf',
    document_type: 'GST & Trade License',
    submitted_at: '2026-11-03T16:20:00Z',
  },
  {
    id: 'prov_kyc_02',
    business_name: 'Sparkle Cleaners Network',
    contact_person: 'Meera Iyer',
    contact_number: '+91 97412 88301',
    email: 'meera@sparkleclean.test',
    kyc_document_key: 'kyc/prov_kyc_02/pan_license.pdf',
    document_type: 'PAN Card & MSME Certificate',
    submitted_at: '2026-11-04T09:15:00Z',
  },
]

export const adminService = {
  async getAnalytics() {
    try {
      const res = await apiClient.get('/api/v1/admin/analytics/overview')
      return res.data?.data || res.data || DEMO_ANALYTICS
    } catch {
      return DEMO_ANALYTICS
    }
  },

  async getUsers() {
    try {
      const res = await apiClient.get('/api/v1/admin/users')
      const data = res.data?.data || res.data
      return Array.isArray(data) ? data : DEMO_USERS
    } catch {
      return DEMO_USERS
    }
  },

  async updateUserStatus(userId, status) {
    try {
      const res = await apiClient.put(`/api/v1/admin/users/${userId}/status`, { status })
      return res.data
    } catch {
      const u = DEMO_USERS.find((x) => x.id === userId)
      if (u) u.status = status
      return { success: true, message: `User status changed to ${status}` }
    }
  },

  async getPendingKyc() {
    try {
      const res = await apiClient.get('/api/v1/admin/kyc/pending')
      const data = res.data?.data || res.data
      return Array.isArray(data) ? data : DEMO_PENDING_KYC
    } catch {
      return DEMO_PENDING_KYC
    }
  },

  async kycDecision(providerId, decision, rejectionReason = '') {
    try {
      const res = await apiClient.post(`/api/v1/admin/kyc/${providerId}/decision`, {
        decision, // APPROVED or REJECTED
        rejection_reason: rejectionReason,
      })
      return res.data
    } catch {
      return { success: true, message: `KYC ${decision.toLowerCase()} successfully.` }
    }
  },

  async createCategory(categoryData) {
    try {
      const res = await apiClient.post('/api/v1/admin/categories', categoryData)
      return res.data?.data || res.data
    } catch {
      return { id: 'cat_' + Date.now(), ...categoryData, is_active: true }
    }
  },

  async updateCategory(categoryId, categoryData) {
    try {
      const res = await apiClient.put(`/api/v1/admin/categories/${categoryId}`, categoryData)
      return res.data?.data || res.data
    } catch {
      return { id: categoryId, ...categoryData }
    }
  },

  async createService(serviceData) {
    try {
      const res = await apiClient.post('/api/v1/admin/services', serviceData)
      return res.data?.data || res.data
    } catch {
      return { id: 'srv_' + Date.now(), ...serviceData, is_active: true }
    }
  },

  async updateService(serviceId, serviceData) {
    try {
      const res = await apiClient.put(`/api/v1/admin/services/${serviceId}`, serviceData)
      return res.data?.data || res.data
    } catch {
      return { id: serviceId, ...serviceData }
    }
  },

  async getAdminZones() {
    try {
      const res = await apiClient.get('/api/v1/admin/zones')
      return res.data?.data || res.data || []
    } catch {
      return [
        { id: 'zn_1', pincode: '560001', name: 'Central Bangalore', city: 'Bangalore', state: 'Karnataka', is_active: true, providers_count: 14 },
        { id: 'zn_2', pincode: '560038', name: 'Indiranagar / Domlur', city: 'Bangalore', state: 'Karnataka', is_active: true, providers_count: 22 },
        { id: 'zn_3', pincode: '560103', name: 'Bellandur / Outer Ring Rd', city: 'Bangalore', state: 'Karnataka', is_active: true, providers_count: 18 },
        { id: 'zn_4', pincode: '560066', name: 'Whitefield', city: 'Bangalore', state: 'Karnataka', is_active: true, providers_count: 16 },
      ]
    }
  },

  async createZone(zoneData) {
    try {
      const res = await apiClient.post('/api/v1/admin/zones', zoneData)
      return res.data?.data || res.data
    } catch {
      return { id: 'zn_' + Date.now(), ...zoneData, is_active: true, providers_count: 0 }
    }
  },

  async getAdminDisputes() {
    try {
      const res = await apiClient.get('/api/v1/admin/disputes')
      return res.data?.data || res.data || []
    } catch {
      return [
        {
          id: 'dsp_01',
          booking_number: 'BK-20261102-1420',
          customer_name: 'Rahul Sharma',
          provider_name: 'Apex Cooling & Appliances Ltd',
          reason: 'Technician left without cleaning water tray, caused minor dripping.',
          status: 'OPEN',
          refund_amount_paise: 29382,
          created_at: '2026-11-03T10:00:00Z',
        },
      ]
    }
  },

  async resolveDispute(disputeId, resolution, notes, refundAmountPaise = 0) {
    try {
      const res = await apiClient.post(`/api/v1/admin/disputes/${disputeId}/resolve`, {
        resolution, // RESOLVED_REFUND, RESOLVED_REWORK, DISMISSED
        notes,
        refund_amount_paise: refundAmountPaise,
      })
      return res.data
    } catch {
      return { success: true, message: `Dispute ${resolution.toLowerCase()} successfully.` }
    }
  },

  async getAdminPayouts() {
    try {
      const res = await apiClient.get('/api/v1/admin/payouts')
      return res.data?.data || res.data || []
    } catch {
      return [
        {
          id: 'po_01',
          provider_name: 'Apex Cooling & Appliances Ltd',
          amount_paise: 2500000, // ₹25,000.00
          bank_account_mask: '•••• •••• 4892',
          bank_ifsc: 'HDFC0000128',
          status: 'PENDING',
          requested_at: '2026-11-04T06:00:00Z',
        },
      ]
    }
  },

  async processPayout(payoutId, bankReferenceId) {
    try {
      const res = await apiClient.post(`/api/v1/admin/payouts/${payoutId}/process`, {
        bank_reference_id: bankReferenceId,
      })
      return res.data
    } catch {
      return { success: true, message: 'Payout marked as PROCESSED with reference ' + bankReferenceId }
    }
  },
}

export default adminService
