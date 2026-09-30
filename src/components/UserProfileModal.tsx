import React from 'react';
import type { User } from '../types';
import { MembershipBadge } from './MembershipBadge';
import {
  X,
  LogOut,
  Gift,
  Calendar,
  Mail,
  User as UserIcon
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="card-soft-elevated relative w-full max-w-md rounded-[28px] border border-[var(--border-subtle)] shadow-2xl p-6 text-center space-y-4">
          <button
            onClick={onClose}
            className="btn-tactile absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-[16px] bg-[#6EA8FF]/15 text-[#3B82F6] dark:text-[#67E8F9] mx-auto flex items-center justify-center">
            <UserIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Guest Session</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Sign in with Google to view your membership benefits, saved quotes, and referral rewards.
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="btn-tactile btn-soft-primary w-full py-3 text-xs font-bold"
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="card-soft-elevated relative w-full max-w-lg rounded-[28px] border border-[var(--border-subtle)] shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-tactile absolute top-5 right-5 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Identity Header */}
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-[20px] object-cover border-2 border-[#6EA8FF]/40 shadow-md"
          />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-[var(--text-primary)] font-['Outfit'] truncate">
                {user.name}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="pt-1">
              <MembershipBadge type={user.membershipType} size="md" />
            </div>
          </div>
        </div>

        {/* Membership Details Card */}
        <div className="card-soft-inset p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Membership Status:</span>
            <span className="font-bold text-[var(--text-primary)]">{user.membershipType.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Access Expiry:</span>
            <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#6EA8FF]" />
              {expiryFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Verified Referrals:</span>
            <span className="font-mono font-bold text-[#10B981] dark:text-[#6EE7B7]">
              {user.qualifiedReferralsCount || 0} Members
            </span>
          </div>
        </div>

        {/* Referral Program Banner */}
        <div 
          onClick={() => {
            onClose();
            onOpenReferral();
          }}
          className="btn-tactile p-4 rounded-[20px] bg-gradient-to-r from-[#6EA8FF]/15 to-[#67E8F9]/15 border border-[#6EA8FF]/30 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[12px] bg-[#6EA8FF]/20 text-[#3B82F6] dark:text-[#67E8F9]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Invite Colleagues & Unlock Access</div>
              <div className="text-[11px] text-[var(--text-secondary)]">Your Code: <strong className="font-mono text-[#3B82F6] dark:text-[#67E8F9]">{user.referralCode}</strong></div>
            </div>
          </div>
          <span className="text-xs font-bold text-[#3B82F6] dark:text-[#67E8F9]">View →</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="btn-tactile flex items-center gap-1.5 px-4 py-2 rounded-[12px] text-rose-500 hover:bg-rose-500/10 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="btn-tactile btn-soft-secondary px-5 py-2 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
