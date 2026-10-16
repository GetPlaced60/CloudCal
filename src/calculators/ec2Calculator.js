import ec2Pricing from '../data/pricing/ec2-pricing.json';
import ebsPricing from '../data/pricing/ebs-pricing.json';

export function calculateEBSCost(config) {
  const {
    volumeSize = 30,
    volumeType = 'gp3',
    iops = 3000,
    throughput = 125,
    snapshots = 0,
    count = 1
  } = config;

  const volPricing = ebsPricing.volumeTypes[volumeType] || ebsPricing.volumeTypes.gp3;
  let storageCost = (volumeSize || 0) * volPricing.pricePerGB;
  let iopsCost = 0;
  let throughputCost = 0;

  if (volumeType === 'gp3') {
    if (iops > (volPricing.baseIOPS || 3000)) {
      iopsCost = (iops - volPricing.baseIOPS) * volPricing.additionalIOPSPrice;
    }
    if (throughput > (volPricing.baseThroughput || 125)) {
      throughputCost = (throughput - volPricing.baseThroughput) * volPricing.additionalThroughputPrice;
    }
  } else if (volumeType === 'io1' || volumeType === 'io2') {
    iopsCost = (iops || 0) * (volPricing.pricePerIOPS || 0.065);
  }

  const snapshotCost = (snapshots || 0) * ebsPricing.snapshots.pricePerGB;
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

export function calculateEC2Cost(config) {
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

  const instance = ec2Pricing.instances[instanceType] || ec2Pricing.instances['t3.medium'];

  let hourlyRate;
  switch (pricingModel) {
    case 'ri1yrNoUpfront': hourlyRate = instance.ri1yrNoUpfront; break;
    case 'ri1yrPartial': hourlyRate = instance.ri1yrPartial; break;
    case 'ri1yrAllUpfront': hourlyRate = instance.ri1yrAllUpfront; break;
    case 'ri3yrNoUpfront': hourlyRate = instance.ri3yrNoUpfront; break;
    case 'ri3yrPartial': hourlyRate = instance.ri3yrPartial; break;
    case 'ri3yrAllUpfront': hourlyRate = instance.ri3yrAllUpfront; break;
    case 'spot': hourlyRate = instance.onDemand * (1 - (instance.spotDiscount || 0.7)); break;
    default: hourlyRate = instance.onDemand;
  }

  const osSurcharge = ec2Pricing.os_surcharge[os] || 0;
  const totalHourlyRate = hourlyRate + osSurcharge;
  const onDemandTotalHourly = instance.onDemand + osSurcharge;

  const computeCost = totalHourlyRate * (hoursPerMonth || 730) * (count || 1);

  const ebsCost = calculateEBSCost({
    volumeSize: ebsVolumeSize,
    volumeType: ebsVolumeType,
    iops: ebsIOPS,
    throughput: ebsThroughput,
    snapshots: ebsSnapshots,
    count
  });

  const eipCost = (elasticIPs || 0) * 0.005 * (hoursPerMonth || 730);

  let dtCost = 0;
  if (dataTransferOut > 1) {
    dtCost = (dataTransferOut - 1) * 0.09;
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
      instanceType,
      vcpu: instance.vcpu,
      memory: instance.memory,
      hourlyRate: Math.round(totalHourlyRate * 10000) / 10000,
      pricingModel,
      savingsVsOnDemand: pricingModel !== 'onDemand'
        ? Math.max(0, Math.round((1 - totalHourlyRate / onDemandTotalHourly) * 100))
        : 0
    }
  };
}
