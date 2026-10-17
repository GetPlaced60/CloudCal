import React, { createContext, useContext, useReducer, useCallback } from 'react';
import regionsData from '../data/regions.json';

const CalculatorContext = createContext(null);

export const defaultEC2InstanceTemplate = {
  instanceType: '',
  count: 1,
  os: 'amazon_linux',
  pricingModel: 'onDemand',
  hoursPerMonth: 730,
  ebsVolumeSize: 30,
  ebsVolumeType: 'gp3',
  ebsIOPS: 3000,
  ebsThroughput: 125,
  ebsSnapshots: 0,
  elasticIPs: 0,
  dataTransferOut: 10
};

export const defaultServiceConfig = {
  region: 'us-east-1',
  route53: {
    enabled: false,
    hostedZones: 1,
    queriesPerMonth: 2.5,
    queryType: 'standard',
    healthChecks: 1,
    healthCheckType: 'basic',
    domainCount: 1,
    domainExtension: '.com'
  },
  cloudfront: {
    enabled: false,
    dataTransferOutGB: 250,
    httpRequestsMillions: 5,
    httpsRequestsMillions: 15
  },
  vpc: {
    enabled: false,
    interfaceEndpoints: 1,
    interfaceEndpointDataGB: 20,
    gatewayEndpoints: 1,
    vpcPeeringDataGB: 10,
    elasticIPs: 1
  },
  natGateway: {
    enabled: false,
    count: 1,
    dataProcessedGB: 150,
    hoursPerMonth: 730
  },
  elb: {
    enabled: false,
    type: 'alb',
    count: 1,
    lcus: 2,
    hoursPerMonth: 730
  },
  ec2: {
    enabled: false,
    instances: [
      {
        id: 'srv-1',
        name: 'Server 1',
        enabled: true,
        instanceType: '',
        count: 1,
        os: 'amazon_linux',
        pricingModel: 'onDemand',
        hoursPerMonth: 730,
        ebsVolumeSize: 30,
        ebsVolumeType: 'gp3',
        ebsIOPS: 3000,
        ebsThroughput: 125,
        ebsSnapshots: 0,
        elasticIPs: 0,
        dataTransferOut: 10
      }
    ]
  },
  s3: {
    enabled: false,
    storageGB: 100,
    storageClass: 'standard',
    putRequests: 10,
    getRequests: 100,
    dataTransferOutGB: 10
  },
  ses: {
    enabled: false,
    emailsSent: 25000,
    emailsReceived: 500,
    avgAttachmentSizeKB: 50,
    dedicatedIPs: 0,
    fromEC2: true
  },
  sns: {
    enabled: false,
    publishRequests: 100000,
    httpNotifications: 0,
    emailNotifications: 1000,
    smsNotifications: 0,
    sqsNotifications: 0,
    lambdaNotifications: 0
  },
  cloudwatch: {
    enabled: false,
    customMetrics: 10,
    alarms: 5,
    alarmType: 'standard',
    logIngestionGB: 25,
    logStorageGB: 100,
    dashboards: 2,
    apiRequests: 25000
  }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_REGION':
      return {
        ...state,
        region: action.region
      };
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
          enabled: !state[action.service]?.enabled
        }
      };
    case 'SET_SERVICE_ENABLED':
      return {
        ...state,
        [action.service]: {
          ...state[action.service],
          enabled: action.enabled
        }
      };
    case 'ADD_EC2_INSTANCE': {
      const newId = `srv-${Date.now()}`;
      const count = (state.ec2?.instances?.length || 0) + 1;
      const newInstance = {
        ...defaultEC2InstanceTemplate,
        id: newId,
        name: `Server ${count}`,
        enabled: true
      };
      return {
        ...state,
        ec2: {
          ...state.ec2,
          instances: [...(state.ec2?.instances || []), newInstance]
        }
      };
    }
    case 'UPDATE_EC2_INSTANCE': {
      const updatedInstances = (state.ec2?.instances || []).map(inst =>
        inst.id === action.id ? { ...inst, ...action.payload } : inst
      );
      return {
        ...state,
        ec2: {
          ...state.ec2,
          instances: updatedInstances
        }
      };
    }
    case 'REMOVE_EC2_INSTANCE': {
      const filtered = (state.ec2?.instances || []).filter(inst => inst.id !== action.id);
      return {
        ...state,
        ec2: {
          ...state.ec2,
          instances: filtered
        }
      };
    }
    case 'DUPLICATE_EC2_INSTANCE': {
      const target = (state.ec2?.instances || []).find(inst => inst.id === action.id);
      if (!target) return state;
      const cloned = {
        ...target,
        id: `srv-${Date.now()}`,
        name: `${target.name} (Copy)`
      };
      return {
        ...state,
        ec2: {
          ...state.ec2,
          instances: [...(state.ec2?.instances || []), cloned]
        }
      };
    }
    case 'TOGGLE_EC2_INSTANCE': {
      const updated = (state.ec2?.instances || []).map(inst =>
        inst.id === action.id ? { ...inst, enabled: !inst.enabled } : inst
      );
      return {
        ...state,
        ec2: {
          ...state.ec2,
          instances: updated
        }
      };
    }
    case 'RESET':
      return { ...defaultServiceConfig };
    case 'LOAD_CONFIG':
      return { ...defaultServiceConfig, ...action.payload };
    default:
      return state;
  }
}

export function CalculatorProvider({ children }) {
  const [config, dispatch] = useReducer(reducer, defaultServiceConfig);

  const setRegion = useCallback((region) => {
    dispatch({ type: 'SET_REGION', region });
  }, []);

  const updateService = useCallback((service, payload) => {
    dispatch({ type: 'UPDATE_SERVICE', service, payload });
  }, []);

  const toggleService = useCallback((service) => {
    dispatch({ type: 'TOGGLE_SERVICE', service });
  }, []);

  const setServiceEnabled = useCallback((service, enabled) => {
    dispatch({ type: 'SET_SERVICE_ENABLED', service, enabled });
  }, []);

  const addEC2Instance = useCallback(() => {
    dispatch({ type: 'ADD_EC2_INSTANCE' });
  }, []);

  const updateEC2Instance = useCallback((id, payload) => {
    dispatch({ type: 'UPDATE_EC2_INSTANCE', id, payload });
  }, []);

  const removeEC2Instance = useCallback((id) => {
    dispatch({ type: 'REMOVE_EC2_INSTANCE', id });
  }, []);

  const duplicateEC2Instance = useCallback((id) => {
    dispatch({ type: 'DUPLICATE_EC2_INSTANCE', id });
  }, []);

  const toggleEC2Instance = useCallback((id) => {
    dispatch({ type: 'TOGGLE_EC2_INSTANCE', id });
  }, []);

  const resetConfig = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const loadConfig = useCallback((payload) => {
    dispatch({ type: 'LOAD_CONFIG', payload });
  }, []);

  const currentRegion = regionsData.find(r => r.id === config.region) || regionsData[0];
  const regionMultiplier = currentRegion.multiplier || 1.0;

  return (
    <CalculatorContext.Provider value={{
      config,
      regions: regionsData,
      currentRegion,
      regionMultiplier,
      setRegion,
      updateService,
      toggleService,
      setServiceEnabled,
      addEC2Instance,
      updateEC2Instance,
      removeEC2Instance,
      duplicateEC2Instance,
      toggleEC2Instance,
      resetConfig,
      loadConfig
    }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (!context) throw new Error('useCalculator must be used within CalculatorProvider');
  return context;
}
