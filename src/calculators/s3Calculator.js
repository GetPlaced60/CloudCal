import pricing from '../data/pricing/s3-pricing.json' with { type: 'json' };

export function calculateS3Cost(config, region = 'us-east-1') {
  const targetRegion = region || config.region || 'us-east-1';
  const {
    storageGB = 100,
    storageClass = 'standard',
    putRequests = 10,
    getRequests = 100,
    dataTransferOutGB = 10
  } = config;

  const regStorage = pricing.regionalStorage?.[targetRegion] || pricing.storage;
  let storageCost = 0;
  const gb = storageGB || 0;

  if (storageClass === 'standard') {
    const p = regStorage.standard || pricing.storage.standard;
    if (gb <= 51200) {
      storageCost = gb * p.first50TB;
    } else if (gb <= 512000) {
      storageCost = 51200 * p.first50TB + (gb - 51200) * p.next450TB;
    } else {
      storageCost = 51200 * p.first50TB + 460800 * p.next450TB + (gb - 512000) * p.over500TB;
    }
  } else if (storageClass === 'standardIA') {
    const rate = regStorage.standardIA ?? pricing.storage.standardIA;
    storageCost = gb * rate;
  } else if (storageClass === 'glacier') {
    const rate = regStorage.glacier ?? pricing.storage.glacier;
    storageCost = gb * rate;
  } else if (storageClass === 'glacierDeepArchive') {
    const rate = regStorage.glacierDeepArchive ?? pricing.storage.glacierDeepArchive;
    storageCost = gb * rate;
  }

  const requestPricing = pricing.requests[storageClass] || pricing.requests.standard;
  // putRequests and getRequests are input in thousands
  const putCost = (putRequests || 0) * requestPricing.put;
  const getCost = (getRequests || 0) * requestPricing.get;

  let dtCost = 0;
  const freeTier = pricing.dataTransferOut.freeTierGB ?? 100;
  if ((dataTransferOutGB || 0) > freeTier) {
    const billable = dataTransferOutGB - freeTier;
    if (billable <= 10240) {
      dtCost = billable * pricing.dataTransferOut.first10TB;
    } else {
      dtCost = 10240 * pricing.dataTransferOut.first10TB + (billable - 10240) * pricing.dataTransferOut.next40TB;
    }
  }

  const total = storageCost + putCost + getCost + dtCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      storage: Math.round(storageCost * 100) / 100,
      putRequests: Math.round(putCost * 100) / 100,
      getRequests: Math.round(getCost * 100) / 100,
      dataTransfer: Math.round(dtCost * 100) / 100
    }
  };
}
