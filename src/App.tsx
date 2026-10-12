'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { MerchantDashboard } from './components/MerchantDashboard';
import { PublicStorefront } from './components/PublicStorefront';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { Store, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

function AppContent() {
  const { user, merchant, loading, merchantLoading } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'store'>('home');
  const [activeSlug, setActiveSlug] = useState<string>('demo-store');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize view from URL if present
  useEffect(() => {
    const parseUrl = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;

      const storeParam = params.get('store') || params.get('slug');
      if (storeParam) {
        setActiveSlug(storeParam);
        setCurrentView('store');
        return;
      }

      if (hash.startsWith('#/store/')) {
        const slug = hash.replace('#/store/', '').split('?')[0].split('/')[0];
        if (slug) {
          setActiveSlug(slug);
          setCurrentView('store');
          return;
        }
      }

      if (path.startsWith('/store/')) {
        const slug = path.replace('/store/', '').split('/')[0];
        if (slug) {
          setActiveSlug(slug);
          setCurrentView('store');
          return;
        }
      }

      if (path === '/dashboard' || params.get('view') === 'dashboard' || hash === '#/dashboard') {
        setCurrentView('dashboard');
        return;
      }

      // Default home
      setCurrentView('home');
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    window.addEventListener('hashchange', parseUrl);
    return () => {
      window.removeEventListener('popstate', parseUrl);
      window.removeEventListener('hashchange', parseUrl);
    };
  }, []);

  const navigateTo = (view: 'home' | 'dashboard' | 'store', slug?: string) => {
    setCurrentView(view);
    if (view === 'store' && slug) {
      setActiveSlug(slug);
      window.history.pushState({}, '', `/?store=${slug}`);
    } else if (view === 'dashboard') {
      window.history.pushState({}, '', '/?view=dashboard');
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If merchant just logged in and has an existing store, default to dashboard if they were on home
  useEffect(() => {
    if (user && merchant && currentView === 'home' && window.location.pathname !== '/') {
      setCurrentView('dashboard');
    }
  }, [user, merchant]);

  // Loading indicator for initial auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">
          Initializing QuickStore...
        </p>
      </div>
    );
  }

  // Need onboarding condition: User is signed in, but has no merchant profile yet
  const needsOnboarding = !!user && !merchant && !merchantLoading;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <LandingHero
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onExploreDemo={() => navigateTo('store', 'demo-store')}
            onGoToDashboard={() => navigateTo('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <MerchantDashboard
            onNavigateToStore={(slug) => navigateTo('store', slug)}
          />
        )}

        {currentView === 'store' && (
          <PublicStorefront
            slug={activeSlug}
            onNavigateHome={() => navigateTo('home')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              Q
            </div>
            <span className="font-extrabold text-slate-900">QuickStore</span>
            <span>— The Mobile WhatsApp Merchant Store Builder</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <button
              onClick={() => navigateTo('home')}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('store', 'demo-store')}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Live Demo
            </button>
            {user ? (
              <button
                onClick={() => navigateTo('dashboard')}
                className="hover:text-emerald-700 transition cursor-pointer"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hover:text-emerald-700 transition cursor-pointer"
              >
                Merchant Sign In
              </button>
            )}
          </div>

          <p className="flex items-center gap-1 text-slate-400">
            Powered by Firebase & WhatsApp API
          </p>
        </div>
      </footer>

      {/* Auth Modal for Sign In */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          // View will react to user/merchant state
          setCurrentView('dashboard');
        }}
      />

      {/* First-time Merchant Onboarding Modal */}
      <OnboardingModal
        isOpen={needsOnboarding}
        onSuccess={(slug) => {
          navigateTo('dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
