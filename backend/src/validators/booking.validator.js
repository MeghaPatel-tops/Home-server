const { z } = require('zod');

const createBookingSchema = z.object({
  body: z.object({
    service_id: z.string().min(1, 'Service ID is required'),
    category_id: z.string().optional(),
    address: z.object({
      house_details: z.string().min(1),
      street_locality: z.string().min(1),
      landmark: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid 6-digit Indian PIN code'),
    }),
    scheduled_at: z.string().datetime().or(z.string().min(1)),
    payment_preference: z.enum(['ONLINE', 'CASH']).default('ONLINE'),
    special_instructions: z.string().optional(),
  }),
});

const cancelBookingSchema = z.object({
  body: z.object({
    cancellation_reason: z.string().min(3, 'Cancellation reason required'),
  }),
});

const assignTechnicianSchema = z.object({
  body: z.object({
    booking_id: z.string().min(1),
    technician_id: z.string().min(1),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

const changeOrderSchema = z.object({
  body: z.object({
    description: z.string().min(3),
    additional_amount_paise: z.number().int().min(100),
  }),
});

module.exports = {
  createBookingSchema,
  cancelBookingSchema,
  assignTechnicianSchema,
  verifyOtpSchema,
  changeOrderSchema,
};
