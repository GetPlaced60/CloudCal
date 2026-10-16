import React, { createContext, useContext, useReducer, useCallback } from 'react';

const CalculatorContext = createContext(null);

export const defaultServiceConfig = {
  route53: {
    enabled: true,
    hostedZones: 1,
    queriesPerMonth: 2.5,
    queryType: 'standard',
    healthChecks: 1,
    healthCheckType: 'basic',
    domainCount: 1,
    domainExtension: '.com'
  },
  cloudfront: {
    enabled: true,
    dataTransferOutGB: 250,
    httpRequestsMillions: 5,
    httpsRequestsMillions: 15
  },
  vpc: {
    enabled: true,
    interfaceEndpoints: 1,
    interfaceEndpointDataGB: 20,
    gatewayEndpoints: 1,
    vpcPeeringDataGB: 10,
    elasticIPs: 1
  },
  elb: {
    enabled: true,
    type: 'alb',
    count: 1,
    lcus: 2,
    hoursPerMonth: 730
  },
  natGateway: {
    enabled: true,
    count: 1,
    dataProcessedGB: 150,
    hoursPerMonth: 730
  },
  ec2Web: {
    enabled: true,
    instanceType: 't3.medium',
    count: 2,
    os: 'amazon_linux',
    pricingModel: 'ri1yrNoUpfront',
    hoursPerMonth: 730,
    ebsVolumeSize: 40,
    ebsVolumeType: 'gp3',
    ebsIOPS: 3000,
    ebsThroughput: 125,
    ebsSnapshots: 10,
    elasticIPs: 2,
    dataTransferOut: 50
  },
  ec2App: {
    enabled: true,
    instanceType: 'm6i.large',
    count: 2,
    os: 'amazon_linux',
    pricingModel: 'ri3yrNoUpfront',
    hoursPerMonth: 730,
    ebsVolumeSize: 80,
    ebsVolumeType: 'gp3',
    ebsIOPS: 3000,
    ebsThroughput: 125,
    ebsSnapshots: 20,
    elasticIPs: 0,
    dataTransferOut: 20
  },
  ec2Db: {
    enabled: true,
    instanceType: 'r6i.large',
    count: 1,
    os: 'amazon_linux',
    pricingModel: 'ri3yrNoUpfront',
    hoursPerMonth: 730,
    ebsVolumeSize: 150,
    ebsVolumeType: 'gp3',
    ebsIOPS: 4000,
    ebsThroughput: 150,
    ebsSnapshots: 75,
    elasticIPs: 0,
    dataTransferOut: 5
  },
  s3: {
    enabled: true,
    storageGB: 250,
    storageClass: 'standard',
    putRequests: 25,
    getRequests: 250,
    dataTransferOutGB: 50
  },
  ses: {
    enabled: true,
    emailsSent: 25000,
    emailsReceived: 500,
    avgAttachmentSizeKB: 50,
    dedicatedIPs: 0,
    fromEC2: true
  },
  sns: {
    enabled: true,
    publishRequests: 200000,
    httpNotifications: 50000,
    emailNotifications: 2000,
    smsNotifications: 100,
    sqsNotifications: 50000,
    lambdaNotifications: 50000
  },
  cloudwatch: {
    enabled: true,
    customMetrics: 25,
    alarms: 10,
    alarmType: 'standard',
    logIngestionGB: 25,
    logStorageGB: 100,
    dashboards: 2,
    apiRequests: 25000
  }
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_SERVICE':
      return {
        ...state,
        [action.service]: {
          ...state[action.service],
          ...action.payload
        }
      };
    case 'TOGGLE_SERVICE':
      return {
        ...state,
        [action.service]: {
          ...state[action.service],
          enabled: !state[action.service].enabled
        }
      };
    case 'RESET':
      return { ...defaultServiceConfig };
    case 'LOAD_CONFIG':
      return { ...action.payload };
    default:
      return state;
  }
}

export function CalculatorProvider({ children }) {
  const [config, dispatch] = useReducer(reducer, defaultServiceConfig);

  const updateService = useCallback((service, payload) => {
    dispatch({ type: 'UPDATE_SERVICE', service, payload });
  }, []);

  const toggleService = useCallback((service) => {
    dispatch({ type: 'TOGGLE_SERVICE', service });
  }, []);

  const resetConfig = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const loadConfig = useCallback((payload) => {
    dispatch({ type: 'LOAD_CONFIG', payload });
  }, []);

  return (
    <CalculatorContext.Provider value={{ config, updateService, toggleService, resetConfig, loadConfig }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (!context) throw new Error('useCalculator must be used within CalculatorProvider');
  return context;
}
