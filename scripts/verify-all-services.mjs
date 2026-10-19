/**
 * Automated Verification Suite for AWS Cost Calculator
 * Comprehensive Multi-Service, Multi-Region & Multi-Commitment Verification against official AWS Pricing logic.
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
console.log('       AWS PRICING CALCULATOR VERIFICATION SUITE (ALL SERVICES)');
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

// US East: c6i.xlarge (4 vCPU), RHEL licensing ($0.06/hr)
{
  const res = calculateEC2Cost({
    instanceType: 'c6i.xlarge',
    count: 1,
    os: 'rhel',
    pricingModel: 'onDemand',
    hoursPerMonth: 730,
    ebsVolumeSize: 0
  }, 'us-east-1');
  // Base $0.17/hr + RHEL $0.06/hr = $0.23/hr * 730 = $167.90
  assertClose('c6i.xlarge RHEL in US East', res.breakdown.compute, 167.90, 0.5);
}

// Spot Instance discount verification (65% off on-demand base)
{
  const onDemand = calculateEC2Cost({ instanceType: 'c6i.large', count: 1, pricingModel: 'onDemand', ebsVolumeSize: 0 }, 'us-east-1');
  const spot = calculateEC2Cost({ instanceType: 'c6i.large', count: 1, pricingModel: 'spot', ebsVolumeSize: 0 }, 'us-east-1');
  assertClose('Spot instance receives ~65% discount', spot.breakdown.compute, Math.round(onDemand.breakdown.compute * 0.35 * 100) / 100, 0.2);
}

// EC2 Savings Plan 3-Year No Upfront
{
  const sp = calculateEC2Cost({ instanceType: 'm6i.large', count: 1, pricingModel: 'ec2Sp3yrNoUpfront', ebsVolumeSize: 0 }, 'us-east-1');
  assertClose('EC2 3-Year SP No Upfront computes properly', sp.breakdown.compute > 0, true);
}

// Unselected instance type (default state when adding EC2 service)
{
  const res = calculateEC2Cost({
    instanceType: '',
    count: 1,
    ebsVolumeSize: 30
  }, 'us-east-1');
  assertClose('Unselected EC2 instance compute cost is 0', res.breakdown.compute, 0);
  assertClose('Unselected EC2 total cost equals attached EBS ($2.40)', res.total, 2.40);
}

// EC2 Internet Data Transfer with 100 GB global free tier
{
  const res50GB = calculateEC2Cost({ instanceType: 't3.medium', count: 1, ebsVolumeSize: 0, dataTransferOut: 50 }, 'us-east-1');
  assertClose('EC2 data transfer <= 100GB is $0 (Free Tier)', res50GB.breakdown.dataTransfer, 0);

  const res150GB = calculateEC2Cost({ instanceType: 't3.medium', count: 1, ebsVolumeSize: 0, dataTransferOut: 150 }, 'us-east-1');
  assertClose('EC2 data transfer 150GB in US East (50GB billable @ $0.09)', res150GB.breakdown.dataTransfer, 4.50);
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

// Frankfurt: 100 GB gp3
{
  const res = calculateEBSCost({ volumeSize: 100, volumeType: 'gp3', iops: 3000, throughput: 125 }, 'eu-central-1');
  assertClose('100 GB gp3 in Frankfurt ($0.0952/GB)', res.total, 9.52);
}

// São Paulo: 100 GB gp3
{
  const res = calculateEBSCost({ volumeSize: 100, volumeType: 'gp3', iops: 3000, throughput: 125 }, 'sa-east-1');
  assertClose('100 GB gp3 in Sao Paulo ($0.152/GB)', res.total, 15.20);
}

// gp3 Provisioned IOPS and Throughput in US East
// 100 GB ($8.00) + 1000 addl IOPS ($5.00) + 75 addl MB/s ($3.00) = $16.00
{
  const res = calculateEBSCost({
    volumeSize: 100,
    volumeType: 'gp3',
    iops: 4000,
    throughput: 200,
    snapshots: 0,
    count: 1
  }, 'us-east-1');
  assertClose('gp3 Provisioned IOPS & Throughput in US East', res.total, 16.00);
}

// io1 Provisioned IOPS SSD in US East
// 100 GB ($12.50) + 2000 IOPS ($130.00) = $142.50
{
  const res = calculateEBSCost({
    volumeSize: 100,
    volumeType: 'io1',
    iops: 2000,
    count: 1
  }, 'us-east-1');
  assertClose('100 GB io1 with 2000 IOPS in US East', res.total, 142.50);
}

// EBS Snapshots in US East (50 GB @ $0.05 = $2.50)
{
  const res = calculateEBSCost({ volumeSize: 0, snapshots: 50 }, 'us-east-1');
  assertClose('50 GB EBS snapshots in US East ($0.05/GB)', res.total, 2.50);
}

// 3. NAT GATEWAY VERIFICATION
console.log('\n--- 3. NAT Gateway ---');
// US East: 1 GW, 100 GB data processed
// AWS Calculator: 1 * 730 * $0.045 = $32.85 + 100 * $0.045 = $4.50 -> Total = $37.35
{
  const res = calculateNATGatewayCost({ count: 1, dataProcessedGB: 100, hoursPerMonth: 730 }, 'us-east-1');
  assertClose('NAT GW in US East (1 GW, 100 GB)', res.total, 37.35);
}

// Mumbai: 1 GW, 100 GB data processed
// AWS Calculator: 1 * 730 * $0.056 = $40.88 + 100 * $0.056 = $5.60 -> Total = $46.48
{
  const res = calculateNATGatewayCost({ count: 1, dataProcessedGB: 100, hoursPerMonth: 730 }, 'ap-south-1');
  assertClose('NAT GW in Mumbai (1 GW, 100 GB)', res.total, 46.48);
}

// Frankfurt: 1 GW, 100 GB data processed
// 730 * 0.052 ($37.96) + 100 * 0.052 ($5.20) = $43.16
{
  const res = calculateNATGatewayCost({ count: 1, dataProcessedGB: 100, hoursPerMonth: 730 }, 'eu-central-1');
  assertClose('NAT GW in Frankfurt (1 GW, 100 GB)', res.total, 43.16);
}

// São Paulo: 1 GW, 100 GB data processed
// 730 * 0.093 ($67.89) + 100 * 0.093 ($9.30) = $77.19
{
  const res = calculateNATGatewayCost({ count: 1, dataProcessedGB: 100, hoursPerMonth: 730 }, 'sa-east-1');
  assertClose('NAT GW in Sao Paulo (1 GW, 100 GB)', res.total, 77.19);
}

// 4. ELASTIC LOAD BALANCING (ALB / NLB) VERIFICATION
console.log('\n--- 4. Elastic Load Balancing (ALB / NLB) ---');
// US East: 1 ALB, 2 LCUs, 730 hours
// AWS Calculator: 1 * 730 * $0.0225 = $16.425 + 1 * 2 * 730 * $0.008 = $11.68 -> Total = $28.11
{
  const res = calculateELBCost({ type: 'alb', count: 1, lcus: 2, hoursPerMonth: 730 }, 'us-east-1');
  assertClose('ALB in US East (1 ALB, 2 LCUs)', res.total, 28.11);
}

// Mumbai: 1 ALB, 2 LCUs, 730 hours
// AWS Calculator: 1 * 730 * $0.0239 = $17.447 + 1 * 2 * 730 * $0.008 = $11.68 -> Total = $29.13
{
  const res = calculateELBCost({ type: 'alb', count: 1, lcus: 2, hoursPerMonth: 730 }, 'ap-south-1');
  assertClose('ALB in Mumbai (1 ALB, 2 LCUs)', res.total, 29.13);
}

// US East: 1 NLB, 2 NCUs, 730 hours
// Base $0.0225 * 730 ($16.425) + 2 NCUs * $0.006 * 730 ($8.76) = $25.19
{
  const res = calculateELBCost({ type: 'nlb', count: 1, lcus: 2, hoursPerMonth: 730 }, 'us-east-1');
  assertClose('NLB in US East (1 NLB, 2 NCUs)', res.total, 25.19);
}

// São Paulo: 1 ALB, 2 LCUs
// Base $0.034 * 730 ($24.82) + 2 LCUs * $0.011 * 730 ($16.06) = $40.88
{
  const res = calculateELBCost({ type: 'alb', count: 1, lcus: 2, hoursPerMonth: 730 }, 'sa-east-1');
  assertClose('ALB in Sao Paulo (1 ALB, 2 LCUs)', res.total, 40.88);
}

// 5. AMAZON S3 VERIFICATION
console.log('\n--- 5. Amazon S3 ---');
// US East: 500 GB Standard, 10K PUT, 100K GET
// AWS Calculator: 500 * $0.023 = $11.50 + 10 * $0.005 = $0.05 + 100 * $0.0004 = $0.04 -> Total = $11.59
{
  const res = calculateS3Cost({ storageGB: 500, storageClass: 'standard', putRequests: 10, getRequests: 100, dataTransferOutGB: 0 }, 'us-east-1');
  assertClose('S3 Standard in US East (500 GB)', res.total, 11.59);
}

// Mumbai: 500 GB Standard
// AWS Calculator: 500 * $0.025 = $12.50 + requests $0.09 -> Total = $12.59
{
  const res = calculateS3Cost({ storageGB: 500, storageClass: 'standard', putRequests: 10, getRequests: 100, dataTransferOutGB: 0 }, 'ap-south-1');
  assertClose('S3 Standard in Mumbai (500 GB)', res.total, 12.59);
}

// US East: S3 Standard-Infrequent Access (1,000 GB)
// Storage 1,000 * $0.0125 ($12.50) + 10K PUT ($0.10) + 100K GET ($0.10) = $12.70
{
  const res = calculateS3Cost({ storageGB: 1000, storageClass: 'standardIA', putRequests: 10, getRequests: 100, dataTransferOutGB: 0 }, 'us-east-1');
  assertClose('S3 Standard-IA in US East (1,000 GB)', res.total, 12.70);
}

// US East: S3 Glacier Flexible (1,000 GB)
// Storage 1,000 * $0.0036 ($3.60) + 10K PUT ($0.30) + 100K GET ($0.04) = $3.94
{
  const res = calculateS3Cost({ storageGB: 1000, storageClass: 'glacier', putRequests: 10, getRequests: 100, dataTransferOutGB: 0 }, 'us-east-1');
  assertClose('S3 Glacier in US East (1,000 GB)', res.total, 3.94);
}

// US East: S3 Glacier Deep Archive (5,000 GB)
// Storage 5,000 * $0.00099 ($4.95) + 10K PUT ($0.50) + 100K GET ($0.04) = $5.49
{
  const res = calculateS3Cost({ storageGB: 5000, storageClass: 'glacierDeepArchive', putRequests: 10, getRequests: 100, dataTransferOutGB: 0 }, 'us-east-1');
  assertClose('S3 Deep Archive in US East (5,000 GB)', res.total, 5.49);
}

// 6. VPC & PRIVATELINK VERIFICATION
console.log('\n--- 6. VPC & PrivateLink ---');
// US East: 1 endpoint ($0.01/hr), 20 GB data ($0.20), 1 IPv4 ($3.65)
// AWS Calculator: 730 * $0.01 = $7.30 + $0.20 + $3.65 = $11.15
{
  const res = calculateVPCCost({ interfaceEndpoints: 1, interfaceEndpointDataGB: 20, elasticIPs: 1 }, 'us-east-1');
  assertClose('VPC in US East (1 endpoint, 20 GB, 1 IPv4)', res.total, 11.15);
}

// Mumbai: 1 endpoint ($0.013/hr), 20 GB data ($0.20), 1 IPv4 ($3.65)
// AWS Calculator: 730 * $0.013 = $9.49 + $0.20 + $3.65 = $13.34
{
  const res = calculateVPCCost({ interfaceEndpoints: 1, interfaceEndpointDataGB: 20, elasticIPs: 1 }, 'ap-south-1');
  assertClose('VPC in Mumbai (1 endpoint @ $0.013/hr, 1 IPv4)', res.total, 13.34);
}

// Frankfurt: 2 endpoints ($0.012/hr), 50 GB data, 2 IPv4
// (2 * 730 * 0.012 = $17.52) + (50 * 0.01 = $0.50) + (2 * 730 * 0.005 = $7.30) = $25.32
{
  const res = calculateVPCCost({ interfaceEndpoints: 2, interfaceEndpointDataGB: 50, elasticIPs: 2 }, 'eu-central-1');
  assertClose('VPC in Frankfurt (2 endpoints, 50 GB, 2 IPv4)', res.total, 25.32);
}

// 7. ROUTE 53 VERIFICATION
console.log('\n--- 7. Amazon Route 53 (Global) ---');
// 2 hosted zones ($1.00), 5M queries ($2.00) = $3.00
{
  const res = calculateRoute53Cost({ hostedZones: 2, queriesPerMonth: 5 });
  assertClose('Route 53 (2 zones, 5M queries)', res.total, 3.00);
}

// Route 53 with domain registration (.com $13/yr = $1.08/mo)
{
  const res = calculateRoute53Cost({ hostedZones: 2, queriesPerMonth: 5, domainCount: 1, domainExtension: '.com' });
  assertClose('Route 53 with 1 .com domain', res.total, 4.08);
}

// Route 53 with Latency-based queries ($0.60/M) + 2 HTTPS health checks ($1.50)
{
  const res = calculateRoute53Cost({
    hostedZones: 1,
    queriesPerMonth: 5,
    queryType: 'latencyBased',
    healthChecks: 2,
    healthCheckType: 'https'
  });
  // 1 zone ($0.50) + 5M latency queries ($3.00) + 2 https checks ($1.50) = $5.00
  assertClose('Route 53 latency routing and HTTPS checks', res.total, 5.00);
}

// 8. CLOUDFRONT VERIFICATION
console.log('\n--- 8. Amazon CloudFront (Global CDN) ---');
// US East: 500 GB transfer out ($0.085/GB = $42.50) + 10M HTTP ($7.50) + 10M HTTPS ($10.00) = $60.00
{
  const res = calculateCloudFrontCost({
    dataTransferOutGB: 500,
    httpRequestsMillions: 10,
    httpsRequestsMillions: 10
  }, 'us-east-1');
  assertClose('CloudFront in US East (500 GB, 10M HTTP, 10M HTTPS)', res.total, 60.00);
}

// Mumbai edge: 500 GB ($0.109/GB = $54.50) + 10M HTTP ($9.00) + 10M HTTPS ($12.00) = $75.50
{
  const res = calculateCloudFrontCost({
    dataTransferOutGB: 500,
    httpRequestsMillions: 10,
    httpsRequestsMillions: 10
  }, 'ap-south-1');
  assertClose('CloudFront in Mumbai Edge ($0.109/GB, $0.009 HTTP, $0.012 HTTPS)', res.total, 75.50);
}

// CloudFront Free Tier Applied (1024 GB egress and 10M requests free)
{
  const res = calculateCloudFrontCost({
    dataTransferOutGB: 500,
    httpRequestsMillions: 5,
    httpsRequestsMillions: 5,
    applyFreeTier: true
  }, 'us-east-1');
  assertClose('CloudFront with Free Tier applied (<1024GB, <10M reqs)', res.total, 0.00);
}

// 9. CLOUDWATCH VERIFICATION
console.log('\n--- 9. Amazon CloudWatch ---');
// US East: 20 metrics (10 free, 10 billable * $0.30 = $3.00), 20 GB logs (20 * $0.50 = $10.00) -> Total = $13.00
{
  const res = calculateCloudWatchCost({ customMetrics: 20, logIngestionGB: 20, alarms: 0, logStorageGB: 0, dashboards: 0, apiRequests: 0 }, 'us-east-1');
  assertClose('CloudWatch in US East (20 metrics, 20 GB logs)', res.total, 13.00);
}

// Mumbai: 20 metrics ($3.00), 20 GB logs @ $0.67/GB ($13.40) -> Total = $16.40
{
  const res = calculateCloudWatchCost({ customMetrics: 20, logIngestionGB: 20, alarms: 0, logStorageGB: 0, dashboards: 0, apiRequests: 0 }, 'ap-south-1');
  assertClose('CloudWatch in Mumbai (20 metrics, 20 GB logs @ $0.67/GB)', res.total, 16.40);
}

// Tokyo: 20 metrics ($3.00), 50 GB logs @ $0.76/GB ($38.00) -> Total = $41.00
{
  const res = calculateCloudWatchCost({ customMetrics: 20, logIngestionGB: 50, alarms: 0, logStorageGB: 0, dashboards: 0, apiRequests: 0 }, 'ap-northeast-1');
  assertClose('CloudWatch in Tokyo (20 metrics, 50 GB logs @ $0.76/GB)', res.total, 41.00);
}

// 10. SES & SNS VERIFICATION
console.log('\n--- 10. SES & SNS ---');
// SES: 100K emails sent from EC2 (62K free, 38K * $0.0001 = $3.80)
{
  const res = calculateSESCost({ emailsSent: 100000, fromEC2: true });
  assertClose('SES (100K emails from EC2)', res.total, 3.80);
}

// SES: 100K emails sent from external (100K * $0.0001 = $10.00)
{
  const res = calculateSESCost({ emailsSent: 100000, fromEC2: false });
  assertClose('SES (100K emails from external/on-prem)', res.total, 10.00);
}

// SES: Dedicated IP ($24.95/mo)
{
  const res = calculateSESCost({ emailsSent: 0, dedicatedIPs: 1 });
  assertClose('SES Dedicated IP ($24.95/mo)', res.total, 24.95);
}

// SNS: 5M publish requests (1M free, 4M * $0.50 = $2.00)
{
  const res = calculateSNSCost({ publishRequests: 5000000 });
  assertClose('SNS (5M requests)', res.total, 2.00);
}

// SNS: 500K HTTP deliveries (100K free, 400K * $0.60/M = $0.24)
{
  const res = calculateSNSCost({ publishRequests: 0, httpNotifications: 500000 });
  assertClose('SNS (500K HTTP deliveries)', res.total, 0.24);
}

// SNS: 100K Email deliveries (1K free, 99K * $0.00002 = $1.98)
{
  const res = calculateSNSCost({ publishRequests: 0, emailNotifications: 100000 });
  assertClose('SNS (100K Email deliveries)', res.total, 1.98);
}

console.log('\n===============================================================');
console.log(`VERIFICATION SUMMARY: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('===============================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
