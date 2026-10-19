import React from 'react';
import { RotateCcw, Download, Upload, ShieldCheck, Scale, FileSpreadsheet, FileText, PlusCircle, Globe, Cloud } from 'lucide-react';
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

export default function Header({ onOpenComparison, onOpenAddService }) {
  const { config, regions, currentRegion, setRegion, resetConfig, loadConfig } = useCalculator();

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
      ['Service / Resource', 'Status', 'Configuration', 'Monthly Cost (USD)', 'Annual Cost (USD)']
    ];

    const addRow = (name, status, desc, cost) => {
      rows.push([name, status, desc, cost.toFixed(2), (cost * 12).toFixed(2)]);
    };

    if (config.route53?.enabled) {
      const c = calculateRoute53Cost(config.route53);
      addRow('Route 53', 'Active', `${config.route53.hostedZones} zones`, c.total);
    }
    if (config.cloudfront?.enabled) {
      const c = calculateCloudFrontCost(config.cloudfront, config.region);
      addRow('CloudFront', 'Active', `${config.cloudfront.dataTransferOutGB} GB egress`, c.total);
    }
    if (config.vpc?.enabled) {
      const c = calculateVPCCost(config.vpc, config.region);
      addRow('VPC & PrivateLink', 'Active', `${config.vpc.interfaceEndpoints} endpoints`, c.total);
    }
    if (config.elb?.enabled) {
      const c = calculateELBCost(config.elb, config.region);
      addRow('Elastic Load Balancer', 'Active', `${config.elb.count} ${config.elb.type.toUpperCase()}`, c.total);
    }
    if (config.natGateway?.enabled) {
      const c = calculateNATGatewayCost(config.natGateway, config.region);
      addRow('NAT Gateway', 'Active', `${config.natGateway.count} NAT GWs`, c.total);
    }

    // List individual EC2 servers
    if (config.ec2?.enabled && config.ec2?.instances) {
      config.ec2.instances.forEach(inst => {
        if (inst.enabled) {
          const c = calculateEC2Cost(inst, config.region);
          addRow(`EC2: ${inst.name}`, 'Active', `${inst.count}x ${inst.instanceType} (${inst.pricingModel})`, c.total);
        }
      });
    }

    if (config.s3?.enabled) {
      const c = calculateS3Cost(config.s3, config.region);
      addRow('Amazon S3', 'Active', `${config.s3.storageGB} GB`, c.total);
    }
    if (config.ses?.enabled) {
      const c = calculateSESCost(config.ses);
      addRow('Amazon SES', 'Active', `${config.ses.emailsSent} emails/mo`, c.total);
    }
    if (config.sns?.enabled) {
      const c = calculateSNSCost(config.sns);
      addRow('Amazon SNS', 'Active', `${config.sns.publishRequests} requests`, c.total);
    }
    if (config.cloudwatch?.enabled) {
      const c = calculateCloudWatchCost(config.cloudwatch, config.region);
      addRow('Amazon CloudWatch', 'Active', `${config.cloudwatch.logIngestionGB} GB logs`, c.total);
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(item => `"${item}"`).join(",")).join("\n");
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
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Region: ${currentRegion.name} (${currentRegion.id})`, 14, y);
    y += 12;

    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text("Service / Component", 14, y);
    doc.text("Specification", 100, y);
    doc.text("Monthly Cost", 155, y);
    y += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    let totalMonthly = 0;

    const addItem = (name, spec, cost) => {
      totalMonthly += cost;
      doc.text(name, 14, y);
      doc.text(spec, 100, y);
      doc.text(formatCurrency(cost), 155, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    };

    if (config.route53?.enabled) {
      const c = calculateRoute53Cost(config.route53);
      addItem('Route 53', `${config.route53.hostedZones} zones`, c.total);
    }
    if (config.cloudfront?.enabled) {
      const c = calculateCloudFrontCost(config.cloudfront, config.region);
      addItem('CloudFront', `${config.cloudfront.dataTransferOutGB} GB egress`, c.total);
    }
    if (config.vpc?.enabled) {
      const c = calculateVPCCost(config.vpc, config.region);
      addItem('VPC & PrivateLink', `${config.vpc.interfaceEndpoints} endpoints`, c.total);
    }
    if (config.elb?.enabled) {
      const c = calculateELBCost(config.elb, config.region);
      addItem('Elastic Load Balancer', `${config.elb.count} ${config.elb.type.toUpperCase()}`, c.total);
    }
    if (config.natGateway?.enabled) {
      const c = calculateNATGatewayCost(config.natGateway, config.region);
      addItem('NAT Gateway', `${config.natGateway.count} gateways`, c.total);
    }

    // Multi-instance EC2 items
    if (config.ec2?.enabled && config.ec2?.instances) {
      config.ec2.instances.forEach(inst => {
        if (inst.enabled) {
          const c = calculateEC2Cost(inst, config.region);
          addItem(
            `EC2: ${inst.name}`,
            `${inst.count}x ${inst.instanceType} (${inst.ebsVolumeSize}GB ${inst.ebsVolumeType})`,
            c.total
          );
        }
      });
    }

    if (config.s3?.enabled) {
      const c = calculateS3Cost(config.s3, config.region);
      addItem('Amazon S3', `${config.s3.storageGB} GB`, c.total);
    }
    if (config.ses?.enabled) {
      const c = calculateSESCost(config.ses);
      addItem('Amazon SES', `${config.ses.emailsSent} emails/mo`, c.total);
    }
    if (config.sns?.enabled) {
      const c = calculateSNSCost(config.sns);
      addItem('Amazon SNS', `${config.sns.publishRequests} requests`, c.total);
    }
    if (config.cloudwatch?.enabled) {
      const c = calculateCloudWatchCost(config.cloudwatch, config.region);
      addItem('Amazon CloudWatch', `${config.cloudwatch.logIngestionGB} GB logs`, c.total);
    }

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

  const loadProductionPreset = () => {
    loadConfig({
      ...defaultServiceConfig,
      region: config.region,
      route53: { ...defaultServiceConfig.route53, enabled: true, hostedZones: 2, queriesPerMonth: 5 },
      cloudfront: { ...defaultServiceConfig.cloudfront, enabled: true, dataTransferOutGB: 500 },
      vpc: { ...defaultServiceConfig.vpc, enabled: true, interfaceEndpoints: 2 },
      natGateway: { ...defaultServiceConfig.natGateway, enabled: true, count: 2, dataProcessedGB: 500 },
      elb: { ...defaultServiceConfig.elb, enabled: true, count: 2, lcus: 4 },
      ec2: {
        enabled: true,
        instances: [
          {
            id: 'prod-web',
            name: 'Web Tier (Load Balanced)',
            enabled: true,
            instanceType: 'c6i.xlarge',
            count: 3,
            os: 'amazon_linux',
            pricingModel: 'ri3yrNoUpfront',
            hoursPerMonth: 730,
            ebsVolumeSize: 50,
            ebsVolumeType: 'gp3',
            ebsIOPS: 3000,
            ebsThroughput: 125,
            ebsSnapshots: 25,
            elasticIPs: 0,
            dataTransferOut: 100
          },
          {
            id: 'prod-app',
            name: 'App Tier (Business Logic)',
            enabled: true,
            instanceType: 'm6i.2xlarge',
            count: 4,
            os: 'amazon_linux',
            pricingModel: 'ri3yrNoUpfront',
            hoursPerMonth: 730,
            ebsVolumeSize: 100,
            ebsVolumeType: 'gp3',
            ebsIOPS: 4000,
            ebsThroughput: 150,
            ebsSnapshots: 50,
            elasticIPs: 0,
            dataTransferOut: 50
          },
          {
            id: 'prod-db',
            name: 'Database Cluster (Primary + Replica)',
            enabled: true,
            instanceType: 'r6i.2xlarge',
            count: 2,
            os: 'amazon_linux',
            pricingModel: 'ri3yrNoUpfront',
            hoursPerMonth: 730,
            ebsVolumeSize: 300,
            ebsVolumeType: 'gp3',
            ebsIOPS: 8000,
            ebsThroughput: 250,
            ebsSnapshots: 150,
            elasticIPs: 0,
            dataTransferOut: 10
          },
          {
            id: 'prod-cache',
            name: 'In-Memory Cache Cluster',
            enabled: true,
            instanceType: 'r6i.large',
            count: 2,
            os: 'amazon_linux',
            pricingModel: 'ri3yrNoUpfront',
            hoursPerMonth: 730,
            ebsVolumeSize: 30,
            ebsVolumeType: 'gp3',
            ebsIOPS: 3000,
            ebsThroughput: 125,
            ebsSnapshots: 0,
            elasticIPs: 0,
            dataTransferOut: 5
          }
        ]
      },
      s3: { ...defaultServiceConfig.s3, enabled: true, storageGB: 1000 },
      ses: { ...defaultServiceConfig.ses, enabled: true },
      sns: { ...defaultServiceConfig.sns, enabled: true },
      cloudwatch: { ...defaultServiceConfig.cloudwatch, enabled: true, logIngestionGB: 100, customMetrics: 50 }
    });
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Cloud size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight">AWS Cost Estimator</h1>
            </div>
            <p className="text-xs text-slate-400">Architecture & Multi-Server Sizing</p>
          </div>
        </div>

        {/* Region Selector */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-700/80 px-2.5 py-1.5 rounded-lg">
          <Globe size={14} className="text-blue-400" />
          <span className="text-xs font-semibold text-slate-400">Region:</span>
          <select
            value={config.region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-transparent text-xs font-medium text-white outline-none cursor-pointer pr-1"
          >
            {regions.map(r => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Add Service Catalog Button */}
          <button
            onClick={onOpenAddService}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow transition-colors"
          >
            <PlusCircle size={14} /> Add / Remove Services
          </button>

          {/* Comparison tool button */}
          <button
            onClick={onOpenComparison}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg shadow transition-colors"
            title="Compare On-Demand vs Reserved vs Spot"
          >
            <Scale size={14} /> Compare Pricing Models
          </button>

          {/* Production Preset Only */}
          <button
            onClick={loadProductionPreset}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Load high availability production architecture with multi-server fleet"
          >
            <ShieldCheck size={13} className="text-emerald-400" /> Production Architecture
          </button>

          {/* Export Dropdown / Actions */}
          <button
            onClick={exportPDF}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Download PDF report"
          >
            <FileText size={13} className="text-slate-400" /> PDF
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Export CSV spreadsheet"
          >
            <FileSpreadsheet size={13} className="text-slate-400" /> CSV
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
