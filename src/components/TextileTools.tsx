import React, { useState } from 'react';
import { 
  Layers, 
  Repeat, 
  Scale, 
  Package, 
  Sparkles
} from 'lucide-react';
import { convertYarnCount } from '../services/calculationEngine';
import type { YarnCountSystem } from '../types';

interface TextileToolsProps {
  initialTool?: string;
}

export const TextileTools: React.FC<TextileToolsProps> = ({ initialTool }) => {
  const [activeSubTool, setActiveSubTool] = useState<string>(initialTool || 'converter');

  // Tool 1: Yarn Count Converter State
  const [yarnVal, setYarnVal] = useState<number>(20);
  const [fromUnit, setFromUnit] = useState<YarnCountSystem>('Ne');

  // Tool 2: GSM & Weight Estimator State
  const [gsmWarpNe, setGsmWarpNe] = useState<number>(20);
  const [gsmWeftNe, setGsmWeftNe] = useState<number>(20);
  const [gsmEpi, setGsmEpi] = useState<number>(60);
  const [gsmPpi, setGsmPpi] = useState<number>(60);
  const [gsmWidth, setGsmWidth] = useState<number>(63);
  const [gsmCrimp, setGsmCrimp] = useState<number>(5.5);

  const calcGsm = (
    ((gsmEpi * (1 + gsmCrimp / 100)) / Math.max(0.1, gsmWarpNe) +
      (gsmPpi * (1 + gsmCrimp / 100)) / Math.max(0.1, gsmWeftNe)) *
    23.287
  ).toFixed(1);
  const ozSqYd = (Number(calcGsm) / 33.906).toFixed(2);
  const linearGramsPerMeter = (Number(calcGsm) * (gsmWidth * 0.0254)).toFixed(1);

  // Tool 3: Yarn Sourcing & Bags Planner
  const [planOrderMeters, setPlanOrderMeters] = useState<number>(50000);
  const [planGsm, setPlanGsm] = useState<number>(180);
  const [planWastage, setPlanWastage] = useState<number>(4);

  const totalKg = ((planOrderMeters * (gsmWidth * 0.0254) * planGsm) / 1000) * (1 + planWastage / 100);
  const total100lbBags = totalKg / 45.3592;
  const total10lbBags = totalKg / 4.53592;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Specialized Textile Engineering Calculators
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Professional yarn count conversions, physical GSM analysis, and production yarn sourcing planners
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto scrollbar-none">
          {[
            { id: 'converter', label: 'Yarn Converter' },
            { id: 'gsm', label: 'GSM & Weight' },
            { id: 'sourcing', label: 'Yarn Sourcing Bags' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTool(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeSubTool === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tool 1: Yarn Count Converter */}
      {activeSubTool === 'converter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Repeat className="w-4 h-4 text-indigo-400" />
              <span>Input Yarn Count</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Count Number / Value
              </label>
              <input
                type="number"
                value={yarnVal}
                onChange={(e) => setYarnVal(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-base font-bold text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Input System
              </label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Ne">English Cotton Count (Ne) - Indirect</option>
                <option value="Nm">Metric Count (Nm) - Indirect</option>
                <option value="Denier">Denier (D / Td) - Direct (Filament)</option>
                <option value="Tex">Tex (g/1000m) - Direct Metric</option>
                <option value="Dtex">Decitex (Dtex) - Direct</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <p>• <strong>Indirect System (Ne, Nm):</strong> Higher number = Finer yarn.</p>
              <p>• <strong>Direct System (Denier, Tex):</strong> Higher number = Heavier/coarser yarn.</p>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Equivalent Yarn Counts Across Global Systems</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { unit: 'Ne', title: 'English Cotton Count', desc: '840 yds / lb' },
                { unit: 'Nm', title: 'Metric Count', desc: '1000m / kg' },
                { unit: 'Denier', title: 'Denier (D)', desc: 'g / 9,000m' },
                { unit: 'Tex', title: 'Tex', desc: 'g / 1,000m' },
                { unit: 'dTex', title: 'Decitex (dTex)', desc: 'g / 10,000m' },
              ].map((item) => {
                const converted = convertYarnCount(yarnVal, fromUnit, item.unit as YarnCountSystem);
                const isCurrent = fromUnit === item.unit;

                return (
                  <div
                    key={item.unit}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-indigo-950/40 border-indigo-500/40 shadow-md'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>{item.title}</span>
                      <span className="text-[10px] text-slate-500">{item.desc}</span>
                    </div>
                    <div className="text-2xl font-extrabold text-white font-mono">
                      {converted} <span className="text-xs font-normal text-indigo-400">{item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tool 2: GSM & Weight Calculator */}
      {activeSubTool === 'gsm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span>Fabric Construction Parameters</span>
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Warp Count (Ne)</label>
                <input
                  type="number"
                  value={gsmWarpNe}
                  onChange={(e) => setGsmWarpNe(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Weft Count (Ne)</label>
                <input
                  type="number"
                  value={gsmWeftNe}
                  onChange={(e) => setGsmWeftNe(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">EPI (Ends/Inch)</label>
                <input
                  type="number"
                  value={gsmEpi}
                  onChange={(e) => setGsmEpi(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">PPI (Picks/Inch)</label>
                <input
                  type="number"
                  value={gsmPpi}
                  onChange={(e) => setGsmPpi(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Finished Width (Inches)</label>
                <input
                  type="number"
                  value={gsmWidth}
                  onChange={(e) => setGsmWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Crimp Allowance %</label>
                <input
                  type="number"
                  step="0.5"
                  value={gsmCrimp}
                  onChange={(e) => setGsmCrimp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-4">
                Calculated Fabric Weight & Densities
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30">
                  <span className="text-xs text-slate-400 block mb-1">Theoretical Grey GSM</span>
                  <div className="text-3xl font-black text-white font-['Outfit']">
                    {calcGsm} <span className="text-sm text-indigo-400 font-medium">g/m²</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Ounces Per Square Yard</span>
                  <div className="text-3xl font-black text-slate-200 font-['Outfit']">
                    {ozSqYd} <span className="text-sm text-slate-400 font-medium">oz/yd²</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 sm:col-span-2">
                  <span className="text-xs text-slate-400 block mb-1">Linear Meter Weight ({gsmWidth}" width)</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    {linearGramsPerMeter} <span className="text-xs text-slate-400 font-normal">grams / linear meter</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-800">
              * Note: Finished woven fabric GSM typically increases by ~3% - 6% after scouring and dyeing shrinkage.
            </p>
          </div>
        </div>
      )}

      {/* Tool 3: Sourcing Bags Planner */}
      {activeSubTool === 'sourcing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-400" />
              <span>Order Sizing Requirements</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Fabric Order (Linear Meters)
              </label>
              <input
                type="number"
                value={planOrderMeters}
                onChange={(e) => setPlanOrderMeters(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fabric GSM (g/m²)
              </label>
              <input
                type="number"
                value={planGsm}
                onChange={(e) => setPlanGsm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Wastage & Sizing Buffer %
              </label>
              <input
                type="number"
                step="0.5"
                value={planWastage}
                onChange={(e) => setPlanWastage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">
              Raw Yarn Procurement Requirement
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30">
                <span className="text-xs text-slate-400 block mb-1">Total Yarn Needed (Kg)</span>
                <div className="text-3xl font-extrabold text-white font-mono">
                  {totalKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xs text-indigo-400">kg</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Total Weight in Pounds</span>
                <div className="text-3xl font-extrabold text-slate-200 font-mono">
                  {(totalKg * 2.20462).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-slate-400">lbs</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Standard 100-lb Export Bags</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {Math.ceil(total100lbBags).toLocaleString()} <span className="text-xs text-slate-400">Bags</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Standard 10-lb Local Bags</span>
                <div className="text-2xl font-bold text-indigo-400 font-mono">
                  {Math.ceil(total10lbBags).toLocaleString()} <span className="text-xs text-slate-400">Bags</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
