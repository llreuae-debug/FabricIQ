import React, { useState, useEffect } from 'react';
import { 
  Calculator as CalcIcon, 
  Download, 
  Save, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Maximize2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as ChartTooltip
} from 'recharts';
import type { 
  CurrencyCode, 
  FabricCalculationInput, 
  FabricIQCalculationResult
} from '../types';
import { 
  FABRIC_PRESETS, 
  calculateFabricIQCost,
  DEFAULT_PROCESSING_OPERATIONS,
  DEFAULT_DETAILED_DYEING,
  DEFAULT_DETAILED_FINISHING,
  DEFAULT_COLOR_PRINTING,
  DEFAULT_PACKAGING,
  DEFAULT_LOGISTICS,
  DEFAULT_YIELD_STAGES
} from '../services/calculationEngine';
import { currencyService } from '../services/currencyService';
import { marketRateService } from '../services/marketRateService';
import { estimateService } from '../services/estimateService';

interface CalculatorProps {
  currentCurrency: CurrencyCode;
  initialPresetId?: string;
  onEstimateSaved?: () => void;
}

const PIE_COLORS = ['#6EA8FF', '#67E8F9', '#6EE7B7', '#BEF264', '#FDE68A', '#FDBA74', '#F9A8D4', '#C4B5FD', '#38BDF8'];

export const Calculator: React.FC<CalculatorProps> = ({
  currentCurrency,
  initialPresetId,
  onEstimateSaved,
}) => {
  const rates = marketRateService.getRates();

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPresetId || 'sheeting-20x20');
  
  // Section expand/collapse accordion states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sec_01: true,
    sec_02: true,
    sec_03: false,
    sec_04: false,
    sec_05: false,
    sec_06: false,
    sec_07: false,
    sec_08: false,
    sec_09: false,
    sec_10: false,
    sec_11: false,
    sec_12: false,
    sec_13: true,
    sec_14: false,
    sec_15: true,
  });

  const toggleSection = (secId: string) => {
    setOpenSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const expandAllSections = () => {
    setOpenSections({
      sec_01: true, sec_02: true, sec_03: true, sec_04: true, sec_05: true,
      sec_06: true, sec_07: true, sec_08: true, sec_09: true, sec_10: true,
      sec_11: true, sec_12: true, sec_13: true, sec_14: true, sec_15: true,
    });
  };

  const collapseAllSections = () => {
    setOpenSections({
      sec_01: false, sec_02: false, sec_03: false, sec_04: false, sec_05: false,
      sec_06: false, sec_07: false, sec_08: false, sec_09: false, sec_10: false,
      sec_11: false, sec_12: false, sec_13: false, sec_14: false, sec_15: false,
    });
  };

  const [inputs, setInputs] = useState<FabricCalculationInput>({
    estimateName: 'Standard Commercial Export Quote',
    customerName: 'EuroTex Sourcing BV',
    fabricStructure: 'woven',
    fabricType: 'Standard Sheeting 20x20 / 60x60 (63")',
    finishedWidthInches: 63,
    finishedLengthMeters: 25000,
    costingMethod: 'engineered',
    directGreyRatePerMeter: 145,
    directGreyRatePerKg: 580,
    directGSM: 150,

    // Yarn Count Systems
    warpCountSystem: 'Ne',
    weftCountSystem: 'Ne',
    warpCountNe: 20,
    weftCountNe: 20,

    // Woven physical specs
    epi: 60,
    ppi: 60,
    reedCountDents: 60,
    reedWidthInches: 67,
    warpCrimpPct: 6.0,
    weftCrimpPct: 4.5,
    warpWastePct: 1.0,
    weftWastePct: 1.0,

    // Machine economics
    loomRpmSpeed: 550,
    loomEfficiencyPct: 88,
    loomHourlyCost: 420,

    // Knitted specs
    knittingStitchLengthMm: 2.8,
    knittingCoursesPerCm: 16,
    knittingWalesPerCm: 12,
    knittingGauge: 24,
    knittingRatePerKg: 65,
    knittingEfficiencyPct: 92,
    knittingWastePct: 2.5,

    // Yarn rates
    warpYarnRate: 2850,
    warpYarnRateUnit: '10lbs',
    weftYarnRate: 2850,
    weftYarnRateUnit: '10lbs',

    // Weaving
    weavingCostMethod: 'per_pick',
    weavingRate: 0.48,
    sizingCostPerMeter: 8.50,
    greyInspectionCostPerMeter: 1.20,
    otherGreyManufacturingCostPerMeter: 0,

    // Yield stages
    weavingLossPct: 2.0,
    wetProcessingLossPct: 3.5,
    finishingLossPct: 1.5,
    yieldLossStages: { ...DEFAULT_YIELD_STAGES },

    // Modular Operations
    processingOperations: DEFAULT_PROCESSING_OPERATIONS,
    detailedDyeing: DEFAULT_DETAILED_DYEING,
    detailedFinishing: DEFAULT_DETAILED_FINISHING,
    
    // Color-wise Printing
    colorPrinting: { ...DEFAULT_COLOR_PRINTING },
    printingCostPerMeter: 0,
    auxChemicalCostPerMeter: 2.50,

    // Packaging & Logistics
    packaging: { ...DEFAULT_PACKAGING },
    logistics: { ...DEFAULT_LOGISTICS },
    transportMethod: 'by_weight',
    transportRatePerKg: 14.00,
    fixedTransportTotal: 0,

    // Commercial & Overhead
    overheadMethod: 'percentage',
    overheadPct: 3.5,
    fixedOverheadTotal: 0,
    pricingStrategy: 'margin',
    targetMarginPct: 15.0,
    targetMarkupPct: 20.0,
    commissionPerMeter: 0,
    otherChargesPerMeter: 0,
    taxMode: 'exclusive',
    taxRatePct: 18.0,
    currency: 'PKR',
  });

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveNotes, setSaveNotes] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [unitView, setUnitView] = useState<'meter' | 'kg' | 'yard'>('meter');

  const applyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = FABRIC_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    let warpRate = 2850;
    if (preset.warpCount <= 10) warpRate = 2450;
    else if (preset.warpCount <= 16) warpRate = 2680;
    else if (preset.warpCount <= 20) warpRate = 2850;
    else if (preset.warpCount <= 30) warpRate = 3450;
    else if (preset.warpCount >= 40) warpRate = 4150;

    let weftRate = 2850;
    if (preset.weftCount <= 10) weftRate = 2450;
    else if (preset.weftCount <= 16) weftRate = 2680;
    else if (preset.weftCount <= 20) weftRate = 2850;
    else if (preset.weftCount <= 30) weftRate = 3450;
    else if (preset.weftCount >= 40) weftRate = 4150;

    const isDyed = preset.defaultProcessing.includes('Dyed');

    setInputs((prev) => ({
      ...prev,
      fabricStructure: 'woven',
      fabricType: preset.name,
      estimateName: `${preset.name} Quote`,
      finishedWidthInches: preset.widthInches,
      warpCountNe: preset.warpCount,
      weftCountNe: preset.weftCount,
      warpCountSystem: 'Ne',
      weftCountSystem: 'Ne',
      epi: preset.epi,
      ppi: preset.ppi,
      warpCrimpPct: preset.warpCrimpPct,
      weftCrimpPct: preset.weftCrimpPct,
      warpYarnRate: warpRate,
      weftYarnRate: weftRate,
      costingMethod: 'engineered',
      processingOperations: prev.processingOperations.map((op) => {
        if (op.id === 'proc-dyeing') {
          return { ...op, enabled: isDyed };
        }
        return op;
      }),
    }));
  };

  useEffect(() => {
    if (initialPresetId) {
      applyPreset(initialPresetId);
    }
  }, [initialPresetId]);

  const results: FabricIQCalculationResult = calculateFabricIQCost(inputs);

  const applyLiveRate = (target: 'warp' | 'weft', countNe: number) => {
    let matchedRate = rates.find((r) => r.id === 'rate-yarn-20-carded');
    if (countNe <= 12) {
      matchedRate = rates.find((r) => r.id === 'rate-yarn-10-carded') || matchedRate;
    } else if (countNe <= 18) {
      matchedRate = rates.find((r) => r.id === 'rate-yarn-16-carded') || matchedRate;
    } else if (countNe <= 24) {
      matchedRate = rates.find((r) => r.id === 'rate-yarn-20-carded') || matchedRate;
    } else if (countNe <= 34) {
      matchedRate = rates.find((r) => r.id === 'rate-yarn-30-combed') || matchedRate;
    } else {
      matchedRate = rates.find((r) => r.id === 'rate-yarn-40-combed') || matchedRate;
    }

    if (matchedRate) {
      setInputs((prev) => ({
        ...prev,
        [target === 'warp' ? 'warpYarnRate' : 'weftYarnRate']: matchedRate!.currentRate,
        [target === 'warp' ? 'warpYarnRateUnit' : 'weftYarnRateUnit']: '10lbs',
      }));
    }
  };

  const toggleProcessingOp = (opId: string) => {
    setInputs((prev) => ({
      ...prev,
      processingOperations: prev.processingOperations.map((op) =>
        op.id === opId ? { ...op, enabled: !op.enabled } : op
      ),
    }));
  };

  const updateProcessingCost = (opId: string, cost: number) => {
    setInputs((prev) => ({
      ...prev,
      processingOperations: prev.processingOperations.map((op) =>
        op.id === opId ? { ...op, costPerMeter: cost } : op
      ),
    }));
  };

  const handleSaveEstimate = () => {
    const saved = estimateService.saveEstimate(inputs, results, 'quoted', saveNotes);
    setSaveSuccessMsg(`Saved Ref: ${saved.referenceNo}`);
    setTimeout(() => {
      setSaveSuccessMsg('');
      setSaveModalOpen(false);
      if (onEstimateSaved) onEstimateSaved();
    }, 1500);
  };

  const handleExportPDF = () => {
    const tempEst = {
      id: `temp-${Date.now()}`,
      referenceNo: `FIQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: inputs.estimateName,
      customerName: inputs.customerName,
      fabricType: inputs.fabricType,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      currency: inputs.currency,
      inputs,
      results,
      status: 'quoted' as const,
    };
    estimateService.generateQuotationPDF(tempEst);
  };

  const pieData = [
    { name: 'Yarn', value: results.yarn_cost },
    { name: 'Weaving / Knit', value: results.weaving_cost + results.sizing_cost + results.grey_inspection_cost },
    { name: 'Direct Grey', value: inputs.costingMethod.startsWith('direct') ? results.grey_fabric_cost : 0 },
    { name: 'Processing', value: results.processing_cost },
    { name: 'Dyeing', value: results.dyeing_cost },
    { name: 'Printing', value: results.colorPrintingReport?.totalPrintingCostPerMeter || 0 },
    { name: 'Finishing', value: results.finishing_cost },
    { name: 'Packaging', value: results.packaging_cost },
    { name: 'Logistics', value: results.transport_cost },
    { name: 'Overhead', value: results.overhead_cost },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20 md:pb-6">
      
      {/* Top Banner & Control Center */}
      <div className="card-soft-lg p-5 sm:p-6 bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-subtle)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[12px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30 flex items-center justify-center text-[#3B82F6] dark:text-[#6EA8FF]">
              <CalcIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Outfit'] flex items-center gap-2">
                <span>FabricIQ Cost Calculator</span>
                <span className="pill-base pill-live text-[10px]">
                  ✓ VERIFIED INPUTS
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Deterministic multi-stage textile engineering & commercial costing model.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              const allOpen = Object.values(openSections).every(Boolean);
              if (allOpen) collapseAllSections();
              else expandAllSections();
            }}
            className="btn-tactile btn-soft-secondary px-3 py-2 text-xs font-semibold cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#6EA8FF]" />
            <span>{Object.values(openSections).every(Boolean) ? 'Collapse All' : 'Expand All'}</span>
          </button>

          <button
            onClick={() => setSaveModalOpen(true)}
            className="btn-tactile btn-soft-secondary px-3.5 py-2 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-[#6EA8FF]" />
            <span>Save Estimate</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Tech Pack PDF</span>
          </button>
        </div>
      </div>

      {/* Grid: 15 Multi-Section Progressive Cards (Left 8 Cols) + Floating Summary Card (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: 15 Collapsible Engineering Sections (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">

          {/* Quick Preset Selector Bar */}
          <div className="card-soft p-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-subtle)]">
            <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#6EA8FF]" />
              <span>Load Fabric Standard Preset:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FABRIC_PRESETS.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`btn-tactile px-3 py-1 rounded-[12px] text-xs font-medium cursor-pointer border ${
                    selectedPresetId === p.id
                      ? 'bg-[#6EA8FF]/20 text-[#3B82F6] dark:text-[#67E8F9] border-[#6EA8FF]/40 font-bold shadow-sm'
                      : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[#6EA8FF]/30'
                  }`}
                >
                  {p.name.split(' ')[0]} {p.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* 01 — Physical Specification */}
          <div className="card-soft overflow-hidden">
            <button
              onClick={() => toggleSection('sec_01')}
              className="w-full p-4 flex items-center justify-between bg-[var(--surface)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#6EA8FF]/15 text-[#3B82F6] dark:text-[#6EA8FF] text-xs font-bold font-mono flex items-center justify-center">
                  01
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  Physical Specification
                </span>
                <span className="pill-base pill-verified text-[9px] py-0 px-1.5 hidden sm:inline-flex">
                  {inputs.fabricStructure.toUpperCase()}
                </span>
              </div>
              {openSections.sec_01 ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
            </button>

            {openSections.sec_01 && (
              <div className="p-5 pt-2 border-t border-[var(--border-subtle)] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Fabric Name / Construction
                    </label>
                    <input
                      type="text"
                      value={inputs.fabricType}
                      onChange={(e) => setInputs({ ...inputs, fabricType: e.target.value })}
                      className="input-soft w-full px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Customer / Project Reference
                    </label>
                    <input
                      type="text"
                      value={inputs.customerName}
                      onChange={(e) => setInputs({ ...inputs, customerName: e.target.value })}
                      className="input-soft w-full px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Finished Width (in)
                    </label>
                    <input
                      type="number"
                      value={inputs.finishedWidthInches}
                      onChange={(e) => setInputs({ ...inputs, finishedWidthInches: Number(e.target.value) })}
                      className="input-soft w-full px-3 py-2 text-xs font-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Order Length (m)
                    </label>
                    <input
                      type="number"
                      value={inputs.finishedLengthMeters}
                      onChange={(e) => setInputs({ ...inputs, finishedLengthMeters: Number(e.target.value) })}
                      className="input-soft w-full px-3 py-2 text-xs font-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Warp EPI
                    </label>
                    <input
                      type="number"
                      value={inputs.epi}
                      onChange={(e) => setInputs({ ...inputs, epi: Number(e.target.value) })}
                      className="input-soft w-full px-3 py-2 text-xs font-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Weft PPI
                    </label>
                    <input
                      type="number"
                      value={inputs.ppi}
                      onChange={(e) => setInputs({ ...inputs, ppi: Number(e.target.value) })}
                      className="input-soft w-full px-3 py-2 text-xs font-tabular"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 02 — Yarn Specification & Benchmark Rates */}
          <div className="card-soft overflow-hidden">
            <button
              onClick={() => toggleSection('sec_02')}
              className="w-full p-4 flex items-center justify-between bg-[var(--surface)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#67E8F9]/15 text-[#0284C7] dark:text-[#67E8F9] text-xs font-bold font-mono flex items-center justify-center">
                  02
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  Yarn Counts & Benchmark Rates
                </span>
              </div>
              {openSections.sec_02 ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
            </button>

            {openSections.sec_02 && (
              <div className="p-5 pt-2 border-t border-[var(--border-subtle)] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Warp Yarn */}
                  <div className="p-3.5 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)]">Warp Yarn (Ne)</span>
                      <button
                        onClick={() => applyLiveRate('warp', inputs.warpCountNe)}
                        className="text-[10px] text-[#3B82F6] dark:text-[#67E8F9] font-bold hover:underline cursor-pointer"
                      >
                        Auto-Fetch Live Rate
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] text-[var(--text-muted)] block mb-1">Count Ne</label>
                        <input
                          type="number"
                          value={inputs.warpCountNe}
                          onChange={(e) => setInputs({ ...inputs, warpCountNe: Number(e.target.value) })}
                          className="input-soft w-full px-2.5 py-1.5 text-xs font-tabular"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[var(--text-muted)] block mb-1">Rate (₨ / 10lbs)</label>
                        <input
                          type="number"
                          value={inputs.warpYarnRate}
                          onChange={(e) => setInputs({ ...inputs, warpYarnRate: Number(e.target.value) })}
                          className="input-soft w-full px-2.5 py-1.5 text-xs font-tabular"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Crimp: {inputs.warpCrimpPct}%</span>
                      <span>Waste: {inputs.warpWastePct}%</span>
                    </div>
                  </div>

                  {/* Weft Yarn */}
                  <div className="p-3.5 rounded-[16px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)]">Weft Yarn (Ne)</span>
                      <button
                        onClick={() => applyLiveRate('weft', inputs.weftCountNe)}
                        className="text-[10px] text-[#3B82F6] dark:text-[#67E8F9] font-bold hover:underline cursor-pointer"
                      >
                        Auto-Fetch Live Rate
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] text-[var(--text-muted)] block mb-1">Count Ne</label>
                        <input
                          type="number"
                          value={inputs.weftCountNe}
                          onChange={(e) => setInputs({ ...inputs, weftCountNe: Number(e.target.value) })}
                          className="input-soft w-full px-2.5 py-1.5 text-xs font-tabular"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[var(--text-muted)] block mb-1">Rate (₨ / 10lbs)</label>
                        <input
                          type="number"
                          value={inputs.weftYarnRate}
                          onChange={(e) => setInputs({ ...inputs, weftYarnRate: Number(e.target.value) })}
                          className="input-soft w-full px-2.5 py-1.5 text-xs font-tabular"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Crimp: {inputs.weftCrimpPct}%</span>
                      <span>Waste: {inputs.weftWastePct}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 03 — Weaving & Loom Economics */}
          <div className="card-soft overflow-hidden">
            <button
              onClick={() => toggleSection('sec_03')}
              className="w-full p-4 flex items-center justify-between bg-[var(--surface)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#6EE7B7]/15 text-[#059669] dark:text-[#6EE7B7] text-xs font-bold font-mono flex items-center justify-center">
                  03
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  Weaving & Sizing Economics
                </span>
              </div>
              {openSections.sec_03 ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
            </button>

            {openSections.sec_03 && (
              <div className="p-5 pt-2 border-t border-[var(--border-subtle)] space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Weaving Rate (₨ / Pick)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.weavingRate}
                      onChange={(e) => setInputs({ ...inputs, weavingRate: Number(e.target.value) })}
                      className="input-soft w-full px-3 py-2 text-xs font-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Sizing Cost (₨ / m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.sizingCostPerMeter}
                      onChange={(e) => setInputs({ ...inputs, sizingCostPerMeter: Number(e.target.value) })}
                      className="input-soft w-full px-3 py-2 text-xs font-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Grey Inspection (₨ / m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.greyInspectionCostPerMeter}
                      onChange={(e) => setInputs({ ...inputs, greyInspectionCostPerMeter: Number(e.target.value) })}
                      className="input-soft w-full px-3 py-2 text-xs font-tabular"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 04 — Yield & Waste Loss Propagation */}
          <div className="card-soft overflow-hidden">
            <button
              onClick={() => toggleSection('sec_04')}
              className="w-full p-4 flex items-center justify-between bg-[var(--surface)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#BEF264]/15 text-[#65A30D] dark:text-[#BEF264] text-xs font-bold font-mono flex items-center justify-center">
                  04
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  Yield & Multi-Stage Losses
                </span>
                <span className="pill-base pill-verified text-[9px] py-0 px-1.5">
                  Effective Yield: {results.effectiveYieldPct}%
                </span>
              </div>
              {openSections.sec_04 ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
            </button>

            {openSections.sec_04 && (
              <div className="p-5 pt-2 border-t border-[var(--border-subtle)] space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Weaving Loss %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.weavingLossPct}
                      onChange={(e) => setInputs({ ...inputs, weavingLossPct: Number(e.target.value) })}
                      className="input-soft w-full px-3 py-2 text-xs font-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Wet Processing Loss %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.wetProcessingLossPct}
                      onChange={(e) => setInputs({ ...inputs, wetProcessingLossPct: Number(e.target.value) })}
                      className="input-soft w-full px-3 py-2 text-xs font-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Finishing Loss %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.finishingLossPct}
                      onChange={(e) => setInputs({ ...inputs, finishingLossPct: Number(e.target.value) })}
                      className="input-soft w-full px-3 py-2 text-xs font-tabular"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 05 — Processing & Preparation */}
          <div className="card-soft overflow-hidden">
            <button
              onClick={() => toggleSection('sec_05')}
              className="w-full p-4 flex items-center justify-between bg-[var(--surface)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#FDE68A]/20 text-[#D97706] dark:text-[#FDE68A] text-xs font-bold font-mono flex items-center justify-center">
                  05
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  Wet Processing & Preparation
                </span>
              </div>
              {openSections.sec_05 ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
            </button>

            {openSections.sec_05 && (
              <div className="p-5 pt-2 border-t border-[var(--border-subtle)] space-y-2.5">
                {inputs.processingOperations.map((op) => (
                  <div
                    key={op.id}
                    className="p-3 rounded-[14px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={op.enabled}
                        onChange={() => toggleProcessingOp(op.id)}
                        className="w-4 h-4 rounded text-[#3B82F6] cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{op.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[var(--text-muted)]">₨/m:</span>
                      <input
                        type="number"
                        step="0.5"
                        disabled={!op.enabled}
                        value={op.costPerMeter}
                        onChange={(e) => updateProcessingCost(op.id, Number(e.target.value))}
                        className="input-soft w-20 px-2 py-1 text-xs font-tabular disabled:opacity-40"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 13: Margin & Commercial */}
          <div className="card-soft overflow-hidden">
            <button
              onClick={() => toggleSection('sec_13')}
              className="w-full p-4 flex items-center justify-between bg-[var(--surface)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#FDBA74]/15 text-[#EA580C] dark:text-[#FDBA74] text-xs font-bold font-mono flex items-center justify-center">
                  13
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  Commercial Margin, Overhead & Tax
                </span>
              </div>
              {openSections.sec_13 ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
            </button>

            {openSections.sec_13 && (
              <div className="p-5 pt-2 border-t border-[var(--border-subtle)] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[var(--text-secondary)]">Overhead %</label>
                      <span className="font-tabular text-xs font-bold text-[var(--text-primary)]">{inputs.overheadPct}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.5"
                      value={inputs.overheadPct}
                      onChange={(e) => setInputs({ ...inputs, overheadPct: Number(e.target.value) })}
                      className="slider-soft"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[var(--text-secondary)]">Target Margin %</label>
                      <span className="font-tabular text-xs font-bold text-[var(--text-primary)]">{inputs.targetMarginPct}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="0.5"
                      value={inputs.targetMarginPct}
                      onChange={(e) => setInputs({ ...inputs, targetMarginPct: Number(e.target.value) })}
                      className="slider-soft"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[var(--text-secondary)]">Tax Rate %</label>
                      <span className="font-tabular text-xs font-bold text-[var(--text-primary)]">{inputs.taxRatePct}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      step="1"
                      value={inputs.taxRatePct}
                      onChange={(e) => setInputs({ ...inputs, taxRatePct: Number(e.target.value) })}
                      className="slider-soft"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 15 — Formula Waterfall & Audit Trail */}
          <div className="card-soft overflow-hidden">
            <button
              onClick={() => toggleSection('sec_15')}
              className="w-full p-4 flex items-center justify-between bg-[var(--surface)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#C4B5FD]/15 text-[#7C3AED] dark:text-[#C4B5FD] text-xs font-bold font-mono flex items-center justify-center">
                  15
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  Formula Waterfall & Audit Trail ({results.auditSteps?.length || 0} Equations)
                </span>
              </div>
              {openSections.sec_15 ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
            </button>

            {openSections.sec_15 && (
              <div className="p-5 pt-2 border-t border-[var(--border-subtle)] space-y-2">
                {results.auditSteps?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[14px] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">
                        {step.stepNumber}. {step.name}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                        {step.formulaString} {step.inputsUsed && <span className="opacity-75">({step.inputsUsed})</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-xs text-[#3B82F6] dark:text-[#67E8F9]">
                        {step.finalValue.toFixed(2)} {step.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Large Floating Cost Summary Card (4 Cols) */}
        <div className="lg:col-span-4 sticky top-20 space-y-4">
          
          <div className="card-soft-lg p-6 bg-gradient-to-b from-[var(--surface)] to-[var(--surface-subtle)] shadow-[var(--shadow-soft-float)] border border-[var(--border-subtle)] space-y-5">
            
            {/* Header & Unit Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Costing Engine
                </span>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] font-['Outfit']">
                  Cost Summary Card
                </h3>
              </div>

              <div className="flex items-center bg-[var(--surface)] p-0.5 rounded-[12px] border border-[var(--border-subtle)] text-[11px]">
                <button
                  onClick={() => setUnitView('meter')}
                  className={`btn-tactile px-2 py-0.5 rounded-[8px] font-semibold ${
                    unitView === 'meter' ? 'bg-[#6EA8FF]/20 text-[#3B82F6] dark:text-[#67E8F9] font-bold' : 'text-[var(--text-muted)]'
                  }`}
                >
                  / m
                </button>
                <button
                  onClick={() => setUnitView('kg')}
                  className={`btn-tactile px-2 py-0.5 rounded-[8px] font-semibold ${
                    unitView === 'kg' ? 'bg-[#6EA8FF]/20 text-[#3B82F6] dark:text-[#67E8F9] font-bold' : 'text-[var(--text-muted)]'
                  }`}
                >
                  / kg
                </button>
              </div>
            </div>

            {/* Main Selling Price */}
            <div className="p-4 rounded-[20px] bg-gradient-to-br from-[#6EA8FF]/10 via-[#67E8F9]/10 to-transparent border border-[#6EA8FF]/20 text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Target Selling Price
              </span>
              <div className="text-3xl font-black font-tabular text-[#3B82F6] dark:text-[#67E8F9]">
                {currencyService.format(
                  currencyService.convert(
                    unitView === 'kg' ? results.selling_price_per_kg : results.selling_price,
                    'PKR',
                    currentCurrency
                  ),
                  currentCurrency
                )}
                <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/{unitView === 'kg' ? 'kg' : 'm'}</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-500">
                Margin: {inputs.targetMarginPct}% (+{currencyService.format(
                  currencyService.convert(results.margin_amount_per_meter, 'PKR', currentCurrency),
                  currentCurrency
                )}/m)
              </div>
            </div>

            {/* Cost Breakdown Rows */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Total Production Cost:</span>
                <span className="font-tabular font-bold text-[var(--text-primary)]">
                  {currencyService.format(
                    currencyService.convert(
                      unitView === 'kg' ? results.cost_per_kg : results.cost_per_meter,
                      'PKR',
                      currentCurrency
                    ),
                    currentCurrency
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Yarn Material Cost:</span>
                <span className="font-tabular font-semibold text-[var(--text-primary)]">
                  {currencyService.format(currencyService.convert(results.yarn_cost, 'PKR', currentCurrency), currentCurrency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Weaving & Sizing:</span>
                <span className="font-tabular font-semibold text-[var(--text-primary)]">
                  {currencyService.format(currencyService.convert(results.weaving_cost + results.sizing_cost, 'PKR', currentCurrency), currentCurrency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Processing & Finishing:</span>
                <span className="font-tabular font-semibold text-[var(--text-primary)]">
                  {currencyService.format(currencyService.convert(results.processing_cost + results.dyeing_cost + results.finishing_cost, 'PKR', currentCurrency), currentCurrency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Overhead Cost:</span>
                <span className="font-tabular font-semibold text-[var(--text-primary)]">
                  {currencyService.format(currencyService.convert(results.overhead_cost, 'PKR', currentCurrency), currentCurrency)}
                </span>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[var(--text-primary)] font-bold">
                <span>Total Order Value:</span>
                <span className="font-tabular text-sm text-[#3B82F6] dark:text-[#67E8F9]">
                  {currencyService.format(
                    currencyService.convert(results.totalOrderInvoiceValue, 'PKR', currentCurrency),
                    currentCurrency
                  )}
                </span>
              </div>
            </div>

            {/* Cost Distribution Donut */}
            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface-elevated)',
                      borderColor: 'var(--border-subtle)',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`₨ ${Number(val).toFixed(2)}/m`, 'Cost']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setSaveModalOpen(true)}
                className="btn-tactile btn-soft-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save to Quotations</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="btn-tactile btn-soft-secondary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#6EA8FF]" />
                <span>Download Tech Pack</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Save Estimate Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card-soft-elevated max-w-md w-full p-6 space-y-4 rounded-[28px] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Save Quotation Record</h3>
              <button onClick={() => setSaveModalOpen(false)} className="btn-tactile text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                ✕
              </button>
            </div>

            {saveSuccessMsg ? (
              <div className="p-4 rounded-[16px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center text-xs font-bold">
                ✓ {saveSuccessMsg}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Quotation Title</label>
                  <input
                    type="text"
                    value={inputs.estimateName}
                    onChange={(e) => setInputs({ ...inputs, estimateName: e.target.value })}
                    className="input-soft w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Customer</label>
                  <input
                    type="text"
                    value={inputs.customerName}
                    onChange={(e) => setInputs({ ...inputs, customerName: e.target.value })}
                    className="input-soft w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Notes / Terms</label>
                  <textarea
                    rows={3}
                    value={saveNotes}
                    onChange={(e) => setSaveNotes(e.target.value)}
                    placeholder="Enter payment terms, delivery timelines, or fabric comments..."
                    className="input-soft w-full px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSaveModalOpen(false)}
                    className="btn-tactile btn-soft-secondary px-4 py-2 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEstimate}
                    className="btn-tactile btn-soft-primary px-4 py-2 text-xs font-bold cursor-pointer"
                  >
                    Save Estimate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
