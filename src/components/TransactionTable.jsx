import { format } from 'date-fns';
import { ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { CURRENCY_SYMBOLS } from '../data/transactions';

const CARD_INITIALS = {
  Visa: 'VI',
  Mastercard: 'MC',
  Amex: 'AX',
  Discover: 'DI',
};

const CARD_COLORS = {
  Visa: 'bg-blue-600',
  Mastercard: 'bg-red-500',
  Amex: 'bg-indigo-800',
  Discover: 'bg-orange-500',
};

function SortIcon({ column, sortConfig }) {
  if (sortConfig.key !== column) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
  return sortConfig.dir === 'asc'
    ? <ArrowUp className="w-3.5 h-3.5 text-indigo-500" />
    : <ArrowDown className="w-3.5 h-3.5 text-indigo-500" />;
}

export default function TransactionTable({ transactions, onSelect, sortConfig, onSort }) {
  const cols = [
    { key: 'id', label: 'Transaction ID', sortable: false },
    { key: 'createdAt', label: 'Date', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'currency', label: 'Currency', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'merchant', label: 'Merchant', sortable: true },
    { key: 'actions', label: '', sortable: false },
  ];

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <SlidersHorizontal className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">No transactions found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your date range or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {cols.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort(col.key)}
                  className={`px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer hover:text-slate-700 select-none' : ''
                  } ${col.key === 'actions' ? 'w-[80px]' : ''}`}
                >
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIcon column={col.key} sortConfig={sortConfig} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((txn) => {
              const sym = CURRENCY_SYMBOLS[txn.currency] || '';
              return (
                <tr
                  key={txn.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Transaction ID */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${CARD_COLORS[txn.cardBrand] || 'bg-slate-500'}`}>
                        {CARD_INITIALS[txn.cardBrand] || 'CC'}
                      </div>
                      <div>
                        <p className="text-xs font-mono font-medium text-slate-800">{txn.id}</p>
                        <p className="text-[11px] text-slate-400">•••• {txn.cardLast4}</p>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-700">{format(txn.createdAt, 'MMM d, yyyy')}</p>
                    <p className="text-xs text-slate-400">{format(txn.createdAt, 'h:mm a')}</p>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-slate-900 tabular-nums">
                      {sym}{txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </td>

                  {/* Currency */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                      {txn.currency}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={txn.status} />
                  </td>

                  {/* Merchant */}
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700 font-medium">{txn.merchant}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{txn.email}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <button
                      onClick={() => onSelect(txn)}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 hover:border-indigo-200 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 whitespace-nowrap"
                    >
                      Details →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
