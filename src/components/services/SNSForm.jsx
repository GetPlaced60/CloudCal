import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';

export default function SNSForm() {
  const { config, updateService } = useCalculator();
  const c = config.sns;

  return (
    <>
      <InputField label="Publish Requests" value={c.publishRequests} onChange={(v) => updateService('sns', { publishRequests: v })} unit="/month" helpText="First 1M free, then $0.50/M" />
      <InputField label="HTTP/HTTPS Deliveries" value={c.httpNotifications} onChange={(v) => updateService('sns', { httpNotifications: v })} unit="/month" helpText="First 100K free, then $0.60/M" />
      <InputField label="Email Deliveries" value={c.emailNotifications} onChange={(v) => updateService('sns', { emailNotifications: v })} unit="/month" helpText="First 1K free, then $2 per 100K" />
      <InputField label="SMS Messages" value={c.smsNotifications} onChange={(v) => updateService('sns', { smsNotifications: v })} unit="/month" helpText="~$0.00645 per SMS (US)" />
      <InputField label="SQS Queue Deliveries" value={c.sqsNotifications} onChange={(v) => updateService('sns', { sqsNotifications: v })} unit="/month" helpText="First 1M free" />
      <InputField label="Lambda Deliveries" value={c.lambdaNotifications} onChange={(v) => updateService('sns', { lambdaNotifications: v })} unit="/month" helpText="First 1M free" />
    </>
  );
}
