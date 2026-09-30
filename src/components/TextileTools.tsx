import React, { useState } from 'react';
import { 
  Repeat, 
  Scale, 
  Package, 
  Wrench
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
      
      {/* 1. Header Card */}
      <div className="card-soft-lg p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[12px] bg-[#6EA8FF]/15 border border-[#6EA8FF]/30 flex items-center justify-center text-[#3B82F6] dark:text-[#67E8F9]">
              <Wrench className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-['Outfit'] tracking-tight">
              Textile Engineering Tools
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            High-precision yarn count conversions, theoretical GSM mechanics, and yarn bag sourcing planners.
          </p>
        </div>

        <div className="flex items-center bg-[var(--surface-subtle)] p-1 rounded-[16px] border border-[var(--border-subtle)] text-xs gap-1">
          {[
            { id: 'converter', label: 'Yarn Converter' },
            { id: 'gsm', label: 'GSM & Weight' },
            { id: 'sourcing', label: 'Yarn Sourcing Bags' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTool(tab.id)}
              className={`btn-tactile px-3.5 py-1.5 rounded-[12px] font-bold whitespace-nowrap cursor-pointer border ${
                activeSubTool === tab.id
                  ? 'bg-[var(--surface)] text-[#3B82F6] dark:text-[#67E8F9] border-[var(--border-subtle)] shadow-[var(--shadow-soft-sm)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-transparent'
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
          <div className="lg:col-span-5 card-soft p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Repeat className="w-4 h-4 text-[#6EA8FF]" />
              <span>Input Yarn Count</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Count Number / Value
              </label>
              <input
                type="number"
                step="any"
                value={yarnVal}
                onChange={(e) => setYarnVal(parseFloat(e.target.value) || 0)}
                className="input-soft w-full px-3.5 py-2.5 text-sm font-tabular font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Input Count System
              </label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value as YarnCountSystem)}
                className="input-soft w-full px-3.5 py-2.5 text-xs font-semibold cursor-pointer"
              >
                <option value="Ne">Ne (English Cotton Count)</option>
                <option value="Nm">Nm (Metric Count)</option>
                <option value="Denier">Denier (Filament / Poly)</option>
                <option value="Tex">Tex (Direct Metric System)</option>
                <option value="Dtex">Decitex (Dtex)</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-7 card-soft-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] font-['Outfit']">
              Equivalent Count Conversions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {(['Ne', 'Nm', 'Denier', 'Tex', 'Dtex'] as YarnCountSystem[]).map((sys) => {
                const converted = convertYarnCount(yarnVal, fromUnit, sys);
                return (
                  <div key={sys} className="card-soft-inset p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] font-mono">{sys} System</span>
                    <div className="text-xl font-bold font-tabular text-[#3B82F6] dark:text-[#67E8F9]">
                      {converted.toFixed(2)} <span className="text-xs font-normal text-[var(--text-muted)]">{sys}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tool 2: GSM & Weight Estimator */}
      {activeSubTool === 'gsm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-6 card-soft p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#6EE7B7]" />
              <span>Fabric Construction Parameters</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Warp Count (Ne)</label>
                <input
                  type="number"
                  value={gsmWarpNe}
                  onChange={(e) => setGsmWarpNe(parseFloat(e.target.value) || 1)}
                  className="input-soft w-full px-3 py-2 font-tabular"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Weft Count (Ne)</label>
                <input
                  type="number"
                  value={gsmWeftNe}
                  onChange={(e) => setGsmWeftNe(parseFloat(e.target.value) || 1)}
                  className="input-soft w-full px-3 py-2 font-tabular"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Warp EPI</label>
                <input
                  type="number"
                  value={gsmEpi}
                  onChange={(e) => setGsmEpi(parseFloat(e.target.value) || 1)}
                  className="input-soft w-full px-3 py-2 font-tabular"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Weft PPI</label>
                <input
                  type="number"
                  value={gsmPpi}
                  onChange={(e) => setGsmPpi(parseFloat(e.target.value) || 1)}
                  className="input-soft w-full px-3 py-2 font-tabular"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Fabric Width (in)</label>
                <input
                  type="number"
                  value={gsmWidth}
                  onChange={(e) => setGsmWidth(parseFloat(e.target.value) || 1)}
                  className="input-soft w-full px-3 py-2 font-tabular"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Crimp & Contraction (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={gsmCrimp}
                  onChange={(e) => setGsmCrimp(parseFloat(e.target.value) || 0)}
                  className="input-soft w-full px-3 py-2 font-tabular"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 card-soft-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] font-['Outfit']">
              Calculated Fabric Weights
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="card-soft-inset p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Calculated GSM</span>
                <span className="text-2xl font-bold font-tabular text-[#10B981] dark:text-[#6EE7B7]">{calcGsm}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">g/m²</span>
              </div>
              <div className="card-soft-inset p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Ounces / Sq. Yard</span>
                <span className="text-2xl font-bold font-tabular text-[#3B82F6] dark:text-[#67E8F9]">{ozSqYd}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">oz/yd²</span>
              </div>
              <div className="card-soft-inset p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Linear Weight</span>
                <span className="text-2xl font-bold font-tabular text-[#8B5CF6] dark:text-[#C4B5FD]">{linearGramsPerMeter}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">g / meter</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 3: Yarn Sourcing Bags Planner */}
      {activeSubTool === 'sourcing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-5 card-soft p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FDBA74]" />
              <span>Order Sourcing Target</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Target Order Length (m)</label>
                <input
                  type="number"
                  value={planOrderMeters}
                  onChange={(e) => setPlanOrderMeters(parseFloat(e.target.value) || 0)}
                  className="input-soft w-full px-3 py-2 font-tabular"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Fabric GSM</label>
                <input
                  type="number"
                  value={planGsm}
                  onChange={(e) => setPlanGsm(parseFloat(e.target.value) || 0)}
                  className="input-soft w-full px-3 py-2 font-tabular"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Total Process Waste %</label>
                <input
                  type="number"
                  value={planWastage}
                  onChange={(e) => setPlanWastage(parseFloat(e.target.value) || 0)}
                  className="input-soft w-full px-3 py-2 font-tabular"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 card-soft-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] font-['Outfit']">
              Required Yarn Sourcing Quantities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="card-soft-inset p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Total Net Yarn</span>
                <span className="text-2xl font-bold font-tabular text-[var(--text-primary)]">{totalKg.toFixed(0)}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">Kilograms</span>
              </div>
              <div className="card-soft-inset p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">100 lbs Bags</span>
                <span className="text-2xl font-bold font-tabular text-[#3B82F6] dark:text-[#67E8F9]">{total100lbBags.toFixed(1)}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">Bags</span>
              </div>
              <div className="card-soft-inset p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">10 lbs Bags</span>
                <span className="text-2xl font-bold font-tabular text-[#10B981] dark:text-[#6EE7B7]">{total10lbBags.toFixed(0)}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">10-lb Packages</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
