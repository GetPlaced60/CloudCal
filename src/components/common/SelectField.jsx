import React from 'react';

export default function SelectField({ label, value, onChange, options = [], helpText, className = '' }) {
  return (
    <div className={`mb-3 ${className}`}>
      <label className="block text-xs font-semibold text-slate-300 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none cursor-pointer"
      >
        {options.map((opt, idx) => {
          if (opt.options && Array.isArray(opt.options)) {
            return (
              <optgroup key={opt.label || idx} label={opt.label} className="bg-slate-800 text-blue-400 font-semibold">
                {opt.options.map((subOpt) => (
                  <option key={subOpt.value} value={subOpt.value} className="bg-slate-900 text-white font-normal">
                    {subOpt.label}
                  </option>
                ))}
              </optgroup>
            );
          }
          return (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
              {opt.label}
            </option>
          );
        })}
      </select>
      {helpText && <p className="text-[11px] text-slate-500 mt-1">{helpText}</p>}
    </div>
  );
}
