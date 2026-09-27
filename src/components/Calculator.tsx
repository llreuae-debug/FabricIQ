import React, { useState, useEffect } from 'react';
import { 
  Calculator as CalcIcon, 
  Download, 
  Save, 
  Layers, 
  PieChart as PieIcon, 
  FileCheck, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Eye,
  BarChart3,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import type { 
  CurrencyCode, 
  FabricCalculationInput, 
  FabricIQCalculationResult, 
  YarnCountSystem, 
  PrintingColorItem 
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
import { i18n } from '../services/i18n';

interface CalculatorProps {
  currentCurrency: CurrencyCode;
  initialPresetId?: string;
  onEstimateSaved?: () => void;
}

const PIE_COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];

export const Calculator: React.FC<CalculatorProps> = ({
  currentCurrency,
  initialPresetId,
  onEstimateSaved,
}) => {
  const rates = marketRateService.getRates();

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPresetId || 'sheeting-20x20');
  const [showDetailedDyeing, setShowDetailedDyeing] = useState<boolean>(false);
  const [selectedAuditStep, setSelectedAuditStep] = useState<number | null>(null);
  
  const [activeTabSection, setActiveTabSection] = useState<
    'physical' | 'yield' | 'rates' | 'processing' | 'printing' | 'logistics' | 'commercial' | 'audit'
  >('physical');

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

  // Color Printing Handlers
  const addPrintingColor = () => {
    const newColor: PrintingColorItem = {
      id: `col-${Date.now()}`,
      colorName: `Color ${((inputs.colorPrinting?.colors?.length || 0) + 1)}`,
      hexCode: '#3B82F6',
      consumptionGramsPerMeter: 3.5,
      inkRatePerKg: 1500,
      costPerMeter: 5.25,
    };
    setInputs((prev) => ({
      ...prev,
      colorPrinting: {
        ...(prev.colorPrinting || DEFAULT_COLOR_PRINTING),
        enabled: true,
        colors: [...(prev.colorPrinting?.colors || []), newColor],
        screenCount: (prev.colorPrinting?.colors?.length || 0) + 1,
      },
    }));
  };

  const updatePrintingColor = (id: string, field: keyof PrintingColorItem, value: any) => {
    setInputs((prev) => {
      const colors = (prev.colorPrinting?.colors || []).map((c) => {
        if (c.id === id) {
          const updated = { ...c, [field]: value };
          if (field === 'consumptionGramsPerMeter' || field === 'inkRatePerKg') {
            updated.costPerMeter = (updated.consumptionGramsPerMeter / 1000) * updated.inkRatePerKg;
          }
          return updated;
        }
        return c;
      });
      return {
        ...prev,
        colorPrinting: {
          ...(prev.colorPrinting || DEFAULT_COLOR_PRINTING),
          colors,
        },
      };
    });
  };

  const removePrintingColor = (id: string) => {
    setInputs((prev) => {
      const colors = (prev.colorPrinting?.colors || []).filter((c) => c.id !== id);
      return {
        ...prev,
        colorPrinting: {
          ...(prev.colorPrinting || DEFAULT_COLOR_PRINTING),
          colors,
          screenCount: Math.max(1, colors.length),
        },
      };
    });
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
    { name: 'Color Printing', value: results.colorPrintingReport?.totalPrintingCostPerMeter || 0 },
    { name: 'Finishing', value: results.finishing_cost },
    { name: 'Packaging', value: results.packaging_cost },
    { name: 'Logistics', value: results.transport_cost },
    { name: 'Overhead', value: results.overhead_cost },
  ].filter((d) => d.value > 0);

  const waterfallData = results.costWaterfall?.map((item) => ({
    name: item.stageName,
    cost: Number(item.stageCostPerMeter.toFixed(2)),
    cumulative: Number(item.cumulativeCostPerMeter.toFixed(2)),
  })) || [];

  const COSTING_STEPS = [
    { id: 'physical', num: 1, label: 'Physical Specs', short: 'Specs' },
    { id: 'yield', num: 2, label: 'Yield & Losses', short: 'Yield' },
    { id: 'rates', num: 3, label: 'Yarn & Weaving', short: 'Yarn' },
    { id: 'processing', num: 4, label: 'Processing & Dyeing', short: 'Dyeing' },
    { id: 'printing', num: 5, label: 'Printing / Colors', short: 'Colors' },
    { id: 'logistics', num: 6, label: 'Packaging & Logistics', short: 'Logistics' },
    { id: 'commercial', num: 7, label: 'Margin & Tax', short: 'Commercial' },
    { id: 'audit', num: 8, label: 'Formula Audit & Waterfall', short: 'Audit' },
  ] as const;

  const currentStepIndex = COSTING_STEPS.findIndex((s) => s.id === activeTabSection);

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setActiveTabSection(COSTING_STEPS[currentStepIndex - 1].id as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < COSTING_STEPS.length - 1) {
      setActiveTabSection(COSTING_STEPS[currentStepIndex + 1].id as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20 md:pb-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CalcIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                <span>FabricIQ Pro — Deterministic Costing Engine</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{results.estimateConfidence || 'VERIFIED INPUTS (100%)'}</span>
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Manufacturing-grade mathematical costing: <strong>Input → Formula → Intermediate Result → Final Cost</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTabSection('audit')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Formula Audit ({results.auditSteps?.length || 0} Steps)</span>
          </button>

          <button
            onClick={() => setSaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" />
            <span>{i18n.t('save_estimate')}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{i18n.t('export_pdf')}</span>
          </button>
        </div>
      </div>

      {/* Preset Picker & Structure Selector Header in 3D Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-800 shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.06)]">
        <div className="md:col-span-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_2px_8px_rgba(99,102,241,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-300">Preset:</span>
          <select
            value={selectedPresetId}
            onChange={(e) => applyPreset(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500 shadow-inner"
          >
            {FABRIC_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Structure Selector (Woven vs Knitted) in 3D Segmented Control */}
        <div className="md:col-span-8 flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Structure:</span>
            <div className="p-1 rounded-xl bg-slate-950/90 border border-slate-800/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex items-center gap-1">
              <button
                onClick={() => setInputs({ ...inputs, fabricStructure: 'woven' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inputs.fabricStructure === 'woven'
                    ? 'bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-[0_3px_10px_rgba(79,70,229,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-indigo-400/50 -translate-y-0.5 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                Woven (Loom)
              </button>
              <button
                onClick={() => setInputs({ ...inputs, fabricStructure: 'knitted' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inputs.fabricStructure === 'knitted'
                    ? 'bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-[0_3px_10px_rgba(79,70,229,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-indigo-400/50 -translate-y-0.5 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                Knitted (Circular/Flat)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Method:</span>
            <div className="p-1 rounded-xl bg-slate-950/90 border border-slate-800/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex items-center gap-1">
              <button
                onClick={() => setInputs({ ...inputs, costingMethod: 'engineered' })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inputs.costingMethod === 'engineered'
                    ? 'bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-[0_3px_10px_rgba(79,70,229,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-indigo-400/50 -translate-y-0.5 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                Physical Engineering
              </button>
              <button
                onClick={() => setInputs({ ...inputs, costingMethod: 'direct_grey_meter' })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inputs.costingMethod === 'direct_grey_meter'
                    ? 'bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-[0_3px_10px_rgba(79,70,229,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-indigo-400/50 -translate-y-0.5 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                Grey Rate/m
              </button>
              <button
                onClick={() => setInputs({ ...inputs, costingMethod: 'direct_grey_kg' })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  inputs.costingMethod === 'direct_grey_kg'
                    ? 'bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-[0_3px_10px_rgba(79,70,229,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-indigo-400/50 -translate-y-0.5 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                Grey Rate/kg
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STEP WIZARD PROGRESS BAR (Visible on Mobile & Small Tablets) */}
      <div className="md:hidden p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">
              {currentStepIndex + 1}
            </span>
            <span className="text-xs font-bold text-white font-['Outfit']">
              {COSTING_STEPS[currentStepIndex]?.label}
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">
            Step {currentStepIndex + 1} of {COSTING_STEPS.length}
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${((currentStepIndex + 1) / COSTING_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Fast Jump Step Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {COSTING_STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTabSection(s.id as any)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all touch-target-sm ${
                activeTabSection === s.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm scale-105'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {s.num}. {s.short}
            </button>
          ))}
        </div>
      </div>

      {/* DESKTOP & TABLET 3D Floating Navigation Sub-Tabs Dock */}
      <div className="hidden md:flex p-1.5 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950/90 border border-slate-800/90 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-xl items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {COSTING_STEPS.map((tab) => {
          const isActive = activeTabSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabSection(tab.id as any)}
              className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? 'bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-[0_6px_20px_rgba(79,70,229,0.45),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.25)] border border-indigo-400/60 scale-[1.02] -translate-y-0.5'
                  : 'bg-slate-900/60 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${
                  isActive
                    ? 'bg-white/25 text-white border border-white/40 shadow-inner'
                    : 'bg-slate-800/90 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700/80 border border-slate-700/50'
                }`}
              >
                {tab.num}
              </span>
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Section (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Metadata Information */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                <span>Estimate & Order Header</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Target: <strong>{inputs.finishedLengthMeters.toLocaleString()} Meters</strong>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Estimate / Project Reference
                </label>
                <input
                  type="text"
                  value={inputs.estimateName}
                  onChange={(e) => setInputs({ ...inputs, estimateName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Customer / Buyer Name
                </label>
                <input
                  type="text"
                  value={inputs.customerName}
                  onChange={(e) => setInputs({ ...inputs, customerName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* TAB 1: PHYSICAL SPECIFICATIONS */}
          {activeTabSection === 'physical' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Physical Fabric Construction Engine ({inputs.fabricStructure === 'knitted' ? 'Knitted' : 'Woven'})</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Weight/m: <strong className="text-indigo-400">{results.weightPerMeterKg} kg/m</strong>
                </span>
              </div>

              {inputs.costingMethod === 'engineered' ? (
                inputs.fabricStructure === 'knitted' ? (
                  /* Knitted Fabric Engine */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Finished Width (Inches)
                        </label>
                        <input
                          type="number"
                          value={inputs.finishedWidthInches}
                          onChange={(e) => setInputs({ ...inputs, finishedWidthInches: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Finished Length (m)
                        </label>
                        <input
                          type="number"
                          value={inputs.finishedLengthMeters}
                          onChange={(e) => setInputs({ ...inputs, finishedLengthMeters: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Stitch Length (mm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={inputs.knittingStitchLengthMm || 2.8}
                          onChange={(e) => setInputs({ ...inputs, knittingStitchLengthMm: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Machine Gauge (E)
                        </label>
                        <input
                          type="number"
                          value={inputs.knittingGauge || 24}
                          onChange={(e) => setInputs({ ...inputs, knittingGauge: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Courses / cm (CPC)
                        </label>
                        <input
                          type="number"
                          value={inputs.knittingCoursesPerCm || 16}
                          onChange={(e) => setInputs({ ...inputs, knittingCoursesPerCm: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Wales / cm (WPC)
                        </label>
                        <input
                          type="number"
                          value={inputs.knittingWalesPerCm || 12}
                          onChange={(e) => setInputs({ ...inputs, knittingWalesPerCm: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Knit Yarn Count ({inputs.warpCountSystem})
                        </label>
                        <input
                          type="number"
                          value={inputs.warpCountNe}
                          onChange={(e) => setInputs({ ...inputs, warpCountNe: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Count System
                        </label>
                        <select
                          value={inputs.warpCountSystem}
                          onChange={(e) => setInputs({ ...inputs, warpCountSystem: e.target.value as YarnCountSystem })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                        >
                          <option value="Ne">Ne (English Cotton)</option>
                          <option value="Nm">Nm (Metric)</option>
                          <option value="Tex">Tex (g/km)</option>
                          <option value="Denier">Denier (Filament)</option>
                          <option value="dTex">dTex</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Woven Fabric Engine */
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Finished Width (Inches)
                        </label>
                        <input
                          type="number"
                          value={inputs.finishedWidthInches}
                          onChange={(e) => setInputs({ ...inputs, finishedWidthInches: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Finished Target (m)
                        </label>
                        <input
                          type="number"
                          value={inputs.finishedLengthMeters}
                          onChange={(e) => setInputs({ ...inputs, finishedLengthMeters: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Warp Count System
                        </label>
                        <select
                          value={inputs.warpCountSystem}
                          onChange={(e) => setInputs({ ...inputs, warpCountSystem: e.target.value as YarnCountSystem })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                        >
                          <option value="Ne">Ne (English)</option>
                          <option value="Nm">Nm (Metric)</option>
                          <option value="Tex">Tex</option>
                          <option value="Denier">Denier</option>
                          <option value="dTex">dTex</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Warp Count ({inputs.warpCountSystem})
                        </label>
                        <input
                          type="number"
                          value={inputs.warpCountNe}
                          onChange={(e) => setInputs({ ...inputs, warpCountNe: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Weft Count System
                        </label>
                        <select
                          value={inputs.weftCountSystem}
                          onChange={(e) => setInputs({ ...inputs, weftCountSystem: e.target.value as YarnCountSystem })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                        >
                          <option value="Ne">Ne (English)</option>
                          <option value="Nm">Nm (Metric)</option>
                          <option value="Tex">Tex</option>
                          <option value="Denier">Denier</option>
                          <option value="dTex">dTex</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Weft Count ({inputs.weftCountSystem})
                        </label>
                        <input
                          type="number"
                          value={inputs.weftCountNe}
                          onChange={(e) => setInputs({ ...inputs, weftCountNe: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          EPI (Ends / Inch)
                        </label>
                        <input
                          type="number"
                          value={inputs.epi}
                          onChange={(e) => setInputs({ ...inputs, epi: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          PPI (Picks / Inch)
                        </label>
                        <input
                          type="number"
                          value={inputs.ppi}
                          onChange={(e) => setInputs({ ...inputs, ppi: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Warp Crimp %
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={inputs.warpCrimpPct}
                          onChange={(e) => setInputs({ ...inputs, warpCrimpPct: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Weft Crimp %
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={inputs.weftCrimpPct}
                          onChange={(e) => setInputs({ ...inputs, weftCrimpPct: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Warp Waste %
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={inputs.warpWastePct}
                          onChange={(e) => setInputs({ ...inputs, warpWastePct: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Weft Waste %
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={inputs.weftWastePct}
                          onChange={(e) => setInputs({ ...inputs, weftWastePct: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </>
                )
              ) : inputs.costingMethod === 'direct_grey_meter' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Grey Fabric Rate / Meter (₨)
                      </label>
                      <input
                        type="number"
                        value={inputs.directGreyRatePerMeter}
                        onChange={(e) => setInputs({ ...inputs, directGreyRatePerMeter: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Fabric Width (Inches)
                      </label>
                      <input
                        type="number"
                        value={inputs.finishedWidthInches}
                        onChange={(e) => setInputs({ ...inputs, finishedWidthInches: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Estimated Finished GSM
                      </label>
                      <input
                        type="number"
                        value={inputs.directGSM}
                        onChange={(e) => setInputs({ ...inputs, directGSM: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Grey Fabric Rate / Kg (₨)
                      </label>
                      <input
                        type="number"
                        value={inputs.directGreyRatePerKg}
                        onChange={(e) => setInputs({ ...inputs, directGreyRatePerKg: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Fabric GSM
                      </label>
                      <input
                        type="number"
                        value={inputs.directGSM}
                        onChange={(e) => setInputs({ ...inputs, directGSM: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Width (Inches)
                      </label>
                      <input
                        type="number"
                        value={inputs.finishedWidthInches}
                        onChange={(e) => setInputs({ ...inputs, finishedWidthInches: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Physical Consumption Engine Summary Card */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 text-xs">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Physical Consumption & Normalized Density:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 text-[11px]">
                  <div>Warp: <strong className="text-white">{results.warpWeightPerMeterGrams} g/m</strong></div>
                  <div>Weft: <strong className="text-white">{results.weftWeightPerMeterGrams} g/m</strong></div>
                  <div>Grey GSM: <strong className="text-emerald-400">{results.estimatedGreyGSM} gsm</strong></div>
                  <div>Finished GSM: <strong className="text-emerald-400">~{results.estimatedFinishedGSM} gsm</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-STAGE PRODUCTION YIELD & LOSSES */}
          {activeTabSection === 'yield' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Multi-Stage Yield & Loss Engine (Compound Product Rule)</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-400">
                  Effective Cumulative Yield: {results.effectiveYieldPct}%
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Independent process losses are multiplied cumulatively ($Effective\ Yield = \prod (1 - Loss_i)$) to calculate exact required input.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {Object.entries(inputs.yieldLossStages || DEFAULT_YIELD_STAGES).map(([stageKey, val]) => {
                  const label = stageKey
                    .replace('LossPct', '')
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());
                  return (
                    <div key={stageKey} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1 truncate">
                        {label} %
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={val}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            yieldLossStages: {
                              ...(inputs.yieldLossStages || DEFAULT_YIELD_STAGES),
                              [stageKey]: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Cumulative Yield Formula Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
                <div className="text-xs font-semibold text-indigo-300">
                  Yield & Input Requirement Formula:
                </div>
                <div className="text-xs font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto">
                  Required Input = Finished Target ({inputs.finishedLengthMeters.toLocaleString()}m) ÷ {results.effectiveYieldPct}% = <span className="text-amber-400 font-bold">{results.requiredGreyInputMeters.toLocaleString()} Meters</span> ({results.requiredGreyInputKg.toLocaleString()} Kg)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Finished Output:</span>
                    <strong className="text-white">{results.finishedOutputMeters.toLocaleString()} m ({results.finishedOutputKg.toLocaleString()} kg)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Required Grey Input:</span>
                    <strong className="text-amber-300">{results.requiredGreyInputMeters.toLocaleString()} m</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Yarn Required:</span>
                    <strong className="text-indigo-300">{results.totalYarnWeightKg.toLocaleString()} kg</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Yarn (100-lb Bags):</span>
                    <strong className="text-indigo-300">{results.totalYarnBags100lbs.toFixed(1)} Bags</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: YARN & WEAVING / KNITTING RATES */}
          {activeTabSection === 'rates' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Commercial Yarn & Weaving / Knitting Rates Engine</span>
                </h3>
              </div>

              {inputs.costingMethod === 'engineered' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Warp Yarn */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">
                          Warp Yarn ({inputs.warpCountNe} {inputs.warpCountSystem})
                        </span>
                        <button
                          onClick={() => applyLiveRate('warp', inputs.warpCountNe)}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Use Live Rate</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={inputs.warpYarnRate}
                          onChange={(e) => setInputs({ ...inputs, warpYarnRate: Number(e.target.value) })}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                        <select
                          value={inputs.warpYarnRateUnit}
                          onChange={(e) => setInputs({ ...inputs, warpYarnRateUnit: e.target.value as any })}
                          className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300"
                        >
                          <option value="10lbs">₨ / 10lbs</option>
                          <option value="kg">₨ / Kg</option>
                          <option value="lb">₨ / Lb</option>
                        </select>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Warp Cost/m:</span>
                        <span className="font-semibold text-slate-200">₨ {results.warp_yarn_cost.toFixed(2)}/m</span>
                      </div>
                    </div>

                    {/* Weft Yarn */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">
                          Weft Yarn ({inputs.weftCountNe} {inputs.weftCountSystem})
                        </span>
                        <button
                          onClick={() => applyLiveRate('weft', inputs.weftCountNe)}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Use Live Rate</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={inputs.weftYarnRate}
                          onChange={(e) => setInputs({ ...inputs, weftYarnRate: Number(e.target.value) })}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                        <select
                          value={inputs.weftYarnRateUnit}
                          onChange={(e) => setInputs({ ...inputs, weftYarnRateUnit: e.target.value as any })}
                          className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300"
                        >
                          <option value="10lbs">₨ / 10lbs</option>
                          <option value="kg">₨ / Kg</option>
                          <option value="lb">₨ / Lb</option>
                        </select>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Weft Cost/m:</span>
                        <span className="font-semibold text-slate-200">₨ {results.weft_yarn_cost.toFixed(2)}/m</span>
                      </div>
                    </div>
                  </div>

                  {/* Weaving Economics & Sizing */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-slate-200">
                      {inputs.fabricStructure === 'knitted' ? 'Knitting Machine Economics' : 'Weaving & Loom Economics'}
                    </div>

                    {inputs.fabricStructure === 'knitted' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Knitting Conversion Rate (₨/Kg)</label>
                          <input
                            type="number"
                            value={inputs.knittingRatePerKg || 65}
                            onChange={(e) => setInputs({ ...inputs, knittingRatePerKg: Number(e.target.value) })}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Knitting Efficiency %</label>
                          <input
                            type="number"
                            value={inputs.knittingEfficiencyPct || 92}
                            onChange={(e) => setInputs({ ...inputs, knittingEfficiencyPct: Number(e.target.value) })}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Knitting Waste %</label>
                          <input
                            type="number"
                            value={inputs.knittingWastePct || 2.5}
                            onChange={(e) => setInputs({ ...inputs, knittingWastePct: Number(e.target.value) })}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Weaving Method</label>
                          <select
                            value={inputs.weavingCostMethod}
                            onChange={(e) => setInputs({ ...inputs, weavingCostMethod: e.target.value as any })}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                          >
                            <option value="per_pick">Per Pick Rate</option>
                            <option value="per_meter">Per Meter Rate</option>
                            <option value="per_kg">Per Kg Rate</option>
                            <option value="machine_economics">Machine Hourly Economics</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Weaving Rate / Machine Cost</label>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs.weavingRate}
                            onChange={(e) => setInputs({ ...inputs, weavingRate: Number(e.target.value) })}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Sizing Cost / m (₨)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={inputs.sizingCostPerMeter}
                            onChange={(e) => setInputs({ ...inputs, sizingCostPerMeter: Number(e.target.value) })}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Grey Inspection / m (₨)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={inputs.greyInspectionCostPerMeter || 1.2}
                            onChange={(e) => setInputs({ ...inputs, greyInspectionCostPerMeter: Number(e.target.value) })}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  Direct Grey Cost Mode is active ({inputs.costingMethod === 'direct_grey_meter' ? 'Per Meter' : 'Per Kg'}).
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROCESSING & DYEING */}
          {activeTabSection === 'processing' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold">4</span>
                  <span>Modular Processing & Finishing Checklist</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Total Processing & Dyeing: <strong className="text-indigo-400">₨ {(results.processing_cost + results.dyeing_cost + results.finishing_cost).toFixed(2)}/m</strong>
                </span>
              </div>

              {/* Operations Checklist */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inputs.processingOperations.map((op) => (
                    <div
                      key={op.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        op.enabled
                          ? 'bg-slate-950 border-indigo-500/40 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={op.enabled}
                          onChange={() => toggleProcessingOp(op.id)}
                          className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                        />
                        <span className="text-xs font-medium text-slate-200">{op.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-500">₨</span>
                        <input
                          type="number"
                          disabled={!op.enabled}
                          value={op.costPerMeter}
                          onChange={(e) => updateProcessingCost(op.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-right text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Dyeing Breakdown Drawer */}
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
                <div
                  onClick={() => setShowDetailedDyeing(!showDetailedDyeing)}
                  className="cursor-pointer flex items-center justify-between text-xs font-bold text-indigo-300"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inputs.detailedDyeing?.enabled || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        setInputs({
                          ...inputs,
                          detailedDyeing: { ...inputs.detailedDyeing, enabled: !inputs.detailedDyeing?.enabled },
                        });
                      }}
                      className="w-3.5 h-3.5"
                    />
                    <span>Detailed Dyeing Breakdown (Machine, Dyes, Steam, Chemicals, Batch Min)</span>
                  </div>
                  {showDetailedDyeing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>

                {showDetailedDyeing && inputs.detailedDyeing?.enabled && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Machine Charge</label>
                      <input
                        type="number"
                        value={inputs.detailedDyeing.machineChargePerMeter}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            detailedDyeing: { ...inputs.detailedDyeing, machineChargePerMeter: Number(e.target.value) },
                          })
                        }
                        className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Dye Cost</label>
                      <input
                        type="number"
                        value={inputs.detailedDyeing.dyeCostPerMeter}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            detailedDyeing: { ...inputs.detailedDyeing, dyeCostPerMeter: Number(e.target.value) },
                          })
                        }
                        className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Chemicals</label>
                      <input
                        type="number"
                        value={inputs.detailedDyeing.chemicalCostPerMeter}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            detailedDyeing: { ...inputs.detailedDyeing, chemicalCostPerMeter: Number(e.target.value) },
                          })
                        }
                        className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Steam / Energy</label>
                      <input
                        type="number"
                        value={inputs.detailedDyeing.steamEnergyCostPerMeter}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            detailedDyeing: { ...inputs.detailedDyeing, steamEnergyCostPerMeter: Number(e.target.value) },
                          })
                        }
                        className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: COLOR-WISE PRINTING */}
          {activeTabSection === 'printing' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inputs.colorPrinting?.enabled || false}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        colorPrinting: {
                          ...(inputs.colorPrinting || DEFAULT_COLOR_PRINTING),
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                  />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Enable Color-Wise Printing Calculator
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-indigo-300">
                  Printing Total: ₨ {results.colorPrintingReport?.totalPrintingCostPerMeter.toFixed(2) || '0.00'}/m
                </span>
              </div>

              {inputs.colorPrinting?.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Printing Method</label>
                      <select
                        value={inputs.colorPrinting.method}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            colorPrinting: {
                              ...inputs.colorPrinting!,
                              method: e.target.value as any,
                            },
                          })
                        }
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      >
                        <option value="rotary_screen">Rotary Screen Printing</option>
                        <option value="flatbed_screen">Flatbed Screen Printing</option>
                        <option value="digital_reactive">Digital Reactive Inkjet</option>
                        <option value="digital_sublimation">Digital Sublimation</option>
                        <option value="pigment">Pigment Printing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Screen Cost / Screen (₨)</label>
                      <input
                        type="number"
                        value={inputs.colorPrinting.screenCostPerScreen}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            colorPrinting: {
                              ...inputs.colorPrinting!,
                              screenCostPerScreen: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Machine Rate / m (₨)</label>
                      <input
                        type="number"
                        value={inputs.colorPrinting.machinePrintingRatePerMeter}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            colorPrinting: {
                              ...inputs.colorPrinting!,
                              machinePrintingRatePerMeter: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Color Channels Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        Color Channels ({inputs.colorPrinting.colors?.length || 0} Colors)
                      </span>
                      <button
                        onClick={addPrintingColor}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 touch-target-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Color</span>
                      </button>
                    </div>

                    {/* MOBILE EXPANDABLE COLOR CARDS (Visible on phones sm:hidden) */}
                    <div className="sm:hidden space-y-3">
                      {inputs.colorPrinting.colors?.map((col, idx) => (
                        <div 
                          key={col.id} 
                          className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 shadow-md"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-black text-[10px] flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-white font-['Outfit']">
                                {col.colorName || `Color ${idx + 1}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-emerald-400">
                                ₨ {((col.consumptionGramsPerMeter / 1000) * col.inkRatePerKg).toFixed(2)}/m
                              </span>
                              <button
                                onClick={() => removePrintingColor(col.id)}
                                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 touch-target-sm"
                                title="Remove Color"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Color Name / Reference</label>
                              <input
                                type="text"
                                value={col.colorName}
                                onChange={(e) => updatePrintingColor(col.id, 'colorName', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                                placeholder="e.g. Cyan, Deep Navy"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Consumption (g/m)</label>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.1"
                                  value={col.consumptionGramsPerMeter}
                                  onChange={(e) => updatePrintingColor(col.id, 'consumptionGramsPerMeter', Number(e.target.value))}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ink Rate (₨/Kg)</label>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  value={col.inkRatePerKg}
                                  onChange={(e) => updatePrintingColor(col.id, 'inkRatePerKg', Number(e.target.value))}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* DESKTOP / TABLET COLOR TABLE (Visible on sm:block) */}
                    <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                          <tr>
                            <th className="p-2.5">Color Name</th>
                            <th className="p-2.5">Consumption (g/m)</th>
                            <th className="p-2.5">Ink Rate (₨/Kg)</th>
                            <th className="p-2.5">Cost / Meter</th>
                            <th className="p-2.5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                          {inputs.colorPrinting.colors?.map((col) => (
                            <tr key={col.id}>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={col.colorName}
                                  onChange={(e) => updatePrintingColor(col.id, 'colorName', e.target.value)}
                                  className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-white"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.1"
                                  value={col.consumptionGramsPerMeter}
                                  onChange={(e) => updatePrintingColor(col.id, 'consumptionGramsPerMeter', Number(e.target.value))}
                                  className="w-24 p-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-white"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  value={col.inkRatePerKg}
                                  onChange={(e) => updatePrintingColor(col.id, 'inkRatePerKg', Number(e.target.value))}
                                  className="w-28 p-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-white"
                                />
                              </td>
                              <td className="p-2 font-bold text-emerald-400">
                                ₨ {((col.consumptionGramsPerMeter / 1000) * col.inkRatePerKg).toFixed(2)}/m
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => removePrintingColor(col.id)}
                                  className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PACKAGING & LOGISTICS */}
          {activeTabSection === 'logistics' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold">6</span>
                  <span>Packaging & Logistics Breakdown Engine</span>
                </h3>
              </div>

              {/* Packaging */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200">Packaging Specifications</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Meters per Roll</label>
                    <input
                      type="number"
                      value={inputs.packaging?.metersPerRoll || 100}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          packaging: { ...(inputs.packaging || DEFAULT_PACKAGING), metersPerRoll: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Polybag / Roll (₨)</label>
                    <input
                      type="number"
                      value={inputs.packaging?.polybagCostPerRoll || 45}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          packaging: { ...(inputs.packaging || DEFAULT_PACKAGING), polybagCostPerRoll: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Carton / Roll (₨)</label>
                    <input
                      type="number"
                      value={inputs.packaging?.cartonCostPerRoll || 120}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          packaging: { ...(inputs.packaging || DEFAULT_PACKAGING), cartonCostPerRoll: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Labor / m (₨)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.packaging?.packagingLaborPerMeter || 0.85}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          packaging: { ...(inputs.packaging || DEFAULT_PACKAGING), packagingLaborPerMeter: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Logistics */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span>Logistics & Freight Calculation</span>
                  <select
                    value={inputs.logistics?.method || 'by_weight'}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        logistics: { ...(inputs.logistics || DEFAULT_LOGISTICS), method: e.target.value as any },
                      })
                    }
                    className="p-1.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                  >
                    <option value="by_weight">By Weight (Rate/Kg)</option>
                    <option value="by_distance_km">Distance × Rate/Km</option>
                    <option value="fixed_container">Fixed Container / Truck</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {inputs.logistics?.method === 'by_distance_km' ? (
                    <>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Distance (Km)</label>
                        <input
                          type="number"
                          value={inputs.logistics.distanceKm}
                          onChange={(e) =>
                            setInputs({
                              ...inputs,
                              logistics: { ...inputs.logistics!, distanceKm: Number(e.target.value) },
                            })
                          }
                          className="w-full p-2 rounded bg-slate-900 border border-slate-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Rate per Km (₨)</label>
                        <input
                          type="number"
                          value={inputs.logistics.ratePerKm}
                          onChange={(e) =>
                            setInputs({
                              ...inputs,
                              logistics: { ...inputs.logistics!, ratePerKm: Number(e.target.value) },
                            })
                          }
                          className="w-full p-2 rounded bg-slate-900 border border-slate-800 font-mono"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Freight Rate / Kg (₨)</label>
                      <input
                        type="number"
                        value={inputs.logistics?.freightRatePerKg || 14}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            logistics: { ...(inputs.logistics || DEFAULT_LOGISTICS), freightRatePerKg: Number(e.target.value) },
                          })
                        }
                        className="w-full p-2 rounded bg-slate-900 border border-slate-800 font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Transit Insurance %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.logistics?.transitInsurancePct || 0.5}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          logistics: { ...(inputs.logistics || DEFAULT_LOGISTICS), transitInsurancePct: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MARGIN & TAX */}
          {activeTabSection === 'commercial' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold">7</span>
                  <span>Commercial Margin vs Markup & Tax Engine</span>
                </h3>
              </div>

              {/* CRITICAL FEATURE: MARKUP VS MARGIN STRATEGY */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Commercial Pricing Strategy:
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    MARKUP vs MARGIN
                  </span>
                </div>

                {/* Switcher Toggle */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setInputs({ ...inputs, pricingStrategy: 'margin' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      inputs.pricingStrategy === 'margin'
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between mb-1">
                      <span>True Profit Margin</span>
                      <span className="text-[10px] font-mono bg-black/20 px-1.5 py-0.5 rounded">Cost ÷ (1 - Margin%)</span>
                    </div>
                    <p className="text-[11px] opacity-90">
                      Standard corporate accounting margin based on selling price.
                    </p>
                  </button>

                  <button
                    onClick={() => setInputs({ ...inputs, pricingStrategy: 'markup' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      inputs.pricingStrategy === 'markup'
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between mb-1">
                      <span>Cost Markup</span>
                      <span className="text-[10px] font-mono bg-black/20 px-1.5 py-0.5 rounded">Cost × (1 + Markup%)</span>
                    </div>
                    <p className="text-[11px] opacity-90">
                      Simple percentage added directly on top of production cost.
                    </p>
                  </button>
                </div>

                {/* Percentage Input & Formula Display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      {inputs.pricingStrategy === 'margin' ? 'Target Margin %' : 'Target Markup %'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={inputs.pricingStrategy === 'margin' ? inputs.targetMarginPct : inputs.targetMarkupPct}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          [inputs.pricingStrategy === 'margin' ? 'targetMarginPct' : 'targetMarkupPct']: Number(
                            e.target.value
                          ),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                      Profit Contribution: <strong className="text-emerald-400 font-bold">+₨ {results.margin_amount_per_meter.toFixed(2)}/m</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Engine */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span>Tax & Invoice Configuration</span>
                  <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                    {(['exclusive', 'inclusive', 'exempt'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setInputs({ ...inputs, taxMode: m })}
                        className={`px-2.5 py-1 rounded capitalize font-medium ${
                          inputs.taxMode === m ? 'bg-indigo-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {inputs.taxMode !== 'exempt' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Sales Tax / GST / VAT %</label>
                      <input
                        type="number"
                        step="0.5"
                        value={inputs.taxRatePct}
                        onChange={(e) => setInputs({ ...inputs, taxRatePct: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                        Calculated Tax: <strong className="text-amber-400">₨ {results.tax.toFixed(2)} / m</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: DETERMINISTIC FORMULA AUDIT & WATERFALL */}
          {activeTabSection === 'audit' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                  <span>Deterministic Audit Trail (Input → Formula → Intermediate → Final)</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {results.calculationCompletenessScore || 100}% Completeness
                </span>
              </div>

              {/* Visual Cost Waterfall Bar Chart */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Visual Cost Waterfall: Cumulative Build-Up (₨ / Meter)</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Final: ₨ {results.final_price.toFixed(2)}/m
                  </span>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={waterfallData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '10px',
                          fontSize: '11px',
                        }}
                        formatter={(val: any, name: any) => [
                          `₨ ${Number(val).toFixed(2)}/m`,
                          name === 'cost' ? 'Stage Cost' : 'Cumulative Cost',
                        ]}
                      />
                      <Bar dataKey="cumulative" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Step by Step Trace Cards */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {results.auditSteps?.map((step) => (
                  <div
                    key={step.stepNumber}
                    onClick={() => setSelectedAuditStep(selectedAuditStep === step.stepNumber ? null : step.stepNumber)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-indigo-500/40 cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                          {step.stepNumber}
                        </span>
                        <span className="font-bold text-white">{step.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-900">
                          {step.category}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">
                        {step.finalValue.toFixed(2)} {step.unit}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono bg-slate-900/90 p-2 rounded text-indigo-300">
                      <code>{step.formulaString}</code>
                    </div>

                    {selectedAuditStep === step.stepNumber && (
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 grid grid-cols-2 gap-2 animate-in fade-in">
                        <div>Inputs Used: <span className="text-slate-200">{step.inputsUsed}</span></div>
                        <div>Intermediate: <span className="text-amber-300">{step.intermediateResult}</span></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESPONSIVE STEP-BASED NAVIGATION CONTROLS (Previous ← / Next →) */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-200 border border-slate-700 transition-all touch-target cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <span className="hidden sm:inline-block text-xs font-mono font-bold text-cyan-400">
              {currentStepIndex + 1} / {COSTING_STEPS.length}
            </span>

            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === COSTING_STEPS.length - 1}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all touch-target cursor-pointer active:scale-95"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Output Results & Commercial Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Master Quotation Card */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 shadow-2xl shadow-indigo-500/10 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                FabricIQ Commercial Quotation
              </span>
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
                {(['meter', 'kg', 'yard'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnitView(u)}
                    className={`px-2 py-0.5 rounded capitalize font-medium ${
                      unitView === u ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    /{u}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-indigo-300 mb-1">
                Final Invoice Selling Price ({inputs.taxMode === 'exclusive' ? 'Tax Exclusive + GST' : 'Tax Inclusive'})
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-['Outfit']">
                {currencyService.format(
                  currencyService.convert(
                    unitView === 'meter'
                      ? results.final_price
                      : unitView === 'kg'
                      ? results.final_price_per_kg
                      : results.final_price_per_yard,
                    'PKR',
                    currentCurrency
                  ),
                  currentCurrency
                )}
                <span className="text-sm font-medium text-slate-400 ml-1.5">
                  / {unitView}
                </span>
              </div>
            </div>

            {/* Cost & Profit Pillars */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Total Production Cost</span>
                <span className="text-base font-bold text-slate-200">
                  {currencyService.format(
                    currencyService.convert(
                      unitView === 'meter'
                        ? results.cost_per_meter
                        : unitView === 'kg'
                        ? results.cost_per_kg
                        : results.cost_per_yard,
                      'PKR',
                      currentCurrency
                    ),
                    currentCurrency
                  )}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {inputs.pricingStrategy === 'margin' ? `Margin (${inputs.targetMarginPct}%)` : `Markup (${inputs.targetMarkupPct}%)`}
                </span>
                <span className="text-base font-bold text-emerald-400">
                  +{currencyService.format(
                    currencyService.convert(
                      unitView === 'meter'
                        ? results.margin_amount_per_meter
                        : unitView === 'kg'
                        ? results.margin_amount_per_meter * (results.selling_price_per_kg / results.selling_price)
                        : results.margin_amount_per_meter * 0.9144,
                      'PKR',
                      currentCurrency
                    ),
                    currentCurrency
                  )}
                </span>
              </div>
            </div>

            {/* Total Order Summary */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Total Order Invoice Value:</span>
                <span className="text-base font-extrabold text-white">
                  {currencyService.format(
                    currencyService.convert(results.totalOrderInvoiceValue, 'PKR', currentCurrency),
                    currentCurrency
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Total Expected Gross Profit:</span>
                <span className="font-bold text-emerald-400">
                  {currencyService.format(
                    currencyService.convert(results.totalOrderGrossProfit, 'PKR', currentCurrency),
                    currentCurrency
                  )}
                </span>
              </div>
              {results.tax > 0 && (
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Total Tax ({inputs.taxRatePct}%):</span>
                  <span className="font-semibold text-amber-300">
                    {currencyService.format(
                      currencyService.convert(results.totalOrderTax, 'PKR', currentCurrency),
                      currentCurrency
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Production Specifications Footnote */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <div>Effective Yield: <strong className="text-emerald-400">{results.effectiveYieldPct}%</strong></div>
              <div>Required Grey: <strong className="text-slate-200">{results.requiredGreyInputMeters.toLocaleString()} m</strong></div>
              <div>Theoretical GSM: <strong className="text-slate-200">{results.estimatedGreyGSM} gsm</strong></div>
              <div>Total Yarn: <strong className="text-slate-200">{results.totalYarnBags100lbs.toFixed(0)} Bags</strong></div>
            </div>
          </div>

          {/* Interactive Cost Breakdown Chart */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              <span>Cost Component Breakdown</span>
            </h4>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`₨ ${Number(val).toFixed(2)}/m`, 'Cost']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              {pieData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="truncate">{item.name}: ₨ {item.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Estimate Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Save className="w-4 h-4 text-indigo-400" />
              <span>Save Commercial Quotation</span>
            </h3>

            {saveSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold text-center">
                {saveSuccessMsg}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Quotation Title</label>
                    <input
                      type="text"
                      value={inputs.estimateName}
                      onChange={(e) => setInputs({ ...inputs, estimateName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Customer / Buyer</label>
                    <input
                      type="text"
                      value={inputs.customerName}
                      onChange={(e) => setInputs({ ...inputs, customerName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Internal Notes & Commercial Terms</label>
                    <textarea
                      rows={3}
                      value={saveNotes}
                      onChange={(e) => setSaveNotes(e.target.value)}
                      placeholder="e.g. Valid for 7 days. FOB Karachi port. 18% GST exclusive."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSaveModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEstimate}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    Confirm & Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
