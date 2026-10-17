import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Cpu, X } from 'lucide-react';
import ec2Pricing from '../../data/pricing/ec2-pricing.json' with { type: 'json' };

// Family definitions with categories for intelligent grouping & filtering
const FAMILY_METADATA = [
  // General Purpose
  { prefix: 't3.', name: 'Burstable General Purpose (t3)', category: 'general', arch: 'Intel x86_64' },
  { prefix: 't3a.', name: 'Burstable AMD EPYC (t3a)', category: 'general', arch: 'AMD EPYC' },
  { prefix: 't4g.', name: 'Burstable Graviton2 ARM (t4g)', category: 'general', arch: 'AWS Graviton2' },
  { prefix: 'm6a.', name: 'General Purpose - AMD EPYC (m6a)', category: 'general', arch: 'AMD EPYC' },
  { prefix: 'm7a.', name: 'General Purpose - AMD Genoa 4th Gen (m7a)', category: 'general', arch: 'AMD Genoa' },
  { prefix: 'm6i.', name: 'General Purpose - Intel 6th Gen (m6i)', category: 'general', arch: 'Intel Xeon' },
  { prefix: 'm7i.', name: 'General Purpose - Intel 7th Gen (m7i)', category: 'general', arch: 'Intel Xeon' },
  { prefix: 'm7i-flex.', name: 'General Purpose - Intel Flex (m7i-flex)', category: 'general', arch: 'Intel Xeon' },
  { prefix: 'm7g.', name: 'General Purpose - Graviton3 ARM (m7g)', category: 'general', arch: 'AWS Graviton3' },
  { prefix: 'm5.', name: 'General Purpose - Enterprise Classic (m5)', category: 'general', arch: 'Intel Xeon' },
  { prefix: 'm5a.', name: 'General Purpose - AMD Classic (m5a)', category: 'general', arch: 'AMD EPYC' },

  // Compute Optimized
  { prefix: 'c6a.', name: 'Compute Optimized - AMD EPYC (c6a)', category: 'compute', arch: 'AMD EPYC' },
  { prefix: 'c7a.', name: 'Compute Optimized - AMD Genoa 4th Gen (c7a)', category: 'compute', arch: 'AMD Genoa' },
  { prefix: 'c6i.', name: 'Compute Optimized - Intel 6th Gen (c6i)', category: 'compute', arch: 'Intel Xeon' },
  { prefix: 'c7i.', name: 'Compute Optimized - Intel 7th Gen (c7i)', category: 'compute', arch: 'Intel Xeon' },
  { prefix: 'c7g.', name: 'Compute Optimized - Graviton3 ARM (c7g)', category: 'compute', arch: 'AWS Graviton3' },
  { prefix: 'c5.', name: 'Compute Optimized - Enterprise Classic (c5)', category: 'compute', arch: 'Intel Xeon' },
  { prefix: 'c5a.', name: 'Compute Optimized - AMD Classic (c5a)', category: 'compute', arch: 'AMD EPYC' },

  // Memory Optimized
  { prefix: 'r6a.', name: 'Memory Optimized - AMD EPYC (r6a)', category: 'memory', arch: 'AMD EPYC' },
  { prefix: 'r7a.', name: 'Memory Optimized - AMD Genoa 4th Gen (r7a)', category: 'memory', arch: 'AMD Genoa' },
  { prefix: 'r6i.', name: 'Memory Optimized - Intel 6th Gen (r6i)', category: 'memory', arch: 'Intel Xeon' },
  { prefix: 'r7i.', name: 'Memory Optimized - Intel 7th Gen (r7i)', category: 'memory', arch: 'Intel Xeon' },
  { prefix: 'r7g.', name: 'Memory Optimized - Graviton3 ARM (r7g)', category: 'memory', arch: 'AWS Graviton3' },
  { prefix: 'r5.', name: 'Memory Optimized - Enterprise Classic (r5)', category: 'memory', arch: 'Intel Xeon' },
  { prefix: 'r5a.', name: 'Memory Optimized - AMD Classic (r5a)', category: 'memory', arch: 'AMD EPYC' },

  // Storage Optimized
  { prefix: 'i4i.', name: 'Storage Optimized NVMe SSD (i4i)', category: 'storage', arch: 'Intel Xeon + NVMe' },

  // GPU & Accelerated
  { prefix: 'g4dn.', name: 'GPU Accelerated - NVIDIA T4 (g4dn)', category: 'gpu', arch: 'NVIDIA T4' },
  { prefix: 'g5.', name: 'GPU Accelerated - NVIDIA A10G (g5)', category: 'gpu', arch: 'NVIDIA A10G' }
];

const CATEGORIES = [
  { id: 'all', label: 'All Families' },
  { id: 'general', label: 'General (m/t)' },
  { id: 'compute', label: 'Compute (c)' },
  { id: 'memory', label: 'Memory (r)' },
  { id: 'storage', label: 'Storage (i)' },
  { id: 'gpu', label: 'GPU / AI (g)' }
];

function getFamilyInfo(instanceType) {
  for (const fam of FAMILY_METADATA) {
    if (instanceType.startsWith(fam.prefix)) {
      return fam;
    }
  }
  return {
    prefix: instanceType.split('.')[0] + '.',
    name: `${instanceType.split('.')[0].toUpperCase()} Family`,
    category: 'general',
    arch: 'x86_64'
  };
}

export default function InstanceSelector({
  label = 'Instance Family & Type',
  value = 't3.medium',
  onChange,
  region = 'us-east-1'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Current selected details
  const hasSelected = Boolean(value && ec2Pricing.instances[value]);
  const currentInstance = hasSelected ? ec2Pricing.instances[value] : null;
  const currentRegionalRate = hasSelected
    ? (ec2Pricing.regional_rates?.[region]?.[value]?.onDemand ?? currentInstance.onDemand)
    : 0;
  const currentFamilyInfo = hasSelected ? getFamilyInfo(value) : null;

  // Build searchable index of all instances
  const allInstancesList = useMemo(() => {
    const list = [];
    const entries = Object.entries(ec2Pricing.instances);

    for (const [type, info] of entries) {
      const fam = getFamilyInfo(type);
      const regRate = ec2Pricing.regional_rates?.[region]?.[type]?.onDemand ?? info.onDemand;
      list.push({
        type,
        vcpu: info.vcpu || 2,
        memory: info.memory || 4,
        hourlyRate: regRate,
        monthlyRate: Math.round(regRate * 730 * 100) / 100,
        family: fam.name,
        category: fam.category,
        arch: fam.arch,
        searchStr: `${type} ${fam.name} ${fam.arch} ${fam.category} ${info.vcpu}vcpu ${info.vcpu} vcpu ${info.memory}gb ${info.memory} gb`.toLowerCase()
      });
    }

    return list;
  }, [region]);

  // Filter instances by category and search
  const filteredInstances = useMemo(() => {
    let result = allInstancesList;

    if (activeCategory !== 'all') {
      result = result.filter(item => item.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(item => item.searchStr.includes(q));
    }

    return result;
  }, [allInstancesList, activeCategory, search]);

  // Group filtered instances by family name
  const groupedInstances = useMemo(() => {
    const groups = {};
    for (const item of filteredInstances) {
      if (!groups[item.family]) {
        groups[item.family] = [];
      }
      groups[item.family].push(item);
    }
    return groups;
  }, [filteredInstances]);

  const selectInstance = (type) => {
    if (onChange) onChange(type);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative mb-3" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          {label}
        </label>
      )}

      {/* Clean Single-line Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[38px] px-3 bg-slate-900 border rounded-lg text-left flex items-center justify-between gap-2.5 transition-all outline-none cursor-pointer ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-700 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Cpu size={15} className={hasSelected ? 'text-blue-400 shrink-0' : 'text-slate-500 shrink-0'} />
          <span className={`text-xs font-mono truncate ${hasSelected ? 'text-white font-bold' : 'text-slate-400 font-normal'}`}>
            {hasSelected ? value : 'Select Instance Type...'}
          </span>
        </div>

        <ChevronDown
          size={15}
          className={`text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-blue-400' : ''}`}
        />
      </button>

      {/* Helper Caption - ONLY PRINTED AFTER SELECTING INSTANCE */}
      {hasSelected && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1">
          <span className="truncate pr-2">
            {currentFamilyInfo?.name} ({currentInstance?.vcpu} vCPU, {currentInstance?.memory} GB RAM)
          </span>
          <span className="font-mono text-emerald-400 font-semibold shrink-0">
            ${currentRegionalRate.toFixed(4)}/hr
          </span>
        </div>
      )}

      {/* Searchable Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-[min(540px,calc(100vw-2rem))] min-w-full bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[480px]">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-950/80 space-y-2">
            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by instance (e.g. m6a, 8xlarge), vCPU, RAM, or GPU..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 px-0.5">
              <span>Region: <strong className="text-white">{region}</strong></span>
              <span>{filteredInstances.length} instances available</span>
            </div>
          </div>

          {/* Instances List */}
          <div className="overflow-y-auto custom-scrollbar divide-y divide-slate-800/60 p-1.5 flex-1">
            {Object.keys(groupedInstances).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <p>No instances match "{search}"</p>
                <button
                  type="button"
                  onClick={() => { setSearch(''); setActiveCategory('all'); }}
                  className="mt-2 text-blue-400 hover:underline text-[11px]"
                >
                  Clear search and show all instances
                </button>
              </div>
            ) : (
              Object.entries(groupedInstances).map(([familyGroup, items]) => (
                <div key={familyGroup} className="py-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60 rounded flex items-center justify-between border-b border-slate-800/40">
                    <span>{familyGroup}</span>
                    <span className="text-slate-500 lowercase font-mono">{items.length} types</span>
                  </div>

                  <div className="space-y-1 mt-1">
                    {items.map(item => {
                      const isSelected = item.type === value;
                      return (
                        <div
                          key={item.type}
                          onClick={() => selectInstance(item.type)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs gap-3 ${
                            isSelected
                              ? 'bg-blue-600/20 text-white border border-blue-500/40 ring-1 ring-blue-500/30'
                              : 'hover:bg-slate-800/70 text-slate-200'
                          }`}
                        >
                          {/* Left: Radio + Instance Type + Specs */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {isSelected ? (
                              <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                                <Check size={11} strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                            )}

                            <span className={`font-mono font-bold text-xs whitespace-nowrap shrink-0 ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                              {item.type}
                            </span>

                            <span className="text-[10px] text-slate-300 bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded font-mono whitespace-nowrap shrink-0">
                              {item.vcpu} vCPU • {item.memory} GB RAM
                            </span>
                          </div>

                          {/* Right: Hourly & Monthly Pricing */}
                          <div className="text-right shrink-0 whitespace-nowrap pl-2">
                            <div className="font-mono font-bold text-emerald-400 text-xs">
                              ${item.hourlyRate.toFixed(4)}<span className="text-[10px] text-emerald-400/80 font-normal">/hr</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ~${item.monthlyRate.toFixed(2)}/mo
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
