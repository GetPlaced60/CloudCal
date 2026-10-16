import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';

export default function ELBForm() {
  const { config, updateService } = useCalculator();
  const c = config.elb || { enabled: true, type: 'alb', count: 1, lcus: 2, hoursPerMonth: 730 };

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
        helpText="$0.0225/hr base cost"
      />
      <InputField
        label="Capacity Units (LCU / NLCU)"
        value={c.lcus}
        onChange={(v) => updateService('elb', { lcus: v })}
        min={0}
        step={0.5}
        helpText="Avg capacity units used per hour ($0.008/LCU-hr)"
      />
    </>
  );
}
