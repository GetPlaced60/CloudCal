import pricing from '../data/pricing/nat-gateway-pricing.json' with { type: 'json' };

export function calculateNATGatewayCost(config, region = 'us-east-1') {
  const targetRegion = region || config.region || 'us-east-1';
  const {
    count = 1,
    dataProcessedGB = 100,
    hoursPerMonth = 730
  } = config;

  const regPricing = pricing.regional?.[targetRegion] || pricing;
  const hourlyRate = regPricing.hourlyCharge ?? 0.045;
  const perGBRate = regPricing.dataProcessedPerGB ?? 0.045;

  const hourlyCost = (count || 0) * (hoursPerMonth || 730) * hourlyRate;
  const dataCost = (dataProcessedGB || 0) * perGBRate;
  const total = hourlyCost + dataCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      hourly: Math.round(hourlyCost * 100) / 100,
      dataProcessing: Math.round(dataCost * 100) / 100
    }
  };
}
