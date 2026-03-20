import { TrendingUp } from 'lucide-react';

export default function StatsCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <p className="text-xs text-emerald-600 font-medium">{trend}</p>
        </div>
      )}
    </div>
  );
}
