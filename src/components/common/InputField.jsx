import React from 'react';

export default function InputField({ label, value, onChange, type = 'number', min = 0, max, step = 1, unit, helpText, className = '' }) {
  return (
    <div className={`mb-3 ${className}`}>
      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
        <span>{label}</span>
        {unit && <span className="text-slate-500 font-normal">({unit})</span>}
      </label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? 0 : parseFloat(e.target.value) || 0) : e.target.value)}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
      />
      {helpText && <p className="text-[11px] text-slate-500 mt-1">{helpText}</p>}
    </div>
  );
}
