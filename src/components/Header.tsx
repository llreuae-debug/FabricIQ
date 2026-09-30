import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ChevronDown, 
  Check, 
  Sun, 
  Moon, 
  Laptop, 
  Bell, 
  Menu, 
  X, 
  Search, 
  Layers, 
  TrendingUp, 
  FileText, 
  Calculator, 
  User, 
  Settings, 
  Gift, 
  BookOpen, 
  Database, 
  Package
} from 'lucide-react';
import type { CurrencyCode, LanguageCode, User as UserType } from '../types';
import { CURRENCY_MAP, currencyService } from '../services/currencyService';
import { LANGUAGES, i18n } from '../services/i18n';
import { marketRateService } from '../services/marketRateService';
import { themeService, type ThemeMode, type ResolvedTheme } from '../services/themeService';
import { MembershipBadge } from './MembershipBadge';
import logoImg from '../assets/logo.png';

interface HeaderProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentCurrency: CurrencyCode;
  onCurrencyChange: (cur: CurrencyCode) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  onShowSplash?: () => void;
  currentUser?: UserType | null;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  onOpenReferral?: () => void;
  onSignOut?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'rate_alert' | 'quote' | 'forex';
  unread: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  currentCurrency,
  onCurrencyChange,
  activeTab,
  onTabChange,
  onSync,
  isSyncing,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenReferral,
  onSignOut,
}) => {
  // Theme state
  const [themeMode, setThemeMode] = useState<ThemeMode>(themeService.getMode());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(themeService.getResolvedTheme());

  // Dropdown states
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currDropdownOpen, setCurrDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search in currency dropdown
  const [currencySearch, setCurrencySearch] = useState('');

  // Scroll state for sticky header elevation
  const [isScrolled, setIsScrolled] = useState(false);

  // Market telemetry data
  const isOnline = marketRateService.getNetworkStatus();
  const rates = marketRateService.getRates();
  const [liveFX, setLiveFX] = useState(currencyService.getLiveFX());

  const usdPkrRate = liveFX.currentRate || 278.45;
  const cottonRate = rates.find((r) => r.id === 'rate-yarn-20-carded')?.currentRate || 2850;
  const greyRate = rates.find((r) => r.id === 'rate-grey-sheeting-63')?.currentRate || 185.5;

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Yarn Benchmark Alert',
      desc: '20/1 Carded Cotton Yarn increased +1.1% on Faisalabad Exchange.',
      time: '12m ago',
      type: 'rate_alert',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Quotation Approved',
      desc: 'Ref FIQ-2026-0841 approved by AeroTex Global Sourcing.',
      time: '45m ago',
      type: 'quote',
      unread: true,
    },
    {
      id: 'n3',
      title: 'Forex Index Updated',
      desc: 'USD/PKR parity calibrated to 279.50 (State Bank verified).',
      time: '2h ago',
      type: 'forex',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubTheme = themeService.subscribe((resolved, mode) => {
      setResolvedTheme(resolved);
      setThemeMode(mode);
    });
    const unsubFX = currencyService.subscribe((fx) => {
      setLiveFX(fx);
    });
    return () => {
      unsubTheme();
      unsubFX();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
        setCurrDropdownOpen(false);
        setThemeDropdownOpen(false);
        setNotifDropdownOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleThemeSelect = (mode: ThemeMode) => {
    themeService.setMode(mode);
    setThemeDropdownOpen(false);
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const filteredCurrencies = Object.values(CURRENCY_MAP).filter(
    (c) =>
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.symbol.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'calculator', label: 'Cost Calculator', icon: Calculator },
    { id: 'boq_engine', label: 'BOQ Master', icon: Package },
    { id: 'reference_library', label: 'Reference Library', icon: Database },
    { id: 'market_rates', label: 'Market Rates', icon: TrendingUp },
    { id: 'saved_estimates', label: 'Estimates', icon: FileText },
    { id: 'knowledge', label: 'Guides', icon: BookOpen },
  ];

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-[var(--shadow-soft)]'
          : 'bg-[var(--surface)] border-b border-[var(--border-subtle)]'
      }`}
    >
      {/* Top Live Rates Telemetry Ticker */}
      <div className="px-3 py-1 text-xs border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]/60 text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="pill-base pill-live text-[10px] py-0.5 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse" />
              {i18n.t('live_rates_ticker')}
            </span>

            <div className="hidden sm:flex items-center gap-4 text-[11px] overflow-hidden">
              <span className="flex items-center gap-1">
                <span className="text-[var(--text-muted)]">Cotton Yarn 20s:</span>
                <span className="font-tabular font-semibold text-[var(--text-primary)]">
                  ₨ {cottonRate.toLocaleString()} / 10lbs
                </span>
                <span className="text-[#6EE7B7] dark:text-[#10B981] font-bold">↑ +1.1%</span>
              </span>
              <span className="text-[var(--border-subtle)]">|</span>
              <span className="flex items-center gap-1">
                <span className="text-[var(--text-muted)]">Grey Sheeting 63":</span>
                <span className="font-tabular font-semibold text-[var(--text-primary)]">
                  ₨ {greyRate.toFixed(2)} / m
                </span>
                <span className="text-[#6EE7B7] dark:text-[#10B981] font-bold">↑ +1.9%</span>
              </span>
              <span className="text-[var(--border-subtle)]">|</span>
              <span className="flex items-center gap-1">
                <span className="text-[var(--text-muted)]">1 USD =</span>
                <span className="font-tabular font-semibold text-[#6EA8FF] dark:text-[#67E8F9]">
                  ₨ {usdPkrRate.toFixed(2)} PKR
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  ({currencyService.getLastUpdatedTimestamp().split(',')[0] || 'Today'})
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-[11px]">
            {isOnline ? (
              <span className="flex items-center gap-1 text-[#10B981] dark:text-[#6EE7B7] font-medium text-xs">
                <Wifi className="w-3 h-3" />
                <span className="hidden md:inline">{i18n.t('online_status')}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#F97316] dark:text-[#FDBA74] font-medium text-xs">
                <WifiOff className="w-3 h-3" />
                <span className="hidden md:inline">{i18n.t('offline_status')}</span>
              </span>
            )}

            <button
              onClick={onSync}
              disabled={isSyncing}
              className="btn-tactile flex items-center gap-1 px-2.5 py-0.5 rounded-[12px] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-primary)] shadow-sm disabled:opacity-50 cursor-pointer"
              title="Sync latest live market rates"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#6EA8FF]' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Soft Floating Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-200 ${isScrolled ? 'h-14' : 'h-16'} gap-3`}>
          
          {/* LEFT: FabricIQ Logo & Soft Floating Wordmark */}
          <div 
            onClick={() => onTabChange('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#6EA8FF]/40 via-[#67E8F9]/30 to-[#6EE7B7]/40 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300" />
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] overflow-hidden bg-white p-0.5 shadow-md border border-[var(--border-subtle)] flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                <img
                  src={logoImg}
                  alt="FabricIQ"
                  className="w-full h-full object-cover rounded-[12px]"
                />
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="text-xl font-extrabold tracking-tight font-['Outfit'] text-[var(--text-primary)]">
                  FABRIC
                </span>
                <span className="text-xl font-extrabold font-['Outfit'] bg-gradient-to-r from-[#6EA8FF] via-[#67E8F9] to-[#6EE7B7] bg-clip-text text-transparent">
                  IQ
                </span>
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-blue-500/10 text-[#6EA8FF] dark:text-[#67E8F9] border border-[#6EA8FF]/20">
                  SaaS
                </span>
              </div>
            </div>
          </div>

          {/* CENTER: Soft Floating Navigation Pills (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-[18px] bg-[var(--surface-subtle)]/70 border border-[var(--border-subtle)]">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`btn-tactile flex items-center gap-1.5 px-3.5 py-1.5 rounded-[14px] text-xs font-semibold transition-all duration-180 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--surface)] text-[#3B82F6] dark:text-[#67E8F9] shadow-[var(--shadow-soft-sm)] border border-[var(--border-subtle)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#3B82F6] dark:text-[#67E8F9]' : 'opacity-70'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Floating Controls (Lang, Cur, Theme, Notif, Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setCurrDropdownOpen(false);
                  setThemeDropdownOpen(false);
                  setNotifDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className="btn-tactile flex items-center gap-1 px-2.5 py-1.5 rounded-[14px] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] shadow-[var(--shadow-soft-sm)] cursor-pointer"
                title="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#6EA8FF] dark:text-[#67E8F9]" />
                <span className="text-xs">{LANGUAGES[currentLang].flag}</span>
                <span className="hidden xl:inline text-[11px] font-medium">{LANGUAGES[currentLang].nativeName}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-[20px] bg-[var(--surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-soft-float)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Platform Language
                  </div>
                  {Object.values(LANGUAGES).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onLanguageChange(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`btn-tactile w-full flex items-center justify-between px-2.5 py-2 rounded-[12px] text-xs transition-colors cursor-pointer ${
                        currentLang === l.code
                          ? 'bg-[#6EA8FF]/15 text-[#3B82F6] dark:text-[#67E8F9] font-bold'
                          : 'text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.nativeName}</span>
                      </div>
                      {currentLang === l.code && <Check className="w-3.5 h-3.5 text-[#6EA8FF] dark:text-[#67E8F9]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector with Search */}
            <div className="relative">
              <button
                onClick={() => {
                  setCurrDropdownOpen(!currDropdownOpen);
                  setLangDropdownOpen(false);
                  setThemeDropdownOpen(false);
                  setNotifDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className="btn-tactile flex items-center gap-1.5 px-2.5 py-1.5 rounded-[14px] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] shadow-[var(--shadow-soft-sm)] cursor-pointer"
                title="Select Base Currency"
              >
                <span className="text-xs">{CURRENCY_MAP[currentCurrency].flag}</span>
                <span className="font-semibold">{currentCurrency}</span>
                <span className="text-[11px] font-tabular text-[#6EA8FF] dark:text-[#67E8F9]">
                  {CURRENCY_MAP[currentCurrency].symbol}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {currDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-[22px] bg-[var(--surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-soft-float)] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search currency..."
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      className="input-soft w-full pl-8 pr-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-0.5">
                    {filteredCurrencies.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          onCurrencyChange(c.code);
                          setCurrDropdownOpen(false);
                          setCurrencySearch('');
                        }}
                        className={`btn-tactile w-full flex items-center justify-between px-2.5 py-1.5 rounded-[12px] text-xs transition-colors cursor-pointer ${
                          currentCurrency === c.code
                            ? 'bg-[#6EA8FF]/15 text-[#3B82F6] dark:text-[#67E8F9] font-bold'
                            : 'text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span className="font-semibold">{c.code}</span>
                          <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[85px]">{c.name}</span>
                        </div>
                        <span className="text-xs font-mono font-tabular text-[var(--text-secondary)]">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setThemeDropdownOpen(!themeDropdownOpen);
                  setLangDropdownOpen(false);
                  setCurrDropdownOpen(false);
                  setNotifDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className="btn-tactile p-2 rounded-[14px] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] shadow-[var(--shadow-soft-sm)] text-[var(--text-primary)] cursor-pointer flex items-center justify-center"
                title={`Theme: ${themeMode} (${resolvedTheme})`}
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-4 h-4 text-[#FDE68A]" />
                ) : (
                  <Sun className="w-4 h-4 text-[#F59E0B]" />
                )}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-[20px] bg-[var(--surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-soft-float)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Appearance
                  </div>

                  <button
                    onClick={() => handleThemeSelect('light')}
                    className={`btn-tactile w-full flex items-center justify-between px-2.5 py-2 rounded-[12px] text-xs cursor-pointer ${
                      themeMode === 'light' ? 'bg-amber-500/15 text-amber-600 font-bold' : 'text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light</span>
                    </div>
                    {themeMode === 'light' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>

                  <button
                    onClick={() => handleThemeSelect('dark')}
                    className={`btn-tactile w-full flex items-center justify-between px-2.5 py-2 rounded-[12px] text-xs cursor-pointer ${
                      themeMode === 'dark' ? 'bg-blue-500/15 text-[#67E8F9] font-bold' : 'text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-[#FDE68A]" />
                      <span>Dark</span>
                    </div>
                    {themeMode === 'dark' && <Check className="w-3.5 h-3.5 text-[#67E8F9]" />}
                  </button>

                  <button
                    onClick={() => handleThemeSelect('system')}
                    className={`btn-tactile w-full flex items-center justify-between px-2.5 py-2 rounded-[12px] text-xs cursor-pointer ${
                      themeMode === 'system' ? 'bg-emerald-500/15 text-emerald-600 font-bold' : 'text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-slate-400" />
                      <span>System</span>
                    </div>
                    {themeMode === 'system' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setLangDropdownOpen(false);
                  setCurrDropdownOpen(false);
                  setThemeDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className="btn-tactile relative p-2 rounded-[14px] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] shadow-[var(--shadow-soft-sm)] text-[var(--text-primary)] cursor-pointer"
                title="Alerts & Updates"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-[22px] bg-[var(--surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-soft-float)] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)]">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Market Alerts & Updates
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[10px] font-semibold text-[#6EA8FF] dark:text-[#67E8F9] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-[14px] border transition-colors ${
                          n.unread
                            ? 'bg-[#6EA8FF]/10 border-[#6EA8FF]/30'
                            : 'bg-[var(--surface-subtle)] border-[var(--border-subtle)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            {n.title}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                          {n.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Invite & Earn CTA */}
            <button
              onClick={() => onOpenReferral?.()}
              className="btn-tactile hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-gradient-to-r from-[#67E8F9]/15 to-[#6EA8FF]/15 hover:from-[#67E8F9]/25 hover:to-[#6EA8FF]/25 border border-[#67E8F9]/30 text-[#0284C7] dark:text-[#67E8F9] shadow-[var(--shadow-soft-sm)] cursor-pointer"
              title="Invite Members & Unlock Rewards"
            >
              <Gift className="w-3.5 h-3.5 text-[#06B6D4] dark:text-[#67E8F9]" />
              <span className="text-xs font-bold font-['Outfit']">Invite & Earn</span>
              {currentUser && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[#0284C7] dark:text-[#67E8F9] border border-cyan-500/30 ml-0.5">
                  {currentUser.qualifiedReferralsCount || 0}/12
                </span>
              )}
            </button>

            {/* User Profile / Google Sign In */}
            {!currentUser ? (
              <button
                onClick={() => onOpenAuth?.()}
                className="btn-tactile btn-soft-primary px-3.5 py-1.5 text-xs font-bold cursor-pointer"
              >
                <span>Continue with Google</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setLangDropdownOpen(false);
                    setCurrDropdownOpen(false);
                    setThemeDropdownOpen(false);
                    setNotifDropdownOpen(false);
                  }}
                  className="btn-tactile flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-[14px] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] shadow-[var(--shadow-soft-sm)] cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-[10px] object-cover shadow-inner shrink-0"
                  />
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-bold leading-tight truncate max-w-[90px] text-[var(--text-primary)]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-[#6EA8FF] dark:text-[#67E8F9] font-semibold leading-none truncate max-w-[90px]">
                      {currentUser.membershipType.replace('_', ' ')}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 opacity-60 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-[22px] bg-[var(--surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-soft-float)] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2.5 border-b border-[var(--border-subtle)] mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-[12px] object-cover shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate text-[var(--text-primary)]">
                            {currentUser.name}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] truncate">{currentUser.email}</div>
                          <div className="mt-1">
                            <MembershipBadge type={currentUser.membershipType} size="sm" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <button
                        onClick={() => {
                          onOpenProfile?.();
                          setProfileDropdownOpen(false);
                        }}
                        className="btn-tactile w-full flex items-center gap-2 px-3 py-2 rounded-[12px] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-[#6EA8FF] dark:text-[#67E8F9]" />
                        <span>Member Profile & Rewards</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenReferral?.();
                          setProfileDropdownOpen(false);
                        }}
                        className="btn-tactile w-full flex items-center gap-2 px-3 py-2 rounded-[12px] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] cursor-pointer"
                      >
                        <Gift className="w-3.5 h-3.5 text-[#10B981] dark:text-[#6EE7B7]" />
                        <span>Invite & Earn Program</span>
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onTabChange('admin');
                            setProfileDropdownOpen(false);
                          }}
                          className="btn-tactile w-full flex items-center gap-2 px-3 py-2 rounded-[12px] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-[#C4B5FD]" />
                          <span>Admin Central Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onTabChange('settings');
                          setProfileDropdownOpen(false);
                        }}
                        className="btn-tactile w-full flex items-center gap-2 px-3 py-2 rounded-[12px] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>Preferences & Settings</span>
                      </button>

                      <div className="pt-1.5 mt-1.5 border-t border-[var(--border-subtle)]">
                        <button
                          onClick={() => {
                            onSignOut?.();
                            setProfileDropdownOpen(false);
                          }}
                          className="btn-tactile w-full flex items-center gap-2 px-3 py-2 rounded-[12px] text-rose-500 hover:bg-rose-500/10 cursor-pointer font-semibold"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-tactile lg:hidden p-2 rounded-[14px] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] cursor-pointer"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-[var(--border-subtle)] space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`btn-tactile w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-xs font-semibold cursor-pointer ${
                    isActive
                      ? 'bg-[#6EA8FF]/15 text-[#3B82F6] dark:text-[#67E8F9] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
