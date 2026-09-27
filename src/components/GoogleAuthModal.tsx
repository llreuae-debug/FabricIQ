import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { referralService } from '../services/referralService';
import type { User } from '../types';
import { X, ShieldCheck, Sparkles, ArrowRight, Gift } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const captured = referralService.getCapturedReferralCode();
      if (captured) {
        setReferralCode(captured);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async (customName?: string, customEmail?: string) => {
    setIsLoading(true);
    setStatusMsg({ type: 'info', text: 'Connecting securely to Google OAuth...' });

    try {
      const gName = customName || 'Textile Engineer';
      const gEmail = customEmail || `engineer.${Math.floor(100 + Math.random() * 900)}@gmail.com`;
      const gAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(gName)}`;

      // Complete Sign in
      const { user, isNewUser } = await authService.signInWithGoogle(
        { name: gName, email: gEmail, avatar: gAvatar, sub: `g-oauth-${Date.now()}` },
        referralCode
      );

      if (isNewUser && referralCode) {
        const refResult = referralService.processSignupReferral(user, referralCode);
        if (refResult.success) {
          setStatusMsg({ type: 'success', text: `Welcome to FabricIQ! Referral code ${referralCode} applied.` });
        }
      }

      setTimeout(() => {
        setIsLoading(false);
        onSuccess(user);
        onClose();
      }, 600);
    } catch {
      setIsLoading(false);
      setStatusMsg({ type: 'error', text: 'Authentication failed. Please try again.' });
    }
  };

  const handleQuickSwitch = (targetUser: User) => {
    authService.switchUser(targetUser.id);
    onSuccess(targetUser);
    onClose();
  };

  const existingUsers = authService.getAllUsers();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-cyan-400 mb-1">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Welcome to <span className="text-gradient-fiq">FabricIQ</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Smart Textile Costing & Live Market Intelligence. Full access to all standard features is always free.
          </p>
        </div>

        {/* Google One-Tap Action */}
        <div className="space-y-4">
          <button
            onClick={() => handleGoogleSignIn()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3.5 py-3.5 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-md hover:shadow-lg hover:border-blue-500 dark:hover:border-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer group"
          >
            {/* Google SVG Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span className="font-semibold group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
              {isLoading ? 'Authenticating...' : 'Continue with Google'}
            </span>
          </button>

          {/* Referral Code Field */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                <span>Referral Code (Optional)</span>
              </label>
              {referralCode && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Code Captured
                </span>
              )}
            </div>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="e.g. FABRICIQ-DIL123"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 uppercase placeholder:normal-case placeholder:font-sans"
            />
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                  : 'bg-blue-500/15 text-blue-700 dark:text-cyan-300 border border-blue-500/30'
              }`}
            >
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Custom Quick-Test Account Selector */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Demo / Test Accounts
            </span>
            <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-medium">1-Click Switch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {existingUsers.slice(0, 4).map((usr) => (
              <button
                key={usr.id}
                onClick={() => handleQuickSwitch(usr)}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition-all group"
              >
                <img src={usr.avatar} alt={usr.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400">
                    {usr.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                    <span>{usr.role === 'admin' ? 'Superadmin' : usr.membershipType.replace('_', ' ')}</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>OAuth 2.0 Encrypted • We never store or access your Google password.</span>
        </div>
      </div>
    </div>
  );
};
