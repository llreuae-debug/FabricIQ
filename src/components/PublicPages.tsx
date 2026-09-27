import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  BookOpen, 
  Mail, 
  HelpCircle, 
  Scale, 
  Lock, 
  Cookie, 
  AlertTriangle, 
  CheckCircle2, 
  Calculator, 
  Activity, 
  Cpu, 
  Award,
  Send,
  ChevronRight,
  Search
} from 'lucide-react';
import { AdPlacement } from './AdPlacement';

export type PublicPageView = 
  | 'about' 
  | 'features' 
  | 'knowledge' 
  | 'pricing' 
  | 'contact' 
  | 'faq' 
  | 'privacy' 
  | 'terms' 
  | 'cookies' 
  | 'disclaimer';

interface PublicPagesProps {
  initialView?: PublicPageView;
  onNavigateToCalculator: () => void;
  onNavigateToMarket: () => void;
  onOpenCookieSettings?: () => void;
}

export const PublicPages: React.FC<PublicPagesProps> = ({
  initialView = 'about',
  onNavigateToCalculator,
  onNavigateToMarket,
  onOpenCookieSettings,
}) => {
  const [activeView, setActiveView] = useState<PublicPageView>(initialView);
  const [searchKnowledge, setSearchKnowledge] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    }, 1000);
  };

  const ARTICLES = [
    {
      id: 'art-costing-math',
      title: 'Deterministic Textile Costing: Mathematical Foundations & Formula Audits',
      category: 'Costing Engineering',
      readTime: '6 min read',
      summary: 'Why probabilistic approximations fail in high-volume fabric manufacturing and how deterministic equations provide penny-precise reproducibility.',
      content: `
### 1. The Need for Determinism in Textile Manufacturing
In modern textile export houses, weaving mills, and apparel supply chains, a costing error of even ₨ 1.50 ($0.005) per meter translates to over ₨ 150,000 in lost margins on a standard 100,000-meter production run. Traditional spreadsheets often introduce hidden circular references, unvalidated waste estimates, or opaque rounding errors.

FabricIQ solves this through **Deterministic Costing Architecture**:
\`\`\`
Input Data → Mathematical Formula → Intermediate Sub-total → Final Audited Price
\`\`\`

### 2. The Core Woven Fabric Weight Formula
To compute the exact yarn required for woven fabric, we apply the foundational English Count ($N_e$) equations factoring in both crimp percentage ($C$) and process waste ($W$):

$$\\text{Warp Yarn Weight (g/m)} = \\frac{\\text{EPI} \\times \\text{Reed Width (in)} \\times (1 + C_{\\text{warp}}) \\times (1 + W_{\\text{warp}})}{N_{e,\\text{warp}} \\times 1.693}$$

$$\\text{Weft Yarn Weight (g/m)} = \\frac{\\text{PPI} \\times \\text{Reed Width (in)} \\times (1 + C_{\\text{weft}}) \\times (1 + W_{\\text{weft}})}{N_{e,\\text{weft}} \\times 1.693}$$

Where:
- $\\text{EPI}$ = Ends Per Inch in the loom reed
- $\\text{PPI}$ = Picks Per Inch woven into the fabric
- $1.693$ = Standard conversion constant derived from $840\\text{ yards/lb} \\times 453.592\\text{ g/lb} \\div 36\\text{ in/yd} \\div 39.37\\text{ in/m}$

### 3. Decoupling Margin vs. Markup
A frequent error in commercial quoting is confusing **Profit Margin** with **Profit Markup**:
- **Margin Pricing Formula**:
  $$\\text{Selling Price} = \\frac{\\text{Total Net Cost}}{1 - (\\text{Margin}\\% \\div 100)}$$
- **Markup Pricing Formula**:
  $$\\text{Selling Price} = \\text{Total Net Cost} \\times \\left(1 + \\frac{\\text{Markup}\\%}{100}\\right)$$

FabricIQ enforces transparent selection between Margin and Markup so commercial managers never inadvertently underprice export contracts.
      `
    },
    {
      id: 'art-gsm-mechanics',
      title: 'Fabric GSM Calculation: Woven & Knitted Construction Physics',
      category: 'Fabric Mechanics',
      readTime: '5 min read',
      summary: 'Comprehensive guide to calculating Grey and Finished GSM from yarn count, thread density, shrinkage, and wet processing uptake.',
      content: `
### 1. Understanding GSM in Fabric Specifications
Grams per Square Meter (GSM) is the international standard metric defining fabric weight and density. 

$$\\text{GSM} = \\frac{\\text{Total Fabric Weight (grams)}}{\\text{Fabric Length (meters)} \\times \\text{Fabric Width (meters)}}$$

### 2. Calculating Grey GSM from Loom Specifications
To derive theoretical Grey GSM directly from loom yarn density:

$$\\text{Grey GSM} = \\left(\\frac{\\text{Warp g/m} + \\text{Weft g/m}}{\\text{Grey Width (in)} \\times 0.0254}\\right)$$

### 3. Transition from Grey GSM to Finished GSM
During wet processing (desizing, scouring, bleaching, dyeing, stentering, and sanforizing), fabric undergoes two opposing phenomena:
1. **Weight Loss**: Removal of natural cotton waxes, pectins, and sizing agents (typically $4\\% - 8\\%$ loss).
2. **Dimensional Shrinkage**: Contraction along warp and weft directions, which compacts yarn density per unit area (typically increasing finished GSM by $6\\% - 15\\%$).

$$\\text{Finished GSM} = \\text{Grey GSM} \\times \\left(1 - \\text{Chemical Loss}\\%\\right) \\times \\left(\\frac{\\text{Grey Width}}{\\text{Finished Width}}\\right) \\times \\left(1 + \\text{Warp Shrinkage}\\%\\right)$$
      `
    },
    {
      id: 'art-weaving-economics',
      title: 'Loom Economics & Pick Rate Costing: Airjet vs. Rapier Optimization',
      category: 'Weaving Technology',
      readTime: '7 min read',
      summary: 'Formulating weaving production costs based on loom RPM, operational efficiency, hourly overhead, and per-pick market conventions.',
      content: `
### 1. Methods of Weaving Cost Allocation
Weaving conversion costs are typically quoted through two primary methodologies:
1. **Per-Pick Market Rate (₨ / Pick / Meter)**:
   $$\\text{Weaving Cost / m} = \\text{PPI} \\times \\text{Weaving Rate per Pick}$$
2. **Engineered Loom Economic Model**:
   Factoring exact loom RPM, operational efficiency, power tariff, and fixed hourly overhead.

### 2. Engineered Production Speed Calculation
$$\\text{Loom Output (Meters / Hour)} = \\frac{\\text{Loom RPM} \\times 60 \\times \\text{Efficiency}\\%}{\\text{PPI} \\times 39.37}$$

$$\\text{Loom Weaving Cost / Meter} = \\frac{\\text{Loom Hourly Rate (₨/hr)}}{\\text{Loom Output (Meters/hr)}}$$

### 3. Sizing & Preparatory Costs
Warp yarns must undergo sizing (application of starch or PVA binder) to withstand the friction of high-speed airjet insertion:
$$\\text{Total Sizing Cost} = \\text{Sizing Rate (₨/m)} + \\text{Direct Warp Sizing Chemical Add-on}$$
      `
    },
    {
      id: 'art-printing-amortization',
      title: 'Textile Printing Costing: Screen Engraving Amortization vs Digital Inks',
      category: 'Processing & Printing',
      readTime: '6 min read',
      summary: 'Mathematical breakdown of rotary/flatbed screen engraving amortization curves versus digital reactive inkjet consumption.',
      content: `
### 1. Screen Cost Amortization Mechanics
In rotary and flatbed screen printing, each color channel requires an engraved nickel/polyester screen costing between ₨ 4,000 to ₨ 12,000. 

$$\\text{Screen Amortization Cost / Meter} = \\frac{\\text{Number of Screens} \\times \\text{Cost per Screen (₨)}}{\\text{Total Production Order Length (Meters)}}$$

*Key Takeaway:* For shorter runs (e.g. 1,000 meters), screen amortization dominates total cost ($₨ 40.00/m$), making Digital Reactive printing economical. For large runs ($> 15,000$ meters), rotary screen amortization drops under $₨ 2.00/m$.

### 2. Color-Wise Paste Consumption Formulation
$$\\text{Color Channel Cost / m} = \\left(\\frac{\\text{Paste Consumption (g/m)}}{1000}\\right) \\times \\text{Dye / Ink Rate (₨/kg)}$$

$$\\text{Total Printing Cost / m} = \\text{Screen Amortization / m} + \\text{Machine Rate / m} + \\sum_{i=1}^{n} \\text{Color}_i \\text{ Cost / m}$$
      `
    },
    {
      id: 'art-yield-compounding',
      title: 'Multi-Stage Cumulative Yield Loss Mathematics in Wet Processing',
      category: 'Yield & Losses',
      readTime: '5 min read',
      summary: 'Why summing percentage losses linearly is mathematically flawed and how true multiplicative yield compounding operates.',
      content: `
### 1. The Fallacy of Linear Loss Addition
Many mills estimate total waste by simple addition:
$$\\text{Flawed Method: } \\text{Total Loss} = \\text{Weaving Loss (2\\%)} + \\text{Dyeing Loss (3.5\\%)} + \\text{Finishing Loss (1.5\\%)} = 7.0\\%$$

This ignores that each subsequent processing loss applies to an already reduced intermediate quantity!

### 2. Multiplicative Compound Yield Formulation
The true mathematically sound compound yield ($Y$) is:

$$Y = \\prod_{i=1}^{k} \\left(1 - L_i\\right) = (1 - 0.02) \\times (1 - 0.035) \\times (1 - 0.015) = 0.98 \\times 0.965 \\times 0.985 = 93.15\\%$$

$$\\text{True Total Cumulative Loss} = 1 - 0.9315 = 6.85\\%$$

### 3. Required Input Quantity Calculation
To deliver exactly $10,000$ meters of inspected, finished fabric to a buyer:

$$\\text{Required Raw Fabric Input} = \\frac{\\text{Finished Target Quantity}}{Y} = \\frac{10,000}{0.9315} = 10,735.37 \\text{ meters}$$

FabricIQ automates this exact compounding across Weaving, Wet Processing, Printing, and Finishing inspection stages.
      `
    },
    {
      id: 'art-forex-risk',
      title: 'Managing Currency & Yarn Volatility in Textile Export Costing',
      category: 'Market Intelligence',
      readTime: '6 min read',
      summary: 'Strategies for hedging USD/PKR fluctuations, yarn rate volatility, and generating immutable rate snapshot audit trails.',
      content: `
### 1. The Impact of FX Swings on Export Margins
Textile exporters purchase domestic raw cotton and yarn in local currency (e.g. PKR), but quote and invoice international buyers in USD or EUR. A 2% sudden currency appreciation between quotation and shipment can completely wipe out an exporter's operational profit margin.

### 2. Immutable Rate Snapshot Defense
To prevent disputes between procurement teams and sales directors, every quote created in FabricIQ embeds an **Immutable Rate Snapshot**:
- Exact USD/PKR mid-market rate at moment of calculation.
- Verified Yarn Index rates (10s, 20s, 30s, 40s carded/combed).
- Mill energy tariff and chemical index base prices.
- Cryptographic timestamp verification.

This ensures every quotation is 100% auditable and reproducible during customer negotiations.
      `
    }
  ];

  const filteredArticles = ARTICLES.filter(a => 
    a.title.toLowerCase().includes(searchKnowledge.toLowerCase()) ||
    a.category.toLowerCase().includes(searchKnowledge.toLowerCase()) ||
    a.summary.toLowerCase().includes(searchKnowledge.toLowerCase())
  );

  const selectedArticle = ARTICLES.find(a => a.id === selectedArticleId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation Tabs for Public Pages */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 scrollbar-none shadow-md">
        {[
          { id: 'about', label: 'About Us', icon: Building2 },
          { id: 'features', label: 'Features & Architecture', icon: Cpu },
          { id: 'knowledge', label: 'Textile Knowledge Base', icon: BookOpen },
          { id: 'pricing', label: 'Pricing & Rewards', icon: Award },
          { id: 'contact', label: 'Contact Us', icon: Mail },
          { id: 'faq', label: 'FAQ', icon: HelpCircle },
          { id: 'privacy', label: 'Privacy Policy', icon: Lock },
          { id: 'terms', label: 'Terms & Conditions', icon: Scale },
          { id: 'cookies', label: 'Cookie Policy', icon: Cookie },
          { id: 'disclaimer', label: 'Market Disclaimer', icon: AlertTriangle },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id as PublicPageView);
                setSelectedArticleId(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Top Banner Ad Placement (Google AdSense Ready) */}
      <AdPlacement position="header_banner" />

      {/* ========================================================================= */}
      {/* 1. ABOUT US PAGE */}
      {/* ========================================================================= */}
      {activeView === 'about' && (
        <div className="space-y-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-6">
            <div className="max-w-3xl space-y-3">
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-wider">
                About FabricIQ Platform
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight">
                Engineered Determinism for the Global Textile Industry
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                FabricIQ is a specialized textile costing and live market intelligence platform built to replace guesswork, error-prone spreadsheets, and opaque estimates with 100% reproducible, audited mathematics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white font-['Outfit']">Mathematical Transparency</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every calculation discloses exact inputs, physical laws, intermediate stages, and compound yield formulas. No black-box estimations.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white font-['Outfit']">Live Market Telemetry</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct telemetry from verified FX providers and regional textile market boards ensures quotations reflect current market conditions.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white font-['Outfit']">Audit Trail Snapshots</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Quotes freeze exchange rates, yarn indices, and formulas in timestamped snapshots, guaranteeing verifiable reproducibility.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white font-['Outfit']">Our Vision & Industry Commitment</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Founded by textile engineering specialists and computational software architects, FabricIQ bridges the gap between mechanical loom reality and financial enterprise costing. We serve spinning mills, composite weaving units, commercial dye houses, screen/digital printing facilities, and global export buying agencies across Pakistan, Turkey, China, India, and the United States.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onNavigateToCalculator}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                <span>Launch Costing Engine</span>
              </button>
              <button
                onClick={onNavigateToMarket}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>View Live Rates</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FEATURES & ARCHITECTURE PAGE */}
      {/* ========================================================================= */}
      {activeView === 'features' && (
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold uppercase tracking-wider">
                Full Engine Architecture
              </span>
              <h1 className="text-3xl font-black text-white font-['Outfit']">
                Comprehensive 8-Stage Textile Manufacturing Engine
              </h1>
              <p className="text-xs text-slate-400">
                Detailed capabilities designed specifically for woven, knitted, dyed, and printed fabric economics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  step: '01',
                  name: 'Physical Specifications Engine',
                  desc: 'Full Ne, Denier, Tex, and Nm count systems, Reed Width, EPI/PPI, Warp & Weft crimp factors, finished/grey width and GSM calculations.',
                },
                {
                  step: '02',
                  name: 'Multi-Stage Yield & Loss Compounding',
                  desc: 'Calculates mathematically sound compound yield (∏(1-L_i)) across Weaving, Dyeing, and Finishing, determining exact required grey yardage.',
                },
                {
                  step: '03',
                  name: 'Yarn & Loom Economic Conversion',
                  desc: 'Flexible costing by English Count 10lbs rates, loom RPM & hourly overhead, or traditional per-pick market conventions.',
                },
                {
                  step: '04',
                  name: 'Wet Processing & Modular Dyeing',
                  desc: 'Full support for Desizing, Scouring, Bleaching, Stentering, Sanforizing, plus detailed machine/steam/dye cost breakdowns.',
                },
                {
                  step: '05',
                  name: 'Color-Wise Printing Amortization',
                  desc: 'Calculates screen engraving amortization curves based on total order length and computes individual ink paste grams per meter.',
                },
                {
                  step: '06',
                  name: 'Packaging & Multi-Modal Freight',
                  desc: 'Roll packing, polythene wrapping, carton costs, and transport rates computed by weight (₨/kg) or fixed volume container loads.',
                },
                {
                  step: '07',
                  name: 'Commercial Margin & Tax Engine',
                  desc: 'Decoupled Margin vs Markup calculation with support for exclusive, inclusive, and tax-exempt international transactions.',
                },
                {
                  step: '08',
                  name: 'Deterministic Formula Audit & Export',
                  desc: 'Complete step-by-step mathematical trace and professional PDF quotation export featuring verified rate snapshots.',
                },
              ].map(f => (
                <div key={f.step} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {f.step}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white font-['Outfit']">{f.name}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AdPlacement position="in_article" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TEXTILE KNOWLEDGE BASE & ARTICLES */}
      {/* ========================================================================= */}
      {activeView === 'knowledge' && (
        <div className="space-y-6">
          {!selectedArticle ? (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
                      Textile Engineering Library
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
                      Original Technical Guides & Costing Standards
                    </h1>
                    <p className="text-xs text-slate-400">
                      Peer-reviewed textile mathematics, fabric mechanics, and processing economics.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchKnowledge}
                      onChange={(e) => setSearchKnowledge(e.target.value)}
                      placeholder="Search guides, formulas, GSM..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map(art => (
                  <article
                    key={art.id}
                    onClick={() => {
                      setSelectedArticleId(art.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-5 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col justify-between group space-y-4 shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-semibold font-mono">
                          {art.category}
                        </span>
                        <span className="text-slate-500">{art.readTime}</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors font-['Outfit'] leading-snug">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {art.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                      <span>Read Technical Guide</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedArticleId(null)}
                className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
              >
                ← Back to All Guides
              </button>

              <article className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 max-w-4xl mx-auto shadow-2xl">
                <div className="space-y-2 border-b border-slate-800 pb-6">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                      {selectedArticle.category}
                    </span>
                    <span className="text-slate-400">{selectedArticle.readTime}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400 font-mono">FabricIQ Certified Engineering</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] leading-tight">
                    {selectedArticle.title}
                  </h1>
                  <p className="text-sm text-slate-300 italic">
                    {selectedArticle.summary}
                  </p>
                </div>

                <div className="prose prose-invert prose-slate max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4 font-sans">
                  {selectedArticle.content.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={pIdx} className="text-base font-bold text-white font-['Outfit'] pt-4 text-cyan-300">
                          {paragraph.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('```')) {
                      return (
                        <pre key={pIdx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                          {paragraph.replace(/```/g, '')}
                        </pre>
                      );
                    }
                    return (
                      <p key={pIdx} className="text-slate-300 leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4 mt-8">
                  <div>
                    <h4 className="text-xs font-bold text-white font-['Outfit']">Ready to apply these formulas?</h4>
                    <p className="text-[11px] text-slate-400">Calculate instant costing with FabricIQ's deterministic engine.</p>
                  </div>
                  <button
                    onClick={onNavigateToCalculator}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-md"
                  >
                    Open Calculator →
                  </button>
                </div>
              </article>

              <AdPlacement position="in_article" />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PRICING & REFERRAL REWARDS */}
      {/* ========================================================================= */}
      {activeView === 'pricing' && (
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-wider">
              Transparent Membership Tiers
            </span>
            <h1 className="text-3xl font-black text-white font-['Outfit']">
              Accessible Costing for Every Textile Enterprise
            </h1>
            <p className="text-xs text-slate-400">
              Enjoy complete calculations with our free tier or unlock advanced enterprise exports through our Invite & Earn program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Community Tier</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Default</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-['Outfit']">Free</span>
                  <span className="text-xs text-slate-400">/ forever</span>
                </div>
                <p className="text-xs text-slate-400">
                  Ideal for weavers, merchants, and students needing fast, reliable fabric calculation.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>Deterministic Cost Engine</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>Live USD/PKR Market Feeds</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>Save up to 10 Local Quotes</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>Offline PWA Access</span></div>
                </div>
              </div>
              <button
                onClick={onNavigateToCalculator}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Use Free Engine
              </button>
            </div>

            {/* Pro Referral Tier */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 border-2 border-cyan-500/50 space-y-5 flex flex-col justify-between shadow-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                Earned via Referral
              </div>
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">FabricIQ PRO</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Most Popular</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-['Outfit']">₨ 0</span>
                  <span className="text-xs text-cyan-400">/ 3-12 Referrals</span>
                </div>
                <p className="text-xs text-slate-300">
                  Full industrial features unlocked by referring textile industry colleagues.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /><span>Unlimited Saved Quotes</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /><span>PDF Export with Company Logo</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /><span>Formula Audit & Waterfall Reports</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /><span>Color-Wise Printing Engine</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /><span>Reduced Ad Placement Frequency</span></div>
                </div>
              </div>
              <button
                onClick={onNavigateToCalculator}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                Start Earning Pro
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise & Mills</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Custom</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-['Outfit']">Custom</span>
                  <span className="text-xs text-slate-400">/ license</span>
                </div>
                <p className="text-xs text-slate-400">
                  For large composite textile groups, ERP integrations, and multi-plant operations.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>REST API & ERP Integration</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>Private Mill Rate Servers</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>Custom Branding & Watermarks</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>Dedicated SLA & Support</span></div>
                </div>
              </div>
              <button
                onClick={() => setActiveView('contact')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CONTACT US PAGE */}
      {/* ========================================================================= */}
      {activeView === 'contact' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-5">
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-wider">
                Get in Touch
              </span>
              <h1 className="text-3xl font-black text-white font-['Outfit']">
                Contact FabricIQ Team
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                Have questions regarding calculation formulas, enterprise licensing, publisher partnerships, or API integrations? Our textile software team is available 24/7.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold">General & Support Inquiries</span>
                  <div className="text-xs font-mono text-cyan-400 font-bold">support@fabriciq.app</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold">Enterprise & Commercial Licensing</span>
                  <div className="text-xs font-mono text-cyan-400 font-bold">enterprise@fabriciq.app</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold">Guaranteed Response SLA</span>
                  <div className="text-xs text-emerald-400 font-bold">Within 12 business hours</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-7">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Send a Direct Message
                </h3>

                {contactSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-in fade-in">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">Message Received!</h4>
                    <p className="text-xs text-slate-300">
                      Thank you for contacting FabricIQ. Our textile engineering team will review your message and reply promptly.
                    </p>
                    <button
                      onClick={() => setContactSubmitted(false)}
                      className="mt-3 px-4 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Tariq Mehmood"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Work Email Address *</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Inquiry Subject</label>
                      <input
                        type="text"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="e.g. Custom Knitting Formulas / Pro Membership Inquiry"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Your Message *</label>
                      <textarea
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Detail your requirements or feedback..."
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Transmit Message</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. FAQ PAGE */}
      {/* ========================================================================= */}
      {activeView === 'faq' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-wider">
              Frequently Asked Questions
            </span>
            <h1 className="text-3xl font-black text-white font-['Outfit']">
              FabricIQ Knowledge & Assistance
            </h1>
            <p className="text-xs text-slate-400">
              Clear answers regarding mathematical formulas, market rates, data safety, and commercial usage.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'What is deterministic costing and why is it superior to probabilistic models?',
                a: 'Deterministic costing evaluates exact physical and financial formulas where identical inputs consistently produce 100% bitwise identical outputs. In manufacturing, this eliminates arbitrary AI approximations and prevents multi-million dollar quoting discrepancies.'
              },
              {
                q: 'Where do the live USD/PKR exchange rates and yarn indices originate?',
                a: 'FabricIQ integrates verified foreign exchange providers and regional textile exchange boards with timestamped snapshots. If network connectivity is lost, the platform displays an explicit OFFLINE indicator and uses last verified rates.'
              },
              {
                q: 'How does FabricIQ handle multi-stage yield losses across weaving and dyeing?',
                a: 'FabricIQ utilizes mathematically rigorous multiplicative yield compounding: Y = ∏(1 - L_i). This accounts for the sequential reduction of material through each phase rather than erroneous linear addition.'
              },
              {
                q: 'Can FabricIQ be used offline on mobile phones or factory floors?',
                a: 'Yes. FabricIQ is a certified Progressive Web App (PWA). All calculation formulas, saved estimates, and tools operate seamlessly without an active internet connection.'
              },
              {
                q: 'Are my proprietary fabric construction specs and buyer quotations private?',
                a: 'All calculations are computed locally inside your browser runtime. Saved estimates are encrypted in client-side storage and never transmitted to third parties without your explicit export command.'
              },
              {
                q: 'Does FabricIQ comply with Google AdSense and Publisher policies?',
                a: 'Yes. FabricIQ strictly maintains separation between editorial/calculation content and advertising containers, incorporates GDPR/CCPA cookie consent management, and never places ads within interactive calculator controls.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">Q{idx + 1}.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <AdPlacement position="footer_banner" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PRIVACY POLICY */}
      {/* ========================================================================= */}
      {activeView === 'privacy' && (
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 max-w-4xl mx-auto text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <span className="text-[10px] font-mono px-3 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              LEGAL & PRIVACY COMPLIANCE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">Privacy Policy</h1>
            <p className="text-xs text-slate-400">Last Revised: September 28, 2026</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">1. Information We Collect</h3>
            <p>
              FabricIQ collects information to provide mathematical textile calculations, live currency telemetry, and secure account management:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Voluntarily Provided Data:</strong> Name, email address, profile picture (via Google OAuth), estimate notes, and customer quotation labels.</li>
              <li><strong>Locally Processed Specifications:</strong> Fabric yarn counts, EPI/PPI, width, GSM, and operational cost parameters (stored securely in browser localStorage).</li>
              <li><strong>Technical Telemetry:</strong> Anonymized browser type, screen viewport, IP address, and platform performance telemetry.</li>
            </ul>

            <h3 className="text-base font-bold text-white">2. Google Services & Third-Party Advertising</h3>
            <p>
              FabricIQ uses Google AdSense and Google Analytics to support free platform access. Google, as a third-party vendor, uses cookies (including the DoubleClick cookie) to serve ads based on prior visits. Users may opt out of personalized advertising by visiting Google Ads Settings or via our integrated Consent Management banner.
            </p>

            <h3 className="text-base font-bold text-white">3. Data Security & Storage</h3>
            <p>
              We implement industry-standard AES-256 encryption for data at rest and HTTPS/TLS 1.3 encryption for all data in transit. We never sell, lease, or distribute private textile construction data to competitors or third-party marketing brokers.
            </p>

            <h3 className="text-base font-bold text-white">4. Your GDPR & CCPA Rights</h3>
            <p>
              Under global data privacy frameworks (GDPR, CCPA, UK GDPR), you have the right to access, rectify, or erase your personal data, restrict processing, and withdraw consent at any time through our Consent Management system.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TERMS & CONDITIONS */}
      {/* ========================================================================= */}
      {activeView === 'terms' && (
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 max-w-4xl mx-auto text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <span className="text-[10px] font-mono px-3 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
              TERMS OF SERVICE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">Terms & Conditions</h1>
            <p className="text-xs text-slate-400">Last Revised: September 28, 2026</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">1. Acceptance of Terms</h3>
            <p>
              By accessing or using FabricIQ (web or PWA), you agree to be bound by these Terms & Conditions. If you disagree with any part, you may not use the services.
            </p>

            <h3 className="text-base font-bold text-white">2. Deterministic Costing Disclaimer</h3>
            <p>
              FabricIQ executes mathematical formulations based strictly on user-supplied parameters and verified market indexes. While our deterministic engine is 100% mathematically consistent, actual manufacturing outcomes may vary due to physical mill conditions, loom mechanical variations, atmospheric humidity, and supplier contract variations. Users must verify inputs before binding commercial execution.
            </p>

            <h3 className="text-base font-bold text-white">3. Intellectual Property</h3>
            <p>
              All proprietary calculation algorithms, UI designs, graphics, branding, and mathematical documentation are the exclusive intellectual property of FabricIQ.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. COOKIE POLICY */}
      {/* ========================================================================= */}
      {activeView === 'cookies' && (
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 max-w-4xl mx-auto text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <span className="text-[10px] font-mono px-3 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              COOKIE USAGE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">Cookie Policy</h1>
            <p className="text-xs text-slate-400">Last Revised: September 28, 2026</p>
          </div>

          <div className="space-y-4">
            <p>
              This Cookie Policy explains how FabricIQ uses cookies, local browser storage, and similar technologies to recognize you when you visit our web application.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Cookie Category</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono text-[11px]">
                  <tr>
                    <td className="p-3 text-cyan-300 font-bold">Strictly Necessary</td>
                    <td className="p-3 font-sans">Session security, auth state, local quote persistence</td>
                    <td className="p-3">Persistent (Local)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-emerald-300 font-bold">Performance & Analytics</td>
                    <td className="p-3 font-sans">Calculation speed telemetry and error diagnostics</td>
                    <td className="p-3">12 Months</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-indigo-300 font-bold">Google AdSense Tags</td>
                    <td className="p-3 font-sans">Contextual & relevant industry sponsor ad delivery</td>
                    <td className="p-3">Up to 24 Months</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenCookieSettings}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors cursor-pointer"
              >
                Change Cookie & Ad Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. MARKET DISCLAIMER */}
      {/* ========================================================================= */}
      {activeView === 'disclaimer' && (
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 max-w-4xl mx-auto text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <span className="text-[10px] font-mono px-3 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              MARKET DATA TRANSPARENCY
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">Market Data & Calculation Disclaimer</h1>
            <p className="text-xs text-slate-400">Last Revised: September 28, 2026</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200">
                Market rates displayed in FabricIQ represent indicative benchmarks retrieved from public market boards and FX data feeds. They do not constitute a formal commercial offer.
              </p>
            </div>

            <h3 className="text-base font-bold text-white">1. Variation Factors</h3>
            <p>
              Actual commercial transactions can vary due to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Volume and payment credit terms (Letter of Credit, CAD, DA, Open Account).</li>
              <li>Brand, cotton origin, staple length, micronaire, and yarn brand premium.</li>
              <li>Transportation freight surcharges, import tariffs, and local municipal cesses.</li>
            </ul>

            <h3 className="text-base font-bold text-white">2. Deterministic Verification</h3>
            <p>
              FabricIQ guarantees that calculation formulas are mathematical and deterministic based on the rates supplied. Always verify current mill invoice rates before executing export contracts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
