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
  Sliders
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

const CATEGORY_TABS: { id: ReferenceCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All References' },
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
          <span className="pill-base pill-live">
            <CheckCircle2 className="w-3 h-3" />
            VERIFIED
          </span>
        );
      case 'MARKET QUOTE':
        return (
          <span className="pill-base pill-verified">
            <ShieldCheck className="w-3 h-3" />
            QUOTE
          </span>
        );
      case 'INDICATIVE':
        return (
          <span className="pill-base pill-indicative">
            <Clock className="w-3 h-3" />
            INDICATIVE
          </span>
        );
      case 'MANUAL':
        return (
          <span className="pill-base pill-manual">
            <Edit2 className="w-3 h-3" />
            OVERRIDE
          </span>
        );
      default:
        return (
          <span className="pill-base pill-stale">
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
      
      {/* 1. Header Card */}
      <div className="card-soft-lg p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-subtle)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-[14px] bg-[#6EA8FF]/15 text-[#3B82F6] dark:text-[#67E8F9] border border-[#6EA8FF]/20">
                <Database className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-[#3B82F6] dark:text-[#67E8F9] uppercase">
                Textile Reference Database
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-['Outfit'] tracking-tight">
              Textile Reference Library
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Search verified yarn, fabric, dyeing, printing, finishing, and embroidery production references with live deterministic rate propagation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-tactile btn-soft-primary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reference</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-tactile btn-soft-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#6EA8FF]" />
              <span>Import</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="btn-tactile btn-soft-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#6EE7B7]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Database Telemetry KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-[var(--border-subtle)] text-xs">
          <div className="card-soft-inset p-3">
            <span className="text-[var(--text-muted)] text-[11px] block">Total References</span>
            <span className="text-lg font-bold font-tabular text-[var(--text-primary)]">{metrics.totalReferences}</span>
          </div>
          <div className="card-soft-inset p-3">
            <span className="text-[var(--text-muted)] text-[11px] block">Verified Market</span>
            <span className="text-lg font-bold font-tabular text-[#10B981] dark:text-[#6EE7B7]">{metrics.verifiedCount}</span>
          </div>
          <div className="card-soft-inset p-3">
            <span className="text-[var(--text-muted)] text-[11px] block">Yarns & Fabrics</span>
            <span className="text-lg font-bold font-tabular text-[#3B82F6] dark:text-[#67E8F9]">{metrics.yarns + metrics.woven}</span>
          </div>
          <div className="card-soft-inset p-3">
            <span className="text-[var(--text-muted)] text-[11px] block">Processes & Print</span>
            <span className="text-lg font-bold font-tabular text-[#8B5CF6] dark:text-[#C4B5FD]">{metrics.dyeing + metrics.printing + metrics.finishing}</span>
          </div>
          <div className="card-soft-inset p-3">
            <span className="text-[var(--text-muted)] text-[11px] block">Data Quality</span>
            <span className="text-lg font-bold font-tabular text-[#F59E0B] dark:text-[#FDE68A]">{metrics.avgQuality}%</span>
          </div>
          <div className="card-soft-inset p-3">
            <span className="text-[var(--text-muted)] text-[11px] block">Base Currency</span>
            <span className="text-lg font-bold font-tabular text-[var(--text-primary)]">PKR (₨)</span>
          </div>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`btn-tactile px-3.5 py-1.5 rounded-[14px] text-xs font-semibold whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-[#6EA8FF]/20 text-[#3B82F6] dark:text-[#67E8F9] border-[#6EA8FF]/40 font-bold shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[#6EA8FF]/30'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Search & Confidence Filter Bar */}
      <div className="card-soft p-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Ref No, yarn count, fabric construction, dyeing, printing..."
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
          <select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value as any)}
            className="input-soft px-3 py-2 text-xs w-full sm:w-48 cursor-pointer"
          >
            <option value="ALL">All Confidence Levels</option>
            <option value="VERIFIED MARKET">Verified Market Only</option>
            <option value="MARKET QUOTE">Market Quotes</option>
            <option value="INDICATIVE">Indicative Ranges</option>
            <option value="MANUAL">User Overrides</option>
          </select>
        </div>
      </div>

      {/* 4. References Table with Soft Rows */}
      <div className="card-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] uppercase tracking-wider font-mono text-[10px]">
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
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--text-muted)]">
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
                      className="hover:bg-[var(--surface-subtle)]/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#3B82F6] dark:text-[#67E8F9] whitespace-nowrap">
                        <span className="px-2 py-1 rounded-[8px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30">
                          {item.refNo}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-[var(--text-primary)] group-hover:text-[#3B82F6] dark:group-hover:text-[#67E8F9] transition-colors truncate">
                          {item.marketName}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] truncate">
                          {item.standardName}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-mono text-[var(--text-muted)] capitalize">
                          {item.category.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-bold text-sm font-tabular text-[var(--text-primary)]">
                          ₨ {eff.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          per {item.unit}
                          {isOverride && (
                            <span className="ml-1 text-[9px] text-purple-500 font-bold uppercase">(Override)</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getConfidenceBadge(eff.confidence)}
                      </td>

                      <td className="py-3.5 px-4 max-w-[180px]">
                        <div className="truncate text-[var(--text-secondary)] text-[11px]">{eff.source}</div>
                        <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {item.sourceInfo.marketRegion}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="text-[11px] font-mono font-bold text-[#10B981] dark:text-[#6EE7B7]">
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
                            className="btn-tactile p-1.5 rounded-[10px] bg-[var(--surface-subtle)] hover:bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] text-xs cursor-pointer"
                            title="Set User Rate Override"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {onSelectForBOQ && (
                            <button
                              onClick={() => onSelectForBOQ(item.refNo)}
                              className="btn-tactile flex items-center gap-1 px-2.5 py-1 rounded-[10px] bg-[#6EA8FF]/15 hover:bg-[#6EA8FF]/30 text-[#3B82F6] dark:text-[#67E8F9] border border-[#6EA8FF]/30 text-xs font-semibold cursor-pointer"
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

      {/* 5. Reference Detail Panel / Bottom Sheet */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card-soft-elevated max-w-2xl w-full p-6 space-y-5 rounded-[28px] border border-[var(--border-subtle)] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="btn-tactile absolute top-4 right-4 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-1 rounded-[8px] bg-[#6EA8FF]/15 text-[#3B82F6] dark:text-[#67E8F9] font-bold border border-[#6EA8FF]/30">
                  {selectedItem.refNo}
                </span>
                <span className="text-xs text-[var(--text-muted)] uppercase font-mono">{selectedItem.category}</span>
                {getConfidenceBadge(selectedItem.confidence)}
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Outfit']">{selectedItem.marketName}</h2>
              <p className="text-xs text-[var(--text-secondary)]">{selectedItem.standardName}</p>
            </div>

            <div className="p-4 rounded-[18px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-1.5 text-xs">
              <span className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-mono">Specification & Description</span>
              <p className="text-[var(--text-primary)] leading-relaxed">{selectedItem.description}</p>
            </div>

            {/* Pricing Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] text-[11px] block">Current Benchmark Rate</span>
                <span className="text-base font-bold font-tabular text-[var(--text-primary)]">
                  ₨ {selectedItem.baseRate.toFixed(2)} / {selectedItem.unit}
                </span>
              </div>
              <div className="p-3 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] text-[11px] block">Costing Method</span>
                <span className="text-base font-bold font-mono text-[#3B82F6] dark:text-[#67E8F9]">{selectedItem.costingMethod}</span>
              </div>
              <div className="p-3 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] text-[11px] block">Market Region</span>
                <span className="text-base font-bold text-[var(--text-primary)]">{selectedItem.sourceInfo.marketRegion}</span>
              </div>
            </div>

            {/* Rate History Trail */}
            {selectedItem.rateHistory && selectedItem.rateHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono uppercase">Rate Audit History</h4>
                <div className="rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] max-h-36 overflow-y-auto text-[11px]">
                  {selectedItem.rateHistory.map((h, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-tabular font-bold text-[var(--text-primary)]">₨ {h.rate.toFixed(2)}</span>
                        <span className="text-[var(--text-muted)] ml-1.5">({h.source})</span>
                      </div>
                      <span className="text-[var(--text-muted)] text-[10px] font-mono">
                        {new Date(h.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
              {onSelectForCalculator && (
                <button
                  onClick={() => {
                    const ref = selectedItem.refNo;
                    setSelectedItem(null);
                    onSelectForCalculator(ref);
                  }}
                  className="btn-tactile btn-soft-secondary px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Use in Calculator
                </button>
              )}
              {onSelectForBOQ && (
                <button
                  onClick={() => {
                    const ref = selectedItem.refNo;
                    setSelectedItem(null);
                    onSelectForBOQ(ref);
                  }}
                  className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold cursor-pointer shadow-md"
                >
                  Add to BOQ →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rate Override Modal */}
      {overrideModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card-soft-elevated max-w-md w-full p-6 space-y-4 rounded-[28px] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Outfit']">Set Custom Rate Override</h3>
              <button onClick={() => setOverrideModalItem(null)} className="btn-tactile text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Overrides apply to your session and BOQs without modifying the global benchmark feed.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--text-muted)] block mb-1">Item Ref No</label>
                <div className="font-mono font-bold text-[#3B82F6] dark:text-[#67E8F9] p-2.5 rounded-[12px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                  {overrideModalItem.refNo} • {overrideModalItem.marketName}
                </div>
              </div>

              <div>
                <label className="text-[var(--text-muted)] block mb-1">Base Reference Rate</label>
                <div className="font-tabular font-semibold text-[var(--text-primary)] p-2.5 rounded-[12px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                  ₨ {overrideModalItem.baseRate.toFixed(2)} per {overrideModalItem.unit}
                </div>
              </div>

              <div>
                <label className="text-[var(--text-primary)] font-bold block mb-1">New Override Rate (PKR)</label>
                <input
                  type="number"
                  step="any"
                  value={overrideRateInput}
                  onChange={(e) => setOverrideRateInput(e.target.value)}
                  placeholder="Enter custom rate..."
                  className="input-soft w-full px-3 py-2 text-xs font-tabular"
                />
              </div>

              <div>
                <label className="text-[var(--text-muted)] block mb-1">Reason / Supplier Note</label>
                <input
                  type="text"
                  value={overrideReasonInput}
                  onChange={(e) => setOverrideReasonInput(e.target.value)}
                  placeholder="e.g. Supplier agreed discount"
                  className="input-soft w-full px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setOverrideModalItem(null)}
                  className="btn-tactile btn-soft-secondary px-4 py-2 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOverride}
                  className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Save Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Reference Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card-soft-elevated max-w-lg w-full p-6 space-y-4 rounded-[28px] border border-[var(--border-subtle)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Outfit']">Add New Textile Reference</h3>
              <button onClick={() => setShowAddModal(false)} className="btn-tactile text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                ✕
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-[12px] bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs">
                {addError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Ref No (e.g. YRN-101)</label>
                  <input
                    type="text"
                    value={newRefNo}
                    onChange={(e) => setNewRefNo(e.target.value)}
                    className="input-soft w-full px-3 py-2 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="input-soft w-full px-3 py-2 text-xs cursor-pointer"
                  >
                    <option value="yarn">Yarn (YRN)</option>
                    <option value="woven_fabric">Woven Fabric (FAB-W)</option>
                    <option value="knit_fabric">Knit Fabric (FAB-K)</option>
                    <option value="dyeing">Dyeing (DYE)</option>
                    <option value="printing">Printing (PRT)</option>
                    <option value="finishing">Finishing (FIN)</option>
                    <option value="embroidery">Embroidery (EMB)</option>
                    <option value="percale_product">Percale Product (PCL)</option>
                    <option value="lawn_suit_product">Lawn Suit (SUIT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Market Name / Construction</label>
                <input
                  type="text"
                  value={newMarketName}
                  onChange={(e) => setNewMarketName(e.target.value)}
                  placeholder="e.g. 30/1 Combed Cotton Compact"
                  className="input-soft w-full px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Rate (PKR)</label>
                  <input
                    type="number"
                    step="any"
                    value={newBaseRate}
                    onChange={(e) => setNewBaseRate(e.target.value)}
                    className="input-soft w-full px-3 py-2 text-xs font-tabular"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="kg, m, 10lbs"
                    className="input-soft w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Confidence</label>
                  <select
                    value={newConfidence}
                    onChange={(e) => setNewConfidence(e.target.value as RateConfidence)}
                    className="input-soft w-full px-3 py-2 text-xs font-semibold cursor-pointer"
                  >
                    <option value="VERIFIED MARKET">VERIFIED MARKET</option>
                    <option value="INDICATIVE">INDICATIVE</option>
                    <option value="MANUAL ENTRY">MANUAL ENTRY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Region</label>
                  <input
                    type="text"
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    placeholder="Faisalabad"
                    className="input-soft w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-tactile btn-soft-secondary px-4 py-2 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReference}
                  className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Create Reference
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card-soft-elevated max-w-lg w-full p-6 space-y-4 rounded-[28px] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Outfit']">Import References (CSV)</h3>
              <button onClick={() => { setShowImportModal(false); setImportResult(null); }} className="btn-tactile text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                ✕
              </button>
            </div>

            {importResult && (
              <div className="p-3 rounded-[14px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
                Successfully imported {importResult.imported} new and updated {importResult.updated} references.
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-[var(--text-secondary)]">
                Paste CSV formatted text with columns: <code>RefNo, Category, MarketName, BaseRate, Unit, Confidence, Region</code>
              </p>
              <textarea
                rows={6}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="YRN-099,yarn,32/1 Carded,640,kg,VERIFIED MARKET,Faisalabad"
                className="input-soft w-full p-3 text-xs font-mono"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => { setShowImportModal(false); setImportResult(null); }}
                  className="btn-tactile btn-soft-secondary px-4 py-2 text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleImportCsv}
                  className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Import Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
