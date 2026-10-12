import React, { useState, useEffect } from 'react';
import { Product } from '../types/store';
import { productSchema } from '../lib/validation';
import { PRESET_IMAGE_SUGGESTIONS } from '../lib/mockData';
import { X, Tag, Image, Check, Loader2, DollarSign, Layers } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'merchantId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialProduct?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const [name, setName] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [inStock, setInStock] = useState(true);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setPriceStr(initialProduct.price.toString());
      setImageUrl(initialProduct.imageUrl || '');
      setInStock(initialProduct.inStock);
      setCategory(initialProduct.category || '');
      setDescription(initialProduct.description || '');
    } else {
      setName('');
      setPriceStr('');
      setImageUrl('');
      setInStock(true);
      setCategory('');
      setDescription('');
    }
    setErrors({});
    setGeneralError(null);
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const parsedPrice = parseFloat(priceStr);

    const validation = productSchema.safeParse({
      name: name.trim(),
      price: isNaN(parsedPrice) ? -1 : parsedPrice,
      imageUrl: imageUrl.trim() || undefined,
      inStock,
      category: category.trim() || undefined,
      description: description.trim() || undefined,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      await onSave({
        name: name.trim(),
        price: parsedPrice,
        imageUrl: imageUrl.trim() || undefined,
        inStock,
        category: category.trim() || undefined,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setGeneralError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {initialProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Products are instantly visible on your WhatsApp storefront in NGN (₦).
          </p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ankara Infinity Wrap Dress"
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition ${
                  errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
          </div>

          {/* Price in NGN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Price in NGN (₦) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="font-bold text-slate-500 text-base absolute left-3.5 top-2.5 select-none">
                ₦
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                placeholder="e.g. 15000"
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition ${
                  errors.price ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.price && <p className="text-xs text-rose-600 mt-1">{errors.price}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Fashion, Electronics, Beauty, Food"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Image URL & Preset Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Product Image URL
              </label>
              <span className="text-[11px] text-slate-400">Optional</span>
            </div>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/item.jpg"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
            
            {/* Quick Presets */}
            <div className="mt-2">
              <p className="text-[11px] text-slate-500 mb-1.5 font-medium">Or pick a sample photo:</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGE_SUGGESTIONS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                      imageUrl === preset.url
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                    {imageUrl === preset.url && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            {imageUrl && (
              <div className="mt-3 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={imageUrl}
                  alt="Preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=150&q=80';
                  }}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                />
                <span className="text-xs text-slate-600 font-medium truncate flex-1">
                  Preview loaded successfully
                </span>
              </div>
            )}
          </div>

          {/* In Stock Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Availability Status
              </span>
              <span className="text-[11px] text-slate-500">
                {inStock ? 'Available for buyers to add to cart' : 'Marked as Out of Stock'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Specs
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sizes available, material details, delivery info..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialProduct ? 'Update Product' : 'Add to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
