import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserRole } from '../utils/constants'

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's assigned role dashboard
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return <Navigate to="/admin" replace />
      case UserRole.PROVIDER:
        return <Navigate to="/provider" replace />
      case UserRole.TECHNICIAN:
        return <Navigate to="/technician" replace />
      case UserRole.CUSTOMER:
      default:
        return <Navigate to="/customer" replace />
    }
  }

  return children
}
