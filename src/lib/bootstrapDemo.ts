import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SAMPLE_PRODUCTS } from './mockData';

export const DEMO_SLUG = 'demo-store';
export const DEMO_MERCHANT_ID = 'demo_merchant_user_1';

export async function ensureDemoStoreExists() {
  try {
    const merchantRef = doc(db, 'merchants', DEMO_MERCHANT_ID);
    const snap = await getDoc(merchantRef);
    if (!snap.exists()) {
      // Create demo merchant
      await setDoc(merchantRef, {
        id: DEMO_MERCHANT_ID,
        ownerId: DEMO_MERCHANT_ID,
        storeName: 'Lagos Glamour & Crafts',
        whatsappNumber: '2348012345678',
        slug: DEMO_SLUG,
        description: 'Authentic Nigerian fashion, tech lifestyle gadgets & gourmet treats delivered across Lagos, Abuja & worldwide.',
        currency: 'NGN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Create demo products
      for (let i = 0; i < SAMPLE_PRODUCTS.length; i++) {
        const prod = SAMPLE_PRODUCTS[i];
        const prodId = `demo_prod_${i + 1}`;
        await setDoc(doc(db, 'products', prodId), {
          ...prod,
          id: prodId,
          merchantId: DEMO_MERCHANT_ID,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    // If permission or offline, silent fallback
    console.warn('Could not auto-seed demo store:', err);
  }
}
