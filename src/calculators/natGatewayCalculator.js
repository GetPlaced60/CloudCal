import pricing from '../data/pricing/nat-gateway-pricing.json';

export function calculateNATGatewayCost(config) {
  const {
    count = 1,
    dataProcessedGB = 100,
    hoursPerMonth = 730
  } = config;

  const hourlyCost = (count || 0) * (hoursPerMonth || 730) * pricing.hourlyCharge;
  const dataCost = (dataProcessedGB || 0) * pricing.dataProcessedPerGB;
  const total = hourlyCost + dataCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      hourly: Math.round(hourlyCost * 100) / 100,
      dataProcessing: Math.round(dataCost * 100) / 100
    }
  };
}
