import { z } from 'zod';

// Merchant store onboarding/editing schema
export const storeProfileSchema = z.object({
  storeName: z
    .string()
    .min(2, 'Store name must be at least 2 characters')
    .max(100, 'Store name cannot exceed 100 characters'),
  whatsappNumber: z
    .string()
    .min(10, 'WhatsApp number must be at least 10 digits')
    .max(20, 'WhatsApp number cannot exceed 20 digits')
    .regex(/^[0-9]+$/, 'WhatsApp number must only contain digits (e.g., 2348012345678)'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug cannot exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
});

export type StoreProfileFormValues = z.infer<typeof storeProfileSchema>;

// Product creation/editing schema
export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(120, 'Product name cannot exceed 120 characters'),
  price: z
    .number({ message: 'Price must be a valid number' })
    .positive('Price must be greater than 0'),
  imageUrl: z
    .string()
    .max(1000, 'Image URL cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  inStock: z.boolean().default(true),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  category: z
    .string()
    .max(60, 'Category cannot exceed 60 characters')
    .optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// Buyer checkout schema for WhatsApp Order Generator
export const checkoutSchema = z.object({
  buyerName: z
    .string()
    .min(2, 'Please enter your full name (at least 2 characters)')
    .max(80, 'Name is too long'),
  deliveryAddress: z
    .string()
    .min(5, 'Please provide a detailed delivery address (at least 5 characters)')
    .max(300, 'Delivery address is too long'),
  phoneNumber: z
    .string()
    .regex(/^[0-9+\s-]{9,20}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  deliveryNotes: z
    .string()
    .max(300, 'Notes cannot exceed 300 characters')
    .optional()
    .or(z.literal('')),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

/**
 * Format phone numbers into international WhatsApp standard (e.g. 23480...)
 */
export function sanitizeWhatsAppNumber(input: string): string {
  // Strip spaces, dashes, parentheses, and leading '+'
  let cleaned = input.replace(/[\s\-()+]/g, '');
  // If user entered local Nigerian format like '080...', replace leading '0' with '234'
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '234' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Format currency in Nigerian Naira (NGN)
 */
export function formatNGN(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}
