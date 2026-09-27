import React, { useState } from 'react';
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
  Clock,
  ShieldCheck,
  ChevronRight
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
import type { CurrencyCode } from '../types';
import { currencyService } from '../services/currencyService';
import { marketRateService } from '../services/marketRateService';
import { estimateService } from '../services/estimateService';
import { FABRIC_PRESETS, calculateFabricIQCost, DEFAULT_PROCESSING_OPERATIONS, DEFAULT_DETAILED_DYEING, DEFAULT_DETAILED_FINISHING } from '../services/calculationEngine';
import { i18n } from '../services/i18n';
import logoImg from '../assets/logo.png';

interface DashboardProps {
  currentCurrency: CurrencyCode;
  onNavigateToCalculator: (presetId?: string) => void;
  onNavigateToSavedEstimates: () => void;
  onNavigateToMarketRates: () => void;
  onNavigateToTools: (toolId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentCurrency,
  onNavigateToCalculator,
  onNavigateToSavedEstimates,
  onNavigateToMarketRates,
  onNavigateToTools,
}) => {
  const rates = marketRateService.getRates();
  const savedEstimates = estimateService.getAll().slice(0, 4);

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
    fabricType: selectedPreset.name,
    finishedWidthInches: selectedPreset.widthInches,
    finishedLengthMeters: quickQuantity,
    costingMethod: 'engineered',
    directGreyRatePerMeter: 0,
    directGreyRatePerKg: 0,
    directGSM: 150,
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

  const heroRateCards = [
    {
      rate: rates.find((r) => r.id === 'rate-yarn-20-carded')!,
      label: '20/1 Carded Cotton Yarn',
      categoryBadge: 'Yarn Benchmark',
    },
    {
      rate: rates.find((r) => r.id === 'rate-grey-sheeting-63')!,
      label: 'Grey Sheeting 20x20/60x60 63"',
      categoryBadge: 'Greige Cloth',
    },
    {
      rate: rates.find((r) => r.id === 'rate-dyeing-reactive-med')!,
      label: 'Reactive Medium Dyeing',
      categoryBadge: 'Wet Processing',
    },
    {
      rate: rates.find((r) => r.id === 'rate-forex-usd-pkr')!,
      label: 'USD / PKR Foreign Exchange',
      categoryBadge: 'Currency Forex',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Banner with FabricIQ Logo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1836] via-[#081026] to-[#040814] border border-[#00d2ff]/20 p-6 md:p-8 shadow-2xl shadow-black/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-[#0052ff]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 rounded-full bg-[#00d2ff]/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Glowing Logo Card */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-[#0052ff] via-[#00d2ff] to-[#10b981] opacity-50 blur-md group-hover:opacity-100 transition-opacity" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white p-1 shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <img src={logoImg} alt="FabricIQ Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-semibold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>Deterministic Textile Costing & Market Intelligence</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
                <span>Smart Textile Costing. </span>
                <span className="text-gradient-fiq">Live Market Feeds.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Calculate warp/weft consumption, airjet weaving charges, multi-stage yield losses, true margin vs markup, and export official commercial quotations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToCalculator()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#0052ff] to-[#00a8ff] hover:from-[#0047e1] hover:to-[#0096e6] text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>{i18n.t('quick_new_quote')}</span>
            </button>
            <button
              onClick={onNavigateToMarketRates}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700/80 transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4 text-[#00d2ff]" />
              <span>{i18n.t('market_rates_title')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TEXTILE MARKET TODAY */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-pulse" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {i18n.t('live_rates_ticker')}
            </h3>
          </div>
          <button
            onClick={onNavigateToMarketRates}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Market Rates</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {heroRateCards.map(({ rate, label, categoryBadge }) => {
            if (!rate) return null;
            const convertedCurrent = currencyService.convert(rate.currentRate, rate.baseCurrency, currentCurrency);
            const isPositive = rate.changePercent >= 0;

            return (
              <div
                key={rate.id}
                onClick={() => {
                  setSelectedChartRateId(rate.id);
                }}
                className={`cursor-pointer rounded-2xl p-4 transition-all border ${
                  selectedChartRateId === rate.id
                    ? 'bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {categoryBadge}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        rate.status === 'LIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : rate.status === 'MANUAL'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {rate.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-medium line-clamp-1 mb-1" title={rate.name}>
                  {label}
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-xl font-extrabold text-white tracking-tight">
                    {currencyService.format(convertedCurrent, currentCurrency)}
                    <span className="text-xs font-normal text-slate-400 ml-1">/ {rate.unit}</span>
                  </div>
                  <div
                    className={`flex items-center gap-0.5 text-xs font-bold ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>{isPositive ? `+${rate.changePercent}%` : `${rate.changePercent}%`}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[130px]" title={rate.source}>
                    {rate.source.split('&')[0]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {rate.lastUpdated.split(' ')[1] || 'Today'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Row: Interactive Trend Chart + Quick Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Rate Chart (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Rate Trend Intelligence
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {chartRate.spec}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {chartRate.name} ({currentCurrency} / {chartRate.unit})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setChartTimeframe('7d')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    chartTimeframe === '7d'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setChartTimeframe('30d')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    chartTimeframe === '30d'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  30 Days
                </button>
              </div>

              <button
                onClick={() => onNavigateToMarketRates()}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="View in full market table"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  domain={['dataMin - 10', 'dataMax + 10']}
                  tickFormatter={(v) => `${v}`}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  formatter={(val: any) => [`${currentCurrency} ${val} / ${chartRate.unit}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Source: <strong className="text-slate-200">{chartRate.source}</strong></span>
            </div>
            <span className="text-slate-400">Status: <span className="text-emerald-400 font-semibold">{chartRate.status}</span></span>
          </div>
        </div>

        {/* Right: Quick Fabric Cost Estimator (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-indigo-500/20 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  FabricIQ Instant Estimator
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Yield: {quickCalcResult.effectiveYieldPct}%
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Select standard fabric specifications to calculate commercial costing in real time.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {i18n.t('preset_label')}
                </label>
                <select
                  value={quickPresetId}
                  onChange={(e) => setQuickPresetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Order Quantity (Meters)
                  </label>
                  <input
                    type="number"
                    value={quickQuantity}
                    onChange={(e) => setQuickQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Margin %
                  </label>
                  <input
                    type="number"
                    value={quickMargin}
                    onChange={(e) => setQuickMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Production Cost:</span>
                <span className="text-sm font-bold text-slate-200">
                  {currencyService.format(
                    currencyService.convert(quickCalcResult.cost_per_meter, 'PKR', currentCurrency),
                    currentCurrency
                  )} / m
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Suggested Selling Price:</span>
                <span className="text-base font-extrabold text-indigo-400">
                  {currencyService.format(
                    currencyService.convert(quickCalcResult.selling_price, 'PKR', currentCurrency),
                    currentCurrency
                  )} / m
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Theoretical GSM: <strong>{quickCalcResult.estimatedGreyGSM} gsm</strong></span>
                <span>Required Grey: <strong>{quickCalcResult.requiredGreyInputMeters.toLocaleString()} m</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => onNavigateToCalculator(quickPresetId)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all"
            >
              <span>Open in FabricIQ Advanced Engine</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Quotations & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                {i18n.t('recent_estimates')}
              </h3>
            </div>
            <button
              onClick={onNavigateToSavedEstimates}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>{i18n.t('view_all_estimates')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {savedEstimates.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              {i18n.t('no_recent_estimates')}
            </div>
          ) : (
            <div className="space-y-3">
              {savedEstimates.map((est) => (
                <div
                  key={est.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-indigo-500/30 transition-all gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {est.referenceNo}
                      </span>
                      <h4 className="text-xs font-bold text-white">
                        {est.customerName}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {est.fabricType} • {(est.inputs.finishedLengthMeters || 0).toLocaleString()}m
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-bold text-emerald-400">
                        {currencyService.format(
                          currencyService.convert(est.results.selling_price, est.currency, currentCurrency),
                          currentCurrency
                        )} / m
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Total: {currencyService.format(
                          currencyService.convert(est.results.totalOrderInvoiceValue, est.currency, currentCurrency),
                          currentCurrency
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => estimateService.generateQuotationPDF(est)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 transition-colors"
                      title="Download Official Quotation PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Specialized Textile Tools</span>
            </h3>

            <div className="space-y-2.5">
              <div
                onClick={() => onNavigateToTools('converter')}
                className="cursor-pointer p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {i18n.t('yarn_converter_title')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Ne, Nm, Denier, Tex, Dtex
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>

              <div
                onClick={() => onNavigateToTools('gsm')}
                className="cursor-pointer p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {i18n.t('gsm_calculator_title')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Theoretical GSM & Finished Weight
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>

              <div
                onClick={() => onNavigateToTools('consumption')}
                className="cursor-pointer p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                    Yarn Bags & Weight Requirement
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Order Warp/Weft Sourcing Planner
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
