import ec2Pricing from '../data/pricing/ec2-pricing.json' with { type: 'json' };
import ebsPricing from '../data/pricing/ebs-pricing.json' with { type: 'json' };

const REGIONAL_EGRESS_RATES = {
  'us-east-1': 0.09,
  'us-east-2': 0.09,
  'us-west-2': 0.09,
  'eu-west-1': 0.09,
  'eu-central-1': 0.09,
  'ap-south-1': 0.1093,
  'ap-southeast-1': 0.12,
  'ap-northeast-1': 0.114,
  'sa-east-1': 0.15
};

export function calculateEBSCost(config, region = 'us-east-1') {
  const {
    volumeSize = 30,
    volumeType = 'gp3',
    iops = 3000,
    throughput = 125,
    snapshots = 0,
    count = 1
  } = config;

  const regEbs = ebsPricing.regional?.[region];
  const volPricing = regEbs?.volumeTypes?.[volumeType] || ebsPricing.volumeTypes[volumeType] || ebsPricing.volumeTypes.gp3;
  const snapshotPrice = regEbs?.snapshots?.pricePerGB ?? ebsPricing.snapshots?.pricePerGB ?? 0.05;

  if (!volumeSize || volumeSize <= 0) {
    const snapshotCost = (snapshots || 0) * snapshotPrice;
    return {
      total: Math.round(snapshotCost * 100) / 100,
      breakdown: {
        storage: 0,
        iops: 0,
        throughput: 0,
        snapshots: Math.round(snapshotCost * 100) / 100
      }
    };
  }

  const pricePerGB = volPricing.pricePerGB || 0.08;
  const storageCost = (volumeSize || 0) * pricePerGB;
  let iopsCost = 0;
  let throughputCost = 0;

  if (volumeType === 'gp3') {
    const baseIOPS = volPricing.baseIOPS || 3000;
    if (iops > baseIOPS) {
      iopsCost = (iops - baseIOPS) * (volPricing.additionalIOPSPrice || 0.005);
    }
    const baseThroughput = volPricing.baseThroughput || 125;
    if (throughput > baseThroughput) {
      throughputCost = (throughput - baseThroughput) * (volPricing.additionalThroughputPrice || 0.04);
    }
  } else if (volumeType === 'io1' || volumeType === 'io2') {
    iopsCost = (iops || 0) * (volPricing.pricePerIOPS || 0.065);
  }

  const snapshotCost = (snapshots || 0) * snapshotPrice;
  const totalPerVolume = storageCost + iopsCost + throughputCost;
  const total = (totalPerVolume * (count || 1)) + snapshotCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      storage: Math.round(storageCost * (count || 1) * 100) / 100,
      iops: Math.round(iopsCost * (count || 1) * 100) / 100,
      throughput: Math.round(throughputCost * (count || 1) * 100) / 100,
      snapshots: Math.round(snapshotCost * 100) / 100
    }
  };
}

export function calculateEC2Cost(config, region = 'us-east-1') {
  const targetRegion = region || config.region || 'us-east-1';
  const {
    instanceType = 't3.medium',
    count = 1,
    os = 'amazon_linux',
    pricingModel = 'onDemand',
    hoursPerMonth = 730,
    ebsVolumeSize = 30,
    ebsVolumeType = 'gp3',
    ebsIOPS = 3000,
    ebsThroughput = 125,
    ebsSnapshots = 0,
    elasticIPs = 0,
    dataTransferOut = 0
  } = config;

  const hasInstance = Boolean(instanceType && ec2Pricing.instances[instanceType]);
  const instance = hasInstance ? ec2Pricing.instances[instanceType] : null;
  const regionalData = hasInstance ? (ec2Pricing.regional_rates?.[targetRegion]?.[instanceType] || instance) : null;

  let hourlyRate = 0;
  if (hasInstance) {
    switch (pricingModel) {
      case 'ec2Sp3yrNoUpfront':
        hourlyRate = regionalData.ec2Sp3yrNoUpfront || regionalData.ri3yrNoUpfront;
        break;
      case 'computeSp3yrNoUpfront':
        hourlyRate = regionalData.computeSp3yrNoUpfront || (regionalData.onDemand * 0.5128);
        break;
      case 'ec2Sp1yrNoUpfront':
        hourlyRate = regionalData.ec2Sp1yrNoUpfront || regionalData.ri1yrNoUpfront;
        break;
      case 'computeSp1yrNoUpfront':
        hourlyRate = regionalData.computeSp1yrNoUpfront || (regionalData.onDemand * 0.68);
        break;
      case 'ri1yrNoUpfront': hourlyRate = regionalData.ri1yrNoUpfront; break;
      case 'ri1yrPartial': hourlyRate = regionalData.ri1yrPartial; break;
      case 'ri1yrAllUpfront': hourlyRate = regionalData.ri1yrAllUpfront; break;
      case 'ri3yrNoUpfront': hourlyRate = regionalData.ri3yrNoUpfront; break;
      case 'ri3yrPartial': hourlyRate = regionalData.ri3yrPartial; break;
      case 'ri3yrAllUpfront': hourlyRate = regionalData.ri3yrAllUpfront; break;
      case 'spot':
        hourlyRate = regionalData.onDemand * (1 - (regionalData.spotDiscount || 0.65));
        break;
      default:
        hourlyRate = regionalData.onDemand;
    }
  }

  const vcpuCount = instance?.vcpu || 0;
  let osSurcharge = 0;
  if (hasInstance) {
    if (os === 'ubuntu_pro') {
      // Official AWS Ubuntu Pro licensing is exactly $0.00175 per vCPU-hour
      osSurcharge = vcpuCount * 0.00175;
    } else if (os === 'windows') {
      osSurcharge = vcpuCount * 0.046;
    } else if (os === 'rhel') {
      // RHEL licensing: 1-4 vCPUs $0.06/hr, 5-16 vCPUs $0.13/hr, >16 vCPUs $0.1728/hr
      osSurcharge = vcpuCount > 16 ? 0.1728 : (vcpuCount > 4 ? 0.13 : 0.06);
    } else if (os === 'suse') {
      osSurcharge = vcpuCount > 4 ? 0.125 : 0.10;
    }
  }

  const totalHourlyRate = hourlyRate + osSurcharge;
  const onDemandTotalHourly = hasInstance ? (regionalData.onDemand + osSurcharge) : 0;

  const computeCost = totalHourlyRate * (hoursPerMonth || 730) * (count || 1);

  const ebsCost = calculateEBSCost({
    volumeSize: ebsVolumeSize,
    volumeType: ebsVolumeType,
    iops: ebsIOPS,
    throughput: ebsThroughput,
    snapshots: ebsSnapshots,
    count
  }, targetRegion);

  const eipCost = (elasticIPs || 0) * 0.005 * (hoursPerMonth || 730);

  // AWS provides 100 GB/month free internet egress per account across services
  const egressRate = REGIONAL_EGRESS_RATES[targetRegion] || 0.09;
  let dtCost = 0;
  if (dataTransferOut > 100) {
    dtCost = (dataTransferOut - 100) * egressRate;
  }

  const total = computeCost + ebsCost.total + eipCost + dtCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      compute: Math.round(computeCost * 100) / 100,
      ebs: ebsCost.total,
      elasticIP: Math.round(eipCost * 100) / 100,
      dataTransfer: Math.round(dtCost * 100) / 100
    },
    ebsBreakdown: ebsCost.breakdown,
    details: {
      instanceType: instanceType || '',
      region: targetRegion,
      vcpu: instance?.vcpu || 0,
      memory: instance?.memory || 0,
      hourlyRate: Math.round(totalHourlyRate * 10000) / 10000,
      pricingModel,
      savingsVsOnDemand: (pricingModel !== 'onDemand' && onDemandTotalHourly > 0)
        ? Math.max(0, Math.round((1 - totalHourlyRate / onDemandTotalHourly) * 100))
        : 0
    }
  };
}
