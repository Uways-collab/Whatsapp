import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Lock, 
  Mail, 
  Loader2, 
  Sparkles, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    signInSandboxMerchant 
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDomainError, setIsDomainError] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseSettingsUrl = 'https://console.firebase.google.com/project/basic-ship-953bd/authentication/settings';

  const handleCopyDomain = async () => {
    try {
      await navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsDomainError(false);
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.error('Google Sign In error:', err);
      const errStr = err instanceof Error ? err.message : String(err);
      if (errStr.includes('auth/unauthorized-domain')) {
        setIsDomainError(true);
        setError('Firebase unauthorized domain: Google OAuth requires adding this domain to Firebase Console.');
      } else {
        setError(errStr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxLogin = () => {
    signInSandboxMerchant();
    onSuccess?.();
    onClose();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setIsDomainError(false);
      if (isSignUp) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const errStr = err instanceof Error ? err.message : String(err);
      if (errStr.includes('auth/operation-not-allowed')) {
        setError('Email/Password provider is not yet enabled in Firebase Console. You can use the Sandbox Merchant button below to test immediately.');
      } else {
        setError(errStr);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isSignUp ? 'Create Merchant Account' : 'Merchant Portal Login'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your store, products in NGN, and WhatsApp orders.
          </p>
        </div>

        {/* Instant Sandbox Merchant Access Banner */}
        <div className="mb-5 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Instant Preview Access
            </span>
            <span className="text-[11px] text-emerald-600 font-bold">1-Click</span>
          </div>
          <p className="text-xs text-slate-700 leading-snug mb-2.5">
            Test the Merchant Dashboard, add products, and simulate WhatsApp orders right away without Google OAuth setup:
          </p>
          <button
            type="button"
            onClick={handleSandboxLogin}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-extrabold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Enter as Test Merchant (Instant)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Domain Error Notice & Quick Guide */}
        {isDomainError && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 text-xs space-y-2.5 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">
                  Firebase Domain Authorization Required
                </p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Firebase restricts Google Sign-In to authorized domains for your project (<code className="font-bold">basic-ship-953bd</code>).
                </p>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-slate-700 truncate select-all">
                {currentHost}
              </span>
              <button
                type="button"
                onClick={handleCopyDomain}
                className="shrink-0 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
              >
                {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">To authorize in 30 seconds:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-0.5">
                <li>Open Firebase Console &gt; Authentication &gt; Settings</li>
                <li>Under <strong>Authorized domains</strong>, click <strong>Add domain</strong></li>
                <li>Paste <code className="text-amber-900 bg-amber-100/60 px-1 rounded">{currentHost}</code> and Save</li>
              </ol>
            </div>

            <a
              href={firebaseSettingsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline"
            >
              <span>Open Firebase Authentication Settings</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {error && !isDomainError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 rounded-xl text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs sm:text-sm shadow-xs transition-all hover:border-slate-400 disabled:opacity-60 cursor-pointer mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
            or with email
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@example.com"
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSignUp ? 'Create Merchant Account' : 'Sign In with Email'}</span>
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setIsDomainError(false);
            }}
            className="text-xs text-slate-600 hover:text-emerald-700 font-semibold cursor-pointer"
          >
            {isSignUp ? (
              <>Already have a store account? <span className="text-emerald-600 underline">Sign in</span></>
            ) : (
              <>New merchant? <span className="text-emerald-600 underline">Create store account</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
