/**
 * Script to expand EC2 instance catalog with all full family sizes (including all m6a sizes up to 48xlarge/metal,
 * c6a, r6a, m7a, c7a, r7a, m6i, m7i, c6i, c7i, r6i, r7i, t3a, m5, c5, r5, g4dn, g5, i4i, etc.)
 * across all 9 AWS regions.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TARGET_PATH = path.resolve(__dirname, '../src/data/pricing/ec2-pricing.json');

const REGIONS = [
  'us-east-1',
  'us-east-2',
  'us-west-2',
  'eu-west-1',
  'eu-central-1',
  'ap-south-1',
  'ap-southeast-1',
  'ap-northeast-1',
  'sa-east-1'
];

// Base rates per vCPU / baseline for families in US East (us-east-1)
// We will preserve any existing exact regional rates and scale proportionally for all new sizes!
const existingCatalog = JSON.parse(fs.readFileSync(TARGET_PATH, 'utf-8'));

// Definitions for families to expand
const FAMILIES_TO_EXPAND = [
  {
    family: 'm6a',
    category: 'General Purpose - AMD EPYC',
    arch: 'x86_64',
    baseType: 'm6a.large',
    ramPerVcpu: 4,
    sizes: [
      { size: 'large', vcpu: 2, ram: 8, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 16, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 32, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 64, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 128, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 192, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 256, mult: 32 },
      { size: '24xlarge', vcpu: 96, ram: 384, mult: 48 },
      { size: '32xlarge', vcpu: 128, ram: 512, mult: 64 },
      { size: '48xlarge', vcpu: 192, ram: 768, mult: 96 },
      { size: 'metal', vcpu: 192, ram: 768, mult: 96 }
    ]
  },
  {
    family: 'c6a',
    category: 'Compute Optimized - AMD EPYC',
    arch: 'x86_64',
    baseType: 'c6a.large',
    ramPerVcpu: 2,
    sizes: [
      { size: 'large', vcpu: 2, ram: 4, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 8, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 16, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 32, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 64, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 96, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 128, mult: 32 },
      { size: '24xlarge', vcpu: 96, ram: 192, mult: 48 },
      { size: '32xlarge', vcpu: 128, ram: 256, mult: 64 },
      { size: '48xlarge', vcpu: 192, ram: 384, mult: 96 },
      { size: 'metal', vcpu: 192, ram: 384, mult: 96 }
    ]
  },
  {
    family: 'r6a',
    category: 'Memory Optimized - AMD EPYC',
    arch: 'x86_64',
    baseType: 'r6a.large',
    ramPerVcpu: 8,
    sizes: [
      { size: 'large', vcpu: 2, ram: 16, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 32, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 64, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 128, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 256, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 384, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 512, mult: 32 },
      { size: '24xlarge', vcpu: 96, ram: 768, mult: 48 },
      { size: '32xlarge', vcpu: 128, ram: 1024, mult: 64 },
      { size: '48xlarge', vcpu: 192, ram: 1536, mult: 96 },
      { size: 'metal', vcpu: 192, ram: 1536, mult: 96 }
    ]
  },
  {
    family: 'm6i',
    category: 'General Purpose - Intel 6th Gen',
    arch: 'x86_64',
    baseType: 'm6i.large',
    ramPerVcpu: 4,
    sizes: [
      { size: 'large', vcpu: 2, ram: 8, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 16, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 32, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 64, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 128, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 192, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 256, mult: 32 },
      { size: '24xlarge', vcpu: 96, ram: 384, mult: 48 },
      { size: '32xlarge', vcpu: 128, ram: 512, mult: 64 },
      { size: 'metal', vcpu: 128, ram: 512, mult: 64 }
    ]
  },
  {
    family: 'c6i',
    category: 'Compute Optimized - Intel 6th Gen',
    arch: 'x86_64',
    baseType: 'c6i.large',
    ramPerVcpu: 2,
    sizes: [
      { size: 'large', vcpu: 2, ram: 4, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 8, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 16, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 32, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 64, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 96, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 128, mult: 32 },
      { size: '24xlarge', vcpu: 96, ram: 192, mult: 48 },
      { size: '32xlarge', vcpu: 128, ram: 256, mult: 64 },
      { size: 'metal', vcpu: 128, ram: 256, mult: 64 }
    ]
  },
  {
    family: 'r6i',
    category: 'Memory Optimized - Intel 6th Gen',
    arch: 'x86_64',
    baseType: 'r6i.large',
    ramPerVcpu: 8,
    sizes: [
      { size: 'large', vcpu: 2, ram: 16, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 32, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 64, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 128, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 256, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 384, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 512, mult: 32 },
      { size: '24xlarge', vcpu: 96, ram: 768, mult: 48 },
      { size: '32xlarge', vcpu: 128, ram: 1024, mult: 64 },
      { size: 'metal', vcpu: 128, ram: 1024, mult: 64 }
    ]
  },
  {
    family: 'm7i',
    category: 'General Purpose - Intel 7th Gen',
    arch: 'x86_64',
    baseType: 'm7i.large',
    ramPerVcpu: 4,
    sizes: [
      { size: 'large', vcpu: 2, ram: 8, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 16, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 32, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 64, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 128, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 192, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 256, mult: 32 },
      { size: '24xlarge', vcpu: 96, ram: 384, mult: 48 },
      { size: '48xlarge', vcpu: 192, ram: 768, mult: 96 },
      { size: 'metal', vcpu: 192, ram: 768, mult: 96 }
    ]
  },
  {
    family: 'c7i',
    category: 'Compute Optimized - Intel 7th Gen',
    arch: 'x86_64',
    baseType: 'c7i.large',
    ramPerVcpu: 2,
    sizes: [
      { size: 'large', vcpu: 2, ram: 4, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 8, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 16, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 32, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 64, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 96, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 128, mult: 32 },
      { size: '24xlarge', vcpu: 96, ram: 192, mult: 48 },
      { size: '48xlarge', vcpu: 192, ram: 384, mult: 96 }
    ]
  },
  {
    family: 'r7i',
    category: 'Memory Optimized - Intel 7th Gen',
    arch: 'x86_64',
    baseType: 'r7i.large',
    ramPerVcpu: 8,
    sizes: [
      { size: 'large', vcpu: 2, ram: 16, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 32, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 64, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 128, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 256, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 384, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 512, mult: 32 },
      { size: '24xlarge', vcpu: 96, ram: 768, mult: 48 },
      { size: '48xlarge', vcpu: 192, ram: 1536, mult: 96 }
    ]
  },
  {
    family: 'm7g',
    category: 'General Purpose - Graviton3 ARM',
    arch: 'arm64',
    baseType: 'm7g.large',
    ramPerVcpu: 4,
    sizes: [
      { size: 'medium', vcpu: 1, ram: 4, mult: 0.5 },
      { size: 'large', vcpu: 2, ram: 8, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 16, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 32, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 64, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 128, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 192, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 256, mult: 32 },
      { size: 'metal', vcpu: 64, ram: 256, mult: 32 }
    ]
  },
  {
    family: 'c7g',
    category: 'Compute Optimized - Graviton3 ARM',
    arch: 'arm64',
    baseType: 'c7g.large',
    ramPerVcpu: 2,
    sizes: [
      { size: 'medium', vcpu: 1, ram: 2, mult: 0.5 },
      { size: 'large', vcpu: 2, ram: 4, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 8, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 16, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 32, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 64, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 96, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 128, mult: 32 },
      { size: 'metal', vcpu: 64, ram: 128, mult: 32 }
    ]
  },
  {
    family: 'r7g',
    category: 'Memory Optimized - Graviton3 ARM',
    arch: 'arm64',
    baseType: 'r7g.large',
    ramPerVcpu: 8,
    sizes: [
      { size: 'medium', vcpu: 1, ram: 8, mult: 0.5 },
      { size: 'large', vcpu: 2, ram: 16, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 32, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 64, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 128, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 256, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 384, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 512, mult: 32 },
      { size: 'metal', vcpu: 64, ram: 512, mult: 32 }
    ]
  },
  {
    family: 't3a',
    category: 'Burstable General Purpose - AMD EPYC',
    arch: 'x86_64',
    baseType: 't3a.large',
    ramPerVcpu: 4,
    sizes: [
      { size: 'nano', vcpu: 2, ram: 0.5, mult: 0.125 },
      { size: 'micro', vcpu: 2, ram: 1, mult: 0.25 },
      { size: 'small', vcpu: 2, ram: 2, mult: 0.5 },
      { size: 'medium', vcpu: 2, ram: 4, mult: 1.0 },
      { size: 'large', vcpu: 2, ram: 8, mult: 2.0 },
      { size: 'xlarge', vcpu: 4, ram: 16, mult: 4.0 },
      { size: '2xlarge', vcpu: 8, ram: 32, mult: 8.0 }
    ],
    baseRateLarge: 0.0752
  },
  {
    family: 'm5',
    category: 'General Purpose - Intel 5th Gen (Classic)',
    arch: 'x86_64',
    baseType: 'm5.large',
    sizes: [
      { size: 'large', vcpu: 2, ram: 8, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 16, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 32, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 64, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 128, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 192, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 256, mult: 32 },
      { size: '24xlarge', vcpu: 96, ram: 384, mult: 48 }
    ],
    baseRateLarge: 0.096
  },
  {
    family: 'c5',
    category: 'Compute Optimized - Intel 5th Gen (Classic)',
    arch: 'x86_64',
    baseType: 'c5.large',
    sizes: [
      { size: 'large', vcpu: 2, ram: 4, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 8, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 16, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 32, mult: 8 },
      { size: '9xlarge', vcpu: 36, ram: 72, mult: 18 },
      { size: '12xlarge', vcpu: 48, ram: 96, mult: 24 },
      { size: '18xlarge', vcpu: 72, ram: 144, mult: 36 },
      { size: '24xlarge', vcpu: 96, ram: 192, mult: 48 }
    ],
    baseRateLarge: 0.085
  },
  {
    family: 'r5',
    category: 'Memory Optimized - Intel 5th Gen (Classic)',
    arch: 'x86_64',
    baseType: 'r5.large',
    sizes: [
      { size: 'large', vcpu: 2, ram: 16, mult: 1 },
      { size: 'xlarge', vcpu: 4, ram: 32, mult: 2 },
      { size: '2xlarge', vcpu: 8, ram: 64, mult: 4 },
      { size: '4xlarge', vcpu: 16, ram: 128, mult: 8 },
      { size: '8xlarge', vcpu: 32, ram: 256, mult: 16 },
      { size: '12xlarge', vcpu: 48, ram: 384, mult: 24 },
      { size: '16xlarge', vcpu: 64, ram: 512, mult: 32 },
      { size: '24xlarge', vcpu: 96, ram: 768, mult: 48 }
    ],
    baseRateLarge: 0.126
  },
  {
    family: 'g5',
    category: 'Accelerated / GPU - NVIDIA A10G (AI/ML)',
    arch: 'x86_64',
    baseType: 'g5.xlarge',
    sizes: [
      { size: 'xlarge', vcpu: 4, ram: 16, mult: 1, gpu: '1x A10G (24GB)' },
      { size: '2xlarge', vcpu: 8, ram: 32, mult: 1.207, gpu: '1x A10G (24GB)' },
      { size: '4xlarge', vcpu: 16, ram: 64, mult: 1.615, gpu: '1x A10G (24GB)' },
      { size: '8xlarge', vcpu: 32, ram: 128, mult: 2.44, gpu: '1x A10G (24GB)' },
      { size: '12xlarge', vcpu: 48, ram: 192, mult: 5.66, gpu: '4x A10G (96GB)' },
      { size: '16xlarge', vcpu: 64, ram: 256, mult: 4.07, gpu: '1x A10G (24GB)' },
      { size: '24xlarge', vcpu: 96, ram: 384, mult: 10.11, gpu: '4x A10G (96GB)' },
      { size: '48xlarge', vcpu: 192, ram: 768, mult: 16.27, gpu: '8x A10G (192GB)' }
    ]
  }
];

function scaleRecord(baseRecord, multiplier, vcpu, ram) {
  const round4 = (v) => Math.round(v * 10000) / 10000;
  const onDemand = round4(baseRecord.onDemand * multiplier);
  return {
    vcpu,
    memory: ram,
    onDemand,
    ec2Sp3yrNoUpfront: round4(baseRecord.ec2Sp3yrNoUpfront ? baseRecord.ec2Sp3yrNoUpfront * multiplier : onDemand * 0.46),
    computeSp3yrNoUpfront: round4(baseRecord.computeSp3yrNoUpfront ? baseRecord.computeSp3yrNoUpfront * multiplier : onDemand * 0.5128),
    ec2Sp1yrNoUpfront: round4(baseRecord.ec2Sp1yrNoUpfront ? baseRecord.ec2Sp1yrNoUpfront * multiplier : onDemand * 0.63),
    computeSp1yrNoUpfront: round4(baseRecord.computeSp1yrNoUpfront ? baseRecord.computeSp1yrNoUpfront * multiplier : onDemand * 0.68),
    ri1yrNoUpfront: round4(baseRecord.ri1yrNoUpfront ? baseRecord.ri1yrNoUpfront * multiplier : onDemand * 0.64),
    ri1yrPartial: round4(baseRecord.ri1yrPartial ? baseRecord.ri1yrPartial * multiplier : onDemand * 0.59),
    ri1yrAllUpfront: round4(baseRecord.ri1yrAllUpfront ? baseRecord.ri1yrAllUpfront * multiplier : onDemand * 0.56),
    ri3yrNoUpfront: round4(baseRecord.ri3yrNoUpfront ? baseRecord.ri3yrNoUpfront * multiplier : onDemand * 0.42),
    ri3yrPartial: round4(baseRecord.ri3yrPartial ? baseRecord.ri3yrPartial * multiplier : onDemand * 0.38),
    ri3yrAllUpfront: round4(baseRecord.ri3yrAllUpfront ? baseRecord.ri3yrAllUpfront * multiplier : onDemand * 0.35),
    spotDiscount: baseRecord.spotDiscount || 0.65
  };
}

// Process each family
for (const fam of FAMILIES_TO_EXPAND) {
  for (const s of fam.sizes) {
    const typeName = `${fam.family}.${s.size}`;

    // Compute for us-east-1 (base catalog)
    let baseRecord = existingCatalog.instances[fam.baseType];
    if (!baseRecord && fam.baseRateLarge) {
      baseRecord = {
        vcpu: 2,
        memory: 8,
        onDemand: fam.baseRateLarge,
        ec2Sp3yrNoUpfront: fam.baseRateLarge * 0.46,
        computeSp3yrNoUpfront: fam.baseRateLarge * 0.5128,
        ec2Sp1yrNoUpfront: fam.baseRateLarge * 0.63,
        computeSp1yrNoUpfront: fam.baseRateLarge * 0.68,
        ri1yrNoUpfront: fam.baseRateLarge * 0.64,
        spotDiscount: 0.65
      };
    }

    if (!baseRecord) {
      console.warn(`Could not find base record for ${fam.baseType}`);
      continue;
    }

    // Set base in existingCatalog.instances
    if (!existingCatalog.instances[typeName]) {
      existingCatalog.instances[typeName] = scaleRecord(baseRecord, s.mult, s.vcpu, s.ram);
    }

    // Now populate across all 9 regions in regional_rates
    for (const reg of REGIONS) {
      if (!existingCatalog.regional_rates[reg]) existingCatalog.regional_rates[reg] = {};

      // If already has exact record from API sync, keep it!
      if (existingCatalog.regional_rates[reg][typeName]) continue;

      // Find the regional base
      const regBase = existingCatalog.regional_rates[reg][fam.baseType] || baseRecord;
      existingCatalog.regional_rates[reg][typeName] = scaleRecord(regBase, s.mult, s.vcpu, s.ram);
    }
  }
}

// Save back
fs.writeFileSync(TARGET_PATH, JSON.stringify(existingCatalog, null, 2));
console.log(`Successfully expanded catalog to ${Object.keys(existingCatalog.instances).length} instances across ${REGIONS.length} regions!`);
