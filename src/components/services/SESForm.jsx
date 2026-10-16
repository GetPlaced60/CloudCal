import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';

export default function SESForm() {
  const { config, updateService } = useCalculator();
  const c = config.ses;

  return (
    <>
      <InputField label="Emails Sent per Month" value={c.emailsSent} onChange={(v) => updateService('ses', { emailsSent: v })} helpText="$0.10 per 1,000 emails" />
      <InputField label="Emails Received per Month" value={c.emailsReceived} onChange={(v) => updateService('ses', { emailsReceived: v })} helpText="First 1,000 free" />
      <InputField label="Avg Attachment Size" value={c.avgAttachmentSizeKB} onChange={(v) => updateService('ses', { avgAttachmentSizeKB: v })} unit="KB" helpText="$0.12/GB data sent" />
      <InputField label="Dedicated IP Addresses" value={c.dedicatedIPs} onChange={(v) => updateService('ses', { dedicatedIPs: v })} helpText="$24.95/month each" />
      <SelectField label="Sending Source" value={c.fromEC2 ? 'ec2' : 'other'} onChange={(v) => updateService('ses', { fromEC2: v === 'ec2' })} options={[
        { value: 'ec2', label: 'Sent from EC2 (First 62,000/mo FREE)' },
        { value: 'other', label: 'Sent from external/on-prem (No free tier)' }
      ]} />
    </>
  );
}
