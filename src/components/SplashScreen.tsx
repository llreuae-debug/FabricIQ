import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface SplashScreenProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, forceShow = false }) => {
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState('Initializing FabricIQ Deterministic Engine...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Stage 1
    const t1 = setTimeout(() => {
      setProgress(38);
      setStatusText('Connecting to Live Textile Market Indices (APTMA, KCA, Forex)...');
    }, 400);

    // Stage 2
    const t2 = setTimeout(() => {
      setProgress(74);
      setStatusText('Loading Physical Consumption & Multi-Stage Yield Models...');
    }, 900);

    // Stage 3
    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('FabricIQ Ready • Commercial Costing Online');
    }, 1400);

    // Fade out and finish
    const t4 = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    const t5 = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete, forceShow]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#040814] text-white select-none transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Animated Glows & Woven Mesh Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#0052ff]/20 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#00d2ff]/20 blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#10b981]/10 blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 woven-grid-bg opacity-30" />
      </div>

      {/* Main Center Stage */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto px-6 space-y-6">
        {/* Logo Container with Animated Glow Aura */}
        <div className="relative group">
          {/* Ambient Glowing Ring */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#0052ff] via-[#00d2ff] to-[#10b981] opacity-70 blur-xl animate-logo-aura" />
          
          {/* Logo Frame */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl p-1 bg-gradient-to-br from-white/20 via-[#00d2ff]/40 to-[#10b981]/40 shadow-2xl backdrop-blur-md animate-logo-float flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] overflow-hidden bg-white flex items-center justify-center shadow-inner">
              <img
                src={logoImg}
                alt="FabricIQ Logo"
                className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Brand Typography & Tagline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-[#00d2ff]/30 text-xs font-semibold text-[#00d2ff] shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" />
            <span>Deterministic Textile Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Outfit']">
            <span className="text-white">FABRIC</span>
            <span className="text-gradient-fiq">IQ</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide">
            Smart Textile Costing • Live Market Intelligence
          </p>
        </div>

        {/* Progress Bar & Status Feed */}
        <div className="w-full max-w-xs space-y-2 pt-2">
          <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0052ff] via-[#00d2ff] to-[#10b981] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="truncate max-w-[220px] text-slate-300">{statusText}</span>
            <span className="text-[#00d2ff] font-bold">{progress}%</span>
          </div>
        </div>

        {/* Badges & Skip Button */}
        <div className="flex items-center justify-between w-full max-w-xs pt-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Feeds</span>
          </div>

          <button
            onClick={handleSkip}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-900/80"
          >
            <span>Skip to workspace</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-1 text-[#00d2ff]">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Live Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
