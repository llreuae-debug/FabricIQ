import React from 'react';
import type { MembershipType } from '../types';
import { Crown, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface MembershipBadgeProps {
  type: MembershipType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const MembershipBadge: React.FC<MembershipBadgeProps> = ({
  type,
  size = 'md',
  showIcon = true,
}) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'LIFETIME':
        return {
          label: 'LIFETIME MEMBER',
          icon: Crown,
          className:
            'bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10',
          dotColor: 'bg-amber-400',
        };
      case 'PRO_6_MONTHS':
        return {
          label: '6-MONTH REWARD',
          icon: Zap,
          className:
            'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10',
          dotColor: 'bg-cyan-400',
        };
      case 'PRO_3_MONTHS':
        return {
          label: '3-MONTH REWARD',
          icon: Sparkles,
          className:
            'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10',
          dotColor: 'bg-emerald-400',
        };
      case 'FREE':
      default:
        return {
          label: 'FREE MEMBER',
          icon: ShieldCheck,
          className:
            'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
          dotColor: 'bg-slate-400',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-bold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-extrabold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase font-['Outfit'] transition-all ${config.className} ${sizeClasses}`}
    >
      {showIcon && <Icon className={`${iconSizes} shrink-0 animate-pulse`} />}
      <span>{config.label}</span>
    </span>
  );
};
