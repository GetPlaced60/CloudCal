import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-2xl">
        <p className="text-xs font-semibold text-slate-300">{data.name || data.payload?.name}</p>
        <p className="text-sm font-bold text-emerald-400">{formatCurrency(data.value)}</p>
      </div>
    );
  }
  return null;
};

export default function CostChart({ data = [] }) {
  const [chartType, setChartType] = useState('pie');

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
          <span>📊</span> Cost Distribution
        </h3>
        <div className="flex gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
          <button
            onClick={() => setChartType('pie')}
            className={`px-2.5 py-1 text-xs rounded-md transition-all font-medium ${chartType === 'pie' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Donut
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-1 text-xs rounded-md transition-all font-medium ${chartType === 'bar' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Bar
          </button>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          ) : (
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={85} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-2 mt-3 justify-center max-h-24 overflow-y-auto">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-800">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
            <span>{item.name}:</span>
            <span className="font-semibold text-slate-200">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
