import type { SavedEstimate, FabricCalculationInput, FabricIQCalculationResult } from '../types';
import jsPDF from 'jspdf';
import { currencyService } from './currencyService';
import { DEFAULT_PROCESSING_OPERATIONS, DEFAULT_DETAILED_DYEING, DEFAULT_DETAILED_FINISHING } from './calculationEngine';

const STORAGE_KEY_ESTIMATES = 'fabriciq_saved_estimates_v2';

const SAMPLE_ESTIMATES: SavedEstimate[] = [
  {
    id: 'est-2026-001',
    referenceNo: 'FIQ-2026-0841',
    title: '50,000m Reactive Dyed Twill 16x12 / 108x56',
    customerName: 'AeroTex Global Sourcing Ltd.',
    fabricType: 'Heavy Apparel Twill 16x12 (3/1)',
    createdAt: '2026-09-26 14:30',
    updatedAt: '2026-09-26 14:30',
    currency: 'PKR',
    status: 'approved',
    inputs: {
      estimateName: '50,000m Reactive Dyed Twill 16x12 / 108x56',
      customerName: 'AeroTex Global Sourcing Ltd.',
      fabricType: 'Heavy Apparel Twill 16x12 (3/1)',
      finishedWidthInches: 63,
      finishedLengthMeters: 50000,
      costingMethod: 'engineered',
      directGreyRatePerMeter: 0,
      directGreyRatePerKg: 0,
      directGSM: 242,
      warpCountNe: 16,
      weftCountNe: 12,
      epi: 108,
      ppi: 56,
      warpCrimpPct: 7.5,
      weftCrimpPct: 5.0,
      warpWastePct: 1.0,
      weftWastePct: 1.0,
      warpYarnRate: 2680,
      warpYarnRateUnit: '10lbs',
      weftYarnRate: 2550,
      weftYarnRateUnit: '10lbs',
      weavingCostMethod: 'per_pick',
      weavingRate: 0.48,
      sizingCostPerMeter: 8.50,
      otherGreyManufacturingCostPerMeter: 0,
      weavingLossPct: 2.0,
      wetProcessingLossPct: 3.5,
      finishingLossPct: 1.5,
      processingOperations: DEFAULT_PROCESSING_OPERATIONS.map((op) => ({
        ...op,
        enabled: ['proc-desizing', 'proc-scouring', 'proc-bleaching', 'proc-washing', 'proc-stentering', 'proc-compacting'].includes(op.id),
      })),
      detailedDyeing: {
        ...DEFAULT_DETAILED_DYEING,
        enabled: true,
        machineChargePerMeter: 12.00,
        dyeCostPerMeter: 22.00,
        chemicalCostPerMeter: 6.50,
        waterCostPerMeter: 2.00,
        steamEnergyCostPerMeter: 5.50,
        laborCostPerMeter: 3.00,
        overheadCostPerMeter: 2.00,
      },
      detailedFinishing: {
        ...DEFAULT_DETAILED_FINISHING,
        enabled: false,
      },
      printingCostPerMeter: 0,
      auxChemicalCostPerMeter: 3.50,
      transportMethod: 'by_weight',
      transportRatePerKg: 12.00,
      fixedTransportTotal: 0,
      overheadMethod: 'percentage',
      overheadPct: 3.0,
      fixedOverheadTotal: 0,
      pricingStrategy: 'margin',
      targetMarginPct: 15.0,
      targetMarkupPct: 20.0,
      commissionPerMeter: 0,
      otherChargesPerMeter: 0,
      taxMode: 'exclusive',
      taxRatePct: 18.0,
      currency: 'PKR',
      rateSourceSnapshot: {
        'Warp 16/1': { rate: 2680, source: 'Faisalabad Yarn Exchange', status: 'LIVE' },
        'Weft 12/1': { rate: 2550, source: 'KCA Direct Market', status: 'LIVE' },
        'Airjet Weaving': { rate: 0.48, source: 'APTMA Benchmark', status: 'LIVE' },
      },
    },
    results: {
      warpWeightPerMeterGrams: 233.73,
      weftWeightPerMeterGrams: 157.84,
      totalGreyWeightPerMeterGrams: 391.57,
      weightPerMeterKg: 0.3916,
      estimatedGreyGSM: 244.7,
      estimatedFinishedGSM: 254.5,
      effectiveYieldPct: 93.21,
      requiredGreyInputKg: 21004.72,
      requiredGreyInputMeters: 52631.6,
      finishedOutputKg: 19580.0,
      finishedOutputMeters: 50000.0,
      totalWarpWeightKg: 12301.6,
      totalWeftWeightKg: 8307.4,
      totalYarnWeightKg: 20609.0,
      totalYarnBags100lbs: 454.35,
      totalYarnBags10lbs: 4543.5,
      yarn_cost: 250.64,
      warp_yarn_cost: 152.66,
      weft_yarn_cost: 97.98,
      weaving_cost: 28.29,
      sizing_cost: 8.95,
      grey_fabric_cost: 287.88,
      processing_cost: 24.00,
      dyeing_cost: 53.00,
      finishing_cost: 0,
      printing_cost: 0,
      chemical_cost: 32.00,
      energy_cost: 5.50,
      labor_cost: 3.00,
      transport_cost: 4.70,
      overhead_cost: 11.84,
      wastage_cost: 24.81,
      other_manufacturing_cost: 0,
      total_production_cost: 20496500,
      cost_per_meter: 409.93,
      cost_per_kg: 1046.81,
      cost_per_yard: 374.84,
      markup_percent: 20.0,
      margin_percent: 15.0,
      margin_amount_per_meter: 72.34,
      selling_price: 482.27,
      selling_price_per_kg: 1231.54,
      selling_price_per_yard: 441.00,
      tax: 86.81,
      tax_mode: 'exclusive',
      final_price: 569.08,
      final_price_per_kg: 1453.22,
      final_price_per_yard: 520.37,
      totalOrderCost: 20496500,
      totalOrderSellingPrice: 24113500,
      totalOrderTax: 4340500,
      totalOrderInvoiceValue: 28454000,
      totalOrderGrossProfit: 3617000,
      currency: 'PKR',
      breakdownPercentages: {
        yarnPct: 52.0,
        weavingPct: 7.7,
        processingPct: 5.0,
        dyeingFinishingPct: 11.0,
        wastagePct: 5.1,
        logisticsOverheadPct: 3.4,
        marginPct: 15.0,
      },
    },
    notes: 'Approved for production. Reactive medium olive green shade. FOB Karachi port.',
    tags: ['Twill', 'Reactive', 'Workwear', 'Export'],
  },
];

export class EstimateService {
  private estimates: SavedEstimate[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ESTIMATES);
      if (stored) {
        this.estimates = JSON.parse(stored);
      } else {
        this.estimates = SAMPLE_ESTIMATES;
        this.save();
      }
    } catch {
      this.estimates = SAMPLE_ESTIMATES;
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY_ESTIMATES, JSON.stringify(this.estimates));
    } catch {
      // ignore
    }
  }

  public getAll(): SavedEstimate[] {
    return [...this.estimates];
  }

  public getById(id: string): SavedEstimate | undefined {
    return this.estimates.find((e) => e.id === id);
  }

  public saveEstimate(
    inputs: FabricCalculationInput,
    results: FabricIQCalculationResult,
    status: 'draft' | 'quoted' | 'approved' | 'in_production' | 'archived' = 'quoted',
    notes?: string,
    tags?: string[]
  ): SavedEstimate {
    const id = `est-${Date.now()}`;
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const referenceNo = `FIQ-2026-${randCode}`;
    const nowStr = new Date().toLocaleString();

    const newEstimate: SavedEstimate = {
      id,
      referenceNo,
      title: inputs.estimateName || `${inputs.fabricType} Quote`,
      customerName: inputs.customerName || 'Direct Commercial Buyer',
      fabricType: inputs.fabricType || 'Custom Fabric',
      createdAt: nowStr,
      updatedAt: nowStr,
      currency: inputs.currency,
      inputs: { ...inputs },
      results: { ...results },
      status,
      notes,
      tags: tags || ['Custom Quote', inputs.currency],
    };

    this.estimates.unshift(newEstimate);
    this.save();
    return newEstimate;
  }

  public updateEstimate(id: string, updates: Partial<SavedEstimate>): SavedEstimate | null {
    const idx = this.estimates.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    const existing = this.estimates[idx];
    const updated: SavedEstimate = {
      ...existing,
      ...updates,
      updatedAt: new Date().toLocaleString(),
    };

    this.estimates[idx] = updated;
    this.save();
    return updated;
  }

  public duplicateEstimate(id: string): SavedEstimate | null {
    const source = this.getById(id);
    if (!source) return null;

    const randCode = Math.floor(1000 + Math.random() * 9000);
    const newEst: SavedEstimate = {
      ...source,
      id: `est-${Date.now()}`,
      referenceNo: `FIQ-2026-${randCode}`,
      title: `${source.title} (Copy)`,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      status: 'draft',
    };

    this.estimates.unshift(newEst);
    this.save();
    return newEst;
  }

  public deleteEstimate(id: string): boolean {
    const initLen = this.estimates.length;
    this.estimates = this.estimates.filter((e) => e.id !== id);
    if (this.estimates.length !== initLen) {
      this.save();
      return true;
    }
    return false;
  }

  public generateQuotationPDF(estimate: SavedEstimate): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const { inputs, results } = estimate;
    const curSymbol = currencyService.format(0, inputs.currency).split(' ')[0] || inputs.currency;

    // Header Background
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 38, 'F');

    // App Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('FABRICIQ TEXTILE INTELLIGENCE', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(199, 210, 254);
    doc.text('Commercial Fabric Costing, Yield Analysis & Official Quotation', 14, 23);
    doc.text(`Quotation Ref: ${estimate.referenceNo}  |  Generated: ${estimate.createdAt}`, 14, 30);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text(`STATUS: ${estimate.status.toUpperCase()}`, 155, 23);

    doc.setTextColor(30, 41, 59);

    let y = 47;
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('1. PHYSICAL SPECIFICATIONS & PRODUCTION YIELD', 14, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 2, 196, y + 2);

    y += 8;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Name:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(estimate.customerName, 50, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Finished Target Quantity:', 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${(inputs.finishedLengthMeters || 0).toLocaleString()} Meters (${((inputs.finishedLengthMeters || 0) * 1.09361).toFixed(0)} Yards)`, 155, y);

    y += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Fabric Construction:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(
      inputs.costingMethod === 'engineered'
        ? `${inputs.warpCountNe}s x ${inputs.weftCountNe}s / ${inputs.epi} x ${inputs.ppi} (${inputs.finishedWidthInches}")`
        : `Direct Rate Mode (${inputs.finishedWidthInches}")`,
      50,
      y
    );

    doc.setFont('helvetica', 'bold');
    doc.text('Effective Yield:', 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${results.effectiveYieldPct}% (Total Process Loss: ${(100 - results.effectiveYieldPct).toFixed(1)}%)`, 155, y);

    y += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Theoretical GSM:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Grey: ${results.estimatedGreyGSM} gsm  |  Finished: ~${results.estimatedFinishedGSM} gsm`, 50, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Required Grey Input:', 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${results.requiredGreyInputKg.toLocaleString()} Kg (${results.requiredGreyInputMeters.toLocaleString()} m)`, 155, y);

    y += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Linear Weight / Meter:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${results.weightPerMeterKg} kg/m (${(results.weightPerMeterKg * 1000).toFixed(0)} g/m)`, 50, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Total Yarn Required:', 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${results.totalYarnWeightKg.toLocaleString()} Kg (${results.totalYarnBags100lbs.toFixed(0)} Bags 100-lb)`, 155, y);

    y += 12;
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('2. ITEMIZED COST COMPONENT ENGINE', 14, y);
    doc.line(14, y + 2, 196, y + 2);

    y += 7;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 4, 182, 6.5, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Cost Component', 18, y);
    doc.text('Engineering Basis / Route', 85, y);
    doc.text(`Cost / Meter (${inputs.currency})`, 140, y);
    doc.text('Share %', 180, y);

    const baseCost = Math.max(0.01, results.cost_per_meter);
    const rows = [
      ['Warp Yarn Cost', `${inputs.warpCountNe}s Ne (${results.warpWeightPerMeterGrams} g/m, Crimp: ${inputs.warpCrimpPct}%)`, `${curSymbol} ${results.warp_yarn_cost.toFixed(2)}`, `${((results.warp_yarn_cost / baseCost) * 100).toFixed(1)}%`],
      ['Weft Yarn Cost', `${inputs.weftCountNe}s Ne (${results.weftWeightPerMeterGrams} g/m, Crimp: ${inputs.weftCrimpPct}%)`, `${curSymbol} ${results.weft_yarn_cost.toFixed(2)}`, `${((results.weft_yarn_cost / baseCost) * 100).toFixed(1)}%`],
      ['Weaving Charge', `${inputs.weavingCostMethod.replace('_', ' ')} (${inputs.weavingRate})`, `${curSymbol} ${results.weaving_cost.toFixed(2)}`, `${((results.weaving_cost / baseCost) * 100).toFixed(1)}%`],
      ['Sizing & Warping', 'Sizing chemical recipe & beam preparation', `${curSymbol} ${results.sizing_cost.toFixed(2)}`, `${((results.sizing_cost / baseCost) * 100).toFixed(1)}%`],
      ['Grey Fabric Subtotal', 'Combined Greige Manufacturing Cost', `${curSymbol} ${results.grey_fabric_cost.toFixed(2)}`, `${((results.grey_fabric_cost / baseCost) * 100).toFixed(1)}%`],
      ['Processing Operations', 'Pre-treatment, Washing, Stenter, Compactor', `${curSymbol} ${results.processing_cost.toFixed(2)}`, `${((results.processing_cost / baseCost) * 100).toFixed(1)}%`],
      ['Dyeing & Finishing', 'Continuous Reactive / Special Chemical Finish', `${curSymbol} ${(results.dyeing_cost + results.finishing_cost).toFixed(2)}`, `${(((results.dyeing_cost + results.finishing_cost) / baseCost) * 100).toFixed(1)}%`],
      ['Process Wastage / Loss', `Loss across stages (${(100 - results.effectiveYieldPct).toFixed(1)}% buffer)`, `${curSymbol} ${results.wastage_cost.toFixed(2)}`, `${((results.wastage_cost / baseCost) * 100).toFixed(1)}%`],
      ['Transport & Overhead', `${inputs.transportMethod === 'by_weight' ? 'By Weight' : 'Fixed'} + ${inputs.overheadPct}% Overhead`, `${curSymbol} ${(results.transport_cost + results.overhead_cost).toFixed(2)}`, `${(((results.transport_cost + results.overhead_cost) / baseCost) * 100).toFixed(1)}%`],
    ];

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    rows.forEach(([comp, param, cost, share], idx) => {
      y += 5.5;
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 3.8, 182, 5.5, 'F');
      }
      if (comp === 'Grey Fabric Subtotal') {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      doc.text(comp, 18, y);
      doc.text(param, 85, y);
      doc.text(cost, 140, y);
      doc.text(share, 180, y);
    });

    // Commercial Quotation Box
    y += 9;
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(14, y, 182, 38, 2, 2, 'F');
    doc.setDrawColor(99, 102, 241);
    doc.roundedRect(14, y, 182, 38, 2, 2, 'D');

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 27, 75);
    doc.text('3. COMMERCIAL PRICING & INVOICE SUMMARY', 20, y + 6.5);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Production Cost: ${curSymbol} ${results.cost_per_meter.toFixed(2)} / meter (${curSymbol} ${results.cost_per_kg.toFixed(2)} / kg)`, 20, y + 13.5);

    const pricingStrategyLabel = inputs.pricingStrategy === 'margin'
      ? `True Profit Margin (${inputs.targetMarginPct}%): Cost ÷ (1 - Margin%) = +${curSymbol} ${results.margin_amount_per_meter.toFixed(2)}/m`
      : `Markup (${inputs.targetMarkupPct}%): Cost × (1 + Markup%) = +${curSymbol} ${results.margin_amount_per_meter.toFixed(2)}/m`;
    doc.text(pricingStrategyLabel, 20, y + 19.5);

    const taxLabel = inputs.taxMode === 'exclusive'
      ? `Tax (${inputs.taxRatePct}% Exclusive): +${curSymbol} ${results.tax.toFixed(2)}/m`
      : inputs.taxMode === 'inclusive'
      ? `Tax (${inputs.taxRatePct}% Inclusive): Included ${curSymbol} ${results.tax.toFixed(2)}/m`
      : 'Tax: Exempt (0%)';
    doc.text(taxLabel, 20, y + 25.5);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(`Final Invoice Price: ${curSymbol} ${results.final_price.toFixed(2)} / Meter`, 20, y + 33.5);

    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Total Order Value: ${curSymbol} ${results.totalOrderInvoiceValue.toLocaleString()}`, 115, y + 33.5);

    // Terms
    y += 45;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Commercial Terms & Engineering Notes:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('1. Rates are calculated using FabricIQ deterministic engineering formulas and live verified textile indices.', 14, y + 4);
    doc.text('2. Quotation is valid for 7 business days subject to raw material and yarn market variations.', 14, y + 7.5);
    doc.text('3. Physical consumption accounts for warp/weft crimp and multi-stage process yield losses.', 14, y + 11);

    // Signatures
    y += 20;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 70, y);
    doc.line(130, y, 186, y);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('FabricIQ Costing Engineer', 14, y + 4);
    doc.text('Authorized Commercial Signatory', 130, y + 4);

    doc.save(`${estimate.referenceNo}_${estimate.customerName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  }
}

export const estimateService = new EstimateService();
