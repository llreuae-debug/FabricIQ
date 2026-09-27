import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Info, 
  Activity, 
  Database, 
  X 
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
import type { CurrencyCode, MarketRate } from '../types';
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

  const categories = [
    { id: 'all', label: i18n.t('filter_all') },
    { id: 'cotton_yarn', label: i18n.t('filter_cotton_yarn') },
    { id: 'poly_yarn', label: i18n.t('filter_poly_yarn') },
    { id: 'grey_fabric', label: i18n.t('filter_grey_fabric') },
    { id: 'processing', label: i18n.t('filter_processing') },
    { id: 'dyeing', label: 'Dyeing' },
    { id: 'chemicals', label: i18n.t('filter_chemicals') },
    { id: 'energy', label: i18n.t('filter_energy') },
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
            <span>Sync Live Feeds</span>
          </button>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-2 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{syncNotice}</span>
        </div>
      )}

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

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rates Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md dark:shadow-xl">
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
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
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

      {/* Rate Source Transparency Modal */}
      {selectedModalRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/30 p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setSelectedModalRate(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-indigo-600/20 border border-blue-200 dark:border-indigo-500/30 flex items-center justify-center text-blue-600 dark:text-indigo-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
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
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
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
