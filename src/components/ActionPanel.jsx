import { useState } from 'react';
import { X, CheckCircle, XCircle, RotateCcw, ArrowLeftRight, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';
import { CURRENCY_SYMBOLS } from '../data/transactions';

const ACTIONS = {
  Capture: {
    icon: CheckCircle,
    label: 'Capture',
    description: 'Capture the authorized funds',
    color: 'bg-emerald-600 hover:bg-emerald-700',
    allowedStatuses: ['Authorized'],
  },
  Void: {
    icon: XCircle,
    label: 'Void',
    description: 'Cancel the authorization before capture',
    color: 'bg-slate-600 hover:bg-slate-700',
    allowedStatuses: ['Authorized'],
  },
  Refund: {
    icon: RotateCcw,
    label: 'Refund',
    description: 'Return funds to the cardholder',
    color: 'bg-amber-600 hover:bg-amber-700',
    allowedStatuses: ['Captured'],
  },
  Return: {
    icon: ArrowLeftRight,
    label: 'Return',
    description: 'Process a merchandise return',
    color: 'bg-blue-600 hover:bg-blue-700',
    allowedStatuses: ['Captured', 'Refunded'],
  },
};

const CARD_BRAND_COLORS = {
  Visa: 'bg-blue-600',
  Mastercard: 'bg-red-600',
  Amex: 'bg-blue-800',
  Discover: 'bg-orange-500',
};

export default function ActionPanel({ transaction, onClose, onAction }) {
  const [loading, setLoading] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [result, setResult] = useState(null);

  if (!transaction) return null;

  const sym = CURRENCY_SYMBOLS[transaction.currency] || '';

  async function handleAction(action) {
    setConfirmed(action);
  }

  async function confirmAction() {
    setLoading(confirmed);
    await new Promise((r) => setTimeout(r, 1200));
    setResult({ action: confirmed, success: true });
    setLoading(null);
    onAction(transaction.id, confirmed);
  }

  if (result) {
    const actionDef = ACTIONS[result.action];
    const Icon = actionDef.icon;
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end pointer-events-none">
        <div className="pointer-events-auto w-full sm:w-[440px] h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mr-0 sm:mr-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Payment Action</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <Icon className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Action Successful</h3>
            <p className="text-sm text-slate-500 mb-6">
              <span className="font-medium text-slate-700">{result.action}</span> was applied to{' '}
              <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                {transaction.id}
              </span>
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (confirmed) {
    const actionDef = ACTIONS[confirmed];
    const Icon = actionDef.icon;
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end pointer-events-none">
        <div className="pointer-events-auto w-full sm:w-[440px] h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mr-0 sm:mr-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Confirm Action</h2>
            <button onClick={() => setConfirmed(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Confirm {confirmed}</h3>
            <p className="text-sm text-slate-500 mb-1">
              You are about to <strong>{confirmed.toLowerCase()}</strong> this transaction:
            </p>
            <p className="text-2xl font-bold text-slate-900 mb-1">
              {sym}{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 font-mono mb-8">{transaction.id}</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmed(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={!!loading}
                className={`flex-1 py-2.5 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${actionDef.color}`}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                ) : (
                  <><Icon className="w-4 h-4" /> {confirmed}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end pointer-events-none">
      {/* Backdrop */}
      <div
        className="pointer-events-auto absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] sm:block hidden"
        onClick={onClose}
      />

      <div className="pointer-events-auto relative w-full sm:w-[440px] h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mr-0 sm:mr-6 sm:my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Transaction Details</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{transaction.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Amount Card */}
          <div className="mx-6 mt-5 p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white">
            <p className="text-xs text-slate-400 mb-1">Total Amount</p>
            <p className="text-3xl font-bold tracking-tight">
              {sym}{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-sm font-normal text-slate-400 ml-2">{transaction.currency}</span>
            </p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-5 rounded ${CARD_BRAND_COLORS[transaction.cardBrand] || 'bg-slate-600'} flex items-center justify-center`}>
                  <span className="text-white text-[8px] font-bold">{transaction.cardBrand?.[0]}</span>
                </div>
                <span className="text-sm text-slate-300">•••• {transaction.cardLast4}</span>
              </div>
              <StatusBadge status={transaction.status} />
            </div>
          </div>

          {/* Details */}
          <div className="px-6 mt-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</h3>
            <div className="bg-slate-50 rounded-xl divide-y divide-slate-100">
              {[
                { label: 'Merchant', value: transaction.merchant },
                { label: 'Description', value: transaction.description },
                { label: 'Customer', value: transaction.email },
                { label: 'Date', value: format(transaction.createdAt, 'MMM d, yyyy · h:mm a') },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs font-medium text-slate-800 text-right max-w-[60%] truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Actions */}
          <div className="px-6 mt-5 mb-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ACTIONS).map(([key, action]) => {
                const Icon = action.icon;
                const allowed = action.allowedStatuses.includes(transaction.status);
                return (
                  <button
                    key={key}
                    onClick={() => allowed && handleAction(key)}
                    disabled={!allowed}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                      allowed
                        ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm cursor-pointer'
                        : 'bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      allowed ? 'bg-indigo-50' : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${allowed ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-sm font-medium text-slate-800">{action.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
