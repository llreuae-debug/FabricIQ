import { useState, useEffect } from 'react';
import type { CurrencyCode, LanguageCode, SavedEstimate, User } from './types';
import { currencyService } from './services/currencyService';
import { i18n, LANGUAGES } from './services/i18n';
import { marketRateService } from './services/marketRateService';
import { authService } from './services/authService';
import { referralService, type MilestoneNotification } from './services/referralService';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Calculator } from './components/Calculator';
import { MarketRates } from './components/MarketRates';
import { SavedEstimates } from './components/SavedEstimates';
import { TextileTools } from './components/TextileTools';
import { TextileReferenceLibrary } from './components/TextileReferenceLibrary';
import { BOQCalculator } from './components/BOQCalculator';
import { AdminPanel } from './components/AdminPanel';
import { Settings } from './components/Settings';
import { AutoDetectModal } from './components/AutoDetectModal';
import { SplashScreen } from './components/SplashScreen';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { ReferralModal } from './components/ReferralModal';
import { UserProfileModal } from './components/UserProfileModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { PublicPages, type PublicPageView } from './components/PublicPages';
import { ConsentBanner } from './components/ConsentBanner';
import { seoService } from './services/seoService';
import { ShieldCheck, Sparkles, X, Gift } from 'lucide-react';
import logoImg from './assets/logo.png';

export function App() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(i18n.getLanguage());
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>(currencyService.getCurrency());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Authentication & Membership State
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [referralModalOpen, setReferralModalOpen] = useState<boolean>(false);

  // Celebration Milestone Notification Banner
  const [celebrationNotif, setCelebrationNotif] = useState<MilestoneNotification | null>(null);

  // Auto-detect modal state on initial launch
  const [autoDetectOpen, setAutoDetectOpen] = useState<boolean>(false);
  const [detectedCountry, setDetectedCountry] = useState<string>('');
  const [suggestedCurrency, setSuggestedCurrency] = useState<CurrencyCode>('PKR');
  const [suggestedLang, setSuggestedLang] = useState<LanguageCode>('ur');
  const [detectReason, setDetectReason] = useState<string>('');

  // Preload state for calculator navigation
  const [calculatorPresetId, setCalculatorPresetId] = useState<string | undefined>();
  const [toolsActiveId, setToolsActiveId] = useState<string | undefined>();
  const [boqInitialRefNo, setBoqInitialRefNo] = useState<string | undefined>();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubAuth = authService.subscribe((u) => {
      setCurrentUser(u);
    });

    // Subscribe to milestone celebration notifications
    const unsubNotif = referralService.subscribeNotifications((notif) => {
      setCelebrationNotif(notif);
    });

    // Check URL parameters for referral code
    const refCode = referralService.captureFromUrl();
    if (refCode && !authService.getCurrentUser()) {
      // Prompt sign in if user came through a referral link
      setAuthModalOpen(true);
    }

    const hasSeenModal = localStorage.getItem('fabriciq_has_seen_detect_v2');
    if (!hasSeenModal) {
      const curDetect = currencyService.detectInitialCurrency();
      const langDetect = i18n.detectInitialLanguage();

      setDetectedCountry(curDetect.detectedCountry);
      setSuggestedCurrency(curDetect.suggestedCurrency);
      setSuggestedLang(langDetect.suggestedLang);
      setDetectReason(`${curDetect.reason} • ${langDetect.reason}`);
    }

    const config = LANGUAGES[currentLang];
    document.documentElement.setAttribute('dir', config.dir);
    document.documentElement.setAttribute('lang', config.code);

    return () => {
      unsubAuth();
      unsubNotif();
    };
  }, [currentLang]);

  // Synchronize dynamic SEO, Open Graph, Canonical, and Schema.org metadata
  useEffect(() => {
    seoService.updatePageMetadata(activeTab);
  }, [activeTab]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    const hasSeenModal = localStorage.getItem('fabriciq_has_seen_detect_v2');
    if (!hasSeenModal) {
      setAutoDetectOpen(true);
    }
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    i18n.setLanguage(lang);
    setCurrentLang(lang);
  };

  const handleCurrencyChange = (cur: CurrencyCode) => {
    currencyService.setCurrency(cur);
    setCurrentCurrency(cur);
  };

  const handleConfirmAutoDetect = (cur: CurrencyCode, lang: LanguageCode) => {
    handleCurrencyChange(cur);
    handleLanguageChange(lang);
    localStorage.setItem('fabriciq_has_seen_detect_v2', 'true');
    setAutoDetectOpen(false);
  };

  const handleDismissAutoDetect = () => {
    localStorage.setItem('fabriciq_has_seen_detect_v2', 'true');
    setAutoDetectOpen(false);
  };

  const handleSyncMarketRates = () => {
    setIsSyncing(true);
    setTimeout(() => {
      marketRateService.syncLiveMarketData();
      setIsSyncing(false);
    }, 600);
  };

  const handleNavigateToCalculator = (presetId?: string) => {
    setCalculatorPresetId(presetId);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToTools = (toolId?: string) => {
    setToolsActiveId(toolId);
    setActiveTab('utilities');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEstimateInCalc = (_estimate: SavedEstimate) => {
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#0052ff] selection:text-white transition-colors duration-200">
      {/* Starting Splash Screen & Logo Animation */}
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {/* Auto-detect country & currency modal */}
      {!showSplash && (
        <AutoDetectModal
          isOpen={autoDetectOpen}
          detectedCountry={detectedCountry}
          suggestedCurrency={suggestedCurrency}
          suggestedLang={suggestedLang}
          reason={detectReason}
          onConfirm={handleConfirmAutoDetect}
          onClose={handleDismissAutoDetect}
        />
      )}

      {/* Google OAuth & Auth Modal */}
      <GoogleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(_u) => {
          setAuthModalOpen(false);
        }}
      />

      {/* User Profile & Membership Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={currentUser}
        onSignOut={() => authService.signOut()}
        onOpenReferral={() => setReferralModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Referral Rewards Modal */}
      <ReferralModal
        isOpen={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Milestone Celebration Banner */}
      {celebrationNotif && (
        <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 text-slate-950 px-4 py-3 shadow-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold animate-in slide-in-from-top duration-300 z-50">
          <div className="max-w-7xl mx-auto flex items-center gap-2.5 flex-1">
            <Sparkles className="w-5 h-5 shrink-0 text-white animate-spin" />
            <div className="text-white">
              <span className="font-extrabold font-['Outfit']">{celebrationNotif.title}</span>
              <span className="mx-2 hidden sm:inline">•</span>
              <span className="font-medium text-blue-50 text-xs">{celebrationNotif.message}</span>
            </div>
            <button
              onClick={() => {
                setCelebrationNotif(null);
                setReferralModalOpen(true);
              }}
              className="ml-auto px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 text-cyan-300 text-xs font-extrabold shadow-md shrink-0 cursor-pointer"
            >
              View Rewards →
            </button>
          </div>
          <button
            onClick={() => setCelebrationNotif(null)}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-black/10 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        currentCurrency={currentCurrency}
        onCurrencyChange={handleCurrencyChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSync={handleSyncMarketRates}
        isSyncing={isSyncing}
        onShowSplash={() => setShowSplash(true)}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenReferral={() => setReferralModalOpen(true)}
        onSignOut={() => authService.signOut()}
      />

      {/* PWA Install Banner & Offline Connectivity Alert */}
      <PwaInstallPrompt />

      {/* Main Application Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            currentCurrency={currentCurrency}
            onNavigateToCalculator={handleNavigateToCalculator}
            onNavigateToSavedEstimates={() => setActiveTab('saved_estimates')}
            onNavigateToMarketRates={() => setActiveTab('market_rates')}
            onNavigateToTools={handleNavigateToTools}
            onNavigateToReferenceLibrary={() => {
              setActiveTab('reference_library');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToBOQ={() => {
              setActiveTab('boq_engine');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenReferral={() => setReferralModalOpen(true)}
          />
        )}

        {activeTab === 'calculator' && (
          <Calculator
            currentCurrency={currentCurrency}
            initialPresetId={calculatorPresetId}
            onEstimateSaved={() => setActiveTab('saved_estimates')}
          />
        )}

        {activeTab === 'boq_engine' && (
          <BOQCalculator
            currentCurrency={currentCurrency}
            initialRefNo={boqInitialRefNo}
            onEstimateSaved={() => setActiveTab('saved_estimates')}
          />
        )}

        {activeTab === 'reference_library' && (
          <TextileReferenceLibrary
            currentCurrency={currentCurrency}
            onSelectForBOQ={(refNo) => {
              setBoqInitialRefNo(refNo);
              setActiveTab('boq_engine');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectForCalculator={(refNo) => {
              handleNavigateToCalculator(refNo);
            }}
          />
        )}

        {activeTab === 'market_rates' && (
          <MarketRates
            currentCurrency={currentCurrency}
            onSelectForCalculator={() => {
              setActiveTab('calculator');
            }}
          />
        )}

        {activeTab === 'saved_estimates' && (
          <SavedEstimates
            currentCurrency={currentCurrency}
            onOpenInCalculator={handleOpenEstimateInCalc}
            onNewEstimate={() => handleNavigateToCalculator()}
          />
        )}

        {activeTab === 'utilities' && (
          <TextileTools initialTool={toolsActiveId} />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            currentCurrency={currentCurrency}
            onRatesUpdated={() => {}}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            currentLang={currentLang}
            onLanguageChange={handleLanguageChange}
            currentCurrency={currentCurrency}
            onCurrencyChange={handleCurrencyChange}
            onSync={handleSyncMarketRates}
          />
        )}
        {/* PUBLIC INFORMATIVE & LEGAL PAGES (AdSense Ready) */}
        {[
          'about',
          'features',
          'knowledge',
          'pricing',
          'contact',
          'faq',
          'privacy',
          'terms',
          'cookies',
          'disclaimer',
        ].includes(activeTab) && (
          <PublicPages
            initialView={activeTab as PublicPageView}
            onNavigateToCalculator={() => handleNavigateToCalculator()}
            onNavigateToMarket={() => {
              setActiveTab('market_rates');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* App-Like Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        currentCurrency={currentCurrency}
        onCurrencyChange={handleCurrencyChange}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenReferral={() => setReferralModalOpen(true)}
      />

      {/* GDPR / CCPA / Google AdSense Consent Banner */}
      <ConsentBanner
        onOpenPrivacy={() => {
          setActiveTab('privacy');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCookies={() => {
          setActiveTab('cookies');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Comprehensive Google Publisher & SaaS Categorized Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md pt-12 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Col 1: Brand & Mission */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-white p-0.5 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <img src={logoImg} alt="FabricIQ" className="w-full h-full object-cover rounded-[7px]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight text-lg">FABRIC</span>
                  <span className="text-gradient-fiq font-extrabold font-['Outfit'] text-lg">IQ</span>
                  <span className="ml-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">PRO</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Smart Textile Costing & Live Market Intelligence. Deterministic calculations, verified currency benchmarks, and audit trail generation for mills, converters, and export houses.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Textile Index Feeds
                </span>
              </div>
            </div>

            {/* Col 2: Costing Platform */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-['Outfit']">
                Costing Tools
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => { setActiveTab('calculator'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    Cost Calculator
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('market_rates'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    Live Market Rates
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('saved_estimates'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    Saved Quotations
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('utilities'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    Textile Engineering Tools
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Technical Knowledge Base */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-['Outfit']">
                Guides & Science
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => { setActiveTab('knowledge'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    Costing Mathematics
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('knowledge'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    Fabric GSM Mechanics
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('knowledge'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    Loom Economic Equations
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('knowledge'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    Printing Screen Amortization
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal & AdSense Compliance */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider font-['Outfit']">
                Legal & Policies
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => { setActiveTab('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('cookies'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('disclaimer'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    Market Disclaimer
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('faq'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-cyan-500 transition-colors cursor-pointer">
                    FAQ & Help
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>
              © 2026 FabricIQ Technologies. All rights reserved. • <a href="/ads.txt" target="_blank" rel="noreferrer" className="text-slate-400 hover:underline">Authorized Digital Sellers (ads.txt)</a>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setReferralModalOpen(true)}
                className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5" />
                Invite & Earn Rewards
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                onClick={() => { setActiveTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
