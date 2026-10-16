import React from 'react';
import { RotateCcw, Download, Upload, ShieldCheck, Zap, Scale, FileSpreadsheet, FileText } from 'lucide-react';
import { useCalculator, defaultServiceConfig } from '../../context/CalculatorContext';
import { jsPDF } from 'jspdf';
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

export default function Header({ onOpenComparison }) {
  const { config, resetConfig, loadConfig } = useCalculator();

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aws-cost-estimate-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          loadConfig(parsed);
        } catch {
          alert('Invalid configuration file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const exportCSV = () => {
    const rows = [
      ['Service', 'Status', 'Monthly Cost (USD)', 'Annual Cost (USD)']
    ];

    const addRow = (name, costObj, enabled) => {
      if (!enabled) {
        rows.push([name, 'Disabled', '0.00', '0.00']);
      } else {
        const m = costObj.total || 0;
        rows.push([name, 'Enabled', m.toFixed(2), (m * 12).toFixed(2)]);
      }
    };

    addRow('Route 53', calculateRoute53Cost({ ...config.route53, domainRegistrations: Array.from({ length: config.route53.domainCount || 0 }, () => ({ extension: config.route53.domainExtension || '.com' })) }), config.route53.enabled);
    addRow('CloudFront', calculateCloudFrontCost(config.cloudfront), config.cloudfront.enabled);
    addRow('VPC / Endpoints', calculateVPCCost(config.vpc), config.vpc.enabled);
    if (config.elb) addRow('ELB Load Balancer', calculateELBCost(config.elb), config.elb.enabled);
    addRow('NAT Gateway', calculateNATGatewayCost(config.natGateway), config.natGateway.enabled);
    addRow('EC2 Web Tier', calculateEC2Cost(config.ec2Web), config.ec2Web.enabled);
    addRow('EC2 App Tier', calculateEC2Cost(config.ec2App), config.ec2App.enabled);
    addRow('EC2 DB Tier', calculateEC2Cost(config.ec2Db), config.ec2Db.enabled);
    addRow('S3 Storage', calculateS3Cost(config.s3), config.s3.enabled);
    addRow('SES Email', calculateSESCost(config.ses), config.ses.enabled);
    addRow('SNS Alerts', calculateSNSCost(config.sns), config.sns.enabled);
    addRow('CloudWatch', calculateCloudWatchCost(config.cloudwatch), config.cloudwatch.enabled);

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aws-cost-breakdown-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text("AWS Infrastructure Cost Estimate", 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Region: US-East-1 (N. Virginia)`, 14, y);
    y += 12;

    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);
    y += 8;

    // Items
    const items = [
      { name: 'Route 53', res: calculateRoute53Cost({ ...config.route53, domainRegistrations: Array.from({ length: config.route53.domainCount || 0 }, () => ({ extension: config.route53.domainExtension || '.com' })) }), en: config.route53.enabled },
      { name: 'CloudFront', res: calculateCloudFrontCost(config.cloudfront), en: config.cloudfront.enabled },
      { name: 'VPC & PrivateLink', res: calculateVPCCost(config.vpc), en: config.vpc.enabled },
      { name: 'Elastic Load Balancer', res: config.elb ? calculateELBCost(config.elb) : { total: 0 }, en: config.elb?.enabled },
      { name: 'NAT Gateway', res: calculateNATGatewayCost(config.natGateway), en: config.natGateway.enabled },
      { name: `EC2 Web (${config.ec2Web.count}x ${config.ec2Web.instanceType})`, res: calculateEC2Cost(config.ec2Web), en: config.ec2Web.enabled },
      { name: `EC2 App (${config.ec2App.count}x ${config.ec2App.instanceType})`, res: calculateEC2Cost(config.ec2App), en: config.ec2App.enabled },
      { name: `EC2 DB (${config.ec2Db.count}x ${config.ec2Db.instanceType})`, res: calculateEC2Cost(config.ec2Db), en: config.ec2Db.enabled },
      { name: 'S3 Object Storage', res: calculateS3Cost(config.s3), en: config.s3.enabled },
      { name: 'SES Email Delivery', res: calculateSESCost(config.ses), en: config.ses.enabled },
      { name: 'SNS Notifications', res: calculateSNSCost(config.sns), en: config.sns.enabled },
      { name: 'CloudWatch Logs & Metrics', res: calculateCloudWatchCost(config.cloudwatch), en: config.cloudwatch.enabled }
    ];

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text("Service", 14, y);
    doc.text("Status", 110, y);
    doc.text("Monthly Cost", 155, y);
    y += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    let totalMonthly = 0;

    items.forEach(item => {
      if (item.en) {
        totalMonthly += item.res.total;
        doc.text(item.name, 14, y);
        doc.text("Active", 110, y);
        doc.text(formatCurrency(item.res.total), 155, y);
      } else {
        doc.text(item.name, 14, y);
        doc.text("Disabled", 110, y);
        doc.text("$0.00", 155, y);
      }
      y += 6;
    });

    y += 4;
    doc.line(14, y, 196, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`Total Monthly Estimate: ${formatCurrency(totalMonthly)}`, 14, y);
    y += 7;
    doc.text(`Total Annual Estimate: ${formatCurrency(totalMonthly * 12)}`, 14, y);
    y += 7;
    doc.text(`Total 3-Year Estimate: ${formatCurrency(totalMonthly * 36)}`, 14, y);

    doc.save(`aws-cost-estimate-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const loadPreset = (presetType) => {
    if (presetType === 'startup') {
      loadConfig({
        ...defaultServiceConfig,
        ec2Web: { ...defaultServiceConfig.ec2Web, instanceType: 't3.small', count: 1, pricingModel: 'ri1yrNoUpfront' },
        ec2App: { ...defaultServiceConfig.ec2App, instanceType: 't3.medium', count: 1, pricingModel: 'ri1yrNoUpfront' },
        ec2Db: { ...defaultServiceConfig.ec2Db, instanceType: 't3.large', count: 1, pricingModel: 'ri1yrNoUpfront', ebsVolumeSize: 50 },
        natGateway: { ...defaultServiceConfig.natGateway, count: 1, dataProcessedGB: 50 },
        s3: { ...defaultServiceConfig.s3, storageGB: 50 }
      });
    } else if (presetType === 'production') {
      loadConfig({
        ...defaultServiceConfig,
        ec2Web: { ...defaultServiceConfig.ec2Web, instanceType: 't3.xlarge', count: 3, pricingModel: 'ri3yrNoUpfront' },
        ec2App: { ...defaultServiceConfig.ec2App, instanceType: 'm6i.xlarge', count: 4, pricingModel: 'ri3yrNoUpfront' },
        ec2Db: { ...defaultServiceConfig.ec2Db, instanceType: 'r6i.2xlarge', count: 2, pricingModel: 'ri3yrNoUpfront', ebsVolumeSize: 300, ebsIOPS: 8000 },
        natGateway: { ...defaultServiceConfig.natGateway, count: 2, dataProcessedGB: 500 },
        s3: { ...defaultServiceConfig.s3, storageGB: 1000 }
      });
    }
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 font-bold text-slate-950 text-xl">
            ☁️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight">AWS Cost Estimator</h1>
              <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">US-East-1</span>
            </div>
            <p className="text-xs text-slate-400">Custom 3-Tier Architecture & EC2 / EBS Pricing</p>
          </div>
        </div>

        {/* Action presets and buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Comparison tool button */}
          <button
            onClick={onOpenComparison}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg shadow transition-colors"
            title="Compare On-Demand vs Reserved vs Spot"
          >
            <Scale size={14} /> Compare RI vs Spot
          </button>

          {/* Presets */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => loadPreset('startup')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Load small startup preset"
            >
              <Zap size={12} className="text-amber-400" /> Startup
            </button>
            <button
              onClick={() => loadPreset('production')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Load high availability production preset"
            >
              <ShieldCheck size={12} className="text-emerald-400" /> Production
            </button>
          </div>

          {/* Export Dropdown / Actions */}
          <button
            onClick={exportPDF}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Download PDF report"
          >
            <FileText size={13} className="text-rose-400" /> PDF
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Export CSV spreadsheet"
          >
            <FileSpreadsheet size={13} className="text-emerald-400" /> CSV
          </button>
          <button
            onClick={exportConfig}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Export JSON configuration"
          >
            <Download size={13} /> JSON
          </button>
          <button
            onClick={importConfig}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Import JSON configuration"
          >
            <Upload size={13} />
          </button>
          <button
            onClick={resetConfig}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-400 bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800 rounded-lg transition-colors"
            title="Reset to default settings"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
