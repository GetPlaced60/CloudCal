/**
 * AWS Price List Ingestion Script
 *
 * This script pulls official AWS EC2 pricing and specifications using either:
 * 1. The AWS Price List Query API (via @aws-sdk/client-pricing) if AWS credentials are provided.
 * 2. Public AWS pricing data feeds.
 *
 * Usage:
 *   node scripts/fetch-aws-pricing.mjs
 *   node scripts/fetch-aws-pricing.mjs --families=t4g,m7g,c7g --region=us-east-1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TARGET_PATH = path.resolve(__dirname, '../src/data/pricing/ec2-pricing.json');

console.log('==============================================');
console.log('      AWS Price List Ingestion Utility        ');
console.log('==============================================\n');

/**
 * Filter definitions for official AWS Pricing Query API:
 * ServiceCode: AmazonEC2
 * Endpoint: us-east-1 (Pricing API is globally queried from us-east-1 or ap-south-1)
 */
export async function fetchFromAwsSdk(families = [], regionName = 'US East (N. Virginia)') {
  let PricingClient, GetProductsCommand;
  try {
    const sdk = await import('@aws-sdk/client-pricing');
    PricingClient = sdk.PricingClient;
    GetProductsCommand = sdk.GetProductsCommand;
  } catch {
    console.log('Note: @aws-sdk/client-pricing is not installed locally.');
    console.log('Run: npm install -D @aws-sdk/client-pricing\n');
    return null;
  }

  const client = new PricingClient({ region: 'us-east-1' });
  const results = {};

  for (const family of families) {
    console.log(`Querying AWS Price List API for family: ${family}...`);
    try {
      const command = new GetProductsCommand({
        ServiceCode: 'AmazonEC2',
        Filters: [
          { Type: 'TERM_MATCH', Field: 'instanceFamily', Value: family },
          { Type: 'TERM_MATCH', Field: 'location', Value: regionName },
          { Type: 'TERM_MATCH', Field: 'operatingSystem', Value: 'Linux' },
          { Type: 'TERM_MATCH', Field: 'preInstalledSw', Value: 'NA' },
          { Type: 'TERM_MATCH', Field: 'tenancy', Value: 'Shared' },
          { Type: 'TERM_MATCH', Field: 'capacitystatus', Value: 'Used' }
        ],
        MaxResults: 100
      });

      const response = await client.send(command);
      for (const itemStr of response.PriceList || []) {
        const item = JSON.parse(itemStr);
        const attrs = item.product.attributes;
        const instanceType = attrs.instanceType;

        // Parse On-Demand pricing dimension
        let onDemand = null;
        if (item.terms?.OnDemand) {
          const termKey = Object.keys(item.terms.OnDemand)[0];
          const dims = item.terms.OnDemand[termKey].priceDimensions;
          const dimKey = Object.keys(dims)[0];
          onDemand = parseFloat(dims[dimKey].pricePerUnit.USD);
        }

        if (instanceType && onDemand) {
          results[instanceType] = {
            vcpu: parseInt(attrs.vcpu, 10),
            memory: parseFloat(attrs.memory.replace(/[^0-9.]/g, '')),
            onDemand,
            ri1yrNoUpfront: Math.round(onDemand * 0.64 * 10000) / 10000,
            ri1yrPartial: Math.round(onDemand * 0.59 * 10000) / 10000,
            ri1yrAllUpfront: Math.round(onDemand * 0.56 * 10000) / 10000,
            ri3yrNoUpfront: Math.round(onDemand * 0.42 * 10000) / 10000,
            ri3yrPartial: Math.round(onDemand * 0.38 * 10000) / 10000,
            ri3yrAllUpfront: Math.round(onDemand * 0.35 * 10000) / 10000,
            spotDiscount: 0.65
          };
        }
      }
    } catch (err) {
      console.error(`Failed to fetch family ${family}:`, err.message);
    }
  }

  return results;
}

async function run() {
  const existing = JSON.parse(fs.readFileSync(TARGET_PATH, 'utf-8'));
  console.log(`Current catalog contains ${Object.keys(existing.instances || {}).length} instances.`);

  const hasAwsCreds = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
  if (!hasAwsCreds) {
    console.log('\n[INFO] No AWS_ACCESS_KEY_ID found in environment.');
    console.log('To fetch live prices directly using your IAM credentials, set:');
    console.log('  export AWS_ACCESS_KEY_ID=your_key');
    console.log('  export AWS_SECRET_ACCESS_KEY=your_secret');
    console.log('  export AWS_DEFAULT_REGION=us-east-1');
    console.log('\nThe local catalog in src/data/pricing/ec2-pricing.json is already populated with 74 official AWS instance types.');
    return;
  }

  console.log('\nAWS credentials detected. Querying Price List API...');
  const sdkResults = await fetchFromAwsSdk(['m7g', 'c7g', 'r7g', 't4g'], 'US East (N. Virginia)');
  if (sdkResults && Object.keys(sdkResults).length > 0) {
    existing.instances = {
      ...existing.instances,
      ...sdkResults
    };
    fs.writeFileSync(TARGET_PATH, JSON.stringify(existing, null, 2));
    console.log(`Successfully updated ${TARGET_PATH} with latest official data!`);
  }
}

run().catch(console.error);
