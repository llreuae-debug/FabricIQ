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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              {i18n.t('market_rates_title')}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {i18n.t('market_rates_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Live Feeds</span>
          </button>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-2 animate-in fade-in">
          <ShieldCheck className="w-4 h-4" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={i18n.t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-slate-200">{filteredRates.length}</strong> verified commodities
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rates Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
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
            <tbody className="divide-y divide-slate-800/80">
              {filteredRates.map((rate) => {
                const convertedCurrent = currencyService.convert(rate.currentRate, rate.baseCurrency, currentCurrency);
                const convertedPrev = currencyService.convert(rate.previousRate, rate.baseCurrency, currentCurrency);
                const isPositive = rate.changePercent >= 0;

                return (
                  <tr
                    key={rate.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedModalRate(rate)}
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {rate.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {rate.spec}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-extrabold text-white text-sm">
                        {currencyService.format(convertedCurrent, currentCurrency)}
                        <span className="text-[11px] font-normal text-slate-400 ml-1">/ {rate.unit}</span>
                      </div>
                      {rate.baseCurrency !== currentCurrency && (
                        <div className="text-[10px] text-slate-500">
                          ({rate.baseCurrency} {rate.currentRate.toLocaleString()})
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-slate-400">
                      {currencyService.format(convertedPrev, currentCurrency)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? `+${rate.changePercent}%` : `${rate.changePercent}%`}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300 max-w-[180px] truncate" title={rate.source}>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{rate.source}</span>
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          rate.status === 'LIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : rate.status === 'MANUAL'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {rate.status}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {rate.lastUpdated}
                    </td>

                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          if (onSelectForCalculator) onSelectForCalculator(rate);
                          else setSelectedModalRate(rate);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Info className="w-3 h-3 text-indigo-400" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setSelectedModalRate(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {selectedModalRate.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      selectedModalRate.status === 'LIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {selectedModalRate.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {selectedModalRate.spec}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Verified Data Source:</span>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {selectedModalRate.source}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Timestamp of Latest Feed:</span>
                <span className="text-slate-200 font-mono">{selectedModalRate.lastUpdated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Base Trading Currency:</span>
                <span className="text-slate-200">{selectedModalRate.baseCurrency}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                7-Day Price History
              </h4>
              <div className="h-44 w-full p-2 rounded-xl bg-slate-950 border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedModalRate.history7d.map((h) => ({ date: h.date.substring(5), rate: h.rate }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                      formatter={(val: any) => [`₨ ${val} / ${selectedModalRate.unit}`, 'Rate']}
                    />
                    <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedModalRate(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
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
