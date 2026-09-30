import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Download,
  Save,
  Sliders,
  Copy,
  RefreshCw,
  Package,
  Check,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';
import type {
  BOQEstimate,
  BOQLineItem,
} from '../types/referenceTypes';
import type { CurrencyCode } from '../types';
import { boqEngineService } from '../services/boqEngine';
import { referenceDatabaseService } from '../services/referenceDatabase';

interface BOQCalculatorProps {
  currentCurrency?: CurrencyCode;
  initialRefNo?: string;
  onEstimateSaved?: () => void;
}

export const BOQCalculator: React.FC<BOQCalculatorProps> = ({
  currentCurrency: _currentCurrency,
  initialRefNo,
  onEstimateSaved,
}) => {
  // Active BOQ state
  const [activeBOQ, setActiveBOQ] = useState<BOQEstimate>(() =>
    boqEngineService.generatePercaleBedSetBOQ(100)
  );

  const [orderQuantity, setOrderQuantity] = useState<number>(100);
  const [overheadPct, setOverheadPct] = useState<number>(4.0);
  const [marginPct, setMarginPct] = useState<number>(12.0);
  const [taxPct, setTaxPct] = useState<number>(0.0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Mobile expanded line cards state
  const [expandedMobileLines, setExpandedMobileLines] = useState<Record<number, boolean>>({});

  const toggleMobileLine = (idx: number) => {
    setExpandedMobileLines((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Row selection for Ref No autocomplete modal
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);
  const [refSearchQuery, setRefSearchQuery] = useState<string>('');
  const [showRefSearchModal, setShowRefSearchModal] = useState<boolean>(false);

  // Line Override Modal
  const [overrideLineIndex, setOverrideLineIndex] = useState<number | null>(null);
  const [overrideRateVal, setOverrideRateVal] = useState<string>('');
  const [overrideReasonVal, setOverrideReasonVal] = useState<string>('');

  // All reference items for autocomplete
  const allReferences = referenceDatabaseService.getAllReferences();

  // If initialRefNo passed, append it or load
  useEffect(() => {
    if (initialRefNo) {
      const newLine = boqEngineService.createLineItemFromRefNo(
        initialRefNo,
        activeBOQ.lines.length + 1,
        orderQuantity
      );
      const updatedLines = [...activeBOQ.lines, newLine];
      const summary = boqEngineService.calculateBOQSummary(
        updatedLines,
        overheadPct,
        marginPct,
        taxPct,
        orderQuantity,
        'PKR'
      );
      setActiveBOQ({
        ...activeBOQ,
        lines: updatedLines,
        summary,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [initialRefNo]);

  // Recalculate summary when lines, overheads, or margins change
  const updateBOQState = (lines: BOQLineItem[], qty = orderQuantity, oh = overheadPct, mg = marginPct, tx = taxPct) => {
    const summary = boqEngineService.calculateBOQSummary(lines, oh, mg, tx, qty, 'PKR');
    setActiveBOQ({
      ...activeBOQ,
      lines,
      summary,
      orderQuantity: qty,
      updatedAt: new Date().toISOString(),
    });
    setIsSaved(false);
  };

  // Switch template
  const handleLoadTemplate = (type: 'PERCALE' | 'LAWN_SUIT' | 'BLANK') => {
    if (type === 'PERCALE') {
      const boq = boqEngineService.generatePercaleBedSetBOQ(orderQuantity);
      setOverheadPct(boq.summary.overheadPct);
      setMarginPct(boq.summary.marginPct);
      setTaxPct(boq.summary.taxPct);
      setActiveBOQ(boq);
    } else if (type === 'LAWN_SUIT') {
      const boq = boqEngineService.generateLawnSuitBOQ(orderQuantity);
      setOverheadPct(boq.summary.overheadPct);
      setMarginPct(boq.summary.marginPct);
      setTaxPct(boq.summary.taxPct);
      setActiveBOQ(boq);
    } else {
      const blankBOQ: BOQEstimate = {
        id: `boq-custom-${Date.now()}`,
        title: 'Custom Textile Project BOQ',
        productType: 'CUSTOM_PROJECT',
        orderQuantity,
        orderUnit: 'units',
        currency: 'PKR',
        lines: [
          boqEngineService.createLineItemFromRefNo('FAB-W-001', 1, orderQuantity),
        ],
        summary: boqEngineService.calculateBOQSummary([], overheadPct, marginPct, taxPct, orderQuantity, 'PKR'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setActiveBOQ(blankBOQ);
    }
    setIsSaved(false);
  };

  // Line item modifications
  const handleLineChange = (index: number, field: keyof BOQLineItem, value: any) => {
    const lines = [...activeBOQ.lines];
    lines[index] = { ...lines[index], [field]: value };
    lines[index] = boqEngineService.calculateLineItem(lines[index]);
    updateBOQState(lines);
  };

  const handleAddLine = () => {
    const newLine = boqEngineService.createLineItemFromRefNo(
      'YRN-001',
      activeBOQ.lines.length + 1,
      orderQuantity
    );
    updateBOQState([...activeBOQ.lines, newLine]);
  };

  const handleDeleteLine = (index: number) => {
    const lines = activeBOQ.lines.filter((_, i) => i !== index).map((l, idx) => ({ ...l, lineNo: idx + 1 }));
    updateBOQState(lines);
  };

  const handleDuplicateLine = (index: number) => {
    const target = activeBOQ.lines[index];
    const duplicated: BOQLineItem = {
      ...target,
      lineNo: activeBOQ.lines.length + 1,
      itemName: `${target.itemName} (Copy)`,
    };
    updateBOQState([...activeBOQ.lines, duplicated]);
  };

  // Autocomplete reference item selection
  const handleSelectReferenceForLine = (refNo: string) => {
    if (editingLineIndex === null) return;
    const baseLine = boqEngineService.createLineItemFromRefNo(
      refNo,
      activeBOQ.lines[editingLineIndex].lineNo,
      activeBOQ.lines[editingLineIndex].quantity || orderQuantity
    );
    const lines = [...activeBOQ.lines];
    lines[editingLineIndex] = baseLine;
    updateBOQState(lines);
    setShowRefSearchModal(false);
    setEditingLineIndex(null);
    setRefSearchQuery('');
  };

  // Save Override
  const handleSaveLineOverride = () => {
    if (overrideLineIndex === null) return;
    const rateNum = parseFloat(overrideRateVal);
    if (isNaN(rateNum) || rateNum <= 0) return;

    const lines = [...activeBOQ.lines];
    lines[overrideLineIndex].rateOverride = rateNum;
    lines[overrideLineIndex].overrideUser = 'Active User';
    lines[overrideLineIndex].overrideTimestamp = new Date().toISOString();
    lines[overrideLineIndex].overrideReason = overrideReasonVal || 'Line-specific commercial override';
    lines[overrideLineIndex] = boqEngineService.calculateLineItem(lines[overrideLineIndex]);

    updateBOQState(lines);
    setOverrideLineIndex(null);
    setOverrideRateVal('');
    setOverrideReasonVal('');
  };

  // Propagate Live Rates
  const handlePropagateRates = () => {
    const updated = boqEngineService.propagateUpdatedRates(activeBOQ);
    setActiveBOQ(updated);
    setSaveMessage('✓ Recalculated with latest reference benchmark rates!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Save BOQ
  const handleSaveBOQ = () => {
    boqEngineService.saveBOQ(activeBOQ);
    setIsSaved(true);
    setSaveMessage('✓ BOQ successfully saved to local records!');
    setTimeout(() => setSaveMessage(''), 3000);
    if (onEstimateSaved) onEstimateSaved();
  };

  // Export BOQ to CSV
  const handleExportBOQCsv = () => {
    const headers = [
      'Line No',
      'Ref No',
      'Category',
      'Item Name',
      'Specification',
      'Quantity',
      'Unit',
      'Base Rate (PKR)',
      'Override Rate (PKR)',
      'Effective Rate (PKR)',
      'Waste %',
      'Yield %',
      'Extended Cost (PKR)',
      'Confidence',
      'Source',
      'Notes'
    ];

    const rows = activeBOQ.lines.map((l) => [
      l.lineNo,
      `"${l.refNo}"`,
      `"${l.category}"`,
      `"${l.itemName.replace(/"/g, '""')}"`,
      `"${l.specification.replace(/"/g, '""')}"`,
      l.quantity,
      `"${l.unit}"`,
      l.baseRate,
      l.rateOverride || '',
      l.effectiveRate,
      l.wastePct,
      l.yieldPct,
      l.extendedCost,
      `"${l.confidence}"`,
      `"${l.source.replace(/"/g, '""')}"`,
      `"${l.notes.replace(/"/g, '""')}"`
    ]);

    const summaryRows = [
      [],
      ['SUMMARY BREAKDOWN'],
      ['Direct Materials Cost', '', '', '', '', '', '', '', '', '', '', '', activeBOQ.summary.totalDirectMaterialCost],
      ['Direct Process Cost', '', '', '', '', '', '', '', '', '', '', '', activeBOQ.summary.totalDirectProcessCost],
      ['Trims & Packaging Cost', '', '', '', '', '', '', '', '', '', '', '', activeBOQ.summary.totalTrimsAndPackingCost],
      ['Labour Cost', '', '', '', '', '', '', '', '', '', '', '', activeBOQ.summary.totalLabourCost],
      ['Subtotal Base Cost', '', '', '', '', '', '', '', '', '', '', '', activeBOQ.summary.subtotalCost],
      [`Overhead (${activeBOQ.summary.overheadPct}%)`, '', '', '', '', '', '', '', '', '', '', '', activeBOQ.summary.overheadAmount],
      [`Margin / Profit (${activeBOQ.summary.marginPct}%)`, '', '', '', '', '', '', '', '', '', '', '', activeBOQ.summary.marginAmount],
      [`Tax (${activeBOQ.summary.taxPct}%)`, '', '', '', '', '', '', '', '', '', '', '', activeBOQ.summary.taxAmount],
      ['FINAL TOTAL COST (PKR)', '', '', '', '', '', '', '', '', '', '', '', activeBOQ.summary.finalTotalCost],
      ['COST PER UNIT (PKR)', '', '', '', '', '', '', '', '', '', '', '', activeBOQ.summary.costPerUnit]
    ];

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(',')), ...summaryRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeBOQ.title.replace(/\s+/g, '_')}_BOQ.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSearchRefs = allReferences.filter(
    (r) =>
      r.refNo.toLowerCase().includes(refSearchQuery.toLowerCase()) ||
      r.marketName.toLowerCase().includes(refSearchQuery.toLowerCase()) ||
      r.standardName.toLowerCase().includes(refSearchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(refSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. BOQ Header Card */}
      <div className="card-soft-lg p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-subtle)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-[14px] bg-[#6EE7B7]/15 text-[#059669] dark:text-[#6EE7B7] border border-[#6EE7B7]/20">
                <Package className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-[#059669] dark:text-[#6EE7B7] uppercase">
                BOQ Costing Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-['Outfit'] tracking-tight">
              Bill of Quantities (BOQ) Master
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Multi-line textile manufacturing costing with automatic specification lookups, waste factors, and verified price benchmarks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePropagateRates}
              className="btn-tactile btn-soft-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Sync with latest reference benchmark rates"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#6EA8FF]" />
              <span>Propagate Rates</span>
            </button>
            <button
              onClick={handleExportBOQCsv}
              className="btn-tactile btn-soft-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#6EE7B7]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleSaveBOQ}
              className={`btn-tactile px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer ${
                isSaved ? 'btn-soft-mint' : 'btn-soft-primary'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'Saved' : 'Save BOQ'}</span>
            </button>
          </div>
        </div>

        {/* Template Selector Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-[var(--border-subtle)]">
          <span className="text-xs text-[var(--text-muted)] font-mono uppercase mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#6EA8FF]" />
            Templates:
          </span>
          <button
            onClick={() => handleLoadTemplate('PERCALE')}
            className={`btn-tactile px-3 py-1.5 rounded-[12px] text-xs font-semibold cursor-pointer border ${
              activeBOQ.productType === 'PERCALE_BED_SET'
                ? 'bg-[#6EA8FF]/20 text-[#3B82F6] dark:text-[#67E8F9] border-[#6EA8FF]/40 font-bold shadow-sm'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[#6EA8FF]/30'
            }`}
          >
            🛏️ Percale 200 TC Bed Set (PCL-SET-001)
          </button>
          <button
            onClick={() => handleLoadTemplate('LAWN_SUIT')}
            className={`btn-tactile px-3 py-1.5 rounded-[12px] text-xs font-semibold cursor-pointer border ${
              activeBOQ.productType === 'LAWN_SUIT_3PC'
                ? 'bg-[#6EA8FF]/20 text-[#3B82F6] dark:text-[#67E8F9] border-[#6EA8FF]/40 font-bold shadow-sm'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[#6EA8FF]/30'
            }`}
          >
            👗 3-Piece Digital Lawn Suit (~₨ 4,170)
          </button>
          <button
            onClick={() => handleLoadTemplate('BLANK')}
            className={`btn-tactile px-3 py-1.5 rounded-[12px] text-xs font-semibold cursor-pointer border ${
              activeBOQ.productType === 'CUSTOM_PROJECT'
                ? 'bg-[#6EA8FF]/20 text-[#3B82F6] dark:text-[#67E8F9] border-[#6EA8FF]/40 font-bold shadow-sm'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[#6EA8FF]/30'
            }`}
          >
            ➕ Blank Custom BOQ
          </button>
        </div>

        {saveMessage && (
          <div className="mt-3 p-2.5 rounded-[14px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            {saveMessage}
          </div>
        )}
      </div>

      {/* 2. Order Parameters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 card-soft p-4 text-xs">
        <div>
          <label className="text-[var(--text-secondary)] block mb-1 font-semibold">Order Quantity</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={orderQuantity}
              onChange={(e) => {
                const qty = parseInt(e.target.value) || 1;
                setOrderQuantity(qty);
                updateBOQState(activeBOQ.lines, qty);
              }}
              className="input-soft w-full px-3 py-2 font-tabular font-bold text-xs"
            />
            <span className="text-[var(--text-muted)] font-mono">{activeBOQ.orderUnit}</span>
          </div>
        </div>

        <div>
          <label className="text-[var(--text-secondary)] block mb-1 font-semibold">Overhead %</label>
          <input
            type="number"
            step="0.5"
            value={overheadPct}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setOverheadPct(val);
              updateBOQState(activeBOQ.lines, orderQuantity, val);
            }}
            className="input-soft w-full px-3 py-2 font-tabular font-bold text-xs"
          />
        </div>

        <div>
          <label className="text-[var(--text-secondary)] block mb-1 font-semibold">Profit Margin %</label>
          <input
            type="number"
            step="0.5"
            value={marginPct}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setMarginPct(val);
              updateBOQState(activeBOQ.lines, orderQuantity, overheadPct, val);
            }}
            className="input-soft w-full px-3 py-2 font-tabular font-bold text-xs"
          />
        </div>

        <div>
          <label className="text-[var(--text-secondary)] block mb-1 font-semibold">Sales Tax / VAT %</label>
          <input
            type="number"
            step="0.5"
            value={taxPct}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setTaxPct(val);
              updateBOQState(activeBOQ.lines, orderQuantity, overheadPct, marginPct, val);
            }}
            className="input-soft w-full px-3 py-2 font-tabular font-bold text-xs"
          />
        </div>
      </div>

      {/* 3. DESKTOP BOQ TABLE & MOBILE TACTILE EXPANDABLE CARDS */}
      <div className="card-soft overflow-hidden">
        
        {/* Table Top Toolbar */}
        <div className="p-4 bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)] font-['Outfit'] text-sm sm:text-base">
              {activeBOQ.title}
            </span>
            <span className="pill-base pill-verified text-[10px] font-mono">
              {activeBOQ.lines.length} Line Items
            </span>
          </div>
          <button
            onClick={handleAddLine}
            className="btn-tactile btn-soft-primary flex items-center gap-1 px-3 py-1.5 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        {/* Desktop Table View (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] uppercase tracking-wider font-mono text-[10px]">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3 w-28">Ref No</th>
                <th className="py-3 px-4">Item & Specification</th>
                <th className="py-3 px-3 text-right w-24">Quantity</th>
                <th className="py-3 px-2 w-16">Unit</th>
                <th className="py-3 px-3 text-right w-28">Rate (₨)</th>
                <th className="py-3 px-2 text-right w-16">Waste%</th>
                <th className="py-3 px-4 text-right w-32">Extended Cost</th>
                <th className="py-3 px-3 text-center w-28">Confidence</th>
                <th className="py-3 px-3 text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {activeBOQ.lines.map((line, idx) => {
                const isOverridden = line.rateOverride !== undefined && line.rateOverride > 0;
                return (
                  <tr key={line.lineNo} className="hover:bg-[var(--surface-subtle)]/70 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-[var(--text-muted)]">
                      {line.lineNo}
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => {
                          setEditingLineIndex(idx);
                          setShowRefSearchModal(true);
                        }}
                        className="btn-tactile font-mono font-bold text-[#3B82F6] dark:text-[#67E8F9] px-2 py-1 rounded-[8px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30 cursor-pointer"
                        title="Click to search reference"
                      >
                        {line.refNo}
                      </button>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <input
                        type="text"
                        value={line.itemName}
                        onChange={(e) => handleLineChange(idx, 'itemName', e.target.value)}
                        className="w-full font-bold text-[var(--text-primary)] bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] focus:border-[#6EA8FF] px-1 py-0.5 rounded focus:outline-none text-xs"
                      />
                      <input
                        type="text"
                        value={line.specification}
                        onChange={(e) => handleLineChange(idx, 'specification', e.target.value)}
                        className="w-full text-[11px] text-[var(--text-muted)] bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] focus:border-[#6EA8FF] px-1 py-0.5 rounded focus:outline-none"
                      />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        step="any"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="input-soft w-20 px-2 py-1 text-right font-tabular text-xs"
                      />
                    </td>

                    <td className="py-3 px-2 text-[var(--text-muted)] font-mono">
                      {line.unit}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className={`font-tabular font-bold ${isOverridden ? 'text-purple-500' : 'text-[var(--text-primary)]'}`}>
                          ₨ {line.effectiveRate.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            setOverrideLineIndex(idx);
                            setOverrideRateVal(line.effectiveRate.toString());
                            setOverrideReasonVal(line.overrideReason || '');
                          }}
                          className="btn-tactile p-1 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                          title="Set override rate"
                        >
                          <Sliders className="w-3 h-3" />
                        </button>
                      </div>
                      {isOverridden && (
                        <div className="text-[9px] text-purple-500 font-mono uppercase">
                          Base: ₨ {line.baseRate.toFixed(2)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-2 text-right">
                      <input
                        type="number"
                        step="0.5"
                        value={line.wastePct}
                        onChange={(e) => handleLineChange(idx, 'wastePct', parseFloat(e.target.value) || 0)}
                        className="input-soft w-14 px-1.5 py-1 text-right font-tabular text-xs"
                      />
                    </td>

                    <td className="py-3 px-4 text-right font-tabular font-bold text-[var(--text-primary)] text-sm">
                      ₨ {line.extendedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="pill-base pill-live text-[9px] py-0 px-1.5">
                        {isOverridden ? 'OVERRIDE' : line.confidence.split(' ')[0]}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDuplicateLine(idx)}
                          className="btn-tactile p-1 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                          title="Duplicate line"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLine(idx)}
                          className="btn-tactile p-1 rounded-[6px] text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          title="Delete line"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Experience: Tactile Expandable Cards (Shown on mobile screens) */}
        <div className="md:hidden divide-y divide-[var(--border-subtle)]">
          {activeBOQ.lines.map((line, idx) => {
            const isExpanded = !!expandedMobileLines[idx];
            return (
              <div key={line.lineNo} className="p-4 space-y-3">
                
                {/* Collapsed Header */}
                <div 
                  onClick={() => toggleMobileLine(idx)}
                  className="flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#3B82F6] dark:text-[#67E8F9] px-2 py-0.5 rounded-[6px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30">
                        {line.refNo}
                      </span>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {line.itemName}
                      </h4>
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] font-tabular">
                      Qty {line.quantity} {line.unit} · ₨ {line.effectiveRate.toFixed(2)}/{line.unit}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-tabular font-bold text-xs text-[var(--text-primary)]">
                      ₨ {line.extendedCost.toFixed(0)}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3 text-xs animate-in fade-in duration-150">
                    <div>
                      <label className="text-[var(--text-muted)] block mb-1">Specification</label>
                      <input
                        type="text"
                        value={line.specification}
                        onChange={(e) => handleLineChange(idx, 'specification', e.target.value)}
                        className="input-soft w-full px-3 py-2 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[var(--text-muted)] block mb-1">Quantity ({line.unit})</label>
                        <input
                          type="number"
                          step="any"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="input-soft w-full px-3 py-2 text-xs font-tabular"
                        />
                      </div>
                      <div>
                        <label className="text-[var(--text-muted)] block mb-1">Rate (₨/{line.unit})</label>
                        <input
                          type="number"
                          step="any"
                          value={line.effectiveRate}
                          onChange={(e) => handleLineChange(idx, 'rateOverride', parseFloat(e.target.value) || 0)}
                          className="input-soft w-full px-3 py-2 text-xs font-tabular"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
                      <span>Waste: {line.wastePct}%</span>
                      <span>Source: {line.source}</span>
                      <span className="pill-base pill-live text-[9px] py-0 px-1.5">{line.confidence.split(' ')[0]}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                      <button
                        onClick={() => {
                          setEditingLineIndex(idx);
                          setShowRefSearchModal(true);
                        }}
                        className="btn-tactile btn-soft-secondary px-3 py-1.5 text-xs font-semibold cursor-pointer"
                      >
                        Change Ref
                      </button>
                      <button
                        onClick={() => handleDuplicateLine(idx)}
                        className="btn-tactile btn-soft-secondary p-2 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#6EA8FF]" />
                      </button>
                      <button
                        onClick={() => handleDeleteLine(idx)}
                        className="btn-tactile p-2 rounded-[10px] text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* 4. BOQ Financial Summary Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cost Hierarchy */}
        <div className="card-soft p-5 space-y-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono flex items-center gap-2">
            <Package className="w-4 h-4 text-[#6EA8FF]" />
            Manufacturing Cost Hierarchy
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-[14px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">1. Direct Materials (Yarn, Fabric, Fibre)</span>
              <span className="font-tabular font-bold text-[var(--text-primary)]">
                ₨ {activeBOQ.summary.totalDirectMaterialCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-[14px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">2. Processing (Dyeing, Printing, Finishing, Wash)</span>
              <span className="font-tabular font-bold text-[var(--text-primary)]">
                ₨ {activeBOQ.summary.totalDirectProcessCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-[14px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">3. Trims & Packaging (Thread, Elastic, Bags)</span>
              <span className="font-tabular font-bold text-[var(--text-primary)]">
                ₨ {activeBOQ.summary.totalTrimsAndPackingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-[14px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">4. Labour & Inspection (CMT, Ironing, Packing)</span>
              <span className="font-tabular font-bold text-[var(--text-primary)]">
                ₨ {activeBOQ.summary.totalLabourCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Commercial Summary */}
        <div className="card-soft-lg p-6 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-subtle)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
              Commercial Estimation Summary
            </h3>
            <span className="pill-base pill-verified text-[10px] font-mono">
              {orderQuantity} {activeBOQ.orderUnit}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span>Subtotal Production Cost:</span>
              <span className="font-tabular font-bold text-[var(--text-primary)]">
                ₨ {activeBOQ.summary.subtotalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span>Overhead ({overheadPct}%):</span>
              <span className="font-tabular font-semibold text-[var(--text-primary)]">
                ₨ {activeBOQ.summary.overheadAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span>Target Margin ({marginPct}%):</span>
              <span className="font-tabular font-semibold text-[#10B981] dark:text-[#6EE7B7]">
                ₨ {activeBOQ.summary.marginAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {taxPct > 0 && (
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Tax ({taxPct}%):</span>
                <span className="font-tabular font-semibold text-[var(--text-primary)]">
                  ₨ {activeBOQ.summary.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">Total Project Cost</div>
                <div className="text-2xl font-black font-tabular text-[#3B82F6] dark:text-[#67E8F9]">
                  ₨ {activeBOQ.summary.finalTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">Cost Per Unit</div>
                <div className="text-xl font-bold font-tabular text-[#10B981] dark:text-[#6EE7B7]">
                  ₨ {activeBOQ.summary.costPerUnit.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Reference Search Autocomplete Modal */}
      {showRefSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card-soft-elevated max-w-lg w-full p-6 space-y-4 rounded-[28px] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Outfit']">Select Textile Reference</h3>
              <button onClick={() => setShowRefSearchModal(false)} className="btn-tactile text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={refSearchQuery}
                onChange={(e) => setRefSearchQuery(e.target.value)}
                placeholder="Search Ref No (e.g. YRN-001, FAB-W-001)..."
                className="input-soft w-full pl-9 pr-3 py-2 text-xs"
                autoFocus
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5 divide-y divide-[var(--border-subtle)]">
              {filteredSearchRefs.slice(0, 15).map((r) => (
                <div
                  key={r.refNo}
                  onClick={() => handleSelectReferenceForLine(r.refNo)}
                  className="btn-tactile p-3 rounded-[12px] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#3B82F6] dark:text-[#67E8F9] px-2 py-0.5 rounded-[6px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30">
                        {r.refNo}
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate">{r.marketName}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">{r.standardName}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-tabular font-bold text-xs text-[var(--text-primary)]">
                      ₨ {r.baseRate.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">/{r.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Line Override Modal */}
      {overrideLineIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card-soft-elevated max-w-md w-full p-6 space-y-4 rounded-[28px] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Outfit']">Set Line Rate Override</h3>
              <button onClick={() => setOverrideLineIndex(null)} className="btn-tactile text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--text-muted)] block mb-1">Item</label>
                <div className="font-bold text-[var(--text-primary)] p-2.5 rounded-[12px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                  {activeBOQ.lines[overrideLineIndex]?.refNo} — {activeBOQ.lines[overrideLineIndex]?.itemName}
                </div>
              </div>

              <div>
                <label className="text-[var(--text-primary)] font-bold block mb-1">Override Unit Rate (PKR)</label>
                <input
                  type="number"
                  step="any"
                  value={overrideRateVal}
                  onChange={(e) => setOverrideRateVal(e.target.value)}
                  className="input-soft w-full px-3 py-2 text-xs font-tabular"
                />
              </div>

              <div>
                <label className="text-[var(--text-muted)] block mb-1">Override Reason</label>
                <input
                  type="text"
                  value={overrideReasonVal}
                  onChange={(e) => setOverrideReasonVal(e.target.value)}
                  placeholder="e.g. Special bulk vendor contract"
                  className="input-soft w-full px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setOverrideLineIndex(null)}
                  className="btn-tactile btn-soft-secondary px-4 py-2 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLineOverride}
                  className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Apply Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
