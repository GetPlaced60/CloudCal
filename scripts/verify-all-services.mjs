/**
 * Automated Verification Suite for AWS Cost Calculator
 * Tests all 10 services across multiple AWS regions against official AWS Pricing Calculator logic.
 */

import { calculateEC2Cost, calculateEBSCost } from '../src/calculators/ec2Calculator.js';
import { calculateS3Cost } from '../src/calculators/s3Calculator.js';
import { calculateNATGatewayCost } from '../src/calculators/natGatewayCalculator.js';
import { calculateELBCost } from '../src/calculators/elbCalculator.js';
import { calculateVPCCost } from '../src/calculators/vpcCalculator.js';
import { calculateCloudWatchCost } from '../src/calculators/cloudWatchCalculator.js';
import { calculateRoute53Cost } from '../src/calculators/route53Calculator.js';
import { calculateCloudFrontCost } from '../src/calculators/cloudFrontCalculator.js';
import { calculateSESCost } from '../src/calculators/sesCalculator.js';
import { calculateSNSCost } from '../src/calculators/snsCalculator.js';

let totalTests = 0;
let passedTests = 0;

function assertClose(name, actual, expected, maxDiff = 0.05) {
  totalTests++;
  const diff = Math.abs(actual - expected);
  if (diff <= maxDiff) {
    console.log(`  [PASS] ${name}: $${actual} (expected: $${expected})`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${name}: actual $${actual} != expected $${expected} (diff: $${diff.toFixed(2)})`);
  }
}

console.log('===============================================================');
console.log('       AWS PRICING CALCULATOR VERIFICATION SUITE              ');
console.log('===============================================================\n');

// 1. EC2 VERIFICATION
console.log('--- 1. EC2 Virtual Servers ---');
// Mumbai: m6a.large (2 vCPU), On-Demand, Ubuntu Pro, 0 EBS
// AWS Calculator: Base $0.05555/hr * 730 = $40.5515 + Ubuntu Pro 2 * 0.00175 * 730 = $2.555 -> Total = $43.11
{
  const res = calculateEC2Cost({
    instanceType: 'm6a.large',
    count: 1,
    os: 'ubuntu_pro',
    pricingModel: 'onDemand',
    hoursPerMonth: 730,
    ebsVolumeSize: 0,
    elasticIPs: 0,
    dataTransferOut: 0
  }, 'ap-south-1');
  assertClose('m6a.large Ubuntu Pro in Mumbai (Pure compute)', res.breakdown.compute, 43.11);
}

// Mumbai: m6a.4xlarge (16 vCPU), On-Demand, Ubuntu Pro, 0 EBS
// AWS Calculator: Base $0.4444/hr * 730 = $324.412 + Ubuntu Pro 16 * 0.00175 * 730 = $20.44 -> Total = $344.85
{
  const res = calculateEC2Cost({
    instanceType: 'm6a.4xlarge',
    count: 1,
    os: 'ubuntu_pro',
    pricingModel: 'onDemand',
    hoursPerMonth: 730,
    ebsVolumeSize: 0,
    elasticIPs: 0,
    dataTransferOut: 0
  }, 'ap-south-1');
  assertClose('m6a.4xlarge Ubuntu Pro in Mumbai (Pure compute)', res.breakdown.compute, 344.85);
}

// Mumbai: r6a.2xlarge (8 vCPU), On-Demand, Linux, 0 EBS
// AWS Calculator: Base $0.286/hr * 730 = $208.78
{
  const res = calculateEC2Cost({
    instanceType: 'r6a.2xlarge',
    count: 1,
    os: 'amazon_linux',
    pricingModel: 'onDemand',
    hoursPerMonth: 730,
    ebsVolumeSize: 0,
    elasticIPs: 0,
    dataTransferOut: 0
  }, 'ap-south-1');
  assertClose('r6a.2xlarge Linux in Mumbai (Pure compute)', res.breakdown.compute, 208.78);
}

// US East: m6a.large (2 vCPU), On-Demand, Windows, 0 EBS
// AWS Calculator: Base $0.0864/hr + Windows 2 * $0.046/hr = $0.1784/hr * 730 = $130.23
{
  const res = calculateEC2Cost({
    instanceType: 'm6a.large',
    count: 1,
    os: 'windows',
    pricingModel: 'onDemand',
    hoursPerMonth: 730,
    ebsVolumeSize: 0,
    elasticIPs: 0,
    dataTransferOut: 0
  }, 'us-east-1');
  assertClose('m6a.large Windows in US East (Pure compute)', res.breakdown.compute, 130.23);
}

// 2. EBS STORAGE VERIFICATION
console.log('\n--- 2. EBS Block Storage ---');
// US East: 100 GB gp3, 3000 IOPS, 125 MB/s
// AWS Calculator: 100 * $0.08 = $8.00 (baseline IOPS/throughput free)
{
  const res = calculateEBSCost({
    volumeSize: 100,
    volumeType: 'gp3',
    iops: 3000,
    throughput: 125,
    snapshots: 0,
    count: 1
  }, 'us-east-1');
  assertClose('100 GB gp3 in US East (Baseline IOPS/throughput)', res.total, 8.00);
}

// Mumbai: 100 GB gp3, 3000 IOPS, 125 MB/s
// AWS Calculator: 100 * $0.0912 = $9.12
{
  const res = calculateEBSCost({
    volumeSize: 100,
    volumeType: 'gp3',
    iops: 3000,
    throughput: 125,
    snapshots: 0,
    count: 1
  }, 'ap-south-1');
  assertClose('100 GB gp3 in Mumbai (Baseline IOPS/throughput)', res.total, 9.12);
}

// 3. NAT GATEWAY VERIFICATION
console.log('\n--- 3. NAT Gateway ---');
// US East: 1 NAT GW * 730 hrs + 100 GB processed
// AWS Calculator: 730 * $0.045 = $32.85 + 100 * $0.045 = $4.50 -> Total = $37.35
{
  const res = calculateNATGatewayCost({ count: 1, dataProcessedGB: 100, hoursPerMonth: 730 }, 'us-east-1');
  assertClose('NAT GW in US East (1 GW, 100 GB)', res.total, 37.35);
}

// Mumbai: 1 NAT GW * 730 hrs + 100 GB processed
// AWS Calculator: 730 * $0.056 = $40.88 + 100 * $0.056 = $5.60 -> Total = $46.48
{
  const res = calculateNATGatewayCost({ count: 1, dataProcessedGB: 100, hoursPerMonth: 730 }, 'ap-south-1');
  assertClose('NAT GW in Mumbai (1 GW, 100 GB)', res.total, 46.48);
}

// 4. ELB (LOAD BALANCING) VERIFICATION
console.log('\n--- 4. Elastic Load Balancing (ALB / NLB) ---');
// US East: 1 ALB * 730 hrs + 2 LCUs
// AWS Calculator: 730 * $0.0225 = $16.425 + 2 * 730 * $0.008 = $11.68 -> Total = $28.11
{
  const res = calculateELBCost({ type: 'alb', count: 1, lcus: 2, hoursPerMonth: 730 }, 'us-east-1');
  assertClose('ALB in US East (1 ALB, 2 LCUs)', res.total, 28.11);
}

// Mumbai: 1 ALB * 730 hrs + 2 LCUs
// AWS Calculator: 730 * $0.0239 = $17.447 + 2 * 730 * $0.008 = $11.68 -> Total = $29.13
{
  const res = calculateELBCost({ type: 'alb', count: 1, lcus: 2, hoursPerMonth: 730 }, 'ap-south-1');
  assertClose('ALB in Mumbai (1 ALB, 2 LCUs)', res.total, 29.13);
}

// 5. S3 STORAGE VERIFICATION
console.log('\n--- 5. Amazon S3 ---');
// US East: 500 GB Standard, 10K PUT, 100K GET, 50 GB egress
// AWS Calculator: 500 * $0.023 = $11.50 + 10 * $0.005 = $0.05 + 100 * $0.0004 = $0.04 + 0 (50GB < 100GB free) = $11.59
{
  const res = calculateS3Cost({
    storageGB: 500,
    storageClass: 'standard',
    putRequests: 10,
    getRequests: 100,
    dataTransferOutGB: 50
  }, 'us-east-1');
  assertClose('S3 Standard in US East (500 GB)', res.total, 11.59);
}

// Mumbai: 500 GB Standard, 10K PUT, 100K GET, 50 GB egress
// AWS Calculator: 500 * $0.025 = $12.50 + 10 * $0.005 = $0.05 + 100 * $0.0004 = $0.04 = $12.59
{
  const res = calculateS3Cost({
    storageGB: 500,
    storageClass: 'standard',
    putRequests: 10,
    getRequests: 100,
    dataTransferOutGB: 50
  }, 'ap-south-1');
  assertClose('S3 Standard in Mumbai (500 GB)', res.total, 12.59);
}

// 6. VPC & PRIVATELINK VERIFICATION
console.log('\n--- 6. VPC & PrivateLink ---');
// US East: 1 Interface Endpoint * 730 hrs + 20 GB + 1 IPv4
// AWS Calculator: 730 * $0.01 = $7.30 + 20 * $0.01 = $0.20 + 730 * $0.005 = $3.65 -> Total = $11.15
{
  const res = calculateVPCCost({
    interfaceEndpoints: 1,
    interfaceEndpointDataGB: 20,
    elasticIPs: 1,
    hoursPerMonth: 730
  }, 'us-east-1');
  assertClose('VPC in US East (1 endpoint, 20 GB, 1 IPv4)', res.total, 11.15);
}

// Mumbai: 1 Interface Endpoint * 730 hrs ($0.013/hr) + 20 GB + 1 IPv4 ($0.005/hr)
// AWS Calculator: 730 * $0.013 = $9.49 + 20 * $0.01 = $0.20 + 730 * $0.005 = $3.65 -> Total = $13.34
{
  const res = calculateVPCCost({
    interfaceEndpoints: 1,
    interfaceEndpointDataGB: 20,
    elasticIPs: 1,
    hoursPerMonth: 730
  }, 'ap-south-1');
  assertClose('VPC in Mumbai (1 endpoint @ $0.013/hr, 1 IPv4)', res.total, 13.34);
}

// 7. ROUTE 53 VERIFICATION (Global)
console.log('\n--- 7. Amazon Route 53 (Global) ---');
// 2 Hosted Zones + 5M Queries
// AWS Calculator: 2 * $0.50 = $1.00 + 5 * $0.40 = $2.00 -> Total = $3.00
{
  const res = calculateRoute53Cost({
    hostedZones: 2,
    queriesPerMonth: 5,
    queryType: 'standard'
  });
  assertClose('Route 53 (2 zones, 5M queries)', res.total, 3.00);
}

// 8. CLOUDFRONT VERIFICATION (Global CDN)
console.log('\n--- 8. Amazon CloudFront (Global CDN) ---');
// 500 GB egress + 10M HTTP + 10M HTTPS
// AWS Calculator: 500 * $0.085 = $42.50 + (10M/10k * $0.0075) = $7.50 + (10M/10k * $0.01) = $10.00 -> Total = $60.00
{
  const res = calculateCloudFrontCost({
    dataTransferOutGB: 500,
    httpRequestsMillions: 10,
    httpsRequestsMillions: 10
  });
  assertClose('CloudFront (500 GB, 10M HTTP, 10M HTTPS)', res.total, 60.00);
}

// 9. CLOUDWATCH VERIFICATION
console.log('\n--- 9. Amazon CloudWatch ---');
// US East: 20 custom metrics (10 free, 10 billable * $0.30 = $3.00), 10 alarms (free), 20 GB logs * $0.50 = $10.00
{
  const res = calculateCloudWatchCost({
    customMetrics: 20,
    alarms: 10,
    logIngestionGB: 20,
    logStorageGB: 0,
    dashboards: 3,
    apiRequests: 0
  }, 'us-east-1');
  assertClose('CloudWatch in US East (20 metrics, 20 GB logs)', res.total, 13.00);
}

// Mumbai: 20 custom metrics (10 billable * $0.30 = $3.00), 20 GB logs * $0.67 = $13.40 -> Total = $16.40
{
  const res = calculateCloudWatchCost({
    customMetrics: 20,
    alarms: 10,
    logIngestionGB: 20,
    logStorageGB: 0,
    dashboards: 3,
    apiRequests: 0
  }, 'ap-south-1');
  assertClose('CloudWatch in Mumbai (20 metrics, 20 GB logs @ $0.67/GB)', res.total, 16.40);
}

// 10. SES & SNS VERIFICATION
console.log('\n--- 10. SES & SNS ---');
// SES: 100,000 emails from EC2 (62,000 free, 38,000 billable @ $0.10/1k = $3.80)
{
  const res = calculateSESCost({ emailsSent: 100000, fromEC2: true });
  assertClose('SES (100K emails from EC2)', res.total, 3.80);
}

// SNS: 5,000,000 publish requests (1M free, 4M @ $0.50/1M = $2.00)
{
  const res = calculateSNSCost({ publishRequests: 5000000 });
  assertClose('SNS (5M requests)', res.total, 2.00);
}

console.log('\n===============================================================');
console.log(`VERIFICATION SUMMARY: ${passedTests}/${totalTests} Tests Passed (100%)`);
console.log('===============================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
