import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  Target,
  Wallet,
  Activity,
  CalendarDays,
} from 'lucide-react';

import Card, { CardHeader } from '@/components/common/Card';
import { formatCurrency } from '@/utils/formatters';

export default function SmartFinancialInsights({
  currentMonth,
  monthlyTrend = [],
  expenseBreakdown = [],
  currency = 'INR',
  loading = false,
}) {

  // ==========================================
  // FINANCIAL DATA
  // ==========================================

  const income = Number(currentMonth?.income || 0);
  const expenses = Number(currentMonth?.expenses || 0);

  const net = Number(
    currentMonth?.net ?? income - expenses
  );

  // Analyse historical monthly data

  const history = monthlyTrend.map((item) => ({
    ...item,
    income: Number(item.income || 0),
    expense: Number(item.expense || 0),
  }));

  const totalIncome = history.reduce(
    (sum, item) => sum + item.income,
    0
  );

  const totalExpenses = history.reduce(
    (sum, item) => sum + item.expense,
    0
  );

  const historicalNet = totalIncome - totalExpenses;

  const hasCurrentActivity = income > 0 || expenses > 0;

  const hasHistoricalActivity = history.some(
    (item) => item.income > 0 || item.expense > 0
  );

  const hasActivity = hasCurrentActivity || hasHistoricalActivity;

  // ==========================================
  // MONTHLY ANALYSIS
  // ==========================================

  const activeMonths = history.filter(
    (item) => item.income > 0 || item.expense > 0
  );

  const highestExpenseMonth = [...history].sort(
    (a, b) => b.expense - a.expense
  )[0];

  const highestIncomeMonth = [...history].sort(
    (a, b) => b.income - a.income
  )[0];

  const averageExpenses = history.length
    ? totalExpenses / history.length
    : 0;

  // Compare the latest two calendar months

  const latestMonth = history[history.length - 1];

  const previousMonth = history.length >= 2
    ? history[history.length - 2]
    : null;
const expenseChange =
  latestMonth?.expense > 0 && previousMonth?.expense > 0
    ? (
        (latestMonth.expense - previousMonth.expense) /
        previousMonth.expense
      ) * 100
    : null;

  // ==========================================
  // FINANCIAL HEALTH SCORE
  // ==========================================

  const historicalSavingsRate = totalIncome > 0
    ? (historicalNet / totalIncome) * 100
    : null;

  const financialScore = historicalSavingsRate === null
    ? null
    : Math.max(
        0,
        Math.min(
          100,
          Math.round(50 + historicalSavingsRate * 0.5)
        )
      );

  const scoreLabel = financialScore === null
    ? 'Insufficient income data'
    : financialScore >= 75
      ? 'Excellent'
      : financialScore >= 55
        ? 'Good'
        : financialScore >= 35
          ? 'Needs attention'
          : 'At risk';

  // ==========================================
  // SPENDING CATEGORIES
  // ==========================================

  const categories = [...expenseBreakdown].sort(
    (a, b) => Number(b.amount || 0) - Number(a.amount || 0)
  );

  const highestCategory = categories.find(
    (item) => Number(item.amount) > 0
  );

  // ==========================================
  // GENERATE INSIGHTS
  // ==========================================

  const insights = [];

  if (hasActivity) {

    // Cash flow

    if (historicalNet > 0) {
      insights.push({
        icon: TrendingUp,
        title: 'Positive financial performance',
        description:
          `Your income exceeded your expenses by ${formatCurrency(historicalNet, currency)} across the displayed six-month period.`,
        tone: 'success',
      });

    } else if (historicalNet < 0) {
      insights.push({
        icon: AlertTriangle,
        title: 'Review your spending',
        description:
          `Your expenses exceeded your income by ${formatCurrency(Math.abs(historicalNet), currency)} across the displayed six-month period.`,
        tone: 'danger',
      });
    }

    // Highest expense month

    if (highestExpenseMonth?.expense > 0) {
      insights.push({
        icon: CalendarDays,
        title: 'Highest spending month',
        description:
          `${highestExpenseMonth.label} recorded your highest expenses of ${formatCurrency(highestExpenseMonth.expense, currency)}.`,
        tone: 'warning',
      });
    }

    // Monthly comparison

    if (expenseChange !== null) {
      insights.push({
        icon: expenseChange > 0
          ? TrendingUp
          : TrendingDown,

        title: expenseChange > 0
          ? 'Expenses increased'
          : expenseChange < 0
            ? 'Expenses decreased'
            : 'Expenses unchanged',

        description:
          `Your latest month's expenses are ${Math.abs(expenseChange).toFixed(1)}% ${
            expenseChange > 0
              ? 'higher'
              : expenseChange < 0
                ? 'lower'
                : 'unchanged'
          } than the previous month.`,

        tone: expenseChange > 0
          ? 'warning'
          : 'success',
      });
    }

    if (!hasCurrentActivity) {
  insights.push({
    icon: CalendarDays,
    title: 'No activity this month',
    description:
      'You have historical financial records, but no transactions recorded in the current month yet.',
    tone: 'info',
  });
}

    // Highest category - only when current-month data exists

    if (hasCurrentActivity && highestCategory) {
      insights.push({
        icon: Wallet,
        title: 'Top spending category',
        description:
          `${highestCategory.name} represents ${Number(highestCategory.percentage || 0).toFixed(1)}% of your current month's expenses.`,

        tone: 'info',
      });
    }

    // Saving opportunity

    if (averageExpenses > 0) {
      const potentialSaving = averageExpenses * 0.10;

      insights.push({
        icon: Lightbulb,
        title: 'Saving opportunity',
        description:
          `Reducing your average monthly expenses by 10% could save approximately ${formatCurrency(potentialSaving, currency)} per month.`,

        tone: 'brand',
      });
    }

    // Highest income month

    if (highestIncomeMonth?.income > 0) {
      insights.push({
        icon: Target,
        title: 'Best income month',
        description:
          `${highestIncomeMonth.label} recorded your highest income of ${formatCurrency(highestIncomeMonth.income, currency)}.`,

        tone: 'success',
      });
    }
  }

  // ==========================================
  // DESIGN CONFIGURATION
  // ==========================================

  const tones = {
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
    brand: 'bg-brand-500/10 text-brand-400',
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="space-y-5">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Sparkles size={20} className="text-brand-400" />
            Smart Financial Insights
          </h2>

          <p className="mt-1 text-sm text-content-muted">
            Intelligent analysis of your financial activity.
          </p>
        </div>

        <BadgeIcon />

      </div>

      {loading ? (

        <Card>
          <div className="skeleton h-48 w-full" />
        </Card>

      ) : !hasActivity ? (

        <Card>
          <div className="flex min-h-44 flex-col items-center justify-center text-center">

            <Activity size={30} className="mb-3 text-brand-400" />

            <h3 className="font-semibold">
              Waiting for financial activity
            </h3>

            <p className="mt-2 max-w-md text-sm text-content-muted">
              Add income or expenses to unlock your personalized financial insights.
            </p>

          </div>
        </Card>

      ) : (

        <>

          {/* HISTORICAL SUMMARY */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

            <Card>
              <p className="text-xs text-content-muted">
                Historical income
              </p>

              <p className="mt-2 text-xl font-bold text-success">
                {formatCurrency(totalIncome, currency)}
              </p>

              <p className="mt-1 text-xs text-content-subtle">
                Displayed six-month period
              </p>
            </Card>

            <Card>
              <p className="text-xs text-content-muted">
                Historical expenses
              </p>

              <p className="mt-2 text-xl font-bold text-danger">
                {formatCurrency(totalExpenses, currency)}
              </p>

              <p className="mt-1 text-xs text-content-subtle">
                Displayed six-month period
              </p>
            </Card>

            <Card>
              <p className="text-xs text-content-muted">
                Historical net savings
              </p>

              <p className={`mt-2 text-xl font-bold ${
                historicalNet >= 0
                  ? 'text-brand-300'
                  : 'text-danger'
              }`}>
                {formatCurrency(historicalNet, currency)}
              </p>

              <p className="mt-1 text-xs text-content-subtle">
                Income minus expenses
              </p>
            </Card>

          </div>

          {/* FINANCIAL HEALTH SCORE */}

          <Card className="border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-transparent">

            <div className="flex flex-wrap items-center justify-between gap-5">

              <div>

                <div className="flex items-center gap-2">

                  <Target size={20} className="text-brand-400" />

                  <h3 className="font-semibold">
                    Financial Health Score
                  </h3>

                </div>

                <p className="mt-2 text-sm text-content-muted">
                  Preliminary indicator based on your displayed six-month cash flow.
                </p>

                <p className="mt-3 text-sm font-semibold text-brand-400">
                  {scoreLabel}
                </p>

              </div>

              <div className="text-right">

                <p className="text-4xl font-bold">
                  {financialScore ?? '—'}

                  <span className="text-lg text-content-muted">
                    /100
                  </span>
                </p>

              </div>

            </div>

            {financialScore !== null && (

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-overlay">

                <div
                  className="h-full rounded-full bg-brand-400 transition-all duration-700"
                  style={{
                    width: `${financialScore}%`,
                  }}
                />

              </div>

            )}

          </Card>

          {/* INSIGHT CARDS */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {insights.map((item, index) => {

              const Icon = item.icon;

              return (

                <Card
                  key={`${item.title}-${index}`}
                  className="transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/30"
                >

                  <div className="flex items-start gap-3">

                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[item.tone]}`}>

                      <Icon size={21} />

                    </span>

                    <div className="min-w-0">

                      <h3 className="font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-content-muted">
                        {item.description}
                      </p>

                    </div>

                  </div>

                </Card>

              );

            })}

          </div>

          {/* HISTORICAL ACTIVITY */}

          <Card>

            <CardHeader
              title="Historical activity"
              description="Your financial activity across the displayed months."
              action={
                <Activity size={19} className="text-brand-400" />
              }
            />

            <div className="space-y-4">

              {history.map((item) => {

                const maxValue = Math.max(
                  ...history.map((month) =>
                    Math.max(month.income, month.expense)
                  ),
                  1
                );

                return (

                  <div key={item.key}>

                    <div className="mb-2 flex justify-between gap-3 text-sm">

                      <span className="font-medium">
                        {item.label}
                      </span>

                      <span className="text-content-muted">
                        {formatCurrency(item.expense, currency)} expenses
                      </span>

                    </div>

                    <div className="flex h-2 gap-1 overflow-hidden rounded-full bg-surface-overlay">

                      <div
                        className="rounded-full bg-brand-400 transition-all duration-500"
                        style={{
                          width: `${(item.income / maxValue) * 100}%`,
                        }}
                      />

                      <div
                        className="rounded-full bg-danger transition-all duration-500"
                        style={{
                          width: `${(item.expense / maxValue) * 100}%`,
                        }}
                      />

                    </div>

                  </div>

                );

              })}

            </div>

            <p className="mt-5 text-xs text-content-subtle">
              {activeMonths.length} active months · {history.length} months analysed
            </p>

          </Card>

        </>

      )}

    </div>

  );
}


// Small decorative header icon

function BadgeIcon() {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-400">
      <Sparkles size={20} />
    </span>
  );
}