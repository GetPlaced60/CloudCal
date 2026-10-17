import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';
import natPricing from '../../data/pricing/nat-gateway-pricing.json';

export default function NATGatewayForm() {
  const { config, updateService } = useCalculator();
  const c = config.natGateway;
  const regPricing = natPricing.regional?.[config.region] || natPricing;
  const hourlyRate = regPricing.hourlyCharge ?? 0.045;
  const perGBRate = regPricing.dataProcessedPerGB ?? 0.045;
  const monthlyEach = Math.round(hourlyRate * 730 * 100) / 100;

  return (
    <>
      <InputField
        label="Number of NAT Gateways"
        value={c.count}
        onChange={(v) => updateService('natGateway', { count: v })}
        helpText={`1 per AZ recommended for HA ($${monthlyEach}/mo each at $${hourlyRate}/hr)`}
      />
      <InputField
        label="Data Processed"
        value={c.dataProcessedGB}
        onChange={(v) => updateService('natGateway', { dataProcessedGB: v })}
        unit="GB/mo"
        helpText={`$${perGBRate}/GB outbound`}
      />
      <InputField
        label="Hours per Month"
        value={c.hoursPerMonth}
        onChange={(v) => updateService('natGateway', { hoursPerMonth: v })}
        unit="hrs"
        helpText="730 = 24x7 full month"
      />
    </>
  );
}
