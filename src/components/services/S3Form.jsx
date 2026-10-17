import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import s3Pricing from '../../data/pricing/s3-pricing.json';

export default function S3Form() {
  const { config, updateService } = useCalculator();
  const c = config.s3;
  const regStorage = s3Pricing.regionalStorage?.[config.region] || s3Pricing.storage;

  const stdRate = regStorage.standard?.first50TB ?? 0.023;
  const iaRate = regStorage.standardIA ?? 0.0125;
  const glacierRate = regStorage.glacier ?? 0.0036;
  const daRate = regStorage.glacierDeepArchive ?? 0.00099;

  return (
    <>
      <SelectField label="S3 Storage Class" value={c.storageClass} onChange={(v) => updateService('s3', { storageClass: v })} options={[
        { value: 'standard', label: `S3 Standard ($${stdRate}/GB)` },
        { value: 'standardIA', label: `S3 Infrequent Access ($${iaRate}/GB)` },
        { value: 'glacier', label: `S3 Glacier Flexible ($${glacierRate}/GB)` },
        { value: 'glacierDeepArchive', label: `S3 Deep Archive ($${daRate}/GB)` }
      ]} />
      <InputField label="Storage Capacity" value={c.storageGB} onChange={(v) => updateService('s3', { storageGB: v })} unit="GB" />
      <InputField label="PUT, COPY, POST Requests" value={c.putRequests} onChange={(v) => updateService('s3', { putRequests: v })} unit="thousands/mo" helpText="$0.005 per 1K" />
      <InputField label="GET, SELECT Requests" value={c.getRequests} onChange={(v) => updateService('s3', { getRequests: v })} unit="thousands/mo" helpText="$0.0004 per 1K" />
      <InputField label="Data Transfer Out" value={c.dataTransferOutGB} onChange={(v) => updateService('s3', { dataTransferOutGB: v })} unit="GB/mo" helpText="Internet egress (100GB free tier)" />
    </>
  );
}
