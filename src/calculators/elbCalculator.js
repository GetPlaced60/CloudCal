import pricing from '../data/pricing/elb-pricing.json' with { type: 'json' };

export function calculateELBCost(config, region = 'us-east-1') {
  const targetRegion = region || config.region || 'us-east-1';
  const {
    type = 'alb',
    count = 1,
    lcus = 2,
    hoursPerMonth = 730
  } = config;

  const regPricing = pricing.regional?.[targetRegion] || pricing;
  const rates = type === 'alb' ? regPricing.alb : regPricing.nlb;

  const hourlyRate = rates?.hourlyCharge ?? 0.0225;
  const unitRate = type === 'alb' ? (rates?.lcuPrice ?? 0.008) : (rates?.ncuPrice ?? 0.006);

  const baseCost = (count || 0) * hourlyRate * (hoursPerMonth || 730);
  const capacityCost = (count || 0) * (lcus || 0) * unitRate * (hoursPerMonth || 730);
  const total = baseCost + capacityCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      loadBalancerHours: Math.round(baseCost * 100) / 100,
      capacityUnits: Math.round(capacityCost * 100) / 100
    }
  };
}
