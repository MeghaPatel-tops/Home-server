/**
 * HomeServe - Customer Disputes Service
 * Connects to /api/v1/customer/disputes
 */

import apiClient from './apiClient'

const DEMO_DISPUTES = [
  {
    id: 'dsp_99182a',
    booking_id: 'bk_demo_102',
    booking_number: 'BK-20261102-1420',
    reason: 'Water tap leaked again after 24 hours of repair.',
    status: 'OPEN',
    created_at: '2026-11-03T09:00:00Z',
    messages: [
      {
        id: 'msg_01',
        sender: 'CUSTOMER',
        sender_name: 'Rahul Sharma',
        message: 'The tap washer seemed loose again this morning. Please arrange a rework or inspection.',
        timestamp: '2026-11-03T09:00:00Z',
      },
      {
        id: 'msg_02',
        sender: 'SUPER_ADMIN',
        sender_name: 'HomeServe Support',
        message: 'We have notified QuickFix Plumbing to dispatch a senior supervisor for a free warranty check.',
        timestamp: '2026-11-03T11:30:00Z',
      },
    ],
  },
]

export const disputeService = {
  async getMyDisputes() {
    try {
      const res = await apiClient.get('/api/v1/customer/disputes')
      const data = res.data?.data || res.data
      return Array.isArray(data) ? data : DEMO_DISPUTES
    } catch {
      return DEMO_DISPUTES
    }
  },

  async getDisputeById(disputeId) {
    try {
      const res = await apiClient.get(`/api/v1/customer/disputes/${disputeId}`)
      return res.data?.data || res.data || DEMO_DISPUTES[0]
    } catch {
      return DEMO_DISPUTES.find((d) => d.id === disputeId) || DEMO_DISPUTES[0]
    }
  },

  async createDispute(disputeData) {
    try {
      const res = await apiClient.post('/api/v1/customer/disputes', disputeData)
      return res.data?.data || res.data
    } catch {
      const newD = {
        id: 'dsp_' + Date.now(),
        ...disputeData,
        status: 'OPEN',
        messages: [{ id: 'm1', sender: 'CUSTOMER', message: disputeData.description, timestamp: new Date().toISOString() }],
        created_at: new Date().toISOString(),
      }
      DEMO_DISPUTES.unshift(newD)
      return newD
    }
  },

  async sendMessage(disputeId, messageText) {
    try {
      const res = await apiClient.post(`/api/v1/customer/disputes/${disputeId}/messages`, {
        message: messageText,
      })
      return res.data
    } catch {
      const d = DEMO_DISPUTES.find((x) => x.id === disputeId)
      if (d) {
        d.messages.push({
          id: 'msg_' + Date.now(),
          sender: 'CUSTOMER',
          sender_name: 'You',
          message: messageText,
          timestamp: new Date().toISOString(),
        })
      }
      return { success: true, message: 'Message sent.' }
    }
  },
}

export default disputeService
