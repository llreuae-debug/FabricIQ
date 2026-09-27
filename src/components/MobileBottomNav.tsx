import React, { useState } from 'react';
import { 
  Home, 
  Calculator, 
  Activity, 
  FileText, 
  Menu, 
  X, 
  Wrench, 
  ShieldCheck, 
  Gift, 
  User, 
  Sparkles, 
  ChevronRight,
  Globe,
  Coins,
  BookOpen,
  Building2
} from 'lucide-react';
import type { CurrencyCode, LanguageCode, User as UserType } from '../types';
import { LANGUAGES } from '../services/i18n';
import { CURRENCY_MAP } from '../services/currencyService';
import { themeService, type ThemeMode } from '../services/themeService';

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
  const [langSelectOpen, setLangSelectOpen] = useState<boolean>(false);
  const [currSelectOpen, setCurrSelectOpen] = useState<boolean>(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'calculator',
      label: 'Calculator',
      icon: Calculator,
    },
    {
      id: 'market_rates',
      label: 'Market',
      icon: Activity,
    },
    {
      id: 'saved_estimates',
      label: 'Estimates',
      icon: FileText,
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
      {/* Fixed Mobile Bottom Navigation Bar (Visible on mobile/tablets up to md) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] transition-colors duration-200"
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
                className={`relative flex flex-col items-center justify-center h-full w-full py-1 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-blue-600 dark:text-cyan-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                }`}
              >
                {/* Active Indicator Top Glow Pill */}
                {isActive && (
                  <span className="absolute top-1 w-8 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-sm shadow-cyan-400/50" />
                )}

                <div className={`p-1 rounded-xl transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
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
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          {/* Backdrop Touch Dismiss */}
          <div 
            className="absolute inset-0"
            onClick={() => {
              setMoreSheetOpen(false);
              setLangSelectOpen(false);
              setCurrSelectOpen(false);
            }} 
          />

          <div 
            className="relative w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-sheet-up z-10"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                    FabricIQ Menu
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tools, preferences & account
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMoreSheetOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
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
                className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/20 via-cyan-900/15 to-slate-900/40 dark:bg-slate-850 border border-blue-200 dark:border-slate-700/80 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover border border-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
                    <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">{currentUser.membershipType} Member</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ) : (
              <button
                onClick={() => {
                  setMoreSheetOpen(false);
                  onOpenAuth?.();
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <User className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>
            )}

            {/* Main Navigation Links */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  onTabChange('utilities');
                  setMoreSheetOpen(false);
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-1 hover:border-blue-500 transition-colors cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-blue-500" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Textile Tools</div>
                <div className="text-[10px] text-slate-500">Yarn count, GSM, crimp</div>
              </button>

              <button
                onClick={() => {
                  onTabChange('knowledge');
                  setMoreSheetOpen(false);
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-1 hover:border-cyan-500 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Knowledge Base</div>
                <div className="text-[10px] text-slate-500">Guides, formulas, physics</div>
              </button>

              <button
                onClick={() => {
                  onTabChange('about');
                  setMoreSheetOpen(false);
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-1 hover:border-blue-500 transition-colors cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-indigo-400" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">About & Policies</div>
                <div className="text-[10px] text-slate-500">Overview, terms & FAQ</div>
              </button>

              <button
                onClick={() => {
                  onTabChange('admin');
                  setMoreSheetOpen(false);
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-1 hover:border-blue-500 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Admin Control</div>
                <div className="text-[10px] text-slate-500">Market index & audits</div>
              </button>

              <button
                onClick={() => {
                  setMoreSheetOpen(false);
                  onOpenReferral?.();
                }}
                className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-left space-y-1 cursor-pointer col-span-2 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
                    <Gift className="w-4 h-4" />
                    <span>Invite & Earn Free Lifetime Access</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Share your link and earn Pro tiers</div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </button>
            </div>

            {/* Language & Currency Quick Switchers */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Trading Currency</span>
                <button
                  onClick={() => setCurrSelectOpen(!currSelectOpen)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{currentCurrency} ({CURRENCY_MAP[currentCurrency]?.symbol})</span>
                </button>
              </div>

              {currSelectOpen && (
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {Object.values(CURRENCY_MAP).map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        onCurrencyChange(c.code);
                        setCurrSelectOpen(false);
                      }}
                      className={`p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                        currentCurrency === c.code
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Language</span>
                <button
                  onClick={() => setLangSelectOpen(!langSelectOpen)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>{LANGUAGES[currentLang]?.flag} {LANGUAGES[currentLang]?.nativeName}</span>
                </button>
              </div>

              {langSelectOpen && (
                <div className="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {Object.values(LANGUAGES).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onLanguageChange(l.code);
                        setLangSelectOpen(false);
                      }}
                      className={`p-2 rounded-lg text-xs font-bold flex items-center justify-start gap-2 ${
                        currentLang === l.code
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Theme Quick Switcher */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Theme Mode</span>
                <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => themeService.setMode(mode)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                        themeService.getMode() === mode
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
