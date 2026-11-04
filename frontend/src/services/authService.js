/**
 * HomeServe - Authentication & User Service
 * Connects to /api/v1/auth and /api/v1/users endpoints
 */

import apiClient, { setAccessToken, clearAccessToken } from './apiClient'

export const authService = {
  /**
   * Authenticate user with email and password
   */
  async login(credentials) {
    const response = await apiClient.post('/api/v1/auth/login', credentials)
    const token = response.data?.data?.access_token || response.data?.access_token
    const user = response.data?.data?.user || response.data?.user
    if (token) {
      setAccessToken(token)
    }
    return { token, user }
  },

  /**
   * Register a new Customer account
   */
  async registerCustomer(payload) {
    const response = await apiClient.post('/api/v1/auth/register/customer', payload)
    return response.data
  },

  /**
   * Register a new Service Provider organization
   */
  async registerProvider(payload) {
    const response = await apiClient.post('/api/v1/auth/register/provider', payload)
    return response.data
  },

  /**
   * Retrieve current authenticated user profile
   */
  async getCurrentUser() {
    const response = await apiClient.get('/api/v1/users/me')
    return response.data?.data || response.data
  },

  /**
   * Update current user profile
   */
  async updateProfile(updates) {
    const response = await apiClient.put('/api/v1/users/me', updates)
    return response.data?.data || response.data
  },

  /**
   * Revoke session and clear refresh token cookie
   */
  async logout() {
    try {
      await apiClient.post('/api/v1/auth/logout')
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAccessToken()
    }
  },

  /**
   * Customer Doorstep Addresses
   */
  async getAddresses() {
    const response = await apiClient.get('/api/v1/customer/addresses')
    return response.data?.data || response.data || []
  },

  async createAddress(addressData) {
    const response = await apiClient.post('/api/v1/customer/addresses', addressData)
    return response.data?.data || response.data
  },

  async deleteAddress(addressId) {
    const response = await apiClient.delete(`/api/v1/customer/addresses/${addressId}`)
    return response.data
  },
}

export default authService
