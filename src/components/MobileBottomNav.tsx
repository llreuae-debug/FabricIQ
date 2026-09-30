import React, { useState } from 'react';
import { 
  Home, 
  Calculator, 
  Activity, 
  FileText, 
  Menu, 
  X, 
  Wrench, 
  Gift, 
  User, 
  Sparkles, 
  ChevronRight,
  Globe,
  Coins,
  BookOpen,
  Database, 
  Package,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import type { CurrencyCode, LanguageCode, User as UserType } from '../types';
import { LANGUAGES } from '../services/i18n';
import { CURRENCY_MAP } from '../services/currencyService';
import { themeService } from '../services/themeService';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentCurrency: CurrencyCode;
  onCurrencyChange: (cur: CurrencyCode) => void;
  currentUser?: UserType | null;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  onOpenReferral?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  currentLang,
  onLanguageChange,
  currentCurrency,
  onCurrencyChange,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenReferral,
}) => {
  const [moreSheetOpen, setMoreSheetOpen] = useState<boolean>(false);

  // 5 primary tabs as per design spec: Home, Calculate, BOQ, Rates, More
  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'calculator',
      label: 'Calculate',
      icon: Calculator,
    },
    {
      id: 'boq_engine',
      label: 'BOQ',
      icon: Package,
    },
    {
      id: 'market_rates',
      label: 'Rates',
      icon: Activity,
    },
    {
      id: 'more',
      label: 'More',
      icon: Menu,
      isAction: true,
    },
  ];

  const handleNavClick = (id: string, isAction?: boolean) => {
    if (isAction) {
      setMoreSheetOpen(true);
    } else {
      onTabChange(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-2xl border-t border-[var(--border-subtle)] shadow-[var(--shadow-soft-float)] transition-colors duration-200"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'more' && moreSheetOpen);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.isAction)}
                className={`btn-tactile relative flex flex-col items-center justify-center h-full w-full py-1 transition-all duration-180 cursor-pointer ${
                  isActive
                    ? 'text-[#3B82F6] dark:text-[#67E8F9] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                {/* Active Pill Indicator */}
                {isActive && (
                  <span className="absolute top-1 w-8 h-1 rounded-full bg-gradient-to-r from-[#6EA8FF] to-[#67E8F9] shadow-sm shadow-[#67E8F9]/50" />
                )}

                <div className={`p-1 rounded-[10px] transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight leading-none mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile "More" Bottom Sheet Modal */}
      {moreSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            onClick={() => setMoreSheetOpen(false)} 
          />

          <div 
            className="card-soft-elevated relative w-full max-h-[85vh] overflow-y-auto rounded-t-[32px] rounded-b-none border-t border-[var(--border-subtle)] shadow-2xl p-5 space-y-4 animate-sheet-up z-10"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 rounded-full bg-[var(--border-subtle)] mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[12px] bg-[#6EA8FF]/15 text-[#3B82F6] dark:text-[#67E8F9] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Outfit']">
                    FabricIQ Menu
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Tools, references & account
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMoreSheetOpen(false)}
                className="btn-tactile p-2 rounded-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile / Login Card */}
            {currentUser ? (
              <div 
                onClick={() => {
                  setMoreSheetOpen(false);
                  onOpenProfile?.();
                }}
                className="btn-tactile p-3.5 rounded-[18px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-[12px] object-cover border border-[#67E8F9]/40" />
                  <div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">{currentUser.name}</div>
                    <div className="text-[10px] text-[#3B82F6] dark:text-[#67E8F9] font-semibold">{currentUser.membershipType} Member</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
            ) : (
              <button
                onClick={() => {
                  setMoreSheetOpen(false);
                  onOpenAuth?.();
                }}
                className="btn-tactile btn-soft-primary w-full p-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <User className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>
            )}

            {/* Primary Navigation Tiles */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  onTabChange('reference_library');
                  setMoreSheetOpen(false);
                }}
                className="btn-tactile p-3 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-left space-y-1 cursor-pointer"
              >
                <Database className="w-4 h-4 text-[#6EA8FF]" />
                <div className="text-xs font-bold text-[var(--text-primary)]">Reference Library</div>
                <div className="text-[10px] text-[var(--text-muted)]">Yarn, fabric, dyeing catalog</div>
              </button>

              <button
                onClick={() => {
                  onTabChange('saved_estimates');
                  setMoreSheetOpen(false);
                }}
                className="btn-tactile p-3 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-left space-y-1 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#6EE7B7]" />
                <div className="text-xs font-bold text-[var(--text-primary)]">Saved Estimates</div>
                <div className="text-[10px] text-[var(--text-muted)]">Commercial quotes & PDF</div>
              </button>

              <button
                onClick={() => {
                  onTabChange('utilities');
                  setMoreSheetOpen(false);
                }}
                className="btn-tactile p-3 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-left space-y-1 cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-[#FDBA74]" />
                <div className="text-xs font-bold text-[var(--text-primary)]">Textile Tools</div>
                <div className="text-[10px] text-[var(--text-muted)]">Yarn count, GSM, crimp</div>
              </button>

              <button
                onClick={() => {
                  onTabChange('knowledge');
                  setMoreSheetOpen(false);
                }}
                className="btn-tactile p-3 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-left space-y-1 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#C4B5FD]" />
                <div className="text-xs font-bold text-[var(--text-primary)]">Technical Guides</div>
                <div className="text-[10px] text-[var(--text-muted)]">Formulas & economics</div>
              </button>
            </div>

            {/* Quick Settings Bar: Lang, Cur, Theme */}
            <div className="p-3.5 rounded-[18px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#6EA8FF]" />
                  <span>Language</span>
                </span>
                <select
                  value={currentLang}
                  onChange={(e) => onLanguageChange(e.target.value as any)}
                  className="input-soft px-2.5 py-1 text-xs font-semibold cursor-pointer"
                >
                  {Object.values(LANGUAGES).map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-[#6EE7B7]" />
                  <span>Currency</span>
                </span>
                <select
                  value={currentCurrency}
                  onChange={(e) => onCurrencyChange(e.target.value as any)}
                  className="input-soft px-2.5 py-1 text-xs font-semibold cursor-pointer"
                >
                  {Object.values(CURRENCY_MAP).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#FDE68A]" />
                  <span>Theme</span>
                </span>
                <div className="flex items-center gap-1 bg-[var(--surface)] p-0.5 rounded-[10px] border border-[var(--border-subtle)]">
                  <button
                    onClick={() => themeService.setMode('light')}
                    className="btn-tactile p-1.5 rounded-[8px] hover:bg-[var(--surface-subtle)] text-amber-500"
                    title="Light"
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => themeService.setMode('dark')}
                    className="btn-tactile p-1.5 rounded-[8px] hover:bg-[var(--surface-subtle)] text-[#67E8F9]"
                    title="Dark"
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => themeService.setMode('system')}
                    className="btn-tactile p-1.5 rounded-[8px] hover:bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                    title="System"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Referral CTA Banner */}
            <div 
              onClick={() => {
                setMoreSheetOpen(false);
                onOpenReferral?.();
              }}
              className="btn-tactile p-3.5 rounded-[18px] bg-gradient-to-r from-[#6EA8FF]/15 to-[#67E8F9]/15 border border-[#6EA8FF]/30 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Gift className="w-5 h-5 text-[#3B82F6] dark:text-[#67E8F9]" />
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">Invite & Unlock Rewards</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Earn free platform access</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </div>

          </div>
        </div>
      )}
    </>
  );
};
