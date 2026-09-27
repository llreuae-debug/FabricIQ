import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Users, 
  Coins, 
  Clock, 
  Plus, 
  Edit, 
  Check, 
  Server
} from 'lucide-react';
import type { CurrencyCode, MarketRate, Supplier, AuditLogEntry, RateCategory } from '../types';
import { marketRateService } from '../services/marketRateService';
import { currencyService, CURRENCY_MAP } from '../services/currencyService';
import { i18n } from '../services/i18n';

interface AdminPanelProps {
  currentCurrency?: CurrencyCode;
  onRatesUpdated: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onRatesUpdated }) => {
  const [activeTab, setActiveTab] = useState<'rates' | 'suppliers' | 'forex' | 'audit' | 'apis'>('rates');
  const [rates, setRates] = useState<MarketRate[]>(marketRateService.getRates());
  const suppliers = marketRateService.getSuppliers();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(marketRateService.getAuditLogs());

  // Edit Rate Modal State
  const [editingRate, setEditingRate] = useState<MarketRate | null>(null);
  const [overrideRateVal, setOverrideRateVal] = useState<number>(0);
  const [overrideStatus, setOverrideStatus] = useState<'LIVE' | 'MANUAL' | 'ESTIMATED'>('MANUAL');
  const [overrideSource, setOverrideSource] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string>('');

  // Add Rate State
  const [addRateModalOpen, setAddRateModalOpen] = useState<boolean>(false);
  const [newRateName, setNewRateName] = useState('');
  const [newRateSpec, setNewRateSpec] = useState('');
  const [newRateVal, setNewRateVal] = useState<number>(0);
  const [newRateUnit, setNewRateUnit] = useState('meter');
  const [newRateCategory, setNewRateCategory] = useState<RateCategory>('grey_fabric');
  const [newRateSource, setNewRateSource] = useState('');

  // Custom exchange rate editor state
  const [forexCur, setForexCur] = useState<CurrencyCode>('PKR');
  const [forexRateVal, setForexRateVal] = useState<number>(currencyService.getRateAgainstUSD('PKR'));

  const handleOpenEdit = (rate: MarketRate) => {
    setEditingRate(rate);
    setOverrideRateVal(rate.currentRate);
    setOverrideStatus(rate.status);
    setOverrideSource(rate.source);
    setAdminNotes(rate.notes || '');
  };

  const handleSaveOverride = () => {
    if (!editingRate) return;
    marketRateService.updateRate(
      editingRate.id,
      overrideRateVal,
      overrideStatus,
      overrideSource,
      'Senior Costing Admin',
      adminNotes
    );
    setRates(marketRateService.getRates());
    setAuditLogs(marketRateService.getAuditLogs());
    setEditingRate(null);
    onRatesUpdated();
    setActionNotice('Rate updated and logged to audit trail.');
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleCreateNewRate = () => {
    if (!newRateName || newRateVal <= 0) return;
    marketRateService.addRate({
      name: newRateName,
      spec: newRateSpec || 'Standard specification',
      currentRate: newRateVal,
      previousRate: newRateVal,
      changePercent: 0,
      unit: newRateUnit,
      baseCurrency: 'PKR',
      source: newRateSource || 'Admin Direct Entry',
      status: 'MANUAL',
      category: newRateCategory,
    });
    setRates(marketRateService.getRates());
    setAuditLogs(marketRateService.getAuditLogs());
    setAddRateModalOpen(false);
    onRatesUpdated();
    setActionNotice(`Added ${newRateName} to active commodity index.`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleUpdateForexRate = () => {
    if (forexRateVal <= 0) return;
    currencyService.setCustomRate(forexCur, forexRateVal);
    setActionNotice(`Updated exchange rate: 1 USD = ${forexRateVal} ${forexCur}`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              {i18n.t('admin_title')}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {i18n.t('admin_subtitle')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto scrollbar-none">
          {[
            { id: 'rates', label: 'Rate Management', icon: Database },
            { id: 'suppliers', label: 'Suppliers', icon: Users },
            { id: 'forex', label: 'Forex Engine', icon: Coins },
            { id: 'audit', label: 'Audit Trail', icon: Clock },
            { id: 'apis', label: 'API Connectors', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tab 1: Rate Management */}
      {activeTab === 'rates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Active Benchmark Market Rates
            </h3>
            <button
              onClick={() => setAddRateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Commodity</span>
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Rate Item</th>
                  <th className="p-3.5">Current Rate</th>
                  <th className="p-3.5">Data Status</th>
                  <th className="p-3.5">Verified Source</th>
                  <th className="p-3.5">Last Sync</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rates.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{r.name}</div>
                      <div className="text-[10px] text-slate-400">{r.spec}</div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-200">
                      ₨ {r.currentRate.toLocaleString()} / {r.unit}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          r.status === 'LIVE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 truncate max-w-[180px]">
                      {r.source}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {r.lastUpdated}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-3 h-3 text-indigo-400" />
                        <span>Override</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Approved Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">
            Approved Spinning & Weaving Mills Directory
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((s: Supplier) => (
              <div key={s.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{s.name}</h4>
                  <span className="text-xs font-bold text-amber-400">★ {s.reliabilityScore}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {s.city}, {s.country} • Phone: {s.phone}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {s.categories.map((c) => (
                    <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {c.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Forex & Currency Engine */}
      {activeTab === 'forex' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-indigo-400" />
              <span>Update Exchange Rate (vs 1 USD)</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Currency</label>
              <select
                value={forexCur}
                onChange={(e) => {
                  const c = e.target.value as CurrencyCode;
                  setForexCur(c);
                  setForexRateVal(currencyService.getRateAgainstUSD(c));
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                {Object.values(CURRENCY_MAP).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Rate (1 USD = X {forexCur})
              </label>
              <input
                type="number"
                step="0.01"
                value={forexRateVal}
                onChange={(e) => setForexRateVal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white font-mono"
              />
            </div>

            <button
              onClick={handleUpdateForexRate}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Update Forex Rate
            </button>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white">Live Benchmark Forex Table</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.values(CURRENCY_MAP).map((c) => {
                const currentVal = currencyService.getRateAgainstUSD(c.code);
                return (
                  <div key={c.code} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                    </div>
                    <div className="text-base font-extrabold text-white font-mono">
                      {c.symbol} {currentVal}
                    </div>
                    <span className="text-[10px] text-slate-500">per 1 USD</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Trail Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Audit Trail & Rate Modification Log</span>
          </h3>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                      {log.action}
                    </span>
                    <strong className="text-white">{log.rateName}</strong>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{log.timestamp}</span>
                </div>

                <div className="text-slate-300">
                  Changed by: <span className="font-semibold text-slate-100">{log.user}</span>
                </div>

                <div className="flex items-center gap-4 text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Old: <strong className="text-rose-400">{log.oldValue}</strong></span>
                  <span>→</span>
                  <span>New: <strong className="text-emerald-400">{log.newValue}</strong></span>
                  <span className="ml-auto text-[11px] text-slate-500">Source: {log.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: API Connectors & Health */}
      {activeTab === 'apis' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">External Market API Connectors</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'Karachi Cotton Association (KCA) Gateway', latency: '42ms', status: 'Operational', lastSync: '10 mins ago' },
              { name: 'Faisalabad Yarn Exchange REST API', latency: '68ms', status: 'Operational', lastSync: '5 mins ago' },
              { name: 'China Cotton Index (CCI) Connector', latency: '110ms', status: 'Operational', lastSync: '15 mins ago' },
              { name: 'Forex Interbank Exchange Rates Feed', latency: '35ms', status: 'Operational', lastSync: '1 min ago' },
            ].map((api, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{api.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {api.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Latency: <strong className="text-slate-200">{api.latency}</strong></span>
                  <span>Last Checked: {api.lastSync}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Override Modal */}
      {editingRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Override Market Rate: {editingRate.name}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Rate Value (₨)</label>
              <input
                type="number"
                value={overrideRateVal}
                onChange={(e) => setOverrideRateVal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rate Status</label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="MANUAL">MANUAL (Admin Verified)</option>
                <option value="LIVE">LIVE (Connected)</option>
                <option value="ESTIMATED">ESTIMATED (Interpolated)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Source / Justification</label>
              <input
                type="text"
                value={overrideSource}
                onChange={(e) => setOverrideSource(e.target.value)}
                placeholder="e.g. Circular #84, direct broker quotation..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Internal Notes</label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Reason for change..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingRate(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverride}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
              >
                Save & Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Rate Modal */}
      {addRateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add New Market Commodity</h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Commodity Name</label>
              <input
                type="text"
                placeholder="e.g. 60/1 Compact Cotton Yarn"
                value={newRateName}
                onChange={(e) => setNewRateName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Specification</label>
              <input
                type="text"
                placeholder="e.g. 100% Giza Cotton"
                value={newRateSpec}
                onChange={(e) => setNewRateSpec(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Category</label>
                <select
                  value={newRateCategory}
                  onChange={(e) => setNewRateCategory(e.target.value as RateCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="cotton_yarn">Cotton Yarn</option>
                  <option value="poly_yarn">Polyester & Blends</option>
                  <option value="grey_fabric">Grey Fabric</option>
                  <option value="weaving">Weaving</option>
                  <option value="processing">Processing</option>
                  <option value="dyeing">Dyeing</option>
                  <option value="chemicals">Chemicals</option>
                  <option value="energy">Energy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Source</label>
                <input
                  type="text"
                  placeholder="e.g. KCA / Faisalabad Exchange"
                  value={newRateSource}
                  onChange={(e) => setNewRateSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Price (₨)</label>
                <input
                  type="number"
                  value={newRateVal}
                  onChange={(e) => setNewRateVal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Unit</label>
                <input
                  type="text"
                  value={newRateUnit}
                  onChange={(e) => setNewRateUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAddRateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewRate}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
              >
                Add Commodity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
