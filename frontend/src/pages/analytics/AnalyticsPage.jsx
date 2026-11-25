import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  PiggyBank,
  PieChart,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  CalendarCheck,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

import Card, { CardHeader } from '@/components/common/Card';
import Button from '@/components/common/Button';
import PageHeader from '@/components/common/PageHeader';

import { analyticsService } from '@/services/analyticsService';

import { formatCurrency, formatPercent } from '@/utils/formatters';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const thisMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const monthTitle = (key) =>
  new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${key}-01T12:00:00Z`));

const formatDate = (date) => {
  if (!date) return 'N/A';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
};


// ==========================================
// SUMMARY METRIC CARD
// ==========================================

function Metric({ label, value, note, icon: Icon, tone = 'brand' }) {

  const tones = {
    brand: 'text-brand-400 bg-brand-500/10',
    success: 'text-success bg-success/10',
    danger: 'text-danger bg-danger/10',
    info: 'text-info bg-info/10',
  };

  return (
    <Card className="group border-border/80 bg-gradient-to-br from-surface to-surface/70 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5">
      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-sm text-content-muted">{label}</p>

          <p className="mt-2 break-words text-2xl font-semibold">
            {value}
          </p>

          <p className="mt-1 text-xs text-content-subtle">
            {note}
          </p>
        </div>

        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={19} />
        </span>

      </div>
    </Card>
  );
}


// ==========================================
// SIX MONTH CASH FLOW CHART
// ==========================================

function TrendChart({ items, currency }) {

  const safeItems = Array.isArray(items) ? items : [];
  const max = Math.max(
    1,
    ...safeItems.flatMap((item) => [
      Number(item.income || 0),
      Number(item.expense || 0),
    ])
  );

  const hasActivity = safeItems.some(
    (item) => Number(item.income || 0) > 0 || Number(item.expense || 0) > 0
  );

  if (!safeItems.length || !hasActivity) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-line px-5 text-center">
        <ChartNoAxesCombined size={28} className="mb-3 text-brand-400" />
        <p className="text-sm font-semibold">No cash-flow activity yet</p>
        <p className="mt-1 max-w-sm text-xs text-content-muted">
          Record income or expenses to build your six-month financial trend.
        </p>
      </div>
    );
  }

  return (
    <div>

      <div className="mb-4 flex gap-4 text-xs text-content-muted">

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

        {safeItems.map((item) => (

          <div key={item.key} className="min-w-0">

            <div className="flex h-44 items-end justify-center gap-1 border-b border-line pb-2 sm:h-52">

              <div
                title={`Income: ${formatCurrency(item.income, currency)}`}
                className="w-1/2 max-w-7 rounded-t bg-brand-400 transition-all"
                style={{
                  height: `${item.income ? Math.max(3, (item.income / max) * 100) : 0}%`,
                }}
              />

              <div
                title={`Expenses: ${formatCurrency(item.expense, currency)}`}
                className="w-1/2 max-w-7 rounded-t bg-danger transition-all"
                style={{
                  height: `${item.expense ? Math.max(3, (item.expense / max) * 100) : 0}%`,
                }}
              />

            </div>

            <p className="mt-2 truncate text-center text-xs text-content-muted">
              {item.label}
            </p>

          </div>

        ))}

      </div>

      <p className="mt-3 text-xs text-content-subtle">
        Six calendar months ending {safeItems[safeItems.length - 1]?.key || ''}
      </p>

    </div>
  );
}


// ==========================================
// DAILY SPENDING TREND CHART
// ==========================================

function DailyTrendChart({ items, currency }) {

  const width = 720;
  const height = 240;

  const left = 35;
  const right = 15;
  const top = 20;
  const bottom = 35;

  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const max = Math.max(
    1,
    ...items.map((item) => Number(item.amount || 0))
  );

  const points = items.map((item, index) => {

    const x =
      left +
      (items.length > 1
        ? (index / (items.length - 1)) * chartWidth
        : chartWidth / 2);

    const y =
      top +
      chartHeight -
      (Number(item.amount || 0) / max) * chartHeight;

    return {
      ...item,
      x,
      y,
    };

  });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(' ');

  const areaPoints = [
    `${left},${top + chartHeight}`,
    linePoints,
    `${left + chartWidth},${top + chartHeight}`,
  ].join(' ');

  const labelIndexes = [
    ...new Set([
      0,
      Math.floor((items.length - 1) * 0.25),
      Math.floor((items.length - 1) * 0.5),
      Math.floor((items.length - 1) * 0.75),
      items.length - 1,
    ]),
  ];

  const activePoints = points.filter(
    (point) => point.amount > 0
  );

  if (!items.length || !activePoints.length) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-line px-5 text-center">
        <Activity size={27} className="mb-3 text-brand-400" />
        <p className="text-sm font-semibold">No daily spending recorded</p>
        <p className="mt-1 max-w-sm text-xs text-content-muted">
          Daily activity will appear here as soon as expenses are recorded for this month.
        </p>
      </div>
    );
  }

  return (

    <div className="w-full">

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

        <div className="flex items-center gap-2 text-xs text-content-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-400" />
          Daily expenses
        </div>

        <span className="text-xs text-content-subtle">
          {items.length} days
        </span>

      </div>

      <div className="w-full overflow-hidden">

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label="Daily expense trend chart"
        >

          <defs>

            <linearGradient
              id="dailyExpenseGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#10b981"
                stopOpacity="0.30"
              />

              <stop
                offset="100%"
                stopColor="#10b981"
                stopOpacity="0.01"
              />

            </linearGradient>

          </defs>


          {/* HORIZONTAL GRID */}

          {[0, 1, 2, 3].map((index) => {

            const y = top + (chartHeight / 3) * index;

            return (
              <line
                key={index}
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
                stroke="currentColor"
                opacity="0.12"
                strokeDasharray="4 5"
              />
            );

          })}


          {/* AREA */}

          <polygon
            points={areaPoints}
            fill="url(#dailyExpenseGradient)"
          />


          {/* LINE */}

          {activePoints.length > 1 && (

            <polyline
              points={linePoints}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

          )}


          {/* DAILY POINTS */}

          {activePoints.map((point) => (

            <circle
              key={point.date}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#10b981"
              stroke="#15171c"
              strokeWidth="2"
            >
              <title>
                {`Day ${point.day}: ${formatCurrency(point.amount, currency)} (${point.count} transactions)`}
              </title>
            </circle>

          ))}


          {/* DAY LABELS */}

          {labelIndexes.map((index) => {

            const point = points[index];

            return (
              <text
                key={point.date}
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                fill="currentColor"
                opacity="0.65"
                fontSize="11"
              >
                {point.day}
              </text>
            );

          })}

        </svg>

      </div>

      <p className="mt-2 text-xs text-content-subtle">
        Hover over the chart points to view daily expense details.
      </p>

    </div>

  );
}


// ==========================================
// EXPENSE DONUT CHART
// ==========================================

function ExpenseDonut({ items, currency }) {

  const safeItems = Array.isArray(items) ? items : [];
  const total = safeItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const colors = [
    '#10b981',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
    '#84cc16',
  ];

  let currentAngle = 0;

  const gradient = safeItems.map((item, index) => {

    const percentage =
      total > 0
        ? (Number(item.amount || 0) / total) * 100
        : 0;

    const start = currentAngle;

    currentAngle += percentage * 3.6;

    return `${colors[index % colors.length]} ${start}deg ${currentAngle}deg`;

  });

  return (

    <div className="grid items-center gap-8 md:grid-cols-[220px_minmax(0,1fr)]">

      <div className="flex justify-center">

        <div
          className="relative grid h-52 w-52 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${gradient.join(', ')})`,
          }}
        >

          <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-surface text-center shadow-inner">

            <p className="text-xs text-content-muted">
              Total expenses
            </p>

            <p className="mt-2 text-xl font-bold">
              {formatCurrency(total, currency)}
            </p>

            <p className="mt-1 text-xs text-content-subtle">
              {safeItems.length} categories
            </p>

          </div>

        </div>

      </div>


      <div className="space-y-4">

        {safeItems.map((item, index) => {

          const percentage =
            total > 0
              ? (Number(item.amount || 0) / total) * 100
              : 0;

          const categoryColor = colors[index % colors.length];

          return (

            <div
              key={item.categoryId || item.name}
              className="space-y-2"
            >

              <div className="flex items-center justify-between gap-3">

                <div className="flex min-w-0 items-center gap-2">

                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: categoryColor }}
                  />

                  <span className="truncate text-sm font-medium">
                    {item.name}
                  </span>

                </div>

                <span className="shrink-0 text-sm font-semibold">
                  {formatCurrency(item.amount, currency)}
                </span>

              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-surface-overlay">

                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: categoryColor,
                  }}
                />

              </div>

              <div className="flex justify-between text-xs text-content-subtle">

                <span>
                  {percentage.toFixed(1)}% of spending
                </span>

                <span>
                  {item.count} transactions
                </span>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );
}


// ==========================================
// EMPTY EXPENSE STATE
// ==========================================

function EmptyExpenseState({ month }) {

  return (

    <div className="flex flex-col items-center justify-center py-12 text-center">

      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-400">
        <PieChart size={27} />
      </div>

      <h3 className="text-base font-semibold">
        No spending data yet
      </h3>

      <p className="mt-2 max-w-sm text-sm text-content-muted">
        No expenses were recorded in {monthTitle(month)}.
        Add an expense to see your category-wise spending analysis.
      </p>

    </div>

  );

}


// ==========================================
// DAILY SPENDING STATISTICS
// ==========================================

function DailyStatistics({ dailyAnalysis, currency }) {

  const highest = dailyAnalysis?.highestSpendingDay;
  const lowest = dailyAnalysis?.lowestSpendingDay;
  const biggest = dailyAnalysis?.biggestExpense;

  const statistics = [

    {
      title: 'Highest spending day',
      value: highest
        ? formatCurrency(highest.amount, currency)
        : 'No data',
      description: highest
        ? formatDate(highest.date)
        : 'No expense recorded',
      icon: TrendingUp,
      tone: 'text-danger bg-danger/10',
    },

    {
      title: 'Lowest spending day',
      value: lowest
        ? formatCurrency(lowest.amount, currency)
        : 'No data',
      description: lowest
        ? formatDate(lowest.date)
        : 'No expense recorded',
      icon: TrendingDown,
      tone: 'text-success bg-success/10',
    },

    {
      title: 'Biggest individual expense',
      value: biggest
        ? formatCurrency(biggest.amount, currency)
        : 'No data',
      description: biggest
        ? `${biggest.description} · ${biggest.category}`
        : 'No expense recorded',
      icon: Wallet,
      tone: 'text-info bg-info/10',
    },

  ];

  return (

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

      {statistics.map((item) => {

        const Icon = item.icon;

        return (

          <Card key={item.title}>

            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0">

                <p className="text-sm text-content-muted">
                  {item.title}
                </p>

                <p className="mt-3 break-words text-xl font-bold">
                  {item.value}
                </p>

                <p className="mt-2 break-words text-xs text-content-subtle">
                  {item.description}
                </p>

              </div>

              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.tone}`}>
                <Icon size={19} />
              </span>

            </div>

          </Card>

        );

      })}

    </div>

  );

}


// ==========================================
// FINANCIAL INSIGHTS
// ==========================================

function FinancialInsights({ report, month, currency }) {

  const summary = report?.summary || {};

  const breakdown = report?.breakdown || [];

  const comparison = report?.comparison || {};

  const totalExpenses = Number(summary.expenses || 0);

  const totalTransactions = Number(summary.expenseCount || 0);


  const topCategory = [...breakdown].sort(
    (a, b) => Number(b.amount || 0) - Number(a.amount || 0)
  )[0];


  const averageDaily = Number(
    report?.dailyAnalysis?.averageDailySpending ?? 0
  );


  const expenseChange = comparison.expenseChange;

  const hasPreviousBaseline =
    expenseChange !== null && expenseChange !== undefined;

  const difference =
    totalExpenses - Number(comparison.previousExpenses || 0);


  let changeLabel = 'No previous-month data';

  let changeColor = 'text-content-muted';

  if (hasPreviousBaseline) {

    if (difference > 0) {

      changeLabel = `${formatCurrency(difference, currency)} more`;

      changeColor = 'text-danger';

    } else if (difference < 0) {

      changeLabel = `${formatCurrency(Math.abs(difference), currency)} less`;

      changeColor = 'text-success';

    } else {

      changeLabel = 'No change';

    }

  }


  const insights = [

    {
      title: 'Top spending category',
      value: topCategory?.name || 'No data',
      description: topCategory
        ? `${formatCurrency(topCategory.amount, currency)} spent`
        : 'No expenses recorded',
      icon: PieChart,
      tone: 'text-brand-400 bg-brand-500/10',
    },

    {
      title: 'Average daily spending',
      value: formatCurrency(averageDaily, currency),
      description: 'Average per calendar day',
      icon: Activity,
      tone: 'text-info bg-info/10',
    },

    {
      title: 'Total transactions',
      value: totalTransactions.toString(),
      description: 'Expense records this month',
      icon: Receipt,
      tone: 'text-success bg-success/10',
    },

    {
      title: 'Monthly expense change',
      value: changeLabel,
      description: hasPreviousBaseline
        ? `${formatPercent(expenseChange, 1)} vs previous month`
        : 'Previous-month comparison unavailable',
      icon: ArrowUpRight,
      tone: 'text-danger bg-danger/10',
      valueColor: changeColor,
    },

  ];


  return (

    <Card>

      <CardHeader
        title="VELTRIO Financial Insights"
        description="Understand your spending habits and monthly financial activity."
        action={<Sparkles size={20} className="text-brand-400" />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {insights.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="rounded-xl border border-border bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40"
            >

              <div className="flex items-center justify-between gap-2">

                <p className="text-sm text-content-muted">
                  {item.title}
                </p>

                <span className={`grid h-9 w-9 place-items-center rounded-lg ${item.tone}`}>
                  <Icon size={18} />
                </span>

              </div>

              <p className={`mt-4 break-words text-xl font-bold ${item.valueColor || ''}`}>
                {item.value}
              </p>

              <p className="mt-2 text-xs text-content-subtle">
                {item.description}
              </p>

            </div>

          );

        })}

      </div>


      <div className="mt-5 rounded-xl border border-brand-500/20 bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-transparent p-4">

        <div className="flex items-start gap-3">

          <Sparkles
            size={19}
            className="mt-0.5 shrink-0 text-brand-400"
          />

          <div>

            <p className="text-sm font-semibold">
              Your monthly spending insight
            </p>

            <p className="mt-1 text-sm leading-relaxed text-content-muted">

              {topCategory

                ? `${topCategory.name} is your highest spending category, accounting for ${Number(topCategory.percentage || 0).toFixed(1)}% of your monthly expenses.`

                : `No expenses have been recorded in ${monthTitle(month)} yet. Add transactions to unlock your financial insights.`}

            </p>

          </div>

        </div>

      </div>

    </Card>

  );

}


// ==========================================
// MAIN ANALYTICS PAGE
// ==========================================

export default function AnalyticsPage() {

  const { user } = useAuth();

  const [month, setMonth] = useState(thisMonth);

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);


  useEffect(() => {

    let active = true;

    setLoading(true);
    setError('');

    analyticsService
      .report(month)

      .then((data) => {

        if (active) setReport(data);

      })

      .catch((requestError) => {

        if (active) {
          setError(requestError.message || 'Could not load analytics. Please try again.');
        }

      })

      .finally(() => {

        if (active) setLoading(false);

      });

    return () => {
      active = false;
    };

  }, [month, refreshKey, user?.currency]);


  const currency = user?.currency || report?.currency || 'INR';

  const summary = report?.summary || {};

  const dailyAnalysis = report?.dailyAnalysis || {};

  const monthNet = Number(summary.net || 0);
  const monthIncome = Number(summary.income || 0);
  const monthExpenses = Number(summary.expenses || 0);
  const savingsRate = Number(summary.savingsRate || 0);
  const hasMonthActivity = monthIncome > 0 || monthExpenses > 0;

  const performance = useMemo(() => {
    if (!hasMonthActivity) {
      return {
        title: 'Waiting for your first transaction',
        description: `Add income or expenses in ${monthTitle(month)} to unlock your monthly performance overview.`,
        tone: 'border-line bg-surface-overlay/40',
        icon: Activity,
      };
    }
    if (monthNet > 0) {
      return {
        title: 'Positive cash flow',
        description: `You are ahead by ${formatCurrency(monthNet, currency)} this month. Keep building the gap between income and expenses.`,
        tone: 'border-success/20 bg-success/5',
        icon: TrendingUp,
      };
    }
    if (monthNet < 0) {
      return {
        title: 'Spending is above income',
        description: `Expenses exceed income by ${formatCurrency(Math.abs(monthNet), currency)}. Review your largest categories and recurring costs.`,
        tone: 'border-danger/20 bg-danger/5',
        icon: TrendingDown,
      };
    }
    return {
      title: 'Balanced cash flow',
      description: 'Your recorded income and expenses are equal for this month.',
      tone: 'border-info/20 bg-info/5',
      icon: Activity,
    };
  }, [hasMonthActivity, month, monthNet, currency]);

  const changeText = (value) =>

    value === null || value === undefined

      ? 'No previous-month baseline'

      : `${value > 0 ? '+' : ''}${formatPercent(value, 1)} vs previous month`;


  return (

    <div className="space-y-6 sm:space-y-8">


      {/* PAGE HEADER */}

      <PageHeader
        title="Analytics"
        description="Understand your cash flow, spending patterns, and monthly progress."

        actions={

          <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <label className="flex items-center gap-2 text-sm text-content-muted">

            <CalendarDays size={16} />

            <span className="hidden sm:inline">
              Month
            </span>

            <input
              aria-label="Analytics month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="min-w-0 rounded-xl border border-border bg-surface px-3 py-2 text-content"
            />

          </label>
          </div>

        }
      />

      {error && (
        <Card className="border-danger/30 bg-danger/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-danger" />
              <div>
                <p className="text-sm font-semibold text-danger">Analytics could not be loaded</p>
                <p className="mt-1 text-sm text-content-muted">{error}</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={refresh}>
              <RefreshCw size={14} /> Try again
            </Button>
          </div>
        </Card>
      )}


      {/* SUMMARY CARDS */}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <Metric
          label="Income"
          value={loading ? '—' : formatCurrency(summary.income || 0, currency)}
          note={`${summary.incomeCount || 0} income records`}
          icon={ArrowDownRight}
          tone="success"
        />

        <Metric
          label="Expenses"
          value={loading ? '—' : formatCurrency(summary.expenses || 0, currency)}
          note={`${summary.expenseCount || 0} expense records`}
          icon={ArrowUpRight}
          tone="danger"
        />

        <Metric
          label="Net cash flow"
          value={loading ? '—' : formatCurrency(summary.net || 0, currency)}
          note={`${summary.transactionCount || 0} transactions`}
          icon={Activity}
          tone="info"
        />

        <Metric
          label="Savings rate"
          value={loading ? '—' : formatPercent(summary.savingsRate || 0, 1)}
          note="(Income − expenses) ÷ income"
          icon={PiggyBank}
        />

      </div>

      {/* MONTHLY PERFORMANCE SUMMARY */}

      <Card className={`overflow-hidden border ${performance.tone}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface/70 text-brand-400">
              <performance.icon size={21} />
            </span>
            <div>
              <p className="font-semibold">{loading ? 'Calculating monthly performance...' : performance.title}</p>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-content-muted">
                {loading ? 'Your latest financial activity is being analyzed.' : performance.description}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[230px]">
            <div className="rounded-xl bg-surface/70 p-3">
              <p className="text-[11px] text-content-muted">Savings rate</p>
              <p className="mt-1 text-lg font-bold">{loading ? '—' : formatPercent(savingsRate, 1)}</p>
            </div>
            <div className="rounded-xl bg-surface/70 p-3">
              <p className="text-[11px] text-content-muted">Net cash flow</p>
              <p className={`mt-1 text-lg font-bold ${monthNet >= 0 ? 'text-success' : 'text-danger'}`}>
                {loading ? '—' : formatCurrency(monthNet, currency)}
              </p>
            </div>
          </div>
        </div>
      </Card>


      {/* CASH FLOW AND MONTHLY COMPARISON */}

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">

        <Card>

          <CardHeader
            title="Income vs expenses"
            description="Six-month cash-flow trend, ending with the selected month."
            action={
              <ChartNoAxesCombined
                size={19}
                className="text-brand-400"
              />
            }
          />

          {loading ? (
            <div className="skeleton h-60" />
          ) : (
            <TrendChart
              items={report?.trend || []}
              currency={currency}
            />
          )}

        </Card>


        <Card>

          <CardHeader
            title="Monthly comparison"
            description={`Compared with ${report?.comparison?.previousMonth || 'the previous month'}.`}
          />

          <div className="space-y-5">

            {[
              [
                'Income',
                report?.comparison?.incomeChange,
                report?.comparison?.previousIncome,
              ],
              [
                'Expenses',
                report?.comparison?.expenseChange,
                report?.comparison?.previousExpenses,
              ],
            ].map(([label, change, previous]) => (

              <div key={label}>

                <div className="flex justify-between gap-3">

                  <span className="text-sm text-content-muted">
                    {label}
                  </span>

                  <strong className="text-sm">
                    {changeText(change)}
                  </strong>

                </div>

                <p className="mt-1 text-xs text-content-subtle">
                  Previous month: {formatCurrency(previous || 0, currency)}
                </p>

              </div>

            ))}

          </div>

        </Card>

      </section>


      {/* NEW: DAILY SPENDING TREND */}

      <Card>

        <CardHeader
          title="Daily Spending Trend"
          description={`Track your daily expenses throughout ${monthTitle(month)}.`}
          action={
            <TrendingUp size={20} className="text-brand-400" />
          }
        />

        {loading ? (

          <div className="skeleton h-60" />

        ) : (

          <DailyTrendChart
            items={report?.dailyTrend || []}
            currency={currency}
          />

        )}

      </Card>


      {/* NEW: DAILY SPENDING STATISTICS */}

      {!loading && (

        <section className="space-y-4">

          <div>
            <h2 className="text-lg font-semibold">
              Daily Spending Highlights
            </h2>

            <p className="mt-1 text-sm text-content-muted">
              Your important spending records for {monthTitle(month)}.
            </p>
          </div>

          <DailyStatistics
            dailyAnalysis={dailyAnalysis}
            currency={currency}
          />

        </section>

      )}


      {/* EXPENSE BREAKDOWN AND INCOME ANALYSIS */}

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">


        <Card>

          <CardHeader
            title="Expense breakdown"
            description={`Category-wise spending for ${monthTitle(month)}.`}
          />

          {loading ? (

            <div className="skeleton h-60" />

          ) : !report?.breakdown?.length ? (

            <EmptyExpenseState month={month} />

          ) : (

            <ExpenseDonut
              items={report.breakdown}
              currency={currency}
            />

          )}

        </Card>


        <Card>

          <CardHeader
            title="Income analysis"
            description="A closer look at income for the selected month."
          />

          <div className="space-y-4">

            <div>

              <p className="text-sm text-content-muted">
                Average income per record
              </p>

              <p className="mt-1 text-xl font-semibold">

                {loading
                  ? '—'
                  : formatCurrency(
                      report?.incomeAnalysis?.averagePerIncome || 0,
                      currency
                    )}

              </p>

            </div>


            <div className="border-t border-line pt-4">

              <p className="text-sm text-content-muted">
                All-time income
              </p>

              <p className="mt-1 text-lg font-semibold text-success">

                {loading
                  ? '—'
                  : formatCurrency(
                      report?.incomeAnalysis?.allTimeIncome || 0,
                      currency
                    )}

              </p>

            </div>


            <div className="border-t border-line pt-4">

              <p className="text-sm text-content-muted">
                All-time expenses
              </p>

              <p className="mt-1 text-lg font-semibold text-danger">

                {loading
                  ? '—'
                  : formatCurrency(
                      report?.incomeAnalysis?.allTimeExpenses || 0,
                      currency
                    )}

              </p>

            </div>


            <div className="border-t border-line pt-4">

              <p className="text-sm text-content-muted">
                All-time net balance
              </p>

              <p className={`mt-1 text-lg font-semibold ${
                Number(report?.incomeAnalysis?.allTimeNet || 0) >= 0
                  ? 'text-success'
                  : 'text-danger'
              }`}>

                {loading
                  ? '—'
                  : formatCurrency(
                      report?.incomeAnalysis?.allTimeNet || 0,
                      currency
                    )}

              </p>

            </div>

          </div>

        </Card>

      </section>


      {/* FINANCIAL INSIGHTS */}

      {!loading && (

        <FinancialInsights
          report={report}
          month={month}
          currency={currency}
        />

      )}


      {/* REPORT CONTEXT */}

      {!loading && !error && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-xs text-content-subtle">
          <span>Report period: {monthTitle(month)}</span>
          <span>Values are calculated from saved transactions.</span>
        </div>
      )}


      {/* DAILY INSIGHT FOOTER */}

      {!loading && !error && dailyAnalysis?.daysInMonth && (

        <div className="flex items-center gap-3 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">

          <CalendarCheck
            size={20}
            className="shrink-0 text-brand-400"
          />

          <p className="text-sm text-content-muted">
            Analytics calculated from your recorded transactions across{' '}
            {dailyAnalysis.daysInMonth} calendar days in {monthTitle(month)}.
          </p>

        </div>

      )}

    </div>

  );

}