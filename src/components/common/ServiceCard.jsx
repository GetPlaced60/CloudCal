import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export default function ServiceCard({ title, icon, enabled, onToggle, cost, children, color = 'blue' }) {
  const [expanded, setExpanded] = useState(true);

  const colorMap = {
    blue: 'border-blue-500/40 bg-gradient-to-br from-blue-950/30 via-slate-900 to-slate-900',
    green: 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900',
    purple: 'border-purple-500/40 bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-900',
    orange: 'border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900',
    cyan: 'border-cyan-500/40 bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-900',
    pink: 'border-pink-500/40 bg-gradient-to-br from-pink-950/30 via-slate-900 to-slate-900',
    indigo: 'border-indigo-500/40 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-900',
    teal: 'border-teal-500/40 bg-gradient-to-br from-teal-950/30 via-slate-900 to-slate-900',
    red: 'border-rose-500/40 bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900'
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${enabled ? (colorMap[color] || colorMap.blue) : 'border-slate-800 bg-slate-900/40 opacity-60'}`}>
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-slate-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={onToggle}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
          <span className="text-xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-white text-sm md:text-base">{title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {enabled ? (
            <span className="text-sm font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-md">
              {formatCurrency(cost)}<span className="text-[11px] font-normal text-emerald-300/80">/mo</span>
            </span>
          ) : (
            <span className="text-xs text-slate-500 italic">Disabled</span>
          )}
          {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </div>
      {expanded && enabled && (
        <div className="px-4 pb-4 pt-3 border-t border-slate-800/80 bg-slate-950/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
