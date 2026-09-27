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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl shadow-indigo-500/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Location & Currency Intelligence
            </h3>
            <p className="text-xs text-indigo-300">
              Personalized setup for your textile regional market
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 mb-5 text-xs text-slate-300 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Detected Hub:</span>
            <span className="font-semibold text-white">{detectedCountry}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Locale Engine Signal:</span>
            <span className="text-slate-300">{reason}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              Language
            </div>
            <div className="text-base font-bold text-white flex items-center justify-center gap-1.5">
              <span>{LANGUAGES[suggestedLang].flag}</span>
              <span>{LANGUAGES[suggestedLang].nativeName}</span>
            </div>
            <span className="text-[11px] text-slate-400">{LANGUAGES[suggestedLang].name}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              Base Currency
            </div>
            <div className="text-base font-bold text-white flex items-center justify-center gap-1.5">
              <span>{CURRENCY_MAP[suggestedCurrency].flag}</span>
              <span>{suggestedCurrency} ({CURRENCY_MAP[suggestedCurrency].symbol})</span>
            </div>
            <span className="text-[11px] text-slate-400">{CURRENCY_MAP[suggestedCurrency].name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onConfirm(suggestedCurrency, suggestedLang)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            <span>Apply Recommended Settings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
          >
            Custom
          </button>
        </div>
      </div>
    </div>
  );
};
