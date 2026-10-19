import pricing from '../data/pricing/route53-pricing.json' with { type: 'json' };

export function calculateRoute53Cost(config) {
  const {
    hostedZones = 1,
    queriesPerMonth = 1,
    queryType = 'standard',
    healthChecks = 0,
    healthCheckType = 'basic',
    domainRegistrations = [],
    domainCount = 0,
    domainExtension = '.com'
  } = config;

  let hostedZoneCost = 0;
  const numZones = Math.max(0, hostedZones || 0);
  if (numZones <= 25) {
    hostedZoneCost = numZones * pricing.hostedZone.first25;
  } else {
    hostedZoneCost = 25 * pricing.hostedZone.first25 + (numZones - 25) * pricing.hostedZone.additional;
  }

  const queryRate = pricing.queries[queryType] || pricing.queries.standard;
  const queriesCost = (Math.max(0, queriesPerMonth || 0)) * queryRate;

  const healthCheckRate = pricing.healthChecks[healthCheckType] || pricing.healthChecks.basic;
  const healthCheckCost = (Math.max(0, healthChecks || 0)) * healthCheckRate;

  let domainCost = 0;
  if (domainCount && domainCount > 0) {
    const ext = domainExtension || '.com';
    domainCost = (domainCount * (pricing.domainRegistration[ext] || 13)) / 12;
  } else if (domainRegistrations && domainRegistrations.length > 0) {
    domainRegistrations.forEach(domain => {
      const ext = domain?.extension || '.com';
      domainCost += (pricing.domainRegistration[ext] || 13) / 12;
    });
  }

  const total = hostedZoneCost + queriesCost + healthCheckCost + domainCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      hostedZones: Math.round(hostedZoneCost * 100) / 100,
      queries: Math.round(queriesCost * 100) / 100,
      healthChecks: Math.round(healthCheckCost * 100) / 100,
      domainRegistration: Math.round(domainCost * 100) / 100
    }
  };
}
