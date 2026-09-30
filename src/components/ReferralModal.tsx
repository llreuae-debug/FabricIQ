import React, { useState } from 'react';
import type { User } from '../types';
import { referralService } from '../services/referralService';
import {
  X,
  Copy,
  Check,
  Share2,
  Gift
} from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const refCode = currentUser?.referralCode || 'FABRICIQ-PRO';
  const refLink = referralService.getReferralLink(refCode);
  const progress = referralService.getMilestoneProgress(currentUser);
  const myReferrals = currentUser ? referralService.getReferralsByReferrer(currentUser.id) : [];

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: 'FabricIQ — Smart Textile Costing & Live Market Intelligence',
      text: `Join me on FabricIQ for instant yarn & fabric costing with live market rates. Use my referral link:`,
      url: refLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareFeedback('Shared successfully!');
        setTimeout(() => setShareFeedback(null), 3000);
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
      setShareFeedback('Link copied to clipboard for sharing!');
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Join me on FabricIQ for instant textile costing & live market rates! Use my referral link: ${refLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="card-soft-elevated relative w-full max-w-2xl rounded-[32px] border border-[var(--border-subtle)] shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-tactile absolute top-5 right-5 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#6EA8FF]/15 border border-[#6EA8FF]/30 text-[#3B82F6] dark:text-[#67E8F9] text-xs font-bold uppercase tracking-wider mb-1">
            <Gift className="w-3.5 h-3.5" />
            <span>Invite & Earn Program</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-['Outfit']">
            Refer Colleagues. Unlock Lifetime Access.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            Share FabricIQ with textile manufacturers, spinners, and export houses. Reach cumulative milestones to unlock free membership.
          </p>
        </div>

        {/* 3 Milestone Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-4 rounded-[20px] border transition-all text-center space-y-2 ${
            progress.currentCount >= 3
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
              : 'card-soft-inset'
          }`}>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Tier 1</span>
            <div className="text-xl font-bold font-tabular text-[var(--text-primary)]">3 Invites</div>
            <div className="pill-base pill-live text-[10px]">3 Months Free</div>
          </div>

          <div className={`p-4 rounded-[20px] border transition-all text-center space-y-2 ${
            progress.currentCount >= 5
              ? 'bg-[#67E8F9]/15 border-[#67E8F9]/40 text-[#0284C7] dark:text-[#67E8F9]'
              : 'card-soft-inset'
          }`}>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Tier 2</span>
            <div className="text-xl font-bold font-tabular text-[var(--text-primary)]">5 Invites</div>
            <div className="pill-base pill-verified text-[10px]">6 Months Free</div>
          </div>

          <div className={`p-4 rounded-[20px] border transition-all text-center space-y-2 ${
            progress.currentCount >= 12
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300'
              : 'card-soft-inset'
          }`}>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Tier 3</span>
            <div className="text-xl font-bold font-tabular text-[var(--text-primary)]">12 Invites</div>
            <div className="pill-base pill-indicative text-[10px]">Lifetime Access</div>
          </div>
        </div>

        {/* User Referral Link / Code Box */}
        {currentUser ? (
          <div className="card-soft-inset p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Your Unique Referral Link</span>
              <span className="font-mono text-xs font-bold text-[#3B82F6] dark:text-[#67E8F9]">{refCode}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={refLink}
                className="input-soft w-full px-3 py-2 text-xs font-mono select-all"
              />
              <button
                onClick={handleCopy}
                className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleWhatsAppShare}
                className="btn-tactile px-3.5 py-1.5 rounded-[12px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Share via WhatsApp</span>
              </button>
              <button
                onClick={handleNativeShare}
                className="btn-tactile btn-soft-secondary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Options</span>
              </button>
            </div>

            {shareFeedback && (
              <div className="p-2 rounded-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs">
                {shareFeedback}
              </div>
            )}
          </div>
        ) : (
          <div className="card-soft-inset p-5 text-center space-y-3">
            <p className="text-xs text-[var(--text-secondary)]">
              Sign in with Google to generate your personal referral code and track rewards.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="btn-tactile btn-soft-primary px-5 py-2.5 text-xs font-bold"
            >
              Sign In to Start Earning
            </button>
          </div>
        )}

        {/* User Progress Table */}
        {currentUser && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono uppercase">
              Your Referral Signups ({myReferrals.length})
            </h4>

            {myReferrals.length === 0 ? (
              <div className="p-4 rounded-[16px] bg-[var(--surface-subtle)] text-center text-xs text-[var(--text-muted)]">
                No referrals yet. Share your code above to start tracking signups!
              </div>
            ) : (
              <div className="rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] max-h-36 overflow-y-auto text-xs">
                {myReferrals.map((r) => (
                  <div key={r.id} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">{r.referredUserName}</span>
                      <span className="text-[10px] text-[var(--text-muted)] ml-2">{r.referredUserEmail}</span>
                    </div>
                    <span className="pill-base pill-live text-[9px] py-0 px-1.5">QUALIFIED</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
