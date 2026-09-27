import type { 
  FabricCalculationInput, 
  FabricIQCalculationResult, 
  FabricPreset, 
  ProcessingOperation, 
  DetailedDyeingBreakdown, 
  DetailedFinishingBreakdown,
  ColorWisePrintingConfig,
  PackagingConfig,
  LogisticsConfig,
  ProcessYieldStageLosses,
  FormulaAuditStep,
  YarnCountSystem
} from '../types';
import { YarnCountEngine } from './yarnCountEngine';

export const INCH_TO_METER = 0.0254;
export const METER_TO_INCH = 39.3701;
export const LB_TO_KG = 0.45359237;
export const KG_TO_LB = 2.20462;
export const LB_TO_GRAMS = 453.59237;
export const YARD_TO_METER = 0.9144;

export const DEFAULT_PROCESSING_OPERATIONS: ProcessingOperation[] = [
  { id: 'proc-desizing', name: 'Enzymatic Desizing', enabled: true, costPerMeter: 3.50, category: 'pre_treatment' },
  { id: 'proc-scouring', name: 'Alkaline Scouring', enabled: true, costPerMeter: 4.00, category: 'pre_treatment' },
  { id: 'proc-bleaching', name: 'Peroxide Continuous Bleaching (CBR)', enabled: true, costPerMeter: 8.50, category: 'pre_treatment' },
  { id: 'proc-mercerizing', name: 'Caustic Mercerizing (Luster & Strength)', enabled: false, costPerMeter: 9.00, category: 'pre_treatment' },
  { id: 'proc-dyeing', name: 'Continuous Reactive / Vat Dyeing', enabled: false, costPerMeter: 42.00, category: 'dyeing' },
  { id: 'proc-washing', name: 'Continuous Soaping & Rinsing', enabled: true, costPerMeter: 3.50, category: 'washing' },
  { id: 'proc-stentering', name: 'Stenter Heat-Setting & Drying', enabled: true, costPerMeter: 4.50, category: 'mechanical' },
  { id: 'proc-compacting', name: 'Sanforizing / Zero-Shrinkage Compacting', enabled: true, costPerMeter: 4.00, category: 'mechanical' },
  { id: 'proc-finishing', name: 'Softener / Hydrophilic Chemical Finish', enabled: true, costPerMeter: 3.50, category: 'finishing' },
];

export const DEFAULT_DETAILED_DYEING: DetailedDyeingBreakdown = {
  enabled: false,
  machineChargePerMeter: 12.00,
  dyeCostPerMeter: 18.50,
  chemicalCostPerMeter: 6.00,
  waterCostPerMeter: 2.00,
  steamEnergyCostPerMeter: 4.50,
  laborCostPerMeter: 3.00,
  overheadCostPerMeter: 2.00,
};

export const DEFAULT_DETAILED_FINISHING: DetailedFinishingBreakdown = {
  enabled: false,
  machineCostPerMeter: 4.00,
  chemicalCostPerMeter: 6.50,
  energyCostPerMeter: 2.50,
  laborCostPerMeter: 1.50,
  overheadCostPerMeter: 1.00,
};

export const DEFAULT_COLOR_PRINTING: ColorWisePrintingConfig = {
  enabled: false,
  method: 'rotary_screen',
  colors: [
    { id: 'c1', colorName: 'Primary Cyan', hexCode: '#00D2FF', consumptionGramsPerMeter: 4.5, inkRatePerKg: 1200, costPerMeter: 5.40 },
    { id: 'c2', colorName: 'Rich Navy', hexCode: '#1E3A8A', consumptionGramsPerMeter: 5.0, inkRatePerKg: 1400, costPerMeter: 7.00 },
    { id: 'c3', colorName: 'Accent Gold', hexCode: '#F59E0B', consumptionGramsPerMeter: 3.0, inkRatePerKg: 1800, costPerMeter: 5.40 },
  ],
  screenCount: 3,
  screenCostPerScreen: 4500,
  setupCostFixed: 6000,
  machinePrintingRatePerMeter: 12.00,
  chemicalCostPerMeter: 3.50,
  dryingCuringCostPerMeter: 4.00,
  printingWastePct: 3.0,
  minimumBatchCharge: 25000,
};

export const DEFAULT_PACKAGING: PackagingConfig = {
  enabled: true,
  cartonCostPerRoll: 120,
  polybagCostPerRoll: 45,
  rollTubesCost: 60,
  labelsAndTagsCostPerRoll: 15,
  palletAndStrappingCost: 0,
  packagingLaborPerMeter: 0.85,
  metersPerRoll: 100,
};

export const DEFAULT_LOGISTICS: LogisticsConfig = {
  enabled: true,
  method: 'by_weight',
  distanceKm: 250,
  ratePerKm: 45,
  freightRatePerKg: 14.0,
  containerRateFixed: 85000,
  loadingUnloadingCost: 1500,
  transitInsurancePct: 0.5,
  portAndCustomsCharges: 0,
};

export const DEFAULT_YIELD_STAGES: ProcessYieldStageLosses = {
  warpingLossPct: 0.5,
  sizingLossPct: 0.5,
  weavingLossPct: 2.0,
  greyInspectionLossPct: 0.5,
  desizingLossPct: 1.0,
  scouringBleachingLossPct: 1.5,
  mercerizingLossPct: 0.5,
  dyeingLossPct: 1.5,
  printingLossPct: 1.0,
  finishingLossPct: 1.0,
  compactingLossPct: 0.5,
  finalInspectionLossPct: 0.5,
};

export const FABRIC_PRESETS: FabricPreset[] = [
  {
    id: 'sheeting-20x20',
    name: 'Standard Sheeting 20x20 / 60x60 (63")',
    description: 'Popular cotton plain weave for bedsheets, pocketing and base grey cloth',
    category: 'Sheeting',
    widthInches: 63,
    warpCount: 20,
    weftCount: 20,
    warpType: 'Cotton',
    weftType: 'Cotton',
    epi: 60,
    ppi: 60,
    warpCrimpPct: 6.0,
    weftCrimpPct: 4.5,
    defaultProcessing: 'Continuous Bleached & Optical White',
  },
  {
    id: 'twill-16x12',
    name: 'Heavy Apparel Twill 16x12 / 108x56 (3/1) 63"',
    description: 'Heavy duty drill/twill fabric used for workwear, uniform pants, and jackets',
    category: 'Apparel Twill',
    widthInches: 63,
    warpCount: 16,
    weftCount: 12,
    warpType: 'Cotton',
    weftType: 'Cotton',
    epi: 108,
    ppi: 56,
    warpCrimpPct: 7.5,
    weftCrimpPct: 5.0,
    defaultProcessing: 'Reactive Continuous Dyed',
  },
  {
    id: 'poplin-40x40',
    name: 'Fine Poplin 40x40 / 133x72 (Shirting) 58"',
    description: 'High-density luxury shirting fabric with crisp handfeel and smooth finish',
    category: 'Poplin / Shirting',
    widthInches: 58,
    warpCount: 40,
    weftCount: 40,
    warpType: 'Cotton',
    weftType: 'Cotton',
    epi: 133,
    ppi: 72,
    warpCrimpPct: 5.5,
    weftCrimpPct: 3.5,
    defaultProcessing: 'Reactive Continuous Dyed',
  },
  {
    id: 'duck-canvas-10x10',
    name: 'Heavy Duck Canvas 10x10 / 48x36 (60")',
    description: 'Coarse durable canvas for industrial bags, tents, upholstery, and tote bags',
    category: 'Duck / Canvas',
    widthInches: 60,
    warpCount: 10,
    weftCount: 10,
    warpType: 'Cotton',
    weftType: 'Cotton',
    epi: 48,
    ppi: 36,
    warpCrimpPct: 8.5,
    weftCrimpPct: 6.0,
    defaultProcessing: 'Dyeing & Water Repellent Finish',
  },
  {
    id: 'satin-stripe-40x40',
    name: 'Hospitality Satin Stripe 40x40 / 140x90 (110")',
    description: 'Wide-width 1cm/2cm satin stripe fabric engineered for 5-star hotel bed linen',
    category: 'Satin / Home',
    widthInches: 110,
    warpCount: 40,
    weftCount: 40,
    warpType: 'Cotton',
    weftType: 'Cotton',
    epi: 140,
    ppi: 90,
    warpCrimpPct: 6.5,
    weftCrimpPct: 4.0,
    defaultProcessing: 'Bleached, Mercerized & Soft Finish',
  },
];

export function calculateFabricIQCost(inputs: FabricCalculationInput): FabricIQCalculationResult {
  const auditSteps: FormulaAuditStep[] = [];
  const assumptionsList: string[] = [];
  const missingInputsList: string[] = [];

  // --------------------------------------------------------------------------
  // 1. UNIT NORMALIZATION & PHYSICAL INPUTS
  // --------------------------------------------------------------------------
  const structure = inputs.fabricStructure || 'woven';
  const costingMethod = inputs.costingMethod || 'engineered';
  const safeFinishedMeters = Math.max(1, inputs.finishedLengthMeters || 10000);
  const safeWidthInches = Math.max(1, inputs.finishedWidthInches || 63);
  const widthInMeters = safeWidthInches * INCH_TO_METER;

  // Normalize Warp & Weft Yarn Count to Ne
  const warpCountSystem = inputs.warpCountSystem || 'Ne';
  const weftCountSystem = inputs.weftCountSystem || 'Ne';
  const rawWarpCount = inputs.warpCountNe || 20;
  const rawWeftCount = inputs.weftCountNe || 20;

  const warpCountNe = YarnCountEngine.toNe(rawWarpCount, warpCountSystem);
  const weftCountNe = YarnCountEngine.toNe(rawWeftCount, weftCountSystem);
  const warpTex = YarnCountEngine.toTex(rawWarpCount, warpCountSystem);
  const weftTex = YarnCountEngine.toTex(rawWeftCount, weftCountSystem);

  auditSteps.push({
    stepNumber: 1,
    category: 'Unit Normalization',
    name: 'Width & Yarn Count Normalization',
    formulaString: 'Width(m) = Width(in) × 0.0254 | Ne = Normalized Count System',
    inputsUsed: `Width: ${safeWidthInches}", Warp: ${rawWarpCount}${warpCountSystem}, Weft: ${rawWeftCount}${weftCountSystem}`,
    intermediateResult: `Width: ${widthInMeters.toFixed(4)} m | Warp: ${warpCountNe.toFixed(2)} Ne (${warpTex.toFixed(1)} Tex), Weft: ${weftCountNe.toFixed(2)} Ne (${weftTex.toFixed(1)} Tex)`,
    finalValue: widthInMeters,
    unit: 'meters',
    isVerified: true,
  });

  // --------------------------------------------------------------------------
  // 2. PHYSICAL CONSUMPTION ENGINE (Woven vs Knitted vs Direct)
  // --------------------------------------------------------------------------
  let warpWeightPerMeterGrams = 0;
  let weftWeightPerMeterGrams = 0;
  let totalGreyWeightPerMeterGrams = 0;
  let weightPerMeterKg = 0;
  let estimatedGreyGSM = 0;
  let estimatedFinishedGSM = 0;

  if (costingMethod === 'direct_grey_kg' || costingMethod === 'direct_grey_meter') {
    estimatedGreyGSM = inputs.directGSM || 150;
    if (!inputs.directGSM) {
      assumptionsList.push('Direct GSM defaulted to 150 g/m²');
    }
    estimatedFinishedGSM = estimatedGreyGSM * 1.04;
    weightPerMeterKg = (estimatedGreyGSM * widthInMeters) / 1000;
    totalGreyWeightPerMeterGrams = weightPerMeterKg * 1000;
    warpWeightPerMeterGrams = totalGreyWeightPerMeterGrams * 0.55;
    weftWeightPerMeterGrams = totalGreyWeightPerMeterGrams * 0.45;

    auditSteps.push({
      stepNumber: 2,
      category: 'Physical Consumption',
      name: 'Direct Fabric Weight Calculation',
      formulaString: 'Weight/m (kg) = (GSM × Width(m)) / 1000',
      inputsUsed: `GSM: ${estimatedGreyGSM}, Width: ${widthInMeters.toFixed(3)} m`,
      intermediateResult: `${estimatedGreyGSM} × ${widthInMeters.toFixed(3)} ÷ 1000 = ${weightPerMeterKg.toFixed(4)} kg/m`,
      finalValue: weightPerMeterKg,
      unit: 'kg/m',
      isVerified: true,
    });
  } else if (structure === 'knitted') {
    // Knitted Fabric Physical Consumption Engine
    const stitchLengthMm = inputs.knittingStitchLengthMm || 2.8;
    const cpc = inputs.knittingCoursesPerCm || 14;
    const wpc = inputs.knittingWalesPerCm || 11;
    const knittingWaste = (inputs.knittingWastePct || 2.0) / 100;

    // Knitted GSM = (CPC * WPC * StitchLength(mm) * Tex) / 10000 * (1 + Waste)
    estimatedGreyGSM = ((cpc * wpc * stitchLengthMm * warpTex) / 10000) * (1 + knittingWaste);
    estimatedFinishedGSM = estimatedGreyGSM * 1.05;
    totalGreyWeightPerMeterGrams = (estimatedGreyGSM * widthInMeters);
    weightPerMeterKg = totalGreyWeightPerMeterGrams / 1000;
    warpWeightPerMeterGrams = totalGreyWeightPerMeterGrams;
    weftWeightPerMeterGrams = 0;

    auditSteps.push({
      stepNumber: 2,
      category: 'Physical Consumption (Knitted)',
      name: 'Knitted Loop Consumption & GSM',
      formulaString: 'GSM = (CPC × WPC × StitchLength(mm) × Tex ÷ 10000) × (1 + Waste%)',
      inputsUsed: `CPC: ${cpc}, WPC: ${wpc}, Stitch: ${stitchLengthMm}mm, Tex: ${warpTex.toFixed(1)}, Waste: ${(knittingWaste * 100)}%`,
      intermediateResult: `(${cpc} × ${wpc} × ${stitchLengthMm} × ${warpTex.toFixed(1)} ÷ 10000) × 1.02 = ${estimatedGreyGSM.toFixed(1)} g/m²`,
      finalValue: estimatedGreyGSM,
      unit: 'g/m²',
      isVerified: true,
    });
  } else {
    // Engineered Woven Fabric Physical Consumption Engine
    const safeEpi = Math.max(1, inputs.epi || 60);
    const safePpi = Math.max(1, inputs.ppi || 60);
    const warpCrimp = (inputs.warpCrimpPct || 6.0) / 100;
    const weftCrimp = (inputs.weftCrimpPct || 4.5) / 100;
    const warpWaste = (inputs.warpWastePct || 1.0) / 100;
    const weftWaste = (inputs.weftWastePct || 1.0) / 100;

    // Standard Textile Engineering Formula:
    // Base Warp lbs/yd = (EPI × Width(in)) / (840 × WarpCountNe)
    // Base Weft lbs/yd = (PPI × Width(in)) / (840 × WeftCountNe)
    const baseWarpLbsPerYard = (safeEpi * safeWidthInches) / (840 * warpCountNe);
    const baseWeftLbsPerYard = (safePpi * safeWidthInches) / (840 * weftCountNe);

    const warpLbsPerYard = baseWarpLbsPerYard * (1 + warpCrimp) * (1 + warpWaste);
    const weftLbsPerYard = baseWeftLbsPerYard * (1 + weftCrimp) * (1 + weftWaste);

    warpWeightPerMeterGrams = (warpLbsPerYard / YARD_TO_METER) * LB_TO_GRAMS;
    weftWeightPerMeterGrams = (weftLbsPerYard / YARD_TO_METER) * LB_TO_GRAMS;
    totalGreyWeightPerMeterGrams = warpWeightPerMeterGrams + weftWeightPerMeterGrams;
    weightPerMeterKg = totalGreyWeightPerMeterGrams / 1000;

    estimatedGreyGSM = totalGreyWeightPerMeterGrams / widthInMeters;
    estimatedFinishedGSM = estimatedGreyGSM * 1.04;

    auditSteps.push({
      stepNumber: 2,
      category: 'Physical Consumption (Woven)',
      name: 'Warp & Weft Yarn Linear Density',
      formulaString: 'Warp(g/m) = [(EPI × Width) ÷ (840 × Ne)] × (1+Crimp) × (1+Waste) ÷ 0.9144 × 453.59',
      inputsUsed: `EPI: ${safeEpi}, PPI: ${safePpi}, Width: ${safeWidthInches}", Warp: ${warpCountNe.toFixed(1)}Ne, Weft: ${weftCountNe.toFixed(1)}Ne`,
      intermediateResult: `Warp: ${warpWeightPerMeterGrams.toFixed(2)} g/m + Weft: ${weftWeightPerMeterGrams.toFixed(2)} g/m = Total ${totalGreyWeightPerMeterGrams.toFixed(2)} g/m`,
      finalValue: estimatedGreyGSM,
      unit: 'g/m²',
      isVerified: true,
    });
  }

  // --------------------------------------------------------------------------
  // 3. YIELD & MULTI-STAGE PROCESS LOSS ENGINE
  // --------------------------------------------------------------------------
  const stages = inputs.yieldLossStages || DEFAULT_YIELD_STAGES;
  
  // Compound Loss Formula: Effective Yield = Product of (1 - Loss_i)
  const lossWarping = (stages.warpingLossPct || 0.5) / 100;
  const lossSizing = (stages.sizingLossPct || 0.5) / 100;
  const lossWeaving = (inputs.weavingLossPct ?? stages.weavingLossPct ?? 2.0) / 100;
  const lossGreyInsp = (stages.greyInspectionLossPct || 0.5) / 100;
  const lossDesizing = (stages.desizingLossPct || 1.0) / 100;
  const lossScourBleach = (stages.scouringBleachingLossPct || 1.5) / 100;
  const lossDyeing = (stages.dyeingLossPct || (inputs.wetProcessingLossPct ? inputs.wetProcessingLossPct / 2 : 1.5)) / 100;
  const lossPrinting = (inputs.colorPrinting?.enabled ? (inputs.colorPrinting.printingWastePct || 3.0) / 100 : 0);
  const lossFinishing = (inputs.finishingLossPct ?? stages.finishingLossPct ?? 1.0) / 100;
  const lossCompacting = (stages.compactingLossPct || 0.5) / 100;
  const lossFinalInsp = (stages.finalInspectionLossPct || 0.5) / 100;

  const effectiveYield = Math.max(
    0.1,
    (1 - lossWarping) *
    (1 - lossSizing) *
    (1 - lossWeaving) *
    (1 - lossGreyInsp) *
    (1 - lossDesizing) *
    (1 - lossScourBleach) *
    (1 - lossDyeing) *
    (1 - lossPrinting) *
    (1 - lossFinishing) *
    (1 - lossCompacting) *
    (1 - lossFinalInsp)
  );

  const effectiveYieldPct = Number((effectiveYield * 100).toFixed(2));
  const totalProcessLossPct = Number(((1 - effectiveYield) * 100).toFixed(2));

  // Required Quantities
  const finishedOutputMeters = safeFinishedMeters;
  const finishedOutputKg = finishedOutputMeters * weightPerMeterKg;
  const requiredGreyInputKg = finishedOutputKg / effectiveYield;
  const wetAndFinishingLoss = lossDesizing + lossScourBleach + lossDyeing + lossPrinting + lossFinishing + lossCompacting + lossFinalInsp;
  const requiredGreyInputMeters = finishedOutputMeters / Math.max(0.2, (1 - wetAndFinishingLoss));

  // Total Yarn Requirements
  const totalWarpWeightKg = (warpWeightPerMeterGrams * requiredGreyInputMeters) / 1000;
  const totalWeftWeightKg = (weftWeightPerMeterGrams * requiredGreyInputMeters) / 1000;
  const totalYarnWeightKg = totalWarpWeightKg + totalWeftWeightKg;
  const totalYarnBags100lbs = totalYarnWeightKg / (100 * LB_TO_KG);
  const totalYarnBags10lbs = totalYarnWeightKg / (10 * LB_TO_KG);

  auditSteps.push({
    stepNumber: 3,
    category: 'Yield & Loss Engine',
    name: 'Multi-Stage Cumulative Process Yield',
    formulaString: 'Effective Yield = ∏(1 - Loss_i) | Required Input = Output ÷ Effective Yield',
    inputsUsed: `11 Compound Stages: Weaving ${lossWeaving*100}%, Wet Proc ${(lossDyeing+lossScourBleach)*100}%, Finishing ${lossFinishing*100}%`,
    intermediateResult: `Effective Yield: ${effectiveYieldPct}% | Total Loss: ${totalProcessLossPct}% | Required Input: ${requiredGreyInputKg.toFixed(1)} kg`,
    finalValue: effectiveYieldPct,
    unit: '%',
    isVerified: true,
  });

  // --------------------------------------------------------------------------
  // 4. YARN & WEAVING RATE ENGINE
  // --------------------------------------------------------------------------
  const normalizeYarnRateToPerKg = (rate: number, unit: 'kg' | 'lb' | '10lbs'): number => {
    if (unit === 'kg') return rate;
    if (unit === 'lb') return rate / LB_TO_KG;
    if (unit === '10lbs') return (rate / 10) / LB_TO_KG;
    return rate;
  };

  const warpRatePerKg = normalizeYarnRateToPerKg(inputs.warpYarnRate || 0, inputs.warpYarnRateUnit || '10lbs');
  const weftRatePerKg = normalizeYarnRateToPerKg(inputs.weftYarnRate || 0, inputs.weftYarnRateUnit || '10lbs');

  const greyToFinishedMeterMultiplier = requiredGreyInputMeters / finishedOutputMeters;
  let warp_yarn_cost = (warpWeightPerMeterGrams / 1000) * warpRatePerKg * greyToFinishedMeterMultiplier;
  let weft_yarn_cost = (weftWeightPerMeterGrams / 1000) * weftRatePerKg * greyToFinishedMeterMultiplier;
  let yarn_cost = warp_yarn_cost + weft_yarn_cost;

  // Weaving Cost
  let weaving_cost = 0;
  if (inputs.weavingCostMethod === 'per_meter') {
    weaving_cost = (inputs.weavingRate || 0) * greyToFinishedMeterMultiplier;
  } else if (inputs.weavingCostMethod === 'per_kg') {
    weaving_cost = weightPerMeterKg * (inputs.weavingRate || 0) * greyToFinishedMeterMultiplier;
  } else if (inputs.weavingCostMethod === 'machine_economics' && inputs.loomRpmSpeed && inputs.loomHourlyCost) {
    // Machine Economics Formula:
    // Production Speed (meters/hr) = (Loom RPM × 60) ÷ (PPI × 39.37) × Efficiency
    const rpm = inputs.loomRpmSpeed || 750;
    const efficiency = (inputs.loomEfficiencyPct || 90) / 100;
    const hourlyCost = inputs.loomHourlyCost || 650;
    const ppi = inputs.ppi || 60;
    const productionMetersPerHour = ((rpm * 60) / (ppi * METER_TO_INCH)) * efficiency;
    weaving_cost = (hourlyCost / Math.max(1, productionMetersPerHour)) * greyToFinishedMeterMultiplier;
  } else {
    // Per pick rate: (PPI * pick_rate)
    weaving_cost = (inputs.ppi || 60) * (inputs.weavingRate || 0.48) * greyToFinishedMeterMultiplier;
  }

  const sizing_cost = (inputs.sizingCostPerMeter || 0) * greyToFinishedMeterMultiplier;
  const grey_inspection_cost = (inputs.greyInspectionCostPerMeter || 1.20) * greyToFinishedMeterMultiplier;
  const other_manufacturing_cost = (inputs.otherGreyManufacturingCostPerMeter || 0) * greyToFinishedMeterMultiplier;

  // Grey Fabric Cost
  let grey_fabric_cost = 0;
  if (costingMethod === 'direct_grey_meter') {
    grey_fabric_cost = (inputs.directGreyRatePerMeter || 0) * greyToFinishedMeterMultiplier;
    yarn_cost = 0;
    warp_yarn_cost = 0;
    weft_yarn_cost = 0;
    weaving_cost = 0;
  } else if (costingMethod === 'direct_grey_kg') {
    grey_fabric_cost = weightPerMeterKg * (inputs.directGreyRatePerKg || 0) * greyToFinishedMeterMultiplier;
    yarn_cost = 0;
    warp_yarn_cost = 0;
    weft_yarn_cost = 0;
    weaving_cost = 0;
  } else {
    grey_fabric_cost = yarn_cost + weaving_cost + sizing_cost + grey_inspection_cost + other_manufacturing_cost;
  }

  auditSteps.push({
    stepNumber: 4,
    category: 'Grey Manufacturing',
    name: 'Total Grey Fabric Cost',
    formulaString: 'Grey Cost = Yarn Cost + Sizing + Weaving + Inspection + Prep',
    inputsUsed: `Yarn: ${yarn_cost.toFixed(2)}/m, Weaving: ${weaving_cost.toFixed(2)}/m, Sizing: ${sizing_cost.toFixed(2)}/m`,
    intermediateResult: `${yarn_cost.toFixed(2)} + ${weaving_cost.toFixed(2)} + ${sizing_cost.toFixed(2)} + ${grey_inspection_cost.toFixed(2)} = ${grey_fabric_cost.toFixed(2)}/m`,
    finalValue: grey_fabric_cost,
    unit: 'PKR/m',
    isVerified: true,
  });

  // --------------------------------------------------------------------------
  // 5. PROCESSING & DYEING COST ENGINE
  // --------------------------------------------------------------------------
  let processing_cost = 0;
  const activeOps = inputs.processingOperations || DEFAULT_PROCESSING_OPERATIONS;
  activeOps.forEach((op) => {
    if (op.enabled && op.category !== 'dyeing') {
      processing_cost += op.costPerMeter || 0;
    }
  });

  let dyeing_cost = 0;
  let energy_cost = 0;
  let labor_cost = 0;
  let chemical_cost = inputs.auxChemicalCostPerMeter || 0;

  if (inputs.detailedDyeing && inputs.detailedDyeing.enabled) {
    const rawDyeing =
      (inputs.detailedDyeing.machineChargePerMeter || 0) +
      (inputs.detailedDyeing.dyeCostPerMeter || 0) +
      (inputs.detailedDyeing.chemicalCostPerMeter || 0) +
      (inputs.detailedDyeing.waterCostPerMeter || 0) +
      (inputs.detailedDyeing.steamEnergyCostPerMeter || 0) +
      (inputs.detailedDyeing.laborCostPerMeter || 0) +
      (inputs.detailedDyeing.overheadCostPerMeter || 0);

    const minBatch = inputs.minimumDyeingBatchCharge || 0;
    const batchCalculatedTotal = rawDyeing * safeFinishedMeters;
    const applicableDyeingTotal = Math.max(batchCalculatedTotal, minBatch);
    dyeing_cost = applicableDyeingTotal / safeFinishedMeters;

    energy_cost += inputs.detailedDyeing.steamEnergyCostPerMeter || 0;
    labor_cost += inputs.detailedDyeing.laborCostPerMeter || 0;
    chemical_cost += (inputs.detailedDyeing.dyeCostPerMeter || 0) + (inputs.detailedDyeing.chemicalCostPerMeter || 0);
  } else {
    const dyeingOp = activeOps.find((op) => op.category === 'dyeing');
    if (dyeingOp && dyeingOp.enabled) {
      dyeing_cost = dyeingOp.costPerMeter || 0;
    }
  }

  // --------------------------------------------------------------------------
  // 6. COLOR-WISE PRINTING ENGINE
  // --------------------------------------------------------------------------
  let printing_cost = inputs.printingCostPerMeter || 0;
  let color_ink_cost = 0;
  let screen_cost_per_meter = 0;

  if (inputs.colorPrinting && inputs.colorPrinting.enabled) {
    const prCfg = inputs.colorPrinting;
    
    // Sum of individual color costs: Σ (Consumption in kg × Rate/kg)
    prCfg.colors.forEach((col) => {
      const colCostPerMeter = (col.consumptionGramsPerMeter / 1000) * col.inkRatePerKg;
      col.costPerMeter = Number(colCostPerMeter.toFixed(3));
      color_ink_cost += colCostPerMeter;
    });

    // Screen cost amortized over order: (Screen Count × Screen Cost) / Order Quantity
    screen_cost_per_meter = (prCfg.screenCount * prCfg.screenCostPerScreen) / safeFinishedMeters;
    const setup_cost_per_meter = (prCfg.setupCostFixed || 0) / safeFinishedMeters;

    const basePrintCost =
      color_ink_cost +
      screen_cost_per_meter +
      setup_cost_per_meter +
      (prCfg.machinePrintingRatePerMeter || 0) +
      (prCfg.chemicalCostPerMeter || 0) +
      (prCfg.dryingCuringCostPerMeter || 0);

    const minBatchPrint = prCfg.minimumBatchCharge || 0;
    const totalBatchPrint = basePrintCost * safeFinishedMeters;
    printing_cost = Math.max(totalBatchPrint, minBatchPrint) / safeFinishedMeters;

    chemical_cost += prCfg.chemicalCostPerMeter || 0;
    energy_cost += prCfg.dryingCuringCostPerMeter || 0;

    auditSteps.push({
      stepNumber: 5,
      category: 'Printing Engine',
      name: 'Color-Wise Printing Cost Breakdown',
      formulaString: 'Printing Cost = Σ(Color Inks) + (Screens ÷ Qty) + Machine + Chemicals + Curing',
      inputsUsed: `${prCfg.colors.length} Colors: Inks ${color_ink_cost.toFixed(2)}/m, ${prCfg.screenCount} Screens (${screen_cost_per_meter.toFixed(2)}/m)`,
      intermediateResult: `Inks: ${color_ink_cost.toFixed(2)} + Screens: ${screen_cost_per_meter.toFixed(2)} + Machine: ${(prCfg.machinePrintingRatePerMeter||0).toFixed(2)} = ${printing_cost.toFixed(2)}/m`,
      finalValue: printing_cost,
      unit: 'PKR/m',
      isVerified: true,
    });
  }

  // --------------------------------------------------------------------------
  // 7. FINISHING COST ENGINE
  // --------------------------------------------------------------------------
  let finishing_cost = 0;
  if (inputs.detailedFinishing && inputs.detailedFinishing.enabled) {
    finishing_cost =
      (inputs.detailedFinishing.machineCostPerMeter || 0) +
      (inputs.detailedFinishing.chemicalCostPerMeter || 0) +
      (inputs.detailedFinishing.energyCostPerMeter || 0) +
      (inputs.detailedFinishing.laborCostPerMeter || 0) +
      (inputs.detailedFinishing.overheadCostPerMeter || 0);

    energy_cost += inputs.detailedFinishing.energyCostPerMeter || 0;
    labor_cost += inputs.detailedFinishing.laborCostPerMeter || 0;
    chemical_cost += inputs.detailedFinishing.chemicalCostPerMeter || 0;
  }

  let packaging_cost = 0;
  if (inputs.packaging && inputs.packaging.enabled) {
    const pkg = inputs.packaging;
    const mPerRoll = Math.max(1, pkg.metersPerRoll || 100);
    const costPerRoll =
      (pkg.cartonCostPerRoll || 0) +
      (pkg.polybagCostPerRoll || 0) +
      (pkg.rollTubesCost || 0) +
      (pkg.labelsAndTagsCostPerRoll || 0) +
      (pkg.palletAndStrappingCost || 0);

    packaging_cost = (costPerRoll / mPerRoll) + (pkg.packagingLaborPerMeter || 0);
  }

  let transport_cost = 0;
  let insurance_customs_cost = 0;
  if (inputs.logistics && inputs.logistics.enabled) {
    const log = inputs.logistics;
    if (log.method === 'by_distance_km') {
      transport_cost = ((log.distanceKm * log.ratePerKm) + (log.loadingUnloadingCost || 0)) / safeFinishedMeters;
    } else if (log.method === 'fixed_container') {
      transport_cost = ((log.containerRateFixed || 0) + (log.loadingUnloadingCost || 0)) / safeFinishedMeters;
    } else {
      // By weight: Freight/kg * Weight/m
      transport_cost = (weightPerMeterKg * (log.freightRatePerKg || inputs.transportRatePerKg || 14.0)) + ((log.loadingUnloadingCost || 0) / safeFinishedMeters);
    }
  } else {
    if (inputs.transportMethod === 'by_weight') {
      transport_cost = weightPerMeterKg * (inputs.transportRatePerKg || 14.0);
    } else {
      transport_cost = (inputs.fixedTransportTotal || 0) / safeFinishedMeters;
    }
  }

  // --------------------------------------------------------------------------
  // 9. OVERHEAD & WASTAGE ENGINE
  // --------------------------------------------------------------------------
  const baseCostDirect = 
    (costingMethod.startsWith('direct') ? grey_fabric_cost : (yarn_cost + weaving_cost + sizing_cost + grey_inspection_cost)) +
    processing_cost +
    dyeing_cost +
    finishing_cost +
    printing_cost +
    packaging_cost;

  const wastage_cost = baseCostDirect * (1 - effectiveYield);

  let overhead_cost = 0;
  if (inputs.overheadMethod === 'percentage') {
    overhead_cost = (baseCostDirect + wastage_cost) * ((inputs.overheadPct || 3.5) / 100);
  } else {
    overhead_cost = (inputs.fixedOverheadTotal || 0) / safeFinishedMeters;
  }

  // --------------------------------------------------------------------------
  // 10. TOTAL PRODUCTION COST
  // --------------------------------------------------------------------------
  const total_production_cost_per_meter =
    (costingMethod.startsWith('direct') ? grey_fabric_cost : (yarn_cost + weaving_cost + sizing_cost + grey_inspection_cost + other_manufacturing_cost)) +
    processing_cost +
    dyeing_cost +
    finishing_cost +
    printing_cost +
    chemical_cost +
    packaging_cost +
    transport_cost +
    overhead_cost +
    wastage_cost;

  const cost_per_meter = Number(total_production_cost_per_meter.toFixed(2));
  const cost_per_kg = weightPerMeterKg > 0 ? Number((cost_per_meter / weightPerMeterKg).toFixed(2)) : 0;
  const cost_per_yard = Number((cost_per_meter * YARD_TO_METER).toFixed(2));
  const total_production_cost = Number((cost_per_meter * safeFinishedMeters).toFixed(2));

  // --------------------------------------------------------------------------
  // 11. MARGIN & MARKUP ENGINE
  // --------------------------------------------------------------------------
  let selling_price = 0;
  let margin_amount_per_meter = 0;
  const marginPct = inputs.targetMarginPct || 15;
  const markupPct = inputs.targetMarkupPct || 20;

  if (inputs.pricingStrategy === 'markup') {
    // Markup: Selling Price = Cost * (1 + Markup%)
    selling_price = cost_per_meter * (1 + markupPct / 100);
    margin_amount_per_meter = selling_price - cost_per_meter;
  } else {
    // True Profit Margin: Selling Price = Cost / (1 - Margin%)
    const safeMarginFactor = Math.max(0.01, 1 - marginPct / 100);
    selling_price = cost_per_meter / safeMarginFactor;
    margin_amount_per_meter = selling_price - cost_per_meter;
  }

  selling_price += (inputs.commissionPerMeter || 0) + (inputs.otherChargesPerMeter || 0);
  selling_price = Number(selling_price.toFixed(2));
  const selling_price_per_kg = weightPerMeterKg > 0 ? Number((selling_price / weightPerMeterKg).toFixed(2)) : 0;
  const selling_price_per_yard = Number((selling_price * YARD_TO_METER).toFixed(2));

  // --------------------------------------------------------------------------
  // 12. TAX ENGINE
  // --------------------------------------------------------------------------
  let tax_amount_per_meter = 0;
  let final_price = selling_price;
  const taxRate = (inputs.taxRatePct || 18) / 100;

  if (inputs.taxMode === 'exclusive') {
    tax_amount_per_meter = selling_price * taxRate;
    final_price = selling_price + tax_amount_per_meter;
  } else if (inputs.taxMode === 'inclusive') {
    tax_amount_per_meter = selling_price - (selling_price / (1 + taxRate));
    final_price = selling_price;
  } else {
    tax_amount_per_meter = 0;
    final_price = selling_price;
  }

  final_price = Number(final_price.toFixed(2));
  const final_price_per_kg = weightPerMeterKg > 0 ? Number((final_price / weightPerMeterKg).toFixed(2)) : 0;
  const final_price_per_yard = Number((final_price * YARD_TO_METER).toFixed(2));

  // Order Totals
  const totalOrderCost = Number((cost_per_meter * safeFinishedMeters).toFixed(2));
  const totalOrderSellingPrice = Number((selling_price * safeFinishedMeters).toFixed(2));
  const totalOrderTax = Number((tax_amount_per_meter * safeFinishedMeters).toFixed(2));
  const totalOrderInvoiceValue = Number((final_price * safeFinishedMeters).toFixed(2));
  const totalOrderGrossProfit = Number(((selling_price - cost_per_meter) * safeFinishedMeters).toFixed(2));

  // Completeness Score Calculation
  let filledFields = 0;
  const requiredFields = [
    inputs.fabricType,
    inputs.finishedWidthInches,
    inputs.finishedLengthMeters,
    inputs.warpCountNe,
    inputs.weftCountNe,
    inputs.epi,
    inputs.ppi,
    inputs.warpYarnRate,
    inputs.weftYarnRate,
  ];
  requiredFields.forEach((f) => {
    if (f !== undefined && f !== null && f !== 0 && f !== '') filledFields++;
  });
  const completenessScore = Math.round((filledFields / requiredFields.length) * 100);

  auditSteps.push({
    stepNumber: 6,
    category: 'Commercial Pricing & Tax',
    name: 'Final Selling Price & Invoice Value',
    formulaString: inputs.pricingStrategy === 'margin' ? 'Selling Price = Cost ÷ (1 - Margin%) + Tax' : 'Selling Price = Cost × (1 + Markup%) + Tax',
    inputsUsed: `Cost: ${cost_per_meter.toFixed(2)}, Margin: ${marginPct}%, Tax: ${(taxRate * 100)}% (${inputs.taxMode})`,
    intermediateResult: `Base: ${selling_price.toFixed(2)} + Tax: ${tax_amount_per_meter.toFixed(2)} = Final ${final_price.toFixed(2)}/m`,
    finalValue: final_price,
    unit: 'PKR/m',
    isVerified: true,
  });

  return {
    fabricStructure: structure,
    warpWeightPerMeterGrams: Number(warpWeightPerMeterGrams.toFixed(2)),
    weftWeightPerMeterGrams: Number(weftWeightPerMeterGrams.toFixed(2)),
    totalGreyWeightPerMeterGrams: Number(totalGreyWeightPerMeterGrams.toFixed(2)),
    weightPerMeterKg: Number(weightPerMeterKg.toFixed(4)),
    estimatedGreyGSM: Number(estimatedGreyGSM.toFixed(1)),
    estimatedFinishedGSM: Number(estimatedFinishedGSM.toFixed(1)),
    effectiveYieldPct,
    totalProcessLossPct,
    requiredGreyInputKg: Number(requiredGreyInputKg.toFixed(2)),
    requiredGreyInputMeters: Number(requiredGreyInputMeters.toFixed(2)),
    finishedOutputKg: Number(finishedOutputKg.toFixed(2)),
    finishedOutputMeters,
    totalWarpWeightKg: Number(totalWarpWeightKg.toFixed(2)),
    totalWeftWeightKg: Number(totalWeftWeightKg.toFixed(2)),
    totalYarnWeightKg: Number(totalYarnWeightKg.toFixed(2)),
    totalYarnBags100lbs: Number(totalYarnBags100lbs.toFixed(2)),
    totalYarnBags10lbs: Number(totalYarnBags10lbs.toFixed(2)),
    yarn_cost: Number(yarn_cost.toFixed(2)),
    warp_yarn_cost: Number(warp_yarn_cost.toFixed(2)),
    weft_yarn_cost: Number(weft_yarn_cost.toFixed(2)),
    weaving_cost: Number(weaving_cost.toFixed(2)),
    sizing_cost: Number(sizing_cost.toFixed(2)),
    grey_inspection_cost: Number(grey_inspection_cost.toFixed(2)),
    grey_fabric_cost: Number(grey_fabric_cost.toFixed(2)),
    processing_cost: Number(processing_cost.toFixed(2)),
    dyeing_cost: Number(dyeing_cost.toFixed(2)),
    printing_cost: Number(printing_cost.toFixed(2)),
    color_ink_cost: Number(color_ink_cost.toFixed(2)),
    screen_cost_per_meter: Number(screen_cost_per_meter.toFixed(2)),
    finishing_cost: Number(finishing_cost.toFixed(2)),
    chemical_cost: Number(chemical_cost.toFixed(2)),
    energy_cost: Number(energy_cost.toFixed(2)),
    labor_cost: Number(labor_cost.toFixed(2)),
    packaging_cost: Number(packaging_cost.toFixed(2)),
    transport_cost: Number(transport_cost.toFixed(2)),
    insurance_customs_cost: Number(insurance_customs_cost.toFixed(2)),
    overhead_cost: Number(overhead_cost.toFixed(2)),
    wastage_cost: Number(wastage_cost.toFixed(2)),
    other_manufacturing_cost: Number(other_manufacturing_cost.toFixed(2)),
    total_production_cost,
    cost_per_meter,
    cost_per_kg,
    cost_per_yard,
    markup_percent: markupPct,
    margin_percent: marginPct,
    margin_amount_per_meter: Number(margin_amount_per_meter.toFixed(2)),
    selling_price,
    selling_price_per_kg,
    selling_price_per_yard,
    tax: Number(tax_amount_per_meter.toFixed(2)),
    tax_mode: inputs.taxMode || 'exclusive',
    final_price,
    final_price_per_kg,
    final_price_per_yard,
    totalOrderCost,
    totalOrderSellingPrice,
    totalOrderTax,
    totalOrderInvoiceValue,
    totalOrderGrossProfit,
    currency: inputs.currency || 'PKR',
    completenessScore,
    calculationCompletenessScore: completenessScore,
    estimateConfidence: completenessScore === 100 ? 'VERIFIED INPUTS (100%)' : `ESTIMATED (${completenessScore}% COMPLETE)`,
    status: assumptionsList.length === 0 ? 'VERIFIED_INPUTS' : 'ASSUMPTIONS_USED',
    assumptionsList,
    missingInputsList,
    auditSteps,
    colorPrintingReport: inputs.colorPrinting?.enabled ? {
      totalPrintingCostPerMeter: printing_cost,
      totalColorInkCostPerMeter: color_ink_cost,
      totalScreenCostPerMeter: screen_cost_per_meter,
      colorBreakdown: inputs.colorPrinting.colors || [],
    } : undefined,
    costWaterfall: [
      { stageName: 'Yarn', stageCostPerMeter: yarn_cost, cumulativeCostPerMeter: yarn_cost },
      { stageName: 'Weaving/Knit', stageCostPerMeter: weaving_cost + sizing_cost + grey_inspection_cost, cumulativeCostPerMeter: yarn_cost + weaving_cost + sizing_cost + grey_inspection_cost },
      { stageName: 'Processing', stageCostPerMeter: processing_cost, cumulativeCostPerMeter: grey_fabric_cost + processing_cost },
      { stageName: 'Dyeing', stageCostPerMeter: dyeing_cost, cumulativeCostPerMeter: grey_fabric_cost + processing_cost + dyeing_cost },
      { stageName: 'Printing', stageCostPerMeter: printing_cost, cumulativeCostPerMeter: grey_fabric_cost + processing_cost + dyeing_cost + printing_cost },
      { stageName: 'Finishing', stageCostPerMeter: finishing_cost, cumulativeCostPerMeter: grey_fabric_cost + processing_cost + dyeing_cost + printing_cost + finishing_cost },
      { stageName: 'Packaging & Logistics', stageCostPerMeter: packaging_cost + transport_cost, cumulativeCostPerMeter: grey_fabric_cost + processing_cost + dyeing_cost + printing_cost + finishing_cost + packaging_cost + transport_cost },
      { stageName: 'Overhead & Loss', stageCostPerMeter: overhead_cost + wastage_cost, cumulativeCostPerMeter: total_production_cost_per_meter },
      { stageName: 'Profit Margin', stageCostPerMeter: margin_amount_per_meter, cumulativeCostPerMeter: selling_price },
      { stageName: 'Final Invoice (Tax)', stageCostPerMeter: tax_amount_per_meter, cumulativeCostPerMeter: final_price },
    ],
    breakdownPercentages: {
      yarnPct: Number(((yarn_cost / cost_per_meter) * 100).toFixed(1)),
      weavingPct: Number(((weaving_cost / cost_per_meter) * 100).toFixed(1)),
      processingPct: Number(((processing_cost / cost_per_meter) * 100).toFixed(1)),
      dyeingFinishingPct: Number((((dyeing_cost + finishing_cost) / cost_per_meter) * 100).toFixed(1)),
      printingPct: Number(((printing_cost / cost_per_meter) * 100).toFixed(1)),
      packagingLogisticsPct: Number((((packaging_cost + transport_cost) / cost_per_meter) * 100).toFixed(1)),
      wastagePct: Number(((wastage_cost / cost_per_meter) * 100).toFixed(1)),
      logisticsOverheadPct: Number((((transport_cost + overhead_cost) / cost_per_meter) * 100).toFixed(1)),
      marginPct: Number(((margin_amount_per_meter / selling_price) * 100).toFixed(1)),
    },
  };
}

export const convertYarnCount = (value: number, from: YarnCountSystem, to: YarnCountSystem): number => {
  return YarnCountEngine.convert(value, from, to);
};

