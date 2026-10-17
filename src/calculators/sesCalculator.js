import pricing from '../data/pricing/ses-pricing.json' with { type: 'json' };

export function calculateSESCost(config) {
  const {
    emailsSent = 10000,
    emailsReceived = 0,
    avgAttachmentSizeKB = 0,
    dedicatedIPs = 0,
    fromEC2 = true
  } = config;

  let sendCost = 0;
  if (fromEC2) {
    const billable = Math.max(0, (emailsSent || 0) - 62000);
    sendCost = billable * pricing.sending.perEmail;
  } else {
    sendCost = (emailsSent || 0) * pricing.sending.perEmail;
  }

  const attachmentGB = ((emailsSent || 0) * (avgAttachmentSizeKB || 0)) / 1024 / 1024;
  const attachmentCost = attachmentGB * pricing.sending.perGBAttachment;

  let receiveCost = 0;
  if ((emailsReceived || 0) > 1000) {
    receiveCost = (emailsReceived - 1000) * pricing.receiving.perEmail;
  }

  const dedicatedIPCost = (dedicatedIPs || 0) * pricing.dedicatedIP;
  const total = sendCost + attachmentCost + receiveCost + dedicatedIPCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      sending: Math.round(sendCost * 100) / 100,
      attachments: Math.round(attachmentCost * 100) / 100,
      receiving: Math.round(receiveCost * 100) / 100,
      dedicatedIPs: Math.round(dedicatedIPCost * 100) / 100
    }
  };
}
