import type {
  TextileReferenceUnion,
  ReferenceCategory,
  RateConfidence,
  FibreReference,
  YarnReference,
  ThreadReference,
  WovenFabricReference,
  DyeingProcessReference,
  PrintingProcessReference,
  FinishingProcessReference,
  EmbroideryReference,
  PercaleProductReference,
  BaseReferenceItem,
} from '../types/referenceTypes';
import type { CurrencyCode } from '../types';

const STORAGE_KEY = 'fabriciq_textile_reference_db_v2';

// Standard Pakistan Market Sources
const KCA_SOURCE = {
  sourceName: 'Karachi Cotton Association (KCA)',
  sourceUrl: 'https://kca.com.pk',
  publicationDate: '2026-09-28',
  retrievedAt: '2026-09-28T09:30:00Z',
  marketRegion: 'Karachi' as const,
};

const FSD_YARN_SOURCE = {
  sourceName: 'Faisalabad Yarn Merchants Association (FYMA)',
  sourceUrl: 'https://textilesbar.com/market-rates',
  publicationDate: '2026-09-28',
  retrievedAt: '2026-09-28T10:00:00Z',
  marketRegion: 'Faisalabad' as const,
};

const LHR_WEAVING_SOURCE = {
  sourceName: 'All Pakistan Textile Mills Association (APTMA) / Lahore Market',
  sourceUrl: 'https://aptma.org.pk',
  publicationDate: '2026-09-27',
  retrievedAt: '2026-09-28T08:15:00Z',
  marketRegion: 'Lahore' as const,
};

const IND_BENCHMARK = {
  sourceName: 'Industry Verified Benchmark Survey',
  publicationDate: '2026-09-26',
  retrievedAt: '2026-09-28T08:00:00Z',
  marketRegion: 'Pakistan Average' as const,
};

// Initial benchmark reference catalog
const INITIAL_REFERENCES: TextileReferenceUnion[] = [
  // ==========================================
  // 1. FIBRES (FIB)
  // ==========================================
  {
    id: 'fib-001',
    refNo: 'FIB-001',
    prefix: 'FIB',
    category: 'fibre',
    marketName: 'Raw Cotton Sindh / Punjab Grade A',
    standardName: 'Seed Cotton MNH-886 / CIM-598 (1-1/16")',
    description: 'Prime Pakistani upland cotton, staple length 28-29mm, Micronaire 3.8-4.5.',
    unit: 'maund',
    baseRate: 19500,
    currency: 'PKR',
    ratePerKg: 522.50,
    ratePerLb: 237.00,
    minRate: 18800,
    maxRate: 20200,
    midRate: 19500,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: KCA_SOURCE,
    rateHistory: [
      { timestamp: '2026-09-28T09:30:00Z', rate: 19500, currency: 'PKR', unit: 'maund', confidence: 'VERIFIED MARKET', source: 'KCA Official Spot Rate' },
      { timestamp: '2026-09-21T09:30:00Z', rate: 19200, currency: 'PKR', unit: 'maund', confidence: 'VERIFIED MARKET', source: 'KCA Official Spot Rate' }
    ],
    tags: ['cotton', 'fibre', 'raw cotton', 'kca', 'punjab', 'sindh'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T09:30:00Z',
    qualityScore: 98,
    fibreType: 'Cotton',
    stapleLengthMm: 28.5,
    micronaire: 4.2,
    strengthGpt: 29.5
  } as FibreReference,
  {
    id: 'fib-002',
    refNo: 'FIB-002',
    prefix: 'FIB',
    category: 'fibre',
    marketName: 'Polyester Staple Fibre (PSF) 1.2D',
    standardName: '1.2 Denier x 38mm Semi-Dull Virgin PSF',
    description: 'High-tenacity virgin polyester staple fibre for blending and spinning.',
    unit: 'kg',
    baseRate: 355.00,
    currency: 'PKR',
    ratePerKg: 355.00,
    ratePerLb: 161.02,
    minRate: 345.00,
    maxRate: 365.00,
    midRate: 355.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: IND_BENCHMARK,
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 355.00, currency: 'PKR', unit: 'kg', confidence: 'VERIFIED MARKET', source: 'Domestic Producer Price List' }],
    tags: ['polyester', 'psf', 'synthetic', 'blending'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 95,
    fibreType: 'Polyester',
    stapleLengthMm: 38.0
  } as FibreReference,
  {
    id: 'fib-003',
    refNo: 'FIB-003',
    prefix: 'FIB',
    category: 'fibre',
    marketName: 'Viscose Staple Fibre (VSF) 1.5D',
    standardName: '1.5 Denier x 38mm Bright Viscose Rayon',
    description: 'Regenerated cellulose staple fibre with silky drape and high moisture absorbency.',
    unit: 'kg',
    baseRate: 460.00,
    currency: 'PKR',
    ratePerKg: 460.00,
    ratePerLb: 208.65,
    minRate: 445.00,
    maxRate: 475.00,
    midRate: 460.00,
    confidence: 'MARKET QUOTE',
    costingMethod: 'PER_UNIT',
    sourceInfo: IND_BENCHMARK,
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 460.00, currency: 'PKR', unit: 'kg', confidence: 'MARKET QUOTE', source: 'Import Indent Indication' }],
    tags: ['viscose', 'vsf', 'rayon', 'cellulosic'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 92,
    fibreType: 'Viscose',
    stapleLengthMm: 38.0
  } as FibreReference,

  // ==========================================
  // 2. YARN DATABASE (YRN)
  // ==========================================
  {
    id: 'yrn-001',
    refNo: 'YRN-001',
    prefix: 'YRN',
    category: 'yarn',
    marketName: '40s Combed Cotton Yarn (Local)',
    standardName: 'Ne 40/1 100% Combed Cotton Ring Spun',
    description: 'High-grade combed cotton yarn for fine lawn, cambric, and luxury sheeting (200+ TC).',
    unit: 'bag', // 10 lbs or 100 lbs
    baseRate: 3450.00, // per 10-lb pack (Rs 760.59/kg)
    currency: 'PKR',
    ratePerKg: 760.59,
    ratePerLb: 345.00,
    minRate: 3380.00,
    maxRate: 3520.00,
    midRate: 3450.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: FSD_YARN_SOURCE,
    rateHistory: [
      { timestamp: '2026-09-28T10:00:00Z', rate: 3450.00, currency: 'PKR', unit: 'bag_10lb', confidence: 'VERIFIED MARKET', source: 'Faisalabad Yarn Market' },
      { timestamp: '2026-09-20T10:00:00Z', rate: 3400.00, currency: 'PKR', unit: 'bag_10lb', confidence: 'VERIFIED MARKET', source: 'Faisalabad Yarn Market' }
    ],
    tags: ['40s', 'combed', 'cotton', 'lawn', 'percale', 'fine yarn'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
    qualityScore: 100,
    fibreComposition: '100% Cotton',
    yarnType: 'Combed',
    spinningMethod: 'Ring Spun',
    count: 40,
    countSystem: 'Ne',
    ply: 1,
    colour: 'Raw White / Ecru',
    supplierVendor: 'Kohinoor / Crescent / Master Mills'
  } as YarnReference,
  {
    id: 'yrn-002',
    refNo: 'YRN-002',
    prefix: 'YRN',
    category: 'yarn',
    marketName: '40s Compact Combed Cotton Yarn (Premium)',
    standardName: 'Ne 40/1 Compact Spun 100% Combed Cotton',
    description: 'Ultra-low hairiness compact combed cotton for export-grade 200-300 TC percale and satin.',
    unit: 'bag',
    baseRate: 3650.00,
    currency: 'PKR',
    ratePerKg: 804.68,
    ratePerLb: 365.00,
    minRate: 3580.00,
    maxRate: 3720.00,
    midRate: 3650.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: FSD_YARN_SOURCE,
    rateHistory: [{ timestamp: '2026-09-28T10:00:00Z', rate: 3650.00, currency: 'PKR', unit: 'bag_10lb', confidence: 'VERIFIED MARKET', source: 'Faisalabad Yarn Exchange' }],
    tags: ['40s', 'compact', 'combed', 'export', 'percale'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
    qualityScore: 100,
    fibreComposition: '100% Cotton',
    yarnType: 'Compact',
    spinningMethod: 'Compact Spun',
    count: 40,
    countSystem: 'Ne',
    ply: 1,
    colour: 'Raw White / Ecru'
  } as YarnReference,
  {
    id: 'yrn-003',
    refNo: 'YRN-003',
    prefix: 'YRN',
    category: 'yarn',
    marketName: '30s Carded Cotton Yarn',
    standardName: 'Ne 30/1 100% Carded Ring Spun Cotton',
    description: 'Standard medium count yarn for latha, sheeting, and mid-weight shirting.',
    unit: 'bag',
    baseRate: 2950.00,
    currency: 'PKR',
    ratePerKg: 650.36,
    ratePerLb: 295.00,
    minRate: 2900.00,
    maxRate: 3020.00,
    midRate: 2950.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: FSD_YARN_SOURCE,
    rateHistory: [{ timestamp: '2026-09-28T10:00:00Z', rate: 2950.00, currency: 'PKR', unit: 'bag_10lb', confidence: 'VERIFIED MARKET', source: 'Faisalabad Market' }],
    tags: ['30s', 'carded', 'cotton', 'latha', 'sheeting'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
    qualityScore: 96,
    fibreComposition: '100% Cotton',
    yarnType: 'Carded',
    spinningMethod: 'Ring Spun',
    count: 30,
    countSystem: 'Ne',
    ply: 1,
    colour: 'Raw White / Ecru'
  } as YarnReference,
  {
    id: 'yrn-004',
    refNo: 'YRN-004',
    prefix: 'YRN',
    category: 'yarn',
    marketName: '20s Carded Cotton Yarn',
    standardName: 'Ne 20/1 100% Carded Ring Spun Cotton',
    description: 'Heavy coarse yarn for heavy sheetings, canvas, twills, and home textiles.',
    unit: 'bag',
    baseRate: 2850.00,
    currency: 'PKR',
    ratePerKg: 628.31,
    ratePerLb: 285.00,
    minRate: 2800.00,
    maxRate: 2900.00,
    midRate: 2850.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: FSD_YARN_SOURCE,
    rateHistory: [{ timestamp: '2026-09-28T10:00:00Z', rate: 2850.00, currency: 'PKR', unit: 'bag_10lb', confidence: 'VERIFIED MARKET', source: 'Faisalabad Market' }],
    tags: ['20s', 'carded', 'cotton', 'coarse', 'twill', 'heavy sheeting'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
    qualityScore: 98,
    fibreComposition: '100% Cotton',
    yarnType: 'Carded',
    spinningMethod: 'Ring Spun',
    count: 20,
    countSystem: 'Ne',
    ply: 1,
    colour: 'Raw White / Ecru'
  } as YarnReference,
  {
    id: 'yrn-005',
    refNo: 'YRN-005',
    prefix: 'YRN',
    category: 'yarn',
    marketName: '10s Open End (OE) Yarn',
    standardName: 'Ne 10/1 Rotor Spun Open End Cotton',
    description: 'Coarse rotor spun yarn for denim weft, flannel back, and heavy canvas.',
    unit: 'bag',
    baseRate: 2250.00,
    currency: 'PKR',
    ratePerKg: 496.04,
    ratePerLb: 225.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: FSD_YARN_SOURCE,
    rateHistory: [{ timestamp: '2026-09-28T10:00:00Z', rate: 2250.00, currency: 'PKR', unit: 'bag_10lb', confidence: 'VERIFIED MARKET', source: 'FSD Open End Yard' }],
    tags: ['10s', 'oe', 'open end', 'rotor', 'denim'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
    qualityScore: 94,
    fibreComposition: '100% Cotton',
    yarnType: 'Open End (OE)',
    spinningMethod: 'Rotor / Open End',
    count: 10,
    countSystem: 'Ne',
    ply: 1,
    colour: 'Raw White / Ecru'
  } as YarnReference,
  {
    id: 'yrn-006',
    refNo: 'YRN-006',
    prefix: 'YRN',
    category: 'yarn',
    marketName: '30s PC 52:48 Blended Yarn',
    standardName: 'Ne 30/1 Poly Cotton 52% Poly / 48% Cotton Ring Spun',
    description: 'Blended yarn for budget/hotel T-180 bed sheets and institutional linens.',
    unit: 'bag',
    baseRate: 2650.00,
    currency: 'PKR',
    ratePerKg: 584.22,
    ratePerLb: 265.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: FSD_YARN_SOURCE,
    rateHistory: [{ timestamp: '2026-09-28T10:00:00Z', rate: 2650.00, currency: 'PKR', unit: 'bag_10lb', confidence: 'VERIFIED MARKET', source: 'FSD Yarn Trade' }],
    tags: ['30s', 'pc', 'poly cotton', 't180', 'hotel'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
    qualityScore: 96,
    fibreComposition: '52% Polyester / 48% Cotton',
    yarnType: 'Ring Spun',
    spinningMethod: 'Ring Spun',
    count: 30,
    countSystem: 'Ne',
    ply: 1,
    colour: 'Raw White / Ecru'
  } as YarnReference,
  {
    id: 'yrn-007',
    refNo: 'YRN-007',
    prefix: 'YRN',
    category: 'yarn',
    marketName: '60s Combed Compact Yarn',
    standardName: 'Ne 60/1 Compact Spun 100% Long Staple Cotton',
    description: 'Super-fine yarn for luxury T-300 satin bed linen and ultra-fine summer voile.',
    unit: 'bag',
    baseRate: 5200.00,
    currency: 'PKR',
    ratePerKg: 1146.40,
    ratePerLb: 520.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: FSD_YARN_SOURCE,
    rateHistory: [{ timestamp: '2026-09-28T10:00:00Z', rate: 5200.00, currency: 'PKR', unit: 'bag_10lb', confidence: 'VERIFIED MARKET', source: 'FSD Special Yarn' }],
    tags: ['60s', 'compact', 'combed', 't300', 'luxury'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
    qualityScore: 95,
    fibreComposition: '100% Cotton',
    yarnType: 'Compact',
    spinningMethod: 'Compact Spun',
    count: 60,
    countSystem: 'Ne',
    ply: 1,
    colour: 'Raw White / Ecru'
  } as YarnReference,
  {
    id: 'yrn-008',
    refNo: 'YRN-008',
    prefix: 'YRN',
    category: 'yarn',
    marketName: '75D/36F DTY Polyester Filament',
    standardName: '75 Denier / 36 Filament Draw Textured Yarn (DTY)',
    description: 'Texturized continuous filament yarn for chiffon, georgette, and synthetic weaves.',
    unit: 'kg',
    baseRate: 410.00,
    currency: 'PKR',
    ratePerKg: 410.00,
    ratePerLb: 185.97,
    confidence: 'MARKET QUOTE',
    costingMethod: 'PER_UNIT',
    sourceInfo: IND_BENCHMARK,
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 410.00, currency: 'PKR', unit: 'kg', confidence: 'MARKET QUOTE', source: 'Polyester Filament Quote' }],
    tags: ['75d', 'dty', 'polyester', 'filament', 'chiffon'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 92,
    fibreComposition: '100% Polyester',
    yarnType: 'DTY',
    spinningMethod: 'Filament Texturized',
    count: 75,
    countSystem: 'Denier',
    ply: 1,
    colour: 'Raw White / Ecru'
  } as YarnReference,

  // ==========================================
  // 3. THREAD DATABASE (THR)
  // ==========================================
  {
    id: 'thr-001',
    refNo: 'THR-001',
    prefix: 'THR',
    category: 'thread',
    marketName: '100% Spun Poly Sewing Thread Ticket 120',
    standardName: 'Ticket 120 / Tex 27 2-Ply 100% Spun Polyester (5,000m Cone)',
    description: 'Universal apparel and light home textile lockstitch sewing thread.',
    unit: 'cone', // 5000m
    baseRate: 240.00,
    currency: 'PKR',
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: IND_BENCHMARK,
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 240.00, currency: 'PKR', unit: 'cone_5000m', confidence: 'VERIFIED MARKET', source: 'Thread Supplier Price List' }],
    tags: ['thread', 'sewing', 'ticket 120', 'tex 27', 'lockstitch'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 98,
    threadType: '100% Spun Polyester',
    texNumber: 27,
    ticketNumber: '120',
    ply: 2
  } as ThreadReference,
  {
    id: 'thr-002',
    refNo: 'THR-002',
    prefix: 'THR',
    category: 'thread',
    marketName: 'Poly-Core Spun High-Strength Sewing Thread Ticket 80',
    standardName: 'Ticket 80 / Tex 35 Polyester Filament Core with Cotton/Poly Wrap (5,000m)',
    description: 'High-speed industrial thread required for automated percale bed set hem stitching (10-12 SPI).',
    unit: 'cone',
    baseRate: 380.00,
    currency: 'PKR',
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: IND_BENCHMARK,
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 380.00, currency: 'PKR', unit: 'cone_5000m', confidence: 'VERIFIED MARKET', source: 'Coats / Astra Benchmark' }],
    tags: ['thread', 'poly core', 'ticket 80', 'percale', 'high strength'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 100,
    threadType: 'Poly-core spun',
    texNumber: 35,
    ticketNumber: '80',
    ply: 2
  } as ThreadReference,
  {
    id: 'thr-003',
    refNo: 'THR-003',
    prefix: 'THR',
    category: 'thread',
    marketName: 'Viscose Rayon Embroidery Thread 120D/2',
    standardName: '120 Denier / 2-Ply Bright Viscose Embroidery Filament (4,000m)',
    description: 'High sheen, multi-head computer embroidery thread for Pakistani lawn suit motifs.',
    unit: 'cone',
    baseRate: 310.00,
    currency: 'PKR',
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: IND_BENCHMARK,
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 310.00, currency: 'PKR', unit: 'cone_4000m', confidence: 'VERIFIED MARKET', source: 'Embroidery Supply Wholesale' }],
    tags: ['thread', 'embroidery', 'viscose', '120d', 'lawn suit'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 96,
    threadType: 'Embroidery Viscose',
    denier: 120,
    ply: 2
  } as ThreadReference,

  // ==========================================
  // 4. WOVEN FABRICS (FAB-W)
  // ==========================================
  {
    id: 'fab-w-001',
    refNo: 'FAB-W-001',
    prefix: 'FAB-W',
    category: 'woven_fabric',
    marketName: 'Lawn Standard 90×70 / 40×40',
    standardName: '100% Cotton Lawn 90×70 / 40s×40s (48" Greige / 44" Finished)',
    description: 'The quintessential Pakistani summer dress lawn fabric. Lightweight, breathable plain weave.',
    unit: 'meter',
    baseRate: 165.00,
    currency: 'PKR',
    ratePerMeter: 165.00,
    minRate: 158.00,
    maxRate: 172.00,
    midRate: 165.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'CONSTRUCTION',
    sourceInfo: LHR_WEAVING_SOURCE,
    dependencies: ['YRN-001'],
    rateHistory: [{ timestamp: '2026-09-28T08:15:00Z', rate: 165.00, currency: 'PKR', unit: 'meter', confidence: 'VERIFIED MARKET', source: 'Faisalabad Air Jet Loom Rate' }],
    tags: ['lawn', 'woven', '40s', '90x70', 'summer suit', 'fabric'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:15:00Z',
    qualityScore: 100,
    weave: 'Plain 1/1',
    warpCountNe: 40,
    weftCountNe: 40,
    warpYarnRefNo: 'YRN-001',
    weftYarnRefNo: 'YRN-001',
    warpYarnType: '40s Combed Cotton',
    weftYarnType: '40s Combed Cotton',
    epi: 90,
    ppi: 70,
    greigeWidthInches: 48,
    finishedWidthInches: 44,
    greigeGsm: 75,
    finishedGsm: 82,
    warpCrimpPct: 6.5,
    weftCrimpPct: 5.0,
    warpWastePct: 2.0,
    weftWastePct: 2.0,
    weavingEfficiencyPct: 92,
    weavingRatePerPick: 0.16,
    shrinkagePct: { warp: 3.0, weft: 2.5 }
  } as WovenFabricReference,
  {
    id: 'fab-w-002',
    refNo: 'FAB-W-002',
    prefix: 'FAB-W',
    category: 'woven_fabric',
    marketName: 'Lawn Luxury Compact 100×80 / 40×40',
    standardName: '100% Compact Combed Cotton Lawn 100×80 / 40s×40s (54" Greige)',
    description: 'High-density designer lawn with ultra-smooth digital printing surface and silk finish.',
    unit: 'meter',
    baseRate: 198.00,
    currency: 'PKR',
    ratePerMeter: 198.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'CONSTRUCTION',
    sourceInfo: LHR_WEAVING_SOURCE,
    dependencies: ['YRN-002'],
    rateHistory: [{ timestamp: '2026-09-28T08:15:00Z', rate: 198.00, currency: 'PKR', unit: 'meter', confidence: 'VERIFIED MARKET', source: 'Lahore Weaving Broker' }],
    tags: ['lawn', 'compact', 'luxury lawn', '100x80'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:15:00Z',
    qualityScore: 98,
    weave: 'Plain 1/1',
    warpCountNe: 40,
    weftCountNe: 40,
    warpYarnRefNo: 'YRN-002',
    weftYarnRefNo: 'YRN-002',
    warpYarnType: '40s Compact Cotton',
    weftYarnType: '40s Compact Cotton',
    epi: 100,
    ppi: 80,
    greigeWidthInches: 54,
    finishedWidthInches: 50,
    greigeGsm: 88,
    finishedGsm: 94,
    warpCrimpPct: 6.8,
    weftCrimpPct: 5.2,
    warpWastePct: 2.0,
    weftWastePct: 2.0,
    weavingEfficiencyPct: 90,
    shrinkagePct: { warp: 2.5, weft: 2.0 }
  } as WovenFabricReference,
  {
    id: 'fab-w-003',
    refNo: 'FAB-W-003',
    prefix: 'FAB-W',
    category: 'woven_fabric',
    marketName: 'Cambric Standard 68×68 / 40×40',
    standardName: '100% Cotton Cambric 68×68 / 40s×40s (52" Greige / 48" Finished)',
    description: 'Medium-density smooth plain weave widely used for dyed trouser fabric in 3-piece suits.',
    unit: 'meter',
    baseRate: 145.00,
    currency: 'PKR',
    ratePerMeter: 145.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'CONSTRUCTION',
    sourceInfo: LHR_WEAVING_SOURCE,
    dependencies: ['YRN-001'],
    rateHistory: [{ timestamp: '2026-09-28T08:15:00Z', rate: 145.00, currency: 'PKR', unit: 'meter', confidence: 'VERIFIED MARKET', source: 'Faisalabad Market' }],
    tags: ['cambric', 'trouser', '40s', 'suit component'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:15:00Z',
    qualityScore: 98,
    weave: 'Plain 1/1',
    warpCountNe: 40,
    weftCountNe: 40,
    warpYarnRefNo: 'YRN-001',
    weftYarnRefNo: 'YRN-001',
    warpYarnType: '40s Combed Cotton',
    weftYarnType: '40s Combed Cotton',
    epi: 68,
    ppi: 68,
    greigeWidthInches: 52,
    finishedWidthInches: 48,
    greigeGsm: 82,
    finishedGsm: 90,
    warpCrimpPct: 6.0,
    weftCrimpPct: 5.0,
    warpWastePct: 2.0,
    weftWastePct: 2.0,
    weavingEfficiencyPct: 93,
    shrinkagePct: { warp: 3.0, weft: 2.5 }
  } as WovenFabricReference,
  {
    id: 'fab-w-004',
    refNo: 'FAB-W-004',
    prefix: 'FAB-W',
    category: 'woven_fabric',
    marketName: 'Percale 200 TC Greige Fabric (110" Width)',
    standardName: '100% Combed Cotton Percale Plain Weave 110×90 / 40s×40s (110" Greige)',
    description: 'Export benchmark 200 Thread Count wide-width bed linen fabric. Crisp, cool, matte hand feel.',
    unit: 'meter',
    baseRate: 310.00,
    currency: 'PKR',
    ratePerMeter: 310.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'CONSTRUCTION',
    sourceInfo: LHR_WEAVING_SOURCE,
    dependencies: ['YRN-001'],
    rateHistory: [{ timestamp: '2026-09-28T08:15:00Z', rate: 310.00, currency: 'PKR', unit: 'meter', confidence: 'VERIFIED MARKET', source: 'APTMA Bed Linen Export Benchmark' }],
    tags: ['percale', '200tc', 'bedding', '110 inch', 'export'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:15:00Z',
    qualityScore: 100,
    weave: 'Plain 1/1',
    warpCountNe: 40,
    weftCountNe: 40,
    warpYarnRefNo: 'YRN-001',
    weftYarnRefNo: 'YRN-001',
    warpYarnType: '40s Combed Cotton',
    weftYarnType: '40s Combed Cotton',
    epi: 110,
    ppi: 90,
    greigeWidthInches: 110,
    finishedWidthInches: 104,
    greigeGsm: 125,
    finishedGsm: 140,
    warpCrimpPct: 7.2,
    weftCrimpPct: 5.8,
    warpWastePct: 2.5,
    weftWastePct: 2.5,
    weavingEfficiencyPct: 88,
    shrinkagePct: { warp: 2.8, weft: 2.2 }
  } as WovenFabricReference,
  {
    id: 'fab-w-005',
    refNo: 'FAB-W-005',
    prefix: 'FAB-W',
    category: 'woven_fabric',
    marketName: 'Chiffon Georgette 100D×100D High Twist',
    standardName: '100% Polyester Chiffon Georgette 100D x 100D (44" Finished)',
    description: 'Lightweight sheer textured dupatta fabric for lawn suit ensembles.',
    unit: 'meter',
    baseRate: 92.00,
    currency: 'PKR',
    ratePerMeter: 92.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'MARKET_PURCHASE',
    sourceInfo: LHR_WEAVING_SOURCE,
    dependencies: ['YRN-008'],
    rateHistory: [{ timestamp: '2026-09-28T08:15:00Z', rate: 92.00, currency: 'PKR', unit: 'meter', confidence: 'VERIFIED MARKET', source: 'Lahore Azam Market' }],
    tags: ['chiffon', 'dupatta', 'georgette', 'suit component'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:15:00Z',
    qualityScore: 94,
    weave: 'Plain 1/1',
    warpCountNe: 30, // equivalent
    weftCountNe: 30,
    warpYarnType: '75D/36F DTY Polyester',
    weftYarnType: '75D/36F DTY Polyester',
    epi: 80,
    ppi: 70,
    greigeWidthInches: 48,
    finishedWidthInches: 44,
    greigeGsm: 58,
    finishedGsm: 64,
    warpCrimpPct: 8.0,
    weftCrimpPct: 8.0,
    warpWastePct: 2.0,
    weftWastePct: 2.0,
    weavingEfficiencyPct: 90,
    shrinkagePct: { warp: 1.5, weft: 1.5 }
  } as WovenFabricReference,

  // ==========================================
  // 5. DYEING PROCESS (DYE)
  // ==========================================
  {
    id: 'dye-001',
    refNo: 'DYE-001',
    prefix: 'DYE',
    category: 'dyeing',
    marketName: 'Reactive Dyeing (Light / Medium Shades)',
    standardName: 'Continuous / Pad-Steam Reactive Dyeing for 100% Cotton',
    description: 'High-fastness reactive dyeing for lawn, cambric, and percale sheeting.',
    unit: 'meter',
    baseRate: 38.00,
    currency: 'PKR',
    ratePerMeter: 38.00,
    ratePerKg: 190.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PROCESS_BATCH',
    sourceInfo: IND_BENCHMARK,
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 38.00, currency: 'PKR', unit: 'meter', confidence: 'VERIFIED MARKET', source: 'Faisalabad Processing Mill Rate' }],
    tags: ['dyeing', 'reactive', 'cotton', 'pad-steam', 'colourfast'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 98,
    dyeingType: 'Reactive Dyeing',
    machineType: 'Pad-Steam',
    minBatchKg: 500,
    minBatchChargePkr: 25000,
    dyeCostPerKg: 95.00,
    chemicalCostPerKg: 45.00,
    utilitiesCostPerKg: 30.00,
    labourOverheadPerKg: 20.00,
    processWastePct: 3.5,
    processYieldPct: 96.5
  } as DyeingProcessReference,

  // ==========================================
  // 6. PRINTING PROCESS (PRT)
  // ==========================================
  {
    id: 'prt-001',
    refNo: 'PRT-001',
    prefix: 'PRT',
    category: 'printing',
    marketName: 'Rotary Screen Printing (Pigment / Reactive up to 8 Colours)',
    standardName: 'Rotary Screen Printing on Continuous Range',
    description: 'Cost-effective high-volume print runs for commercial lawn suits and bed sheets.',
    unit: 'meter',
    baseRate: 32.00,
    currency: 'PKR',
    ratePerMeter: 32.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PROCESS_BATCH',
    sourceInfo: IND_BENCHMARK,
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 32.00, currency: 'PKR', unit: 'meter', confidence: 'VERIFIED MARKET', source: 'Faisalabad Print House Standard' }],
    tags: ['printing', 'rotary', 'pigment', 'volume'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 96,
    printingMethod: 'Rotary Screen Printing',
    maxColors: 8,
    inkCostPerMeter: 14.00,
    screenCostPerColor: 6500.00,
    setupCostPerDesign: 12000.00,
    labourOverheadPerMeter: 18.00,
    minBatchMeters: 3000,
    minBatchChargePkr: 45000,
    wastePct: 4.0
  } as PrintingProcessReference,
  {
    id: 'prt-002',
    refNo: 'PRT-002',
    prefix: 'PRT',
    category: 'printing',
    marketName: 'Digital Reactive Printing (High Resolution 1200 DPI)',
    standardName: 'Industrial Kyocera High-Speed Digital Reactive Printing on Lawn/Cotton',
    description: 'Photorealistic designer printing for luxury 3-piece lawn suits with unlimited colours and sharp gradients.',
    unit: 'meter',
    baseRate: 185.00,
    currency: 'PKR',
    ratePerMeter: 185.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: IND_BENCHMARK,
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 185.00, currency: 'PKR', unit: 'meter', confidence: 'VERIFIED MARKET', source: 'Lahore / Karachi Digital Print House Rate' }],
    tags: ['printing', 'digital', 'reactive', 'designer lawn', '1200 dpi'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 100,
    printingMethod: 'Digital Reactive Printing',
    inkCostPerMeter: 110.00,
    screenCostPerColor: 0,
    setupCostPerDesign: 3500.00,
    labourOverheadPerMeter: 75.00,
    minBatchMeters: 50,
    minBatchChargePkr: 5000,
    wastePct: 2.0
  } as PrintingProcessReference,

  // ==========================================
  // 7. FINISHING PROCESS (FIN)
  // ==========================================
  {
    id: 'fin-001',
    refNo: 'FIN-001',
    prefix: 'FIN',
    category: 'finishing',
    marketName: 'Silicone Soft Hand Feel + Stenter Finish',
    standardName: 'Micro-Emulsion Silicone Softener Stenter Finishing Range',
    description: 'Imparts a silky, luxurious drape to lawn fabrics and smooth softness to percale sheets.',
    unit: 'meter',
    baseRate: 18.00,
    currency: 'PKR',
    ratePerMeter: 18.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PROCESS_BATCH',
    sourceInfo: IND_BENCHMARK,
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 18.00, currency: 'PKR', unit: 'meter', confidence: 'VERIFIED MARKET', source: 'Finishing Mill Rate' }],
    tags: ['finishing', 'silicone', 'stenter', 'soft hand feel'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 98,
    finishType: 'Silicone Soft Finish',
    machine: '8-Chamber Monforts Stenter',
    chemicalCostPerKg: 35.00,
    energyLabourPerKg: 25.00,
    shrinkageControlPct: 2.5,
    yieldPct: 98.0
  } as FinishingProcessReference,
  {
    id: 'fin-002',
    refNo: 'FIN-002',
    prefix: 'FIN',
    category: 'finishing',
    marketName: 'Sanforizing Pre-Shrunk Finish (Zero-Zero)',
    standardName: 'Sanforizing Rubber Belt Compressive Shrinkage Control',
    description: 'Guarantees ≤3% residual shrinkage after multiple domestic washes on percale bed sets.',
    unit: 'meter',
    baseRate: 15.00,
    currency: 'PKR',
    ratePerMeter: 15.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PROCESS_BATCH',
    sourceInfo: IND_BENCHMARK,
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 15.00, currency: 'PKR', unit: 'meter', confidence: 'VERIFIED MARKET', source: 'Export Processing Standard' }],
    tags: ['finishing', 'sanforize', 'pre-shrunk', 'zero-zero', 'percale'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 98,
    finishType: 'Sanforizing',
    machine: 'Monforts Rubber Belt Sanforizer',
    chemicalCostPerKg: 10.00,
    energyLabourPerKg: 20.00,
    shrinkageControlPct: 3.0,
    yieldPct: 97.0
  } as FinishingProcessReference,

  // ==========================================
  // 8. EMBROIDERY (EMB)
  // ==========================================
  {
    id: 'emb-001',
    refNo: 'EMB-001',
    prefix: 'EMB',
    category: 'embroidery',
    marketName: 'Multi-Head Computerized Thread Embroidery',
    standardName: 'Multi-Head Schiffli / Tajima Embroidery at 850 RPM (Rate per 1,000 Stitches)',
    description: 'Designer neckline, daman patches, and sleeve borders for unstitched Pakistani 3-piece lawn suits.',
    unit: '1000_stitches',
    baseRate: 0.45,
    currency: 'PKR',
    confidence: 'VERIFIED MARKET',
    costingMethod: 'PER_UNIT',
    sourceInfo: IND_BENCHMARK,
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 0.45, currency: 'PKR', unit: '1000_stitches', confidence: 'VERIFIED MARKET', source: 'Lahore / FSD Embroidery Industry Rate' }],
    tags: ['embroidery', 'computer', 'neckline', 'daman', 'lawn suit', 'tajima'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 100,
    embroideryType: 'Multi-Head Computer',
    ratePer1000Stitches: 0.45,
    stitchCountStandard: 80000,
    headsCount: 20,
    machineRpm: 850,
    threadConsumptionMetersPer1000: 4.8,
    backingCostPerMeter: 12.00,
    setupChargePerDesign: 1500.00
  } as EmbroideryReference,

  // ==========================================
  // 9. PERCALE BED SET STRUCTURED REFERENCES (PCL)
  // ==========================================
  {
    id: 'pcl-f-003',
    refNo: 'PCL-F-003',
    prefix: 'PCL',
    category: 'percale_product',
    marketName: 'Percale 200 TC Finished Fabric (104" Finished Width)',
    standardName: '100% Combed Cotton 40s x 40s / 110x90 200 TC Finished Bedding Fabric',
    description: 'Finished wide-width bedding fabric (Desize -> Scour -> Bleach -> Optic White -> Silicone Soft -> Sanforize).',
    unit: 'meter',
    baseRate: 410.00,
    currency: 'PKR',
    ratePerMeter: 410.00,
    confidence: 'VERIFIED MARKET',
    costingMethod: 'CONSTRUCTION',
    sourceInfo: IND_BENCHMARK,
    dependencies: ['FAB-W-004', 'DYE-001', 'FIN-001', 'FIN-002'],
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 410.00, currency: 'PKR', unit: 'meter', confidence: 'VERIFIED MARKET', source: 'Export Bed Linen Cost Model' }],
    tags: ['percale', '200tc', 'bedding', 'finished fabric', 'pcl-f-003'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 100,
    subType: 'FABRIC',
    threadCountTier: 'T-200 (Standard 200 TC)',
    fabricRefNo: 'FAB-W-004',
    specifications: {
      weave: '1/1 Plain',
      threadCount: 200,
      warpCount: '40s Combed',
      weftCount: '40s Combed',
      construction: '110x90',
      greigeWidthInches: 110,
      finishedWidthInches: 104,
      greigeGsm: 125,
      finishedGsm: 140,
      qualityTargets: {
        shrinkage: '≤ 3% after 3 home washes',
        colorfastnessWashing: 'Grade 4+',
        colorfastnessRubbing: 'Dry 4, Wet 3',
        tensileStrength: 'Warp 350 N, Weft 250 N',
        aqlInspection: 'AQL 2.5 Major, 4.0 Minor | 4-Point ≤ 20 pts/100 sqyd'
      }
    }
  } as PercaleProductReference,
  {
    id: 'pcl-m-003',
    refNo: 'PCL-M-003',
    prefix: 'PCL',
    category: 'percale_product',
    marketName: 'Percale 200 TC Flat Sheet (90" × 102")',
    standardName: 'Flat Sheet 90 x 102 inches, 4" Top Hem, 0.5" Side/Bottom Hems (10-12 SPI)',
    description: 'Queen / King flat sheet cut from PCL-F-003 with lockstitch hems and poly-core thread (THR-002).',
    unit: 'piece',
    baseRate: 1280.00,
    currency: 'PKR',
    confidence: 'VERIFIED MARKET',
    costingMethod: 'CONSTRUCTION',
    sourceInfo: IND_BENCHMARK,
    dependencies: ['PCL-F-003', 'THR-002'],
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 1280.00, currency: 'PKR', unit: 'piece', confidence: 'VERIFIED MARKET', source: 'Export Bed Set Manufacturing Model' }],
    tags: ['flat sheet', 'percale', '200tc', 'bedding', 'pcl-m-003'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 100,
    subType: 'FLAT_SHEET',
    threadCountTier: 'T-200 (Standard 200 TC)',
    fabricRefNo: 'PCL-F-003',
    specifications: {
      weave: '1/1 Plain',
      threadCount: 200,
      warpCount: '40s Combed',
      weftCount: '40s Combed',
      construction: '110x90',
      greigeWidthInches: 110,
      finishedWidthInches: 104,
      greigeGsm: 125,
      finishedGsm: 140,
      dimensions: {
        flatSheet: '90 x 102 inches (Cut length: 2.85 m)',
        tolerances: 'Sheets ±1 inch'
      },
      stitching: {
        spi: '10-12 SPI',
        threadSpec: 'Tex 24-27 Poly Core-Spun (THR-002)',
        operations: ['Lockstitch 4" top hem', 'Lockstitch 0.5" side and bottom hems']
      }
    }
  } as PercaleProductReference,
  {
    id: 'pcl-m-006',
    refNo: 'PCL-M-006',
    prefix: 'PCL',
    category: 'percale_product',
    marketName: 'Percale 200 TC Fitted Sheet (60" × 80" + 15" Pocket)',
    standardName: 'Fitted Sheet 60 x 80 + 15" Pocket with All-Around 4m 3/4" Elastic',
    description: 'Deep-pocket fitted sheet with overlocked corners, bar-tack reinforcements, and all-around elastication.',
    unit: 'piece',
    baseRate: 1480.00,
    currency: 'PKR',
    confidence: 'VERIFIED MARKET',
    costingMethod: 'CONSTRUCTION',
    sourceInfo: IND_BENCHMARK,
    dependencies: ['PCL-F-003', 'THR-002'],
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 1480.00, currency: 'PKR', unit: 'piece', confidence: 'VERIFIED MARKET', source: 'Export Bed Set Manufacturing Model' }],
    tags: ['fitted sheet', 'percale', '200tc', 'elastic', 'pcl-m-006'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 100,
    subType: 'FITTED_SHEET',
    threadCountTier: 'T-200 (Standard 200 TC)',
    fabricRefNo: 'PCL-F-003',
    specifications: {
      weave: '1/1 Plain',
      threadCount: 200,
      warpCount: '40s Combed',
      weftCount: '40s Combed',
      construction: '110x90',
      greigeWidthInches: 110,
      finishedWidthInches: 104,
      greigeGsm: 125,
      finishedGsm: 140,
      dimensions: {
        fittedSheet: '60 x 80 inches + 15 inches pocket (Cut length: 3.10 m)',
        tolerances: 'Sheets ±1 inch'
      },
      stitching: {
        spi: '10-12 SPI',
        threadSpec: 'Tex 24-27 Poly Core-Spun (THR-002)',
        operations: ['Overlock 4 corner seams', 'Bar-tack corner stress points', 'All-around 3/4" elastic hem encapsulation']
      }
    }
  } as PercaleProductReference,
  {
    id: 'pcl-m-008',
    refNo: 'PCL-M-008',
    prefix: 'PCL',
    category: 'percale_product',
    marketName: 'Percale 200 TC Pillowcase Pair (20" × 30" + 4" Hem)',
    standardName: 'Pillowcase Pair (Set of 2), 20 x 30 inches with 4" Flap / Hem',
    description: 'Matching pillowcase pair cut from PCL-F-003 with double-needle 4" hem stitching.',
    unit: 'pair',
    baseRate: 780.00,
    currency: 'PKR',
    confidence: 'VERIFIED MARKET',
    costingMethod: 'CONSTRUCTION',
    sourceInfo: IND_BENCHMARK,
    dependencies: ['PCL-F-003', 'THR-002'],
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 780.00, currency: 'PKR', unit: 'pair', confidence: 'VERIFIED MARKET', source: 'Export Bed Set Manufacturing Model' }],
    tags: ['pillowcases', 'percale', '200tc', 'bedding', 'pcl-m-008'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 100,
    subType: 'PILLOWCASE',
    threadCountTier: 'T-200 (Standard 200 TC)',
    fabricRefNo: 'PCL-F-003',
    specifications: {
      weave: '1/1 Plain',
      threadCount: 200,
      warpCount: '40s Combed',
      weftCount: '40s Combed',
      construction: '110x90',
      greigeWidthInches: 110,
      finishedWidthInches: 104,
      greigeGsm: 125,
      finishedGsm: 140,
      dimensions: {
        pillowcases: '2x (20 x 30 + 4 inches hem) (Cut length: 1.80 m fabric for pair)',
        tolerances: 'Pillowcases ±0.5 inch'
      },
      stitching: {
        spi: '10-12 SPI',
        threadSpec: 'Tex 24-27 Poly Core-Spun (THR-002)',
        operations: ['Lockstitch 4" hem', 'French seam or overlock internal edges']
      }
    }
  } as PercaleProductReference,

  // ==========================================
  // 10. 3-PIECE DIGITAL LAWN SUIT BENCHMARK (SUIT)
  // ==========================================
  {
    id: 'suit-001',
    refNo: 'SUIT-001',
    prefix: 'SUIT',
    category: 'lawn_suit_product',
    marketName: '3-Piece Digital Printed Lawn Suit with Embroidery',
    standardName: '3-Piece Unstitched Lawn Suit (Digital Shirt + Dyed Cambric Trouser + Digital Chiffon Dupatta + Neckline Embroidery)',
    description: 'Deterministic Pakistani unstitched designer benchmark. Target: ~₨ 4,170 before overhead & profit.',
    unit: 'suit',
    baseRate: 4170.00,
    currency: 'PKR',
    confidence: 'VERIFIED MARKET',
    costingMethod: 'CONSTRUCTION',
    sourceInfo: IND_BENCHMARK,
    dependencies: ['FAB-W-001', 'FAB-W-003', 'FAB-W-005', 'PRT-002', 'DYE-001', 'EMB-001'],
    rateHistory: [{ timestamp: '2026-09-28T08:00:00Z', rate: 4170.00, currency: 'PKR', unit: 'suit', confidence: 'VERIFIED MARKET', source: 'Designer Brand Manufacturing Model' }],
    tags: ['suit', 'lawn suit', '3-piece', 'digital print', 'embroidery', 'benchmark'],
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-28T08:00:00Z',
    qualityScore: 100
  }
];

class ReferenceDatabaseService {
  private items: TextileReferenceUnion[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.items = JSON.parse(stored);
      } else {
        this.items = [...INITIAL_REFERENCES];
        this.saveToStorage();
      }
    } catch (e) {
      console.warn('Error loading reference database from localStorage, initializing defaults:', e);
      this.items = [...INITIAL_REFERENCES];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      this.notifyListeners();
    } catch (e) {
      console.error('Error saving reference database:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  // Retrieve all non-archived references
  public getAllReferences(includeArchived = false): TextileReferenceUnion[] {
    if (includeArchived) return [...this.items];
    return this.items.filter((item) => !item.isArchived);
  }

  // Retrieve single item by Ref No (e.g. 'YRN-001' or 'PCL-F-003')
  public getByRefNo(refNo: string): TextileReferenceUnion | undefined {
    const cleanRef = refNo.trim().toUpperCase();
    return this.items.find((item) => item.refNo.toUpperCase() === cleanRef);
  }

  // Search by keyword, refNo, category, composition, or city
  public searchReferences(query: string, categoryFilter?: ReferenceCategory): TextileReferenceUnion[] {
    const q = query.trim().toLowerCase();
    return this.items.filter((item) => {
      if (item.isArchived) return false;
      if (categoryFilter && item.category !== categoryFilter) return false;
      if (!q) return true;

      return (
        item.refNo.toLowerCase().includes(q) ||
        item.marketName.toLowerCase().includes(q) ||
        item.standardName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.sourceInfo.marketRegion.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }

  // Priority-based rate resolution:
  // User Override -> Verified Live Rate -> Verified Reference Rate -> Fallback
  public getEffectiveRate(refNo: string): {
    rate: number;
    currency: CurrencyCode;
    confidence: RateConfidence;
    source: string;
    isOverride: boolean;
  } {
    const item = this.getByRefNo(refNo);
    if (!item) {
      return {
        rate: 0,
        currency: 'PKR',
        confidence: 'UNAVAILABLE',
        source: 'Not Found in Library',
        isOverride: false,
      };
    }

    if (item.userOverride && item.userOverride.rate > 0) {
      return {
        rate: item.userOverride.rate,
        currency: item.currency,
        confidence: 'MANUAL',
        source: `User Override (${item.userOverride.user || 'Admin'})`,
        isOverride: true,
      };
    }

    return {
      rate: item.baseRate,
      currency: item.currency,
      confidence: item.confidence,
      source: item.sourceInfo.sourceName,
      isOverride: false,
    };
  }

  // Set user override for a reference
  public setUserOverride(refNo: string, rate: number, user = 'User', reason?: string): boolean {
    const item = this.getByRefNo(refNo);
    if (!item) return false;

    item.userOverride = {
      rate,
      user,
      timestamp: new Date().toISOString(),
      reason,
    };
    item.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  // Clear user override
  public clearUserOverride(refNo: string): boolean {
    const item = this.getByRefNo(refNo);
    if (!item) return false;

    delete item.userOverride;
    item.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  // Update base rate with versioning & audit trail
  public updateReferenceRate(
    refNo: string,
    newRate: number,
    confidence: RateConfidence = 'VERIFIED MARKET',
    source = 'Manual Admin Update',
    user = 'Admin',
    changeReason?: string
  ): boolean {
    const item = this.getByRefNo(refNo);
    if (!item) return false;

    const previousRate = item.baseRate;
    item.baseRate = newRate;
    item.confidence = confidence;
    item.version = (item.version || 1) + 1;
    item.updatedAt = new Date().toISOString();

    if (!item.rateHistory) item.rateHistory = [];
    item.rateHistory.unshift({
      timestamp: new Date().toISOString(),
      rate: newRate,
      currency: item.currency,
      unit: item.unit,
      confidence,
      source,
      changedBy: user,
      changeReason: changeReason || `Rate adjusted from ₨ ${previousRate} to ₨ ${newRate}`,
    });

    this.saveToStorage();
    return true;
  }

  // Add new reference record with validation
  public addReference(item: TextileReferenceUnion): { success: boolean; error?: string } {
    if (!item.refNo || !item.marketName || item.baseRate <= 0) {
      return { success: false, error: 'Ref No, Market Name, and a valid Base Rate are required.' };
    }

    const existing = this.getByRefNo(item.refNo);
    if (existing) {
      return { success: false, error: `Reference with Ref No "${item.refNo}" already exists.` };
    }

    item.id = item.id || `ref-${Date.now()}`;
    item.version = 1;
    item.createdAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    item.qualityScore = this.calculateQualityScore(item);

    this.items.push(item);
    this.saveToStorage();
    return { success: true };
  }

  // Update existing reference item
  public updateReference(refNo: string, updates: Partial<TextileReferenceUnion>): boolean {
    const index = this.items.findIndex((i) => i.refNo.toUpperCase() === refNo.toUpperCase());
    if (index === -1) return false;

    this.items[index] = {
      ...this.items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      version: (this.items[index].version || 1) + 1,
    };
    this.items[index].qualityScore = this.calculateQualityScore(this.items[index]);

    this.saveToStorage();
    return true;
  }

  // Archive reference
  public archiveReference(refNo: string): boolean {
    const item = this.getByRefNo(refNo);
    if (!item) return false;
    item.isArchived = true;
    item.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  // Restore reference
  public restoreReference(refNo: string): boolean {
    const item = this.getByRefNo(refNo);
    if (!item) return false;
    item.isArchived = false;
    item.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  // Reset database back to default factory benchmarks
  public resetToDefaults() {
    this.items = [...INITIAL_REFERENCES];
    this.saveToStorage();
  }

  // Calculate Data Quality / Completeness Score (0-100%)
  private calculateQualityScore(item: TextileReferenceUnion): number {
    let score = 0;
    if (item.refNo) score += 15;
    if (item.marketName && item.marketName.length > 3) score += 15;
    if (item.standardName && item.standardName.length > 5) score += 15;
    if (item.unit) score += 10;
    if (item.baseRate > 0) score += 15;
    if (item.sourceInfo && item.sourceInfo.sourceName) score += 15;
    if (item.confidence === 'VERIFIED MARKET') score += 15;
    else if (item.confidence === 'MARKET QUOTE' || item.confidence === 'USER VERIFIED') score += 10;
    else score += 5;
    return Math.min(score, 100);
  }

  // Get Summary Metrics for Dashboard Card
  public getDashboardMetrics() {
    const active = this.getAllReferences();
    const verifiedCount = active.filter((i) => i.confidence === 'VERIFIED MARKET').length;
    const indicativeCount = active.filter((i) => i.confidence === 'INDICATIVE').length;
    const staleCount = active.filter((i) => i.confidence === 'STALE').length;

    const yarns = active.filter((i) => i.category === 'yarn').length;
    const woven = active.filter((i) => i.category === 'woven_fabric').length;
    const knits = active.filter((i) => i.category === 'knit_fabric').length;
    const marketFabrics = active.filter((i) => i.category === 'market_fabric').length;
    const dyeing = active.filter((i) => i.category === 'dyeing').length;
    const printing = active.filter((i) => i.category === 'printing').length;
    const finishing = active.filter((i) => i.category === 'finishing').length;
    const embroidery = active.filter((i) => i.category === 'embroidery').length;
    const products = active.filter((i) => i.category === 'percale_product' || i.category === 'lawn_suit_product').length;

    const avgQuality = active.length > 0 
      ? Math.round(active.reduce((acc, i) => acc + (i.qualityScore || 80), 0) / active.length)
      : 100;

    return {
      totalReferences: active.length,
      yarns,
      woven,
      knits,
      marketFabrics,
      dyeing,
      printing,
      finishing,
      embroidery,
      products,
      verifiedCount,
      indicativeCount,
      staleCount,
      avgQuality,
      lastUpdated: active[0]?.updatedAt || new Date().toISOString(),
    };
  }

  // Export to CSV string
  public exportToCsv(): string {
    const active = this.getAllReferences();
    const headers = [
      'Ref No',
      'Prefix',
      'Category',
      'Market Name',
      'Standard Specification',
      'Unit',
      'Base Rate',
      'Currency',
      'Confidence',
      'Source Name',
      'Market Region',
      'Last Updated',
      'Quality Score'
    ];

    const rows = active.map((item) => [
      `"${item.refNo}"`,
      `"${item.prefix}"`,
      `"${item.category}"`,
      `"${item.marketName.replace(/"/g, '""')}"`,
      `"${item.standardName.replace(/"/g, '""')}"`,
      `"${item.unit}"`,
      item.baseRate,
      `"${item.currency}"`,
      `"${item.confidence}"`,
      `"${item.sourceInfo?.sourceName?.replace(/"/g, '""') || ''}"`,
      `"${item.sourceInfo?.marketRegion || ''}"`,
      `"${item.updatedAt}"`,
      item.qualityScore || 90
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  // Import from CSV
  public importFromCsv(csvText: string): { imported: number; updated: number; errors: string[] } {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return { imported: 0, updated: 0, errors: ['CSV is empty or missing headers.'] };
    }

    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    // Simple parser for standard comma-separated lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      if (cols.length < 7) {
        errors.push(`Row ${i + 1}: Insufficient columns`);
        continue;
      }

      const [refNo, prefix, category, marketName, standardName, unit, baseRateStr, currency, confidence, sourceName, marketRegion] = cols;
      const baseRate = parseFloat(baseRateStr);

      if (!refNo || isNaN(baseRate) || baseRate <= 0) {
        errors.push(`Row ${i + 1}: Invalid Ref No "${refNo}" or Rate "${baseRateStr}"`);
        continue;
      }

      const existing = this.getByRefNo(refNo);
      if (existing) {
        this.updateReference(refNo, {
          marketName: marketName || existing.marketName,
          standardName: standardName || existing.standardName,
          baseRate,
          unit: unit || existing.unit,
          confidence: (confidence as RateConfidence) || existing.confidence,
        });
        updated++;
      } else {
        const newItem: BaseReferenceItem = {
          id: `ref-imp-${Date.now()}-${i}`,
          refNo: refNo.toUpperCase(),
          prefix: (prefix as any) || (refNo.split('-')[0] as any) || 'YRN',
          category: (category as any) || 'yarn',
          marketName: marketName || refNo,
          standardName: standardName || marketName || refNo,
          description: `Imported reference record ${refNo}`,
          unit: unit || 'kg',
          baseRate,
          currency: (currency as CurrencyCode) || 'PKR',
          confidence: (confidence as RateConfidence) || 'VERIFIED MARKET',
          costingMethod: 'PER_UNIT',
          sourceInfo: {
            sourceName: sourceName || 'Excel / CSV Import',
            retrievedAt: new Date().toISOString(),
            marketRegion: (marketRegion as any) || 'Pakistan Average',
          },
          rateHistory: [
            {
              timestamp: new Date().toISOString(),
              rate: baseRate,
              currency: (currency as CurrencyCode) || 'PKR',
              unit: unit || 'kg',
              confidence: (confidence as RateConfidence) || 'VERIFIED MARKET',
              source: sourceName || 'CSV Import',
            },
          ],
          tags: ['imported', (category || 'yarn').toLowerCase()],
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          qualityScore: 90,
        };
        this.addReference(newItem);
        imported++;
      }
    }

    return { imported, updated, errors };
  }
}

export const referenceDatabaseService = new ReferenceDatabaseService();
