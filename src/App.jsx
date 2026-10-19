import React, { useState } from 'react';
import { CalculatorProvider, useCalculator } from './context/CalculatorContext';
import Header from './components/layout/Header';
import ServiceCard from './components/common/ServiceCard';
import AddServiceModal from './components/common/AddServiceModal';
import { ALL_SERVICES } from './data/services';
import Route53Form from './components/services/Route53Form';
import CloudFrontForm from './components/services/CloudFrontForm';
import VPCForm from './components/services/VPCForm';
import NATGatewayForm from './components/services/NATGatewayForm';
import ELBForm from './components/services/ELBForm';
import EC2Form from './components/services/EC2Form';
import S3Form from './components/services/S3Form';
import SESForm from './components/services/SESForm';
import SNSForm from './components/services/SNSForm';
import CloudWatchForm from './components/services/CloudWatchForm';
import CostSummary from './components/results/CostSummary';
import ComparisonModal from './components/results/ComparisonModal';
import { calculateEC2Cost } from './calculators/ec2Calculator';
import { calculateRoute53Cost } from './calculators/route53Calculator';
import { calculateCloudFrontCost } from './calculators/cloudFrontCalculator';
import { calculateNATGatewayCost } from './calculators/natGatewayCalculator';
import { calculateVPCCost } from './calculators/vpcCalculator';
import { calculateS3Cost } from './calculators/s3Calculator';
import { calculateSESCost } from './calculators/sesCalculator';
import { calculateSNSCost } from './calculators/snsCalculator';
import { calculateCloudWatchCost } from './calculators/cloudWatchCalculator';
import { calculateELBCost } from './calculators/elbCalculator';
import {
  PlusCircle,
  Plus,
  Globe,
  Zap,
  Lock,
  DoorOpen,
  Scale,
  Server,
  Archive,
  Mail,
  Bell,
  Activity
} from 'lucide-react';

function Dashboard() {
  const { config, setServiceEnabled, toggleService, currentRegion } = useCalculator();
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  const getCost = (serviceKey, calculator, transform) => {
    const c = config[serviceKey];
    if (!c || !c.enabled) return 0;
    const input = transform ? transform(c) : c;
    const baseTotal = calculator(input, config.region).total;
    return Math.round(baseTotal * 100) / 100;
  };

  const getEC2TotalCost = () => {
    if (!config.ec2?.enabled || !config.ec2?.instances) return 0;
    let sum = 0;
    config.ec2.instances.forEach(inst => {
      if (inst.enabled) {
        sum += calculateEC2Cost(inst, config.region).total;
      }
    });
    return Math.round(sum * 100) / 100;
  };


  const inactiveServices = ALL_SERVICES.filter(s => !config[s.key]?.enabled);
  const activeCount = ALL_SERVICES.filter(s => config[s.key]?.enabled).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white pb-12">
      <Header
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenAddService={() => setIsAddServiceOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Quick Status Bar */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {activeCount} of {ALL_SERVICES.length} Services Configured
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">
              Region: <strong className="text-white font-medium">{currentRegion.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddServiceOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <PlusCircle size={14} /> Add / Remove Services
            </button>
          </div>
        </div>

        {/* Quick Add Inactive Service Chips */}
        {inactiveServices.length > 0 && (
          <div className="mb-6 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-400">Available services:</span>
              <span className="text-[11px] text-slate-500">Click to include in cost calculation</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {inactiveServices.map(svc => {
                const Icon = svc.icon;
                return (
                  <button
                    key={svc.key}
                    onClick={() => setServiceEnabled(svc.key, true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs border border-slate-700/80 hover:border-slate-600 transition-all"
                  >
                    <Icon size={13} className="text-slate-400" />
                    <span>{svc.name}</span>
                    <Plus size={12} className="text-blue-400" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Active Service Configuration */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base font-bold text-white">
                  Active Architecture Services
                </h2>
                <p className="text-xs text-slate-400">Only enabled services contribute to the estimated cost</p>
              </div>
            </div>

            {/* Route 53 */}
            {config.route53?.enabled && (
              <ServiceCard
                title="Route 53 (DNS & Domains)"
                icon={Globe}
                color="blue"
                enabled={config.route53.enabled}
                onToggle={() => toggleService('route53')}
                onRemove={() => setServiceEnabled('route53', false)}
                cost={getCost('route53', calculateRoute53Cost)}
              >
                <Route53Form />
              </ServiceCard>
            )}

            {/* CloudFront */}
            {config.cloudfront?.enabled && (
              <ServiceCard
                title="CloudFront (CDN Edge Delivery)"
                icon={Zap}
                color="purple"
                enabled={config.cloudfront.enabled}
                onToggle={() => toggleService('cloudfront')}
                onRemove={() => setServiceEnabled('cloudfront', false)}
                cost={getCost('cloudfront', calculateCloudFrontCost)}
              >
                <CloudFrontForm />
              </ServiceCard>
            )}

            {/* VPC */}
            {config.vpc?.enabled && (
              <ServiceCard
                title="VPC & Internet Gateway (IGW)"
                icon={Lock}
                color="cyan"
                enabled={config.vpc.enabled}
                onToggle={() => toggleService('vpc')}
                onRemove={() => setServiceEnabled('vpc', false)}
                cost={getCost('vpc', calculateVPCCost)}
              >
                <VPCForm />
              </ServiceCard>
            )}

            {/* NAT Gateway */}
            {config.natGateway?.enabled && (
              <ServiceCard
                title="NAT Gateway (Private Subnet Egress)"
                icon={DoorOpen}
                color="orange"
                enabled={config.natGateway.enabled}
                onToggle={() => toggleService('natGateway')}
                onRemove={() => setServiceEnabled('natGateway', false)}
                cost={getCost('natGateway', calculateNATGatewayCost)}
              >
                <NATGatewayForm />
              </ServiceCard>
            )}

            {/* Elastic Load Balancing */}
            {config.elb?.enabled && (
              <ServiceCard
                title="Elastic Load Balancing (ALB / NLB)"
                icon={Scale}
                color="teal"
                enabled={config.elb.enabled}
                onToggle={() => toggleService('elb')}
                onRemove={() => setServiceEnabled('elb', false)}
                cost={getCost('elb', calculateELBCost)}
              >
                <ELBForm />
              </ServiceCard>
            )}

            {/* EC2 Multi-Instance Server Fleet */}
            {config.ec2?.enabled && (
              <ServiceCard
                title="Amazon EC2 (Virtual Servers & Compute Fleet)"
                icon={Server}
                color="green"
                enabled={config.ec2.enabled}
                onToggle={() => toggleService('ec2')}
                onRemove={() => setServiceEnabled('ec2', false)}
                cost={getEC2TotalCost()}
              >
                <EC2Form />
              </ServiceCard>
            )}

            {/* S3 */}
            {config.s3?.enabled && (
              <ServiceCard
                title="Amazon S3 (Object & Backup Storage)"
                icon={Archive}
                color="orange"
                enabled={config.s3.enabled}
                onToggle={() => toggleService('s3')}
                onRemove={() => setServiceEnabled('s3', false)}
                cost={getCost('s3', calculateS3Cost)}
              >
                <S3Form />
              </ServiceCard>
            )}

            {/* SES */}
            {config.ses?.enabled && (
              <ServiceCard
                title="Amazon SES / SMTP (Transactional Email Delivery)"
                icon={Mail}
                color="teal"
                enabled={config.ses.enabled}
                onToggle={() => toggleService('ses')}
                onRemove={() => setServiceEnabled('ses', false)}
                cost={getCost('ses', calculateSESCost)}
              >
                <SESForm />
              </ServiceCard>
            )}

            {/* SNS */}
            {config.sns?.enabled && (
              <ServiceCard
                title="Amazon SNS (Alert Notifications & SMS)"
                icon={Bell}
                color="purple"
                enabled={config.sns.enabled}
                onToggle={() => toggleService('sns')}
                onRemove={() => setServiceEnabled('sns', false)}
                cost={getCost('sns', calculateSNSCost)}
              >
                <SNSForm />
              </ServiceCard>
            )}

            {/* CloudWatch */}
            {config.cloudwatch?.enabled && (
              <ServiceCard
                title="Amazon CloudWatch (Logs, Metrics & Alarms)"
                icon={Activity}
                color="red"
                enabled={config.cloudwatch.enabled}
                onToggle={() => toggleService('cloudwatch')}
                onRemove={() => setServiceEnabled('cloudwatch', false)}
                cost={getCost('cloudwatch', calculateCloudWatchCost)}
              >
                <CloudWatchForm />
              </ServiceCard>
            )}

            {activeCount === 0 && (
              <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 md:p-8 text-center">
                <div className="max-w-md mx-auto mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
                    <PlusCircle size={24} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Select a Service to Begin Costing
                  </h3>
                  <p className="text-xs text-slate-400">
                    No services are currently selected. Choose a service below to add it to your architecture and start your AWS cost calculation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {ALL_SERVICES.map(svc => {
                    const Icon = svc.icon;
                    return (
                      <div
                        key={svc.key}
                        onClick={() => setServiceEnabled(svc.key, true)}
                        className="group flex items-start gap-3 p-3 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-blue-500/50 rounded-xl cursor-pointer transition-all shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-300 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors shrink-0 mt-0.5">
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                              {svc.name}
                            </span>
                            <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1 group-hover:underline">
                              Add <Plus size={12} />
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                            {svc.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Cost Summary (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <CostSummary />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 mt-16 py-6 text-center text-xs text-slate-500">
        <p>AWS Architecture Cost Estimator • Multi-Region Support</p>
        <p className="mt-1">All pricing rates are modeled against standard AWS public rate cards.</p>
      </footer>

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />

      {/* Add / Remove Service Modal */}
      <AddServiceModal
        isOpen={isAddServiceOpen}
        onClose={() => setIsAddServiceOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <CalculatorProvider>
      <Dashboard />
    </CalculatorProvider>
  );
}
