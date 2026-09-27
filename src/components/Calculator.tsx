import React, { useState, useEffect } from 'react';
import { 
  Calculator as CalcIcon, 
  Download, 
  Save, 
  Layers, 
  PieChart as PieIcon, 
  FileCheck, 
  Sliders, 
  Settings2, 
  Truck, 
  Percent, 
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Boxes
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
  DEFAULT_DETAILED_FINISHING
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

const PIE_COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const Calculator: React.FC<CalculatorProps> = ({
  currentCurrency,
  initialPresetId,
  onEstimateSaved,
}) => {
  const rates = marketRateService.getRates();

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPresetId || 'sheeting-20x20');
  const [showDetailedDyeing, setShowDetailedDyeing] = useState<boolean>(false);
  const [showDetailedFinishing, setShowDetailedFinishing] = useState<boolean>(false);
  const [activeTabSection, setActiveTabSection] = useState<'physical' | 'yield' | 'rates' | 'processing' | 'commercial'>('physical');

  const [inputs, setInputs] = useState<FabricCalculationInput>({
    estimateName: 'Standard Commercial Export Quote',
    customerName: 'EuroTex Sourcing BV',
    fabricType: 'Standard Sheeting 20x20 / 60x60 (63")',
    finishedWidthInches: 63,
    finishedLengthMeters: 25000,
    costingMethod: 'engineered',
    directGreyRatePerMeter: 145,
    directGreyRatePerKg: 580,
    directGSM: 150,
    warpCountNe: 20,
    weftCountNe: 20,
    epi: 60,
    ppi: 60,
    warpCrimpPct: 6.0,
    weftCrimpPct: 4.5,
    warpWastePct: 1.0,
    weftWastePct: 1.0,
    warpYarnRate: 2850,
    warpYarnRateUnit: '10lbs',
    weftYarnRate: 2850,
    weftYarnRateUnit: '10lbs',
    weavingCostMethod: 'per_pick',
    weavingRate: 0.48,
    sizingCostPerMeter: 8.50,
    otherGreyManufacturingCostPerMeter: 0,
    weavingLossPct: 2.0,
    wetProcessingLossPct: 3.5,
    finishingLossPct: 1.5,
    processingOperations: DEFAULT_PROCESSING_OPERATIONS,
    detailedDyeing: DEFAULT_DETAILED_DYEING,
    detailedFinishing: DEFAULT_DETAILED_FINISHING,
    printingCostPerMeter: 0,
    auxChemicalCostPerMeter: 2.50,
    transportMethod: 'by_weight',
    transportRatePerKg: 14.00,
    fixedTransportTotal: 0,
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
      fabricType: preset.name,
      estimateName: `${preset.name} Quote`,
      finishedWidthInches: preset.widthInches,
      warpCountNe: preset.warpCount,
      weftCountNe: preset.weftCount,
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
    { name: 'Weaving & Sizing', value: results.weaving_cost + results.sizing_cost },
    { name: 'Direct Grey', value: inputs.costingMethod.startsWith('direct') ? results.grey_fabric_cost : 0 },
    { name: 'Processing', value: results.processing_cost },
    { name: 'Dyeing & Finishing', value: results.dyeing_cost + results.finishing_cost },
    { name: 'Process Wastage', value: results.wastage_cost },
    { name: 'Freight & Overhead', value: results.transport_cost + results.overhead_cost },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CalcIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                <span>FabricIQ Deterministic Costing Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  v2.0 Auditable
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Engineered physical consumption formulas separated cleanly from commercial cost components & yield models.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

      {/* Preset Picker & Costing Mode Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="md:col-span-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">Fabric Preset:</span>
          <select
            value={selectedPresetId}
            onChange={(e) => applyPreset(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            {FABRIC_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Costing Method Selector */}
        <div className="md:col-span-8 flex flex-wrap items-center justify-end gap-2">
          <span className="text-xs font-semibold text-slate-400">Method:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setInputs({ ...inputs, costingMethod: 'engineered' })}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                inputs.costingMethod === 'engineered'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Full Yarn & Weaving Engineering
            </button>
            <button
              onClick={() => setInputs({ ...inputs, costingMethod: 'direct_grey_meter' })}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                inputs.costingMethod === 'direct_grey_meter'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Known Grey Rate/Meter
            </button>
            <button
              onClick={() => setInputs({ ...inputs, costingMethod: 'direct_grey_kg' })}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                inputs.costingMethod === 'direct_grey_kg'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Known Grey Rate/Kg
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Step-by-Step Flow */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
        {[
          { id: 'physical', label: '1. Physical Specifications', icon: Sliders },
          { id: 'yield', label: '2. Yield & Process Losses', icon: Boxes },
          { id: 'rates', label: '3. Yarn & Weaving Rates', icon: Settings2 },
          { id: 'processing', label: '4. Processing & Dyeing', icon: Sparkles },
          { id: 'commercial', label: '5. Logistics, Margin & Tax', icon: Percent },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabSection(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold text-xs transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-indigo-500 bg-slate-900/90 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
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
                <span>Estimate & Customer Header</span>
              </h3>
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
                  <span>Physical Fabric Construction Engine</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Weight/m: <strong className="text-indigo-400">{results.weightPerMeterKg} kg/m</strong>
                </span>
              </div>

              {inputs.costingMethod === 'engineered' ? (
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Finished Target (Meters)
                      </label>
                      <input
                        type="number"
                        value={inputs.finishedLengthMeters}
                        onChange={(e) => setInputs({ ...inputs, finishedLengthMeters: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Warp Count (Ne)
                      </label>
                      <input
                        type="number"
                        value={inputs.warpCountNe}
                        onChange={(e) => setInputs({ ...inputs, warpCountNe: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Weft Count (Ne)
                      </label>
                      <input
                        type="number"
                        value={inputs.weftCountNe}
                        onChange={(e) => setInputs({ ...inputs, weftCountNe: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        EPI (Ends / Inch)
                      </label>
                      <input
                        type="number"
                        value={inputs.epi}
                        onChange={(e) => setInputs({ ...inputs, epi: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Warp Crimp %
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={inputs.warpCrimpPct}
                        onChange={(e) => setInputs({ ...inputs, warpCrimpPct: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Physical Consumption Engine Summary Card */}
                  <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 text-xs">
                    <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      <span>Physical Consumption Output:</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 text-[11px]">
                      <div>Warp Weight: <strong className="text-white">{results.warpWeightPerMeterGrams} g/m</strong></div>
                      <div>Weft Weight: <strong className="text-white">{results.weftWeightPerMeterGrams} g/m</strong></div>
                      <div>Grey GSM: <strong className="text-emerald-400">{results.estimatedGreyGSM} gsm</strong></div>
                      <div>Finished GSM: <strong className="text-emerald-400">~{results.estimatedFinishedGSM} gsm</strong></div>
                    </div>
                  </div>
                </>
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                    Formula: <code className="text-indigo-300">Grey Cost/Meter = Grey Fabric Rate per Meter (₨ {inputs.directGreyRatePerMeter})</code>
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div>Weight/Meter = <code className="text-indigo-300">GSM ({inputs.directGSM}) × Width({(inputs.finishedWidthInches * 0.0254).toFixed(2)}m) ÷ 1000 = {results.weightPerMeterKg} kg</code></div>
                    <div>Grey Cost/Meter = <code className="text-emerald-300">Weight/Meter ({results.weightPerMeterKg} kg) × Rate/kg (₨ {inputs.directGreyRatePerKg}) = ₨ {results.grey_fabric_cost.toFixed(2)}/m</code></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTION YIELD & PROCESS LOSSES */}
          {activeTabSection === 'yield' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Production Yield & Multi-Stage Losses Engine</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-400">
                  Effective Yield: {results.effectiveYieldPct}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Weaving Loss %
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.weavingLossPct}
                    onChange={(e) => setInputs({ ...inputs, weavingLossPct: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Wet Processing Loss %
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.wetProcessingLossPct}
                    onChange={(e) => setInputs({ ...inputs, wetProcessingLossPct: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Finishing Loss %
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.finishingLossPct}
                    onChange={(e) => setInputs({ ...inputs, finishingLossPct: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Yield Formula Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
                <div className="text-xs font-semibold text-indigo-300">
                  Yield & Input Requirement Formula:
                </div>
                <div className="text-xs font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                  Effective Yield = (1 - {inputs.weavingLossPct}%) × (1 - {inputs.wetProcessingLossPct}%) × (1 - {inputs.finishingLossPct}%) = <span className="text-emerald-400 font-bold">{results.effectiveYieldPct}%</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Finished Output:</span>
                    <strong className="text-white">{results.finishedOutputMeters.toLocaleString()} m ({results.finishedOutputKg.toLocaleString()} kg)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Required Grey Input:</span>
                    <strong className="text-amber-300">{results.requiredGreyInputMeters.toLocaleString()} m ({results.requiredGreyInputKg.toLocaleString()} kg)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Yarn (Kg):</span>
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

          {/* TAB 3: YARN & WEAVING RATES */}
          {activeTabSection === 'rates' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Commercial Yarn & Weaving Rates Engine</span>
                </h3>
              </div>

              {inputs.costingMethod === 'engineered' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Warp Yarn */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">
                          Warp Yarn ({inputs.warpCountNe}s Ne)
                        </span>
                        <button
                          onClick={() => applyLiveRate('warp', inputs.warpCountNe)}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline"
                        >
                          Use Live Rate
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={inputs.warpYarnRate}
                          onChange={(e) => setInputs({ ...inputs, warpYarnRate: Number(e.target.value) })}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                        />
                        <select
                          value={inputs.warpYarnRateUnit}
                          onChange={(e) => setInputs({ ...inputs, warpYarnRateUnit: e.target.value as any })}
                          className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
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
                          Weft Yarn ({inputs.weftCountNe}s Ne)
                        </span>
                        <button
                          onClick={() => applyLiveRate('weft', inputs.weftCountNe)}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline"
                        >
                          Use Live Rate
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={inputs.weftYarnRate}
                          onChange={(e) => setInputs({ ...inputs, weftYarnRate: Number(e.target.value) })}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                        />
                        <select
                          value={inputs.weftYarnRateUnit}
                          onChange={(e) => setInputs({ ...inputs, weftYarnRateUnit: e.target.value as any })}
                          className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
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

                  {/* Weaving & Sizing */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Weaving Method
                      </label>
                      <select
                        value={inputs.weavingCostMethod}
                        onChange={(e) => setInputs({ ...inputs, weavingCostMethod: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none"
                      >
                        <option value="per_pick">Per Pick Rate (e.g. ₨ 0.48/pick)</option>
                        <option value="per_meter">Per Meter Rate (e.g. ₨ 35/m)</option>
                        <option value="per_kg">Per Kg Rate (e.g. ₨ 110/kg)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Weaving Rate (₨)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={inputs.weavingRate}
                        onChange={(e) => setInputs({ ...inputs, weavingRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Sizing Cost / Meter (₨)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={inputs.sizingCostPerMeter}
                        onChange={(e) => setInputs({ ...inputs, sizingCostPerMeter: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Grey Fabric Manufacturing Cost:</span>
                    <span className="text-sm font-extrabold text-white">₨ {results.grey_fabric_cost.toFixed(2)} / meter</span>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  Direct Grey Cost Mode is active ({inputs.costingMethod === 'direct_grey_meter' ? 'Per Meter' : 'Per Kg'}). To adjust individual yarn and weaving rates, switch to Method 1 above.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROCESSING, DYEING & FINISHING */}
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
                <span className="text-xs font-semibold text-slate-300 block">
                  Select and configure individual processing stages:
                </span>
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
                          className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
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
                          className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-right text-slate-200 focus:outline-none font-mono"
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
                    <span>Detailed Dyeing Cost Breakdown (Machine, Dyes, Steam, Chemicals, Labor)</span>
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

              {/* Detailed Finishing Breakdown Drawer */}
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
                <div
                  onClick={() => setShowDetailedFinishing(!showDetailedFinishing)}
                  className="cursor-pointer flex items-center justify-between text-xs font-bold text-indigo-300"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inputs.detailedFinishing?.enabled || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        setInputs({
                          ...inputs,
                          detailedFinishing: { ...inputs.detailedFinishing, enabled: !inputs.detailedFinishing?.enabled },
                        });
                      }}
                      className="w-3.5 h-3.5"
                    />
                    <span>Detailed Finishing Breakdown (Chemicals, Machine, Energy, Labor)</span>
                  </div>
                  {showDetailedFinishing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>

                {showDetailedFinishing && inputs.detailedFinishing?.enabled && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Machine Cost</label>
                      <input
                        type="number"
                        value={inputs.detailedFinishing.machineCostPerMeter}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            detailedFinishing: { ...inputs.detailedFinishing, machineCostPerMeter: Number(e.target.value) },
                          })
                        }
                        className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Chemical Cost</label>
                      <input
                        type="number"
                        value={inputs.detailedFinishing.chemicalCostPerMeter}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            detailedFinishing: { ...inputs.detailedFinishing, chemicalCostPerMeter: Number(e.target.value) },
                          })
                        }
                        className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Energy Cost</label>
                      <input
                        type="number"
                        value={inputs.detailedFinishing.energyCostPerMeter}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            detailedFinishing: { ...inputs.detailedFinishing, energyCostPerMeter: Number(e.target.value) },
                          })
                        }
                        className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Labor Cost</label>
                      <input
                        type="number"
                        value={inputs.detailedFinishing.laborCostPerMeter}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            detailedFinishing: { ...inputs.detailedFinishing, laborCostPerMeter: Number(e.target.value) },
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

          {/* TAB 5: LOGISTICS, OVERHEAD, MARGIN & TAX */}
          {activeTabSection === 'commercial' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold">5</span>
                  <span>Commercial Logistics, Margin & Tax Engine</span>
                </h3>
              </div>

              {/* Transport & Overhead */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Transport Freight</span>
                    </span>
                    <select
                      value={inputs.transportMethod}
                      onChange={(e) => setInputs({ ...inputs, transportMethod: e.target.value as any })}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                    >
                      <option value="by_weight">By Weight (Rate/Kg)</option>
                      <option value="fixed_per_meter">Fixed Total (₨)</option>
                    </select>
                  </div>
                  {inputs.transportMethod === 'by_weight' ? (
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Rate per Kg (₨)</label>
                      <input
                        type="number"
                        value={inputs.transportRatePerKg}
                        onChange={(e) => setInputs({ ...inputs, transportRatePerKg: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Total Fixed Transport (₨)</label>
                      <input
                        type="number"
                        value={inputs.fixedTransportTotal}
                        onChange={(e) => setInputs({ ...inputs, fixedTransportTotal: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400">
                    Transport Cost: <strong className="text-slate-200">₨ {results.transport_cost.toFixed(2)}/m</strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Overhead Allocation</span>
                    <select
                      value={inputs.overheadMethod}
                      onChange={(e) => setInputs({ ...inputs, overheadMethod: e.target.value as any })}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                    >
                      <option value="percentage">% of Direct Cost</option>
                      <option value="fixed_total">Fixed Total (₨)</option>
                    </select>
                  </div>
                  {inputs.overheadMethod === 'percentage' ? (
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Overhead Percentage %</label>
                      <input
                        type="number"
                        step="0.5"
                        value={inputs.overheadPct}
                        onChange={(e) => setInputs({ ...inputs, overheadPct: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Total Fixed Overhead (₨)</label>
                      <input
                        type="number"
                        value={inputs.fixedOverheadTotal}
                        onChange={(e) => setInputs({ ...inputs, fixedOverheadTotal: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                      />
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400">
                    Overhead Cost: <strong className="text-slate-200">₨ {results.overhead_cost.toFixed(2)}/m</strong>
                  </div>
                </div>
              </div>

              {/* CRITICAL FEATURE: MARKUP VS MARGIN STRATEGY */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Commercial Pricing Strategy:
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      MARKUP vs MARGIN
                    </span>
                  </div>
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
