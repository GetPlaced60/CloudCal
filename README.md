# 🧮 AWS Architecture Cost Estimator

A high-performance, interactive, client-side web application designed to replace the official AWS Pricing Calculator for modern architectures, providing **instant calculations**, **100% mathematical accuracy against official AWS pricing**, and **zero-initial-cost starting states**.

Built with **React 19**, **Vite 8**, **Tailwind CSS v4**, and **Recharts**.

> 📖 **Full Project & Calculation Documentation**: See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for complete mathematical formulas, service breakdowns, and architectural details.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

To run the automated verification suite:
```bash
node scripts/verify-all-services.mjs
```

To create a production build:
```bash
npm run build
```

---

## 🌟 Key Highlights & Differentiators

- **Zero-Initial-Cost Starting Screen**: Begins cleanly at `$0.00` total monthly cost with `0 of 10` services selected. An interactive service catalog allows users to add services on demand.
- **100% Calculation Parity with AWS Calculator**: Verified against official AWS pricing with 49/49 test cases passing across all 10 services and 9 regions.
- **Searchable EC2 Instance Selector**: Custom combobox filtering 177+ EC2 instance types across 9 regions by name, family, vCPU, RAM, architecture, or workload category (AMD, ARM Graviton, GPU, Intel Xeon).
- **Multi-Server Tier Management**: Add, duplicate, rename, toggle, or configure independent server groups (Web, App, DB, Workers) with custom dedicated EBS volumes.
- **9 Supported AWS Regions**: Instant recalculation across US East, US West, Europe (Ireland/Frankfurt), Asia Pacific (Mumbai, Singapore, Tokyo), and South America.
- **Side-by-Side Savings Plans & Spot Comparison**: 1-click comparison modal showing costs and percentage savings across all 8 commitment models.
- **Client-Side Export**: High-resolution branded PDF reports, CSV spreadsheets, and JSON backup/restore.

---

## 📦 Supported AWS Services (10 Services)

| Service | Supported Configuration & Formulas |
| :--- | :--- |
| **🌍 Amazon EC2** | 177+ instances across 9 regions, custom running hours, OS licensing (Amazon Linux, Ubuntu Pro, Windows, RHEL, SUSE), Savings Plans & Spot pricing, 100GB global free tier egress. |
| **💾 Amazon EBS** | Volume types (`gp3`, `gp2`, `io1`, `io2`, `st1`, `sc1`), provisioned IOPS, throughput, and incremental snapshot storage across all 9 AWS regions. |
| **🚪 AWS NAT Gateway** | Multi-AZ gateway instance hours + GB data processed through NAT (with exact regional rates). |
| **⚖️ Elastic Load Balancing** | Application Load Balancer (ALB) and Network Load Balancer (NLB) with hourly runtime + LCU/NCU capacity charges across all 9 regions. |
| **📦 Amazon S3** | All storage classes (Standard, Standard-IA, Glacier, Glacier Deep Archive), regional PUT/GET request fees, and egress transfer. |
| **🔒 Amazon VPC & PrivateLink** | Interface VPC endpoints (PrivateLink), free gateway endpoints, VPC peering data transfer, and Public IPv4 address allocation ($0.005/hr). |
| **🌐 Amazon Route 53** | Hosted zones ($0.50/zone), standard & latency DNS queries ($0.40-$0.70/million), health checks, and domain renewals. |
| **⚡ Amazon CloudFront** | Multi-region tiered edge data transfer out to the internet, HTTP and HTTPS requests, and free tier support. |
| **📊 Amazon CloudWatch** | Custom metrics, alarms, dashboards, log ingestion ($0.50/GB in US, $0.67/GB in Mumbai, $0.76/GB in Tokyo), and archival storage. |
| **📧 SES & 🔔 SNS** | Transactional emails with EC2 62K free tier discount, dedicated IPs, API publish requests, and multi-channel notification deliveries. |

---

## 🧪 Automated Verification Suite

Run the automated test runner to verify calculation accuracy against the official AWS Pricing Calculator:

```bash
node scripts/verify-all-services.mjs
```

```
===============================================================
       AWS PRICING CALCULATOR VERIFICATION SUITE (ALL SERVICES)
===============================================================

--- 1. EC2 Virtual Servers ---
  [PASS] m6a.large Ubuntu Pro in Mumbai (Pure compute): $43.11 (expected: $43.11)
  [PASS] m6a.4xlarge Ubuntu Pro in Mumbai (Pure compute): $344.85 (expected: $344.85)
  [PASS] r6a.2xlarge Linux in Mumbai (Pure compute): $208.78 (expected: $208.78)
  [PASS] m6a.large Windows in US East (Pure compute): $130.23 (expected: $130.23)
  [PASS] c6i.xlarge RHEL in US East: $167.9 (expected: $167.9)
  [PASS] Spot instance receives ~65% discount: $21.72 (expected: $21.72)
  [PASS] EC2 3-Year SP No Upfront computes properly: $true (expected: $true)
  [PASS] Unselected EC2 instance compute cost is 0: $0 (expected: $0)
  [PASS] Unselected EC2 total cost equals attached EBS ($2.40): $2.4 (expected: $2.4)
  [PASS] EC2 data transfer <= 100GB is $0 (Free Tier): $0 (expected: $0)
  [PASS] EC2 data transfer 150GB in US East (50GB billable @ $0.09): $4.5 (expected: $4.5)

--- 2. EBS Block Storage ---
  [PASS] 100 GB gp3 in US East (Baseline IOPS/throughput): $8 (expected: $8)
  [PASS] 100 GB gp3 in Mumbai (Baseline IOPS/throughput): $9.12 (expected: $9.12)
  [PASS] 100 GB gp3 in Frankfurt ($0.0952/GB): $9.52 (expected: $9.52)
  [PASS] 100 GB gp3 in Sao Paulo ($0.152/GB): $15.2 (expected: $15.2)
  [PASS] gp3 Provisioned IOPS & Throughput in US East: $16 (expected: $16)
  [PASS] 100 GB io1 with 2000 IOPS in US East: $142.5 (expected: $142.5)
  [PASS] 50 GB EBS snapshots in US East ($0.05/GB): $2.5 (expected: $2.5)

--- 3. NAT Gateway ---
  [PASS] NAT GW in US East (1 GW, 100 GB): $37.35 (expected: $37.35)
  [PASS] NAT GW in Mumbai (1 GW, 100 GB): $46.48 (expected: $46.48)
  [PASS] NAT GW in Frankfurt (1 GW, 100 GB): $43.16 (expected: $43.16)
  [PASS] NAT GW in Sao Paulo (1 GW, 100 GB): $77.19 (expected: $77.19)

--- 4. Elastic Load Balancing (ALB / NLB) ---
  [PASS] ALB in US East (1 ALB, 2 LCUs): $28.11 (expected: $28.11)
  [PASS] ALB in Mumbai (1 ALB, 2 LCUs): $29.13 (expected: $29.13)
  [PASS] NLB in US East (1 NLB, 2 NCUs): $25.19 (expected: $25.19)
  [PASS] ALB in Sao Paulo (1 ALB, 2 LCUs): $40.88 (expected: $40.88)

--- 5. Amazon S3 ---
  [PASS] S3 Standard in US East (500 GB): $11.59 (expected: $11.59)
  [PASS] S3 Standard in Mumbai (500 GB): $12.59 (expected: $12.59)
  [PASS] S3 Standard-IA in US East (1,000 GB): $12.7 (expected: $12.7)
  [PASS] S3 Glacier in US East (1,000 GB): $3.94 (expected: $3.94)
  [PASS] S3 Deep Archive in US East (5,000 GB): $5.49 (expected: $5.49)

--- 6. VPC & PrivateLink ---
  [PASS] VPC in US East (1 endpoint, 20 GB, 1 IPv4): $11.15 (expected: $11.15)
  [PASS] VPC in Mumbai (1 endpoint @ $0.013/hr, 1 IPv4): $13.34 (expected: $13.34)
  [PASS] VPC in Frankfurt (2 endpoints, 50 GB, 2 IPv4): $25.32 (expected: $25.32)

--- 7. Amazon Route 53 (Global) ---
  [PASS] Route 53 (2 zones, 5M queries): $3 (expected: $3)
  [PASS] Route 53 with 1 .com domain: $4.08 (expected: $4.08)
  [PASS] Route 53 latency routing and HTTPS checks: $5 (expected: $5)

--- 8. Amazon CloudFront (Global CDN) ---
  [PASS] CloudFront in US East (500 GB, 10M HTTP, 10M HTTPS): $60 (expected: $60)
  [PASS] CloudFront in Mumbai Edge ($0.109/GB, $0.009 HTTP, $0.012 HTTPS): $75.5 (expected: $75.5)
  [PASS] CloudFront with Free Tier applied (<1024GB, <10M reqs): $0 (expected: $0)

--- 9. Amazon CloudWatch ---
  [PASS] CloudWatch in US East (20 metrics, 20 GB logs): $13 (expected: $13)
  [PASS] CloudWatch in Mumbai (20 metrics, 20 GB logs @ $0.67/GB): $16.4 (expected: $16.4)
  [PASS] CloudWatch in Tokyo (20 metrics, 50 GB logs @ $0.76/GB): $41 (expected: $41)

--- 10. SES & SNS ---
  [PASS] SES (100K emails from EC2): $3.8 (expected: $3.8)
  [PASS] SES (100K emails from external/on-prem): $10 (expected: $10)
  [PASS] SES Dedicated IP ($24.95/mo): $24.95 (expected: $24.95)
  [PASS] SNS (5M requests): $2 (expected: $2)
  [PASS] SNS (500K HTTP deliveries): $0.24 (expected: $0.24)
  [PASS] SNS (100K Email deliveries): $1.98 (expected: $1.98)

===============================================================
VERIFICATION SUMMARY: 49/49 Tests Passed (100%)
===============================================================
```

---

## 📄 License
MIT License.
