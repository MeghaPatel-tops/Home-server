const { z } = require('zod');

const registerCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const registerProviderSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().min(10),
    password: z.string().min(6),
    businessName: z.string().min(2, 'Business name is required'),
    businessAddress: z.string().optional(),
    gstNumber: z.string().optional(),
    panNumber: z.string().optional(),
    categoryIds: z.array(z.string()).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
  }),
});

const addressSchema = z.object({
  body: z.object({
    label: z.string().default('Home'),
    houseDetails: z.string().min(1, 'House details are required'),
    streetLocality: z.string().min(1, 'Street/Locality is required'),
    landmark: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid 6-digit Indian PIN code'),
    isDefault: z.boolean().optional(),
  }),
});

module.exports = {
  registerCustomerSchema,
  registerProviderSchema,
  loginSchema,
  updateProfileSchema,
  addressSchema,
};
