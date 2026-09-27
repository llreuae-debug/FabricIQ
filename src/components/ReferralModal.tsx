import React, { useState } from 'react';
import type { User } from '../types';
import { referralService } from '../services/referralService';
import { MembershipBadge } from './MembershipBadge';
import {
  X,
  Copy,
  Check,
  Share2,
  Gift,
  Crown,
  Sparkles,
  Zap,
  Users,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Award,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-300 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Gift className="w-3.5 h-3.5 animate-bounce" />
            <span>Invite & Earn Program</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Refer Friends. Unlock <span className="text-gradient-fiq">Lifetime Access</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Share FabricIQ with textile manufacturers, traders, and engineers. Reach cumulative milestones to unlock free full access rewards.
          </p>
        </div>

        {/* If not logged in, prompt sign in */}
        {!currentUser ? (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-850 border border-blue-200 dark:border-cyan-500/30 text-center space-y-4">
            <Users className="w-10 h-10 text-blue-600 dark:text-cyan-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sign in with Google to get your unique referral link
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Track your referrals in real-time and automatically claim 3-Month, 6-Month, or Lifetime rewards.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
            >
              <span>Continue with Google</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            {/* Progress Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Your Referral Milestone Progress
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                    <span>
                      {progress.currentCount}{' '}
                      <span className="text-sm font-semibold text-slate-400">
                        / {progress.nextThreshold || 12} Qualified Referrals
                      </span>
                    </span>
                    {progress.isLifetime && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        🎉 Lifetime Unlocked
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <MembershipBadge type={currentUser.membershipType} size="md" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500 glow-fiq-cyan"
                    style={{ width: `${Math.max(5, progress.progressPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span>Current: {progress.currentCount} referrals</span>
                  <span>
                    {progress.isLifetime ? 'Maximum Tier Achieved' : `Next Reward: ${progress.nextReward}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Referral Reward Tiers Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tier 1: 3 Referrals */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  progress.currentCount >= 3
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  {progress.currentCount >= 3 ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                      UNLOCKED ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">3 Referrals</span>
                  )}
                </div>
                <h4 className="text-xs font-bold font-['Outfit'] uppercase tracking-wide">3 Referrals</h4>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">3 Months Free</div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Full premium access to all costing tools</p>
              </div>

              {/* Tier 2: 5 Referrals */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  progress.currentCount >= 5
                    ? 'bg-cyan-500/10 dark:bg-cyan-950/30 border-cyan-500/40 text-cyan-900 dark:text-cyan-200'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-500">
                    <Zap className="w-4 h-4" />
                  </div>
                  {progress.currentCount >= 5 ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500 text-white">
                      UNLOCKED ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">5 Referrals</span>
                  )}
                </div>
                <h4 className="text-xs font-bold font-['Outfit'] uppercase tracking-wide">5 Referrals</h4>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">6 Months Free</div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Extended full access for power users</p>
              </div>

              {/* Tier 3: 12 Referrals */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  progress.currentCount >= 12
                    ? 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/40 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <Crown className="w-4 h-4" />
                  </div>
                  {progress.currentCount >= 12 ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                      UNLOCKED ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">12 Referrals</span>
                  )}
                </div>
                <h4 className="text-xs font-bold font-['Outfit'] uppercase tracking-wide">12 Referrals</h4>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">Lifetime Free</div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Permanent access with zero subscription</p>
              </div>
            </div>

            {/* Referral Link & Sharing Controls */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Your Exclusive Referral Link</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  CODE: {refCode}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={refLink}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none select-all truncate"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Quick Share Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleNativeShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Share Link</span>
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Share to WhatsApp</span>
                </button>
                {shareFeedback && (
                  <span className="text-[11px] text-emerald-400 font-medium animate-pulse ml-auto">
                    {shareFeedback}
                  </span>
                )}
              </div>
            </div>

            {/* Referral History Table */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>Referred Members ({myReferrals.length})</span>
                </h3>
                <span className="text-[10px] text-slate-400">Anti-abuse validated</span>
              </div>

              {myReferrals.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                  No referrals yet. Share your unique link above to invite your first colleague!
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
                  {myReferrals.map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{ref.referredUserName}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                          {ref.referredUserEmail}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ref.status === 'qualified'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : ref.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {ref.status}
                        </span>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          {new Date(ref.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Qualification rules prevent self & duplicate referrals
          </span>
          <button onClick={onClose} className="hover:underline font-semibold cursor-pointer">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
