import pricing from '../data/pricing/cloudwatch-pricing.json';

export function calculateCloudWatchCost(config) {
  const {
    customMetrics = 10,
    alarms = 5,
    alarmType = 'standard',
    logIngestionGB = 10,
    logStorageGB = 50,
    dashboards = 1,
    apiRequests = 10000
  } = config;

  let metricsCost = 0;
  const billableMetrics = Math.max(0, (customMetrics || 0) - 10);
  if (billableMetrics > 0) {
    if (billableMetrics <= 10000) {
      metricsCost = billableMetrics * pricing.metrics.first10000;
    } else if (billableMetrics <= 250000) {
      metricsCost = 10000 * pricing.metrics.first10000 + (billableMetrics - 10000) * pricing.metrics.next240000;
    } else {
      metricsCost = 10000 * pricing.metrics.first10000 + 240000 * pricing.metrics.next240000 + (billableMetrics - 250000) * pricing.metrics.next750000;
    }
  }

  const billableAlarms = Math.max(0, (alarms || 0) - 10);
  const alarmRate = pricing.alarms[alarmType] || pricing.alarms.standard;
  const alarmsCost = billableAlarms * alarmRate;

  const logIngestionCost = (logIngestionGB || 0) * pricing.logs.ingestion;
  const logStorageCost = (logStorageGB || 0) * pricing.logs.storage;

  const billableDashboards = Math.max(0, (dashboards || 0) - 3);
  const dashboardCost = billableDashboards * pricing.dashboards.perMonth;

  const apiCost = ((apiRequests || 0) / 1000) * pricing.apiRequests.getMetricData;

  const total = metricsCost + alarmsCost + logIngestionCost + logStorageCost + dashboardCost + apiCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      metrics: Math.round(metricsCost * 100) / 100,
      alarms: Math.round(alarmsCost * 100) / 100,
      logIngestion: Math.round(logIngestionCost * 100) / 100,
      logStorage: Math.round(logStorageCost * 100) / 100,
      dashboards: Math.round(dashboardCost * 100) / 100,
      apiRequests: Math.round(apiCost * 100) / 100
    }
  };
}
