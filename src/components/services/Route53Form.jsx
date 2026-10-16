import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';

export default function Route53Form() {
  const { config, updateService } = useCalculator();
  const c = config.route53;

  return (
    <>
      <InputField label="Hosted Zones" value={c.hostedZones} onChange={(v) => updateService('route53', { hostedZones: v })} min={0} helpText="$0.50/zone/mo" />
      <InputField label="DNS Queries" value={c.queriesPerMonth} onChange={(v) => updateService('route53', { queriesPerMonth: v })} unit="millions/mo" step={0.1} />
      <SelectField label="Query Routing Policy" value={c.queryType} onChange={(v) => updateService('route53', { queryType: v })} options={[
        { value: 'standard', label: 'Standard ($0.40/M)' },
        { value: 'latencyBased', label: 'Latency-Based ($0.60/M)' },
        { value: 'geo', label: 'Geolocation DNS ($0.70/M)' }
      ]} />
      <InputField label="Health Checks" value={c.healthChecks} onChange={(v) => updateService('route53', { healthChecks: v })} />
      <SelectField label="Health Check Type" value={c.healthCheckType} onChange={(v) => updateService('route53', { healthCheckType: v })} options={[
        { value: 'basic', label: 'Basic HTTP ($0.50/mo)' },
        { value: 'https', label: 'HTTPS ($0.75/mo)' },
        { value: 'stringMatching', label: 'String Matching ($1.00/mo)' }
      ]} />
      <InputField label="Domain Registrations" value={c.domainCount} onChange={(v) => updateService('route53', { domainCount: v })} />
      <SelectField label="Domain TLD Extension" value={c.domainExtension} onChange={(v) => updateService('route53', { domainExtension: v })} options={[
        { value: '.com', label: '.com ($13/year)' },
        { value: '.net', label: '.net ($11/year)' },
        { value: '.org', label: '.org ($12/year)' },
        { value: '.io', label: '.io ($39/year)' },
        { value: '.co', label: '.co ($25/year)' },
        { value: '.dev', label: '.dev ($12/year)' }
      ]} />
    </>
  );
}
