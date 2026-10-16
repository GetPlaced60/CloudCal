import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';

export default function VPCForm() {
  const { config, updateService } = useCalculator();
  const c = config.vpc;

  return (
    <>
      <InputField label="Interface Endpoints (PrivateLink)" value={c.interfaceEndpoints} onChange={(v) => updateService('vpc', { interfaceEndpoints: v })} helpText="$0.01/hr ($7.30/mo each)" />
      <InputField label="Endpoint Data Processed" value={c.interfaceEndpointDataGB} onChange={(v) => updateService('vpc', { interfaceEndpointDataGB: v })} unit="GB/mo" helpText="$0.01/GB" />
      <InputField label="VPC Peering Data Transfer" value={c.vpcPeeringDataGB} onChange={(v) => updateService('vpc', { vpcPeeringDataGB: v })} unit="GB/mo" helpText="$0.01/GB cross-VPC" />
      <InputField label="Elastic IP Addresses" value={c.elasticIPs} onChange={(v) => updateService('vpc', { elasticIPs: v })} helpText="$0.005/hr IPv4 charge" />
      <div className="col-span-full mt-2">
        <div className="text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 p-2.5 rounded-lg flex items-start gap-2">
          <span>ℹ️</span>
          <div>
            <strong>VPC, Internet Gateway (IGW) & Gateway Endpoints (S3/DynamoDB)</strong> are <strong>FREE</strong> of charge. Charges apply only to PrivateLink interface endpoints, cross-zone data transfer, and IPv4 EIPs.
          </div>
        </div>
      </div>
    </>
  );
}
