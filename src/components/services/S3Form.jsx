import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';

export default function S3Form() {
  const { config, updateService } = useCalculator();
  const c = config.s3;

  return (
    <>
      <SelectField label="S3 Storage Class" value={c.storageClass} onChange={(v) => updateService('s3', { storageClass: v })} options={[
        { value: 'standard', label: 'S3 Standard ($0.023/GB)' },
        { value: 'standardIA', label: 'S3 Infrequent Access ($0.0125/GB)' },
        { value: 'glacier', label: 'S3 Glacier Flexible ($0.004/GB)' },
        { value: 'glacierDeepArchive', label: 'S3 Deep Archive ($0.00099/GB)' }
      ]} />
      <InputField label="Storage Capacity" value={c.storageGB} onChange={(v) => updateService('s3', { storageGB: v })} unit="GB" />
      <InputField label="PUT, COPY, POST Requests" value={c.putRequests} onChange={(v) => updateService('s3', { putRequests: v })} unit="thousands/mo" helpText="$0.005 per 1K" />
      <InputField label="GET, SELECT Requests" value={c.getRequests} onChange={(v) => updateService('s3', { getRequests: v })} unit="thousands/mo" helpText="$0.0004 per 1K" />
      <InputField label="Data Transfer Out" value={c.dataTransferOutGB} onChange={(v) => updateService('s3', { dataTransferOutGB: v })} unit="GB/mo" helpText="Internet egress (1GB free)" />
    </>
  );
}
