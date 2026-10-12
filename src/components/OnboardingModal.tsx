import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storeProfileSchema, sanitizeWhatsAppNumber } from '../lib/validation';
import { Store, MessageSquare, Link2, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface OnboardingModalProps {
  isOpen: boolean;
  onSuccess: (slug: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onSuccess }) => {
  const { createStoreProfile } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [whatsappRaw, setWhatsappRaw] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-generate slug from storeName unless merchant customized it
  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    if (!slugManuallyEdited) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 45);
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 50)
    );
  };

  const handleWhatsAppChange = (val: string) => {
    setWhatsappRaw(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setErrors({});

    const formattedWhatsApp = sanitizeWhatsAppNumber(whatsappRaw);

    const validationResult = storeProfileSchema.safeParse({
      storeName: storeName.trim(),
      whatsappNumber: formattedWhatsApp,
      slug: slug.trim().toLowerCase(),
      description: description.trim() || undefined,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setSubmitting(true);

      // Verify unique slug in Firestore
      const slugQuery = query(
        collection(db, 'merchants'),
        where('slug', '==', slug.trim().toLowerCase())
      );
      const slugSnap = await getDocs(slugQuery);
      if (!slugSnap.empty) {
        setErrors({
          slug: 'This store slug is already taken. Please choose another one.',
        });
        setSubmitting(false);
        return;
      }

      await createStoreProfile({
        storeName: storeName.trim(),
        whatsappNumber: formattedWhatsApp,
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
      });

      onSuccess(slug.trim().toLowerCase());
    } catch (err) {
      console.error(err);
      setGeneralError(
        err instanceof Error ? err.message : 'Could not create store profile'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/30">
            <Store className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Set Up Your WhatsApp Store
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Create your branded storefront in 30 seconds. Customers will send their cart orders directly to your WhatsApp.
          </p>
        </div>

        {generalError && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Store Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                placeholder="e.g. Lagos Ankara Glamour"
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition ${
                  errors.storeName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.storeName && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.storeName}</p>
            )}
          </div>

          {/* WhatsApp Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              WhatsApp Business Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                value={whatsappRaw}
                onChange={(e) => handleWhatsAppChange(e.target.value)}
                placeholder="2348012345678 or 08012345678"
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition ${
                  errors.whatsappNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>💡 Format as <strong className="text-slate-700">234...</strong> (Nigerian standard). We will auto-format Nigerian 080 numbers.</span>
            </p>
            {errors.whatsappNumber && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.whatsappNumber}</p>
            )}
          </div>

          {/* Store Slug / URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Unique Store Slug <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-cool-store"
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition ${
                  errors.slug ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                }`}
              />
            </div>
            <div className="mt-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center justify-between">
              <span>Your store link: <strong>/store/{slug || 'your-slug'}</strong></span>
              {slug.length >= 2 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
            {errors.slug && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.slug}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Store Tagline / Bio (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specializing in handcrafted fashion, nationwide delivery across Nigeria."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Your Storefront...</span>
              </>
            ) : (
              <span>Launch Store & Go to Dashboard 🚀</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
