/**
 * HomeServe - Centralized Axios API Client
 * Features:
 * - Credentials included for __Host-refresh_token HttpOnly cookie
 * - Bearer access token injection
 * - Automated 401 token refresh queue with seamless replay
 * - X-Request-ID correlation header
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// In-memory access token storage (Never stored in localStorage to prevent XSS exfiltration)
let currentAccessToken = null

export const setAccessToken = (token) => {
  currentAccessToken = token
}

export const getAccessToken = () => currentAccessToken

export const clearAccessToken = () => {
  currentAccessToken = null
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Required for HttpOnly refresh-token cookie
})

// Request Interceptor: Inject Bearer Token & Request ID
apiClient.interceptors.request.use(
  (config) => {
    if (currentAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`
    }

    // Attach X-Request-ID for distributed tracing
    if (!config.headers['X-Request-ID']) {
      config.headers['X-Request-ID'] = crypto.randomUUID
        ? crypto.randomUUID()
        : 'req_' + Math.random().toString(36).substring(2, 11)
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401 with Token Refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 occurs and not already attempting refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't loop if login/refresh itself returned 401
      if (
        originalRequest.url.includes('/api/v1/auth/login') ||
        originalRequest.url.includes('/api/v1/auth/refresh')
      ) {
        clearAccessToken()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Backend handles refresh using the secure HttpOnly cookie
        const res = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const newToken = res.data?.data?.access_token || res.data?.access_token
        if (newToken) {
          setAccessToken(newToken)
          apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`
          processQueue(null, newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return apiClient(originalRequest)
        } else {
          throw new Error('No token returned in refresh response')
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAccessToken()
        // Window redirect or notification can be triggered by AuthContext
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Generate a unique Idempotency-Key for mutative financial transactions
 */
export const createIdempotencyKey = () => {
  return crypto.randomUUID ? crypto.randomUUID() : 'idemp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
}

export default apiClient
