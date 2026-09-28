import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Layers,
  Plus,
  Trash2,
  Download,
  Save,
  Sliders,
  Copy,
  RefreshCw,
  X,
  Package,
  Check,
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
  // Current active BOQ
  const [activeBOQ, setActiveBOQ] = useState<BOQEstimate>(() =>
    boqEngineService.generatePercaleBedSetBOQ(100)
  );

  const [orderQuantity, setOrderQuantity] = useState<number>(100);
  const [overheadPct, setOverheadPct] = useState<number>(4.0);
  const [marginPct, setMarginPct] = useState<number>(12.0);
  const [taxPct, setTaxPct] = useState<number>(0.0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

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
    // Recalculate line
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

  const handleClearLineOverride = (index: number) => {
    const lines = [...activeBOQ.lines];
    delete lines[index].rateOverride;
    delete lines[index].overrideUser;
    delete lines[index].overrideReason;
    lines[index] = boqEngineService.calculateLineItem(lines[index]);
    updateBOQState(lines);
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
      {/* BOQ Header & Preset Selector */}
      <div className="bg-gradient-to-r from-[#0d1527] via-[#111e38] to-[#0d1527] border border-cyan-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Calculator className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                Deterministic Multi-Line Costing Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] tracking-tight">
              Bill of Quantities (BOQ) Master
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Auto-fills specifications, unit prices, waste factors, and confidence from the <span className="text-cyan-300 font-semibold">Pakistani Textile Reference Library</span>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePropagateRates}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
              title="Sync with latest reference benchmark rates"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Propagate Rates</span>
            </button>
            <button
              onClick={handleExportBOQCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleSaveBOQ}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-cyan-500/20'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'Saved' : 'Save BOQ'}</span>
            </button>
          </div>
        </div>

        {/* Template Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono uppercase mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Standard Templates:
          </span>
          <button
            onClick={() => handleLoadTemplate('PERCALE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeBOQ.productType === 'PERCALE_BED_SET'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            🛏️ Percale 200 TC Bed Set (PCL-SET-001)
          </button>
          <button
            onClick={() => handleLoadTemplate('LAWN_SUIT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeBOQ.productType === 'LAWN_SUIT_3PC'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            👗 3-Piece Digital Lawn Suit (~₨ 4,170 Benchmark)
          </button>
          <button
            onClick={() => handleLoadTemplate('BLANK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeBOQ.productType === 'CUSTOM_PROJECT'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            ➕ Blank Custom BOQ
          </button>
        </div>

        {saveMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            {saveMessage}
          </div>
        )}
      </div>

      {/* Order Level Parameters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm text-xs">
        <div>
          <label className="text-slate-400 block mb-1 font-medium">Order Quantity</label>
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
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500"
            />
            <span className="text-slate-400 font-mono">{activeBOQ.orderUnit}</span>
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">Factory Overhead %</label>
          <input
            type="number"
            step="0.5"
            value={overheadPct}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setOverheadPct(val);
              updateBOQState(activeBOQ.lines, orderQuantity, val);
            }}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">Target Profit Margin %</label>
          <input
            type="number"
            step="0.5"
            value={marginPct}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setMarginPct(val);
              updateBOQState(activeBOQ.lines, orderQuantity, overheadPct, val);
            }}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1 font-medium">Applicable Sales Tax / VAT %</label>
          <input
            type="number"
            step="0.5"
            value={taxPct}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setTaxPct(val);
              updateBOQState(activeBOQ.lines, orderQuantity, overheadPct, marginPct, val);
            }}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main BOQ Multi-Line Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-['Outfit'] text-sm sm:text-base">
              {activeBOQ.title}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/30">
              {activeBOQ.lines.length} Line Items
            </span>
          </div>
          <button
            onClick={handleAddLine}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3 w-28">Ref No</th>
                <th className="py-3 px-4">Item & Specification</th>
                <th className="py-3 px-3 text-right w-24">Quantity</th>
                <th className="py-3 px-2 w-16">Unit</th>
                <th className="py-3 px-3 text-right w-28">Rate (₨)</th>
                <th className="py-3 px-2 text-right w-16">Waste%</th>
                <th className="py-3 px-2 text-right w-16">Yield%</th>
                <th className="py-3 px-4 text-right w-32">Extended Cost</th>
                <th className="py-3 px-3 text-center w-28">Confidence</th>
                <th className="py-3 px-3 text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeBOQ.lines.map((line, idx) => {
                const isOverridden = line.rateOverride !== undefined && line.rateOverride > 0;
                return (
                  <tr key={line.lineNo} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {line.lineNo}
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => {
                          setEditingLineIndex(idx);
                          setShowRefSearchModal(true);
                        }}
                        className="flex items-center gap-1 font-mono font-bold text-cyan-400 hover:underline px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 cursor-pointer"
                        title="Click to change reference"
                      >
                        <span>{line.refNo}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <input
                        type="text"
                        value={line.itemName}
                        onChange={(e) => handleLineChange(idx, 'itemName', e.target.value)}
                        className="w-full font-bold text-slate-200 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-950 px-1 py-0.5 rounded focus:outline-none text-xs"
                      />
                      <input
                        type="text"
                        value={line.specification}
                        onChange={(e) => handleLineChange(idx, 'specification', e.target.value)}
                        className="w-full text-[11px] text-slate-400 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-950 px-1 py-0.5 rounded focus:outline-none"
                      />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        step="any"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-right bg-slate-950 border border-slate-800 rounded font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </td>

                    <td className="py-3 px-2 text-slate-400 font-mono">
                      {line.unit}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className={`font-mono font-bold ${isOverridden ? 'text-purple-400' : 'text-slate-100'}`}>
                          ₨ {line.effectiveRate.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            setOverrideLineIndex(idx);
                            setOverrideRateVal(line.effectiveRate.toString());
                            setOverrideReasonVal(line.overrideReason || '');
                          }}
                          className={`p-1 rounded cursor-pointer ${
                            isOverridden
                              ? 'text-purple-400 hover:bg-purple-500/20'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                          }`}
                          title={isOverridden ? `Overridden: ${line.overrideReason}` : 'Set Override Rate'}
                        >
                          <Sliders className="w-3 h-3" />
                        </button>
                      </div>
                      {isOverridden && (
                        <div className="text-[9px] text-purple-400 font-mono uppercase">
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
                        className="w-14 px-1.5 py-1 text-right bg-slate-950 border border-slate-800 rounded font-mono text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </td>

                    <td className="py-3 px-2 text-right">
                      <input
                        type="number"
                        step="0.5"
                        value={line.yieldPct}
                        onChange={(e) => handleLineChange(idx, 'yieldPct', parseFloat(e.target.value) || 100)}
                        className="w-14 px-1.5 py-1 text-right bg-slate-950 border border-slate-800 rounded font-mono text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100 text-sm">
                      ₨ {line.extendedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isOverridden
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : line.confidence === 'VERIFIED MARKET'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                      }`}>
                        {isOverridden ? 'OVERRIDE' : line.confidence.split(' ')[0]}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDuplicateLine(idx)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                          title="Duplicate line"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLine(idx)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
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
      </div>

      {/* BOQ Financial Summary Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown Category Matrix */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            Manufacturing Cost Hierarchy
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
              <span className="text-slate-400">1. Direct Materials (Yarn, Fabric, Fibre)</span>
              <span className="font-mono font-bold text-slate-200">
                ₨ {activeBOQ.summary.totalDirectMaterialCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
              <span className="text-slate-400">2. Processing (Dyeing, Printing, Finishing, Wash)</span>
              <span className="font-mono font-bold text-slate-200">
                ₨ {activeBOQ.summary.totalDirectProcessCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
              <span className="text-slate-400">3. Trims & Packaging (Thread, Elastic, Bags, Cartons)</span>
              <span className="font-mono font-bold text-slate-200">
                ₨ {activeBOQ.summary.totalTrimsAndPackingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
              <span className="text-slate-400">4. Labour & Inspection (CMT, Ironing, Packing)</span>
              <span className="font-mono font-bold text-slate-200">
                ₨ {activeBOQ.summary.totalLabourCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Commercial Totals Card */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#0d1527] border border-cyan-500/30 p-5 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Commercial Estimation Summary
            </h3>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              {orderQuantity} {activeBOQ.orderUnit}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Subtotal Production Cost:</span>
              <span className="font-mono font-bold">₨ {activeBOQ.summary.subtotalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Overhead ({overheadPct}%):</span>
              <span className="font-mono">+ ₨ {activeBOQ.summary.overheadAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between text-emerald-400 font-medium">
              <span>Profit Margin ({marginPct}%):</span>
              <span className="font-mono">+ ₨ {activeBOQ.summary.marginAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            {taxPct > 0 && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Tax ({taxPct}%):</span>
                <span className="font-mono">+ ₨ {activeBOQ.summary.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-mono block">Final Total BOQ Amount</span>
                <span className="text-2xl font-extrabold text-cyan-400 font-mono">
                  ₨ {activeBOQ.summary.finalTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-mono block">Cost per {activeBOQ.orderUnit.replace(/s$/, '')}</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  ₨ {activeBOQ.summary.costPerUnit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ref No Autocomplete Modal */}
      {showRefSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-['Outfit']">Select Reference from Library</h3>
              <button
                onClick={() => {
                  setShowRefSearchModal(false);
                  setEditingLineIndex(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={refSearchQuery}
              onChange={(e) => setRefSearchQuery(e.target.value)}
              placeholder="Search by Ref No (e.g. YRN, FAB-W, DYE, PCL), Name, or Yarn Count..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              autoFocus
            />

            <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-800/60 max-h-96 pr-1">
              {filteredSearchRefs.map((item) => (
                <div
                  key={item.refNo}
                  onClick={() => handleSelectReferenceForLine(item.refNo)}
                  className="pt-2.5 first:pt-0 p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                        {item.refNo}
                      </span>
                      <span className="font-bold text-slate-200 text-xs">{item.marketName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{item.standardName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-100 text-xs">
                      ₨ {item.baseRate.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500">per {item.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Line Override Modal */}
      {overrideLineIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-['Outfit']">Set Line Rate Override</h3>
              <button onClick={() => setOverrideLineIndex(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Item</label>
                <div className="font-mono font-bold text-cyan-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {activeBOQ.lines[overrideLineIndex].refNo} • {activeBOQ.lines[overrideLineIndex].itemName}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Base Reference Rate</label>
                <div className="font-mono text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  ₨ {activeBOQ.lines[overrideLineIndex].baseRate.toFixed(2)} per {activeBOQ.lines[overrideLineIndex].unit}
                </div>
              </div>

              <div>
                <label className="text-slate-200 font-bold block mb-1">New Override Rate (₨ PKR)</label>
                <input
                  type="number"
                  step="any"
                  value={overrideRateVal}
                  onChange={(e) => setOverrideRateVal(e.target.value)}
                  placeholder="Enter custom rate..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Override Reason</label>
                <input
                  type="text"
                  value={overrideReasonVal}
                  onChange={(e) => setOverrideReasonVal(e.target.value)}
                  placeholder="e.g. Bulk factory discount rate"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {activeBOQ.lines[overrideLineIndex].rateOverride !== undefined && (
                <button
                  onClick={() => {
                    handleClearLineOverride(overrideLineIndex);
                    setOverrideLineIndex(null);
                  }}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Clear Override
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setOverrideLineIndex(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLineOverride}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Save Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
