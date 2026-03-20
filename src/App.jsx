import { useState, useMemo } from 'react';
import { startOfDay, startOfToday, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import {
  CreditCard,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { transactions as initialTxns } from './data/transactions';
import DateFilter from './components/DateFilter';
import TransactionTable from './components/TransactionTable';
import ActionPanel from './components/ActionPanel';
import StatsCard from './components/StatsCard';

const PAGE_SIZE = 8;
const STATUS_FILTERS = ['All', 'Authorized', 'Captured', 'Voided', 'Refunded'];

function getDateRange(preset, custom) {
  const now = new Date();
  if (preset === 'today') return { from: startOfToday(), to: now };
  if (preset === '7d') return { from: subDays(now, 7), to: now };
  if (preset === '30d') return { from: subDays(now, 30), to: now };
  if (preset === 'custom' && custom.from && custom.to) {
    return {
      from: startOfDay(parseISO(custom.from)),
      to: startOfDay(parseISO(custom.to)),
    };
  }
  return { from: subDays(now, 30), to: now };
}

export default function App() {
  const [txns, setTxns] = useState(initialTxns);
  const [datePreset, setDatePreset] = useState('30d');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', dir: 'desc' });
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);

  const { from, to } = getDateRange(datePreset, customRange);

  const filtered = useMemo(() => {
    let list = txns.filter((t) => {
      const inRange = isAfter(t.createdAt, from) && isBefore(t.createdAt, to);
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.merchant.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q);
      return inRange && matchStatus && matchSearch;
    });

    list = [...list].sort((a, b) => {
      let av = a[sortConfig.key];
      let bv = b[sortConfig.key];
      if (av instanceof Date) av = av.getTime();
      if (bv instanceof Date) bv = bv.getTime();
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortConfig.dir === 'asc' ? -1 : 1;
      if (av > bv) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [txns, from, to, statusFilter, search, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(key) {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' }
    );
    setPage(1);
  }

  function handleAction(txnId, action) {
    const statusMap = { Capture: 'Captured', Void: 'Voided', Refund: 'Refunded', Return: 'Refunded' };
    const newStatus = statusMap[action];
    setTxns((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: newStatus || t.status } : t))
    );
    setSelected((prev) =>
      prev && prev.id === txnId ? { ...prev, status: newStatus || prev.status } : prev
    );
  }

  const stats = useMemo(() => {
    const captured = filtered.filter((t) => t.status === 'Captured');
    const totalVol = captured.reduce((s, t) => s + t.amount, 0);
    return {
      total: filtered.length,
      captured: captured.length,
      refunded: filtered.filter((t) => t.status === 'Refunded').length,
      volume: totalVol,
    };
  }, [filtered]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">PayGate</span>
            <span className="text-xs text-slate-400 font-medium border-l border-slate-200 pl-3 ml-1">
              Transactions
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-700">OP</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Transaction Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor, filter, and act on all payment transactions
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            label="Total Transactions"
            value={stats.total.toLocaleString()}
            sub="In selected period"
            icon={CreditCard}
            color="bg-indigo-500"
          />
          <StatsCard
            label="Captured"
            value={stats.captured.toLocaleString()}
            sub={`${stats.total ? Math.round((stats.captured / stats.total) * 100) : 0}% of total`}
            icon={CheckCircle}
            color="bg-emerald-500"
            trend="+8.2% vs prior period"
          />
          <StatsCard
            label="Total Volume"
            value={`$${stats.volume.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
            sub="USD equivalent"
            icon={TrendingUp}
            color="bg-violet-500"
            trend="+12.5% vs prior period"
          />
          <StatsCard
            label="Refunded"
            value={stats.refunded.toLocaleString()}
            sub="Requires review"
            icon={RefreshCw}
            color="bg-amber-500"
          />
        </div>

        {/* Filters bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ID, merchant, email…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      statusFilter === s
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <DateFilter
                selected={datePreset}
                onSelect={(v) => {
                  setDatePreset(v);
                  setPage(1);
                }}
                customRange={customRange}
                onCustomRange={setCustomRange}
              />
            </div>
          </div>
        </div>

        {/* Results meta */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{filtered.length}</span> transactions
            {search && (
              <>
                {' '}matching "
                <span className="font-medium text-indigo-600">{search}</span>"
              </>
            )}
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              Sorted by {sortConfig.key === 'createdAt' ? 'date' : sortConfig.key} (
              {sortConfig.dir})
            </span>
          </div>
        </div>

        {/* Table */}
        <TransactionTable
          transactions={paginated}
          onSelect={setSelected}
          sortConfig={sortConfig}
          onSort={handleSort}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Page <span className="font-medium text-slate-700">{page}</span> of{' '}
              <span className="font-medium text-slate-700">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    n === page
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Side panel */}
      {selected && (
        <ActionPanel
          transaction={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
