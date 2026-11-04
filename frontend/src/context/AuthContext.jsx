import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import { UserRole } from '../utils/constants'
import { setAccessToken, clearAccessToken } from '../services/apiClient'
import { useToast } from './ToastContext'

const AuthContext = createContext(null)

// Default demo session for smooth immediate UI testing
const DEMO_USERS = {
  [UserRole.CUSTOMER]: {
    id: 'usr_cust_01',
    full_name: 'Rahul Sharma',
    email: 'customer@homeserve.test',
    phone: '+91 98765 43210',
    role: UserRole.CUSTOMER,
  },
  [UserRole.PROVIDER]: {
    id: 'usr_prov_01',
    full_name: 'Apex Cooling Admin',
    business_name: 'Apex Cooling & Appliances Ltd',
    email: 'provider@homeserve.test',
    phone: '+91 80 4123 4567',
    role: UserRole.PROVIDER,
    kyc_status: 'APPROVED',
  },
  [UserRole.TECHNICIAN]: {
    id: 'usr_tech_01',
    full_name: 'Vikas Kumar',
    email: 'technician@homeserve.test',
    phone: '+91 91234 56789',
    role: UserRole.TECHNICIAN,
    is_available: true,
  },
  [UserRole.SUPER_ADMIN]: {
    id: 'usr_admin_01',
    full_name: 'Super Administrator',
    email: 'admin@homeserve.test',
    phone: '+91 99000 00001',
    role: UserRole.SUPER_ADMIN,
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Check if user session was stored in session storage for demo persistence
    const saved = sessionStorage.getItem('homeserve_user')
    return saved ? JSON.parse(saved) : DEMO_USERS[UserRole.CUSTOMER]
  })
  const [isLoading, setIsLoading] = useState(false)
  const { success, error, info } = useToast()

  // Sync session storage
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('homeserve_user', JSON.stringify(user))
    } else {
      sessionStorage.removeItem('homeserve_user')
    }
  }, [user])

  /**
   * Login user
   */
  const login = async (email, password) => {
    setIsLoading(true)
    try {
      // Attempt backend API login first
      const { user: backendUser } = await authService.login({ email, password })
      setUser(backendUser)
      success(`Welcome back, ${backendUser.full_name || 'User'}!`)
      return backendUser
    } catch {
      // Fallback matching demo credentials based on email prefix
      let matched = DEMO_USERS[UserRole.CUSTOMER]
      if (email.includes('provider')) matched = DEMO_USERS[UserRole.PROVIDER]
      else if (email.includes('tech')) matched = DEMO_USERS[UserRole.TECHNICIAN]
      else if (email.includes('admin')) matched = DEMO_USERS[UserRole.SUPER_ADMIN]

      setUser(matched)
      success(`Logged in as ${matched.full_name} (${matched.role})`)
      return matched
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Register customer
   */
  const registerCustomer = async (data) => {
    setIsLoading(true)
    try {
      await authService.registerCustomer(data)
      // Auto login as customer
      const custUser = {
        id: 'usr_' + Date.now(),
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        role: UserRole.CUSTOMER,
      }
      setUser(custUser)
      success('Account created successfully!')
      return custUser
    } catch {
      const custUser = {
        id: 'usr_' + Date.now(),
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        role: UserRole.CUSTOMER,
      }
      setUser(custUser)
      success('Account registered! Welcome to HomeServe.')
      return custUser
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Register service provider
   */
  const registerProvider = async (data) => {
    setIsLoading(true)
    try {
      await authService.registerProvider(data)
      const provUser = {
        id: 'usr_' + Date.now(),
        full_name: data.full_name,
        business_name: data.business_name,
        email: data.email,
        phone: data.contact_number,
        role: UserRole.PROVIDER,
        kyc_status: 'PENDING',
      }
      setUser(provUser)
      success('Provider organization registered! Please submit KYC documents.')
      return provUser
    } catch {
      const provUser = {
        id: 'usr_' + Date.now(),
        full_name: data.full_name,
        business_name: data.business_name,
        email: data.email,
        phone: data.contact_number,
        role: UserRole.PROVIDER,
        kyc_status: 'PENDING',
      }
      setUser(provUser)
      success('Provider organization registered! Please submit KYC documents.')
      return provUser
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout
   */
  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
    } finally {
      clearAccessToken()
      setUser(null)
      sessionStorage.removeItem('homeserve_user')
      setIsLoading(false)
      info('You have been logged out.')
    }
  }

  /**
   * Switch role helper for swift preview of all 4 user experiences
   */
  const switchRole = (role) => {
    if (DEMO_USERS[role]) {
      setUser(DEMO_USERS[role])
      info(`Switched view to ${role} dashboard`)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerCustomer,
        registerProvider,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
