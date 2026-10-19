import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import cloudwatchPricing from '../../data/pricing/cloudwatch-pricing.json';

export default function CloudWatchForm() {
  const { config, updateService } = useCalculator();
  const c = config.cloudwatch;
  const regPricing = cloudwatchPricing.regional?.[config.region];
  const logIngestionRate = regPricing?.logIngestion ?? cloudwatchPricing.logs.ingestion;
  const standardAlarmRate = regPricing?.alarmStandard ?? cloudwatchPricing.alarms.standard;

  return (
    <>
      <InputField label="Custom Metrics" value={c.customMetrics} onChange={(v) => updateService('cloudwatch', { customMetrics: v })} helpText="First 10 free, then $0.30/metric" />
      <InputField label="Alarms" value={c.alarms} onChange={(v) => updateService('cloudwatch', { alarms: v })} helpText="First 10 free" />
      <SelectField label="Alarm Type" value={c.alarmType} onChange={(v) => updateService('cloudwatch', { alarmType: v })} options={[
        { value: 'standard', label: `Standard Alarm ($${standardAlarmRate.toFixed(2)}/mo)` },
        { value: 'highResolution', label: 'High-Resolution 10-sec ($0.30/mo)' },
        { value: 'anomalyDetection', label: 'Anomaly Detection ($3.00/mo)' }
      ]} />
      <InputField
        label="Log Data Ingested"
        value={c.logIngestionGB}
        onChange={(v) => updateService('cloudwatch', { logIngestionGB: v })}
        unit="GB/mo"
        helpText={`$${logIngestionRate.toFixed(2)}/GB in ${config.region}`}
      />
      <InputField label="Log Data Stored" value={c.logStorageGB} onChange={(v) => updateService('cloudwatch', { logStorageGB: v })} unit="GB/mo" helpText="$0.03/GB" />
      <InputField label="Dashboards" value={c.dashboards} onChange={(v) => updateService('cloudwatch', { dashboards: v })} helpText="First 3 free, then $3.00/mo" />
      <InputField label="API Requests (GetMetricData)" value={c.apiRequests} onChange={(v) => updateService('cloudwatch', { apiRequests: v })} unit="/month" helpText="$0.01 per 1,000" />
    </>
  );
}
