import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { adService, type AdSettings } from '../services/adService';

export type AdPosition = 'header_banner' | 'in_article' | 'sidebar' | 'footer_banner' | 'market_sidebar';

interface AdPlacementProps {
  position: AdPosition;
  className?: string;
  slotId?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({
  position,
  className = '',
  slotId,
}) => {
  const [adSettings, setAdSettings] = useState<AdSettings>(adService.getSettings());
  const [isAllowed, setIsAllowed] = useState<boolean>(adService.isAdvertisingAllowed());
  const adRef = useRef<HTMLDivElement>(null);
  const adPushedRef = useRef<boolean>(false);

  useEffect(() => {
    const unsub = adService.subscribe((settings) => {
      setAdSettings(settings);
      setIsAllowed(adService.isAdvertisingAllowed());
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!adSettings.testMode && isAllowed && adSettings.publisherId && !adPushedRef.current) {
      try {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          (window as any).adsbygoogle.push({});
          adPushedRef.current = true;
        }
      } catch (e) {
        console.warn('AdSense push error (normal during dev/testing):', e);
      }
    }
  }, [adSettings.testMode, isAllowed, adSettings.publisherId]);

  if (!adSettings.enabled || !isAllowed) {
    return null;
  }

  const effectiveSlotId = slotId || adSettings.slots[
    position === 'header_banner' ? 'headerBanner' :
    position === 'sidebar' ? 'sidebarSquare' :
    position === 'footer_banner' ? 'footerBanner' :
    position === 'market_sidebar' ? 'marketSidebar' : 'inArticle'
  ] || '1029384756';

  // Responsive container classes based on position to avoid layout shift (CLS)
  const containerClasses = {
    header_banner: 'w-full max-w-5xl mx-auto min-h-[90px] my-4',
    in_article: 'w-full max-w-4xl mx-auto min-h-[140px] my-6',
    sidebar: 'w-full min-h-[250px] my-3',
    footer_banner: 'w-full max-w-5xl mx-auto min-h-[90px] mt-8 mb-4',
    market_sidebar: 'w-full min-h-[200px] my-2',
  }[position];

  return (
    <div 
      ref={adRef}
      className={`ad-container relative rounded-2xl overflow-hidden bg-slate-950/40 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 transition-all ${containerClasses} ${className}`}
      data-ad-position={position}
    >
      {/* Google AdSense Compliant Label */}
      {adSettings.showAdLabels && (
        <div className="flex items-center justify-between px-3 py-1 bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800/60 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none">
          <span className="flex items-center gap-1">
            <Info className="w-2.5 h-2.5" />
            <span>Advertisement</span>
          </span>
          <span className="text-[8px] font-mono text-slate-400">
            {adSettings.testMode ? 'Preview Slot' : 'Google Publisher Partner'}
          </span>
        </div>
      )}

      {/* Production Google AdSense Tag OR Test Preview Card */}
      {adSettings.testMode ? (
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left bg-gradient-to-r from-slate-900/60 via-indigo-950/20 to-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 font-['Outfit'] flex items-center gap-1.5 justify-center sm:justify-start">
                <span>Textile Industry Sponsor Spot</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                  {position.replace('_', ' ').toUpperCase()}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Targeted textile machinery, yarn indenting & certified testing lab promotions.
              </p>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 border border-slate-800 rounded-lg px-2.5 py-1 bg-slate-950/60">
            Slot: {effectiveSlotId}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-2 min-h-[90px] overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', textAlign: 'center', width: '100%' }}
            data-ad-client={adSettings.publisherId}
            data-ad-slot={effectiveSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      )}
    </div>
  );
};
