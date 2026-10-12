export interface Merchant {
  id: string;
  ownerId: string;
  storeName: string;
  whatsappNumber: string; // e.g. "2348012345678"
  slug: string; // unique URL slug
  description?: string;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  price: number; // in NGN
  imageUrl?: string;
  inStock: boolean;
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutCustomerInfo {
  buyerName: string;
  deliveryAddress: string;
  phoneNumber?: string;
  deliveryNotes?: string;
}
