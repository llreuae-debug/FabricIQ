import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Coins, 
  Database, 
  RefreshCw, 
  Trash2, 
  Check
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
      
      {/* 1. Header Card */}
      <div className="card-soft-lg p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-subtle)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-[12px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30 flex items-center justify-center text-[#3B82F6] dark:text-[#67E8F9]">
          <SettingsIcon className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-['Outfit']">
            {i18n.t('settings_title')}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Configure currency conversion, language & RTL preferences, and offline synchronization.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-[16px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. Language Settings */}
      <div className="card-soft p-6 space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#6EA8FF]" />
          <span>{i18n.t('settings_language')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(LANGUAGES).map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`btn-tactile p-3.5 rounded-[16px] border text-left cursor-pointer ${
                currentLang === lang.code
                  ? 'bg-[#6EA8FF]/20 text-[#3B82F6] dark:text-[#67E8F9] border-[#6EA8FF]/40 font-bold shadow-sm'
                  : 'bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="text-base mb-1">{lang.flag}</div>
              <div className="text-xs font-bold">{lang.nativeName}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{lang.name} ({lang.dir.toUpperCase()})</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Currency Settings */}
      <div className="card-soft p-6 space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Coins className="w-4 h-4 text-[#6EE7B7]" />
          <span>{i18n.t('settings_currency')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(CURRENCY_MAP).map((c) => (
            <button
              key={c.code}
              onClick={() => onCurrencyChange(c.code)}
              className={`btn-tactile p-3 rounded-[16px] border text-left cursor-pointer ${
                currentCurrency === c.code
                  ? 'bg-[#6EE7B7]/20 text-[#059669] dark:text-[#6EE7B7] border-[#6EE7B7]/40 font-bold shadow-sm'
                  : 'bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{c.flag}</span>
                <span className="font-mono font-bold text-xs">{c.symbol}</span>
              </div>
              <div className="text-xs font-bold mt-1">{c.code}</div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">{c.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Data & Sync Management */}
      <div className="card-soft p-6 space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Database className="w-4 h-4 text-[#C4B5FD]" />
          <span>Data Storage & Benchmark Resets</span>
        </h3>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] gap-3">
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Sync Market Intelligence</div>
              <div className="text-[11px] text-[var(--text-secondary)]">Force-synchronize all commodities and exchange rates</div>
            </div>
            <button
              onClick={onSync}
              className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Now</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] gap-3">
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Reset to Factory Benchmarks</div>
              <div className="text-[11px] text-[var(--text-secondary)]">Restore default verified rates and suppliers</div>
            </div>
            <button
              onClick={handleResetFactory}
              className="btn-tactile btn-soft-secondary px-4 py-2 text-xs font-semibold cursor-pointer self-start sm:self-auto"
            >
              Reset Benchmarks
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] gap-3">
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Clear Offline Storage Cache</div>
              <div className="text-[11px] text-[var(--text-secondary)]">Purge temporary browser state and reload clean cache</div>
            </div>
            <button
              onClick={handleClearCache}
              className="btn-tactile p-2 rounded-[12px] text-rose-500 hover:bg-rose-500/10 cursor-pointer self-start sm:self-auto"
              title="Clear Local Storage"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
