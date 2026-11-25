import SmartFinancialInsights from '@/components/dashboard/SmartFinancialInsights';  
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
  Activity,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  CalendarClock,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Card, { CardHeader } from '@/components/common/Card';
import EmptyState from '@/components/feedback/EmptyState';
import PageHeader from '@/components/common/PageHeader';

import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/services/dashboardService';
import { purchaseService } from '@/services/purchaseService';

import { formatCurrency, formatDate } from '@/utils/formatters';
import { getBreakdownTotal, getMaxMonthlyValue } from '@/utils/dashboardCharts';


// ==========================================
// STAT CARD
// ==========================================

function StatCard({ label, value, caption, icon: Icon, tone = 'brand' }) {

  const tones = {
    brand: 'bg-brand-500/10 text-brand-300',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
  };

  return (
    <Card className="dashboard-stat-card group min-w-0 transition-all duration-300">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="text-sm text-content-muted">{label}</p>

          <p className="mt-3 break-words text-2xl font-bold tracking-tight sm:text-3xl">
            {value}
          </p>

          <p className="mt-2 text-xs text-content-subtle">
            {caption}
          </p>

        </div>

        <span className={`dashboard-stat-icon grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={20} />
        </span>

      </div>

    </Card>
  );
}


// ==========================================
// CASH FLOW CHART
// ==========================================

function MonthlyChart({ items, currency }) {

  const maxValue = getMaxMonthlyValue(items);

  const hasActivity = items.some(
    (item) => item.income > 0 || item.expense > 0
  );

  if (!items.length || !hasActivity) {

    return (

      <div className="flex min-h-56 flex-col items-center justify-center text-center">

        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-400">
          <TrendingUp size={25} />
        </div>

        <p className="font-semibold">No cash flow data yet</p>

        <p className="mt-2 max-w-xs text-sm text-content-muted">
          Add income or expenses to see your monthly financial trends here.
        </p>

      </div>

    );
  }

  return (

    <div className="space-y-5">

      <div className="flex flex-wrap gap-5 text-xs text-content-muted">

        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-sm bg-brand-400" />
          Income
        </span>

        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-sm bg-danger" />
          Expenses
        </span>

      </div>


      <div className="grid grid-cols-6 gap-2 sm:gap-4">

        {items.map((item) => {

          const incomeHeight = item.income > 0
            ? Math.max(5, (item.income / maxValue) * 100)
            : 0;

          const expenseHeight = item.expense > 0
            ? Math.max(5, (item.expense / maxValue) * 100)
            : 0;

          return (

            <div key={item.key} className="min-w-0">

              <div className="flex h-44 items-end justify-center gap-1 border-b border-line pb-2 sm:h-52 sm:gap-2">

                <div className="group/bar relative flex h-full w-1/2 items-end justify-center">

                  {item.income > 0 && (

                    <div
                      title={`Income: ${formatCurrency(item.income, currency)}`}
                      className="dashboard-chart-bar dashboard-chart-income w-full max-w-7 cursor-pointer rounded-t-md transition-all duration-300 hover:brightness-125"
                      style={{ height: `${incomeHeight}%` }}
                    />

                  )}

                </div>


                <div className="group/bar relative flex h-full w-1/2 items-end justify-center">

                  {item.expense > 0 && (

                    <div
                      title={`Expenses: ${formatCurrency(item.expense, currency)}`}
                      className="dashboard-chart-bar dashboard-chart-expense w-full max-w-7 cursor-pointer rounded-t-md transition-all duration-300 hover:brightness-125"
                      style={{ height: `${expenseHeight}%` }}
                    />

                  )}

                </div>

              </div>

              <p className="mt-3 truncate text-center text-xs text-content-muted">
                {item.label}
              </p>

            </div>

          );

        })}

      </div>

      <p className="text-xs text-content-subtle">
        Last 6 calendar months · {currency}
      </p>

    </div>

  );
}


// ==========================================
// EXPENSE BREAKDOWN
// ==========================================

function ExpenseBreakdown({ items, currency }) {

  const total = getBreakdownTotal(items);

  if (!items.length || total <= 0) {

    return (
      <div className="py-10 text-center">
        <p className="text-sm text-content-muted">
          No expenses recorded this month yet.
        </p>
      </div>
    );

  }

  return (

    <div className="space-y-5">

      <div className="flex h-3 overflow-hidden rounded-full bg-surface-overlay">

        {items.map((item) => (

          <span
            key={item.categoryId}
            title={`${item.name}: ${item.percentage}%`}
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.color,
            }}
          />

        ))}

      </div>


      <div className="space-y-5">

        {items.map((item) => (

          <div key={item.categoryId} className="space-y-2">

            <div className="flex items-center justify-between gap-3 text-sm">

              <span className="flex min-w-0 items-center gap-2">

                <i
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <span className="truncate font-medium">
                  {item.name}
                </span>

              </span>

              <strong className="shrink-0">
                {formatCurrency(item.amount, currency)}
              </strong>

            </div>


            <div className="dashboard-expense-track h-2 overflow-hidden rounded-full bg-surface-overlay">

              <div
                className="dashboard-progress h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />

            </div>


            <p className="text-right text-xs text-content-subtle">
              {item.percentage.toFixed(1)}% of spending
            </p>

          </div>

        ))}

      </div>


      <div className="flex justify-between border-t border-line pt-4 text-sm">

        <span className="text-content-muted">Monthly total</span>

        <strong>{formatCurrency(total, currency)}</strong>

      </div>

    </div>

  );

}


// ==========================================
// RECENT TRANSACTIONS
// ==========================================

function RecentActivity({ items, currency }) {

  if (!items.length) {

    return (

      <EmptyState
        title="No transactions yet"
        description="Add your first income or expense to see your financial activity here."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button as={Link} to="/income">Add income</Button>
            <Button as={Link} to="/expenses" variant="secondary">
              Add expense
            </Button>
          </div>
        }
      />

    );

  }

  return (

    <div className="divide-y divide-line">

      {items.map((item) => {

        const isIncome = item.type === 'income';

        return (

          <div
            key={item._id}
            className="dashboard-activity-row group flex items-center gap-3 py-4 first:pt-0 last:pb-0"
          >

            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105 ${
              isIncome
                ? 'bg-brand-500/10 text-brand-300'
                : 'bg-danger/10 text-danger'
            }`}>

              {isIncome
                ? <ArrowDownRight size={20} />
                : <ArrowUpRight size={20} />}

            </span>


            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold">
                {item.description}
              </p>

              <p className="mt-1 truncate text-xs text-content-muted">
                {item.category?.name || 'Uncategorised'} · {formatDate(item.date)}
              </p>

            </div>


            <strong className={`shrink-0 text-sm ${
              isIncome ? 'text-brand-300' : 'text-danger'
            }`}>

              {isIncome ? '+' : '−'}
              {formatCurrency(item.amount, currency)}

            </strong>

          </div>

        );

      })}

    </div>

  );

}


// ==========================================
// MONTHLY SNAPSHOT
// ==========================================

function MonthlySnapshot({
  currentMonth,
  currency,
  loading,
  monthlyAverage,
}) {

  const income = Number(currentMonth?.income || 0);
  const expenses = Number(currentMonth?.expenses || 0);
  const net = Number(currentMonth?.net || 0);

  const savingsRate = income > 0
    ? (net / income) * 100
    : 0;

  const savingsProgress = Math.max(
    0,
    Math.min(100, savingsRate)
  );

  const cashFlowStatus =
    income === 0 && expenses === 0
      ? 'No activity yet'
      : net >= 0
        ? 'Positive cash flow'
        : 'Spending exceeds income';

  const expenseProgress = Math.min(
    100,
    expenses / Math.max(income, expenses, 1) * 100
  );

  return (

    <Card className="dashboard-panel">

      <CardHeader
        title="Monthly snapshot"
        description="A quick look at this month's activity."
        action={<CalendarDays size={18} className="text-brand-400" />}
      />


      <div className="space-y-5">


        {/* INCOME */}

        <div>

          <div className="flex justify-between gap-3 text-sm">

            <span className="text-content-muted">Income</span>

            <strong className="text-brand-300">
              {loading ? '—' : formatCurrency(income, currency)}
            </strong>

          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-overlay">

            <div
              className="h-full rounded-full bg-brand-400 transition-all duration-500"
              style={{ width: income > 0 ? '100%' : '0%' }}
            />

          </div>

        </div>


        {/* EXPENSES */}

        <div>

          <div className="flex justify-between gap-3 text-sm">

            <span className="text-content-muted">Expenses</span>

            <strong className="text-danger">
              {loading ? '—' : formatCurrency(expenses, currency)}
            </strong>

          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-overlay">

            <div
              className="h-full rounded-full bg-danger transition-all duration-500"
              style={{ width: `${expenseProgress}%` }}
            />

          </div>

        </div>


        {/* NET CASH FLOW */}

        <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">

          <p className="text-xs text-content-muted">
            Monthly savings / net
          </p>

          <p className={`mt-2 text-2xl font-bold ${
            net >= 0 ? 'text-brand-300' : 'text-danger'
          }`}>

            {loading ? '—' : formatCurrency(net, currency)}

          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-content-muted">

            <Activity size={14} />

            {loading ? 'Calculating...' : cashFlowStatus}

          </div>

        </div>


        {/* SAVINGS RATE */}

        <div>

          <div className="flex justify-between gap-3 text-sm">

            <span className="text-content-muted">
              Savings rate
            </span>

            <strong className="text-brand-300">
              {loading ? '—' : `${savingsRate.toFixed(1)}%`}
            </strong>

          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-overlay">

            <div
              className="h-full rounded-full bg-brand-400 transition-all duration-500"
              style={{ width: `${loading ? 0 : savingsProgress}%` }}
            />

          </div>

        </div>


        {/* MONTHLY AVERAGE */}

        <div className="rounded-xl border border-line bg-surface p-4">

          <p className="text-xs text-content-muted">
            Average monthly expenses · last 6 months
          </p>

          <p className="mt-2 text-xl font-semibold">
            {loading ? '—' : formatCurrency(monthlyAverage, currency)}
          </p>

        </div>


        {/* QUICK ACTIONS */}

        <div className="flex flex-wrap gap-2">

          <Button as={Link} to="/income" size="sm">
            <ArrowDownRight size={16} />
            Add income
          </Button>

          <Button as={Link} to="/expenses" size="sm" variant="secondary">
            <ArrowUpRight size={16} />
            Add expense
          </Button>

        </div>

      </div>

    </Card>

  );

}


// ==========================================
// FINANCIAL HEALTH
// ==========================================

function FinancialHealth({
  currentMonth,
  currency,
  loading,
  hasHistoricalActivity,
}) {
  const income = Number(currentMonth?.income || 0);
  const expenses = Number(currentMonth?.expenses || 0);
  const net = Number(currentMonth?.net || 0);

  let title = 'No financial activity yet';
  let description = 'Add your first transaction to start tracking your finances.';
  let tone = 'text-content-muted';
  let Icon = ShieldCheck;

  if (income === 0 && expenses === 0) {
    if (hasHistoricalActivity) {
      title = 'No activity this month';
      description =
        'You have recorded transactions in previous months. Add your income or expenses to track your current financial health.';
      tone = 'text-info';
      Icon = Activity;
    }
  } else if (net > 0) {
    title = 'Positive cash flow';
    description =
      `Your income is higher than your expenses by ${formatCurrency(net, currency)} this month. Keep it up!`;
    tone = 'text-success';
    Icon = TrendingUp;
  } else if (net < 0) {
    title = 'Review your spending';
    description =
      `Your expenses exceed your income by ${formatCurrency(Math.abs(net), currency)} this month. Consider reviewing your spending.`;
    tone = 'text-danger';
    Icon = TrendingDown;
  } else {
    title = 'Balanced cash flow';
    description =
      'Your income and expenses are currently equal this month.';
    tone = 'text-info';
    Icon = ShieldCheck;
  }

  return (
    <Card className="dashboard-panel border-brand-500/20 bg-gradient-to-br from-brand-500/5 to-transparent">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-start gap-3">

          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-400">
            <Icon size={21} />
          </span>

          <div>
            <p className={`font-semibold ${tone}`}>
              {loading ? 'Checking financial health...' : title}
            </p>

            <p className="mt-1 text-sm leading-relaxed text-content-muted">
              {loading
                ? 'Please wait while your financial data loads.'
                : description}
            </p>
          </div>

        </div>

        <Link
          to="/analytics"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-300"
        >
          View analytics
          <ChevronRight size={16} />
        </Link>

      </div>
    </Card>
  );
}


// ==========================================
// MAIN DASHBOARD
// ==========================================

export default function DashboardPage() {

  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [purchaseData, setPurchaseData] = useState({ items: [], totals: null });
  const [purchaseLoading, setPurchaseLoading] = useState(true);
  const [purchaseError, setPurchaseError] = useState('');

  const refresh = useCallback(
    () => setRefreshKey((value) => value + 1),
    []
  );


  // LOAD DASHBOARD DATA

  useEffect(() => {

    let active = true;

    setLoading(true);
    setError('');

    dashboardService.summary()

      .then((data) => {
        if (active) setSummary(data);
      })

      .catch((requestError) => {

        if (active) {
          setError(
            requestError.message || 'Could not load your dashboard.'
          );
        }

      })

      .finally(() => {

        if (active) setLoading(false);

      });

    return () => {
      active = false;
    };

  }, [refreshKey]);

  // LOAD PURCHASE PLANNER DATA INDEPENDENTLY
  // Purchase commitments are displayed separately from cash-flow totals.
  useEffect(() => {
    let active = true;

    setPurchaseLoading(true);
    setPurchaseError('');

    purchaseService.list()
      .then((data) => {
        if (active) {
          setPurchaseData({
            items: Array.isArray(data?.items) ? data.items : [],
            totals: data?.totals || null,
          });
        }
      })
      .catch((requestError) => {
        if (active) {
          setPurchaseError(
            requestError.message || 'Could not load purchase overview.'
          );
        }
      })
      .finally(() => {
        if (active) setPurchaseLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);


  // DASHBOARD VALUES

  const currency = summary?.currency || user?.currency || 'INR';

  const totals = summary?.totals;
  const currentMonth = summary?.currentMonth;

  const greetingName =
    user?.name?.trim().split(/\s+/)[0] || 'there';

  const hasActivity = Boolean(totals?.transactionCount);


  // MONTHLY AVERAGE

  const monthlyAverage = useMemo(() => {

    const values = summary?.monthlyTrend || [];

    return values.length
      ? values.reduce((sum, item) => sum + item.expense, 0) / values.length
      : 0;

  }, [summary]);


  // PURCHASE OVERVIEW
  const purchases = purchaseData.items || [];

  const purchaseTotals = useMemo(() => {
    const source = purchaseData.totals || {};
    return {
      totalPurchaseValue: Number(source.totalPurchaseValue ?? purchases.reduce(
        (sum, item) => sum + Number(item.totalPrice || 0), 0
      )),
      totalPaid: Number(source.totalPaid ?? purchases.reduce(
        (sum, item) => sum + Number(item.totalPaid ?? item.initialPaidAmount ?? 0), 0
      )),
      outstandingAmount: Number(source.outstandingAmount ?? purchases.reduce(
        (sum, item) => sum + Number(item.remainingAmount || 0), 0
      )),
      activePurchases: Number(source.activePurchases ?? purchases.filter(
        (item) => item.status !== 'completed'
      ).length),
    };
  }, [purchaseData, purchases]);

  const upcomingPurchasePayments = useMemo(() => (
    purchases
      .flatMap((purchase) => (purchase.payments || [])
        .filter((payment) => payment.status !== 'paid')
        .map((payment) => ({
          ...payment,
          productName: purchase.productName,
          purchaseId: purchase._id,
        })))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 4)
  ), [purchases]);

  const monthlyPurchaseCommitment = useMemo(() => (
    purchases.reduce((sum, purchase) => {
      const remaining = Number(purchase.remainingAmount || 0);
      if (remaining <= 0) return sum;

      const installment = Number(purchase.installmentAmount || 0);
      if (purchase.paymentFrequency === 'monthly') return sum + installment;
      if (purchase.paymentFrequency === 'weekly') return sum + installment * 4.33;
      if (purchase.paymentFrequency === 'custom') {
        return sum + installment * (30 / Number(purchase.customIntervalDays || 30));
      }
      return sum;
    }, 0)
  ), [purchases]);

  // CURRENT DATE

  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());


  return (

    <div className="dashboard-premium dashboard-motion space-y-6 sm:space-y-8">
      <style>{`
        .dashboard-premium {
          --dash-emerald: 16, 185, 129;
          animation: dash-page-enter .55s cubic-bezier(.2,.7,.2,1) both;
        }

        .dashboard-premium .dashboard-stat-card {
          animation: dash-row-enter .55s ease both;
        }

        .dashboard-premium [aria-label="Financial summary"] > *:nth-child(2) { animation-delay: .07s; }
        .dashboard-premium [aria-label="Financial summary"] > *:nth-child(3) { animation-delay: .14s; }
        .dashboard-premium [aria-label="Financial summary"] > *:nth-child(4) { animation-delay: .21s; }

        .dashboard-premium .dashboard-stat-card {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          border-color: rgba(16,185,129,.14);
          background:
            linear-gradient(145deg, rgba(16,185,129,.055), transparent 62%),
            var(--card, rgba(12,18,16,.72));
          transition: transform .28s ease, border-color .28s ease, box-shadow .28s ease;
        }

        .dashboard-premium .dashboard-stat-card::after {
          content: "";
          position: absolute;
          width: 150px;
          height: 150px;
          right: -85px;
          top: -90px;
          border-radius: 50%;
          background: rgba(16,185,129,.12);
          filter: blur(28px);
          opacity: .55;
          z-index: -1;
          transition: opacity .3s ease, transform .3s ease;
        }

        .dashboard-premium .dashboard-stat-card:hover {
          transform: translateY(-5px);
          border-color: rgba(52,211,153,.42);
          box-shadow: 0 16px 38px rgba(0,0,0,.18), 0 0 24px rgba(16,185,129,.07);
        }

        .dashboard-premium .dashboard-stat-card:hover::after {
          opacity: .95;
          transform: scale(1.25);
        }

        .dashboard-premium .dashboard-stat-icon {
          transition: transform .3s ease, box-shadow .3s ease;
        }

        .dashboard-premium .dashboard-stat-card:hover .dashboard-stat-icon {
          transform: translateY(-2px) rotate(-5deg);
          box-shadow: 0 0 22px rgba(16,185,129,.12);
        }

        .dashboard-premium .dashboard-panel {
          border-color: rgba(16,185,129,.13);
          background:
            linear-gradient(145deg, rgba(16,185,129,.025), transparent 45%);
          transition: border-color .3s ease, box-shadow .3s ease;
        }

        .dashboard-premium .dashboard-panel:hover {
          border-color: rgba(16,185,129,.25);
          box-shadow: 0 14px 34px rgba(0,0,0,.12);
        }

        .dashboard-premium .dashboard-chart-bar {
          display: block;
          min-height: 4px;
          transform-origin: bottom;
          animation: dash-bar-grow .85s cubic-bezier(.2,.75,.25,1) both;
          opacity: 1 !important;
          filter: saturate(1.15);
          transition: filter .25s ease, box-shadow .25s ease;
        }

        /* Explicit chart colors keep the bars vivid regardless of theme tokens. */
        .dashboard-premium .dashboard-chart-income {
          background: linear-gradient(180deg, #6ee7b7 0%, #10b981 52%, #047857 100%) !important;
          box-shadow: 0 0 9px rgba(16,185,129,.28), 0 0 22px rgba(16,185,129,.16);
        }

        .dashboard-premium .dashboard-chart-expense {
          background: linear-gradient(180deg, #fda4af 0%, #fb7185 52%, #be123c 100%) !important;
          box-shadow: 0 0 9px rgba(251,113,133,.25), 0 0 22px rgba(244,63,94,.13);
        }

        .dashboard-premium .dashboard-chart-bar:hover {
          filter: brightness(1.18) saturate(1.2);
        }

        .dashboard-premium .dashboard-expense-track > span {
          transform-origin: left;
          animation: dash-track-grow .9s cubic-bezier(.2,.75,.25,1) both;
        }

        .dashboard-premium .dashboard-activity-row {
          animation: dash-row-enter .45s ease both;
          transition: background .25s ease, padding .25s ease;
          border-radius: 10px;
        }

        .dashboard-premium .dashboard-activity-row:hover {
          background: rgba(16,185,129,.035);
          padding-left: 9px;
          padding-right: 9px;
        }

        .dashboard-premium .dashboard-progress {
          box-shadow: 0 0 12px rgba(16,185,129,.12);
        }

        @keyframes dash-page-enter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes dash-bar-grow {
          from { transform: scaleY(.06); opacity: .35; }
          to { transform: scaleY(1); opacity: 1; }
        }

        @keyframes dash-track-grow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes dash-row-enter {
          from { opacity: 0; transform: translateY(7px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-premium,
          .dashboard-premium *,
          .dashboard-premium *::before,
          .dashboard-premium *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>


      {/* WELCOME HEADER */}

      <PageHeader

        title={`Welcome back, ${greetingName}`}

        description={`${today} · Your money at a glance. Make every rupee count.`}

        actions={

          <Button
            variant="secondary"
            onClick={refresh}
            disabled={loading}
          >

            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />

            Refresh

          </Button>

        }

      />


      {/* ERROR MESSAGE */}

      {error && (

        <Card className="border-danger/40">

          <p className="text-sm text-danger">{error}</p>

          <Button
            className="mt-3"
            size="sm"
            onClick={refresh}
          >
            Try again
          </Button>

        </Card>

      )}


      {/* FINANCIAL SUMMARY */}

      <section
        aria-label="Financial summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4"
      >

        <StatCard
          label="Available balance"
          value={loading ? '—' : formatCurrency(totals?.balance ?? 0, currency)}
          caption="All-time income minus expenses"
          icon={Wallet}
          tone="brand"
        />

        <StatCard
          label="Total income"
          value={loading ? '—' : formatCurrency(totals?.income ?? 0, currency)}
          caption={`${totals?.incomeCount || 0} income records`}
          icon={ArrowDownRight}
          tone="success"
        />

        <StatCard
          label="Total expenses"
          value={loading ? '—' : formatCurrency(totals?.expenses ?? 0, currency)}
          caption={`${totals?.expenseCount || 0} expense records`}
          icon={ArrowUpRight}
          tone="danger"
        />

        <StatCard
          label="This month net"
          value={loading ? '—' : formatCurrency(currentMonth?.net ?? 0, currency)}
          caption="Current month income minus expenses"
          icon={CircleDollarSign}
          tone="info"
        />

      </section>

      {/* PURCHASE PLANNER OVERVIEW */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Purchase commitments</h2>
            <p className="mt-1 text-sm text-content-muted">
              Your purchases, paid amount and upcoming installments — tracked separately from daily expenses.
            </p>
          </div>
          <Button as={Link} to="/purchases" variant="secondary" size="sm">
            Open Purchase Planner
            <ChevronRight size={15} />
          </Button>
        </div>

        {purchaseError ? (
          <Card className="dashboard-panel">
            <p className="text-sm text-content-muted">{purchaseError}</p>
            <Button className="mt-3" size="sm" variant="secondary" onClick={refresh}>
              Retry
            </Button>
          </Card>
        ) : (
          <>
            <section aria-label="Purchase summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
              <StatCard
                label="Total purchase value"
                value={purchaseLoading ? '—' : formatCurrency(purchaseTotals.totalPurchaseValue, currency)}
                caption={`${purchases.length} purchases recorded`}
                icon={ShoppingBag}
                tone="brand"
              />
              <StatCard
                label="Amount paid"
                value={purchaseLoading ? '—' : formatCurrency(purchaseTotals.totalPaid, currency)}
                caption="Initial payments and paid installments"
                icon={Wallet}
                tone="success"
              />
              <StatCard
                label="Outstanding balance"
                value={purchaseLoading ? '—' : formatCurrency(purchaseTotals.outstandingAmount, currency)}
                caption="Amount still to be paid"
                icon={CreditCard}
                tone="danger"
              />
              <StatCard
                label="Monthly commitment"
                value={purchaseLoading ? '—' : formatCurrency(monthlyPurchaseCommitment, currency)}
                caption={`${purchaseTotals.activePurchases} active purchases`}
                icon={CalendarClock}
                tone="info"
              />
            </section>

            <Card className="dashboard-panel">
              <CardHeader
                title="Upcoming purchase payments"
                description="Your next scheduled installments."
                action={<Badge tone="success">{upcomingPurchasePayments.length} upcoming</Badge>}
              />
              {purchaseLoading ? (
                <div className="skeleton h-24 w-full" />
              ) : upcomingPurchasePayments.length === 0 ? (
                <p className="py-6 text-center text-sm text-content-muted">
                  No pending purchase installments.
                </p>
              ) : (
                <div className="divide-y divide-line">
                  {upcomingPurchasePayments.map((payment, index) => (
                    <div
                      key={payment._id || `${payment.purchaseId}-${payment.dueDate}-${index}`}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-400">
                          <CalendarDays size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{payment.productName}</p>
                          <p className="mt-1 text-xs text-content-muted">
                            Due {formatDate(payment.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {formatCurrency(payment.amount, currency)}
                        </p>
                        <p className={`mt-1 text-xs ${payment.status === 'overdue' ? 'text-danger' : 'text-content-muted'}`}>
                          {payment.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </section>


      {/* CASH FLOW AND EXPENSE BREAKDOWN */}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">

        <Card className="dashboard-panel">

          <CardHeader
            title="Cash flow"
            description="Income compared with expenses over the last six months."
            action={<Badge tone="success">6 months</Badge>}
          />

          {loading

            ? <div className="skeleton h-56 w-full" />

            : <MonthlyChart
                items={summary?.monthlyTrend || []}
                currency={currency}
              />

          }

        </Card>


        <Card className="dashboard-panel">

          <CardHeader
            title="Expense breakdown"
            description="Where your money went this month."
            action={<CalendarDays size={18} className="text-content-subtle" />}
          />

          {loading

            ? <div className="skeleton h-56 w-full" />

            : <ExpenseBreakdown
                items={summary?.expenseBreakdown || []}
                currency={currency}
              />

          }

        </Card>

      </section>


      {/* RECENT TRANSACTIONS AND MONTHLY SNAPSHOT */}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">


        <Card className="dashboard-panel">

          <CardHeader

            title="Recent transactions"

            description="Your latest income and expenses."

            action={

              <Button
                as={Link}
                to="/transactions"
                variant="ghost"
                size="sm"
              >
                View all
                <ChevronRight size={15} />
              </Button>

            }

          />

          {loading

            ? <div className="skeleton h-48 w-full" />

            : <RecentActivity
                items={summary?.recentTransactions || []}
                currency={currency}
              />

          }

        </Card>


        <MonthlySnapshot
          currentMonth={currentMonth}
          currency={currency}
          loading={loading}
          monthlyAverage={monthlyAverage}
        />

      </section>


      {/* FINANCIAL HEALTH */}

      <FinancialHealth
  currentMonth={currentMonth}
  currency={currency}
  loading={loading}
  hasHistoricalActivity={hasActivity}
/>

{/* SMART FINANCIAL INSIGHTS */}

<SmartFinancialInsights
  currentMonth={currentMonth}
  monthlyTrend={summary?.monthlyTrend || []}
  expenseBreakdown={summary?.expenseBreakdown || []}
  currency={currency}
  loading={loading}
/>

      {/* EMPTY DASHBOARD */}

      {!loading && !hasActivity && !error && (

        <Card className="border-brand-500/25 bg-brand-500/5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-400">
                <Sparkles size={21} />
              </span>

              <div>

                <p className="font-semibold">
                  Your financial overview starts here
                </p>

                <p className="mt-1 text-sm text-content-muted">
                  Once you add transactions, your balance, trends and category insights will appear automatically.
                </p>

              </div>

            </div>

            <Button as={Link} to="/income">
              Add your first income
            </Button>

          </div>

        </Card>

      )}

    </div>

  );

}
