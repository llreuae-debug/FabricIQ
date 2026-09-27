import { useState, useEffect } from 'react';
import type { CurrencyCode, LanguageCode, SavedEstimate } from './types';
import { currencyService } from './services/currencyService';
import { i18n, LANGUAGES } from './services/i18n';
import { marketRateService } from './services/marketRateService';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Calculator } from './components/Calculator';
import { MarketRates } from './components/MarketRates';
import { SavedEstimates } from './components/SavedEstimates';
import { TextileTools } from './components/TextileTools';
import { AdminPanel } from './components/AdminPanel';
import { Settings } from './components/Settings';
import { AutoDetectModal } from './components/AutoDetectModal';
import { SplashScreen } from './components/SplashScreen';
import { ShieldCheck } from 'lucide-react';
import logoImg from './assets/logo.png';

export function App() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(i18n.getLanguage());
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>(currencyService.getCurrency());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Auto-detect modal state on initial launch
  const [autoDetectOpen, setAutoDetectOpen] = useState<boolean>(false);
  const [detectedCountry, setDetectedCountry] = useState<string>('');
  const [suggestedCurrency, setSuggestedCurrency] = useState<CurrencyCode>('PKR');
  const [suggestedLang, setSuggestedLang] = useState<LanguageCode>('ur');
  const [detectReason, setDetectReason] = useState<string>('');

  // Preload state for calculator navigation
  const [calculatorPresetId, setCalculatorPresetId] = useState<string | undefined>();
  const [toolsActiveId, setToolsActiveId] = useState<string | undefined>();

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('fabriciq_has_seen_detect_v2');
    if (!hasSeenModal) {
      const curDetect = currencyService.detectInitialCurrency();
      const langDetect = i18n.detectInitialLanguage();

      setDetectedCountry(curDetect.detectedCountry);
      setSuggestedCurrency(curDetect.suggestedCurrency);
      setSuggestedLang(langDetect.suggestedLang);
      setDetectReason(`${curDetect.reason} • ${langDetect.reason}`);
      // Auto detect modal will show after splash completes
    }

    const config = LANGUAGES[currentLang];
    document.documentElement.setAttribute('dir', config.dir);
    document.documentElement.setAttribute('lang', config.code);
  }, [currentLang]);

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
      />

      {/* Main Application Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            currentCurrency={currentCurrency}
            onNavigateToCalculator={handleNavigateToCalculator}
            onNavigateToSavedEstimates={() => setActiveTab('saved_estimates')}
            onNavigateToMarketRates={() => setActiveTab('market_rates')}
            onNavigateToTools={handleNavigateToTools}
          />
        )}

        {activeTab === 'calculator' && (
          <Calculator
            currentCurrency={currentCurrency}
            initialPresetId={calculatorPresetId}
            onEstimateSaved={() => setActiveTab('saved_estimates')}
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
      </main>

      {/* Modern FabricIQ Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B1220]/90 backdrop-blur-md py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-white p-0.5 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <img src={logoImg} alt="FabricIQ" className="w-full h-full object-cover rounded-[7px]" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">FABRIC</span>
              <span className="text-gradient-fiq font-extrabold font-['Outfit']">IQ</span>
              <span className="ml-2 text-slate-500 dark:text-slate-400">• Smart Textile Costing & Live Market Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Textile Index Feeds
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">ASTM D3776 & ISO Textile Engineering Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
