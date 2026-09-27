import React from 'react';
import type { User } from '../types';
import { MembershipBadge } from './MembershipBadge';
import {
  X,
  LogOut,
  Gift,
  CheckCircle2,
  Calendar,
  Mail,
  Shield,
  User as UserIcon,
  Crown,
  Sparkles,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSignOut: () => void;
  onOpenReferral: () => void;
  onOpenAuth: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignOut,
  onOpenReferral,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
            <UserIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Guest Session</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in with Google to view your membership benefits and unique referral code.
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  const isLifetime = user.membershipType === 'LIFETIME';
  const expiryFormatted = user.membershipExpiry
    ? new Date(user.membershipExpiry).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : isLifetime
    ? 'Never Expires (Lifetime Access)'
    : 'Free Standard Access';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Identity Header */}
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/40 shadow-md"
          />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit'] truncate">
                {user.name}
              </h2>
              {user.role === 'admin' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  Admin
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>{user.email}</span>
            </div>
            <div className="pt-1">
              <MembershipBadge type={user.membershipType} size="sm" />
            </div>
          </div>
        </div>

        {/* Membership Access & Benefits Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Membership Status</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                user.membershipStatus === 'active'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}
            >
              {user.membershipStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Tier</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {user.membershipType.replace('_', ' ')}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Valid Until</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                {expiryFormatted}
              </span>
            </div>
          </div>

          {/* Full Access Checklist */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block">
              Included Full Access:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Cost Calculator</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Market Rates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Estimates & PDF</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>FabricIQ AI Tools</span>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Status & Quick Action */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 border border-cyan-500/30 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <Gift className="w-3.5 h-3.5 text-cyan-500" />
              <span>Referral Program: {user.qualifiedReferralsCount || 0} / 12</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Code: <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{user.referralCode}</span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenReferral();
            }}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-md transition-all shrink-0 cursor-pointer"
          >
            Invite & Earn →
          </button>
        </div>

        {/* User Metadata info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Member since: {new Date(user.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            ID: {user.id.slice(0, 10)}
          </span>
        </div>

        {/* Sign Out & Switch buttons */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Switch Account</span>
          </button>

          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
