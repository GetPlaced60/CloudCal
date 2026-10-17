import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import elbPricing from '../../data/pricing/elb-pricing.json';

export default function ELBForm() {
  const { config, updateService } = useCalculator();
  const c = config.elb || { enabled: true, type: 'alb', count: 1, lcus: 2, hoursPerMonth: 730 };
  const regPricing = elbPricing.regional?.[config.region] || elbPricing;
  const rates = c.type === 'alb' ? regPricing.alb : regPricing.nlb;
  const hourlyRate = rates?.hourlyCharge ?? 0.0225;
  const unitRate = c.type === 'alb' ? (rates?.lcuPrice ?? 0.008) : (rates?.ncuPrice ?? 0.006);

  return (
    <>
      <SelectField
        label="Load Balancer Type"
        value={c.type}
        onChange={(v) => updateService('elb', { type: v })}
        options={[
          { value: 'alb', label: 'Application Load Balancer (ALB) — HTTP/HTTPS' },
          { value: 'nlb', label: 'Network Load Balancer (NLB) — TCP/UDP' }
        ]}
      />
      <InputField
        label="Load Balancers"
        value={c.count}
        onChange={(v) => updateService('elb', { count: v })}
        min={1}
        helpText={`$${hourlyRate}/hr base rate in ${config.region}`}
      />
      <InputField
        label="Capacity Units (LCU / NLCU)"
        value={c.lcus}
        onChange={(v) => updateService('elb', { lcus: v })}
        min={0}
        step={0.5}
        helpText={`Avg capacity units used per hour ($${unitRate}/LCU-hr)`}
      />
    </>
  );
}
