# TexCost Intelligence Platform (Yarn & Textile Cost Estimation Platform)

A modern, production-ready **Textile Cost Estimation & Market Rate Platform** engineered for yarn spinners, weaving mills, wet processing dyehouses, and commercial fabric traders.

---

## 🌟 Key Features

### 1. Authentic Textile Calculation Engine
Calculates complete fabric costing using standard textile engineering formulas:
- **Warp Weight per linear yard (lbs)**: $\frac{\text{EPI} \times \text{Width (in)} \times (1 + \text{Warp Crimp \%})}{840 \times \text{Warp Count (Ne)}}$
- **Weft Weight per linear yard (lbs)**: $\frac{\text{PPI} \times \text{Width (in)} \times (1 + \text{Weft Crimp \%})}{840 \times \text{Weft Count (Ne)}}$
- **Metric Weight (g/m)**: Converted from imperial constants ($1\text{ yd} = 0.9144\text{ m}$, $1\text{ lb} = 453.592\text{ g}$)
- **Theoretical Grey GSM & Finished GSM**: Physical weight distribution with shrinkage buffer
- **Weaving & Sizing Costs**: Airjet / Shuttleless per pick or per meter
- **Wet Processing & Finishing**: Continuous bleaching, reactive/vat/disperse dyeing, printing, DWR, and special finishes
- **Wastage Allowance & Freight**: Production loss buffers and door-to-port logistics
- **Margin & Break-Even Analysis**: Target margin percentage with suggested selling prices per meter, per kg, and per yard.

### 2. Live Market Rates & Verification Architecture
- Verified benchmarks across:
  - **Cotton Yarn** (10/1 Carded, 16/1 Carded, 20/1 Carded, 30/1 Combed, 40/1 Combed)
  - **Polyester & Blends** (150D DTY, 75D FDY, 52/48 PC Blend 30s)
  - **Grey Fabric** (Sheeting 20x20, Heavy Twill 16x12, Fine Poplin 40x40, Duck Canvas)
  - **Weaving & Processing** (Airjet pick rates, Continuous Bleaching, Reactive Dyeing, Vat Dyeing)
  - **Chemicals, Energy & Forex** (Caustic soda, Industrial gas, USD/PKR)
- Transparent indicators: `LIVE`, `MANUAL`, `ESTIMATED`, with source, timestamp, and 24h change %.
- **Source Transparency Modal**: View origin exchange (KCA, Faisalabad Yarn Exchange, APTMA, APTPMA), last verified timestamp, and 7-Day price trend chart.

### 3. Multi-Currency Engine & Auto-Detection
- Real-time conversion between: **PKR (₨)**, **USD ($)**, **EUR (€)**, **GBP (£)**, **AED (د.إ)**, **SAR (﷼)**, **CNY (¥)**, **INR (₹)**, **TRY (₺)**.
- Automatic locale and timezone intelligence modal on initial launch.
- Live timestamped exchange rates with offline fallback.

### 4. Comprehensive Multi-Language System (i18n & RTL)
- Full support for:
  - 🌐 **English** (LTR)
  - 🌐 **اردو** (Urdu - RTL)
  - 🌐 **中文** (Chinese Simplified - LTR)
  - 🌐 **Türkçe** (Turkish - LTR)
  - 🌐 **العربية** (Arabic - RTL)
- Dynamic document layout switching (`dir="rtl"` with Noto Nastaliq Urdu / Cairo typography).

### 5. Saved Estimates & Commercial PDF Tech Packs
- Save, duplicate, search, and manage quotations.
- **Frozen Rate Snapshots**: Ensures quotations retain historical market rates even when current market rates fluctuate.
- One-click **Commercial Quotation PDF Generator** (jsPDF) with specification breakdown, cost shares, payment terms, and signature blocks.

### 6. Specialized Textile Engineering Tools
- **Yarn Count Converter**: Convert between Ne (English), Nm (Metric), Denier (D), Tex, and Dtex.
- **GSM & Fabric Weight Estimator**: Physical weight analysis from EPI/PPI/Counts.
- **Yarn Sourcing & Bag Planner**: Compute required yarn weight in kg, lbs, 100-lb export bags, and 10-lb local bags.

### 7. Admin Panel & Control Center
- Override live rates with audit logging (`Who changed, What changed, Old value, New value, Timestamp`).
- Add new custom commodities and update exchange rates.
- Approved spinning & weaving suppliers registry.
- External API connectors and health monitor.

### 8. Offline First & Fast Local Storage
- LocalStorage persistence for market rates, settings, and saved estimates.
- Auto-sync on network reconnect.

---

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Build Production Bundle
```bash
npm run build
```
