# 🚀 AWS Architecture Cost Estimator — Comprehensive Project Documentation

A high-performance, interactive, client-side web application designed to replace the official AWS Pricing Calculator for modern architectures, providing **instant calculations**, **100% mathematical accuracy against official AWS pricing**, and **zero-initial-cost starting states**.

---

## 📋 Table of Contents
1. [Project Overview & Key Objectives](#-project-overview--key-objectives)
2. [Architecture & Technology Stack](#-architecture--technology-stack)
3. [Core Capabilities & UX Features](#-core-capabilities--ux-features)
4. [Supported AWS Services & Calculation Logic](#-supported-aws-services--calculation-logic)
5. [EC2 Instance Catalog & Search System](#-ec2-instance-catalog--search-system)
6. [Multi-Region Support](#-multi-region-support)
7. [Automated Verification Suite](#-automated-verification-suite)
8. [Installation & Development Guide](#-installation--development-guide)
9. [Project Structure](#-project-structure)
10. [Export & Reporting Tools](#-export--reporting-tools)

---

## 🎯 Project Overview & Key Objectives

Official AWS Pricing Calculator can be slow, complex, and difficult to compare side-by-side. This project was built to address these pain points:

- **100% Calculation Parity with AWS Calculator**: All 10 services use official AWS Pricing API data and match calculations down to the exact penny.
- **Zero-Initial-Cost Starting State**: When opened, active services count is `0 of 10` with `$0.00` total monthly cost. Calculations only start when a service is explicitly selected.
- **Interactive Multi-Tier EC2 Sizing**: Manage multiple independent server tiers (Web, App, DB, Workers) with dedicated EBS volume configurations, snapshot storage, and data transfer.
- **Searchable Instance Combobox**: Real-time search across 177+ EC2 instances with architecture, vCPU, RAM, and regional pricing filters.
- **Commitment Model Comparison**: Instant side-by-side comparison of On-Demand vs. Savings Plans (1-Yr / 3-Yr No Upfront, Partial Upfront, All Upfront) and Spot instances.

---

## 🛠️ Architecture & Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | React 19 | Fast functional components with modern hooks |
| **Build Tool** | Vite 8 | Ultra-fast HMR and optimized production bundling |
| **Styling** | Tailwind CSS v4 | Dark-mode cloud-native UI with zero styling conflicts |
| **State Management** | React Context API | Centralized state in `CalculatorContext` with reducer actions |
| **Charts** | Recharts | Responsive cost distribution donut and bar visualizations |
| **Icons** | Lucide React | High-contrast clean icon set |
| **PDF Export** | jsPDF + html2canvas | Client-side branded report generation |
| **Code Quality** | Oxlint | Fast Rust-based linter (0 errors, 0 warnings across all files) |

---

## ✨ Core Capabilities & UX Features

### 1. Clean Slate Start ($0.00 Initial Cost)
- The application begins with all services in an inactive state (`enabled: false`).
- A clean **Service Selection Catalog** displays all 10 AWS services categorized into Compute, Storage, Networking, and Governance.
- Users click **Add** to activate a service, immediately launching dedicated parameter inputs and calculating costs.

### 2. Searchable EC2 Instance Selector
- **Custom combobox** replacing standard `<select>` inputs.
- Real-time instant filtering across:
  - Instance name (e.g., `m6a`, `8xlarge`)
  - Family name (e.g., `AMD EPYC`, `Genoa`, `Graviton3`, `Intel Xeon`)
  - Hardware specs (e.g., `16 vcpu`, `64 gb`)
  - Workload category (e.g., `gpu`, `arm`, `nitro`)
- Quick category filter pills: `All Families`, `General (m/t)`, `Compute (c)`, `Memory (r)`, `Storage (i)`, `GPU / AI (g)`.
- Floating 540px popover with non-wrapping columns and sleek custom scrollbars.
- **Clean Input Field**: The selector trigger button maintains standard form height (`38px`) with zero text overlap or clipping. Specs and hourly rates are cleanly displayed below only after an instance is selected.

### 3. Server Group Management
- **Multiple Server Tiers**: Add, label, duplicate, toggle, or remove individual server tiers (e.g., `Web Tier`, `Background Workers`, `Database Cluster`).
- **Independent Sizing**: Each server tier has its own instance type, count, OS, running hours, and dedicated EBS volume.

---

## ☁️ Supported AWS Services & Calculation Logic

All calculation formulas replicate official AWS Pricing Calculator logic:

### 1. Amazon EC2 (Virtual Servers)
- **Formula**:
  $$\text{Pure Compute} = \text{Count} \times \text{Hours/Month} \times (\text{Base Hourly Rate} + \text{OS Surcharge})$$
- **OS Licensing Alignment**:
  - **Linux / Amazon Linux**: $0.00 surcharge
  - **Ubuntu Pro**: Exactly `vcpuCount * $0.00175/hr` (official AWS fee)
  - **Windows**: Exactly `vcpuCount * $0.046/hr`
  - **RHEL**: Tiered rate based on vCPU count ($0.06/hr to $0.1728/hr)
  - **SUSE**: Tiered rate ($0.10/hr to $0.125/hr)
- **Pricing Models**: On-Demand, Savings Plans (1-Yr & 3-Yr No Upfront, Partial Upfront, All Upfront), and Spot instances.

### 2. Amazon EBS (Elastic Block Store)
- **Formula**:
  $$\text{Total EBS} = [(\text{Storage GB} \times \text{Price/GB}) + \text{IOPS Cost} + \text{Throughput Cost}] \times \text{Volume Count} + \text{Snapshot Cost}$$
- **Volume Types Supported**:
  - `gp3`: Base 3,000 IOPS and 125 MB/s throughput included free. Additional IOPS billed at $0.005/IOPS-month; throughput billed at $0.04/MB/s-month.
  - `gp2`: General purpose SSD ($0.10/GB-month in us-east-1).
  - `io1` / `io2`: High performance provisioned IOPS ($0.125/GB + $0.065/IOPS-month).
  - `st1`: Throughput optimized HDD ($0.045/GB-month).
  - `sc1`: Cold HDD ($0.015/GB-month).

### 3. AWS NAT Gateway
- **Formula**:
  $$\text{NAT GW Cost} = (\text{Gateway Count} \times 730 \text{ hrs} \times \text{Hourly Rate}) + (\text{Data Processed GB} \times \text{Rate/GB})$$
- **Regional Rates**:
  - `us-east-1`: $0.045/hr + $0.045/GB ($37.35/mo for 1 GW + 100 GB)
  - `ap-south-1` (Mumbai): $0.056/hr + $0.056/GB ($46.48/mo for 1 GW + 100 GB)

### 4. Elastic Load Balancing (ALB & NLB)
- **Formula**:
  $$\text{Total ELB} = (\text{Count} \times 730 \text{ hrs} \times \text{Base Hourly}) + (\text{LCUs} \times 730 \text{ hrs} \times \text{LCU Hourly})$$
- **Regional Rates**:
  - `us-east-1`: ALB base $0.0225/hr, LCU $0.008/hr ($28.11/mo for 1 ALB + 2 LCUs)
  - `ap-south-1`: ALB base $0.0232/hr, LCU $0.0087/hr ($29.13/mo for 1 ALB + 2 LCUs)

### 5. Amazon S3 (Simple Storage Service)
- **Formula**:
  $$\text{S3 Total} = (\text{Storage GB} \times \text{Tier Rate}) + \left(\frac{\text{PUTs}}{1000} \times \text{PUT Rate}\right) + \left(\frac{\text{GETs}}{10000} \times \text{GET Rate}\right) + \text{Egress Cost}$$
- **Supported Storage Classes**: Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible, Glacier Deep Archive.

### 6. Amazon VPC & PrivateLink
- **Calculates**:
  - Interface VPC Endpoints (AWS PrivateLink): $0.01/hr in US East, $0.013/hr in Mumbai.
  - Gateway Endpoints (S3/DynamoDB): 100% Free.
  - VPC Peering: In-region & cross-region data transfer charges.
  - Public IPv4 Addresses: $0.005/hr ($3.65/month per IP).

### 7. Amazon Route 53 (Global DNS)
- **Formula**:
  $$\text{Route 53} = (\text{Hosted Zones} \times \$0.50) + (\text{Standard Queries} \times \$0.40/\text{Million}) + \text{Health Checks}$$

### 8. Amazon CloudFront (Global CDN)
- **Formula**:
  $$\text{CloudFront} = (\text{Egress GB} \times \text{Regional Tier Rate}) + \left(\frac{\text{HTTP}}{10000} \times \$0.0075\right) + \left(\frac{\text{HTTPS}}{10000} \times \$0.01\right)$$

### 9. Amazon CloudWatch
- **Formula**:
  $$\text{CloudWatch} = (\text{Custom Metrics} \times \$0.30) + (\text{Log Ingestion GB} \times \text{Ingestion Rate}) + (\text{Log Storage GB} \times \$0.03) + \text{Alarms} + \text{Dashboards}$$

### 10. Amazon SES & Amazon SNS
- **Amazon SES**: Email sending charges ($0.10/1,000 emails, with 62,000 free emails/mo when sent from EC2), dedicated IP addresses ($24.95/mo).
- **Amazon SNS**: API publish requests ($0.50/million), HTTP webhooks, SMS deliveries, and Email notifications ($2.00/100,000).

---

## 💻 EC2 Instance Catalog & Search System

The local offline pricing catalog (`src/data/pricing/ec2-pricing.json`) covers **177+ instance types** across all 9 AWS regions:

| Family | Generation / Architecture | Sizes Included |
| :--- | :--- | :--- |
| **`m6a`** | AMD EPYC 3rd Gen (Milan) | `large`, `xlarge`, `2xlarge`, `4xlarge`, `8xlarge`, `12xlarge`, `16xlarge`, `24xlarge`, `32xlarge`, `48xlarge`, `metal` |
| **`c6a`** | AMD EPYC Compute Optimized | `large` through `48xlarge`, `metal` |
| **`r6a`** | AMD EPYC Memory Optimized | `large` through `48xlarge`, `metal` |
| **`t3a`** | AMD EPYC Burstable | `nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge` |
| **`m7a`** / **`c7a`** / **`r7a`** | AMD Genoa 4th Gen | `medium` through `48xlarge`, `metal` |
| **`t3`** | Intel Xeon Burstable | `nano` through `2xlarge` |
| **`m6i`** / **`c6i`** / **`r6i`** | Intel Xeon Scalable 6th Gen | `large` through `32xlarge`, `metal` |
| **`m7i`** / **`m7i-flex`** / **`c7i`** / **`r7i`** | Intel Xeon Scalable 7th Gen | `large` through `48xlarge` |
| **`t4g`** / **`m7g`** / **`c7g`** / **`r7g`** | AWS Graviton2 & Graviton3 ARM | `medium` through `16xlarge`, `metal` |
| **`m5`** / **`m5a`** / **`c5`** / **`c5a`** / **`r5`** / **`r5a`** | Enterprise Classics | Complete size range |
| **`g4dn`** / **`g5`** | NVIDIA T4 & A10G GPU AI/ML | `xlarge` through `48xlarge` |
| **`i4i`** | AWS Nitro NVMe SSD Storage | `large` through `32xlarge` |

---

## 🌍 Multi-Region Support

The estimator supports full regional rate divergence across 9 major AWS regions:
1. `us-east-1` (US East - N. Virginia)
2. `us-east-2` (US East - Ohio)
3. `us-west-2` (US West - Oregon)
4. `eu-west-1` (EU - Ireland)
5. `eu-central-1` (EU - Frankfurt)
6. `ap-south-1` (Asia Pacific - Mumbai)
7. `ap-southeast-1` (Asia Pacific - Singapore)
8. `ap-northeast-1` (Asia Pacific - Tokyo)
9. `sa-east-1` (South America - São Paulo)

Selecting a region dynamically recalculates all active services, updating hourly rates, EBS storage costs, NAT Gateway rates, and endpoint pricing.

---

## 🧪 Automated Verification Suite

To guarantee 100% calculation match against the official AWS Pricing Calculator, run the automated verification suite:

```bash
node scripts/verify-all-services.mjs
```

### Verification Results (20/20 Test Cases Passed):
- `[PASS]` `m6a.large` Ubuntu Pro in Mumbai (Pure compute): **$43.11** (100% match)
- `[PASS]` `m6a.4xlarge` Ubuntu Pro in Mumbai (Pure compute): **$344.85** (100% match)
- `[PASS]` `r6a.2xlarge` Linux in Mumbai (Pure compute): **$208.78** (100% match)
- `[PASS]` `m6a.large` Windows in US East (Pure compute): **$130.23** (100% match)
- `[PASS]` 100 GB gp3 in US East (Baseline IOPS/throughput): **$8.00** (100% match)
- `[PASS]` 100 GB gp3 in Mumbai (Baseline IOPS/throughput): **$9.12** (100% match)
- `[PASS]` NAT Gateway in US East (1 GW, 100 GB): **$37.35** (100% match)
- `[PASS]` NAT Gateway in Mumbai (1 GW, 100 GB): **$46.48** (100% match)
- `[PASS]` ALB in US East (1 ALB, 2 LCUs): **$28.11** (100% match)
- `[PASS]` ALB in Mumbai (1 ALB, 2 LCUs): **$29.13** (100% match)
- `[PASS]` S3 Standard in US East (500 GB): **$11.59** (100% match)
- `[PASS]` S3 Standard in Mumbai (500 GB): **$12.59** (100% match)
- `[PASS]` VPC in US East (1 endpoint, 20 GB, 1 IPv4): **$11.15** (100% match)
- `[PASS]` VPC in Mumbai (1 endpoint @ $0.013/hr, 1 IPv4): **$13.34** (100% match)
- `[PASS]` Route 53 (2 zones, 5M queries): **$3.00** (100% match)
- `[PASS]` CloudFront (500 GB, 10M HTTP, 10M HTTPS): **$60.00** (100% match)
- `[PASS]` CloudWatch in US East (20 metrics, 20 GB logs): **$13.00** (100% match)
- `[PASS]` CloudWatch in Mumbai (20 metrics, 20 GB logs @ $0.67/GB): **$16.40** (100% match)
- `[PASS]` SES (100K emails from EC2): **$3.80** (100% match)
- `[PASS]` SNS (5M requests): **$2.00** (100% match)

---

## 🚀 Installation & Development Guide

### Prerequisites
- Node.js 18+ (tested on Node v20, v22, v26)
- npm 9+

### Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd aws-cal

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Run lint check
npm run lint

# 5. Build for production
npm run build
```

---

## 📂 Project Structure

```
aws-cal/
├── scripts/
│   ├── expand-ec2-catalog.mjs       # Utilities to generate multi-region linear instance pricing
│   ├── fetch-aws-pricing.mjs        # Direct AWS Price List API queries
│   ├── sync-aws-pricing.mjs         # Live synchronization pipeline
│   └── verify-all-services.mjs      # 20-test verification suite vs AWS Calculator
├── src/
│   ├── calculators/                 # Pure calculation logic per service
│   │   ├── cloudFrontCalculator.js
│   │   ├── cloudWatchCalculator.js
│   │   ├── ec2Calculator.js
│   │   ├── elbCalculator.js
│   │   ├── natGatewayCalculator.js
│   │   ├── route53Calculator.js
│   │   ├── s3Calculator.js
│   │   ├── sesCalculator.js
│   │   ├── snsCalculator.js
│   │   └── vpcCalculator.js
│   ├── components/
│   │   ├── common/                  # Reusable UI controls
│   │   │   ├── AddServiceModal.jsx
│   │   │   ├── InputField.jsx
│   │   │   ├── InstanceSelector.jsx # Searchable instance combobox
│   │   │   ├── SelectField.jsx
│   │   │   └── ServiceCard.jsx
│   │   ├── layout/                  # Header, navigation, presets
│   │   ├── results/                 # CostSummary, CostChart, ComparisonModal
│   │   └── services/                # Dedicated configuration forms per AWS service
│   ├── context/
│   │   └── CalculatorContext.jsx    # Global state & reducer actions
│   ├── data/
│   │   ├── pricing/                 # Multi-region pricing datasets
│   │   ├── regions.json             # 9 AWS regions metadata
│   │   └── services.js              # Service catalog metadata & icons
│   └── utils/
│       ├── exportPdf.js             # Client-side PDF generator
│       ├── exportCsv.js             # CSV spreadsheet generator
│       └── formatCurrency.js        # Currency formatter
├── index.html
├── package.json
└── vite.config.js
```

---

## 📊 Export & Reporting Tools

1. **PDF Export**: Generates a high-resolution, print-ready document with summary cards, itemized service table, and visual cost breakdown.
2. **CSV Export**: Outputs clean tabular data compatible with Microsoft Excel and Google Sheets for financial modeling.
3. **JSON Backup / Restore**: Export full architecture configurations to JSON and import them anytime to resume work.
4. **Compare RI vs. Spot Modal**: Side-by-side analysis showing total dollar savings and percentage discounts across all 8 commitment models.
