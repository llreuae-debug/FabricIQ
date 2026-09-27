// FabricIQ AdSense & Advertising Management Service
// Separate configuration layer strictly isolated from the costing engine

export interface AdConsentSettings {
  essential: boolean;     // Always true (session, security, preferences)
  analytics: boolean;     // Anonymous performance & calculation telemetry
  advertising: boolean;   // Google AdSense / Publisher tags
  personalized: boolean; // Personalized vs contextual ads
  timestamp: string;      // ISO date when consent was recorded
}

export interface AdSlotConfig {
  headerBanner: string;
  sidebarSquare: string;
  inArticle: string;
  footerBanner: string;
  marketSidebar: string;
}

export interface AdSettings {
  provider: 'google_adsense' | 'custom' | 'none';
  publisherId: string;    // e.g. 'ca-pub-XXXXXXXXXXXXXXXX'
  enabled: boolean;
  testMode: boolean;
  slots: AdSlotConfig;
  mobileDensity: 'low' | 'standard' | 'high';
  showAdLabels: boolean;
}

const STORAGE_KEY_SETTINGS = 'fabriciq_ad_settings_v1';
const STORAGE_KEY_CONSENT = 'fabriciq_ad_consent_v1';

const DEFAULT_SLOTS: AdSlotConfig = {
  headerBanner: '1029384756',
  sidebarSquare: '2938475610',
  inArticle: '3847561029',
  footerBanner: '4756102938',
  marketSidebar: '5610293847',
};

const DEFAULT_SETTINGS: AdSettings = {
  provider: 'google_adsense',
  publisherId: 'ca-pub-9847291847291847', // Placeholder publisher ID for AdSense review readiness
  enabled: true,
  testMode: true, // Defaults to test mode with clean badges until live credentials supplied
  slots: DEFAULT_SLOTS,
  mobileDensity: 'standard',
  showAdLabels: true,
};

type AdListener = (settings: AdSettings, consent: AdConsentSettings | null) => void;

class AdService {
  private settings: AdSettings;
  private consent: AdConsentSettings | null = null;
  private listeners: Set<AdListener> = new Set();
  private scriptLoaded = false;

  constructor() {
    this.settings = this.loadSettings();
    this.consent = this.loadConsent();
    this.initAdSenseScript();
  }

  private loadSettings(): AdSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Error loading ad settings:', e);
    }
    return DEFAULT_SETTINGS;
  }

  private loadConsent(): AdConsentSettings | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONSENT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error loading ad consent:', e);
    }
    return null;
  }

  public getSettings(): AdSettings {
    return { ...this.settings };
  }

  public getConsent(): AdConsentSettings | null {
    return this.consent ? { ...this.consent } : null;
  }

  public hasUserConsented(): boolean {
    return this.consent !== null;
  }

  public isAdvertisingAllowed(): boolean {
    if (!this.settings.enabled) return false;
    // Essential or test mode always allows placeholder display; real ad tags require advertising consent
    if (this.settings.testMode) return true;
    return !!(this.consent && this.consent.advertising);
  }

  public updateSettings(newSettings: Partial<AdSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(this.settings));
    this.initAdSenseScript();
    this.notifyListeners();
  }

  public saveConsent(settings: { analytics: boolean; advertising: boolean; personalized: boolean }): void {
    const fullConsent: AdConsentSettings = {
      essential: true,
      analytics: settings.analytics,
      advertising: settings.advertising,
      personalized: settings.personalized,
      timestamp: new Date().toISOString(),
    };
    this.consent = fullConsent;
    localStorage.setItem(STORAGE_KEY_CONSENT, JSON.stringify(fullConsent));
    this.initAdSenseScript();
    this.notifyListeners();
  }

  public acceptAllConsent(): void {
    this.saveConsent({ analytics: true, advertising: true, personalized: true });
  }

  public rejectNonEssentialConsent(): void {
    this.saveConsent({ analytics: false, advertising: false, personalized: false });
  }

  public resetConsent(): void {
    this.consent = null;
    localStorage.removeItem(STORAGE_KEY_CONSENT);
    this.notifyListeners();
  }

  private initAdSenseScript(): void {
    if (typeof window === 'undefined') return;

    // Only inject Google AdSense script if real production ads are enabled and consent is granted
    if (!this.settings.testMode && this.settings.enabled && this.isAdvertisingAllowed() && this.settings.publisherId) {
      if (!this.scriptLoaded && !document.getElementById('adsbygoogle-script')) {
        const script = document.createElement('script');
        script.id = 'adsbygoogle-script';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.settings.publisherId}`;
        document.head.appendChild(script);
        this.scriptLoaded = true;
      }
    }
  }

  public subscribe(listener: AdListener): () => void {
    this.listeners.add(listener);
    listener(this.settings, this.consent);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.settings, this.consent);
      } catch (e) {
        console.error('Error notifying ad service listener:', e);
      }
    });
  }
}

export const adService = new AdService();
