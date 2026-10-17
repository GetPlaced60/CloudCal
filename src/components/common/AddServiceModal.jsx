import React, { useState } from 'react';
import { X, Search, Plus, Minus } from 'lucide-react';
import { useCalculator } from '../../context/CalculatorContext';
import { ALL_SERVICES } from '../../data/services';

export default function AddServiceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { config, setServiceEnabled } = useCalculator();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = ALL_SERVICES.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white">
              Add or Remove AWS Services
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Select only the services needed for your architecture</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800 bg-slate-900">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search services (e.g., EC2, S3, Route 53, NAT, Load Balancer)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Services List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredServices.map(svc => {
            const isEnabled = !!config[svc.key]?.enabled;
            const Icon = svc.icon;

            return (
              <div
                key={svc.key}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isEnabled
                    ? 'border-blue-500/40 bg-blue-950/20'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{svc.name}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                        {svc.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{svc.subtitle}</p>
                  </div>
                </div>

                <div>
                  {isEnabled ? (
                    <button
                      onClick={() => setServiceEnabled(svc.key, false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 transition-colors"
                    >
                      <Minus size={14} /> Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => setServiceEnabled(svc.key, true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow"
                    >
                      <Plus size={14} /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {ALL_SERVICES.filter(s => config[s.key]?.enabled).length} of {ALL_SERVICES.length} services currently active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
