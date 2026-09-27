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

export type YarnCountSystem = 'Ne' | 'Nm' | 'Tex' | 'Denier' | 'dTex';
export type FabricStructure = 'woven' | 'knitted';

// Multi-Stage Process Yield Breakdown
export interface ProcessYieldStageLosses {
  warpingLossPct: number;
  sizingLossPct: number;
  weavingLossPct: number;
  greyInspectionLossPct: number;
  desizingLossPct: number;
  scouringBleachingLossPct: number;
  mercerizingLossPct: number;
  dyeingLossPct: number;
  printingLossPct: number;
  finishingLossPct: number;
  compactingLossPct: number;
  finalInspectionLossPct: number;
}

// Color-Wise Printing Breakdown
export interface PrintingColorItem {
  id: string;
  colorName: string;
  hexCode?: string;
  consumptionGramsPerMeter: number;
  inkRatePerKg: number;
  costPerMeter: number;
}

export interface ColorWisePrintingConfig {
  enabled: boolean;
  method: 'rotary_screen' | 'flatbed_screen' | 'digital_reactive' | 'digital_sublimation' | 'pigment';
  colors: PrintingColorItem[];
  screenCount: number;
  screenCostPerScreen: number;
  setupCostFixed: number;
  machinePrintingRatePerMeter: number;
  chemicalCostPerMeter: number;
  dryingCuringCostPerMeter: number;
  printingWastePct: number;
  minimumBatchCharge: number;
}

// Packaging Configuration
export interface PackagingConfig {
  enabled: boolean;
  cartonCostPerRoll: number;
  polybagCostPerRoll: number;
  rollTubesCost: number;
  labelsAndTagsCostPerRoll: number;
  palletAndStrappingCost: number;
  packagingLaborPerMeter: number;
  metersPerRoll: number;
}

// Logistics Configuration
export interface LogisticsConfig {
  enabled: boolean;
  method: 'by_weight' | 'by_distance_km' | 'fixed_container' | 'fixed_total';
  distanceKm: number;
  ratePerKm: number;
  freightRatePerKg: number;
  containerRateFixed: number;
  loadingUnloadingCost: number;
  transitInsurancePct: number;
  portAndCustomsCharges: number;
}

// Step-by-Step Formula Audit Trace Item
export interface FormulaAuditStep {
  stepNumber: number;
  category: string;
  name: string;
  formulaString: string;
  inputsUsed: string;
  intermediateResult: string;
  finalValue: number;
  unit: string;
  assumptionUsed?: string;
  isVerified: boolean;
}

export interface FabricCalculationInput {
  estimateName: string;
  customerName: string;
  fabricStructure: FabricStructure;
  fabricType: string;
  finishedWidthInches: number;
  finishedLengthMeters: number; // Target finished order quantity

  // Costing Method: 'engineered' vs 'direct_grey_meter' vs 'direct_grey_kg'
  costingMethod: 'engineered' | 'direct_grey_meter' | 'direct_grey_kg';
  
  // Direct Grey Fabric Rates (if known)
  directGreyRatePerMeter: number;
  directGreyRatePerKg: number;
  directGSM: number; // If direct kg rate is used

  // Yarn Count Systems
  warpCountSystem: YarnCountSystem;
  weftCountSystem: YarnCountSystem;
  warpCountNe: number;
  weftCountNe: number;

  // Woven Physical Parameters
  epi: number;
  ppi: number;
  reedCountDents?: number;
  reedWidthInches?: number;
  warpCrimpPct: number;
  weftCrimpPct: number;
  warpWastePct: number;
  weftWastePct: number;

  // Machine Economics (Loom / Machine)
  loomRpmSpeed?: number;
  loomEfficiencyPct?: number;
  loomHourlyCost?: number;

  // Knitted Fabric Specifications
  knittingStitchLengthMm?: number;
  knittingCoursesPerCm?: number;
  knittingWalesPerCm?: number;
  knittingGauge?: number;
  knittingRatePerKg?: number;
  knittingEfficiencyPct?: number;
  knittingWastePct?: number;

  // Yarn Pricing
  warpYarnRate: number;
  warpYarnRateUnit: 'kg' | 'lb' | '10lbs';
  weftYarnRate: number;
  weftYarnRateUnit: 'kg' | 'lb' | '10lbs';

  // Weaving
  weavingCostMethod: 'per_meter' | 'per_pick' | 'per_kg' | 'machine_economics';
  weavingRate: number; // e.g. ₨ 0.48/pick, ₨ 35/m, or ₨ 120/kg
  sizingCostPerMeter: number;
  greyInspectionCostPerMeter: number;
  otherGreyManufacturingCostPerMeter: number;

  // Multi-Stage Cumulative Yield Losses
  weavingLossPct: number;
  wetProcessingLossPct: number;
  finishingLossPct: number;
  yieldLossStages?: ProcessYieldStageLosses;

  // Processing Operations Checklist
  processingOperations: ProcessingOperation[];
  detailedDyeing: DetailedDyeingBreakdown;
  detailedFinishing: DetailedFinishingBreakdown;
  minimumDyeingBatchCharge?: number;

  // Color-Wise Printing Engine
  colorPrinting?: ColorWisePrintingConfig;
  printingCostPerMeter: number;
  auxChemicalCostPerMeter: number;

  // Packaging & Logistics
  packaging?: PackagingConfig;
  logistics?: LogisticsConfig;
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
  customsDutyPct?: number;

  // Currency & Snapshot
  currency: CurrencyCode;
  rateSourceSnapshot?: Record<string, { rate: number; source: string; status: RateStatus; timestamp?: string }>;
  formulaVersion?: string;
  calculatedAt?: string;
}

// Master FabricIQ Pro Calculation Output Object
export interface FabricIQCalculationResult {
  // Physical Consumption Engine Outputs
  fabricStructure: FabricStructure;
  warpWeightPerMeterGrams: number;
  weftWeightPerMeterGrams: number;
  totalGreyWeightPerMeterGrams: number;
  weightPerMeterKg: number;
  estimatedGreyGSM: number;
  estimatedFinishedGSM: number;

  // Production Yield Engine Outputs
  effectiveYieldPct: number; // Compound: (1 - loss1) * (1 - loss2) * ...
  requiredGreyInputKg: number;
  requiredGreyInputMeters: number;
  finishedOutputKg: number;
  finishedOutputMeters: number;
  totalProcessLossPct: number;

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
  grey_inspection_cost: number;
  grey_fabric_cost: number;
  processing_cost: number;
  dyeing_cost: number;
  printing_cost: number;
  color_ink_cost: number;
  screen_cost_per_meter: number;
  finishing_cost: number;
  chemical_cost: number;
  energy_cost: number;
  labor_cost: number;
  packaging_cost: number;
  transport_cost: number;
  insurance_customs_cost: number;
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

  // Accuracy & Completeness Engine
  completenessScore: number; // 0 to 100%
  calculationCompletenessScore?: number;
  estimateConfidence?: string;
  status: 'VERIFIED_INPUTS' | 'ASSUMPTIONS_USED';
  assumptionsList: string[];
  missingInputsList: string[];

  // Auditable Step-by-Step Formulas
  auditSteps: FormulaAuditStep[];

  // Detailed Reports & Waterfall
  colorPrintingReport?: {
    totalPrintingCostPerMeter: number;
    totalColorInkCostPerMeter: number;
    totalScreenCostPerMeter: number;
    colorBreakdown: any[];
  };
  costWaterfall?: {
    stageName: string;
    stageCostPerMeter: number;
    cumulativeCostPerMeter: number;
  }[];

  // Percentage Breakdown for Analytics & Waterfall
  breakdownPercentages: {
    yarnPct: number;
    weavingPct: number;
    processingPct: number;
    dyeingFinishingPct: number;
    printingPct: number;
    packagingLogisticsPct: number;
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

// -------------------------------------------------------------
// Membership & Authentication Data Models
// -------------------------------------------------------------
export type MembershipType = 'FREE' | 'PRO_3_MONTHS' | 'PRO_6_MONTHS' | 'LIFETIME';
export type MembershipStatus = 'active' | 'suspended' | 'expired';

export interface RewardUnlock {
  id: string;
  userId: string;
  rewardType: MembershipType;
  referralThreshold: number; // 3, 5, 12
  grantedAt: string;
  expiryAt: string | null; // null for LIFETIME and default FREE
  status: 'active' | 'superseded' | 'revoked';
  grantedBy: 'system' | 'admin';
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  googleId?: string;
  avatar: string;
  createdAt: string;
  lastLogin: string;
  role: 'user' | 'admin';
  membershipType: MembershipType;
  membershipStatus: MembershipStatus;
  membershipStart: string;
  membershipExpiry: string | null; // null for LIFETIME & FREE
  referralCode: string;
  referredBy?: string; // Referral code of the referrer
  referredUsersCount: number; // Total signups with their code
  qualifiedReferralsCount: number; // Validated & qualified referrals count
  rewardsUnlocked: RewardUnlock[];
  isSuspended?: boolean;
  notes?: string;
}

export type ReferralStatus = 'pending' | 'qualified' | 'suspicious' | 'rejected';

export interface Referral {
  id: string;
  referrerUserId: string;
  referrerCode: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  status: ReferralStatus;
  flagReason?: string;
  qualifiedAt?: string;
  createdAt: string;
  rewardApplied?: boolean;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUserId: string;
  targetUserName: string;
  oldValue: string;
  newValue: string;
  reason?: string;
  timestamp: string;
}

