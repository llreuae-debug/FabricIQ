import type { 
  FabricCalculationInput, 
  FabricIQCalculationResult, 
  FabricPreset, 
  ProcessingOperation, 
  DetailedDyeingBreakdown, 
  DetailedFinishingBreakdown 
} from '../types';

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
    warpCrimpPct: 8.0,
    weftCrimpPct: 6.0,
    defaultProcessing: 'Vat Continuous Dyed',
  },
  {
    id: 'satin-stripe-40x40',
    name: 'Hotel Satin Stripe 40x40 / 140x90 (4/1 Satin) 110"',
    description: 'Silky smooth striped luxury bedding fabric for hospitality & export',
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
    defaultProcessing: 'Continuous Bleached & Mercerized',
  },
  {
    id: 'pocketing-pc-45x45',
    name: 'Poly-Cotton Pocketing 45x45 / 88x64 (58")',
    description: 'Economical, high-tensile PC blend fabric for trousers and lining',
    category: 'Pocketing',
    widthInches: 58,
    warpCount: 45,
    weftCount: 45,
    warpType: 'PC Blend',
    weftType: 'PC Blend',
    epi: 88,
    ppi: 64,
    warpCrimpPct: 5.0,
    weftCrimpPct: 4.0,
    defaultProcessing: 'Continuous Bleached',
  },
];

const YARD_TO_METER = 0.9144;
const LB_TO_GRAMS = 453.59237;
const LB_TO_KG = 0.45359237;
const INCH_TO_METER = 0.0254;

/**
 * ============================================================================
 * FABRICIQ DETERMINISTIC CALCULATION PIPELINE
 * ============================================================================
 */
export function calculateFabricIQCost(input: FabricCalculationInput): FabricIQCalculationResult {
  const {
    costingMethod,
    finishedWidthInches,
    finishedLengthMeters,
    directGreyRatePerMeter,
    directGreyRatePerKg,
    directGSM,
    warpCountNe,
    weftCountNe,
    epi,
    ppi,
    warpCrimpPct,
    weftCrimpPct,
    warpWastePct,
    weftWastePct,
    warpYarnRate,
    warpYarnRateUnit,
    weftYarnRate,
    weftYarnRateUnit,
    weavingCostMethod,
    weavingRate,
    sizingCostPerMeter,
    otherGreyManufacturingCostPerMeter,
    weavingLossPct,
    wetProcessingLossPct,
    finishingLossPct,
    processingOperations,
    detailedDyeing,
    detailedFinishing,
    printingCostPerMeter,
    auxChemicalCostPerMeter,
    transportMethod,
    transportRatePerKg,
    fixedTransportTotal,
    overheadMethod,
    overheadPct,
    fixedOverheadTotal,
    pricingStrategy,
    targetMarginPct,
    targetMarkupPct,
    commissionPerMeter,
    otherChargesPerMeter,
    taxMode,
    taxRatePct,
    currency,
  } = input;

  const safeFinishedMeters = Math.max(1, finishedLengthMeters || 1000);
  const safeWidth = Math.max(1, finishedWidthInches || 63);
  const widthInMeters = safeWidth * INCH_TO_METER;

  // --------------------------------------------------------------------------
  // 1. PHYSICAL CONSUMPTION ENGINE
  // --------------------------------------------------------------------------
  let warpWeightPerMeterGrams = 0;
  let weftWeightPerMeterGrams = 0;
  let totalGreyWeightPerMeterGrams = 0;
  let weightPerMeterKg = 0;
  let estimatedGreyGSM = 0;
  let estimatedFinishedGSM = 0;

  if (costingMethod === 'direct_grey_kg') {
    // If direct kg rate with known GSM:
    // Weight per meter (kg) = GSM * Width(m) / 1000
    estimatedGreyGSM = directGSM || 150;
    estimatedFinishedGSM = estimatedGreyGSM * 1.04;
    weightPerMeterKg = (estimatedGreyGSM * widthInMeters) / 1000;
    totalGreyWeightPerMeterGrams = weightPerMeterKg * 1000;
    warpWeightPerMeterGrams = totalGreyWeightPerMeterGrams * 0.55;
    weftWeightPerMeterGrams = totalGreyWeightPerMeterGrams * 0.45;
  } else if (costingMethod === 'direct_grey_meter') {
    estimatedGreyGSM = directGSM || 150;
    estimatedFinishedGSM = estimatedGreyGSM * 1.04;
    weightPerMeterKg = (estimatedGreyGSM * widthInMeters) / 1000;
    totalGreyWeightPerMeterGrams = weightPerMeterKg * 1000;
    warpWeightPerMeterGrams = totalGreyWeightPerMeterGrams * 0.55;
    weftWeightPerMeterGrams = totalGreyWeightPerMeterGrams * 0.45;
  } else {
    // Engineered Woven Fabric Physical Consumption Engine
    const safeWarpCount = Math.max(0.1, warpCountNe || 20);
    const safeWeftCount = Math.max(0.1, weftCountNe || 20);
    const safeEpi = Math.max(1, epi || 60);
    const safePpi = Math.max(1, ppi || 60);

    // Base consumption in lbs/yard: (Ends * Width) / (840 * Count)
    const baseWarpLbsPerYard = (safeEpi * safeWidth) / (840 * safeWarpCount);
    const baseWeftLbsPerYard = (safePpi * safeWidth) / (840 * safeWeftCount);

    // Configurable consumption with Crimp% and Waste%:
    // Warp Consumption = Base * (1 + Crimp%) * (1 + Waste%)
    const warpLbsPerYard = baseWarpLbsPerYard * (1 + (warpCrimpPct || 6) / 100) * (1 + (warpWastePct || 0) / 100);
    const weftLbsPerYard = baseWeftLbsPerYard * (1 + (weftCrimpPct || 4.5) / 100) * (1 + (weftWastePct || 0) / 100);

    // Convert to Grams per linear meter:
    warpWeightPerMeterGrams = (warpLbsPerYard / YARD_TO_METER) * LB_TO_GRAMS;
    weftWeightPerMeterGrams = (weftLbsPerYard / YARD_TO_METER) * LB_TO_GRAMS;
    totalGreyWeightPerMeterGrams = warpWeightPerMeterGrams + weftWeightPerMeterGrams;
    weightPerMeterKg = totalGreyWeightPerMeterGrams / 1000;

    // Physical GSM:
    estimatedGreyGSM = totalGreyWeightPerMeterGrams / widthInMeters;
    estimatedFinishedGSM = estimatedGreyGSM * 1.04;
  }

  // --------------------------------------------------------------------------
  // 2. PRODUCTION / YIELD ENGINE (Multi-stage process losses)
  // --------------------------------------------------------------------------
  const loss1 = (weavingLossPct || 0) / 100;
  const loss2 = (wetProcessingLossPct || 0) / 100;
  const loss3 = (finishingLossPct || 0) / 100;

  // Effective Yield = (1 - loss1) * (1 - loss2) * (1 - loss3)
  const effectiveYield = Math.max(0.1, (1 - loss1) * (1 - loss2) * (1 - loss3));
  const effectiveYieldPct = Number((effectiveYield * 100).toFixed(2));

  // Required Finished Quantities:
  const finishedOutputMeters = safeFinishedMeters;
  const finishedOutputKg = finishedOutputMeters * weightPerMeterKg;

  // Required Input to produce finished output:
  // Required Input = Required Output / Effective Yield
  const requiredGreyInputKg = finishedOutputKg / effectiveYield;
  const requiredGreyInputMeters = finishedOutputMeters / (1 - (loss2 + loss3));

  // Total Yarn Requirements (Kg and Bags):
  const totalWarpWeightKg = (warpWeightPerMeterGrams * requiredGreyInputMeters) / 1000;
  const totalWeftWeightKg = (weftWeightPerMeterGrams * requiredGreyInputMeters) / 1000;
  const totalYarnWeightKg = totalWarpWeightKg + totalWeftWeightKg;
  const totalYarnBags100lbs = totalYarnWeightKg / (100 * LB_TO_KG);
  const totalYarnBags10lbs = totalYarnWeightKg / (10 * LB_TO_KG);

  // --------------------------------------------------------------------------
  // 3. RATE & COST COMPONENT ENGINE
  // --------------------------------------------------------------------------
  const normalizeYarnRateToPerKg = (rate: number, unit: 'kg' | 'lb' | '10lbs'): number => {
    if (unit === 'kg') return rate;
    if (unit === 'lb') return rate / LB_TO_KG;
    if (unit === '10lbs') return (rate / 10) / LB_TO_KG;
    return rate;
  };

  const warpRatePerKg = normalizeYarnRateToPerKg(warpYarnRate || 0, warpYarnRateUnit || '10lbs');
  const weftRatePerKg = normalizeYarnRateToPerKg(weftYarnRate || 0, weftYarnRateUnit || '10lbs');

  // A. Yarn Costs per finished meter (accounting for yield buffer)
  const greyToFinishedMeterMultiplier = requiredGreyInputMeters / finishedOutputMeters;
  let warp_yarn_cost = (warpWeightPerMeterGrams / 1000) * warpRatePerKg * greyToFinishedMeterMultiplier;
  let weft_yarn_cost = (weftWeightPerMeterGrams / 1000) * weftRatePerKg * greyToFinishedMeterMultiplier;
  let yarn_cost = warp_yarn_cost + weft_yarn_cost;

  // B. Weaving Cost
  let weaving_cost = 0;
  if (weavingCostMethod === 'per_meter') {
    weaving_cost = (weavingRate || 0) * greyToFinishedMeterMultiplier;
  } else if (weavingCostMethod === 'per_kg') {
    weaving_cost = weightPerMeterKg * (weavingRate || 0) * greyToFinishedMeterMultiplier;
  } else {
    // Per pick rate: (PPI * pick_rate)
    weaving_cost = (ppi || 60) * (weavingRate || 0.48) * greyToFinishedMeterMultiplier;
  }

  const sizing_cost = (sizingCostPerMeter || 0) * greyToFinishedMeterMultiplier;
  const other_manufacturing_cost = (otherGreyManufacturingCostPerMeter || 0) * greyToFinishedMeterMultiplier;

  // C. Grey Fabric Cost
  let grey_fabric_cost = 0;
  if (costingMethod === 'direct_grey_meter') {
    grey_fabric_cost = (directGreyRatePerMeter || 0) * greyToFinishedMeterMultiplier;
    yarn_cost = 0;
    warp_yarn_cost = 0;
    weft_yarn_cost = 0;
    weaving_cost = 0;
  } else if (costingMethod === 'direct_grey_kg') {
    grey_fabric_cost = weightPerMeterKg * (directGreyRatePerKg || 0) * greyToFinishedMeterMultiplier;
    yarn_cost = 0;
    warp_yarn_cost = 0;
    weft_yarn_cost = 0;
    weaving_cost = 0;
  } else {
    grey_fabric_cost = yarn_cost + weaving_cost + sizing_cost + other_manufacturing_cost;
  }

  // D. Processing Cost (Separated checklist operations)
  let processing_cost = 0;
  const activeOps = processingOperations || DEFAULT_PROCESSING_OPERATIONS;
  activeOps.forEach((op) => {
    if (op.enabled && op.category !== 'dyeing') {
      processing_cost += op.costPerMeter || 0;
    }
  });

  // E. Dyeing Cost (Separated detailed or single rate)
  let dyeing_cost = 0;
  let energy_cost = 0;
  let labor_cost = 0;
  let chemical_cost = auxChemicalCostPerMeter || 0;

  if (detailedDyeing && detailedDyeing.enabled) {
    dyeing_cost =
      (detailedDyeing.machineChargePerMeter || 0) +
      (detailedDyeing.dyeCostPerMeter || 0) +
      (detailedDyeing.chemicalCostPerMeter || 0) +
      (detailedDyeing.waterCostPerMeter || 0) +
      (detailedDyeing.steamEnergyCostPerMeter || 0) +
      (detailedDyeing.laborCostPerMeter || 0) +
      (detailedDyeing.overheadCostPerMeter || 0);

    energy_cost += detailedDyeing.steamEnergyCostPerMeter || 0;
    labor_cost += detailedDyeing.laborCostPerMeter || 0;
    chemical_cost += (detailedDyeing.dyeCostPerMeter || 0) + (detailedDyeing.chemicalCostPerMeter || 0);
  } else {
    // Check if dyeing enabled in checklist
    const dyeingOp = activeOps.find((op) => op.category === 'dyeing');
    if (dyeingOp && dyeingOp.enabled) {
      dyeing_cost = dyeingOp.costPerMeter || 0;
    }
  }

  // F. Finishing Cost (Detailed or checklist)
  let finishing_cost = 0;
  if (detailedFinishing && detailedFinishing.enabled) {
    finishing_cost =
      (detailedFinishing.machineCostPerMeter || 0) +
      (detailedFinishing.chemicalCostPerMeter || 0) +
      (detailedFinishing.energyCostPerMeter || 0) +
      (detailedFinishing.laborCostPerMeter || 0) +
      (detailedFinishing.overheadCostPerMeter || 0);

    energy_cost += detailedFinishing.energyCostPerMeter || 0;
    labor_cost += detailedFinishing.laborCostPerMeter || 0;
    chemical_cost += detailedFinishing.chemicalCostPerMeter || 0;
  }

  // G. Printing Cost
  const printing_cost = printingCostPerMeter || 0;

  // H. Wastage Loss Cost (Yield difference between raw base cost and required input)
  const baseCostDirect = (costingMethod.startsWith('direct') ? grey_fabric_cost : (yarn_cost + weaving_cost + sizing_cost)) + processing_cost + dyeing_cost + finishing_cost + printing_cost;
  const wastage_cost = baseCostDirect * (1 - effectiveYield);

  // I. Transport Cost
  let transport_cost = 0;
  if (transportMethod === 'by_weight') {
    transport_cost = weightPerMeterKg * (transportRatePerKg || 0);
  } else {
    transport_cost = (fixedTransportTotal || 0) / safeFinishedMeters;
  }

  // J. Overhead Cost
  let overhead_cost = 0;
  if (overheadMethod === 'percentage') {
    overhead_cost = (baseCostDirect + wastage_cost) * ((overheadPct || 0) / 100);
  } else {
    overhead_cost = (fixedOverheadTotal || 0) / safeFinishedMeters;
  }

  // --------------------------------------------------------------------------
  // 4. TOTAL PRODUCTION COST ENGINE
  // --------------------------------------------------------------------------
  const total_production_cost_per_meter =
    (costingMethod.startsWith('direct') ? grey_fabric_cost : (yarn_cost + weaving_cost + sizing_cost + other_manufacturing_cost)) +
    processing_cost +
    dyeing_cost +
    finishing_cost +
    printing_cost +
    chemical_cost +
    transport_cost +
    overhead_cost +
    wastage_cost;

  const cost_per_meter = Number(total_production_cost_per_meter.toFixed(2));
  const cost_per_kg = weightPerMeterKg > 0 ? Number((cost_per_meter / weightPerMeterKg).toFixed(2)) : 0;
  const cost_per_yard = Number((cost_per_meter * YARD_TO_METER).toFixed(2));
  const total_production_cost = Number((cost_per_meter * safeFinishedMeters).toFixed(2));

  // --------------------------------------------------------------------------
  // 5. MARGIN / MARKUP ENGINE
  // --------------------------------------------------------------------------
  let selling_price = 0;
  let margin_amount_per_meter = 0;
  const marginPct = targetMarginPct || 15;
  const markupPct = targetMarkupPct || 20;

  if (pricingStrategy === 'markup') {
    // Markup: Selling Price = Cost * (1 + Markup%)
    selling_price = cost_per_meter * (1 + markupPct / 100);
    margin_amount_per_meter = selling_price - cost_per_meter;
  } else {
    // True Profit Margin: Selling Price = Cost / (1 - Margin%)
    const safeMarginFactor = Math.max(0.01, 1 - marginPct / 100);
    selling_price = cost_per_meter / safeMarginFactor;
    margin_amount_per_meter = selling_price - cost_per_meter;
  }

  // Add optional commission & commercial charges
  selling_price += (commissionPerMeter || 0) + (otherChargesPerMeter || 0);
  selling_price = Number(selling_price.toFixed(2));
  const selling_price_per_kg = weightPerMeterKg > 0 ? Number((selling_price / weightPerMeterKg).toFixed(2)) : 0;
  const selling_price_per_yard = Number((selling_price * YARD_TO_METER).toFixed(2));

  // --------------------------------------------------------------------------
  // 6. TAX ENGINE (Tax Exclusive vs Inclusive)
  // --------------------------------------------------------------------------
  let tax = 0;
  let final_price = selling_price;
  const taxRate = (taxRatePct || 0) / 100;

  if (taxMode === 'exclusive') {
    // Tax Exclusive: Tax = Price * Tax%, Final = Price + Tax
    tax = Number((selling_price * taxRate).toFixed(2));
    final_price = Number((selling_price + tax).toFixed(2));
  } else if (taxMode === 'inclusive') {
    // Tax Inclusive: Net = Gross / (1 + Tax%), Tax = Gross - Net
    const net = selling_price / (1 + taxRate);
    tax = Number((selling_price - net).toFixed(2));
    final_price = selling_price;
  } else {
    tax = 0;
    final_price = selling_price;
  }

  const final_price_per_kg = weightPerMeterKg > 0 ? Number((final_price / weightPerMeterKg).toFixed(2)) : 0;
  const final_price_per_yard = Number((final_price * YARD_TO_METER).toFixed(2));

  // --------------------------------------------------------------------------
  // 7. TOTAL ORDER VALUES
  // --------------------------------------------------------------------------
  const totalOrderCost = Number((cost_per_meter * safeFinishedMeters).toFixed(2));
  const totalOrderSellingPrice = Number((selling_price * safeFinishedMeters).toFixed(2));
  const totalOrderTax = Number((tax * safeFinishedMeters).toFixed(2));
  const totalOrderInvoiceValue = Number((final_price * safeFinishedMeters).toFixed(2));
  const totalOrderGrossProfit = Number((totalOrderSellingPrice - totalOrderCost).toFixed(2));

  // --------------------------------------------------------------------------
  // 8. PERCENTAGE BREAKDOWN
  // --------------------------------------------------------------------------
  const baseDenominator = Math.max(0.01, selling_price);
  const breakdownPercentages = {
    yarnPct: Number(((yarn_cost / baseDenominator) * 100).toFixed(1)),
    weavingPct: Number(((weaving_cost + sizing_cost) / baseDenominator) * 100),
    processingPct: Number(((processing_cost + printing_cost) / baseDenominator) * 100),
    dyeingFinishingPct: Number(((dyeing_cost + finishing_cost) / baseDenominator) * 100),
    wastagePct: Number(((wastage_cost / baseDenominator) * 100).toFixed(1)),
    logisticsOverheadPct: Number((((transport_cost + overhead_cost) / baseDenominator) * 100).toFixed(1)),
    marginPct: Number(((margin_amount_per_meter / baseDenominator) * 100).toFixed(1)),
  };

  return {
    warpWeightPerMeterGrams: Number(warpWeightPerMeterGrams.toFixed(2)),
    weftWeightPerMeterGrams: Number(weftWeightPerMeterGrams.toFixed(2)),
    totalGreyWeightPerMeterGrams: Number(totalGreyWeightPerMeterGrams.toFixed(2)),
    weightPerMeterKg: Number(weightPerMeterKg.toFixed(4)),
    estimatedGreyGSM: Number(estimatedGreyGSM.toFixed(1)),
    estimatedFinishedGSM: Number(estimatedFinishedGSM.toFixed(1)),

    effectiveYieldPct,
    requiredGreyInputKg: Number(requiredGreyInputKg.toFixed(2)),
    requiredGreyInputMeters: Number(requiredGreyInputMeters.toFixed(1)),
    finishedOutputKg: Number(finishedOutputKg.toFixed(2)),
    finishedOutputMeters: Number(finishedOutputMeters.toFixed(1)),

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
    grey_fabric_cost: Number(grey_fabric_cost.toFixed(2)),
    processing_cost: Number(processing_cost.toFixed(2)),
    dyeing_cost: Number(dyeing_cost.toFixed(2)),
    finishing_cost: Number(finishing_cost.toFixed(2)),
    printing_cost: Number(printing_cost.toFixed(2)),
    chemical_cost: Number(chemical_cost.toFixed(2)),
    energy_cost: Number(energy_cost.toFixed(2)),
    labor_cost: Number(labor_cost.toFixed(2)),
    transport_cost: Number(transport_cost.toFixed(2)),
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

    tax,
    tax_mode: taxMode,
    final_price,
    final_price_per_kg,
    final_price_per_yard,

    totalOrderCost,
    totalOrderSellingPrice,
    totalOrderTax,
    totalOrderInvoiceValue,
    totalOrderGrossProfit,

    currency,
    breakdownPercentages,
  };
}

/**
 * Yarn Count Converter Utility
 */
export function convertYarnCount(value: number, from: 'Ne' | 'Nm' | 'Denier' | 'Tex' | 'Dtex', to: 'Ne' | 'Nm' | 'Denier' | 'Tex' | 'Dtex'): number {
  if (!value || value <= 0) return 0;
  if (from === to) return value;

  let tex = 0;
  switch (from) {
    case 'Ne':
      tex = 590.54 / value;
      break;
    case 'Nm':
      tex = 1000 / value;
      break;
    case 'Denier':
      tex = value / 9;
      break;
    case 'Tex':
      tex = value;
      break;
    case 'Dtex':
      tex = value / 10;
      break;
  }

  switch (to) {
    case 'Ne':
      return Number((590.54 / tex).toFixed(2));
    case 'Nm':
      return Number((1000 / tex).toFixed(2));
    case 'Denier':
      return Number((tex * 9).toFixed(1));
    case 'Tex':
      return Number(tex.toFixed(2));
    case 'Dtex':
      return Number((tex * 10).toFixed(1));
  }
}
