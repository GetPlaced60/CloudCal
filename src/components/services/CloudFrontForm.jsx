import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';
import cloudfrontPricing from '../../data/pricing/cloudfront-pricing.json';

export default function CloudFrontForm() {
  const { config, updateService } = useCalculator();
  const c = config.cloudfront;
  const regPricing = cloudfrontPricing.regional?.[config.region] || cloudfrontPricing;
  const egressRate = regPricing.dataTransferOut?.first10TB ?? cloudfrontPricing.dataTransferOut.first10TB;
  const httpRate = regPricing.requests?.http ?? cloudfrontPricing.requests.http;
  const httpsRate = regPricing.requests?.https ?? cloudfrontPricing.requests.https;

  return (
    <>
      <InputField
        label="Data Transfer Out to Internet"
        value={c.dataTransferOutGB}
        onChange={(v) => updateService('cloudfront', { dataTransferOutGB: v })}
        unit="GB/mo"
        helpText={`$${egressRate.toFixed(4)}/GB regional edge rate`}
      />
      <InputField
        label="HTTP Requests"
        value={c.httpRequestsMillions}
        onChange={(v) => updateService('cloudfront', { httpRequestsMillions: v })}
        unit="millions/mo"
        step={0.1}
        helpText={`$${httpRate.toFixed(4)} per 10,000`}
      />
      <InputField
        label="HTTPS Requests"
        value={c.httpsRequestsMillions}
        onChange={(v) => updateService('cloudfront', { httpsRequestsMillions: v })}
        unit="millions/mo"
        step={0.1}
        helpText={`$${httpsRate.toFixed(4)} per 10,000`}
      />
    </>
  );
}
