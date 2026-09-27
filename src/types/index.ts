export type CurrencyCode = 'PKR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'CNY' | 'INR' | 'TRY';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rateAgainstUSD: number; // 1 USD = X in this currency
  flag: string;
  decimals: number;
}

export type LanguageCode = 'en' | 'ur' | 'zh' | 'tr' | 'ar';

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export type RateStatus = 'LIVE' | 'MANUAL' | 'ESTIMATED';

export type RateCategory = 
  | 'cotton_yarn'
  | 'poly_yarn'
  | 'blended_yarn'
  | 'grey_fabric'
  | 'weaving'
  | 'processing'
  | 'dyeing'
  | 'finishing'
  | 'printing'
  | 'chemicals'
  | 'energy'
  | 'transport'
  | 'forex';

export interface RateHistoryPoint {
  date: string;
  rate: number;
}

export interface MarketRate {
  id: string;
  name: string;
  category: RateCategory;
  spec: string;
  currentRate: number;
  previousRate: number;
  changePercent: number;
  unit: string;
  baseCurrency: CurrencyCode;
  source: string;
  status: RateStatus;
  lastUpdated: string;
  verifiedBy?: string;
  history7d: RateHistoryPoint[];
  history30d: RateHistoryPoint[];
  notes?: string;
}

export interface FabricPreset {
  id: string;
  name: string;
  description: string;
  category: 'Sheeting' | 'Apparel Twill' | 'Poplin / Shirting' | 'Duck / Canvas' | 'Denim / Heavy' | 'Pocketing' | 'Satin / Home' | 'Custom';
  widthInches: number;
  warpCount: number; // Ne
  weftCount: number; // Ne
  warpType: 'Cotton' | 'Polyester' | 'PC Blend' | 'Viscose' | 'Lycra/Spandex';
  weftType: 'Cotton' | 'Polyester' | 'PC Blend' | 'Viscose' | 'Lycra/Spandex';
  epi: number;
  ppi: number;
  warpCrimpPct: number;
  weftCrimpPct: number;
  defaultProcessing: string;
}

// Processing Operation Item
export interface ProcessingOperation {
  id: string;
  name: string;
  enabled: boolean;
  costPerMeter: number;
  category: 'pre_treatment' | 'dyeing' | 'washing' | 'finishing' | 'mechanical' | 'printing' | 'other';
}

// Detailed Breakdown of Dyeing
export interface DetailedDyeingBreakdown {
  enabled: boolean;
  machineChargePerMeter: number;
  dyeCostPerMeter: number;
  chemicalCostPerMeter: number;
  waterCostPerMeter: number;
  steamEnergyCostPerMeter: number;
  laborCostPerMeter: number;
  overheadCostPerMeter: number;
}

// Detailed Breakdown of Finishing
export interface DetailedFinishingBreakdown {
  enabled: boolean;
  machineCostPerMeter: number;
  chemicalCostPerMeter: number;
  energyCostPerMeter: number;
  laborCostPerMeter: number;
  overheadCostPerMeter: number;
}

export interface FabricCalculationInput {
  estimateName: string;
  customerName: string;
  fabricType: string;
  finishedWidthInches: number;
  finishedLengthMeters: number; // Target finished order quantity

  // Costing Method: 'engineered' (from yarn & weaving) vs 'direct_grey_meter' vs 'direct_grey_kg'
  costingMethod: 'engineered' | 'direct_grey_meter' | 'direct_grey_kg';
  
  // Direct Grey Fabric Rates (if known)
  directGreyRatePerMeter: number;
  directGreyRatePerKg: number;
  directGSM: number; // If direct kg rate is used

  // Physical Construction Parameters (Engineered Mode)
  warpCountNe: number;
  weftCountNe: number;
  epi: number;
  ppi: number;
  warpCrimpPct: number;
  weftCrimpPct: number;
  warpWastePct: number;
  weftWastePct: number;

  // Yarn Pricing
  warpYarnRate: number;
  warpYarnRateUnit: 'kg' | 'lb' | '10lbs';
  weftYarnRate: number;
  weftYarnRateUnit: 'kg' | 'lb' | '10lbs';

  // Weaving
  weavingCostMethod: 'per_meter' | 'per_pick' | 'per_kg';
  weavingRate: number; // e.g. ₨ 0.48/pick, ₨ 35/m, or ₨ 120/kg
  sizingCostPerMeter: number;
  otherGreyManufacturingCostPerMeter: number;

  // Multi-Stage Process Loss & Yield
  weavingLossPct: number; // e.g. 2%
  wetProcessingLossPct: number; // e.g. 4%
  finishingLossPct: number; // e.g. 1.5%

  // Processing Operations Checklist
  processingOperations: ProcessingOperation[];
  detailedDyeing: DetailedDyeingBreakdown;
  detailedFinishing: DetailedFinishingBreakdown;

  // Printing & Aux Chemicals
  printingCostPerMeter: number;
  auxChemicalCostPerMeter: number;

  // Transport Methodology
  transportMethod: 'fixed_per_meter' | 'by_weight';
  transportRatePerKg: number;
  fixedTransportTotal: number;

  // Overhead Methodology
  overheadMethod: 'percentage' | 'fixed_total';
  overheadPct: number; // % of direct manufacturing cost
  fixedOverheadTotal: number;

  // Pricing Strategy: 'margin' (True Profit Margin) vs 'markup'
  pricingStrategy: 'margin' | 'markup';
  targetMarginPct: number; // Selling Price = Cost / (1 - Margin%)
  targetMarkupPct: number; // Selling Price = Cost * (1 + Markup%)
  commissionPerMeter: number;
  otherChargesPerMeter: number;

  // Tax Configuration
  taxMode: 'exclusive' | 'inclusive' | 'exempt';
  taxRatePct: number; // e.g. 18% GST / VAT

  // Currency
  currency: CurrencyCode;
  rateSourceSnapshot?: Record<string, { rate: number; source: string; status: RateStatus }>;
}

// Master FabricIQ Calculation Output Object
export interface FabricIQCalculationResult {
  // Physical Consumption Engine Outputs
  warpWeightPerMeterGrams: number;
  weftWeightPerMeterGrams: number;
  totalGreyWeightPerMeterGrams: number;
  weightPerMeterKg: number;
  estimatedGreyGSM: number;
  estimatedFinishedGSM: number;

  // Production Yield Engine Outputs
  effectiveYieldPct: number; // e.g. (1 - loss1) * (1 - loss2) * (1 - loss3)
  requiredGreyInputKg: number;
  requiredGreyInputMeters: number;
  finishedOutputKg: number;
  finishedOutputMeters: number;

  // Yarn Weight Totals
  totalWarpWeightKg: number;
  totalWeftWeightKg: number;
  totalYarnWeightKg: number;
  totalYarnBags100lbs: number;
  totalYarnBags10lbs: number;

  // Cost Component Engine Breakdown (Per Meter)
  yarn_cost: number;
  warp_yarn_cost: number;
  weft_yarn_cost: number;
  weaving_cost: number;
  sizing_cost: number;
  grey_fabric_cost: number;
  processing_cost: number;
  dyeing_cost: number;
  finishing_cost: number;
  printing_cost: number;
  chemical_cost: number;
  energy_cost: number;
  labor_cost: number;
  transport_cost: number;
  overhead_cost: number;
  wastage_cost: number;
  other_manufacturing_cost: number;

  // Total Production Costs
  total_production_cost: number;
  cost_per_meter: number;
  cost_per_kg: number;
  cost_per_yard: number;

  // Commercial Margin & Markup
  markup_percent: number;
  margin_percent: number;
  margin_amount_per_meter: number;
  selling_price: number; // Base selling price before tax
  selling_price_per_kg: number;
  selling_price_per_yard: number;
  
  // Tax & Invoice Pricing
  tax: number;
  tax_mode: 'exclusive' | 'inclusive' | 'exempt';
  final_price: number; // Final invoice price per meter
  final_price_per_kg: number;
  final_price_per_yard: number;

  // Total Order Values
  totalOrderCost: number;
  totalOrderSellingPrice: number;
  totalOrderTax: number;
  totalOrderInvoiceValue: number;
  totalOrderGrossProfit: number;

  currency: CurrencyCode;

  // Percentage Breakdown for Analytics
  breakdownPercentages: {
    yarnPct: number;
    weavingPct: number;
    processingPct: number;
    dyeingFinishingPct: number;
    wastagePct: number;
    logisticsOverheadPct: number;
    marginPct: number;
  };
}

export interface SavedEstimate {
  id: string;
  referenceNo: string;
  title: string;
  customerName: string;
  fabricType: string;
  createdAt: string;
  updatedAt: string;
  currency: CurrencyCode;
  inputs: FabricCalculationInput;
  results: FabricIQCalculationResult;
  status: 'draft' | 'quoted' | 'approved' | 'in_production' | 'archived';
  notes?: string;
  tags?: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  rateId: string;
  rateName: string;
  oldValue: string;
  newValue: string;
  statusChange?: string;
  source: string;
}

export interface Supplier {
  id: string;
  name: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  categories: string[];
  reliabilityScore: number;
  lastRateUpdate: string;
}
