import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';

const instanceOptions = [
  { value: 't3.nano', label: 't3.nano — 2 vCPU, 0.5 GB RAM' },
  { value: 't3.micro', label: 't3.micro — 2 vCPU, 1 GB RAM' },
  { value: 't3.small', label: 't3.small — 2 vCPU, 2 GB RAM' },
  { value: 't3.medium', label: 't3.medium — 2 vCPU, 4 GB RAM' },
  { value: 't3.large', label: 't3.large — 2 vCPU, 8 GB RAM' },
  { value: 't3.xlarge', label: 't3.xlarge — 4 vCPU, 16 GB RAM' },
  { value: 't3.2xlarge', label: 't3.2xlarge — 8 vCPU, 32 GB RAM' },
  { value: 'm6i.large', label: 'm6i.large — 2 vCPU, 8 GB RAM' },
  { value: 'm6i.xlarge', label: 'm6i.xlarge — 4 vCPU, 16 GB RAM' },
  { value: 'm6i.2xlarge', label: 'm6i.2xlarge — 8 vCPU, 32 GB RAM' },
  { value: 'm6i.4xlarge', label: 'm6i.4xlarge — 16 vCPU, 64 GB RAM' },
  { value: 'c6i.large', label: 'c6i.large (Compute) — 2 vCPU, 4 GB' },
  { value: 'c6i.xlarge', label: 'c6i.xlarge (Compute) — 4 vCPU, 8 GB' },
  { value: 'c6i.2xlarge', label: 'c6i.2xlarge (Compute) — 8 vCPU, 16 GB' },
  { value: 'r6i.large', label: 'r6i.large (Memory) — 2 vCPU, 16 GB' },
  { value: 'r6i.xlarge', label: 'r6i.xlarge (Memory) — 4 vCPU, 32 GB' },
  { value: 'r6i.2xlarge', label: 'r6i.2xlarge (Memory) — 8 vCPU, 64 GB' },
  { value: 'r6i.4xlarge', label: 'r6i.4xlarge (Memory) — 16 vCPU, 128 GB' }
];

const pricingOptions = [
  { value: 'onDemand', label: '💳 On-Demand (No commitment)' },
  { value: 'ri1yrNoUpfront', label: '📅 Reserved 1-Year — No Upfront (~31% discount)' },
  { value: 'ri1yrPartial', label: '📅 Reserved 1-Year — Partial Upfront (~37% discount)' },
  { value: 'ri1yrAllUpfront', label: '📅 Reserved 1-Year — All Upfront (~42% discount)' },
  { value: 'ri3yrNoUpfront', label: '📆 Reserved 3-Year — No Upfront (~56% discount)' },
  { value: 'ri3yrPartial', label: '📆 Reserved 3-Year — Partial Upfront (~61% discount)' },
  { value: 'ri3yrAllUpfront', label: '📆 Reserved 3-Year — All Upfront (~65% discount)' },
  { value: 'spot', label: '⚡ Spot Instances (Up to 70% discount)' }
];

const osOptions = [
  { value: 'amazon_linux', label: 'Amazon Linux 2023 (Free)' },
  { value: 'ubuntu', label: 'Ubuntu Linux (Free)' },
  { value: 'windows', label: 'Windows Server (+$0.046/hr)' },
  { value: 'rhel', label: 'Red Hat Enterprise Linux (+$0.06/hr)' }
];

const ebsOptions = [
  { value: 'gp3', label: 'gp3 — Next-Gen General Purpose SSD ($0.08/GB)' },
  { value: 'gp2', label: 'gp2 — General Purpose SSD ($0.10/GB)' },
  { value: 'io1', label: 'io1 — Provisioned IOPS SSD ($0.125/GB)' },
  { value: 'io2', label: 'io2 — High-Durability Provisioned IOPS ($0.125/GB)' },
  { value: 'st1', label: 'st1 — Throughput Optimized HDD ($0.045/GB)' },
  { value: 'sc1', label: 'sc1 — Cold HDD ($0.015/GB)' }
];

export default function EC2Form({ serviceKey }) {
  const { config, updateService } = useCalculator();
  const c = config[serviceKey] || {};

  const update = (payload) => updateService(serviceKey, payload);

  const showIOPS = ['gp3', 'io1', 'io2'].includes(c.ebsVolumeType);
  const showThroughput = c.ebsVolumeType === 'gp3';

  return (
    <>
      <div className="col-span-full border-b border-slate-800 pb-1 mb-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>💻</span> EC2 Compute Configuration
        </h4>
      </div>
      <SelectField label="Instance Type" value={c.instanceType} onChange={(v) => update({ instanceType: v })} options={instanceOptions} />
      <InputField label="Instance Count" value={c.count} onChange={(v) => update({ count: v })} min={1} />
      <SelectField label="Operating System" value={c.os} onChange={(v) => update({ os: v })} options={osOptions} />
      <SelectField label="Commitment / Pricing Model" value={c.pricingModel} onChange={(v) => update({ pricingModel: v })} options={pricingOptions} />
      <InputField label="Running Hours per Month" value={c.hoursPerMonth} onChange={(v) => update({ hoursPerMonth: v })} helpText="730 = 24x7 all month" />
      <InputField label="Data Transfer Out" value={c.dataTransferOut} onChange={(v) => update({ dataTransferOut: v })} unit="GB/mo" helpText="Internet egress (1GB free)" />

      <div className="col-span-full border-b border-slate-800 pb-1 mt-3 mb-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>💾</span> Attached EBS Storage (per instance)
        </h4>
      </div>
      <SelectField label="EBS Volume Type" value={c.ebsVolumeType} onChange={(v) => update({ ebsVolumeType: v })} options={ebsOptions} />
      <InputField label="Volume Size per Instance" value={c.ebsVolumeSize} onChange={(v) => update({ ebsVolumeSize: v })} unit="GB" />
      {showIOPS && (
        <InputField
          label="Provisioned IOPS"
          value={c.ebsIOPS}
          onChange={(v) => update({ ebsIOPS: v })}
          helpText={c.ebsVolumeType === 'gp3' ? 'Base 3,000 IOPS free' : '$0.065/IOPS'}
        />
      )}
      {showThroughput && (
        <InputField
          label="Provisioned Throughput"
          value={c.ebsThroughput}
          onChange={(v) => update({ ebsThroughput: v })}
          unit="MB/s"
          helpText="Base 125 MB/s free"
        />
      )}
      <InputField label="EBS Snapshot Storage" value={c.ebsSnapshots} onChange={(v) => update({ ebsSnapshots: v })} unit="GB" helpText="$0.05/GB-mo incremental" />
      <InputField label="Elastic IPs (Attached/Public)" value={c.elasticIPs} onChange={(v) => update({ elasticIPs: v })} helpText="$0.005/hr IPv4" />
    </>
  );
}
