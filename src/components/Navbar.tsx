import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Store, User, LogOut, ExternalLink, Plus } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'dashboard' | 'store';
  onNavigate: (view: 'home' | 'dashboard' | 'store', slug?: string) => void;
  onOpenAuth: () => void;
  onOpenAddProduct?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenAddProduct,
}) => {
  const { user, merchant, signOut } = useAuth();
  const { totalCount, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                QuickStore
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                WhatsApp
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Mobile-First Merchant Store Builder
            </p>
          </div>
        </button>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart button if in Storefront view */}
          {currentView === 'store' && (
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors flex items-center gap-1.5 font-semibold text-sm cursor-pointer"
              title="Open Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
              {totalCount > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>
          )}

          {/* Quick Add Product button if merchant is in dashboard */}
          {user && merchant && currentView === 'dashboard' && onOpenAddProduct && (
            <button
              onClick={onOpenAddProduct}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}

          {/* User Logged In state */}
          {user ? (
            <div className="flex items-center gap-2">
              {merchant ? (
                <>
                  {currentView !== 'dashboard' ? (
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('store', merchant.slug)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Store</span>
                    </button>
                  )}
                </>
              ) : null}

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <button
                onClick={() => signOut()}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Merchant Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
