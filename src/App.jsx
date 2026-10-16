import React, { useState } from 'react';
import { CalculatorProvider, useCalculator } from './context/CalculatorContext';
import Header from './components/layout/Header';
import ServiceCard from './components/common/ServiceCard';
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

function Dashboard() {
  const { config, toggleService } = useCalculator();
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const getCost = (serviceKey, calculator, transform) => {
    const c = config[serviceKey];
    if (!c || !c.enabled) return 0;
    const input = transform ? transform(c) : c;
    return calculator(input).total;
  };

  const route53Transform = (c) => ({
    ...c,
    domainRegistrations: Array.from({ length: c.domainCount || 0 }, () => ({ extension: c.domainExtension || '.com' }))
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white">
      <Header onOpenComparison={() => setIsComparisonOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Service Configuration */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>⚙️</span> Service Architecture & Tier Sizing
                </h2>
                <p className="text-xs text-slate-400">Toggle services on/off and fine-tune compute, storage, and networking parameters</p>
              </div>
            </div>

            {/* DNS & Edge */}
            <ServiceCard title="Route 53 (DNS & Domains)" icon="🌐" color="blue"
              enabled={config.route53.enabled} onToggle={() => toggleService('route53')}
              cost={getCost('route53', calculateRoute53Cost, route53Transform)}>
              <Route53Form />
            </ServiceCard>

            <ServiceCard title="CloudFront (CDN Edge Delivery)" icon="⚡" color="purple"
              enabled={config.cloudfront.enabled} onToggle={() => toggleService('cloudfront')}
              cost={getCost('cloudfront', calculateCloudFrontCost)}>
              <CloudFrontForm />
            </ServiceCard>

            {/* Networking */}
            <ServiceCard title="VPC & Internet Gateway (IGW)" icon="🔒" color="cyan"
              enabled={config.vpc.enabled} onToggle={() => toggleService('vpc')}
              cost={getCost('vpc', calculateVPCCost)}>
              <VPCForm />
            </ServiceCard>

            <ServiceCard title="NAT Gateway (Private Subnet Egress)" icon="🚪" color="orange"
              enabled={config.natGateway.enabled} onToggle={() => toggleService('natGateway')}
              cost={getCost('natGateway', calculateNATGatewayCost)}>
              <NATGatewayForm />
            </ServiceCard>

            {/* Load Balancing */}
            {config.elb && (
              <ServiceCard title="Elastic Load Balancing (ALB / NLB)" icon="⚖️" color="teal"
                enabled={config.elb.enabled} onToggle={() => toggleService('elb')}
                cost={getCost('elb', calculateELBCost)}>
                <ELBForm />
              </ServiceCard>
            )}

            {/* Compute Tiers */}
            <ServiceCard title="EC2 – Web Tier (Nginx / Frontend)" icon="🌍" color="green"
              enabled={config.ec2Web.enabled} onToggle={() => toggleService('ec2Web')}
              cost={getCost('ec2Web', calculateEC2Cost)}>
              <EC2Form serviceKey="ec2Web" />
            </ServiceCard>

            <ServiceCard title="EC2 – Application Tier (Backend Microservices)" icon="⚙️" color="indigo"
              enabled={config.ec2App.enabled} onToggle={() => toggleService('ec2App')}
              cost={getCost('ec2App', calculateEC2Cost)}>
              <EC2Form serviceKey="ec2App" />
            </ServiceCard>

            <ServiceCard title="EC2 – Database Tier (Self-Managed Database)" icon="🗄️" color="pink"
              enabled={config.ec2Db.enabled} onToggle={() => toggleService('ec2Db')}
              cost={getCost('ec2Db', calculateEC2Cost)}>
              <EC2Form serviceKey="ec2Db" />
            </ServiceCard>

            {/* Storage & Messaging */}
            <ServiceCard title="S3 (Object & Backup Storage)" icon="📦" color="orange"
              enabled={config.s3.enabled} onToggle={() => toggleService('s3')}
              cost={getCost('s3', calculateS3Cost)}>
              <S3Form />
            </ServiceCard>

            <ServiceCard title="SES / SMTP (Transactional Email Delivery)" icon="📧" color="teal"
              enabled={config.ses.enabled} onToggle={() => toggleService('ses')}
              cost={getCost('ses', calculateSESCost)}>
              <SESForm />
            </ServiceCard>

            <ServiceCard title="SNS (Pub/Sub & Alert Notifications)" icon="🔔" color="purple"
              enabled={config.sns.enabled} onToggle={() => toggleService('sns')}
              cost={getCost('sns', calculateSNSCost)}>
              <SNSForm />
            </ServiceCard>

            <ServiceCard title="CloudWatch (Logs, Metrics & Alarms)" icon="📊" color="red"
              enabled={config.cloudwatch.enabled} onToggle={() => toggleService('cloudwatch')}
              cost={getCost('cloudwatch', calculateCloudWatchCost)}>
              <CloudWatchForm />
            </ServiceCard>
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
        <p>AWS Architecture Cost Estimator • US-East-1 (N. Virginia)</p>
        <p className="mt-1">All pricing rates are modeled against standard AWS public rate cards.</p>
      </footer>

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
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
