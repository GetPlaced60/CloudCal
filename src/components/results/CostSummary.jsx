import React, { useMemo } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import { calculateEC2Cost } from '../../calculators/ec2Calculator';
import { calculateRoute53Cost } from '../../calculators/route53Calculator';
import { calculateCloudFrontCost } from '../../calculators/cloudFrontCalculator';
import { calculateNATGatewayCost } from '../../calculators/natGatewayCalculator';
import { calculateVPCCost } from '../../calculators/vpcCalculator';
import { calculateS3Cost } from '../../calculators/s3Calculator';
import { calculateSESCost } from '../../calculators/sesCalculator';
import { calculateSNSCost } from '../../calculators/snsCalculator';
import { calculateCloudWatchCost } from '../../calculators/cloudWatchCalculator';
import { calculateELBCost } from '../../calculators/elbCalculator';
import { formatCurrency } from '../../utils/formatCurrency';
import CostChart from './CostChart';

const SERVICE_LABELS = {
  route53: { name: 'Route 53', icon: '🌐', color: '#3b82f6' },
  cloudfront: { name: 'CloudFront', icon: '⚡', color: '#a855f7' },
  vpc: { name: 'VPC / Endpoints', icon: '🔒', color: '#06b6d4' },
  elb: { name: 'Elastic Load Balancer (ALB)', icon: '⚖️', color: '#0ea5e9' },
  natGateway: { name: 'NAT Gateway', icon: '🚪', color: '#f59e0b' },
  ec2Web: { name: 'EC2 Web Tier', icon: '🌍', color: '#10b981' },
  ec2App: { name: 'EC2 App Tier', icon: '⚙️', color: '#6366f1' },
  ec2Db: { name: 'EC2 DB Tier', icon: '🗄️', color: '#ec4899' },
  s3: { name: 'S3 Storage', icon: '📦', color: '#f97316' },
  ses: { name: 'SES Email', icon: '📧', color: '#14b8a6' },
  sns: { name: 'SNS Push/Alerts', icon: '🔔', color: '#c084fc' },
  cloudwatch: { name: 'CloudWatch', icon: '📊', color: '#ef4444' }
};

export default function CostSummary() {
  const { config } = useCalculator();

  const costs = useMemo(() => {
    const results = {};

    if (config.route53.enabled) {
      results.route53 = calculateRoute53Cost({
        ...config.route53,
        domainRegistrations: Array.from({ length: config.route53.domainCount || 0 }, () => ({ extension: config.route53.domainExtension || '.com' }))
      });
    }
    if (config.cloudfront.enabled) results.cloudfront = calculateCloudFrontCost(config.cloudfront);
    if (config.vpc.enabled) results.vpc = calculateVPCCost(config.vpc);
    if (config.elb?.enabled) results.elb = calculateELBCost(config.elb);
    if (config.natGateway.enabled) results.natGateway = calculateNATGatewayCost(config.natGateway);
    if (config.ec2Web.enabled) results.ec2Web = calculateEC2Cost(config.ec2Web);
    if (config.ec2App.enabled) results.ec2App = calculateEC2Cost(config.ec2App);
    if (config.ec2Db.enabled) results.ec2Db = calculateEC2Cost(config.ec2Db);
    if (config.s3.enabled) results.s3 = calculateS3Cost(config.s3);
    if (config.ses.enabled) results.ses = calculateSESCost(config.ses);
    if (config.sns.enabled) results.sns = calculateSNSCost(config.sns);
    if (config.cloudwatch.enabled) results.cloudwatch = calculateCloudWatchCost(config.cloudwatch);

    return results;
  }, [config]);

  const totalMonthly = Object.values(costs).reduce((sum, c) => sum + (c?.total || 0), 0);
  const totalAnnual = totalMonthly * 12;
  const total3Year = totalMonthly * 36;

  const chartData = Object.entries(costs)
    .filter(([, c]) => c && c.total > 0)
    .map(([key, c]) => ({
      name: SERVICE_LABELS[key]?.name || key,
      value: c.total,
      color: SERVICE_LABELS[key]?.color || '#64748b'
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-4">
      {/* Total Cost Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Monthly</p>
          <p className="text-lg md:text-xl font-bold text-white mt-0.5">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Annual</p>
          <p className="text-lg md:text-xl font-bold text-white mt-0.5">{formatCurrency(totalAnnual)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/40 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">3-Year</p>
          <p className="text-lg md:text-xl font-bold text-white mt-0.5">{formatCurrency(total3Year)}</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && <CostChart data={chartData} />}

      {/* Service Breakdown List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/90 flex justify-between items-center">
          <h3 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span>📋</span> Itemized Monthly Costs
          </h3>
          <span className="text-xs text-slate-400 font-mono">{Object.keys(costs).length} active</span>
        </div>
        <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
          {Object.entries(costs).map(([key, result]) => {
            if (!result) return null;
            const label = SERVICE_LABELS[key];
            const percentage = totalMonthly > 0 ? ((result.total / totalMonthly) * 100).toFixed(1) : 0;
            return (
              <div key={key} className="px-4 py-2.5 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{label?.icon}</span>
                    <span className="text-xs font-semibold text-white">{label?.name || key}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">{formatCurrency(result.total)}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({percentage}%)</span>
                  </div>
                </div>
                {result.breakdown && (
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px] text-slate-400">
                    {Object.entries(result.breakdown).map(([bk, bv]) => (
                      bv > 0 ? (
                        <span key={bk} className="bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-800">
                          {bk}: <span className="text-slate-300 font-mono">{formatCurrency(bv)}</span>
                        </span>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
          <span className="text-xs font-semibold uppercase text-slate-300 tracking-wider">Total Monthly</span>
          <span className="text-base font-bold text-emerald-400">{formatCurrency(totalMonthly)}/mo</span>
        </div>
      </div>

      {/* EC2 + EBS Detailed Breakdown */}
      {(costs.ec2Web || costs.ec2App || costs.ec2Db) && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/90">
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>🖥️</span> EC2 & EBS Dedicated Breakdown
            </h3>
          </div>
          <div className="divide-y divide-slate-800/60 p-3 space-y-3">
            {[
              ['ec2Web', 'Web Tier', config.ec2Web],
              ['ec2App', 'Application Tier', config.ec2App],
              ['ec2Db', 'Database Tier', config.ec2Db]
            ].map(([key, title, tierCfg]) => {
              const res = costs[key];
              if (!res || !tierCfg.enabled) return null;
              return (
                <div key={key} className="bg-slate-950/50 rounded-lg p-2.5 border border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <div>
                      <span className="text-xs font-bold text-white">{title}</span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        ({tierCfg.count}x {tierCfg.instanceType} • {res.details?.pricingModel})
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{formatCurrency(res.total)}/mo</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[10px]">
                    <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block">Compute:</span>
                      <span className="font-bold text-white">{formatCurrency(res.breakdown.compute)}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block">EBS Volume:</span>
                      <span className="font-bold text-white">{formatCurrency(res.ebsBreakdown?.storage || 0)}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block">EBS IOPS/TP:</span>
                      <span className="font-bold text-white">{formatCurrency((res.ebsBreakdown?.iops || 0) + (res.ebsBreakdown?.throughput || 0))}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block">Snapshots:</span>
                      <span className="font-bold text-white">{formatCurrency(res.ebsBreakdown?.snapshots || 0)}</span>
                    </div>
                  </div>
                  {res.details?.savingsVsOnDemand > 0 && (
                    <div className="mt-1.5 text-[10px] text-emerald-400 flex items-center gap-1">
                      <span>🎉</span>
                      <span>Saving <strong>{res.details.savingsVsOnDemand}%</strong> vs On-Demand pricing</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
