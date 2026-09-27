import type { CurrencyCode, CurrencyConfig } from '../types';

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyConfig> = {
  PKR: {
    code: 'PKR',
    name: 'Pakistani Rupee',
    symbol: '₨',
    rateAgainstUSD: 279.50,
    flag: '🇵🇰',
    decimals: 2,
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rateAgainstUSD: 1.0,
    flag: '🇺🇸',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    rateAgainstUSD: 0.92,
    flag: '🇪🇺',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    rateAgainstUSD: 0.79,
    flag: '🇬🇧',
    decimals: 2,
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    rateAgainstUSD: 3.6725,
    flag: '🇦🇪',
    decimals: 2,
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: '﷼',
    rateAgainstUSD: 3.75,
    flag: '🇸🇦',
    decimals: 2,
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    rateAgainstUSD: 7.23,
    flag: '🇨🇳',
    decimals: 2,
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    rateAgainstUSD: 83.45,
    flag: '🇮🇳',
    decimals: 2,
  },
  TRY: {
    code: 'TRY',
    name: 'Turkish Lira',
    symbol: '₺',
    rateAgainstUSD: 34.15,
    flag: '🇹🇷',
    decimals: 2,
  },
};

const STORAGE_KEY_CURRENCY = 'texcost_preferred_currency';
const STORAGE_KEY_EXCHANGE_RATES = 'texcost_custom_exchange_rates';
const STORAGE_KEY_EXCHANGE_TIMESTAMP = 'texcost_exchange_rates_timestamp';

export class CurrencyService {
  private currentCurrency: CurrencyCode = 'PKR';
  private customRates: Record<CurrencyCode, number> = {} as any;
  private lastUpdated: string = '2026-09-27 10:00 AM UTC';

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedCur = localStorage.getItem(STORAGE_KEY_CURRENCY);
      if (savedCur && savedCur in CURRENCY_MAP) {
        this.currentCurrency = savedCur as CurrencyCode;
      }

      const savedRates = localStorage.getItem(STORAGE_KEY_EXCHANGE_RATES);
      if (savedRates) {
        this.customRates = JSON.parse(savedRates);
      }

      const savedTime = localStorage.getItem(STORAGE_KEY_EXCHANGE_TIMESTAMP);
      if (savedTime) {
        this.lastUpdated = savedTime;
      }
    } catch {
      // ignore
    }
  }

  public detectInitialCurrency(): { suggestedCurrency: CurrencyCode; detectedCountry: string; reason: string } {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const languages = navigator.languages || [navigator.language || ''];
      const langStr = languages.join(',').toLowerCase();

      if (timeZone.includes('Karachi') || langStr.includes('ur') || langStr.includes('pk')) {
        return { suggestedCurrency: 'PKR', detectedCountry: 'Pakistan', reason: 'Detected Asia/Karachi Timezone / Urdu' };
      }
      if (timeZone.includes('Istanbul') || langStr.includes('tr')) {
        return { suggestedCurrency: 'TRY', detectedCountry: 'Turkey', reason: 'Detected Europe/Istanbul Timezone / Turkish' };
      }
      if (timeZone.includes('London') || langStr.includes('en-gb')) {
        return { suggestedCurrency: 'GBP', detectedCountry: 'United Kingdom', reason: 'Detected Europe/London / British English' };
      }
      if (timeZone.includes('Dubai') || timeZone.includes('Abu_Dhabi') || langStr.includes('ae')) {
        return { suggestedCurrency: 'AED', detectedCountry: 'United Arab Emirates', reason: 'Detected UAE Timezone' };
      }
      if (timeZone.includes('Riyadh') || langStr.includes('sa')) {
        return { suggestedCurrency: 'SAR', detectedCountry: 'Saudi Arabia', reason: 'Detected Saudi Timezone' };
      }
      if (timeZone.includes('Shanghai') || langStr.includes('zh') || langStr.includes('cn')) {
        return { suggestedCurrency: 'CNY', detectedCountry: 'China', reason: 'Detected Asia/Shanghai / Chinese' };
      }
      if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || langStr.includes('in') || langStr.includes('hi')) {
        return { suggestedCurrency: 'INR', detectedCountry: 'India', reason: 'Detected Asia/Kolkata / India' };
      }
      if (timeZone.includes('Berlin') || timeZone.includes('Paris') || timeZone.includes('Rome') || timeZone.includes('Madrid')) {
        return { suggestedCurrency: 'EUR', detectedCountry: 'European Union', reason: 'Detected EU Timezone' };
      }
      if (timeZone.includes('New_York') || timeZone.includes('Chicago') || timeZone.includes('Los_Angeles') || timeZone.includes('Denver')) {
        return { suggestedCurrency: 'USD', detectedCountry: 'United States', reason: 'Detected US Timezone' };
      }
    } catch {
      // fallback
    }

    return { suggestedCurrency: 'PKR', detectedCountry: 'Global (Textile Hub)', reason: 'Default Textile Regional Hub' };
  }

  public getCurrency(): CurrencyCode {
    return this.currentCurrency;
  }

  public setCurrency(code: CurrencyCode): void {
    if (code in CURRENCY_MAP) {
      this.currentCurrency = code;
      try {
        localStorage.setItem(STORAGE_KEY_CURRENCY, code);
      } catch {
        // ignore
      }
    }
  }

  public getRateAgainstUSD(code: CurrencyCode): number {
    if (this.customRates && this.customRates[code]) {
      return this.customRates[code];
    }
    return CURRENCY_MAP[code]?.rateAgainstUSD || 1.0;
  }

  public setCustomRate(code: CurrencyCode, rate: number): void {
    if (rate > 0) {
      this.customRates[code] = rate;
      this.lastUpdated = new Date().toLocaleString();
      try {
        localStorage.setItem(STORAGE_KEY_EXCHANGE_RATES, JSON.stringify(this.customRates));
        localStorage.setItem(STORAGE_KEY_EXCHANGE_TIMESTAMP, this.lastUpdated);
      } catch {
        // ignore
      }
    }
  }

  public convert(amount: number, from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return amount;
    const fromRate = this.getRateAgainstUSD(from);
    const toRate = this.getRateAgainstUSD(to);
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  }

  public format(amount: number, currency?: CurrencyCode, decimals?: number): string {
    const targetCur = currency || this.currentCurrency;
    const config = CURRENCY_MAP[targetCur];
    const dec = decimals !== undefined ? decimals : config.decimals;
    const formattedNum = (amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    });
    return `${config.symbol} ${formattedNum}`;
  }

  public getLastUpdatedTimestamp(): string {
    return this.lastUpdated;
  }
}

export const currencyService = new CurrencyService();
