import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Activity, 
  X,
  Clock,
  Calculator
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

  const activeFxHistory = 
    fxTimeframe === '1d' ? (liveFX.history1d || []) :
    fxTimeframe === '7d' ? liveFX.history7d :
    fxTimeframe === '30d' ? liveFX.history30d :
    fxTimeframe === '90d' ? (liveFX.history90d || liveFX.history30d) :
    (liveFX.history1y || liveFX.history30d);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Top Header Card */}
      <div className="card-soft-lg p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-subtle)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[12px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30 flex items-center justify-center text-[#3B82F6] dark:text-[#67E8F9]">
                <Activity className="w-4 h-4" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-['Outfit'] tracking-tight">
                Live Market Intelligence Feeds
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Verified textile commodity benchmarks, yarn indices, weaving tariffs, and live currency exchange.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="btn-tactile btn-soft-primary flex items-center gap-2 px-4 py-2 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Market Feeds</span>
            </button>
          </div>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3.5 rounded-[16px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-2 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* 2. PROMINENT LIVE USD / PKR FOREIGN EXCHANGE CARD */}
      <div className="card-soft-lg p-6 bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-subtle)] space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-[var(--border-subtle)]">
          
          {/* Main FX Rate Quote */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                USD / PKR Live Interbank
              </span>
              <span className="pill-base pill-live">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse" />
                LIVE FEED
              </span>
            </div>

            <div className="flex items-baseline gap-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-tabular tracking-tight text-[var(--text-primary)]">
                1 USD = ₨ {liveFX.currentRate.toFixed(2)}
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-bold font-tabular ${
                  liveFX.changePercent >= 0 ? 'text-[#10B981] dark:text-[#6EE7B7]' : 'text-rose-500'
                }`}
              >
                {liveFX.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{liveFX.changePercent >= 0 ? `+${liveFX.changePercent}%` : `${liveFX.changePercent}%`}</span>
                <span className="text-xs opacity-75">
                  ({liveFX.changeAmount >= 0 ? `+₨ ${liveFX.changeAmount.toFixed(2)}` : `-₨ ${Math.abs(liveFX.changeAmount).toFixed(2)}`})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 text-xs text-[var(--text-muted)]">
              <span>Source: <strong className="text-[var(--text-secondary)]">{liveFX.source}</strong></span>
              <span>•</span>
              <span>Rate ID: <strong className="font-mono text-[#3B82F6] dark:text-[#67E8F9]">{liveFX.rateId}</strong></span>
            </div>
          </div>

          {/* Refresh Timer & Manual Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">10-Min Auto Refresh</span>
                <span className="font-tabular text-[#3B82F6] dark:text-[#67E8F9] font-bold">
                  {Math.floor(liveFX.nextRefreshSecondsRemaining / 60)}m {liveFX.nextRefreshSecondsRemaining % 60}s
                </span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] flex items-center justify-between gap-3">
                <span>Updated: <strong>{liveFX.lastUpdated}</strong></span>
                <span>Next: <strong>{liveFX.nextRefresh}</strong></span>
              </div>
            </div>

            <button
              onClick={handleManualFXRefresh}
              disabled={isFXManualRefreshing}
              className="btn-tactile btn-soft-primary flex items-center gap-2 px-4 py-3 text-xs font-bold cursor-pointer disabled:opacity-50 shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${isFXManualRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Now</span>
            </button>
          </div>
        </div>

        {/* Telemetry KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="card-soft-inset p-3">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">Bid Rate</span>
            <span className="font-tabular font-bold text-sm text-[var(--text-primary)]">₨ {liveFX.bidRate.toFixed(2)}</span>
          </div>

          <div className="card-soft-inset p-3">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">Ask Rate</span>
            <span className="font-tabular font-bold text-sm text-[var(--text-primary)]">₨ {liveFX.askRate.toFixed(2)}</span>
          </div>

          <div className="card-soft-inset p-3">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">Mid-Market</span>
            <span className="font-tabular font-bold text-sm text-[#3B82F6] dark:text-[#67E8F9]">₨ {liveFX.midMarketRate.toFixed(2)}</span>
          </div>

          <div className="card-soft-inset p-3">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">Previous</span>
            <span className="font-tabular font-bold text-sm text-[var(--text-primary)]">₨ {liveFX.previousRate.toFixed(2)}</span>
          </div>

          <div className="card-soft-inset p-3">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">Bid / Ask</span>
            <span className="font-tabular font-bold text-xs text-[var(--text-secondary)]">
              ₨ {liveFX.bidRate.toFixed(2)} - {liveFX.askRate.toFixed(2)}
            </span>
          </div>

          <div className="card-soft-inset p-3">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">Confidence</span>
            <span className="pill-base pill-live text-[9px] py-0 px-1 mt-0.5">HIGH (100%)</span>
          </div>
        </div>

        {/* Interactive FX Trend Chart with Timeframes */}
        <div className="pt-3">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Historical USD/PKR Exchange Trend
            </span>

            <div className="flex items-center bg-[var(--surface-subtle)] p-0.5 rounded-[12px] border border-[var(--border-subtle)] text-xs">
              {(['1d', '7d', '30d', '90d', '1y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setFxTimeframe(tf)}
                  className={`btn-tactile px-2.5 py-1 rounded-[8px] font-semibold transition-colors cursor-pointer uppercase ${
                    fxTimeframe === tf
                      ? 'bg-[var(--surface)] text-[#3B82F6] dark:text-[#67E8F9] font-bold shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeFxHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fxGradSoft" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#67E8F9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#67E8F9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(v) => `${v}`}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-elevated)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '14px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-soft-float)',
                  }}
                  formatter={(val: any) => [`₨ ${Number(val).toFixed(2)} PKR`, '1 USD']}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#fxGradSoft)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="card-soft p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commodity name, count spec (e.g., 20/1, 30/1), source..."
              className="input-soft w-full pl-9 pr-4 py-2 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn-tactile px-3.5 py-1.5 rounded-[12px] text-xs font-semibold whitespace-nowrap cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-[#6EA8FF]/20 text-[#3B82F6] dark:text-[#67E8F9] border-[#6EA8FF]/40 font-bold shadow-sm'
                  : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[#6EA8FF]/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Rate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRates.map((rate) => {
          const convertedCurrent = currencyService.convert(rate.currentRate, rate.baseCurrency, currentCurrency);
          const isPositive = rate.changePercent >= 0;

          return (
            <div
              key={rate.id}
              onClick={() => setSelectedModalRate(rate)}
              className="card-soft p-5 cursor-pointer hover:border-[#6EA8FF]/50 transition-all flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="pill-base pill-verified text-[10px] py-0 px-2 font-mono">
                    {rate.spec}
                  </span>
                  <span className="pill-base pill-live text-[9px] py-0 px-1.5">
                    {rate.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[#3B82F6] dark:group-hover:text-[#67E8F9] transition-colors line-clamp-1">
                  {rate.name}
                </h3>

                <div className="flex items-baseline justify-between mt-3">
                  <div className="text-2xl font-black font-tabular text-[var(--text-primary)]">
                    {currencyService.format(convertedCurrent, currentCurrency)}
                    <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/ {rate.unit}</span>
                  </div>

                  <div
                    className={`flex items-center gap-0.5 text-xs font-bold font-tabular ${
                      isPositive ? 'text-[#10B981] dark:text-[#6EE7B7]' : 'text-rose-500'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isPositive ? `+${rate.changePercent}%` : `${rate.changePercent}%`}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="truncate max-w-[150px]">{rate.source}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {rate.lastUpdated.split(' ')[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Rate Inspection Modal */}
      {selectedModalRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card-soft-elevated max-w-lg w-full p-6 space-y-5 rounded-[28px] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div>
                <span className="pill-base pill-verified text-[10px] mb-1 font-mono">
                  {selectedModalRate.spec}
                </span>
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Outfit']">
                  {selectedModalRate.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedModalRate(null)}
                className="btn-tactile p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] text-[11px] block">Current Benchmark</span>
                <span className="text-xl font-bold font-tabular text-[var(--text-primary)]">
                  {currencyService.format(
                    currencyService.convert(selectedModalRate.currentRate, selectedModalRate.baseCurrency, currentCurrency),
                    currentCurrency
                  )} / {selectedModalRate.unit}
                </span>
              </div>

              <div className="p-3 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] text-[11px] block">24h Movement</span>
                <span className={`text-base font-bold font-tabular ${selectedModalRate.changePercent >= 0 ? 'text-[#10B981]' : 'text-rose-500'}`}>
                  {selectedModalRate.changePercent >= 0 ? `+${selectedModalRate.changePercent}%` : `${selectedModalRate.changePercent}%`}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs space-y-1">
              <div className="text-[var(--text-muted)]">Source Attribution:</div>
              <div className="font-semibold text-[var(--text-primary)]">{selectedModalRate.source}</div>
              <div className="text-[11px] text-[var(--text-muted)]">Last Verified: {selectedModalRate.lastUpdated}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setSelectedModalRate(null)}
                className="btn-tactile btn-soft-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              {onSelectForCalculator && (
                <button
                  onClick={() => {
                    const r = selectedModalRate;
                    setSelectedModalRate(null);
                    onSelectForCalculator(r);
                  }}
                  className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Use in Calculator</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
