import React from 'react';
import { 
  Store, 
  MessageSquare, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingHeroProps {
  onOpenAuth: () => void;
  onExploreDemo: () => void;
  onGoToDashboard: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenAuth,
  onExploreDemo,
  onGoToDashboard,
}) => {
  const { user, merchant } = useAuth();

  return (
    <div className="space-y-16 py-8 sm:py-14">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Built for Nigerian & Global WhatsApp Merchants</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Turn Your WhatsApp into a{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
            High-Converting Storefront
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Create a mobile-optimized online store in seconds. Showcase products in Nigerian Naira (₦), let buyers build a cart, and receive pristine, structured order payloads straight on WhatsApp.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {user && merchant ? (
            <button
              onClick={onGoToDashboard}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Go to Your Merchant Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : user && !merchant ? (
            <button
              onClick={onGoToDashboard}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Finish Setting Up Your Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Create Your Store Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Explore Live Demo Store</span>
          </button>
        </div>

        {/* Key bullets */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Zero upfront payment gateway fees
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Instant WhatsApp order redirect
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Nigerian Naira (₦) & Address validation
          </span>
        </div>
      </div>

      {/* Visual Showcase Card */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: How it works */}
            <div className="space-y-5">
              <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">
                The Merchant Advantage
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                Never lose an order in chaotic WhatsApp DM chats again.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Traditional customers ask &quot;How much?&quot; and send messy screenshots. QuickStore gives them an interactive cart, enforces complete delivery details, and automatically formats the order before opening WhatsApp.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Add Products to Your Store</h4>
                    <p className="text-[11px] text-slate-400">Set price in NGN (₦), stock status, and photos.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Share Your Link Everywhere</h4>
                    <p className="text-[11px] text-slate-400">Put your /store/[slug] link in your Instagram bio or WhatsApp Status.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Receive Formatted WhatsApp Orders</h4>
                    <p className="text-[11px] text-slate-400">Customers hit Send Order and you get itemized cart, names, and delivery address.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: WhatsApp Order Preview Mockup */}
            <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-700/60 shadow-xl font-mono text-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[11px] font-sans font-bold text-slate-200">
                    WhatsApp Message Preview
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                  Incoming Order
                </span>
              </div>

              <div className="text-slate-300 space-y-2 text-[11px] font-sans leading-relaxed bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <p className="text-emerald-400 font-bold">🛍️ *NEW ORDER - BELLA ANKARA GLAMOUR*</p>
                <div className="h-px bg-slate-800 my-1"></div>
                <p className="text-slate-400">👤 *Customer Details:*</p>
                <p>• Name: <span className="text-white font-bold">Amina Ibrahim</span></p>
                <p>• Phone: <span className="text-white">08034567890</span></p>
                <p>• Delivery Address: 📍 <span className="text-white">Plot 14 Admiralty Way, Lekki Phase 1, Lagos</span></p>
                <div className="h-px bg-slate-800 my-1"></div>
                <p className="text-slate-400">🛒 *Items Ordered (3 items):*</p>
                <p>1. *Handcrafted Ankara Maxi Dress* (x2) ↳ ₦37,000</p>
                <p>2. *Organic Shea Butter & Glow Oil* (x1) ↳ ₦6,500</p>
                <div className="h-px bg-slate-800 my-1"></div>
                <p className="text-emerald-400 font-extrabold text-xs">
                  💰 *TOTAL AMOUNT: ₦43,500*
                </p>
                <p className="text-[10px] text-slate-400 italic pt-1">
                  Please confirm order availability and send bank transfer account details!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
