import pricing from '../data/pricing/cloudfront-pricing.json' with { type: 'json' };

export function calculateCloudFrontCost(config) {
  const {
    dataTransferOutGB = 100,
    httpRequestsMillions = 10,
    httpsRequestsMillions = 10
  } = config;

  let dtCost = 0;
  let remaining = dataTransferOutGB || 0;
  const tiers = [
    { limit: 10240, rate: pricing.dataTransferOut.first10TB },
    { limit: 40960, rate: pricing.dataTransferOut.next40TB },
    { limit: 102400, rate: pricing.dataTransferOut.next100TB },
    { limit: 358400, rate: pricing.dataTransferOut.next350TB },
    { limit: 536576, rate: pricing.dataTransferOut.next524TB },
    { limit: Infinity, rate: pricing.dataTransferOut.over1PB }
  ];

  for (const tier of tiers) {
    if (remaining <= 0) break;
    const inTier = Math.min(remaining, tier.limit);
    dtCost += inTier * tier.rate;
    remaining -= inTier;
  }

  const httpCost = ((httpRequestsMillions || 0) * 1000000 / 10000) * pricing.requests.http;
  const httpsCost = ((httpsRequestsMillions || 0) * 1000000 / 10000) * pricing.requests.https;

  const total = dtCost + httpCost + httpsCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      dataTransfer: Math.round(dtCost * 100) / 100,
      httpRequests: Math.round(httpCost * 100) / 100,
      httpsRequests: Math.round(httpsCost * 100) / 100
    }
  };
}
