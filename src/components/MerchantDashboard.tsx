import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types/store';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { formatNGN } from '../lib/validation';
import { SAMPLE_PRODUCTS } from '../lib/mockData';
import { ProductFormModal } from './ProductFormModal';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Plus, 
  Sparkles, 
  Share2, 
  Edit3, 
  Trash2, 
  Package, 
  CheckCircle, 
  XCircle, 
  Search, 
  Settings, 
  QrCode,
  DollarSign,
  TrendingUp,
  Store
} from 'lucide-react';

interface MerchantDashboardProps {
  onNavigateToStore: (slug: string) => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ onNavigateToStore }) => {
  const { user, merchant, updateStoreProfile, isSandbox } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Modals & Forms
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSuccessMessage, setCopiedSuccessMessage] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Store Profile Edit modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newWhatsApp, setNewWhatsApp] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch Merchant Products
  useEffect(() => {
    if (!user || !merchant) return;

    if (isSandbox) {
      const saved = localStorage.getItem('quickstore_sandbox_products');
      if (saved) {
        try {
          setProducts(JSON.parse(saved));
          setLoadingProducts(false);
          return;
        } catch {
          // fallback
        }
      }
      // Populate with default samples in sandbox
      const initialSandboxProducts: Product[] = SAMPLE_PRODUCTS.map((p, idx) => ({
        ...p,
        id: `sandbox_prod_${idx + 1}`,
        merchantId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setProducts(initialSandboxProducts);
      localStorage.setItem('quickstore_sandbox_products', JSON.stringify(initialSandboxProducts));
      setLoadingProducts(false);
      return;
    }

    setLoadingProducts(true);
    const q = query(collection(db, 'products'), where('merchantId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const prods: Product[] = [];
        snapshot.forEach((docSnap) => {
          prods.push({
            ...(docSnap.data() as Product),
            id: docSnap.id,
          });
        });
        setProducts(prods);
        setLoadingProducts(false);
      },
      (error) => {
        setLoadingProducts(false);
        handleFirestoreError(error, OperationType.GET, 'products');
      }
    );

    return () => unsubscribe();
  }, [user, merchant, isSandbox]);

  if (!merchant) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Store Profile Found</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Please finish onboarding to configure your WhatsApp business phone number and store slug.
        </p>
      </div>
    );
  }

  const vercelBase = 'https://whatsapp-zeta-rose.vercel.app';
  const currentBase = typeof window !== 'undefined' ? window.location.origin : vercelBase;
  const storeUrl = `${currentBase}/?store=${merchant.slug}`;
  const vercelStoreUrl = `${vercelBase}/?store=${merchant.slug}`;
  const [copiedVercelLink, setCopiedVercelLink] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopiedLink(true);
      setCopiedSuccessMessage(true);
      setTimeout(() => {
        setCopiedLink(false);
        setCopiedSuccessMessage(false);
      }, 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyVercelLink = async () => {
    try {
      await navigator.clipboard.writeText(vercelStoreUrl);
      setCopiedVercelLink(true);
      setTimeout(() => {
        setCopiedVercelLink(false);
      }, 2500);
    } catch {
      // Fallback
    }
  };

  const handleShareToWhatsApp = () => {
    const text = `Hey there! Check out our official store and shop our products on WhatsApp here: ${storeUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Add or Edit Product Handler
  const handleSaveProduct = async (
    productData: Omit<Product, 'id' | 'merchantId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return;

    if (isSandbox) {
      if (editingProduct) {
        const updated = products.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...productData, updatedAt: new Date().toISOString() }
            : p
        );
        setProducts(updated);
        localStorage.setItem('quickstore_sandbox_products', JSON.stringify(updated));
      } else {
        const newId = `sandbox_prod_${Date.now()}`;
        const newProd: Product = {
          ...productData,
          id: newId,
          merchantId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [newProd, ...products];
        setProducts(updated);
        localStorage.setItem('quickstore_sandbox_products', JSON.stringify(updated));
      }
      return;
    }

    if (editingProduct) {
      // Update existing
      const docRef = doc(db, 'products', editingProduct.id);
      await updateDoc(docRef, {
        ...productData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new
      const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const docRef = doc(db, 'products', newId);
      const newProd: Product = {
        ...productData,
        id: newId,
        merchantId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, newProd);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this product from your store?')) return;
    if (isSandbox) {
      const updated = products.filter((p) => p.id !== productId);
      setProducts(updated);
      localStorage.setItem('quickstore_sandbox_products', JSON.stringify(updated));
      return;
    }
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      console.error('Delete product failed:', err);
    }
  };

  // Toggle inStock
  const handleToggleStock = async (product: Product) => {
    if (isSandbox) {
      const updated = products.map((p) =>
        p.id === product.id ? { ...p, inStock: !p.inStock, updatedAt: new Date().toISOString() } : p
      );
      setProducts(updated);
      localStorage.setItem('quickstore_sandbox_products', JSON.stringify(updated));
      return;
    }
    try {
      const docRef = doc(db, 'products', product.id);
      await updateDoc(docRef, {
        inStock: !product.inStock,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Toggle stock failed:', err);
    }
  };

  // Seed sample products
  const handleSeedDemoProducts = async () => {
    if (!user) return;
    try {
      setSeedingLoading(true);
      if (isSandbox) {
        const seeded: Product[] = SAMPLE_PRODUCTS.map((sample, idx) => ({
          ...sample,
          id: `sandbox_seed_${Date.now()}_${idx}`,
          merchantId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setProducts(seeded);
        localStorage.setItem('quickstore_sandbox_products', JSON.stringify(seeded));
        return;
      }
      for (const sample of SAMPLE_PRODUCTS) {
        const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await setDoc(doc(db, 'products', id), {
          ...sample,
          id,
          merchantId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error seeding products:', err);
    } finally {
      setSeedingLoading(false);
    }
  };

  // Handle open settings
  const handleOpenSettings = () => {
    setNewStoreName(merchant.storeName);
    setNewWhatsApp(merchant.whatsappNumber);
    setNewDescription(merchant.description || '');
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await updateStoreProfile({
        storeName: newStoreName.trim(),
        whatsappNumber: newWhatsApp.trim(),
        description: newDescription.trim(),
      });
      setIsSettingsOpen(false);
    } catch (err) {
      console.error('Error updating settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Stats calculation
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const catalogValue = products.reduce((sum, p) => sum + p.price, 0);

  // Categories list
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Store Banner & Quick Link Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Storefront
              </span>
              <button
                onClick={handleOpenSettings}
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition cursor-pointer"
                title="Edit Store Settings"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {merchant.storeName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {merchant.description || 'Welcome to your WhatsApp merchant hub. Share your storefront link and manage your product catalog.'}
            </p>
            <p className="text-xs text-emerald-400 font-medium pt-1">
              WhatsApp orders will be directed to: <strong className="text-white">+{merchant.whatsappNumber}</strong>
            </p>
          </div>

          {/* Action buttons on Store */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={() => onNavigateToStore(merchant.slug)}
              className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Preview Storefront</span>
            </button>

            <button
              onClick={handleShareToWhatsApp}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/15 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Share to WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Unique Link Bar with Copy Link */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
            <span className="text-slate-400 font-medium shrink-0">Store URL:</span>
            <span className="font-mono bg-white/10 px-2.5 py-1 rounded-lg text-emerald-300 truncate max-w-xs sm:max-w-md">
              {storeUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-400 text-slate-900 shadow-md'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {currentBase !== vercelBase && (
              <button
                onClick={handleCopyVercelLink}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                  copiedVercelLink
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                }`}
                title="Copy production Vercel link for this store"
              >
                {copiedVercelLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <ExternalLink className="w-3.5 h-3.5 text-slate-300" />}
                <span>{copiedVercelLink ? 'Vercel Copied!' : 'Copy Vercel URL'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Products
            </p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{totalProducts}</h3>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              In Stock & Ready
            </p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">
              {inStockCount} <span className="text-xs font-normal text-slate-400">of {totalProducts}</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Catalog Value
            </p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">
              {formatNGN(catalogValue)}
            </h3>
          </div>
        </div>
      </div>

      {/* Product Management Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Products Catalog
            </h2>
            <p className="text-xs text-slate-500">
              Manage items, prices in NGN, stock statuses, and photos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {products.length === 0 && (
              <button
                onClick={handleSeedDemoProducts}
                disabled={seedingLoading}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{seedingLoading ? 'Seeding...' : 'Load Sample Items'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or description..."
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

        {/* Product Cards Grid */}
        {loadingProducts ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-medium">Loading catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No products found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search term or clear the filter.'
                : 'Your catalog is empty. Click "Add Product" or load sample products to get started.'}
            </p>
            {products.length === 0 && (
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={handleSeedDemoProducts}
                  disabled={seedingLoading}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  ✨ Load 6 Sample Nigerian Products
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-md transition flex flex-col group"
              >
                {/* Image */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
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

                  {/* Stock Pill Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                        product.inStock
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {product.category && (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-xs text-white">
                        {product.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-emerald-700 font-extrabold text-base mt-1">
                      {formatNGN(product.price)}
                    </p>
                    {product.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {/* Toggle Stock Switch */}
                    <button
                      onClick={() => handleToggleStock(product)}
                      className={`text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        product.inStock
                          ? 'text-emerald-700 hover:text-emerald-800'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {product.inStock ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>Out of Stock</span>
                        </>
                      )}
                    </button>

                    {/* Action icons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsProductModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Edit product"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />

      {/* Store Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7">
            <h3 className="text-lg font-black text-slate-900">Store Settings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your store name, business WhatsApp number, or bio.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number (e.g. 234...)</label>
                <input
                  type="text"
                  required
                  value={newWhatsApp}
                  onChange={(e) => setNewWhatsApp(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Bio</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm transition cursor-pointer"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
