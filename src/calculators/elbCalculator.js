import pricing from '../data/pricing/elb-pricing.json';

export function calculateELBCost(config) {
  const {
    type = 'alb',
    count = 1,
    lcus = 2,
    hoursPerMonth = 730
  } = config;

  const hourlyRate = type === 'alb' ? pricing.alb.hourlyCharge : pricing.nlb.hourlyCharge;
  const unitRate = type === 'alb' ? pricing.alb.lcuPrice : pricing.nlb.ncuPrice;

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
