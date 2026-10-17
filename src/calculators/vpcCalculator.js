import pricing from '../data/pricing/vpc-pricing.json' with { type: 'json' };

export function calculateVPCCost(config, region = 'us-east-1') {
  const targetRegion = region || config.region || 'us-east-1';
  const {
    interfaceEndpoints = 0,
    interfaceEndpointDataGB = 0,
    gatewayEndpoints: _gatewayEndpoints = 0,
    vpcPeeringDataGB = 0,
    elasticIPs = 0,
    hoursPerMonth = 730
  } = config;

  const endpointHourlyRate = pricing.regional?.[targetRegion]?.interfaceEndpointHourly ?? pricing.interfaceEndpoint.hourlyCharge;
  const endpointHourlyCost = (interfaceEndpoints || 0) * (hoursPerMonth || 730) * endpointHourlyRate;
  const endpointDataCost = (interfaceEndpointDataGB || 0) * pricing.interfaceEndpoint.dataProcessedPerGB;
  const peeringCost = (vpcPeeringDataGB || 0) * pricing.vpcPeering.dataTransferPerGB;
  const eipCost = (elasticIPs || 0) * pricing.elasticIP.attached * (hoursPerMonth || 730);

  const total = endpointHourlyCost + endpointDataCost + peeringCost + eipCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      interfaceEndpoints: Math.round((endpointHourlyCost + endpointDataCost) * 100) / 100,
      vpcPeering: Math.round(peeringCost * 100) / 100,
      elasticIPs: Math.round(eipCost * 100) / 100
    },
    note: 'VPC, IGW, and Gateway Endpoints are free'
  };
}
