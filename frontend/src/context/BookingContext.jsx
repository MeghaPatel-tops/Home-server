import React, { createContext, useContext, useState, useMemo } from 'react'
import { bookingService } from '../services/bookingService'
import { catalogService } from '../services/catalogService'
import { useToast } from './ToastContext'
import { PaymentPreference } from '../utils/constants'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [selectedService, setSelectedService] = useState(null)
  const [pincode, setPincode] = useState('560103')
  const [serviceability, setServiceability] = useState({ is_serviceable: true, city: 'Bangalore' })
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date(Date.now() + 86400000)
    return d.toISOString().slice(0, 10)
  })
  const [scheduledSlot, setScheduledSlot] = useState('10:00 AM - 12:00 PM')
  const [paymentPreference, setPaymentPreference] = useState(PaymentPreference.ONLINE)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success, error } = useToast()

  // Calculate pricing breakdown in integer paise
  const pricing = useMemo(() => {
    const basePaise = selectedService?.base_price_paise || 29900
    const travelFeePaise = 5000 // ₹50.00 standard doorstep travel fee
    const subtotal = basePaise + travelFeePaise
    const gstPaise = Math.round(subtotal * 0.18) // 18% GST
    const totalPaise = subtotal + gstPaise

    return {
      base_price_paise: basePaise,
      travel_fee_paise: travelFeePaise,
      gst_amount_paise: gstPaise,
      total_amount_paise: totalPaise,
    }
  }, [selectedService])

  /**
   * Verify pincode serviceability
   */
  const checkServiceability = async (code, categoryId) => {
    setPincode(code)
    try {
      const res = await catalogService.checkServiceability(categoryId || selectedService?.category_id, code)
      setServiceability(res)
      return res
    } catch {
      const res = { is_serviceable: true, city: 'Bangalore' }
      setServiceability(res)
      return res
    }
  }

  /**
   * Finalize and submit booking
   */
  const submitBooking = async () => {
    if (!selectedService) {
      error('Please select a service before checking out.')
      return null
    }

    setIsSubmitting(true)
    try {
      const bookingPayload = {
        service_id: selectedService.id,
        service_name: selectedService.name,
        category_name: selectedService.category_name,
        address: selectedAddress || {
          house_details: 'Flat 402, Green Glen Apartments',
          street_locality: 'Bellandur Main Road',
          city: 'Bangalore',
          pincode: pincode,
        },
        scheduled_at: `${scheduledDate}T10:00:00Z`,
        payment_preference: paymentPreference,
        special_instructions: specialInstructions,
        ...pricing,
      }

      const res = await bookingService.createBooking(bookingPayload)
      success(`Booking ${res.booking_number || 'created'}! Finding an available provider.`)
      return res
    } catch (err) {
      error(err.message || 'Failed to place booking. Please try again.')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BookingContext.Provider
      value={{
        selectedService,
        setSelectedService,
        pincode,
        setPincode,
        serviceability,
        checkServiceability,
        selectedAddress,
        setSelectedAddress,
        scheduledDate,
        setScheduledDate,
        scheduledSlot,
        setScheduledSlot,
        paymentPreference,
        setPaymentPreference,
        specialInstructions,
        setSpecialInstructions,
        pricing,
        isSubmitting,
        submitBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}

export default BookingContext
