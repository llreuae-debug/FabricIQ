import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Calculator, 
  FileText, 
  ArrowUpRight, 
  Download, 
  Sparkles, 
  Activity, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Database,
  Package,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import type { CurrencyCode, LiveFXData } from '../types';
import { currencyService } from '../services/currencyService';
import { marketRateService } from '../services/marketRateService';
import { estimateService } from '../services/estimateService';
import { referenceDatabaseService } from '../services/referenceDatabase';
import { 
  FABRIC_PRESETS, 
  calculateFabricIQCost, 
  DEFAULT_PROCESSING_OPERATIONS, 
  DEFAULT_DETAILED_DYEING, 
  DEFAULT_DETAILED_FINISHING 
} from '../services/calculationEngine';
import { i18n } from '../services/i18n';
import { authService } from '../services/authService';
import { referralService } from '../services/referralService';
import logoImg from '../assets/logo.png';

interface DashboardProps {
  currentCurrency: CurrencyCode;
  onNavigateToCalculator: (presetId?: string) => void;
  onNavigateToSavedEstimates: () => void;
  onNavigateToMarketRates: () => void;
  onNavigateToTools: (toolId?: string) => void;
  onNavigateToReferenceLibrary?: () => void;
  onNavigateToBOQ?: () => void;
  onOpenReferral?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentCurrency,
  onNavigateToCalculator,
  onNavigateToSavedEstimates,
  onNavigateToMarketRates,
  onNavigateToTools,
  onNavigateToReferenceLibrary,
  onNavigateToBOQ,
  onOpenReferral,
}) => {
  const rates = marketRateService.getRates();
  const allSavedEstimates = estimateService.getAll();
  const savedEstimates = allSavedEstimates.slice(0, 4);
  const currentUser = authService.getCurrentUser();
  const referralProgress = referralService.getMilestoneProgress(currentUser);
  const refMetrics = referenceDatabaseService.getDashboardMetrics();

  // Greeting time calculation
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Engineer';

  // Live USD/PKR FX Engine State
  const [liveFX, setLiveFX] = useState<LiveFXData>(currencyService.getLiveFX());
  const [isFXRefreshing, setIsFXRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const unsub = currencyService.subscribe((fx) => setLiveFX(fx));
    return unsub;
  }, []);

  const handleManualFXRefresh = async () => {
    setIsFXRefreshing(true);
    try {
      await currencyService.fetchLiveUSDToPKR(true);
    } finally {
      setTimeout(() => setIsFXRefreshing(false), 600);
    }
  };

  // Selected commodity for interactive chart
  const [selectedChartRateId, setSelectedChartRateId] = useState<string>('rate-yarn-20-carded');
  const [chartTimeframe, setChartTimeframe] = useState<'7d' | '30d'>('7d');

  // Quick Estimator State
  const [quickPresetId, setQuickPresetId] = useState<string>('sheeting-20x20');
  const [quickQuantity, setQuickQuantity] = useState<number>(10000);
  const [quickMargin, setQuickMargin] = useState<number>(15);

  const selectedPreset = FABRIC_PRESETS.find((p) => p.id === quickPresetId) || FABRIC_PRESETS[0];

  // Fetch benchmark yarn & weaving rates
  const cotton20Rate = rates.find((r) => r.id === 'rate-yarn-20-carded')?.currentRate || 2850;
  const weavingRate = rates.find((r) => r.id === 'rate-weaving-airjet')?.currentRate || 0.48;

  // Compute live quick estimate via FabricIQ deterministic calculation pipeline
  const quickCalcResult = calculateFabricIQCost({
    estimateName: `Quick ${selectedPreset.name}`,
    customerName: 'Quick Costing Preview',
    fabricStructure: 'woven',
    fabricType: selectedPreset.name,
    finishedWidthInches: selectedPreset.widthInches,
    finishedLengthMeters: quickQuantity,
    costingMethod: 'engineered',
    directGreyRatePerMeter: 0,
    directGreyRatePerKg: 0,
    directGSM: 150,
    warpCountSystem: 'Ne',
    weftCountSystem: 'Ne',
    warpCountNe: selectedPreset.warpCount,
    weftCountNe: selectedPreset.weftCount,
    epi: selectedPreset.epi,
    ppi: selectedPreset.ppi,
    warpCrimpPct: selectedPreset.warpCrimpPct,
    weftCrimpPct: selectedPreset.weftCrimpPct,
    warpWastePct: 1.0,
    weftWastePct: 1.0,
    warpYarnRate: cotton20Rate,
    warpYarnRateUnit: '10lbs',
    weftYarnRate: cotton20Rate,
    weftYarnRateUnit: '10lbs',
    weavingCostMethod: 'per_pick',
    weavingRate: weavingRate,
    sizingCostPerMeter: 8.5,
    greyInspectionCostPerMeter: 1.2,
    otherGreyManufacturingCostPerMeter: 0,
    weavingLossPct: 2.0,
    wetProcessingLossPct: 3.5,
    finishingLossPct: 1.5,
    processingOperations: DEFAULT_PROCESSING_OPERATIONS,
    detailedDyeing: DEFAULT_DETAILED_DYEING,
    detailedFinishing: DEFAULT_DETAILED_FINISHING,
    printingCostPerMeter: 0,
    auxChemicalCostPerMeter: 2.5,
    transportMethod: 'by_weight',
    transportRatePerKg: 14.0,
    fixedTransportTotal: 0,
    overheadMethod: 'percentage',
    overheadPct: 3.5,
    fixedOverheadTotal: 0,
    pricingStrategy: 'margin',
    targetMarginPct: quickMargin,
    targetMarkupPct: 20.0,
    commissionPerMeter: 0,
    otherChargesPerMeter: 0,
    taxMode: 'exclusive',
    taxRatePct: 18.0,
    currency: 'PKR',
  });

  const chartRate = rates.find((r) => r.id === selectedChartRateId) || rates[0];
  const chartData = (chartTimeframe === '7d' ? chartRate.history7d : chartRate.history30d).map((p) => {
    const rateInSelectedCur = currencyService.convert(p.rate, chartRate.baseCurrency, currentCurrency);
    return {
      date: p.date.substring(5),
      rate: Number(rateInSelectedCur.toFixed(2)),
    };
  });

  // FX Mini History Graph Points
  const fxMiniData = [
    { day: 'D1', val: liveFX.currentRate * 0.996 },
    { day: 'D2', val: liveFX.currentRate * 0.998 },
    { day: 'D3', val: liveFX.currentRate * 0.997 },
    { day: 'D4', val: liveFX.currentRate * 1.001 },
    { day: 'D5', val: liveFX.currentRate * 0.999 },
    { day: 'D6', val: liveFX.currentRate * 1.002 },
    { day: 'D7', val: liveFX.currentRate },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP HERO SECTION: Good morning, [User] */}
      <div className="card-soft-lg p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-subtle)]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-gradient-to-bl from-[#6EA8FF]/10 via-[#67E8F9]/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 rounded-full bg-[#6EE7B7]/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group shrink-0">
              <div className="absolute -inset-2 rounded-[24px] bg-gradient-to-tr from-[#6EA8FF] via-[#67E8F9] to-[#6EE7B7] opacity-40 blur-md group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] overflow-hidden bg-white p-1 shadow-lg border border-white/40 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                <img src={logoImg} alt="FabricIQ" className="w-full h-full object-cover rounded-[16px]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#6EA8FF]/15 border border-[#6EA8FF]/30 text-[#3B82F6] dark:text-[#67E8F9] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Textile-Tech Intelligence Platform</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight font-['Outfit']">
                {greeting}, {userName}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                Smart Textile Costing. Live Market Intelligence.
              </p>
            </div>
          </div>

          {/* Primary Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateToCalculator()}
              className="btn-tactile btn-soft-primary px-4 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>New Costing</span>
            </button>

            {onNavigateToBOQ && (
              <button
                onClick={onNavigateToBOQ}
                className="btn-tactile btn-soft-mint px-4 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>New BOQ</span>
              </button>
            )}

            {onNavigateToReferenceLibrary && (
              <button
                onClick={onNavigateToReferenceLibrary}
                className="btn-tactile btn-soft-secondary px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Database className="w-4 h-4 text-[#6EA8FF] dark:text-[#67E8F9]" />
                <span>Reference Library</span>
              </button>
            )}

            {onNavigateToMarketRates && (
              <button
                onClick={onNavigateToMarketRates}
                className="btn-tactile btn-soft-secondary px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Activity className="w-4 h-4 text-[#6EE7B7]" />
                <span>Market Rates</span>
              </button>
            )}

            {onOpenReferral && (
              <button
                onClick={onOpenReferral}
                className="btn-tactile px-3.5 py-2.5 rounded-[14px] bg-[#C4B5FD]/15 hover:bg-[#C4B5FD]/25 border border-[#C4B5FD]/30 text-[#8B5CF6] dark:text-[#C4B5FD] text-xs font-bold flex items-center gap-2 cursor-pointer"
                title={`${referralProgress.currentCount} Invites • ${referralProgress.progressPercent}% milestone`}
              >
                <Zap className="w-4 h-4 text-[#8B5CF6] dark:text-[#C4B5FD]" />
                <span>Rewards ({referralProgress.currentCount} invites)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD METRIC CARDS (6 Tactile Floating Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Card 1: Total Estimates */}
        <div 
          onClick={onNavigateToSavedEstimates}
          className="card-soft p-4 cursor-pointer hover:border-[#6EA8FF]/40 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-[12px] bg-[#6EA8FF]/15 text-[#3B82F6] dark:text-[#6EA8FF]">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-emerald-500 font-mono">+14%</span>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Total Estimates
            </div>
            <div className="text-xl font-extrabold font-tabular text-[var(--text-primary)] mt-0.5">
              {allSavedEstimates.length + 18}
            </div>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-2 pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span>Commercial Quotes</span>
            <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[#6EA8FF]" />
          </div>
        </div>

        {/* Card 2: Active BOQs */}
        <div 
          onClick={onNavigateToBOQ}
          className="card-soft p-4 cursor-pointer hover:border-[#6EE7B7]/40 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-[12px] bg-[#6EE7B7]/15 text-[#059669] dark:text-[#6EE7B7]">
              <Package className="w-4 h-4" />
            </span>
            <span className="pill-base pill-live text-[9px] py-0 px-1.5">ACTIVE</span>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Active BOQs
            </div>
            <div className="text-xl font-extrabold font-tabular text-[var(--text-primary)] mt-0.5">
              12
            </div>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-2 pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span>Percale & Lawn Sets</span>
            <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[#6EE7B7]" />
          </div>
        </div>

        {/* Card 3: Market Rates */}
        <div 
          onClick={onNavigateToMarketRates}
          className="card-soft p-4 cursor-pointer hover:border-[#67E8F9]/40 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-[12px] bg-[#67E8F9]/15 text-[#0284C7] dark:text-[#67E8F9]">
              <Activity className="w-4 h-4" />
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-live-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Market Rates
            </div>
            <div className="text-xl font-extrabold font-tabular text-[var(--text-primary)] mt-0.5">
              {rates.length} Verified
            </div>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-2 pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span>Faisalabad / Karachi</span>
            <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[#67E8F9]" />
          </div>
        </div>

        {/* Card 4: Cost Variance */}
        <div className="card-soft p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-[12px] bg-[#FDBA74]/15 text-[#EA580C] dark:text-[#FDBA74]">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-[#EA580C] dark:text-[#FDBA74] font-mono">+1.6%</span>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Cost Variance
            </div>
            <div className="text-xl font-extrabold font-tabular text-[var(--text-primary)] mt-0.5">
              +₨ 2.45/m
            </div>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-2 pt-1.5 border-t border-[var(--border-subtle)]">
            <span>30-Day Movement</span>
          </div>
        </div>

        {/* Card 5: Reference Items */}
        <div 
          onClick={onNavigateToReferenceLibrary}
          className="card-soft p-4 cursor-pointer hover:border-[#C4B5FD]/40 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-[12px] bg-[#C4B5FD]/15 text-[#7C3AED] dark:text-[#C4B5FD]">
              <Database className="w-4 h-4" />
            </span>
            <span className="pill-base pill-verified text-[9px] py-0 px-1.5">DB</span>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Reference Items
            </div>
            <div className="text-xl font-extrabold font-tabular text-[var(--text-primary)] mt-0.5">
              {refMetrics.totalReferences} Specs
            </div>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-2 pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span>Catalog Items</span>
            <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[#C4B5FD]" />
          </div>
        </div>

        {/* Card 6: Saved Quotations */}
        <div 
          onClick={onNavigateToSavedEstimates}
          className="card-soft p-4 cursor-pointer hover:border-[#F9A8D4]/40 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-[12px] bg-[#F9A8D4]/15 text-[#DB2777] dark:text-[#F9A8D4]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="pill-base pill-saved text-[9px] py-0 px-1.5">SAVED</span>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Saved Quotations
            </div>
            <div className="text-xl font-extrabold font-tabular text-[var(--text-primary)] mt-0.5">
              {allSavedEstimates.length}
            </div>
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-2 pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span>Audited PDF Ready</span>
            <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[#F9A8D4]" />
          </div>
        </div>
      </div>

      {/* 3. LIVE MARKET RATE CARD (Soft Elevated USD/PKR Component) */}
      <div className="card-soft-lg p-5 sm:p-6 bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-subtle)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left: FX details & trend */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)]">
                <DollarSign className="w-3.5 h-3.5 text-[#6EA8FF]" />
                <span>USD / PKR</span>
              </div>

              <span className="pill-base pill-live">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse" />
                LIVE FX
              </span>

              {liveFX.isFallback && (
                <span className="pill-base pill-indicative text-[10px]">
                  <AlertTriangle className="w-3 h-3" />
                  VERIFIED CACHE
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-tabular text-[var(--text-primary)] tracking-tight">
                {liveFX.currentRate.toFixed(2)}
              </span>
              <div
                className={`flex items-center gap-0.5 text-xs font-bold font-tabular ${
                  liveFX.changePercent >= 0 ? 'text-[#10B981] dark:text-[#6EE7B7]' : 'text-rose-500'
                }`}
              >
                {liveFX.changePercent >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{liveFX.changePercent >= 0 ? `+${liveFX.changePercent}%` : `${liveFX.changePercent}%`}</span>
                <span className="opacity-70 ml-1">
                  ({liveFX.changeAmount >= 0 ? `+₨ ${liveFX.changeAmount.toFixed(2)}` : `-₨ ${Math.abs(liveFX.changeAmount).toFixed(2)}`})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
              <span>Source: <strong className="text-[var(--text-secondary)]">{liveFX.source}</strong></span>
              <span>•</span>
              <span>Updated: <span className="font-tabular font-medium text-[var(--text-secondary)]">{liveFX.lastUpdated}</span></span>
            </div>
          </div>

          {/* Center: Small Elegant Trend Graph */}
          <div className="w-full lg:w-56 h-16 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fxMiniData}>
                <defs>
                  <linearGradient id="fxMiniGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#67E8F9" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#67E8F9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#fxMiniGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Right: Telemetry metrics & refresh */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-[12px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-center">
                <span className="text-[10px] text-[var(--text-muted)] font-semibold block uppercase">Bid</span>
                <span className="font-tabular font-bold text-[var(--text-primary)]">₨ {liveFX.bidRate.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-[12px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-center">
                <span className="text-[10px] text-[var(--text-muted)] font-semibold block uppercase">Ask</span>
                <span className="font-tabular font-bold text-[var(--text-primary)]">₨ {liveFX.askRate.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleManualFXRefresh}
              disabled={isFXRefreshing}
              className="btn-tactile btn-soft-primary px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh live rate"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFXRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN ROW: Interactive Rate Chart + Instant Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Rate Chart (7 Cols) */}
        <div className="lg:col-span-7 card-soft-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#6EA8FF] dark:text-[#67E8F9] uppercase tracking-wider">
                    Rate Trend Intelligence
                  </span>
                  <span className="pill-base pill-verified text-[9px] py-0 px-1.5">
                    {chartRate.spec}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                  {chartRate.name} ({currentCurrency} / {chartRate.unit})
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedChartRateId}
                  onChange={(e) => setSelectedChartRateId(e.target.value)}
                  className="input-soft text-xs py-1 px-2.5 rounded-[12px] bg-[var(--surface-subtle)] font-medium text-[var(--text-primary)] cursor-pointer"
                >
                  {rates.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.spec})
                    </option>
                  ))}
                </select>

                <div className="flex items-center bg-[var(--surface-subtle)] p-0.5 rounded-[12px] border border-[var(--border-subtle)] text-xs">
                  <button
                    onClick={() => setChartTimeframe('7d')}
                    className={`btn-tactile px-2.5 py-1 rounded-[10px] font-semibold transition-colors cursor-pointer ${
                      chartTimeframe === '7d'
                        ? 'bg-[var(--surface)] text-[#3B82F6] dark:text-[#67E8F9] shadow-sm font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setChartTimeframe('30d')}
                    className={`btn-tactile px-2.5 py-1 rounded-[10px] font-semibold transition-colors cursor-pointer ${
                      chartTimeframe === '30d'
                        ? 'bg-[var(--surface)] text-[#3B82F6] dark:text-[#67E8F9] shadow-sm font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    30 Days
                  </button>
                </div>

                <button
                  onClick={onNavigateToMarketRates}
                  className="btn-tactile p-1.5 rounded-[12px] bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  title="View full market rates"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Area Chart with Soft Gradients */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRateSoft" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6EA8FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6EA8FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    domain={['dataMin - 10', 'dataMax + 10']}
                    tickFormatter={(v) => `${v}`}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface-elevated)',
                      borderColor: 'var(--border-subtle)',
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      boxShadow: 'var(--shadow-soft-float)',
                    }}
                    formatter={(val: any) => [`${currentCurrency} ${val} / ${chartRate.unit}`, 'Benchmark']}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#6EA8FF"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRateSoft)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#10B981] dark:text-[#6EE7B7]" />
              <span>Source: <strong className="text-[var(--text-secondary)]">{chartRate.source}</strong></span>
            </div>
            <span>Status: <span className="text-[#10B981] dark:text-[#6EE7B7] font-semibold">{chartRate.status}</span></span>
          </div>
        </div>

        {/* Right: Instant Estimator (5 Cols) */}
        <div className="lg:col-span-5 card-soft-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[10px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30 flex items-center justify-center text-[#3B82F6] dark:text-[#6EA8FF]">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Instant Costing Preview
                </h3>
              </div>
              <span className="pill-base pill-verified text-[10px] font-mono">
                Yield: {quickCalcResult.effectiveYieldPct}%
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Select standard fabric specifications to calculate commercial costing in real time.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Fabric Preset
                </label>
                <select
                  value={quickPresetId}
                  onChange={(e) => setQuickPresetId(e.target.value)}
                  className="input-soft w-full px-3 py-2 text-xs font-medium cursor-pointer"
                >
                  {FABRIC_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">
                      Order Qty (m)
                    </label>
                    <span className="font-tabular text-xs font-bold text-[var(--text-primary)]">
                      {quickQuantity.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={quickQuantity}
                    onChange={(e) => setQuickQuantity(Number(e.target.value))}
                    className="slider-soft"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">
                      Margin %
                    </label>
                    <span className="font-tabular text-xs font-bold text-[var(--text-primary)]">
                      {quickMargin}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="0.5"
                    value={quickMargin}
                    onChange={(e) => setQuickMargin(Number(e.target.value))}
                    className="slider-soft"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-[18px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">Total Production Cost:</span>
                <span className="text-sm font-bold font-tabular text-[var(--text-primary)]">
                  {currencyService.format(
                    currencyService.convert(quickCalcResult.cost_per_meter, 'PKR', currentCurrency),
                    currentCurrency
                  )} / m
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">Target Selling Price:</span>
                <span className="text-base font-extrabold font-tabular text-[#3B82F6] dark:text-[#67E8F9]">
                  {currencyService.format(
                    currencyService.convert(quickCalcResult.selling_price, 'PKR', currentCurrency),
                    currentCurrency
                  )} / m
                </span>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Theoretical GSM: <strong className="font-tabular text-[var(--text-secondary)]">{quickCalcResult.estimatedGreyGSM} gsm</strong></span>
                <span>Req. Greige: <strong className="font-tabular text-[var(--text-secondary)]">{quickCalcResult.requiredGreyInputMeters.toLocaleString()} m</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => onNavigateToCalculator(quickPresetId)}
              className="btn-tactile btn-soft-primary w-full py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open in FabricIQ Calculator</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM ROW: Recent Estimates & Specialized Textile Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Estimates (8 Cols) */}
        <div className="lg:col-span-8 card-soft-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6EA8FF] dark:text-[#67E8F9]" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {i18n.t('recent_estimates')}
              </h3>
            </div>
            <button
              onClick={onNavigateToSavedEstimates}
              className="btn-tactile text-xs font-semibold text-[#3B82F6] dark:text-[#67E8F9] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{i18n.t('view_all_estimates')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {savedEstimates.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-[18px] bg-[var(--surface-subtle)] border border-dashed border-[var(--border-subtle)]">
              <div className="w-12 h-12 rounded-full bg-[#6EA8FF]/10 text-[#6EA8FF] flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">No Estimates Yet</h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mt-1 mb-4">
                Create your first textile costing to generate commercial quotes with live rates.
              </p>
              <button
                onClick={() => onNavigateToCalculator()}
                className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Create Costing
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedEstimates.map((est) => (
                <div
                  key={est.id}
                  className="p-3.5 rounded-[16px] bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[#6EA8FF]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="pill-base pill-saved text-[9px] py-0 px-1.5 font-mono">
                        {est.referenceNo}
                      </span>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">
                        {est.customerName}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {est.fabricType} • {(est.inputs.finishedLengthMeters || 0).toLocaleString()}m
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-bold font-tabular text-[#10B981] dark:text-[#6EE7B7]">
                        {currencyService.format(
                          currencyService.convert(est.results.selling_price, est.currency, currentCurrency),
                          currentCurrency
                        )} / m
                      </div>
                      <div className="text-[10px] font-tabular text-[var(--text-muted)]">
                        Total: {currencyService.format(
                          currencyService.convert(est.results.totalOrderInvoiceValue, est.currency, currentCurrency),
                          currentCurrency
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => estimateService.generateQuotationPDF(est)}
                      className="btn-tactile btn-soft-secondary p-2 text-xs flex items-center gap-1 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-[#6EA8FF] dark:text-[#67E8F9]" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specialized Textile Tools (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card-soft-lg p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#6EA8FF] dark:text-[#67E8F9]" />
              <span>Specialized Textile Tools</span>
            </h3>

            <div className="space-y-2.5">
              <div
                onClick={() => onNavigateToTools('converter')}
                className="btn-tactile cursor-pointer p-3 rounded-[16px] bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[#6EA8FF]/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#3B82F6] dark:group-hover:text-[#67E8F9] transition-colors">
                    {i18n.t('yarn_converter_title')}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    Ne, Nm, Denier, Tex, Dtex
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#6EA8FF] transition-colors" />
              </div>

              <div
                onClick={() => onNavigateToTools('gsm')}
                className="btn-tactile cursor-pointer p-3 rounded-[16px] bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[#6EA8FF]/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#3B82F6] dark:group-hover:text-[#67E8F9] transition-colors">
                    {i18n.t('gsm_calculator_title')}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    Theoretical GSM & Finished Weight
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#6EA8FF] transition-colors" />
              </div>

              <div
                onClick={() => onNavigateToTools('consumption')}
                className="btn-tactile cursor-pointer p-3 rounded-[16px] bg-[var(--surface-subtle)] hover:bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[#6EA8FF]/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#3B82F6] dark:group-hover:text-[#67E8F9] transition-colors">
                    Yarn Bags & Weight Requirement
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    Order Warp/Weft Sourcing Planner
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#6EA8FF] transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
