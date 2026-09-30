import React, { useState, useEffect } from 'react';
import { Cookie, Settings2, ExternalLink } from 'lucide-react';
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
      {/* Floating Bottom Consent Banner */}
      {showBanner && !showModal && (
        <aside 
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xl z-50 p-5 rounded-[28px] card-soft-elevated backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-300"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30 flex items-center justify-center text-[#3B82F6] dark:text-[#67E8F9] shrink-0 mt-0.5">
              <Cookie className="w-5 h-5" />
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-['Outfit'] flex items-center gap-2">
                  <span>Privacy & Cookie Preferences</span>
                  <span className="pill-base pill-live text-[9px] py-0 px-1.5">
                    GDPR Ready
                  </span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  FabricIQ uses essential cookies to ensure calculation accuracy and saved quotes, plus anonymous performance telemetry.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-[#6EA8FF] underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                >
                  Privacy Policy <ExternalLink className="w-2.5 h-2.5" />
                </button>
                <span>•</span>
                <button
                  onClick={onOpenCookies}
                  className="hover:text-[#6EA8FF] underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                >
                  Cookie Policy <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleAcceptAll}
                  className="btn-tactile btn-soft-primary px-3.5 py-1.5 text-xs font-bold shadow-sm cursor-pointer"
                >
                  Accept All
                </button>

                <button
                  onClick={handleRejectAll}
                  className="btn-tactile btn-soft-secondary px-3 py-1.5 text-xs font-semibold cursor-pointer"
                >
                  Essential Only
                </button>

                <button
                  onClick={() => setShowModal(true)}
                  className="btn-tactile btn-soft-ghost px-2.5 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer flex items-center gap-1"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Customize</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Customize Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="card-soft-elevated max-w-lg w-full p-6 space-y-4 rounded-[28px] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Outfit']">Cookie Preferences</h3>
              <button onClick={() => setShowModal(false)} className="btn-tactile text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-[14px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[var(--text-primary)]">Strictly Necessary</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Session cache & calculations</div>
                </div>
                <span className="pill-base pill-live text-[9px] py-0 px-1.5">REQUIRED</span>
              </div>

              <div className="p-3 rounded-[14px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[var(--text-primary)]">Performance & Analytics</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Helps improve platform speed</div>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsConsent}
                  onChange={(e) => setAnalyticsConsent(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3B82F6] cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-[14px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[var(--text-primary)]">Relevant Industry Ads</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Textile partner announcements</div>
                </div>
                <input
                  type="checkbox"
                  checked={adConsent}
                  onChange={(e) => setAdConsent(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3B82F6] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setShowModal(false)}
                className="btn-tactile btn-soft-secondary px-4 py-2 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustom}
                className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
