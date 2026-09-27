import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Copy, 
  Trash2, 
  ArrowUpRight, 
  Check, 
  Plus
} from 'lucide-react';
import type { CurrencyCode, SavedEstimate } from '../types';
import { estimateService } from '../services/estimateService';
import { currencyService } from '../services/currencyService';

interface SavedEstimatesProps {
  currentCurrency: CurrencyCode;
  onOpenInCalculator: (estimate: SavedEstimate) => void;
  onNewEstimate: () => void;
}

export const SavedEstimates: React.FC<SavedEstimatesProps> = ({
  currentCurrency,
  onOpenInCalculator,
  onNewEstimate,
}) => {
  const [estimates, setEstimates] = useState<SavedEstimate[]>(estimateService.getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [feedbackNotice, setFeedbackNotice] = useState<string>('');

  const filtered = estimates.filter((e) => {
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.fabricType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.referenceNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDuplicate = (id: string) => {
    const dup = estimateService.duplicateEstimate(id);
    if (dup) {
      setEstimates(estimateService.getAll());
      setFeedbackNotice(`Quotation duplicated as ${dup.referenceNo}`);
      setTimeout(() => setFeedbackNotice(''), 2500);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this saved quotation?')) {
      estimateService.deleteEstimate(id);
      setEstimates(estimateService.getAll());
    }
  };

  const handleExportPDF = (estimate: SavedEstimate) => {
    estimateService.generateQuotationPDF(estimate);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-indigo-600/20 border border-blue-200 dark:border-indigo-500/30 flex items-center justify-center text-blue-600 dark:text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              FabricIQ Commercial Quotations & Saved Estimates
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Reproducible estimates with frozen market rate snapshots, auditable yield formulas and customer specifications
          </p>
        </div>

        <button
          onClick={onNewEstimate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {feedbackNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, fabric, or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
          {['all', 'quoted', 'approved', 'in_production', 'draft'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Estimates */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No saved estimates found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Create and save your first commercial fabric quotation from the calculator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((estimate) => {
            const convertedSelling = currencyService.convert(
              estimate.results.final_price || estimate.results.selling_price,
              estimate.currency,
              currentCurrency
            );
            const convertedTotal = currencyService.convert(
              estimate.results.totalOrderInvoiceValue || estimate.results.totalOrderSellingPrice,
              estimate.currency,
              currentCurrency
            );

            return (
              <div
                key={estimate.id}
                className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-cyan-500/40 p-5 shadow-sm hover:shadow-md dark:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-500/20 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30">
                      {estimate.referenceNo}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        estimate.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : estimate.status === 'quoted'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {estimate.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
                    {estimate.title}
                  </h3>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                    {estimate.customerName}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Fabric:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[140px]">{estimate.fabricType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Order Size:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{(estimate.inputs.finishedLengthMeters || 0).toLocaleString()} Meters</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Effective Yield:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{estimate.results.effectiveYieldPct}%</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Final Selling Price</span>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {currencyService.format(convertedSelling, currentCurrency)} / m
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Total Invoice</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
                        {currencyService.format(convertedTotal, currentCurrency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleExportPDF(estimate)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs transition-colors cursor-pointer"
                      title="Download Commercial PDF Quotation"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(estimate.id)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs transition-colors cursor-pointer"
                      title="Duplicate Quotation"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(estimate.id)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 text-xs transition-colors cursor-pointer"
                      title="Delete Quotation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenInCalculator(estimate)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-cyan-500/20 hover:bg-blue-100 dark:hover:bg-cyan-500/30 text-blue-700 dark:text-cyan-300 text-xs font-semibold border border-blue-200 dark:border-cyan-500/30 transition-colors cursor-pointer"
                  >
                    <span>Edit Quote</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
