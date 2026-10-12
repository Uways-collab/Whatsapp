import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { Merchant } from '../types/store';
import { checkoutSchema, formatNGN } from '../lib/validation';
import { generateWhatsAppOrderMessage, generateWhatsAppUrl } from '../lib/whatsapp';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Send, 
  ShoppingBag, 
  User, 
  MapPin, 
  Phone, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface CartDrawerProps {
  merchant: Merchant;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ merchant }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    isOpen,
    setIsOpen,
    totalAmount,
    totalCount,
    clearCart,
  } = useCart();

  const [buyerName, setBuyerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSentUrl, setOrderSentUrl] = useState<string | null>(null);
  const [formattedMessagePreview, setFormattedMessagePreview] = useState<string | null>(null);

  // Validate form with Zod
  const validationResult = useMemo(() => {
    return checkoutSchema.safeParse({
      buyerName: buyerName.trim(),
      deliveryAddress: deliveryAddress.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      deliveryNotes: deliveryNotes.trim() || undefined,
    });
  }, [buyerName, deliveryAddress, phoneNumber, deliveryNotes]);

  const isValid = validationResult.success && items.length > 0;

  // Extract errors for touched fields
  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!validationResult.success) {
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errs[issue.path[0].toString()] = issue.message;
        }
      });
    }
    return errs;
  }, [validationResult]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSendOrder = async () => {
    if (!isValid || items.length === 0) return;

    try {
      setIsSubmitting(true);
      const customerInfo = {
        buyerName: buyerName.trim(),
        deliveryAddress: deliveryAddress.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
      };

      const message = generateWhatsAppOrderMessage(
        merchant,
        items,
        customerInfo
      );
      const url = generateWhatsAppUrl(merchant.whatsappNumber, message);

      setFormattedMessagePreview(message);
      setOrderSentUrl(url);

      // Open WhatsApp in new tab / app
      window.open(url, '_blank', 'noopener,noreferrer');

      // Clear cart
      clearCart();
    } catch (err) {
      console.error('Error generating WhatsApp order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  Your Order Cart
                </h2>
                <p className="text-xs text-slate-500">
                  {merchant.storeName} ({totalCount} {totalCount === 1 ? 'item' : 'items'})
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {orderSentUrl ? (
              /* Success / Order dispatched view */
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Order Prepared for WhatsApp!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                    Your cart details and delivery address were compiled. Tap below to chat directly with {merchant.storeName}.
                  </p>
                </div>

                <a
                  href={orderSentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-sm transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Open WhatsApp Chat Now</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                {formattedMessagePreview && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Formatted WhatsApp Text:
                    </span>
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
                      {formattedMessagePreview}
                    </pre>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setOrderSentUrl(null);
                    setIsOpen(false);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer pt-2"
                >
                  Continue Shopping
                </button>
              </div>
            ) : items.length === 0 ? (
              /* Empty Cart */
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Browse products and tap &apos;Add to Cart&apos; to prepare your WhatsApp order.
                </p>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Selected Items
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <div key={item.product.id} className="py-3 flex items-center gap-3">
                        <img
                          src={
                            item.product.imageUrl ||
                            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={item.product.name}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-emerald-700 font-extrabold mt-0.5">
                            {formatNGN(item.product.price)}
                          </p>

                          {/* Quantity selector */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-slate-800 w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Item total and remove */}
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900">
                            {formatNGN(item.product.price * item.quantity)}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id)}
                            className="mt-2 text-slate-400 hover:text-rose-500 transition cursor-pointer p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buyer Details Form */}
                <div className="pt-2 space-y-3.5 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Delivery Details
                    </h3>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      Direct WhatsApp Dispatch
                    </span>
                  </div>

                  {/* Buyer Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        onBlur={() => handleBlur('buyerName')}
                        placeholder="e.g. Chioma Adebayo"
                        className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition ${
                          touched.buyerName && fieldErrors.buyerName
                            ? 'border-rose-400 bg-rose-50/20'
                            : 'border-slate-200 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                    {touched.buyerName && fieldErrors.buyerName && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        <span>{fieldErrors.buyerName}</span>
                      </p>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Delivery Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <textarea
                        rows={2}
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        onBlur={() => handleBlur('deliveryAddress')}
                        placeholder="Street address, Estate, Landmark, City/State"
                        className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition resize-none ${
                          touched.deliveryAddress && fieldErrors.deliveryAddress
                            ? 'border-rose-400 bg-rose-50/20'
                            : 'border-slate-200 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                    {touched.deliveryAddress && fieldErrors.deliveryAddress && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        <span>{fieldErrors.deliveryAddress}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="08012345678"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Order Notes (Optional)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="e.g. Call before dispatch, size M preferred"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer with Totals and Send Order Button */}
          {!orderSentUrl && items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Running Total</span>
                <span className="text-lg font-black text-slate-900 tracking-tight">
                  {formatNGN(totalAmount)}
                </span>
              </div>

              {/* Requirement reminder when invalid */}
              {!isValid && (
                <div className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>Please provide your <strong>Name</strong> and <strong>Delivery Address</strong> to unlock checkout.</span>
                </div>
              )}

              {/* WhatsApp Checkout Button - Disabled until required fields are filled */}
              <button
                type="button"
                onClick={handleSendOrder}
                disabled={!isValid || isSubmitting}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isValid && !isSubmitting
                    ? 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-emerald-600/20 active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing WhatsApp Payload...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Order via WhatsApp ({formatNGN(totalAmount)})</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                🔒 No online payment required upfront. Merchant directly receives your structured order on WhatsApp.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
