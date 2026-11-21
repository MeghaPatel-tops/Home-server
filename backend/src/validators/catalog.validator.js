const { z } = require('zod');

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().optional(),
    commissionPercentageOverride: z.number().min(0).max(100).optional(),
  }),
});

const createServiceSchema = z.object({
  body: z.object({
    categoryId: z.string(),
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string().optional(),
    basePricePaise: z.number().int().min(0),
    estimatedDurationMinutes: z.number().int().min(15).optional(),
    isActive: z.boolean().optional(),
  }),
});

const serviceabilityQuerySchema = z.object({
  query: z.object({
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid 6-digit Indian PIN code'),
    category_id: z.string().optional(),
  }),
});

module.exports = {
  createCategorySchema,
  createServiceSchema,
  serviceabilityQuerySchema,
};
