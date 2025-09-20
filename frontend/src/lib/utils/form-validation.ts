import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Invalid email address' });

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' });

export const nameSchema = z
  .string()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(50, { message: 'Name must be less than 50 characters' });

export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9\s\-()]{7,20}$/, { 
    message: 'Please enter a valid phone number' 
  })
  .optional()
  .or(z.literal(''));

// Rating schema (1-5)
export const ratingSchema = z
  .number()
  .min(1, { message: 'Rating must be at least 1' })
  .max(5, { message: 'Rating must be at most 5' });

// Review schema
export const reviewSchema = z.object({
  rating: ratingSchema,
  content: z.string().min(10, { message: 'Review must be at least 10 characters' }),
  author_name: nameSchema,
  author_email: emailSchema,
  entity_type: z.enum(['package', 'group_trip', 'accommodation']),
  entity_id: z.number(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// Contact form schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Booking inquiry schema
export const bookingInquirySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  travel_date: z.string().min(1, { message: 'Please select a travel date' }),
  num_travelers: z.number().min(1, { message: 'Number of travelers must be at least 1' }),
  special_requests: z.string().optional(),
});

export type BookingInquiryData = z.infer<typeof bookingInquirySchema>;

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: emailSchema,
  name: nameSchema.optional(),
  interests: z.array(z.string()).optional(),
});

export type NewsletterData = z.infer<typeof newsletterSchema>;
