import { Product } from '../types/store';

export const SAMPLE_PRODUCTS: Omit<Product, 'id' | 'merchantId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Handcrafted Ankara Maxi Dress',
    price: 18500,
    imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    category: 'Fashion',
    description: '100% authentic cotton vibrant African wax print tailored for luxury casual outings.',
  },
  {
    name: 'Wireless ANC Earbuds Pro',
    price: 24000,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    category: 'Electronics',
    description: 'Active Noise Cancellation, 36-hour battery life with charging case, crystal clear mic.',
  },
  {
    name: 'Organic Shea Butter & Glow Oil (250ml)',
    price: 6500,
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-59754f9a0c77?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    category: 'Beauty',
    description: 'Cold-pressed unrefined raw shea butter infused with vitamin E and sweet almond oil.',
  },
  {
    name: 'Crispy Gourmet Chin Chin Bucket (1kg)',
    price: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    category: 'Food & Snacks',
    description: 'Golden crunchy, perfectly spiced with nutmeg and condensed milk. Freshly baked.',
  },
  {
    name: 'Leather Crossbody Messenger Bag',
    price: 16000,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    category: 'Accessories',
    description: 'Genuine vintage brown leather with adjustable strap and multi-pocket laptop divider.',
  },
  {
    name: 'Smart Fitness Tracker Watch',
    price: 19500,
    imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80',
    inStock: false,
    category: 'Electronics',
    description: 'Heart rate monitor, sleep tracking, WhatsApp message notifications, IP68 water resistant.',
  }
];

export const PRESET_IMAGE_SUGGESTIONS = [
  { label: 'Ankara Dress', url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80' },
  { label: 'Earbuds', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80' },
  { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80' },
  { label: 'Skincare', url: 'https://images.unsplash.com/photo-1608248597359-59754f9a0c77?auto=format&fit=crop&w=600&q=80' },
  { label: 'Snacks / Food', url: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80' },
  { label: 'Leather Bag', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80' },
  { label: 'Sneakers', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80' },
  { label: 'Perfume / Scent', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80' }
];
