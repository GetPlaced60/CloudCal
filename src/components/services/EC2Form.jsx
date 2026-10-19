import React, { useState } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import InstanceSelector from '../common/InstanceSelector';
import { calculateEC2Cost } from '../../calculators/ec2Calculator';
import { formatCurrency } from '../../utils/formatCurrency';
import { Plus, Trash2, Copy, ChevronDown, ChevronUp, Server, HardDrive } from 'lucide-react';

const pricingOptions = [
  { value: 'onDemand', label: 'On-Demand (No commitment)' },
  { value: 'ec2Sp3yrNoUpfront', label: 'EC2 Instance Savings Plan — 3-Year No Upfront (Deepest Savings, ~54% off)' },
  { value: 'computeSp3yrNoUpfront', label: 'Compute Savings Plan — 3-Year No Upfront (Flexible, ~49% off)' },
  { value: 'ec2Sp1yrNoUpfront', label: 'EC2 Instance Savings Plan — 1-Year No Upfront (~37% off)' },
  { value: 'computeSp1yrNoUpfront', label: 'Compute Savings Plan — 1-Year No Upfront (~32% off)' },
  { value: 'ri1yrNoUpfront', label: 'Reserved 1-Year — No Upfront (~36% discount)' },
  { value: 'ri1yrPartial', label: 'Reserved 1-Year — Partial Upfront (~41% discount)' },
  { value: 'ri1yrAllUpfront', label: 'Reserved 1-Year — All Upfront (~44% discount)' },
  { value: 'ri3yrNoUpfront', label: 'Reserved 3-Year — No Upfront (~58% discount)' },
  { value: 'ri3yrPartial', label: 'Reserved 3-Year — Partial Upfront (~63% discount)' },
  { value: 'ri3yrAllUpfront', label: 'Reserved 3-Year — All Upfront (~66% discount)' },
  { value: 'spot', label: 'Spot Instances (Up to 70% discount)' }
];

const osOptions = [
  { value: 'amazon_linux', label: 'Amazon Linux 2023 (Included)' },
  { value: 'ubuntu', label: 'Ubuntu Linux (Standard - Included)' },
  { value: 'ubuntu_pro', label: 'Ubuntu Pro (with Canonical ESM support)' },
  { value: 'windows', label: 'Windows Server (+$0.046/vCPU-hr)' },
  { value: 'rhel', label: 'Red Hat Enterprise Linux (RHEL)' },
  { value: 'suse', label: 'SUSE Linux Enterprise Server' }
];

const ebsOptions = [
  { value: 'gp3', label: 'gp3 — Next-Gen General Purpose SSD ($0.08/GB)' },
  { value: 'gp2', label: 'gp2 — General Purpose SSD ($0.10/GB)' },
  { value: 'io1', label: 'io1 — Provisioned IOPS SSD ($0.125/GB)' },
  { value: 'io2', label: 'io2 — High-Durability Provisioned IOPS ($0.125/GB)' },
  { value: 'st1', label: 'st1 — Throughput Optimized HDD ($0.045/GB)' },
  { value: 'sc1', label: 'sc1 — Cold HDD ($0.015/GB)' }
];

export default function EC2Form() {
  const {
    config,
    addEC2Instance,
    updateEC2Instance,
    removeEC2Instance,
    duplicateEC2Instance,
    toggleEC2Instance
  } = useCalculator();

  const instances = config.ec2?.instances || [];
  const [expandedId, setExpandedId] = useState(instances[0]?.id || null);

  const totalInstancesCount = instances
    .filter(i => i.enabled)
    .reduce((sum, i) => sum + (parseInt(i.count) || 0), 0);

  return (
    <div className="col-span-full space-y-4">
      {/* EC2 Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-xs text-slate-400">
            {instances.length} Server Group{instances.length !== 1 ? 's' : ''} ({totalInstancesCount} Total Instance{totalInstancesCount !== 1 ? 's' : ''})
          </span>
          <p className="text-[11px] text-slate-500">Configure multiple servers with distinct instance families, types, and EBS sizing</p>
        </div>

        <button
          onClick={addEC2Instance}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
        >
          <Plus size={14} /> Add Server
        </button>
      </div>

      {/* Instances Accordion List */}
      <div className="space-y-2.5">
        {instances.map((inst, index) => {
          const isExpanded = expandedId === inst.id;
          const costResult = inst.enabled ? calculateEC2Cost(inst, config.region) : { total: 0, breakdown: {} };
          const scaledTotal = costResult.total;
          const showIOPS = ['gp3', 'io1', 'io2'].includes(inst.ebsVolumeType);
          const showThroughput = inst.ebsVolumeType === 'gp3';

          return (
            <div
              key={inst.id}
              className={`rounded-xl border transition-all ${
                inst.enabled
                  ? isExpanded
                    ? 'border-blue-500/50 bg-slate-900/90'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  : 'border-slate-800/60 bg-slate-950/40 opacity-60'
              }`}
            >
              {/* Server Card Header */}
              <div
                className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : inst.id)}
              >
                <div className="flex items-center gap-2.5">
                  <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={inst.enabled}
                      onChange={() => toggleEC2Instance(inst.id)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>

                  <Server size={15} className="text-slate-400" />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{inst.name || `Server ${index + 1}`}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-700">
                        {inst.instanceType ? `${inst.count}x ${inst.instanceType}` : 'Select instance'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                        {inst.ebsVolumeSize}GB {inst.ebsVolumeType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {inst.enabled ? (
                    <div className="flex items-center gap-2 text-right">
                      {costResult.breakdown?.ebs > 0 && (
                        <span className="text-[10px] text-slate-400 hidden md:inline font-mono">
                          Compute {formatCurrency(costResult.breakdown?.compute)} + EBS {formatCurrency(costResult.breakdown?.ebs)}
                        </span>
                      )}
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                        {formatCurrency(scaledTotal)}/mo
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">Disabled</span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateEC2Instance(inst.id);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    title="Duplicate server configuration"
                  >
                    <Copy size={14} />
                  </button>

                  {instances.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEC2Instance(inst.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                      title="Delete server configuration"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  <div className="text-slate-400 pl-1">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Expanded Configuration Form */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-4">
                  {/* Server Group Name Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 border-b border-slate-800">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Server Label / Role</label>
                      <input
                        type="text"
                        value={inst.name || ''}
                        onChange={(e) => updateEC2Instance(inst.id, { name: e.target.value })}
                        placeholder="e.g. Web Server, App Node, Redis, Worker..."
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Pricing Model</label>
                      <select
                        value={inst.pricingModel}
                        onChange={(e) => updateEC2Instance(inst.id, { pricingModel: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                      >
                        {pricingOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Compute Parameters */}
                  <div>
                    <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Compute Configuration
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                      <InstanceSelector
                        label="Instance Family & Type"
                        value={inst.instanceType}
                        onChange={(v) => updateEC2Instance(inst.id, { instanceType: v })}
                        region={config.region}
                      />
                      <InputField
                        label="Number of Instances"
                        value={inst.count}
                        onChange={(v) => updateEC2Instance(inst.id, { count: v })}
                        min={1}
                      />
                      <SelectField
                        label="Operating System"
                        value={inst.os}
                        onChange={(v) => updateEC2Instance(inst.id, { os: v })}
                        options={osOptions}
                      />
                      <InputField
                        label="Running Hours / Month"
                        value={inst.hoursPerMonth}
                        onChange={(v) => updateEC2Instance(inst.id, { hoursPerMonth: v })}
                        helpText="730 = 24x7 full month"
                      />
                      <InputField
                        label="Internet Data Transfer Out"
                        value={inst.dataTransferOut}
                        onChange={(v) => updateEC2Instance(inst.id, { dataTransferOut: v })}
                        unit="GB/mo"
                        helpText="100GB/mo free tier across AWS"
                      />
                      <InputField
                        label="Public / Elastic IPs"
                        value={inst.elasticIPs}
                        onChange={(v) => updateEC2Instance(inst.id, { elasticIPs: v })}
                        helpText="$0.005/hr IPv4 charge"
                      />
                    </div>
                  </div>

                  {/* Attached EBS Storage */}
                  <div className="pt-2 border-t border-slate-800">
                    <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <HardDrive size={13} /> Attached EBS Storage (Per Instance)
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <SelectField
                        label="EBS Volume Type"
                        value={inst.ebsVolumeType}
                        onChange={(v) => updateEC2Instance(inst.id, { ebsVolumeType: v })}
                        options={ebsOptions}
                      />
                      <InputField
                        label="Volume Size (per node)"
                        value={inst.ebsVolumeSize}
                        onChange={(v) => updateEC2Instance(inst.id, { ebsVolumeSize: v })}
                        unit="GB"
                      />
                      {showIOPS && (
                        <InputField
                          label="Provisioned IOPS"
                          value={inst.ebsIOPS}
                          onChange={(v) => updateEC2Instance(inst.id, { ebsIOPS: v })}
                          helpText={inst.ebsVolumeType === 'gp3' ? '3,000 IOPS included' : '$0.065/IOPS'}
                        />
                      )}
                      {showThroughput && (
                        <InputField
                          label="Provisioned Throughput"
                          value={inst.ebsThroughput}
                          onChange={(v) => updateEC2Instance(inst.id, { ebsThroughput: v })}
                          unit="MB/s"
                          helpText="125 MB/s included"
                        />
                      )}
                      <InputField
                        label="EBS Snapshot Storage"
                        value={inst.ebsSnapshots}
                        onChange={(v) => updateEC2Instance(inst.id, { ebsSnapshots: v })}
                        unit="GB"
                        helpText="$0.05/GB-mo incremental"
                      />
                    </div>
                  </div>

                  {/* Cost Summary Subtotal for this Server */}
                  <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">
                        Compute: <strong className="text-white">{formatCurrency(costResult.breakdown?.compute)}</strong>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">
                        EBS: <strong className="text-white">{formatCurrency(costResult.ebsBreakdown?.storage || 0)}</strong>
                      </span>
                      {costResult.details?.savingsVsOnDemand > 0 && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-emerald-400 font-medium">
                            Saving {costResult.details.savingsVsOnDemand}% vs On-Demand
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 mr-2">Monthly Subtotal:</span>
                      <strong className="text-emerald-400 font-bold">{formatCurrency(scaledTotal)}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
