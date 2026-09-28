import type {
  BOQEstimate,
  BOQLineItem,
  BOQSummaryCost,
} from '../types/referenceTypes';
import type { CurrencyCode } from '../types';
import { referenceDatabaseService } from './referenceDatabase';

const BOQ_STORAGE_KEY = 'fabriciq_saved_boq_estimates_v2';

export class BOQEngineService {
  private savedEstimates: BOQEstimate[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(BOQ_STORAGE_KEY);
      if (stored) {
        this.savedEstimates = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error loading saved BOQs:', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(BOQ_STORAGE_KEY, JSON.stringify(this.savedEstimates));
      this.notifyListeners();
    } catch (e) {
      console.error('Error saving BOQs:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }

  // Create a blank BOQ line initialized from a Ref No
  public createLineItemFromRefNo(refNo: string, lineNo = 1, quantity = 1): BOQLineItem {
    const item = referenceDatabaseService.getByRefNo(refNo);
    if (!item) {
      return {
        lineNo,
        refNo: refNo.toUpperCase(),
        category: 'woven_fabric',
        itemName: 'Custom Item',
        specification: 'Standard Specification',
        quantity,
        unit: 'meter',
        baseRate: 0,
        effectiveRate: 0,
        currency: 'PKR',
        wastePct: 2.0,
        yieldPct: 100,
        extendedCost: 0,
        confidence: 'MANUAL',
        source: 'User Input',
        timestamp: new Date().toISOString(),
        notes: '',
      };
    }

    const eff = referenceDatabaseService.getEffectiveRate(item.refNo);
    const wastePct = (item as any).warpWastePct || (item as any).wastePct || 2.0;
    const yieldPct = (item as any).processYieldPct || (item as any).yieldPct || 100.0;
    
    // Formula: Adjusted Quantity * Effective Rate
    // Adjusted Quantity = Quantity / (Yield% / 100) * (1 + Waste% / 100)
    const adjQty = (quantity / (yieldPct / 100)) * (1 + wastePct / 100);
    const extendedCost = Math.round(adjQty * eff.rate * 100) / 100;

    return {
      lineNo,
      refNo: item.refNo,
      category: item.category,
      itemName: item.marketName,
      specification: item.standardName,
      quantity,
      unit: item.unit,
      baseRate: item.baseRate,
      rateOverride: item.userOverride?.rate,
      overrideUser: item.userOverride?.user,
      overrideTimestamp: item.userOverride?.timestamp,
      overrideReason: item.userOverride?.reason,
      effectiveRate: eff.rate,
      currency: eff.currency,
      wastePct,
      yieldPct,
      extendedCost,
      confidence: eff.confidence,
      source: eff.source,
      timestamp: new Date().toISOString(),
      notes: item.description,
    };
  }

  // Calculate single line item deterministically
  public calculateLineItem(line: BOQLineItem): BOQLineItem {
    const effectiveRate = line.rateOverride !== undefined && line.rateOverride > 0
      ? line.rateOverride
      : line.baseRate;

    const yieldFactor = line.yieldPct > 0 ? line.yieldPct / 100 : 1.0;
    const wasteFactor = 1 + (line.wastePct >= 0 ? line.wastePct / 100 : 0);
    const adjustedQuantity = (line.quantity / yieldFactor) * wasteFactor;
    const extendedCost = Math.round(adjustedQuantity * effectiveRate * 100) / 100;

    return {
      ...line,
      effectiveRate,
      extendedCost,
      confidence: line.rateOverride !== undefined && line.rateOverride > 0 ? 'MANUAL' : line.confidence,
    };
  }

  // Compute complete BOQ Summary with overheads, margins, and taxes
  public calculateBOQSummary(
    lines: BOQLineItem[],
    overheadPct = 5.0,
    marginPct = 12.0,
    taxPct = 0.0,
    orderQuantity = 1,
    currency: CurrencyCode = 'PKR'
  ): BOQSummaryCost {
    let totalDirectMaterialCost = 0;
    let totalDirectProcessCost = 0;
    let totalTrimsAndPackingCost = 0;
    let totalLabourCost = 0;

    lines.forEach((line) => {
      const cat = line.category;
      if (['fibre', 'yarn', 'woven_fabric', 'knit_fabric', 'market_fabric'].includes(cat)) {
        totalDirectMaterialCost += line.extendedCost;
      } else if (['dyeing', 'printing', 'finishing', 'denim_wash', 'embroidery'].includes(cat)) {
        totalDirectProcessCost += line.extendedCost;
      } else if (['thread', 'trims', 'packaging'].includes(cat)) {
        totalTrimsAndPackingCost += line.extendedCost;
      } else {
        totalLabourCost += line.extendedCost;
      }
    });

    const subtotalCost = Math.round((totalDirectMaterialCost + totalDirectProcessCost + totalTrimsAndPackingCost + totalLabourCost) * 100) / 100;
    const overheadAmount = Math.round((subtotalCost * (overheadPct / 100)) * 100) / 100;
    const costAfterOverhead = subtotalCost + overheadAmount;
    const marginAmount = Math.round((costAfterOverhead * (marginPct / 100)) * 100) / 100;
    const costAfterMargin = costAfterOverhead + marginAmount;
    const taxAmount = Math.round((costAfterMargin * (taxPct / 100)) * 100) / 100;
    const finalTotalCost = Math.round((costAfterMargin + taxAmount) * 100) / 100;
    const costPerUnit = orderQuantity > 0 ? Math.round((finalTotalCost / orderQuantity) * 100) / 100 : finalTotalCost;

    return {
      totalDirectMaterialCost,
      totalDirectProcessCost,
      totalTrimsAndPackingCost,
      totalLabourCost,
      subtotalCost,
      overheadPct,
      overheadAmount,
      marginPct,
      marginAmount,
      taxPct,
      taxAmount,
      finalTotalCost,
      costPerUnit,
      currency,
    };
  }

  // Pre-configured Factory Benchmark Templates
  public generatePercaleBedSetBOQ(orderQuantity = 100): BOQEstimate {
    const lines: BOQLineItem[] = [
      {
        lineNo: 1,
        refNo: 'PCL-F-003',
        category: 'woven_fabric',
        itemName: 'Flat Sheet Fabric (200 TC Percale 104" Finished)',
        specification: '40s Combed x 40s Combed / 110x90 Plain Weave (Cut length 2.85m)',
        quantity: 2.85 * orderQuantity,
        unit: 'meter',
        baseRate: 410.00,
        effectiveRate: 410.00,
        currency: 'PKR',
        wastePct: 2.0,
        yieldPct: 100,
        extendedCost: Math.round(2.85 * orderQuantity * 1.02 * 410 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Export Bed Linen Cost Model',
        timestamp: new Date().toISOString(),
        notes: 'Includes desize, scour, bleach, optic white, silicone soft, and sanforize.',
      },
      {
        lineNo: 2,
        refNo: 'PCL-F-003',
        category: 'woven_fabric',
        itemName: 'Fitted Sheet Fabric (200 TC Percale 104" Finished)',
        specification: '40s Combed x 40s Combed / 110x90 (Cut length 3.10m for 15" pocket)',
        quantity: 3.10 * orderQuantity,
        unit: 'meter',
        baseRate: 410.00,
        effectiveRate: 410.00,
        currency: 'PKR',
        wastePct: 2.0,
        yieldPct: 100,
        extendedCost: Math.round(3.10 * orderQuantity * 1.02 * 410 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Export Bed Linen Cost Model',
        timestamp: new Date().toISOString(),
        notes: 'Corner seam cuts and overlocked edges.',
      },
      {
        lineNo: 3,
        refNo: 'PCL-F-003',
        category: 'woven_fabric',
        itemName: 'Pillowcases Fabric (Pair - 2 Pieces)',
        specification: '40s Combed x 40s Combed / 110x90 (Cut length 1.80m for 2x 20"x30" + 4" hem)',
        quantity: 1.80 * orderQuantity,
        unit: 'meter',
        baseRate: 410.00,
        effectiveRate: 410.00,
        currency: 'PKR',
        wastePct: 2.0,
        yieldPct: 100,
        extendedCost: Math.round(1.80 * orderQuantity * 1.02 * 410 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Export Bed Linen Cost Model',
        timestamp: new Date().toISOString(),
        notes: 'Double needle lockstitch 4" flap.',
      },
      {
        lineNo: 4,
        refNo: 'THR-002',
        category: 'thread',
        itemName: 'Poly-Core Sewing Thread Ticket 80',
        specification: 'Tex 35 High-Tenacity Poly Core Thread for Automated Hemming (10-12 SPI)',
        quantity: 0.15 * orderQuantity, // ~750m per set = 0.15 of a 5,000m cone
        unit: 'cone',
        baseRate: 380.00,
        effectiveRate: 380.00,
        currency: 'PKR',
        wastePct: 5.0,
        yieldPct: 100,
        extendedCost: Math.round(0.15 * orderQuantity * 1.05 * 380 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Coats Benchmark',
        timestamp: new Date().toISOString(),
        notes: 'Lockstitch hems and fitted-sheet overlocking.',
      },
      {
        lineNo: 5,
        refNo: 'TRM-001',
        category: 'trims',
        itemName: 'Fitted Sheet 3/4" Knitted Elastic',
        specification: 'High Elasticity Heat-Resistant 20mm Knitted Elastic (4m per set)',
        quantity: 4.0 * orderQuantity,
        unit: 'meter',
        baseRate: 18.00,
        effectiveRate: 18.00,
        currency: 'PKR',
        wastePct: 2.0,
        yieldPct: 100,
        extendedCost: Math.round(4.0 * orderQuantity * 1.02 * 18 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Trims Supplier Quote',
        timestamp: new Date().toISOString(),
        notes: 'All-around encapsulated hem elastication.',
      },
      {
        lineNo: 6,
        refNo: 'TRM-002',
        category: 'trims',
        itemName: 'Woven Brand, Care & Oeko-Tex Labels',
        specification: 'Damask woven brand label + satin printed care label + size pip (Set of 3)',
        quantity: 1 * orderQuantity,
        unit: 'set',
        baseRate: 35.00,
        effectiveRate: 35.00,
        currency: 'PKR',
        wastePct: 1.0,
        yieldPct: 100,
        extendedCost: Math.round(1 * orderQuantity * 1.01 * 35 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Label Factory Quote',
        timestamp: new Date().toISOString(),
        notes: 'Attached to flat sheet and fitted sheet corners.',
      },
      {
        lineNo: 7,
        refNo: 'PKG-001',
        category: 'packaging',
        itemName: 'PVC Zipper Bag + 350 GSM Art Card Insert',
        specification: 'Clear 15-gauge PVC bag with nylon zipper, rope handle & 4-colour insert',
        quantity: 1 * orderQuantity,
        unit: 'set',
        baseRate: 120.00,
        effectiveRate: 120.00,
        currency: 'PKR',
        wastePct: 1.0,
        yieldPct: 100,
        extendedCost: Math.round(1 * orderQuantity * 1.01 * 120 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Packaging Vendor Quote',
        timestamp: new Date().toISOString(),
        notes: 'Retail presentation packaging.',
      },
      {
        lineNo: 8,
        refNo: 'PKG-002',
        category: 'packaging',
        itemName: '5-Ply Heavy Export Master Carton',
        specification: 'Export carton capacity 12 sets, 250 lbs burst test (0.083 carton/set)',
        quantity: 0.0833 * orderQuantity,
        unit: 'carton',
        baseRate: 350.00,
        effectiveRate: 350.00,
        currency: 'PKR',
        wastePct: 0.0,
        yieldPct: 100,
        extendedCost: Math.round(0.0833 * orderQuantity * 350 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Carton Manufacturer Quote',
        timestamp: new Date().toISOString(),
        notes: '12 complete sets per carton.',
      },
      {
        lineNo: 9,
        refNo: 'LBR-001',
        category: 'trims',
        itemName: 'Cutting, Stitching & Overlocking CMT Labour',
        specification: 'Piece-rate sewing: Flat sheet (₨ 60), Fitted sheet (₨ 90), 2 Pillowcases (₨ 70)',
        quantity: 1 * orderQuantity,
        unit: 'set',
        baseRate: 220.00,
        effectiveRate: 220.00,
        currency: 'PKR',
        wastePct: 0.0,
        yieldPct: 100,
        extendedCost: 220.00 * orderQuantity,
        confidence: 'VERIFIED MARKET',
        source: 'Export Stitching Unit Rates',
        timestamp: new Date().toISOString(),
        notes: '10-12 SPI stitching standard.',
      },
      {
        lineNo: 10,
        refNo: 'QC-001',
        category: 'trims',
        itemName: 'AQL 2.5 Final Inspection, Ironing & Packing',
        specification: '100% thread trimming, steam pressing, folding, bag insertion & master packing',
        quantity: 1 * orderQuantity,
        unit: 'set',
        baseRate: 60.00,
        effectiveRate: 60.00,
        currency: 'PKR',
        wastePct: 0.0,
        yieldPct: 100,
        extendedCost: 60.00 * orderQuantity,
        confidence: 'VERIFIED MARKET',
        source: 'Export Packaging Floor Standard',
        timestamp: new Date().toISOString(),
        notes: 'AQL 2.5 Major / 4.0 Minor tolerance.',
      },
    ];

    const summary = this.calculateBOQSummary(lines, 4.0, 10.0, 0.0, orderQuantity, 'PKR');

    return {
      id: `boq-pcl-${Date.now()}`,
      title: 'Percale 200 TC Complete 4-Piece Bed Set BOQ',
      productType: 'PERCALE_BED_SET',
      targetBenchmarkRef: 'PCL-F-003',
      orderQuantity,
      orderUnit: 'sets',
      currency: 'PKR',
      lines,
      summary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: 'Standard 200 TC Combed Cotton 4-Piece Bed Set (1 Flat Sheet 90"x102", 1 Fitted Sheet 60"x80"+15", 2 Pillowcases 20"x30"+4").',
    };
  }

  public generateLawnSuitBOQ(orderQuantity = 100): BOQEstimate {
    const lines: BOQLineItem[] = [
      {
        lineNo: 1,
        refNo: 'FAB-W-001',
        category: 'woven_fabric',
        itemName: 'Lawn Shirt Greige Fabric 90×70 / 40×40',
        specification: '100% Cotton 40s Combed Ring Spun 48" Greige',
        quantity: 3.0 * orderQuantity,
        unit: 'meter',
        baseRate: 165.00,
        effectiveRate: 165.00,
        currency: 'PKR',
        wastePct: 2.0,
        yieldPct: 100,
        extendedCost: Math.round(3.0 * orderQuantity * 1.02 * 165 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Faisalabad Weaving Exchange',
        timestamp: new Date().toISOString(),
        notes: '3.0 meters unstitched shirt cut length.',
      },
      {
        lineNo: 2,
        refNo: 'PRT-002',
        category: 'printing',
        itemName: 'Digital Reactive Printing (Shirt & Sleeves)',
        specification: '1200 DPI High-Definition Reactive Digital Print on 100% Lawn',
        quantity: 3.0 * orderQuantity,
        unit: 'meter',
        baseRate: 185.00,
        effectiveRate: 185.00,
        currency: 'PKR',
        wastePct: 2.0,
        yieldPct: 100,
        extendedCost: Math.round(3.0 * orderQuantity * 1.02 * 185 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Digital Print House Benchmark',
        timestamp: new Date().toISOString(),
        notes: 'Continuous digital reactive printing route.',
      },
      {
        lineNo: 3,
        refNo: 'FAB-W-003',
        category: 'woven_fabric',
        itemName: 'Cambric Trouser Greige Fabric 68×68 / 40×40',
        specification: '100% Cotton Cambric 52" Greige',
        quantity: 2.5 * orderQuantity,
        unit: 'meter',
        baseRate: 145.00,
        effectiveRate: 145.00,
        currency: 'PKR',
        wastePct: 2.0,
        yieldPct: 100,
        extendedCost: Math.round(2.5 * orderQuantity * 1.02 * 145 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Faisalabad Weaving Exchange',
        timestamp: new Date().toISOString(),
        notes: '2.5 meters unstitched trouser cut length.',
      },
      {
        lineNo: 4,
        refNo: 'DYE-001',
        category: 'dyeing',
        itemName: 'Continuous Reactive Dyeing for Trouser',
        specification: 'Pad-Steam Solid Reactive Dyeing (Matching Shirt Base Shade)',
        quantity: 2.5 * orderQuantity,
        unit: 'meter',
        baseRate: 38.00,
        effectiveRate: 38.00,
        currency: 'PKR',
        wastePct: 3.0,
        yieldPct: 97.0,
        extendedCost: Math.round(((2.5 * orderQuantity) / 0.97) * 1.03 * 38 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Faisalabad Processing Mill',
        timestamp: new Date().toISOString(),
        notes: 'Solid dyed matching trouser.',
      },
      {
        lineNo: 5,
        refNo: 'FAB-W-005',
        category: 'woven_fabric',
        itemName: 'Chiffon Georgette Dupatta Fabric 100D×100D',
        specification: '100% High-Twist Polyester Georgette 44" Width',
        quantity: 2.5 * orderQuantity,
        unit: 'meter',
        baseRate: 92.00,
        effectiveRate: 92.00,
        currency: 'PKR',
        wastePct: 2.0,
        yieldPct: 100,
        extendedCost: Math.round(2.5 * orderQuantity * 1.02 * 92 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Lahore Azam Market',
        timestamp: new Date().toISOString(),
        notes: '2.5 meters dupatta.',
      },
      {
        lineNo: 6,
        refNo: 'PRT-002',
        category: 'printing',
        itemName: 'Digital Printing for Chiffon Dupatta',
        specification: 'High-Definition Digital Sublimation/Reactive Print on Chiffon',
        quantity: 2.5 * orderQuantity,
        unit: 'meter',
        baseRate: 185.00,
        effectiveRate: 185.00,
        currency: 'PKR',
        wastePct: 2.0,
        yieldPct: 100,
        extendedCost: Math.round(2.5 * orderQuantity * 1.02 * 185 * 100) / 100,
        confidence: 'VERIFIED MARKET',
        source: 'Print House Rate',
        timestamp: new Date().toISOString(),
        notes: 'Matching border and floral dupatta print.',
      },
      {
        lineNo: 7,
        refNo: 'EMB-001',
        category: 'embroidery',
        itemName: 'Heavy Multi-Head Computerized Neckline & Daman Embroidery',
        specification: 'Tajima Multi-Head Heavy Thread + Zari Work (80,000 stitches total @ ₨ 0.45/1k + setup/backing)',
        quantity: 80 * orderQuantity, // 80 x 1,000 stitches
        unit: '1000_stitches',
        baseRate: 0.45,
        effectiveRate: 0.45,
        currency: 'PKR',
        wastePct: 0.0,
        yieldPct: 100,
        extendedCost: Math.round(80 * orderQuantity * 0.45 * 100) / 100 + (1200 * (orderQuantity / 100)), // Base stitches + organza backing and laser finishing
        confidence: 'VERIFIED MARKET',
        source: 'Lahore Embroidery Cluster Benchmark',
        timestamp: new Date().toISOString(),
        notes: 'Organza embroidered neckline patch + sleeve border + daman motif.',
      },
      {
        lineNo: 8,
        refNo: 'TRM-003',
        category: 'trims',
        itemName: 'Embroidered Organza Trims, Laces & Gota Patti',
        specification: 'Matching schiffli organza embroidered border strip for hem (1 meter)',
        quantity: 1 * orderQuantity,
        unit: 'piece',
        baseRate: 280.00,
        effectiveRate: 280.00,
        currency: 'PKR',
        wastePct: 0.0,
        yieldPct: 100,
        extendedCost: 280.00 * orderQuantity,
        confidence: 'VERIFIED MARKET',
        source: 'Trims Market Benchmark',
        timestamp: new Date().toISOString(),
        notes: 'Embroidered patch trims.',
      },
      {
        lineNo: 9,
        refNo: 'PKG-003',
        category: 'packaging',
        itemName: 'Luxury Presentation Box / Zipper Bag with Model Photo Inlay',
        specification: 'High-gloss printed brand flyer inlay + designer PVC zipper presentation pack',
        quantity: 1 * orderQuantity,
        unit: 'piece',
        baseRate: 111.00,
        effectiveRate: 111.00,
        currency: 'PKR',
        wastePct: 0.0,
        yieldPct: 100,
        extendedCost: 111.00 * orderQuantity,
        confidence: 'VERIFIED MARKET',
        source: 'Packaging Supplier Benchmark',
        timestamp: new Date().toISOString(),
        notes: 'Unstitched suit packaging.',
      },
    ];

    // Calculate summary
    const summary = this.calculateBOQSummary(lines, 5.0, 15.0, 0.0, orderQuantity, 'PKR');

    return {
      id: `boq-suit-${Date.now()}`,
      title: '3-Piece Digital-Printed Lawn Suit with Embroidery BOQ',
      productType: 'LAWN_SUIT_3PC',
      targetBenchmarkRef: 'SUIT-001',
      orderQuantity,
      orderUnit: 'suits',
      currency: 'PKR',
      lines,
      summary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: 'Benchmark 3-Piece Unstitched Designer Lawn Suit (Digital Shirt + Dyed Cambric Trouser + Digital Chiffon Dupatta + Embroidered Neckline & Daman). Target Manufacturing Base: ~₨ 4,170 before overhead & profit.',
    };
  }

  // Save BOQ Estimate
  public saveBOQ(estimate: BOQEstimate): boolean {
    const index = this.savedEstimates.findIndex((e) => e.id === estimate.id);
    estimate.updatedAt = new Date().toISOString();
    if (index >= 0) {
      this.savedEstimates[index] = estimate;
    } else {
      this.savedEstimates.unshift(estimate);
    }
    this.saveToStorage();
    return true;
  }

  // Get all saved BOQ estimates
  public getSavedBOQs(): BOQEstimate[] {
    return [...this.savedEstimates];
  }

  // Delete saved BOQ estimate
  public deleteBOQ(id: string): boolean {
    this.savedEstimates = this.savedEstimates.filter((e) => e.id !== id);
    this.saveToStorage();
    return true;
  }

  // Recalculate BOQ with updated market rates
  public propagateUpdatedRates(boq: BOQEstimate): BOQEstimate {
    const updatedLines = boq.lines.map((line) => {
      // If line has an explicit user override, preserve it
      if (line.rateOverride !== undefined && line.rateOverride > 0) {
        return this.calculateLineItem(line);
      }

      const currentRate = referenceDatabaseService.getEffectiveRate(line.refNo);
      return this.calculateLineItem({
        ...line,
        baseRate: currentRate.rate,
        confidence: currentRate.confidence,
        source: currentRate.source,
      });
    });

    const updatedSummary = this.calculateBOQSummary(
      updatedLines,
      boq.summary.overheadPct,
      boq.summary.marginPct,
      boq.summary.taxPct,
      boq.orderQuantity,
      boq.currency
    );

    return {
      ...boq,
      lines: updatedLines,
      summary: updatedSummary,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const boqEngineService = new BOQEngineService();
