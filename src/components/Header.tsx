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
  BarChart3, 
  Calculator, 
  User, 
  Settings, 
  LogOut,
  ExternalLink,
  Gift
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
  onShowSplash,
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

  // Scroll state for sticky glassmorphism
  const [isScrolled, setIsScrolled] = useState(false);

  // Market telemetry data
  const isOnline = marketRateService.getNetworkStatus();
  const rates = marketRateService.getRates();
  const [liveFX, setLiveFX] = useState(currencyService.getLiveFX());
  const usdPkrRate = liveFX.currentRate || 278.45;
  const cottonRate = rates.find((r) => r.id === 'rate-yarn-20-carded')?.currentRate || 2850;
  const greyRate = rates.find((r) => r.id === 'rate-grey-sheeting-63')?.currentRate || 185.5;

  // Sample Notifications
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

  // Refs for click-outside
  const headerRef = useRef<HTMLDivElement>(null);

  // Subscribe to theme & currency updates
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

  // Listen to scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
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
    { id: 'market_rates', label: 'Market Rates', icon: TrendingUp },
    { id: 'saved_estimates', label: 'Estimates', icon: FileText },
    { id: 'utilities', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? resolvedTheme === 'dark'
            ? 'bg-[#111827]/90 backdrop-blur-md border-b border-[#1F2937] shadow-xl shadow-black/30'
            : 'bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] shadow-md shadow-slate-200/50'
          : resolvedTheme === 'dark'
          ? 'bg-[#111827] border-b border-[#1F2937]'
          : 'bg-white border-b border-[#E5E7EB]'
      }`}
    >
      {/* Top Live Rates Telemetry Ticker */}
      <div
        className={`px-3 py-1.5 text-xs transition-colors border-b ${
          resolvedTheme === 'dark'
            ? 'bg-gradient-to-r from-[#0052ff]/15 via-[#0B1220] to-[#67E8F9]/10 border-[#1F2937] text-slate-300'
            : 'bg-gradient-to-r from-blue-50/80 via-slate-50 to-cyan-50/80 border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase border ${
                resolvedTheme === 'dark'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse" />
              {i18n.t('live_rates_ticker')}
            </span>

            <div className="hidden sm:flex items-center gap-4 text-[11px] overflow-hidden">
              <span className="flex items-center gap-1">
                <span className={resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Cotton Yarn 20s:</span>
                <span className={`font-semibold ${resolvedTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                  ₨ {cottonRate.toLocaleString()} / 10lbs
                </span>
                <span className="text-emerald-500 font-bold">↑ +1.1%</span>
              </span>
              <span className={resolvedTheme === 'dark' ? 'text-slate-700' : 'text-slate-300'}>|</span>
              <span className="flex items-center gap-1">
                <span className={resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Grey Sheeting 63":</span>
                <span className={`font-semibold ${resolvedTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                  ₨ {greyRate.toFixed(2)} / m
                </span>
                <span className="text-emerald-500 font-bold">↑ +1.9%</span>
              </span>
              <span className={resolvedTheme === 'dark' ? 'text-slate-700' : 'text-slate-300'}>|</span>
              <span className="flex items-center gap-1">
                <span className={resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>1 USD =</span>
                <span className={`font-semibold ${resolvedTheme === 'dark' ? 'text-[#67E8F9]' : 'text-blue-600'}`}>
                  ₨ {usdPkrRate.toFixed(2)} PKR
                </span>
                <span className={`text-xs ${resolvedTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  ({currencyService.getLastUpdatedTimestamp().split(',')[0] || 'Today'})
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-[11px]">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <Wifi className="w-3 h-3" />
                <span className="hidden md:inline">{i18n.t('online_status')}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <WifiOff className="w-3 h-3" />
                <span className="hidden md:inline">{i18n.t('offline_status')}</span>
              </span>
            )}

            <button
              onClick={onSync}
              disabled={isSyncing}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-colors disabled:opacity-50 cursor-pointer ${
                resolvedTheme === 'dark'
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700/60 text-slate-200'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
              title="Sync latest live market rates"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#67E8F9]' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-200 ${isScrolled ? 'h-14' : 'h-16'} gap-3`}>
          
          {/* LEFT: FabricIQ Logo & Wordmark */}
          <div 
            onClick={() => onTabChange('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            {/* Logo Icon with Hover Glow */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-[#6EA8FF] via-[#67E8F9] to-[#6EE7B7] opacity-0 group-hover:opacity-75 blur-sm transition-opacity duration-300" />
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white p-0.5 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                <img
                  src={logoImg}
                  alt="FabricIQ"
                  className="w-full h-full object-cover rounded-[8px]"
                />
              </div>
            </div>

            {/* Wordmark: Desktop Shows Full Wordmark, Mobile Shows Icon Only */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-1">
                <span className={`text-xl font-extrabold tracking-tight font-['Outfit'] ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-[#0F172A]'
                }`}>
                  FABRIC
                </span>
                <span className="text-gradient-fiq text-xl font-extrabold font-['Outfit']">
                  IQ
                </span>
                <span className={`ml-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${
                  resolvedTheme === 'dark'
                    ? 'bg-cyan-500/10 text-[#67E8F9] border-cyan-500/30'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  SaaS
                </span>
              </div>
            </div>
          </div>

          {/* CENTER: Navigation Links (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? resolvedTheme === 'dark'
                        ? 'bg-[rgba(103,232,249,0.10)] text-[#67E8F9] border border-cyan-500/30 shadow-[0_0_15px_rgba(103,232,249,0.15)]'
                        : 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] font-bold shadow-sm'
                      : resolvedTheme === 'dark'
                      ? 'text-[#CBD5E1] hover:text-white hover:bg-slate-800/60 border border-transparent'
                      : 'text-[#334155] hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? (resolvedTheme === 'dark' ? 'text-[#67E8F9]' : 'text-[#0284C7]') : 'opacity-70'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Language, Currency, Theme Toggle, Notifications, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* 1. Language Selector 🌐 */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setCurrDropdownOpen(false);
                  setThemeDropdownOpen(false);
                  setNotifDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  resolvedTheme === 'dark'
                    ? 'bg-[#0B1220] hover:bg-slate-800 border-[#1F2937] text-slate-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm'
                }`}
                title="Select Language"
              >
                <Globe className={`w-3.5 h-3.5 ${resolvedTheme === 'dark' ? 'text-[#67E8F9]' : 'text-blue-600'}`} />
                <span className="text-xs">{LANGUAGES[currentLang].flag}</span>
                <span className="hidden xl:inline text-[11px] font-medium">{LANGUAGES[currentLang].nativeName}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {langDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  resolvedTheme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-slate-200'
                }`}>
                  <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Platform Language
                  </div>
                  {Object.values(LANGUAGES).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onLanguageChange(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentLang === l.code
                          ? resolvedTheme === 'dark'
                            ? 'bg-cyan-500/20 text-[#67E8F9] font-bold'
                            : 'bg-blue-50 text-blue-700 font-bold'
                          : resolvedTheme === 'dark'
                          ? 'text-slate-300 hover:bg-slate-800'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.nativeName}</span>
                      </div>
                      {currentLang === l.code && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Currency Selector with Search */}
            <div className="relative">
              <button
                onClick={() => {
                  setCurrDropdownOpen(!currDropdownOpen);
                  setLangDropdownOpen(false);
                  setThemeDropdownOpen(false);
                  setNotifDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  resolvedTheme === 'dark'
                    ? 'bg-[#0B1220] hover:bg-slate-800 border-[#1F2937] text-slate-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm'
                }`}
                title="Select Base Currency"
              >
                <span className="text-xs">{CURRENCY_MAP[currentCurrency].flag}</span>
                <span>{currentCurrency}</span>
                <span className={`text-[11px] ${resolvedTheme === 'dark' ? 'text-[#67E8F9]' : 'text-blue-600'}`}>
                  {CURRENCY_MAP[currentCurrency].symbol}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {currDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  resolvedTheme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-slate-200'
                }`}>
                  {/* Search Input */}
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search currency..."
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      className={`w-full pl-8 pr-2 py-1.5 rounded-lg text-xs focus:outline-none ${
                        resolvedTheme === 'dark'
                          ? 'bg-[#0B1220] text-white placeholder-slate-500 border border-slate-800 focus:border-cyan-500'
                          : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-blue-500'
                      }`}
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
                    {filteredCurrencies.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          onCurrencyChange(c.code);
                          setCurrDropdownOpen(false);
                          setCurrencySearch('');
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                          currentCurrency === c.code
                            ? resolvedTheme === 'dark'
                              ? 'bg-cyan-500/20 text-[#67E8F9] font-bold'
                              : 'bg-blue-50 text-blue-700 font-bold'
                            : resolvedTheme === 'dark'
                            ? 'text-slate-300 hover:bg-slate-800'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span className="font-semibold">{c.code}</span>
                          <span className="text-[11px] opacity-70 truncate max-w-[80px]">{c.name}</span>
                        </div>
                        <span className="text-xs font-mono">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Dark / Light Mode Toggle ☀️ / 🌙 / 💻 */}
            <div className="relative">
              <button
                onClick={() => {
                  setThemeDropdownOpen(!themeDropdownOpen);
                  setLangDropdownOpen(false);
                  setCurrDropdownOpen(false);
                  setNotifDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                  resolvedTheme === 'dark'
                    ? 'bg-[#0B1220] hover:bg-slate-800 border-[#1F2937] text-amber-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-blue-600 shadow-sm'
                }`}
                title={`Current Theme: ${themeMode} (${resolvedTheme})`}
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-4 h-4 text-amber-300 transform rotate-0 transition-transform duration-200" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500 transform rotate-0 transition-transform duration-200" />
                )}
              </button>

              {themeDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-44 rounded-2xl border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  resolvedTheme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-slate-200'
                }`}>
                  <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Theme Appearance
                  </div>

                  <button
                    onClick={() => handleThemeSelect('light')}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-amber-500/15 text-amber-600 font-bold'
                        : resolvedTheme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light Mode</span>
                    </div>
                    {themeMode === 'light' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleThemeSelect('dark')}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      themeMode === 'dark'
                        ? 'bg-blue-500/15 text-[#67E8F9] font-bold'
                        : resolvedTheme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-amber-300" />
                      <span>Dark Mode</span>
                    </div>
                    {themeMode === 'dark' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleThemeSelect('system')}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      themeMode === 'system'
                        ? 'bg-emerald-500/15 text-emerald-500 font-bold'
                        : resolvedTheme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-slate-400" />
                      <span>System Sync</span>
                    </div>
                    {themeMode === 'system' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* 4. Notifications Bell 🔔 */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setLangDropdownOpen(false);
                  setCurrDropdownOpen(false);
                  setThemeDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className={`relative p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
                  resolvedTheme === 'dark'
                    ? 'bg-[#0B1220] hover:bg-slate-800 border-[#1F2937] text-slate-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm'
                }`}
                title="Live Market Alerts & Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  resolvedTheme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className={`text-xs font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Market Alerts & Updates
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[10px] font-semibold text-cyan-500 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border transition-colors ${
                          n.unread
                            ? resolvedTheme === 'dark'
                              ? 'bg-slate-900/90 border-cyan-500/30'
                              : 'bg-blue-50/70 border-blue-200'
                            : resolvedTheme === 'dark'
                            ? 'bg-slate-900/40 border-slate-800/80'
                            : 'bg-slate-50/60 border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${resolvedTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${resolvedTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          {n.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4.5 Invite & Earn Button with Gift Icon */}
            <button
              onClick={() => onOpenReferral?.()}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                resolvedTheme === 'dark'
                  ? 'bg-gradient-to-r from-cyan-950/40 to-blue-950/40 hover:bg-slate-800 border-cyan-500/30 text-cyan-300'
                  : 'bg-gradient-to-r from-cyan-50 to-blue-50 hover:bg-blue-100/50 border-cyan-300 text-blue-700 shadow-sm'
              }`}
              title="Invite Members & Unlock Rewards"
            >
              <Gift className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              <span className="text-xs font-extrabold font-['Outfit']">Invite & Earn</span>
              {currentUser && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 ml-0.5">
                  {currentUser.qualifiedReferralsCount || 0}/12
                </span>
              )}
            </button>

            {/* 5. User Profile Menu or Sign In */}
            {!currentUser ? (
              <button
                onClick={() => onOpenAuth?.()}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
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
                  className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                    resolvedTheme === 'dark'
                      ? 'bg-[#0B1220] hover:bg-slate-800 border-[#1F2937] text-slate-200'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover shadow-inner shrink-0"
                  />
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-bold leading-tight truncate max-w-[90px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-cyan-500 font-semibold leading-none truncate max-w-[90px]">
                      {currentUser.membershipType.replace('_', ' ')}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 opacity-60 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    resolvedTheme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-slate-200'
                  }`}>
                    <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-xl object-cover shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-bold truncate ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {currentUser.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
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
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                          resolvedTheme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <User className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Member Profile & Rewards</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenReferral?.();
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                          resolvedTheme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Invite & Earn Program</span>
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onTabChange('admin');
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                            resolvedTheme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Settings className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Admin Central Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onTabChange('settings');
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                          resolvedTheme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Preferences & Settings</span>
                      </button>

                      {onShowSplash && (
                        <button
                          onClick={() => {
                            onShowSplash();
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                            resolvedTheme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Replay Brand Intro</span>
                        </button>
                      )}

                      <div className="pt-1 mt-1 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => {
                            onSignOut?.();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. Mobile Hamburger Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  resolvedTheme === 'dark'
                    ? 'bg-[#0B1220] hover:bg-slate-800 border-[#1F2937] text-slate-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                }`}
                title="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Clean Full-Width Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className={`lg:hidden py-4 border-t transition-all animate-in slide-in-from-top-2 duration-200 space-y-4 ${
            resolvedTheme === 'dark' ? 'border-[#1F2937] bg-[#111827]' : 'border-slate-200 bg-white'
          }`}>
            <div className="grid grid-cols-1 gap-1">
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
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? resolvedTheme === 'dark'
                          ? 'bg-cyan-500/15 text-[#67E8F9] font-bold border border-cyan-500/30'
                          : 'bg-[#E0F2FE] text-[#0284C7] font-bold border border-[#BAE6FD]'
                        : resolvedTheme === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800/80'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Mobile Settings Row */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-2 text-xs">
              <span className="text-slate-400">Current Theme: <strong className="capitalize text-slate-200 dark:text-white">{themeMode}</strong></span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleThemeSelect('light')}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                    themeMode === 'light' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleThemeSelect('dark')}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                    themeMode === 'dark' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleThemeSelect('system')}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                    themeMode === 'system' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
