import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Tag,
  X,
  Sliders,
} from 'lucide-react';
import type {
  TextileReferenceUnion,
  ReferenceCategory,
  RateConfidence,
} from '../types/referenceTypes';
import type { CurrencyCode } from '../types';
import { referenceDatabaseService } from '../services/referenceDatabase';

interface TextileReferenceLibraryProps {
  currentCurrency?: CurrencyCode;
  onSelectForBOQ?: (refNo: string) => void;
  onSelectForCalculator?: (refNo: string) => void;
}

const CATEGORY_TABS: { id: ReferenceCategory | 'ALL'; label: string; countPrefix?: string }[] = [
  { id: 'ALL', label: 'All Catalog' },
  { id: 'yarn', label: 'Yarns (YRN)' },
  { id: 'woven_fabric', label: 'Woven Fabrics (FAB-W)' },
  { id: 'percale_product', label: 'Percale Products (PCL)' },
  { id: 'lawn_suit_product', label: 'Lawn Suits (SUIT)' },
  { id: 'thread', label: 'Threads (THR)' },
  { id: 'dyeing', label: 'Dyeing (DYE)' },
  { id: 'printing', label: 'Printing (PRT)' },
  { id: 'finishing', label: 'Finishing (FIN)' },
  { id: 'embroidery', label: 'Embroidery (EMB)' },
  { id: 'fibre', label: 'Fibres (FIB)' },
  { id: 'knit_fabric', label: 'Knits & Towels (FAB-K)' },
  { id: 'market_fabric', label: 'Market Fabrics (FAB-M)' },
];

export const TextileReferenceLibrary: React.FC<TextileReferenceLibraryProps> = ({
  currentCurrency: _currentCurrency,
  onSelectForBOQ,
  onSelectForCalculator,
}) => {
  const [references, setReferences] = useState<TextileReferenceUnion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ReferenceCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confidenceFilter, setConfidenceFilter] = useState<RateConfidence | 'ALL'>('ALL');
  const [selectedItem, setSelectedItem] = useState<TextileReferenceUnion | null>(null);
  
  // Override Modal state
  const [overrideModalItem, setOverrideModalItem] = useState<TextileReferenceUnion | null>(null);
  const [overrideRateInput, setOverrideRateInput] = useState<string>('');
  const [overrideReasonInput, setOverrideReasonInput] = useState<string>('');

  // Import / Export state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [csvInput, setCsvInput] = useState<string>('');
  const [importResult, setImportResult] = useState<{ imported: number; updated: number; errors: string[] } | null>(null);

  // New Reference Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRefNo, setNewRefNo] = useState<string>('');
  const [newMarketName, setNewMarketName] = useState<string>('');
  const [newStandardName, setNewStandardName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<ReferenceCategory>('yarn');
  const [newBaseRate, setNewBaseRate] = useState<string>('');
  const [newUnit, setNewUnit] = useState<string>('kg');
  const [newConfidence, setNewConfidence] = useState<RateConfidence>('VERIFIED MARKET');
  const [newRegion, setNewRegion] = useState<string>('Faisalabad');
  const [addError, setAddError] = useState<string>('');

  const metrics = referenceDatabaseService.getDashboardMetrics();

  const loadData = () => {
    setReferences(referenceDatabaseService.getAllReferences());
  };

  useEffect(() => {
    loadData();
    const unsub = referenceDatabaseService.subscribe(loadData);
    return () => unsub();
  }, []);

  const filteredItems = references.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (confidenceFilter !== 'ALL' && item.confidence !== confidenceFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      item.refNo.toLowerCase().includes(q) ||
      item.marketName.toLowerCase().includes(q) ||
      item.standardName.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.sourceInfo.marketRegion.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const getConfidenceBadge = (confidence: RateConfidence) => {
    switch (confidence) {
      case 'VERIFIED MARKET':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            VERIFIED MARKET
          </span>
        );
      case 'MARKET QUOTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <ShieldCheck className="w-3 h-3" />
            MARKET QUOTE
          </span>
        );
      case 'INDICATIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            INDICATIVE
          </span>
        );
      case 'MANUAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Edit2 className="w-3 h-3" />
            USER OVERRIDE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            {confidence}
          </span>
        );
    }
  };

  const handleSaveOverride = () => {
    if (!overrideModalItem) return;
    const rateNum = parseFloat(overrideRateInput);
    if (isNaN(rateNum) || rateNum <= 0) return;

    referenceDatabaseService.setUserOverride(
      overrideModalItem.refNo,
      rateNum,
      'Active User',
      overrideReasonInput || 'Direct commercial rate override'
    );
    setOverrideModalItem(null);
    setOverrideRateInput('');
    setOverrideReasonInput('');
  };

  const handleClearOverride = (refNo: string) => {
    referenceDatabaseService.clearUserOverride(refNo);
  };

  const handleExportCsv = () => {
    const csv = referenceDatabaseService.exportToCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FabricIQ_Textile_References_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCsv = () => {
    if (!csvInput.trim()) return;
    const res = referenceDatabaseService.importFromCsv(csvInput);
    setImportResult(res);
    setCsvInput('');
  };

  const handleCreateReference = () => {
    setAddError('');
    const rateNum = parseFloat(newBaseRate);
    if (!newRefNo || !newMarketName || isNaN(rateNum) || rateNum <= 0) {
      setAddError('Please enter a valid Ref No, Name, and positive Rate.');
      return;
    }

    const res = referenceDatabaseService.addReference({
      id: `ref-custom-${Date.now()}`,
      refNo: newRefNo.toUpperCase().trim(),
      prefix: (newRefNo.split('-')[0] as any) || 'YRN',
      category: newCategory,
      marketName: newMarketName.trim(),
      standardName: newStandardName.trim() || newMarketName.trim(),
      description: `Custom reference item ${newRefNo}`,
      unit: newUnit,
      baseRate: rateNum,
      currency: 'PKR',
      confidence: newConfidence,
      costingMethod: 'PER_UNIT',
      sourceInfo: {
        sourceName: 'User Added Reference',
        retrievedAt: new Date().toISOString(),
        marketRegion: newRegion as any,
      },
      rateHistory: [
        {
          timestamp: new Date().toISOString(),
          rate: rateNum,
          currency: 'PKR',
          unit: newUnit,
          confidence: newConfidence,
          source: 'User Entry',
        },
      ],
      tags: ['custom', newCategory],
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      qualityScore: 90,
    });

    if (res.success) {
      setShowAddModal(false);
      setNewRefNo('');
      setNewMarketName('');
      setNewStandardName('');
      setNewBaseRate('');
    } else {
      setAddError(res.error || 'Failed to add reference.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#0d1527] via-[#111e38] to-[#0d1527] border border-cyan-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Database className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                Pakistani Textile Intelligence Database
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] tracking-tight">
              Textile Reference Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Standardized production benchmark catalog covering <span className="text-cyan-300 font-semibold">Fibre → Yarn → Fabric → Dyeing → Printing → Finishing → Embroidery → BOQ</span>. Directly connected to the deterministic costing engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reference</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Database Telemetry KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
            <span className="text-slate-400 text-[11px] block">Total References</span>
            <span className="text-lg font-bold text-white font-mono">{metrics.totalReferences}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
            <span className="text-slate-400 text-[11px] block">Verified Market</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{metrics.verifiedCount}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
            <span className="text-slate-400 text-[11px] block">Yarns & Fabrics</span>
            <span className="text-lg font-bold text-cyan-400 font-mono">{metrics.yarns + metrics.woven}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
            <span className="text-slate-400 text-[11px] block">Processes & Print</span>
            <span className="text-lg font-bold text-purple-400 font-mono">{metrics.dyeing + metrics.printing + metrics.finishing}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
            <span className="text-slate-400 text-[11px] block">Data Quality</span>
            <span className="text-lg font-bold text-amber-400 font-mono">{metrics.avgQuality}%</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
            <span className="text-slate-400 text-[11px] block">Default Currency</span>
            <span className="text-lg font-bold text-slate-200 font-mono">PKR (₨)</span>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Confidence Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Ref No (e.g. YRN-001, FAB-W-001, PCL), Yarn Count, Lawn, Percale, City..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 w-full sm:w-48"
          >
            <option value="ALL">All Confidence Levels</option>
            <option value="VERIFIED MARKET">Verified Market Only</option>
            <option value="MARKET QUOTE">Market Quotes</option>
            <option value="INDICATIVE">Indicative Ranges</option>
            <option value="MANUAL">User Overrides</option>
          </select>
        </div>
      </div>

      {/* Reference Items Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="py-3 px-4">Ref No</th>
                <th className="py-3 px-4">Market Name & Spec</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Effective Rate</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Source & Region</th>
                <th className="py-3 px-4 text-center">Quality</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No references found matching your query "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const eff = referenceDatabaseService.getEffectiveRate(item.refNo);
                  const isOverride = eff.isOverride;

                  return (
                    <tr
                      key={item.refNo}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
                          {item.refNo}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                          {item.marketName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {item.standardName}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-mono text-slate-400 capitalize">
                          {item.category.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-bold text-sm text-slate-100 font-mono">
                          ₨ {eff.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          per {item.unit}
                          {isOverride && (
                            <span className="ml-1 text-[9px] text-purple-400 font-bold uppercase">(Override)</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getConfidenceBadge(eff.confidence)}
                      </td>

                      <td className="py-3.5 px-4 max-w-[180px]">
                        <div className="truncate text-slate-300 text-[11px]">{eff.source}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {item.sourceInfo.marketRegion}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="text-[11px] font-mono font-bold text-emerald-400">
                          {item.qualityScore || 95}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setOverrideModalItem(item);
                              setOverrideRateInput(eff.rate.toString());
                              setOverrideReasonInput(item.userOverride?.reason || '');
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs cursor-pointer"
                            title="Set User Rate Override"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {onSelectForBOQ && (
                            <button
                              onClick={() => onSelectForBOQ(item.refNo)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-medium cursor-pointer transition-colors"
                              title="Add to BOQ"
                            >
                              <Plus className="w-3 h-3" />
                              <span>BOQ</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30">
                  {selectedItem.refNo}
                </span>
                <span className="text-xs text-slate-400 uppercase font-mono">{selectedItem.category}</span>
                {getConfidenceBadge(selectedItem.confidence)}
              </div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">{selectedItem.marketName}</h2>
              <p className="text-xs text-slate-400">{selectedItem.standardName}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono">Description & Technical Purpose</span>
              <p className="text-slate-300 leading-relaxed">{selectedItem.description}</p>
            </div>

            {/* Pricing Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Base Benchmark Rate</span>
                <span className="text-base font-bold text-white font-mono">
                  ₨ {selectedItem.baseRate.toFixed(2)} / {selectedItem.unit}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Costing Method</span>
                <span className="text-base font-bold text-cyan-400 font-mono">{selectedItem.costingMethod}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Market Region</span>
                <span className="text-base font-bold text-slate-200">{selectedItem.sourceInfo.marketRegion}</span>
              </div>
            </div>

            {/* If Percale / Woven Fabric, show physical specifications */}
            {(selectedItem as any).weave && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-slate-200 font-mono text-[11px] uppercase">Fabric Construction Matrix</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div><span className="text-slate-500">Weave:</span> <span className="text-slate-300 font-medium">{(selectedItem as any).weave}</span></div>
                  <div><span className="text-slate-500">Warp / Weft:</span> <span className="text-slate-300 font-medium">{(selectedItem as any).warpCountNe}s × {(selectedItem as any).weftCountNe}s</span></div>
                  <div><span className="text-slate-500">EPI × PPI:</span> <span className="text-slate-300 font-medium">{(selectedItem as any).epi} × {(selectedItem as any).ppi}</span></div>
                  <div><span className="text-slate-500">Greige / Fin Width:</span> <span className="text-slate-300 font-medium">{(selectedItem as any).greigeWidthInches}" / {(selectedItem as any).finishedWidthInches}"</span></div>
                </div>
              </div>
            )}

            {/* Rate History Trail */}
            {selectedItem.rateHistory && selectedItem.rateHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">Rate Audit History</h4>
                <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-850 max-h-36 overflow-y-auto text-[11px]">
                  {selectedItem.rateHistory.map((h, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-white font-mono font-bold">₨ {h.rate.toFixed(2)}</span>
                        <span className="text-slate-500 ml-1.5">({h.source})</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(h.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              {onSelectForCalculator && (
                <button
                  onClick={() => {
                    const ref = selectedItem.refNo;
                    setSelectedItem(null);
                    onSelectForCalculator(ref);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer border border-slate-700"
                >
                  Open in Calculator
                </button>
              )}
              {onSelectForBOQ && (
                <button
                  onClick={() => {
                    const ref = selectedItem.refNo;
                    setSelectedItem(null);
                    onSelectForBOQ(ref);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Insert into BOQ →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Rate Override Modal */}
      {overrideModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-['Outfit']">Set Custom Rate Override</h3>
              <button onClick={() => setOverrideModalItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Overrides apply to your calculations and BOQs without altering the underlying benchmark database.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Item Ref No</label>
                <div className="font-mono font-bold text-cyan-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {overrideModalItem.refNo} • {overrideModalItem.marketName}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Base Reference Rate</label>
                <div className="font-mono text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  ₨ {overrideModalItem.baseRate.toFixed(2)} per {overrideModalItem.unit}
                </div>
              </div>

              <div>
                <label className="text-slate-200 font-bold block mb-1">New Override Rate (PKR)</label>
                <input
                  type="number"
                  step="any"
                  value={overrideRateInput}
                  onChange={(e) => setOverrideRateInput(e.target.value)}
                  placeholder="Enter custom rate..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Override Reason / Supplier Note</label>
                <input
                  type="text"
                  value={overrideReasonInput}
                  onChange={(e) => setOverrideReasonInput(e.target.value)}
                  placeholder="e.g. Special mill contract rate"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {overrideModalItem.userOverride && (
                <button
                  onClick={() => {
                    handleClearOverride(overrideModalItem.refNo);
                    setOverrideModalItem(null);
                  }}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Clear Override
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setOverrideModalItem(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOverride}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Save Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-['Outfit']">Import Textile References (CSV / Excel)</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste standard CSV lines. Format: <code className="text-cyan-300 font-mono">Ref No, Prefix, Category, Market Name, Standard Name, Unit, Base Rate, Currency, Confidence, Source, Region</code>
            </p>

            <textarea
              rows={6}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder={`"YRN-101","YRN","yarn","50s Combed Cotton","Ne 50/1 Combed Cotton","bag",4200,"PKR","VERIFIED MARKET","Faisalabad Market","Faisalabad"`}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />

            {importResult && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="text-emerald-400 font-bold">
                  ✓ Successfully imported: {importResult.imported}, Updated: {importResult.updated}
                </div>
                {importResult.errors.length > 0 && (
                  <div className="text-rose-400 text-[11px]">
                    Errors: {importResult.errors.join('; ')}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleImportCsv}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer"
              >
                Process Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reference Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-['Outfit']">Add New Reference Record</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {addError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Ref No (Unique)</label>
                <input
                  type="text"
                  value={newRefNo}
                  onChange={(e) => setNewRefNo(e.target.value)}
                  placeholder="e.g. YRN-025 or FAB-W-030"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 uppercase font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="yarn">Yarn (YRN)</option>
                  <option value="woven_fabric">Woven Fabric (FAB-W)</option>
                  <option value="knit_fabric">Knit & Towel (FAB-K)</option>
                  <option value="market_fabric">Market Fabric (FAB-M)</option>
                  <option value="thread">Thread (THR)</option>
                  <option value="dyeing">Dyeing (DYE)</option>
                  <option value="printing">Printing (PRT)</option>
                  <option value="finishing">Finishing (FIN)</option>
                  <option value="embroidery">Embroidery (EMB)</option>
                  <option value="fibre">Fibre (FIB)</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Market Name (Commercial / Pakistani)</label>
                <input
                  type="text"
                  value={newMarketName}
                  onChange={(e) => setNewMarketName(e.target.value)}
                  placeholder="e.g. 50s Combed Compact Yarn"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Standard Technical Name</label>
                <input
                  type="text"
                  value={newStandardName}
                  onChange={(e) => setNewStandardName(e.target.value)}
                  placeholder="e.g. Ne 50/1 100% Combed Compact Ring Spun"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Base Rate (₨ PKR)</label>
                <input
                  type="number"
                  step="any"
                  value={newBaseRate}
                  onChange={(e) => setNewBaseRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Unit</label>
                <select
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="kg">kg</option>
                  <option value="bag">bag (10 lbs)</option>
                  <option value="meter">meter</option>
                  <option value="cone">cone</option>
                  <option value="piece">piece</option>
                  <option value="1000_stitches">1,000 stitches</option>
                  <option value="maund">maund</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Confidence</label>
                <select
                  value={newConfidence}
                  onChange={(e) => setNewConfidence(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="VERIFIED MARKET">VERIFIED MARKET</option>
                  <option value="MARKET QUOTE">MARKET QUOTE</option>
                  <option value="INDICATIVE">INDICATIVE</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Region</label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Multan">Multan</option>
                  <option value="Pakistan Average">Pakistan Average</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReference}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Save Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
