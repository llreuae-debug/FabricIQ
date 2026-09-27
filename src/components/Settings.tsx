import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Coins, 
  Database, 
  RefreshCw, 
  Trash2, 
  Check, 
  ShieldCheck
} from 'lucide-react';
import type { CurrencyCode, LanguageCode } from '../types';
import { CURRENCY_MAP } from '../services/currencyService';
import { LANGUAGES, i18n } from '../services/i18n';
import { marketRateService } from '../services/marketRateService';

interface SettingsProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentCurrency: CurrencyCode;
  onCurrencyChange: (cur: CurrencyCode) => void;
  onSync: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  currentLang,
  onLanguageChange,
  currentCurrency,
  onCurrencyChange,
  onSync,
}) => {
  const [notice, setNotice] = useState('');

  const handleResetFactory = () => {
    if (window.confirm('Reset all market rates, suppliers, and cache to verified factory benchmarks?')) {
      marketRateService.resetToFactoryRates();
      setNotice('Reset to factory benchmark rates completed.');
      setTimeout(() => setNotice(''), 3000);
    }
  };

  const handleClearCache = () => {
    try {
      localStorage.clear();
      setNotice('Offline local storage cache cleared.');
      setTimeout(() => setNotice(''), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <SettingsIcon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit']">
            {i18n.t('settings_title')}
          </h2>
          <p className="text-xs text-slate-400">
            Configure currency conversion, language & RTL preferences, and offline synchronization
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Language Settings */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>{i18n.t('settings_language')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(LANGUAGES).map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                currentLang === lang.code
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="text-base mb-1">{lang.flag}</div>
              <div className="text-xs font-bold">{lang.nativeName}</div>
              <div className="text-[10px] opacity-75">{lang.name} ({lang.dir.toUpperCase()})</div>
            </button>
          ))}
        </div>
      </div>

      {/* Currency Settings */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-400" />
          <span>{i18n.t('settings_currency')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(CURRENCY_MAP).map((cur) => (
            <button
              key={cur.code}
              onClick={() => onCurrencyChange(cur.code)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                currentCurrency === cur.code
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="text-base mb-1">{cur.flag}</div>
              <div className="text-xs font-bold">{cur.code} ({cur.symbol})</div>
              <div className="text-[10px] opacity-75">{cur.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Offline Storage */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>{i18n.t('settings_offline_cache')}</span>
        </h3>

        <p className="text-xs text-slate-400">
          TexCost stores all verified benchmark rates and customer quotation calculations locally in browser storage so the calculator remains 100% operational in offline factory environments.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onSync}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{i18n.t('sync_now_btn')}</span>
          </button>

          <button
            onClick={handleResetFactory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restore Factory Verified Benchmarks</span>
          </button>

          <button
            onClick={handleClearCache}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{i18n.t('clear_cache_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
