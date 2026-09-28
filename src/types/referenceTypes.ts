import type { CurrencyCode } from './index';

export type ReferencePrefix = 
  | 'FIB' 
  | 'YRN' 
  | 'THR' 
  | 'FAB-W' 
  | 'FAB-K' 
  | 'FAB-M' 
  | 'DYE' 
  | 'PRT' 
  | 'FIN' 
  | 'WSH' 
  | 'EMB' 
  | 'PCL' 
  | 'SUIT'
  | 'TRM'
  | 'PKG';

export type ReferenceCategory = 
  | 'fibre'
  | 'yarn'
  | 'thread'
  | 'woven_fabric'
  | 'knit_fabric'
  | 'market_fabric'
  | 'dyeing'
  | 'printing'
  | 'finishing'
  | 'denim_wash'
  | 'embroidery'
  | 'percale_product'
  | 'lawn_suit_product'
  | 'trims'
  | 'packaging';

export type RateConfidence = 
  | 'VERIFIED MARKET'
  | 'MARKET QUOTE'
  | 'INDICATIVE'
  | 'USER VERIFIED'
  | 'MANUAL'
  | 'STALE'
  | 'UNAVAILABLE';

export type CostingMethod = 'CONSTRUCTION' | 'MARKET_PURCHASE' | 'PROCESS_BATCH' | 'PER_UNIT';

export interface RateSourceInfo {
  sourceName: string;
  sourceUrl?: string;
  publicationDate?: string;
  effectiveDate?: string;
  retrievedAt: string;
  marketRegion: 'Faisalabad' | 'Lahore' | 'Karachi' | 'Multan' | 'Sialkot' | 'Pakistan Average' | 'Global / FX';
  verifiedBy?: string;
}

export interface RateHistoryEntry {
  timestamp: string;
  rate: number;
  currency: CurrencyCode;
  unit: string;
  confidence: RateConfidence;
  source: string;
  changedBy?: string;
  changeReason?: string;
}

export interface BaseReferenceItem {
  id: string;
  refNo: string; // e.g. YRN-001, FAB-W-001, PCL-F-003
  prefix: ReferencePrefix;
  category: ReferenceCategory;
  marketName: string; // Pakistani / Commercial market name (e.g., '40s Combed Compact', 'Lawn 90x70')
  standardName: string; // Technical specification name
  description: string;
  unit: string; // kg, lb, m, yd, piece, bag, 1000_stitches, maund
  baseRate: number;
  currency: CurrencyCode;
  ratePerKg?: number;
  ratePerLb?: number;
  ratePerMeter?: number;
  minRate?: number;
  maxRate?: number;
  midRate?: number;
  confidence: RateConfidence;
  costingMethod: CostingMethod;
  sourceInfo: RateSourceInfo;
  userOverride?: {
    rate: number;
    user: string;
    timestamp: string;
    reason?: string;
  };
  rateHistory: RateHistoryEntry[];
  dependencies?: string[]; // Array of RefNos this item depends on (e.g. FAB-W-001 depends on YRN-001, YRN-002)
  tags: string[];
  isArchived?: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  qualityScore: number; // 0-100% data completeness
}

// 1. Fibre Reference
export interface FibreReference extends BaseReferenceItem {
  category: 'fibre';
  fibreType: 'Cotton' | 'Polyester' | 'Viscose' | 'Tencel' | 'Acrylic' | 'Nylon' | 'Lycra' | 'Linen' | 'Wool' | 'Silk' | 'Other';
  origin?: string;
  stapleLengthMm?: number;
  micronaire?: number;
  strengthGpt?: number;
}

// 2. Yarn Reference
export interface YarnReference extends BaseReferenceItem {
  category: 'yarn';
  fibreComposition: string; // e.g., '100% Cotton', '65/35 PC', '52/48 CVC'
  yarnType: 'Carded' | 'Combed' | 'Compact' | 'Ring Spun' | 'Open End (OE)' | 'Slub' | 'DTY' | 'FDY' | 'Lycra Core' | 'Zari' | 'Specialty';
  spinningMethod: 'Ring Spun' | 'Compact Spun' | 'Rotor / Open End' | 'Air Jet' | 'Filament Texturized';
  count: number;
  countSystem: 'Ne' | 'Nm' | 'Denier' | 'Tex' | 'Dtex';
  ply: number; // 1, 2, 3
  twistDirection?: 'Z' | 'S';
  twistMultiplier?: number;
  tpi?: number;
  colour: 'Raw White / Ecru' | 'Bleached' | 'Dyed' | 'Melange' | 'Metallic';
  supplierVendor?: string;
}

// 3. Thread Reference
export interface ThreadReference extends BaseReferenceItem {
  category: 'thread';
  threadType: 'Sewing' | 'Poly-core spun' | '100% Spun Polyester' | 'Embroidery Viscose' | 'Metallic / Zari' | 'Cotton Glace' | 'Specialty';
  texNumber?: number;
  denier?: number;
  ticketNumber?: string; // e.g. '120', '80', '40', '20'
  ply: number;
  breakingStrengthCnH?: number;
  elongationPct?: number;
}

// 4. Woven Fabric Reference
export interface WovenFabricReference extends BaseReferenceItem {
  category: 'woven_fabric';
  weave: 'Plain 1/1' | 'Twill 2/1' | 'Twill 3/1' | 'Sateen 4/1' | 'Dobby' | 'Oxford' | 'Herringbone' | 'Ripstop' | 'Jacquard';
  warpCountNe: number;
  weftCountNe: number;
  warpYarnRefNo?: string;
  weftYarnRefNo?: string;
  warpYarnType: string;
  weftYarnType: string;
  epi: number;
  ppi: number;
  greigeWidthInches: number;
  finishedWidthInches: number;
  greigeGsm: number;
  finishedGsm: number;
  warpCrimpPct: number;
  weftCrimpPct: number;
  warpWastePct: number;
  weftWastePct: number;
  weavingEfficiencyPct: number;
  weavingRatePerPick?: number;
  weavingRatePerMeter?: number;
  processingRouteDefault?: string;
  shrinkagePct: { warp: number; weft: number };
}

// 5. Knit & Towel Fabric Reference
export interface KnitFabricReference extends BaseReferenceItem {
  category: 'knit_fabric';
  knitType: 'Single Jersey' | 'Pique' | 'Fleece' | 'Lycra Jersey' | '1x1 Rib' | '2x2 Rib' | 'Interlock' | 'Terry Towel' | 'Waffle';
  yarnCountNe: number;
  yarnRefNo?: string;
  yarnComposition: string;
  gsm: number;
  widthInches: number;
  loopDensity?: number;
  shrinkagePct: { length: number; width: number };
}

// 6. Market-Bought Ready Fabric Reference
export interface MarketFabricReference extends BaseReferenceItem {
  category: 'market_fabric';
  fabricType: 'Velvet' | 'Organza' | 'Jamawar' | 'Blackout' | 'Chenille' | 'Raw Silk' | 'Net' | 'Tissue' | 'Brocade';
  widthInches: number;
  weightGsm?: number;
  selectedMethod: 'MARKET_PURCHASE' | 'CONSTRUCTION';
}

// 7. Dyeing Process Reference
export interface DyeingProcessReference extends BaseReferenceItem {
  category: 'dyeing';
  dyeingType: 'Reactive Dyeing' | 'Pigment Dyeing' | 'Disperse Dyeing' | 'Direct Dyeing' | 'Vat Dyeing' | 'Garment Dyeing' | 'Yarn Package Dyeing' | 'Piece Dyeing';
  machineType: 'Soft Flow Jet' | 'Jigger' | 'Pad-Steam' | 'Continuous Dyeing Range (CDR)' | 'Package Dyeing Vessel';
  minBatchKg: number;
  minBatchChargePkr: number;
  dyeCostPerKg: number;
  chemicalCostPerKg: number;
  utilitiesCostPerKg: number;
  labourOverheadPerKg: number;
  liquorRatio?: string;
  processWastePct: number;
  processYieldPct: number;
}

// 8. Printing Process Reference
export interface PrintingProcessReference extends BaseReferenceItem {
  category: 'printing';
  printingMethod: 'Rotary Screen Printing' | 'Digital Reactive Printing' | 'Digital Sublimation' | 'Khari / Metallic Print' | 'Hand Block Printing' | 'Flatbed Screen' | 'Pigment Printing' | 'Discharge Printing';
  maxColors?: number;
  inkCostPerMeter: number;
  screenCostPerColor: number;
  setupCostPerDesign: number;
  labourOverheadPerMeter: number;
  minBatchMeters: number;
  minBatchChargePkr: number;
  wastePct: number;
}

// 9. Finishing Process Reference
export interface FinishingProcessReference extends BaseReferenceItem {
  category: 'finishing';
  finishType: 'Silicone Soft Finish' | 'Resin / Easy-Care' | 'Stentering' | 'Compacting' | 'Sanforizing' | 'Calendering' | 'Mercerizing' | 'Bio-Polishing / Enzyme Wash' | 'Peach / Brushing Finish' | 'Water Repellent';
  machine: string;
  chemicalCostPerKg: number;
  energyLabourPerKg: number;
  shrinkageControlPct?: number;
  yieldPct: number;
}

// 10. Denim Wash Process Reference
export interface DenimWashReference extends BaseReferenceItem {
  category: 'denim_wash';
  washType: 'Stone Wash' | 'Enzyme Bio-Wash' | 'Bleach Wash' | 'Acid Wash' | 'Softener Silicone Wash' | 'Ozone Wash' | 'Laser Whisker / Scraping' | 'PP Spray' | 'Hand Scraping / 3D Whiskering';
  ratePerPiece: number;
  chemicalCostPerPiece: number;
  waterEnergyPerPiece: number;
  minBatchPieces: number;
}

// 11. Embroidery Reference
export interface EmbroideryReference extends BaseReferenceItem {
  category: 'embroidery';
  embroideryType: 'Multi-Head Computer' | 'Schiffli All-Over' | 'Aari Work' | 'Zardozi Hand' | 'Gota Patti' | 'Sequin / Spangle' | 'Thread Embroidery' | 'Cord / Ribbon';
  ratePer1000Stitches: number;
  stitchCountStandard?: number;
  headsCount?: number;
  machineRpm?: number;
  threadConsumptionMetersPer1000?: number;
  backingCostPerMeter?: number;
  setupChargePerDesign: number;
}

// 12. Percale Bed Set Product Reference (PCL)
export interface PercaleProductReference extends BaseReferenceItem {
  category: 'percale_product';
  subType: 'FABRIC' | 'FLAT_SHEET' | 'FITTED_SHEET' | 'PILLOWCASE' | 'COMPLETE_BED_SET';
  threadCountTier: 'T-180 (Budget/Hotel)' | 'T-200 (Standard 200 TC)' | 'T-250 (Luxury)' | 'T-300 (Ultra Premium)';
  fabricRefNo: string;
  specifications: {
    weave: '1/1 Plain';
    threadCount: number;
    warpCount: string;
    weftCount: string;
    construction: string; // e.g. '110x90'
    greigeWidthInches: number;
    finishedWidthInches: number;
    greigeGsm: number;
    finishedGsm: number;
    dimensions?: {
      flatSheet?: string; // '90 x 102 inches'
      fittedSheet?: string; // '60 x 80 + 15 inches pocket'
      pillowcases?: string; // '2x (20 x 30 + 4 inches hem)'
      tolerances?: string; // 'Sheets ±1", Pillowcases ±0.5"'
    };
    stitching?: {
      spi: string; // '10-12 SPI'
      threadSpec: string; // 'Tex 24-27 Poly Core-Spun (THR-002)'
      operations: string[];
    };
    trimsAndPacking?: {
      labels: string[];
      packagingType: string;
      cartonSpecs: string; // '5-ply export carton, 12 sets/carton'
    };
    qualityTargets?: {
      shrinkage: string; // '≤ 3% after 3 home washes'
      colorfastnessWashing: string; // 'Grade 4+'
      colorfastnessRubbing: string; // 'Dry 4, Wet 3'
      tensileStrength: string; // 'Warp 350 N, Weft 250 N'
      aqlInspection: string; // 'AQL 2.5 Major, 4.0 Minor | 4-Point ≤ 20 pts/100 sqyd'
    };
  };
}

export type TextileReferenceUnion = 
  | FibreReference
  | YarnReference
  | ThreadReference
  | WovenFabricReference
  | KnitFabricReference
  | MarketFabricReference
  | DyeingProcessReference
  | PrintingProcessReference
  | FinishingProcessReference
  | DenimWashReference
  | EmbroideryReference
  | PercaleProductReference
  | BaseReferenceItem;

// ==========================================
// BOQ (BILL OF QUANTITIES) DATA STRUCTURES
// ==========================================

export interface BOQLineItem {
  lineNo: number;
  refNo: string; // Ref No key linking to Reference Item
  category: ReferenceCategory;
  itemName: string;
  specification: string;
  quantity: number;
  unit: string;
  baseRate: number;
  rateOverride?: number;
  overrideUser?: string;
  overrideTimestamp?: string;
  overrideReason?: string;
  effectiveRate: number;
  currency: CurrencyCode;
  wastePct: number;
  yieldPct: number;
  extendedCost: number;
  confidence: RateConfidence;
  source: string;
  timestamp: string;
  notes: string;
}

export interface BOQSummaryCost {
  totalDirectMaterialCost: number;
  totalDirectProcessCost: number;
  totalTrimsAndPackingCost: number;
  totalLabourCost: number;
  subtotalCost: number;
  overheadPct: number;
  overheadAmount: number;
  marginPct: number;
  marginAmount: number;
  taxPct: number;
  taxAmount: number;
  finalTotalCost: number;
  costPerUnit: number;
  currency: CurrencyCode;
}

export interface BOQEstimate {
  id: string;
  title: string;
  productType: 'PERCALE_BED_SET' | 'LAWN_SUIT_3PC' | 'WOVEN_FABRIC_BATCH' | 'KNIT_GARMENT' | 'CUSTOM_PROJECT';
  targetBenchmarkRef?: string;
  orderQuantity: number;
  orderUnit: string;
  currency: CurrencyCode;
  lines: BOQLineItem[];
  summary: BOQSummaryCost;
  createdAt: string;
  updatedAt: string;
  isFrozenSnapshot?: boolean;
  notes?: string;
}
