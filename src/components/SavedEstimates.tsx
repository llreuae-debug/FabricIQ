import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Copy, 
  Trash2, 
  ArrowUpRight, 
  Check, 
  Plus,
  Calendar
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
      
      {/* 1. Header Card */}
      <div className="card-soft-lg p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-subtle)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[12px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30 flex items-center justify-center text-[#3B82F6] dark:text-[#67E8F9]">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-['Outfit'] tracking-tight">
                Saved Quotations & Estimates
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Reproducible estimates with frozen market rate snapshots, auditable yield formulas, and tech-pack generation.
            </p>
          </div>

          <button
            onClick={onNewEstimate}
            className="btn-tactile btn-soft-primary flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className="p-3.5 rounded-[16px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* 2. Filter & Search Controls */}
      <div className="card-soft p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quotation title, customer, fabric, ref..."
            className="input-soft w-full pl-9 pr-3 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'quoted', 'draft', 'approved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn-tactile px-3 py-1.5 rounded-[12px] text-xs font-semibold capitalize cursor-pointer border ${
                statusFilter === st
                  ? 'bg-[#6EA8FF]/20 text-[#3B82F6] dark:text-[#67E8F9] border-[#6EA8FF]/40 font-bold shadow-sm'
                  : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[#6EA8FF]/30'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Estimates Grid */}
      {filtered.length === 0 ? (
        <div className="card-soft p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#6EA8FF]/10 text-[#6EA8FF] flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">No Quotations Found</h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            {searchQuery ? 'Try adjusting your search or filters.' : 'Create your first commercial costing estimate to view it here.'}
          </p>
          <button
            onClick={onNewEstimate}
            className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold cursor-pointer"
          >
            Create First Estimate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((est) => {
            const convertedPrice = currencyService.convert(est.results.selling_price, est.currency, currentCurrency);
            const convertedTotal = currencyService.convert(est.results.totalOrderInvoiceValue, est.currency, currentCurrency);

            return (
              <div
                key={est.id}
                className="card-soft p-5 flex flex-col justify-between space-y-4 hover:border-[#6EA8FF]/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="pill-base pill-saved font-mono text-[10px]">
                      {est.referenceNo}
                    </span>
                    <span className={`pill-base text-[9px] ${
                      est.status === 'approved' ? 'pill-live' : est.status === 'quoted' ? 'pill-verified' : 'pill-stale'
                    }`}>
                      {est.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{est.title}</h3>
                  <div className="text-xs font-semibold text-[#3B82F6] dark:text-[#67E8F9] mt-0.5">{est.customerName}</div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    {est.fabricType} • {(est.inputs.finishedLengthMeters || 0).toLocaleString()} meters
                  </p>
                </div>

                <div className="p-3 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">Unit Price</span>
                    <span className="font-tabular font-bold text-[#10B981] dark:text-[#6EE7B7]">
                      {currencyService.format(convertedPrice, currentCurrency)} / m
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">Total Order</span>
                    <span className="font-tabular font-bold text-[var(--text-primary)]">
                      {currencyService.format(convertedTotal, currentCurrency)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {est.createdAt.split(',')[0]}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDuplicate(est.id)}
                      className="btn-tactile p-1.5 rounded-[8px] hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleExportPDF(est)}
                      className="btn-tactile p-1.5 rounded-[8px] hover:bg-[var(--surface-subtle)] text-[#3B82F6] dark:text-[#67E8F9] cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenInCalculator(est)}
                      className="btn-tactile p-1.5 rounded-[8px] hover:bg-[var(--surface-subtle)] text-[#6EE7B7] cursor-pointer"
                      title="Open in Calculator"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(est.id)}
                      className="btn-tactile p-1.5 rounded-[8px] text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
