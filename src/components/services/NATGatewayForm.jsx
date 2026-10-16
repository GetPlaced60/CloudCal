import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';

export default function NATGatewayForm() {
  const { config, updateService } = useCalculator();
  const c = config.natGateway;

  return (
    <>
      <InputField label="Number of NAT Gateways" value={c.count} onChange={(v) => updateService('natGateway', { count: v })} helpText="Recommended: 1 per Availability Zone for HA ($32.85/mo each)" />
      <InputField label="Data Processed" value={c.dataProcessedGB} onChange={(v) => updateService('natGateway', { dataProcessedGB: v })} unit="GB/mo" helpText="$0.045/GB outbound" />
      <InputField label="Hours per Month" value={c.hoursPerMonth} onChange={(v) => updateService('natGateway', { hoursPerMonth: v })} unit="hrs" helpText="730 = 24x7 full month" />
    </>
  );
}
