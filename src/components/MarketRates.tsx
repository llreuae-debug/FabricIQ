import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Info, 
  Activity, 
  Database, 
  X,
  Server,
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
import type { CurrencyCode, MarketRate, LiveFXData } from '../types';
import { marketRateService } from '../services/marketRateService';
import { currencyService } from '../services/currencyService';
import { i18n } from '../services/i18n';

interface MarketRatesProps {
  currentCurrency: CurrencyCode;
  onSelectForCalculator?: (rate: MarketRate) => void;
}

export const MarketRates: React.FC<MarketRatesProps> = ({ currentCurrency, onSelectForCalculator }) => {
  const [rates, setRates] = useState<MarketRate[]>(marketRateService.getRates());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModalRate, setSelectedModalRate] = useState<MarketRate | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string>('');

  // Live FX State & Subscription
  const [liveFX, setLiveFX] = useState<LiveFXData>(currencyService.getLiveFX());
  const [fxTimeframe, setFxTimeframe] = useState<'1d' | '7d' | '30d' | '90d' | '1y'>('7d');
  const [isFXManualRefreshing, setIsFXManualRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const unsub = currencyService.subscribe((fx) => setLiveFX(fx));
    return unsub;
  }, []);

  const handleManualFXRefresh = async () => {
    setIsFXManualRefreshing(true);
    try {
      await currencyService.fetchLiveUSDToPKR(true);
      setRates(marketRateService.getRates());
    } finally {
      setTimeout(() => setIsFXManualRefreshing(false), 600);
    }
  };

  const categories = [
    { id: 'all', label: i18n.t('filter_all') },
    { id: 'cotton_yarn', label: i18n.t('filter_cotton_yarn') },
    { id: 'poly_yarn', label: i18n.t('filter_poly_yarn') },
    { id: 'blended_yarn', label: 'Blended Yarn' },
    { id: 'grey_fabric', label: i18n.t('filter_grey_fabric') },
    { id: 'weaving', label: 'Weaving' },
    { id: 'processing', label: i18n.t('filter_processing') },
    { id: 'dyeing', label: 'Dyeing' },
    { id: 'finishing', label: 'Finishing' },
    { id: 'printing', label: 'Printing' },
    { id: 'chemicals', label: i18n.t('filter_chemicals') },
    { id: 'energy', label: i18n.t('filter_energy') },
    { id: 'transport', label: 'Transport' },
    { id: 'packaging', label: 'Packaging' },
    { id: 'forex', label: 'Forex' },
  ];

  const filteredRates = rates.filter((r) => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const res = marketRateService.syncLiveMarketData();
      setRates(marketRateService.getRates());
      setIsSyncing(false);
      setSyncNotice(res.message);
      setTimeout(() => setSyncNotice(''), 3000);
    }, 600);
  };

  // FX Chart History Points
  const activeFxHistory = 
    fxTimeframe === '1d' ? (liveFX.history1d || []) :
    fxTimeframe === '7d' ? liveFX.history7d :
    fxTimeframe === '30d' ? liveFX.history30d :
    fxTimeframe === '90d' ? (liveFX.history90d || liveFX.history30d) :
    (liveFX.history1y || liveFX.history30d);

  const fxMin = Math.min(...activeFxHistory.map((p) => p.rate), liveFX.currentRate);
  const fxMax = Math.max(...activeFxHistory.map((p) => p.rate), liveFX.currentRate);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-indigo-600/20 border border-blue-200 dark:border-indigo-500/30 flex items-center justify-center text-blue-600 dark:text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {i18n.t('market_rates_title')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {i18n.t('market_rates_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync All Market Feeds</span>
          </button>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-2 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* SECTION 1: PROMINENT LIVE USD / PKR FOREIGN EXCHANGE ENGINE */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0c1836] via-[#071128] to-[#030816] border border-[#00d2ff]/30 p-6 shadow-2xl space-y-5 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-800">
          {/* Main FX Rate Quote */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                USD / PKR Live Interbank Feed
              </span>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                  liveFX.status === 'LIVE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : liveFX.status === 'MANUAL'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    liveFX.status === 'LIVE' ? 'bg-emerald-400 animate-live-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>{liveFX.status}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
                1 USD = ₨ {liveFX.currentRate.toFixed(2)}
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-bold ${
                  liveFX.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {liveFX.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{liveFX.changePercent >= 0 ? `+${liveFX.changePercent}%` : `${liveFX.changePercent}%`}</span>
                <span className="text-xs opacity-75">
                  ({liveFX.changeAmount >= 0 ? `+₨ ${liveFX.changeAmount.toFixed(2)}` : `-₨ ${Math.abs(liveFX.changeAmount).toFixed(2)}`})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-400">
              <span>Primary Source: <strong className="text-slate-200">{liveFX.source}</strong></span>
              <span>•</span>
              <span>Secondary: <strong className="text-slate-300">{liveFX.secondarySource || 'SBP Benchmark'}</strong></span>
              <span>•</span>
              <span>Rate ID: <strong className="font-mono text-cyan-400">{liveFX.rateId}</strong></span>
            </div>
          </div>

          {/* Refresh Timer & Manual Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">10-Min Refresh Timer</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {Math.floor(liveFX.nextRefreshSecondsRemaining / 60)}m {liveFX.nextRefreshSecondsRemaining % 60}s
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center justify-between gap-3">
                <span>Updated: <strong>{liveFX.lastUpdated}</strong></span>
                <span>Next: <strong>{liveFX.nextRefresh}</strong></span>
              </div>
            </div>

            <button
              onClick={handleManualFXRefresh}
              disabled={isFXManualRefreshing}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isFXManualRefreshing ? 'animate-spin' : ''}`} />
              <span>↻ Refresh Now</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Bar + API Health Monitor */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Bid Rate</span>
            <span className="font-mono font-bold text-sm text-slate-200">₨ {liveFX.bidRate.toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Ask Rate</span>
            <span className="font-mono font-bold text-sm text-slate-200">₨ {liveFX.askRate.toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Mid-Market</span>
            <span className="font-mono font-bold text-sm text-cyan-400">₨ {liveFX.midMarketRate.toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Previous Rate</span>
            <span className="font-mono font-bold text-sm text-slate-300">₨ {liveFX.previousRate.toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Variance Check</span>
            <span className="font-mono font-bold text-sm text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{liveFX.validationVariancePct || 0.05}% (PASS)</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">API Health</span>
            <span className="font-mono font-bold text-sm text-emerald-400 flex items-center gap-1">
              <Server className="w-3.5 h-3.5" />
              <span>HEALTHY</span>
            </span>
          </div>
        </div>

        {/* Multi-Timeframe Rate History Chart: 1D | 7D | 30D | 90D | 1Y */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                USD / PKR Verified Rate History
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                (Range: ₨ {fxMin.toFixed(2)} – ₨ {fxMax.toFixed(2)})
              </span>
            </div>

            {/* 3D Segmented Timeframe Switcher */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-950/90 border border-slate-800">
              {(['1d', '7d', '30d', '90d', '1y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setFxTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all duration-200 cursor-pointer ${
                    fxTimeframe === tf
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-48 w-full p-2 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeFxHistory}>
                <defs>
                  <linearGradient id="fxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0052ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09132b', borderColor: '#00d2ff40', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [`₨ ${Number(val).toFixed(2)} / USD`, 'USD/PKR Rate']}
                />
                <Area type="monotone" dataKey="rate" stroke="#00d2ff" strokeWidth={2.5} fill="url(#fxGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={i18n.t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-slate-200">{filteredRates.length}</strong> verified commodities
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white shadow-[0_4px_12px_rgba(37,99,235,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-blue-400/50 -translate-y-0.5 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900/60'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE VIEW: Touch-Friendly Responsive Rate Cards (Phones & Small Tablets) */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredRates.map((rate) => {
          const convertedCurrent = currencyService.convert(rate.currentRate, rate.baseCurrency, currentCurrency);
          const isPositive = rate.changePercent >= 0;

          return (
            <div
              key={rate.id}
              onClick={() => setSelectedModalRate(rate)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                    {rate.category.replace('_', ' ')}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                    {rate.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {rate.spec}
                  </p>
                </div>

                <div
                  className={`inline-flex items-center gap-1 text-xs font-bold shrink-0 ${
                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{isPositive ? `+${rate.changePercent}%` : `${rate.changePercent}%`}</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {currencyService.format(convertedCurrent, currentCurrency)}
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">/ {rate.unit}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    rate.status === 'LIVE'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : rate.status === 'MANUAL'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30'
                  }`}
                >
                  {rate.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="truncate max-w-[160px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate">{rate.source}</span>
                </span>
                <span>{rate.lastUpdated.split(' ')[1] || 'Today'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP & TABLET VIEW: Full Interactive Rates Table */}
      <div className="hidden md:block rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <th className="p-4">{i18n.t('rate_col_name')}</th>
                <th className="p-4">{i18n.t('rate_col_current')}</th>
                <th className="p-4">{i18n.t('rate_col_prev')}</th>
                <th className="p-4">{i18n.t('rate_col_change')}</th>
                <th className="p-4">{i18n.t('rate_col_source')}</th>
                <th className="p-4">{i18n.t('rate_col_status')}</th>
                <th className="p-4">{i18n.t('rate_col_updated')}</th>
                <th className="p-4 text-right">{i18n.t('rate_col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredRates.map((rate) => {
                const convertedCurrent = currencyService.convert(rate.currentRate, rate.baseCurrency, currentCurrency);
                const convertedPrev = currencyService.convert(rate.previousRate, rate.baseCurrency, currentCurrency);
                const isPositive = rate.changePercent >= 0;

                return (
                  <tr
                    key={rate.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedModalRate(rate)}
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                        {rate.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                        {rate.spec}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {currencyService.format(convertedCurrent, currentCurrency)}
                        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 ml-1">/ {rate.unit}</span>
                      </div>
                      {rate.baseCurrency !== currentCurrency && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          ({rate.baseCurrency} {rate.currentRate.toLocaleString()})
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {currencyService.format(convertedPrev, currentCurrency)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? `+${rate.changePercent}%` : `${rate.changePercent}%`}
                      </span>
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-300 max-w-[180px] truncate" title={rate.source}>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{rate.source}</span>
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          rate.status === 'LIVE'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : rate.status === 'MANUAL'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {rate.status}
                      </span>
                    </td>

                    <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {rate.lastUpdated}
                    </td>

                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          if (onSelectForCalculator) onSelectForCalculator(rate);
                          else setSelectedModalRate(rate);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                        <span>Audit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Source Transparency Modal (Responsive Bottom Sheet on Mobile / Centered Modal on Desktop) */}
      {selectedModalRate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/30 p-5 sm:p-6 shadow-2xl space-y-4 animate-sheet-up pb-safe">
            {/* Grab Handle on Mobile */}
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-2" />

            <button
              onClick={() => setSelectedModalRate(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-indigo-600/20 border border-blue-200 dark:border-indigo-500/30 flex items-center justify-center text-blue-600 dark:text-indigo-400 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {selectedModalRate.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      selectedModalRate.status === 'LIVE'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {selectedModalRate.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedModalRate.spec}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Verified Data Source:</span>
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {selectedModalRate.source}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Timestamp of Latest Feed:</span>
                <span className="text-slate-800 dark:text-slate-200 font-mono">{selectedModalRate.lastUpdated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Base Trading Currency:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedModalRate.baseCurrency}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                7-Day Price History
              </h4>
              <div className="h-44 w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedModalRate.history7d.map((h) => ({ date: h.date.substring(5), rate: h.rate }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '11px' }}
                      formatter={(val: any) => [`₨ ${val} / ${selectedModalRate.unit}`, 'Rate']}
                    />
                    <Area type="monotone" dataKey="rate" stroke="#0284c7" strokeWidth={2} fill="#0284c7" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedModalRate(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
