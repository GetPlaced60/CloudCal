import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';

export default function CloudFrontForm() {
  const { config, updateService } = useCalculator();
  const c = config.cloudfront;

  return (
    <>
      <InputField label="Data Transfer Out to Internet" value={c.dataTransferOutGB} onChange={(v) => updateService('cloudfront', { dataTransferOutGB: v })} unit="GB/mo" helpText="Global CDN edge egress" />
      <InputField label="HTTP Requests" value={c.httpRequestsMillions} onChange={(v) => updateService('cloudfront', { httpRequestsMillions: v })} unit="millions/mo" step={0.1} helpText="$0.0075 per 10,000" />
      <InputField label="HTTPS Requests" value={c.httpsRequestsMillions} onChange={(v) => updateService('cloudfront', { httpsRequestsMillions: v })} unit="millions/mo" step={0.1} helpText="$0.01 per 10,000" />
    </>
  );
}
