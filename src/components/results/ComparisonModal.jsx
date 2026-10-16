import React from 'react';
import { X, TrendingDown, Check } from 'lucide-react';
import { useCalculator } from '../../context/CalculatorContext';
import { calculateEC2Cost } from '../../calculators/ec2Calculator';
import { formatCurrency } from '../../utils/formatCurrency';

export default function ComparisonModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { config } = useCalculator();

  const models = [
    { key: 'onDemand', label: 'On-Demand', term: 'No Commitment', upfront: '$0' },
    { key: 'ri1yrNoUpfront', label: '1-Year RI (No Upfront)', term: '1 Year', upfront: '$0' },
    { key: 'ri1yrPartial', label: '1-Year RI (Partial)', term: '1 Year', upfront: 'Partial' },
    { key: 'ri1yrAllUpfront', label: '1-Year RI (All Upfront)', term: '1 Year', upfront: 'Full' },
    { key: 'ri3yrNoUpfront', label: '3-Year RI (No Upfront)', term: '3 Year', upfront: '$0' },
    { key: 'ri3yrPartial', label: '3-Year RI (Partial)', term: '3 Year', upfront: 'Partial' },
    { key: 'ri3yrAllUpfront', label: '3-Year RI (All Upfront)', term: '3 Year', upfront: 'Full' },
    { key: 'spot', label: 'Spot Instances', term: 'Flexible', upfront: '$0' }
  ];

  const tiers = [
    { name: 'Web Tier', config: config.ec2Web },
    { name: 'App Tier', config: config.ec2App },
    { name: 'DB Tier', config: config.ec2Db }
  ];

  // Calculate costs across all tiers for each model
  const modelComparisons = models.map(m => {
    let monthlyTotal = 0;
    const tierCosts = {};

    tiers.forEach(t => {
      if (t.config && t.config.enabled) {
        const cost = calculateEC2Cost({ ...t.config, pricingModel: m.key });
        tierCosts[t.name] = cost.total;
        monthlyTotal += cost.total;
      }
    });

    return {
      ...m,
      monthlyTotal,
      annualTotal: monthlyTotal * 12,
      threeYearTotal: monthlyTotal * 36,
      tierCosts
    };
  });

  const onDemandBaseline = modelComparisons.find(m => m.key === 'onDemand')?.monthlyTotal || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h2 className="text-base font-bold text-white">EC2 Pricing Models: Side-by-Side Comparison</h2>
              <p className="text-xs text-slate-400">See exactly how much you save across On-Demand, 1-Year RI, 3-Year RI, and Spot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-4 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                <th className="py-2.5 px-3">Pricing Model</th>
                <th className="py-2.5 px-3">Commitment</th>
                <th className="py-2.5 px-3">Monthly Cost</th>
                <th className="py-2.5 px-3">Annual Cost</th>
                <th className="py-2.5 px-3">3-Year Cost</th>
                <th className="py-2.5 px-3">Savings vs On-Demand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {modelComparisons.map((m) => {
                const savingsPct = Math.max(0, Math.round((1 - m.monthlyTotal / onDemandBaseline) * 100));
                const monthlySavings = Math.max(0, onDemandBaseline - m.monthlyTotal);

                return (
                  <tr key={m.key} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-white">
                      <div className="flex items-center gap-1.5">
                        {m.key === 'onDemand' ? '💳' : m.key.includes('3yr') ? '📆' : m.key.includes('1yr') ? '📅' : '⚡'}
                        <span>{m.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{m.term}</td>
                    <td className="py-3 px-3 font-bold text-white">{formatCurrency(m.monthlyTotal)}</td>
                    <td className="py-3 px-3 text-slate-300">{formatCurrency(m.annualTotal)}</td>
                    <td className="py-3 px-3 text-slate-300">{formatCurrency(m.threeYearTotal)}</td>
                    <td className="py-3 px-3">
                      {savingsPct > 0 ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full w-fit">
                          <TrendingDown size={12} />
                          <span>Save {savingsPct}% ({formatCurrency(monthlySavings)}/mo)</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Baseline (0%)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Tier-by-Tier breakdown */}
          <div className="mt-6 border-t border-slate-800 pt-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              💡 Current EC2 Tiers Included in this Comparison
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {tiers.map(t => (
                <div key={t.name} className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <span className="text-white font-semibold block">{t.name}</span>
                  <span className="text-slate-400">{t.config?.count || 1}x {t.config?.instanceType || 't3.medium'}</span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">{t.config?.ebsVolumeSize || 30} GB {t.config?.ebsVolumeType || 'gp3'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
