import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { referralService } from '../services/referralService';
import type { User } from '../types';
import { X, ShieldCheck, Sparkles, Gift } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="card-soft-elevated relative w-full max-w-lg rounded-[28px] border border-[var(--border-subtle)] shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-tactile absolute top-5 right-5 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30 text-[#3B82F6] dark:text-[#67E8F9] mb-1">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] font-['Outfit']">
            Welcome to FabricIQ
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Smart Textile Costing & Live Market Intelligence. Full access to deterministic engineering calculators.
          </p>
        </div>

        {/* Google One-Tap Action */}
        <div className="space-y-4">
          <button
            onClick={() => handleGoogleSignIn()}
            disabled={isLoading}
            className="btn-tactile w-full flex items-center justify-center gap-3.5 py-3.5 px-5 rounded-[18px] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-sm shadow-[var(--shadow-soft)] cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>{isLoading ? 'Signing In...' : 'Continue with Google'}</span>
          </button>

          {/* Referral Code Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-[#059669] dark:text-[#6EE7B7]" />
              <span>Have an Invite Code?</span>
            </label>
            <input
              type="text"
              placeholder="e.g. FABRIC-9876"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className="input-soft w-full px-3.5 py-2.5 text-xs font-mono uppercase"
            />
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-[14px] text-xs font-medium ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : statusMsg.type === 'error'
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                : 'bg-[#6EA8FF]/15 text-[#3B82F6] dark:text-[#67E8F9] border border-[#6EA8FF]/30'
            }`}>
              {statusMsg.text}
            </div>
          )}
        </div>

        {/* Existing User Profiles (Local Demo) */}
        {existingUsers.length > 0 && (
          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
              Quick Switch Local Profile
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {existingUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickSwitch(u)}
                  className="btn-tactile w-full flex items-center justify-between p-2 rounded-[14px] bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border-subtle)] text-xs text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-[8px] object-cover" />
                    <span className="font-semibold text-[var(--text-primary)]">{u.name}</span>
                  </div>
                  <span className="pill-base pill-verified text-[9px] py-0 px-1.5">{u.membershipType}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 text-center text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] dark:text-[#6EE7B7]" />
          <span>Zero spam. No credit card required.</span>
        </div>
      </div>
    </div>
  );
};
