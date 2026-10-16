import pricing from '../data/pricing/s3-pricing.json';

export function calculateS3Cost(config) {
  const {
    storageGB = 100,
    storageClass = 'standard',
    putRequests = 10,
    getRequests = 100,
    dataTransferOutGB = 10
  } = config;

  let storageCost = 0;
  const gb = storageGB || 0;
  if (storageClass === 'standard') {
    const p = pricing.storage.standard;
    if (gb <= 51200) {
      storageCost = gb * p.first50TB;
    } else if (gb <= 512000) {
      storageCost = 51200 * p.first50TB + (gb - 51200) * p.next450TB;
    } else {
      storageCost = 51200 * p.first50TB + 460800 * p.next450TB + (gb - 512000) * p.over500TB;
    }
  } else if (storageClass === 'standardIA') {
    storageCost = gb * pricing.storage.standardIA;
  } else if (storageClass === 'glacier') {
    storageCost = gb * pricing.storage.glacier;
  } else if (storageClass === 'glacierDeepArchive') {
    storageCost = gb * pricing.storage.glacierDeepArchive;
  }

  const requestPricing = pricing.requests[storageClass] || pricing.requests.standard;
  const putCost = ((putRequests || 0)) * requestPricing.put;
  const getCost = ((getRequests || 0)) * requestPricing.get;

  let dtCost = 0;
  if ((dataTransferOutGB || 0) > 1) {
    const billable = dataTransferOutGB - 1;
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
