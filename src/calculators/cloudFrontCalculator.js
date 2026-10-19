import pricing from '../data/pricing/cloudfront-pricing.json' with { type: 'json' };

export function calculateCloudFrontCost(config, region = 'us-east-1') {
  const targetRegion = region || config.region || 'us-east-1';
  const {
    dataTransferOutGB = 100,
    httpRequestsMillions = 10,
    httpsRequestsMillions = 10,
    applyFreeTier = false
  } = config;

  const regPricing = pricing.regional?.[targetRegion] || pricing;
  const rates = regPricing.dataTransferOut || pricing.dataTransferOut;
  const reqRates = regPricing.requests || pricing.requests;

  let effectiveDataGB = Math.max(0, dataTransferOutGB || 0);
  let effectiveHttpM = Math.max(0, httpRequestsMillions || 0);
  let effectiveHttpsM = Math.max(0, httpsRequestsMillions || 0);

  if (applyFreeTier) {
    effectiveDataGB = Math.max(0, effectiveDataGB - (pricing.freeTier?.dataTransferOutGB || 1024));
    const freeReqs = (pricing.freeTier?.httpRequestsMillions || 10);
    const httpDiscount = Math.min(effectiveHttpM, freeReqs);
    effectiveHttpM -= httpDiscount;
    const remainingFree = freeReqs - httpDiscount;
    effectiveHttpsM = Math.max(0, effectiveHttpsM - remainingFree);
  }

  let dtCost = 0;
  let remaining = effectiveDataGB;
  const tiers = [
    { limit: 10240, rate: rates.first10TB },
    { limit: 40960, rate: rates.next40TB },
    { limit: 102400, rate: rates.next100TB },
    { limit: 358400, rate: rates.next350TB },
    { limit: 536576, rate: rates.next524TB },
    { limit: Infinity, rate: rates.over1PB }
  ];

  for (const tier of tiers) {
    if (remaining <= 0) break;
    const inTier = Math.min(remaining, tier.limit);
    dtCost += inTier * tier.rate;
    remaining -= inTier;
  }

  const httpCost = ((effectiveHttpM * 1000000) / 10000) * reqRates.http;
  const httpsCost = ((effectiveHttpsM * 1000000) / 10000) * reqRates.https;

  const total = dtCost + httpCost + httpsCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      dataTransfer: Math.round(dtCost * 100) / 100,
      httpRequests: Math.round(httpCost * 100) / 100,
      httpsRequests: Math.round(httpsCost * 100) / 100
    },
    region: targetRegion
  };
}
