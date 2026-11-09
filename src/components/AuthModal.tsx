import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, Shield, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, showToast }) => {
  const { signInWithGoogle, signInDemoAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInWithGoogle();
      onClose();
      showToast('Welcome to SwapTap. 5 ST Tokens credited to your wallet.');
    } catch (err: any) {
      setErrorMsg(
        err.code === 'auth/popup-closed-by-user'
          ? 'Sign-in cancelled. Try Instant Demo Access below.'
          : 'Google sign-in encountered an issue. Try Instant Demo Access.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (role: 'creator' | 'veteran') => {
    try {
      setLoading(true);
      await signInDemoAccount(role);
      onClose();
      showToast(`Signed in as ${role === 'veteran' ? 'Veteran Creator (45 ST Tokens)' : 'New Creator (15 ST Tokens)'}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand & Welcome Note */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">Sign In to SwapTap</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Community creator engagement exchange
            </p>
          </div>

          {/* 5 Free Points Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5 text-xs font-medium text-blue-300">
            New User Gift: 5 Free ST Tokens automatically credited
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2.5">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-medium text-xs transition-colors shadow-sm"
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

          <div className="relative flex items-center justify-center my-1.5">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#0F172A] px-2 text-[10px] uppercase font-mono text-slate-500">
              Or Demo Mode
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoSignIn('creator')}
              disabled={loading}
              className="py-2 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
            >
              New Creator (15 ST)
            </button>
            <button
              onClick={() => handleDemoSignIn('veteran')}
              disabled={loading}
              className="py-2 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
            >
              Veteran (45 ST)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Web PWA peer exchange. Real human creator watch time.</span>
        </div>
      </div>
    </div>
  );
};
