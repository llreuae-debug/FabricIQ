import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings2, X, ExternalLink } from 'lucide-react';
import { adService } from '../services/adService';

interface ConsentBannerProps {
  onOpenPrivacy?: () => void;
  onOpenCookies?: () => void;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({
  onOpenPrivacy,
  onOpenCookies,
}) => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(true);
  const [adConsent, setAdConsent] = useState<boolean>(true);
  const [personalizedConsent, setPersonalizedConsent] = useState<boolean>(false);

  useEffect(() => {
    const unsub = adService.subscribe((_settings, consent) => {
      if (!consent) {
        setShowBanner(true);
      } else {
        setShowBanner(false);
        setAnalyticsConsent(consent.analytics);
        setAdConsent(consent.advertising);
        setPersonalizedConsent(consent.personalized);
      }
    });

    return unsub;
  }, []);

  const handleAcceptAll = () => {
    adService.acceptAllConsent();
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRejectAll = () => {
    adService.rejectNonEssentialConsent();
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSaveCustom = () => {
    adService.saveConsent({
      analytics: analyticsConsent,
      advertising: adConsent,
      personalized: personalizedConsent,
    });
    setShowBanner(false);
    setShowModal(false);
  };

  return (
    <>
      {/* Floating Bottom Consent Banner (visible until consent is chosen) */}
      {showBanner && !showModal && (
        <aside 
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xl z-50 p-5 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl text-slate-200 animate-in fade-in slide-in-from-bottom-6 duration-300"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Cookie className="w-5 h-5" />
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <span>Privacy & Cookie Preferences</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    GDPR & AdSense Ready
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  FabricIQ uses essential cookies to ensure calculation accuracy and saved quotes, plus anonymous performance analytics and non-intrusive industry partner advertising.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-cyan-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                >
                  Privacy Policy <ExternalLink className="w-2.5 h-2.5" />
                </button>
                <span>•</span>
                <button
                  onClick={onOpenCookies}
                  className="hover:text-cyan-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                >
                  Cookie Policy <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer active:scale-95"
                >
                  Essential Only
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Customize</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Comprehensive Consent Preferences Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Cookie & Advertising Preferences
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control how FabricIQ handles data, analytics, and advertising
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Consent Categories */}
            <div className="space-y-4">
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">1. Strictly Necessary & Deterministic Engine</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      ALWAYS ACTIVE
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Required for user authentication, deterministic costing calculations, local quote saving, currency/unit storage, and core platform security. These cannot be switched off.
                </p>
              </div>

              {/* Category 2: Analytics & Performance */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">2. Performance & Calculation Analytics</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsConsent}
                      onChange={(e) => setAnalyticsConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Allows anonymous measurement of feature usage, formula processing speed, and error telemetry to continually optimize textile engineering performance.
                </p>
              </div>

              {/* Category 3: Google AdSense & Advertising */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">3. Google Publisher & Industry Advertising</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adConsent}
                      onChange={(e) => setAdConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enables relevant contextual textile industry sponsor notices and Google AdSense partner placements to fund free tier calculation access.
                </p>
              </div>

              {/* Category 4: Personalized Advertising */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">4. Personalized Ad Relevance</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={personalizedConsent}
                      disabled={!adConsent}
                      onChange={(e) => setPersonalizedConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-9 h-5 rounded-full transition-all relative ${!adConsent ? 'opacity-30 bg-slate-800' : 'bg-slate-800 peer-checked:bg-indigo-500'}`}>
                      <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 transition-transform ${personalizedConsent && adConsent ? 'translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Allows Google AdSense to personalize ads according to your textile industry interests rather than standard generic contextual ads.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Reject All Optional
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCustom}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-400 border border-cyan-500/30 transition-colors cursor-pointer"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
