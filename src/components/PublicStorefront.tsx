import React, { useState, useEffect } from 'react';
import { Merchant, Product } from '../types/store';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import { formatNGN } from '../lib/validation';
import { CartDrawer } from './CartDrawer';
import { 
  Store, 
  MessageSquare, 
  ShoppingBag, 
  Check, 
  Search, 
  Share2, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  Sparkles
} from 'lucide-react';

interface PublicStorefrontProps {
  slug: string;
  onNavigateHome: () => void;
}

export const PublicStorefront: React.FC<PublicStorefrontProps> = ({ slug, onNavigateHome }) => {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const { items, addItem, totalCount, totalAmount, setIsOpen } = useCart();

  // Load Merchant by slug
  useEffect(() => {
    let isMounted = true;
    async function fetchStore() {
      try {
        setLoading(true);
        setNotFound(false);

        const merchantsRef = collection(db, 'merchants');
        const q = query(merchantsRef, where('slug', '==', slug.toLowerCase().trim()));
        const snap = await getDocs(q);

        if (snap.empty) {
          // If viewing demo store, provide rich fallback demo store
          if (slug.toLowerCase() === 'demo-store' || slug.toLowerCase() === 'lagos-glamour') {
            const demoMerchantData: Merchant = {
              id: 'demo_merchant_user_1',
              ownerId: 'demo_merchant_user_1',
              storeName: 'Lagos Glamour & Crafts',
              whatsappNumber: '2348012345678',
              slug: slug.toLowerCase(),
              description: 'Authentic Nigerian fashion, tech lifestyle gadgets & gourmet treats delivered across Lagos, Abuja & nationwide.',
              currency: 'NGN',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            const demoProductsList: Product[] = [
              {
                id: 'demo-1',
                merchantId: 'demo_merchant_user_1',
                name: 'Handcrafted Ankara Maxi Dress',
                price: 18500,
                imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80',
                inStock: true,
                category: 'Fashion',
                description: '100% authentic cotton vibrant African wax print tailored for luxury casual outings.',
              },
              {
                id: 'demo-2',
                merchantId: 'demo_merchant_user_1',
                name: 'Wireless ANC Earbuds Pro',
                price: 24000,
                imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
                inStock: true,
                category: 'Electronics',
                description: 'Active Noise Cancellation, 36-hour battery life with charging case, crystal clear mic.',
              },
              {
                id: 'demo-3',
                merchantId: 'demo_merchant_user_1',
                name: 'Organic Shea Butter & Glow Oil (250ml)',
                price: 6500,
                imageUrl: 'https://images.unsplash.com/photo-1608248597359-59754f9a0c77?auto=format&fit=crop&w=600&q=80',
                inStock: true,
                category: 'Beauty',
                description: 'Cold-pressed unrefined raw shea butter infused with vitamin E and sweet almond oil.',
              },
              {
                id: 'demo-4',
                merchantId: 'demo_merchant_user_1',
                name: 'Crispy Gourmet Chin Chin Bucket (1kg)',
                price: 4500,
                imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80',
                inStock: true,
                category: 'Food & Snacks',
                description: 'Golden crunchy, perfectly spiced with nutmeg and condensed milk. Freshly baked.',
              },
              {
                id: 'demo-5',
                merchantId: 'demo_merchant_user_1',
                name: 'Leather Crossbody Messenger Bag',
                price: 16000,
                imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
                inStock: true,
                category: 'Accessories',
                description: 'Genuine vintage brown leather with adjustable strap and multi-pocket laptop divider.',
              },
              {
                id: 'demo-6',
                merchantId: 'demo_merchant_user_1',
                name: 'Smart Fitness Tracker Watch',
                price: 19500,
                imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80',
                inStock: false,
                category: 'Electronics',
                description: 'Heart rate monitor, sleep tracking, WhatsApp message notifications, IP68 water resistant.',
              }
            ];

            if (isMounted) {
              setMerchant(demoMerchantData);
              setProducts(demoProductsList);
              setLoading(false);
            }
            return;
          }

          if (isMounted) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        const merchantDoc = snap.docs[0];
        const merchantData = {
          ...(merchantDoc.data() as Merchant),
          id: merchantDoc.id,
        };

        if (isMounted) {
          setMerchant(merchantData);
        }

        // Fetch products for this merchant
        const prodQuery = query(
          collection(db, 'products'),
          where('merchantId', '==', merchantData.id)
        );

        const unsubscribeProducts = onSnapshot(
          prodQuery,
          (productSnap) => {
            const list: Product[] = [];
            productSnap.forEach((docSnap) => {
              list.push({
                ...(docSnap.data() as Product),
                id: docSnap.id,
              });
            });
            if (isMounted) {
              setProducts(list);
              setLoading(false);
            }
          },
          (err) => {
            console.error('Error fetching storefront products:', err);
            if (isMounted) setLoading(false);
          }
        );

        return () => unsubscribeProducts();
      } catch (err) {
        console.error('Storefront load error:', err);
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    fetchStore();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) return;
    addItem(product, 1);
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId(null);
    }, 1500);
  };

  const handleDirectChat = () => {
    if (!merchant) return;
    const msg = `Hello ${merchant.storeName}! I am browsing your online catalog and would like to ask a question.`;
    window.open(
      `https://wa.me/${merchant.whatsappNumber}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading storefront...</p>
      </div>
    );
  }

  if (notFound || !merchant) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Store Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          The WhatsApp store at <span className="font-mono text-emerald-700 font-bold">/store/{slug}</span> does not exist or may have been updated.
        </p>
        <button
          onClick={onNavigateHome}
          className="mt-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
        >
          Return to QuickStore Home
        </button>
      </div>
    );
  }

  // Categories
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Merchant Header Hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
                {merchant.storeName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {merchant.storeName}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified WhatsApp Store
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg">
                  {merchant.description || 'Welcome to our online store! Browse available items and place your orders directly via WhatsApp.'}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span>📍 Nationwide Delivery (NG)</span>
                  <span>•</span>
                  <span>💳 Currency: ₦ NGN</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDirectChat}
                className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Search & Category Pills */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${merchant.storeName}...`}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat!)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            Available Products ({filteredProducts.length})
          </h2>
          <span className="text-xs text-slate-400">All prices in Nigerian Naira (₦)</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No matching products found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => {
              const inCartCount = items.find((i) => i.product.id === product.id)?.quantity || 0;
              const isJustAdded = justAddedId === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={
                        product.imageUrl ||
                        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80';
                      }}
                    />

                    {/* Stock status badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                          product.inStock
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {product.category && (
                      <div className="absolute top-2 right-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-xs text-white">
                          {product.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-emerald-700 font-extrabold text-sm sm:text-base mt-1">
                        {formatNGN(product.price)}
                      </p>
                      {product.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 hidden sm:block">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Add to Cart button */}
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          !product.inStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : isJustAdded
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/10 active:scale-[0.98]'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : !product.inStock ? (
                          <span>Unavailable</span>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>
                              Add to Cart {inCartCount > 0 ? `(${inCartCount})` : ''}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar (Sticky on mobile & desktop when items > 0) */}
      {items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 p-3 sm:p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                {totalCount}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Cart Total
                </span>
                <span className="text-base font-black text-slate-900">
                  {formatNGN(totalAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="px-5 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>View Cart & Order</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-out Cart Drawer */}
      <CartDrawer merchant={merchant} />
    </div>
  );
};
