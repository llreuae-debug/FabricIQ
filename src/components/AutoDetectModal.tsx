import React from 'react';
import { Sparkles, Globe, Coins, ArrowRight, X } from 'lucide-react';
import type { CurrencyCode, LanguageCode } from '../types';
import { CURRENCY_MAP } from '../services/currencyService';
import { LANGUAGES } from '../services/i18n';

interface AutoDetectModalProps {
  isOpen: boolean;
  detectedCountry: string;
  suggestedCurrency: CurrencyCode;
  suggestedLang: LanguageCode;
  reason: string;
  onConfirm: (currency: CurrencyCode, lang: LanguageCode) => void;
  onClose: () => void;
}

export const AutoDetectModal: React.FC<AutoDetectModalProps> = ({
  isOpen,
  detectedCountry,
  suggestedCurrency,
  suggestedLang,
  reason,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="card-soft-elevated relative w-full max-w-lg rounded-[28px] border border-[var(--border-subtle)] p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="btn-tactile absolute top-4 right-4 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[16px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30 flex items-center justify-center text-[#3B82F6] dark:text-[#67E8F9]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Outfit']">
              Location & Currency Intelligence
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Personalized setup for your textile regional market
            </p>
          </div>
        </div>

        <div className="card-soft-inset p-3.5 text-xs text-[var(--text-secondary)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Detected Hub:</span>
            <span className="font-semibold text-[var(--text-primary)]">{detectedCountry}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Locale Engine Signal:</span>
            <span className="text-[var(--text-secondary)] truncate max-w-[280px]">{reason}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card-soft-inset p-3.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <Globe className="w-3.5 h-3.5 text-[#6EA8FF]" />
              Language
            </div>
            <div className="text-base font-bold text-[var(--text-primary)] flex items-center justify-center gap-1.5">
              <span>{LANGUAGES[suggestedLang].flag}</span>
              <span>{LANGUAGES[suggestedLang].nativeName}</span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">{LANGUAGES[suggestedLang].name}</span>
          </div>

          <div className="card-soft-inset p-3.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
              <Coins className="w-3.5 h-3.5 text-[#6EE7B7]" />
              Base Currency
            </div>
            <div className="text-base font-bold text-[var(--text-primary)] flex items-center justify-center gap-1.5">
              <span>{CURRENCY_MAP[suggestedCurrency].flag}</span>
              <span>{suggestedCurrency} ({CURRENCY_MAP[suggestedCurrency].symbol})</span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">{CURRENCY_MAP[suggestedCurrency].name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => onConfirm(suggestedCurrency, suggestedLang)}
            className="btn-tactile btn-soft-primary flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold shadow-md cursor-pointer"
          >
            <span>Apply Recommended Settings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="btn-tactile btn-soft-secondary py-2.5 px-4 text-xs font-semibold cursor-pointer"
          >
            Keep Default
          </button>
        </div>
      </div>
    </div>
  );
};
