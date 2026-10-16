import pricing from '../data/pricing/sns-pricing.json';

export function calculateSNSCost(config) {
  const {
    publishRequests = 100000,
    httpNotifications = 0,
    emailNotifications = 0,
    smsNotifications = 0,
    sqsNotifications = 0,
    lambdaNotifications = 0
  } = config;

  let requestCost = 0;
  if ((publishRequests || 0) > 1000000) {
    requestCost = ((publishRequests - 1000000) / 1000000) * pricing.requests.perMillion;
  }

  let httpCost = 0;
  if ((httpNotifications || 0) > 100000) {
    httpCost = ((httpNotifications - 100000) / 1000000) * pricing.notifications.http.perMillion;
  }

  let emailCost = 0;
  if ((emailNotifications || 0) > 1000) {
    emailCost = (emailNotifications - 1000) * pricing.notifications.email.perNotification;
  }

  const smsCost = (smsNotifications || 0) * pricing.notifications.sms.perMessage;

  let sqsCost = 0;
  if ((sqsNotifications || 0) > 1000000) {
    sqsCost = ((sqsNotifications - 1000000) / 1000000) * pricing.notifications.sqs.perMillion;
  }

  let lambdaCost = 0;
  if ((lambdaNotifications || 0) > 1000000) {
    lambdaCost = ((lambdaNotifications - 1000000) / 1000000) * pricing.notifications.lambda.perMillion;
  }

  const total = requestCost + httpCost + emailCost + smsCost + sqsCost + lambdaCost;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      requests: Math.round(requestCost * 100) / 100,
      http: Math.round(httpCost * 100) / 100,
      email: Math.round(emailCost * 100) / 100,
      sms: Math.round(smsCost * 100) / 100,
      sqs: Math.round(sqsCost * 100) / 100,
      lambda: Math.round(lambdaCost * 100) / 100
    }
  };
}
