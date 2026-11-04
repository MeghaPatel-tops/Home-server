import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <BookingProvider>
            <AppRoutes />
          </BookingProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
