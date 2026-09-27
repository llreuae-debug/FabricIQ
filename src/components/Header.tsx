import React, { useState } from 'react';
import { 
  Globe, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ChevronDown, 
  Check,
  Sparkles
} from 'lucide-react';
import type { CurrencyCode, LanguageCode } from '../types';
import { CURRENCY_MAP, currencyService } from '../services/currencyService';
import { LANGUAGES, i18n } from '../services/i18n';
import { marketRateService } from '../services/marketRateService';
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
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currDropdownOpen, setCurrDropdownOpen] = useState(false);
  const isOnline = marketRateService.getNetworkStatus();
  const rates = marketRateService.getRates();

  const usdPkrRate = rates.find((r) => r.id === 'rate-forex-usd-pkr')?.currentRate || 279.5;
  const cottonRate = rates.find((r) => r.id === 'rate-yarn-20-carded')?.currentRate || 2850;
  const greyRate = rates.find((r) => r.id === 'rate-grey-sheeting-63')?.currentRate || 185.5;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#040814]/90 backdrop-blur-xl transition-all shadow-xl shadow-black/30">
      {/* Top Live Rates Ticker */}
      <div className="bg-gradient-to-r from-[#0052ff]/20 via-[#040814] to-[#00d2ff]/15 border-b border-slate-800/60 px-3 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px] tracking-wider uppercase border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-pulse" />
              {i18n.t('live_rates_ticker')}
            </span>
            <div className="hidden sm:flex items-center gap-4 text-[11px] overflow-hidden">
              <span className="flex items-center gap-1">
                <span className="text-slate-400">Cotton Yarn 20s:</span>
                <span className="font-semibold text-slate-100">₨ {cottonRate.toLocaleString()} / 10lbs</span>
                <span className="text-emerald-400 font-medium">↑ +1.1%</span>
              </span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center gap-1">
                <span className="text-slate-400">Grey Sheeting 63":</span>
                <span className="font-semibold text-slate-100">₨ {greyRate.toFixed(2)} / m</span>
                <span className="text-emerald-400 font-medium">↑ +1.9%</span>
              </span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center gap-1">
                <span className="text-slate-400">1 USD =</span>
                <span className="font-semibold text-cyan-300">₨ {usdPkrRate.toFixed(2)} PKR</span>
                <span className="text-xs text-slate-400">({currencyService.getLastUpdatedTimestamp().split(',')[0] || 'Today'})</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-[11px]">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Wifi className="w-3 h-3" />
                <span className="hidden md:inline">{i18n.t('online_status')}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <WifiOff className="w-3 h-3" />
                <span className="hidden md:inline">{i18n.t('offline_status')}</span>
              </span>
            )}

            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-[11px] font-medium transition-colors disabled:opacity-50"
              title="Sync latest live market rates"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Global Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => onTabChange('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Glowing Logo Icon */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-[#0052ff] via-[#00d2ff] to-[#10b981] opacity-60 blur-sm group-hover:opacity-100 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white p-0.5 shadow-md flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <img
                  src={logoImg}
                  alt="FabricIQ Logo"
                  className="w-full h-full object-cover rounded-[8px]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-extrabold tracking-tight font-['Outfit']">
                  <span className="text-white">FABRIC</span>
                  <span className="text-gradient-fiq">IQ</span>
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-gradient-to-r from-blue-600/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/30">
                  AI & LIVE
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium hidden sm:block">
                Smart Textile Costing • Live Market Intelligence
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 shadow-inner">
            {[
              { id: 'dashboard', label: i18n.t('nav_dashboard') },
              { id: 'calculator', label: i18n.t('nav_calculator') },
              { id: 'market_rates', label: i18n.t('nav_market_rates') },
              { id: 'saved_estimates', label: i18n.t('nav_saved_estimates') },
              { id: 'utilities', label: i18n.t('nav_utilities') },
              { id: 'admin', label: i18n.t('nav_admin') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#0052ff] to-[#00a8ff] text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Controls: Intro Splash, Currency Switcher & Language Switcher */}
          <div className="flex items-center gap-2">
            {onShowSplash && (
              <button
                onClick={onShowSplash}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
                title="Replay FabricIQ starting animation"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px]">Intro</span>
              </button>
            )}

            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setCurrDropdownOpen(!currDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <span className="text-sm">{CURRENCY_MAP[currentCurrency].flag}</span>
                <span>{currentCurrency}</span>
                <span className="text-cyan-400">{CURRENCY_MAP[currentCurrency].symbol}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {currDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Currency
                  </div>
                  {Object.values(CURRENCY_MAP).map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        onCurrencyChange(c.code);
                        setCurrDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        currentCurrency === c.code
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.code}</span>
                      </div>
                      <span className="text-xs opacity-75">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setCurrDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{LANGUAGES[currentLang].flag}</span>
                <span className="hidden sm:inline">{LANGUAGES[currentLang].nativeName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Language
                  </div>
                  {Object.values(LANGUAGES).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onLanguageChange(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        currentLang === l.code
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.nativeName}</span>
                      </div>
                      {currentLang === l.code && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-900 scrollbar-none">
          {[
            { id: 'dashboard', label: i18n.t('nav_dashboard') },
            { id: 'calculator', label: i18n.t('nav_calculator') },
            { id: 'market_rates', label: i18n.t('nav_market_rates') },
            { id: 'saved_estimates', label: i18n.t('nav_saved_estimates') },
            { id: 'utilities', label: i18n.t('nav_utilities') },
            { id: 'admin', label: i18n.t('nav_admin') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'text-slate-400 bg-slate-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
