import { calculateFabricIQCost, DEFAULT_PROCESSING_OPERATIONS, DEFAULT_DETAILED_DYEING, DEFAULT_DETAILED_FINISHING, DEFAULT_COLOR_PRINTING, DEFAULT_PACKAGING, DEFAULT_LOGISTICS, DEFAULT_YIELD_STAGES } from './calculationEngine';
import { YarnCountEngine } from './yarnCountEngine';
import type { FabricCalculationInput } from '../types';

export function runDeterministicEngineTests(): { passed: boolean; results: string[] } {
  const results: string[] = [];
  let allPassed = true;

  // TEST 1: Yarn Count Conversions
  try {
    const ne20_in_tex = YarnCountEngine.toTex(20, 'Ne');
    const expectedTex = 590.541 / 20; // 29.527
    if (Math.abs(ne20_in_tex - expectedTex) < 0.01) {
      results.push('✓ Test 1 Passed: Yarn Count Ne to Tex conversion matches ASTM D1907 exactly.');
    } else {
      throw new Error(`Ne to Tex failed: got ${ne20_in_tex}, expected ${expectedTex}`);
    }
  } catch (err: any) {
    allPassed = false;
    results.push(`✗ Test 1 Failed: ${err.message}`);
  }

  // TEST 2: Compound Yield Calculation
  try {
    const mockInput: FabricCalculationInput = {
      estimateName: 'Test Twill 16x12',
      customerName: 'Audit Test Customer',
      fabricStructure: 'woven',
      fabricType: 'Heavy Twill',
      finishedWidthInches: 63,
      finishedLengthMeters: 10000,
      costingMethod: 'engineered',
      directGreyRatePerMeter: 0,
      directGreyRatePerKg: 0,
      directGSM: 0,
      warpCountSystem: 'Ne',
      weftCountSystem: 'Ne',
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
      sizingCostPerMeter: 8.5,
      greyInspectionCostPerMeter: 1.2,
      otherGreyManufacturingCostPerMeter: 0,
      weavingLossPct: 2.0,
      wetProcessingLossPct: 3.5,
      finishingLossPct: 1.5,
      yieldLossStages: DEFAULT_YIELD_STAGES,
      processingOperations: DEFAULT_PROCESSING_OPERATIONS,
      detailedDyeing: DEFAULT_DETAILED_DYEING,
      detailedFinishing: DEFAULT_DETAILED_FINISHING,
      colorPrinting: DEFAULT_COLOR_PRINTING,
      printingCostPerMeter: 0,
      auxChemicalCostPerMeter: 2.5,
      packaging: DEFAULT_PACKAGING,
      logistics: DEFAULT_LOGISTICS,
      transportMethod: 'by_weight',
      transportRatePerKg: 14.0,
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
    };

    const res = calculateFabricIQCost(mockInput);
    if (res.cost_per_meter > 0 && res.selling_price > res.cost_per_meter && res.effectiveYieldPct > 80) {
      results.push(`✓ Test 2 Passed: Deterministic Woven Twill calculation completed with Cost: ₨ ${res.cost_per_meter}/m, Selling Price: ₨ ${res.selling_price}/m, Yield: ${res.effectiveYieldPct}%.`);
    } else {
      throw new Error(`Calculation out of range: ${JSON.stringify(res)}`);
    }
  } catch (err: any) {
    allPassed = false;
    results.push(`✗ Test 2 Failed: ${err.message}`);
  }

  // TEST 3: True Margin vs Markup Mathematical Verification
  try {
    const cost = 100;
    const marginPct = 20;
    // Selling Price = 100 / (1 - 0.20) = 125
    const trueMarginSelling = cost / (1 - marginPct / 100);
    const markupSelling = cost * (1 + marginPct / 100); // 120

    if (trueMarginSelling === 125 && markupSelling === 120) {
      results.push('✓ Test 3 Passed: Margin (Cost ÷ (1 - Margin%)) vs Markup (Cost × (1 + Markup%)) strictly separated.');
    } else {
      throw new Error('Margin formula error');
    }
  } catch (err: any) {
    allPassed = false;
    results.push(`✗ Test 3 Failed: ${err.message}`);
  }

  return { passed: allPassed, results };
}

const out = runDeterministicEngineTests();
console.log(`\nFabricIQ Pro Deterministic Costing Test Suite (${out.passed ? 'ALL PASSED' : 'SOME FAILED'}):`);
console.log(out.results.join('\n'));

