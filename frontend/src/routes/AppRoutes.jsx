import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { UserRole } from '../utils/constants'
import ProtectedRoute from './ProtectedRoute'

// Layouts
import PublicLayout from '../layouts/PublicLayout'
import CustomerLayout from '../layouts/CustomerLayout'
import ProviderLayout from '../layouts/ProviderLayout'
import TechnicianLayout from '../layouts/TechnicianLayout'
import AdminLayout from '../layouts/AdminLayout'

// Public Pages
import HomePage from '../pages/public/HomePage'
import AboutPage from '../pages/public/AboutPage'
import ServicesPage from '../pages/public/ServicesPage'
import ServiceDetailPage from '../pages/public/ServiceDetailPage'
import ContactPage from '../pages/public/ContactPage'
import FaqPage from '../pages/public/FaqPage'
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage'
import TermsConditionsPage from '../pages/public/TermsConditionsPage'

// Auth Pages
import LoginPage from '../pages/auth/LoginPage'
import CustomerRegisterPage from '../pages/auth/CustomerRegisterPage'
import ProviderRegisterPage from '../pages/auth/ProviderRegisterPage'

// Customer Pages
import CustomerOverviewPage from '../pages/customer/CustomerOverviewPage'
import CustomerCheckoutPage from '../pages/customer/CustomerCheckoutPage'
import CustomerBookingsPage from '../pages/customer/CustomerBookingsPage'
import CustomerBookingDetailPage from '../pages/customer/CustomerBookingDetailPage'
import CustomerAddressesPage from '../pages/customer/CustomerAddressesPage'
import CustomerProfilePage from '../pages/customer/CustomerProfilePage'
import CustomerDisputesPage from '../pages/customer/CustomerDisputesPage'

// Provider Pages
import ProviderOverviewPage from '../pages/provider/ProviderOverviewPage'
import ProviderBookingsQueuePage from '../pages/provider/ProviderBookingsQueuePage'
import ProviderBookingsPage from '../pages/provider/ProviderBookingsPage'
import ProviderFleetPage from '../pages/provider/ProviderFleetPage'
import ProviderZonesPage from '../pages/provider/ProviderZonesPage'
import ProviderPayoutsPage from '../pages/provider/ProviderPayoutsPage'
import ProviderProfilePage from '../pages/provider/ProviderProfilePage'

// Technician Pages
import TechnicianOverviewPage from '../pages/technician/TechnicianOverviewPage'
import TechnicianJobsPage from '../pages/technician/TechnicianJobsPage'
import TechnicianJobDetailPage from '../pages/technician/TechnicianJobDetailPage'
import TechnicianProfilePage from '../pages/technician/TechnicianProfilePage'

// Admin Pages
import AdminOverviewPage from '../pages/admin/AdminOverviewPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminKycPage from '../pages/admin/AdminKycPage'
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage'
import AdminServicesPage from '../pages/admin/AdminServicesPage'
import AdminZonesPage from '../pages/admin/AdminZonesPage'
import AdminBookingsPage from '../pages/admin/AdminBookingsPage'
import AdminDisputesPage from '../pages/admin/AdminDisputesPage'
import AdminPayoutsPage from '../pages/admin/AdminPayoutsPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public & Marketing Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-conditions" element={<TermsConditionsPage />} />
      </Route>

      {/* 2. Authentication Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/customer" element={<CustomerRegisterPage />} />
      <Route path="/register/provider" element={<ProviderRegisterPage />} />

      {/* 3. Customer Portal (Role Protected) */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={[UserRole.CUSTOMER, UserRole.SUPER_ADMIN]}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerOverviewPage />} />
        <Route path="checkout" element={<CustomerCheckoutPage />} />
        <Route path="bookings" element={<CustomerBookingsPage />} />
        <Route path="bookings/:id" element={<CustomerBookingDetailPage />} />
        <Route path="addresses" element={<CustomerAddressesPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="disputes" element={<CustomerDisputesPage />} />
      </Route>

      {/* 4. Provider Operations Console (Role Protected) */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PROVIDER, UserRole.SUPER_ADMIN]}>
            <ProviderLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProviderOverviewPage />} />
        <Route path="queue" element={<ProviderBookingsQueuePage />} />
        <Route path="bookings" element={<ProviderBookingsPage />} />
        <Route path="fleet" element={<ProviderFleetPage />} />
        <Route path="zones" element={<ProviderZonesPage />} />
        <Route path="payouts" element={<ProviderPayoutsPage />} />
        <Route path="profile" element={<ProviderProfilePage />} />
      </Route>

      {/* 5. Field Technician Portal (Role Protected) */}
      <Route
        path="/technician"
        element={
          <ProtectedRoute allowedRoles={[UserRole.TECHNICIAN, UserRole.SUPER_ADMIN]}>
            <TechnicianLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TechnicianOverviewPage />} />
        <Route path="jobs" element={<TechnicianJobsPage />} />
        <Route path="jobs/:id" element={<TechnicianJobDetailPage />} />
        <Route path="profile" element={<TechnicianProfilePage />} />
      </Route>

      {/* 6. Super Admin Governance Console (Role Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="kyc" element={<AdminKycPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="zones" element={<AdminZonesPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="disputes" element={<AdminDisputesPage />} />
        <Route path="payouts" element={<AdminPayoutsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
