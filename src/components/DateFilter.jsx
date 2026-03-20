import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

const PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Custom range', value: 'custom' },
];

export default function DateFilter({ selected, onSelect, customRange, onCustomRange }) {
  const [open, setOpen] = useState(false);
  const [localFrom, setLocalFrom] = useState(customRange.from || '');
  const [localTo, setLocalTo] = useState(customRange.to || '');

  const currentPreset = PRESETS.find((p) => p.value === selected);

  function applyCustom() {
    if (localFrom && localTo) {
      onCustomRange({ from: localFrom, to: localTo });
      onSelect('custom');
      setOpen(false);
    }
  }

  function handlePreset(value) {
    if (value !== 'custom') {
      onSelect(value);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
      >
        <Calendar className="w-4 h-4 text-slate-500" />
        {selected === 'custom' && customRange.from && customRange.to
          ? `${format(new Date(customRange.from), 'MMM d')} – ${format(new Date(customRange.to), 'MMM d, yyyy')}`
          : currentPreset?.label}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-1">
            {PRESETS.filter((p) => p.value !== 'custom').map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePreset(preset.value)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selected === preset.value
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 p-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Custom Range</p>
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">From</label>
                <input
                  type="date"
                  value={localFrom}
                  onChange={(e) => setLocalFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">To</label>
                <input
                  type="date"
                  value={localTo}
                  onChange={(e) => setLocalTo(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={applyCustom}
              disabled={!localFrom || !localTo}
              className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
