import { useAuth } from '@/contexts/AuthContext';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Gauge,
  CircleAlert,
  Lightbulb,
  Loader2,
  PiggyBank,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trash2,
  Wallet,
} from 'lucide-react';

import toast from 'react-hot-toast';

import PageHeader from '@/components/common/PageHeader';
import ProgressBar from '@/components/common/ProgressBar';

import { budgetService } from '@/services/budgetService';
import { transactionService } from '@/services/transactionService';
import { analyticsService } from '@/services/analyticsService';

import { formatCurrency } from '@/utils/formatters';

// ==========================================
// HELPERS
// ==========================================

const currentMonth = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`;
};

const defaultTotals = {
  limit: 0,
  spent: 0,
  remaining: 0,
};

const getPercentage = (spent, limit) => {
  if (!limit || limit <= 0) return 0;

  return Math.round((spent / limit) * 100);
};

const getLastSixMonths = (selectedMonth) => {
  const [year, month] = selectedMonth.split('-').map(Number);

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(year, month - 6 + index, 1);

    return {
      key: `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`,

      label: new Intl.DateTimeFormat('en-IN', {
        month: 'short',
      }).format(date),
    };
  });
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function BudgetsPage() {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const money = (value) =>
    formatCurrency(Number(value) || 0, currency);

  const currencySymbol =
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value || currency;

  const [month, setMonth] = useState(currentMonth());

  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState(defaultTotals);
  const [categories, setCategories] = useState([]);

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const [form, setForm] = useState({
    category: '',
    limit: '',
    alertThreshold: '80',
  });

  // ==========================================
  // LOAD EXPENSE CATEGORIES
  // ==========================================

  const loadCategories = useCallback(async () => {
    setCategoryLoading(true);

    try {
      const result = await transactionService.categories('expense');

      setCategories(result || []);

      if (result?.length) {
        setForm((previous) => ({
          ...previous,
          category: previous.category || result[0].name,
        }));
      }
    } catch (error) {
      toast.error(error.message || 'Could not load categories');
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  // ==========================================
  // LOAD MONTHLY BUDGETS
  // ==========================================

  const loadBudgets = useCallback(async () => {
    setLoading(true);

    try {
      const result = await budgetService.list(month);

      setItems(result.items || []);
      setTotals(result.totals || defaultTotals);
    } catch (error) {
      toast.error(error.message || 'Could not load budgets');
    } finally {
      setLoading(false);
    }
  }, [month, currency]);

  // ==========================================
  // LOAD SIX-MONTH HISTORY
  // ==========================================

  const loadBudgetHistory = useCallback(async () => {
    setHistoryLoading(true);

    try {
      const months = getLastSixMonths(month);

      const results = await Promise.all(
        months.map(async (item) => {
          const [budgetData, report] = await Promise.all([
            budgetService.list(item.key),
            analyticsService.report(item.key),
          ]);

          const budgetedCategoryNames = new Set(
            (budgetData.items || []).map((budget) =>
              String(budget.category || '').trim().toLowerCase()
            )
          );

          const unbudgetedCategories = (report.breakdown || [])
            .filter((category) =>
              !budgetedCategoryNames.has(
                String(category.name || '').trim().toLowerCase()
              )
            )
            .map((category) => ({
              name: category.name,
              amount: Number(category.amount || 0),
            }))
            .filter((category) => category.amount > 0)
            .sort((a, b) => b.amount - a.amount);

          const actualExpenses = Number(report.summary?.expenses || 0);
          const budgetedSpent = Number(budgetData.totals?.spent || 0);

          return {
            ...item,

            limit: Number(budgetData.totals?.limit || 0),

            budgetedSpent,

            actualExpenses,

            unbudgetedSpent: Math.max(
              0,
              Number((actualExpenses - budgetedSpent).toFixed(2))
            ),

            unbudgetedCategories,
          };
        })
      );

      setHistory(results);
    } catch (error) {
      toast.error(
        error.message || 'Could not load budget history'
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [month, currency]);

  // ==========================================
  // INITIAL DATA LOADING
  // ==========================================

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  useEffect(() => {
    loadBudgetHistory();
  }, [loadBudgetHistory]);

  // ==========================================
  // MONTH LABEL
  // ==========================================

  const monthLabel = useMemo(() => {
    const [year, monthNumber] = month.split('-').map(Number);

    return new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, monthNumber - 1, 1));
  }, [month]);

  // ==========================================
  // OVERALL BUDGET CALCULATIONS
  // ==========================================

  const overallPercentage = getPercentage(
    totals.spent,
    totals.limit
  );

  const remainingAmount = totals.limit - totals.spent;

  const isOverBudget =
    totals.limit > 0 && totals.spent > totals.limit;

  // ==========================================
  // SMART INSIGHTS
  // ==========================================

  const insights = useMemo(() => {
    const exceeded = items.filter(
      (item) => item.status === 'exceeded'
    );

    const warning = items.filter(
      (item) => item.status === 'warning'
    );

    const result = [];

    if (exceeded.length > 0) {
      result.push({
        type: 'danger',
        icon: AlertTriangle,
        title: 'Budget exceeded',

        description: `${exceeded.length} ${
          exceeded.length === 1 ? 'category has' : 'categories have'
        } exceeded the planned spending limit.`,
      });
    }

    if (warning.length > 0) {
      result.push({
        type: 'warning',
        icon: CircleAlert,
        title: 'Spending needs attention',

        description: `${warning.length} ${
          warning.length === 1 ? 'category is' : 'categories are'
        } approaching their budget limits.`,
      });
    }

    if (
      items.length > 0 &&
      exceeded.length === 0 &&
      warning.length === 0
    ) {
      result.push({
        type: 'success',
        icon: ShieldCheck,
        title: "You're on track!",

        description:
          'All your category budgets are currently within their planned limits.',
      });
    }

    if (items.length === 0) {
      result.push({
        type: 'info',
        icon: Lightbulb,
        title: 'Start planning your spending',

        description:
          'Create your first category budget to monitor monthly expenses.',
      });
    }

    return result;
  }, [items]);

  // ==========================================
  // CATEGORY COLORS
  // ==========================================

  const getCategoryColor = (categoryName) => {
    const category = categories.find(
      (item) =>
        item.name.toLowerCase() === categoryName.toLowerCase()
    );

    return category?.color || '#64748B';
  };

  // ==========================================
  // SAVE BUDGET
  // ==========================================

  const submit = async (event) => {
    event.preventDefault();

    const limit = Number(form.limit);
    const threshold = Number(form.alertThreshold);

    if (!form.category) {
      toast.error('Please select an expense category');
      return;
    }

    if (!Number.isFinite(limit) || limit <= 0) {
      toast.error('Enter a valid budget limit');
      return;
    }

    if (limit > 1000000000000) {
      toast.error('Budget limit is too large');
      return;
    }

    if (
      !Number.isInteger(threshold) ||
      threshold < 1 ||
      threshold > 99
    ) {
      toast.error('Choose a valid alert threshold');
      return;
    }

    setSaving(true);

    try {
      await budgetService.save({
        month,
        category: form.category,
        limit,
        alertThreshold: threshold,
      });

      setForm((previous) => ({
        ...previous,
        limit: '',
        alertThreshold: '80',
      }));

      toast.success('Budget saved successfully');

      await Promise.all([
        loadBudgets(),
        loadBudgetHistory(),
      ]);
    } catch (error) {
      toast.error(error.message || 'Could not save budget');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE BUDGET
  // ==========================================

  const remove = async (id) => {
    const confirmed = window.confirm(
      'Delete this monthly budget? Your transactions will not be deleted.'
    );

    if (!confirmed) return;

    setRemovingId(id);

    try {
      await budgetService.remove(id);

      toast.success('Budget deleted successfully');

      await Promise.all([
        loadBudgets(),
        loadBudgetHistory(),
      ]);
    } catch (error) {
      toast.error(error.message || 'Could not delete budget');
    } finally {
      setRemovingId(null);
    }
  };

  // ==========================================
  // HISTORY TOTALS
  // ==========================================

  const historyTotals = useMemo(() => {
    return history.reduce(
      (result, item) => ({
        limit: result.limit + item.limit,

        budgetedSpent:
          result.budgetedSpent + item.budgetedSpent,

        actualExpenses:
          result.actualExpenses + item.actualExpenses,

        unbudgetedSpent:
          result.unbudgetedSpent + item.unbudgetedSpent,
      }),
      {
        limit: 0,
        budgetedSpent: 0,
        actualExpenses: 0,
        unbudgetedSpent: 0,
      }
    );
  }, [history]);

  // ==========================================
  // SELECTED MONTH PERFORMANCE
  // ==========================================

  const selectedMonthHistory = history.find(
    (item) => item.key === month
  );

  const actualMonthlyExpenses = Number(
    selectedMonthHistory?.actualExpenses || 0
  );

  const unbudgetedMonthlySpending = Number(
    selectedMonthHistory?.unbudgetedSpent || 0
  );

  const underBudgetAmount = items.reduce(
    (sum, item) => sum + Math.max(0, Number(item.limit || 0) - Number(item.spent || 0)),
    0
  );

  const overBudgetAmount = items.reduce(
    (sum, item) => sum + Math.max(0, Number(item.spent || 0) - Number(item.limit || 0)),
    0
  );

  const budgetVariance = totals.limit - actualMonthlyExpenses;

  const unbudgetedRatio = actualMonthlyExpenses > 0
    ? (unbudgetedMonthlySpending / actualMonthlyExpenses) * 100
    : 0;

  const overspendRatio = totals.limit > 0
    ? (overBudgetAmount / totals.limit) * 100
    : 0;

  // A guidance score based on category-budget adherence and unbudgeted spending.
  // It is not a credit score or a measure of overall financial health.
  const budgetPerformanceScore = totals.limit > 0
    ? Math.max(0, Math.min(100, Math.round(100 - (unbudgetedRatio * 0.6) - (overspendRatio * 0.4))))
    : null;

  const performanceLabel = budgetPerformanceScore === null
    ? 'Not enough budget data'
    : budgetPerformanceScore >= 90
      ? 'Excellent control'
      : budgetPerformanceScore >= 75
        ? 'Good control'
        : budgetPerformanceScore >= 55
          ? 'Needs attention'
          : 'Review your budgets';

  // ==========================================
  // HISTORY CHART SCALE
  // ==========================================

  const historyMax = Math.max(
    1,
    ...history.map((item) =>
      Math.max(item.limit, item.budgetedSpent)
    )
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-7 pb-8">

      {/* PAGE HEADER */}

      <PageHeader
        title="Budget Management"
        description="Take control of your spending. Plan smarter, spend better."

        actions={
          <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-content-muted shadow-sm">

            <CalendarDays size={17} />

            <input
              aria-label="Budget month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="min-w-0 bg-transparent text-content outline-none"
            />

          </label>
        }
      />

      {/* PREMIUM INTRO CARD */}

      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-brand-500/10 p-6 sm:p-8">

        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

          <div className="max-w-xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-400">

              <Sparkles size={14} />

              SMART BUDGET OVERVIEW

            </div>

            <h2 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
              Make every rupee
              <span className="text-brand-400"> count.</span>
            </h2>

            <p className="mt-3 text-sm leading-6 text-content-muted sm:text-base">
              Monitor your monthly spending, manage category limits,
              and stay ahead of your financial goals.
            </p>

          </div>

          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center self-center rounded-full border-4 border-brand-500/20 bg-brand-500/5">

            <div
              className="absolute inset-1 rounded-full"
              style={{
                background: `conic-gradient(
                  #10b981 ${Math.min(overallPercentage, 100) * 3.6}deg,
                  transparent 0deg
                )`,
              }}
            />

            <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-surface">

              <p className="text-2xl font-bold text-content">
                {overallPercentage}%
              </p>

              <p className="text-[10px] text-content-muted">
                USED
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* SUMMARY CARDS */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Total Budget"
          value={money(totals.limit)}
          subtitle="Planned monthly spending"
          icon={Wallet}
          tone="brand"
        />

        <SummaryCard
          title="Spent So Far"
          value={money(totals.spent)}
          subtitle="Recorded expenses"
          icon={ArrowUpRight}
          tone="warning"
        />

        <SummaryCard
          title="Remaining"
          value={money(remainingAmount)}
          subtitle={isOverBudget ? 'Amount above your budget' : 'Available budget'}
          icon={ArrowDownRight}
          tone={isOverBudget ? 'danger' : 'success'}
        />

        <SummaryCard
          title="Active Budgets"
          value={items.length}
          subtitle="Tracked categories"
          icon={Target}
          tone="purple"
        />

      </section>

      {/* OVERALL PROGRESS */}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

          <div>

            <h2 className="font-semibold text-content">
              Monthly spending progress
            </h2>

            <p className="mt-1 text-sm text-content-muted">
              Your overall budget utilization for {monthLabel}
            </p>

          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              isOverBudget
                ? 'bg-danger/10 text-danger'
                : overallPercentage >= 80
                  ? 'bg-warning/10 text-warning'
                  : 'bg-brand-500/10 text-brand-400'
            }`}
          >
            {isOverBudget
              ? 'Over budget'
              : overallPercentage >= 80
                ? 'High utilization'
                : 'Healthy spending'}
          </span>

        </div>

        <div className="mb-3 flex items-end justify-between gap-3">

          <p className="text-2xl font-bold text-content">
            {money(totals.spent)}
          </p>

          <p className="text-sm text-content-muted">
            of {money(totals.limit)}
          </p>

        </div>

        <ProgressBar
          value={totals.spent}
          max={totals.limit || 1}
          tone="auto"
          label="Overall monthly budget used"
          warnAt={80}
          dangerAt={100}
        />

        <div className="mt-3 flex justify-between text-xs text-content-muted">
          <span>0%</span>
          <span>{overallPercentage}% used</span>
          <span>100%</span>
        </div>

      </section>

      {/* MONTHLY BUDGET PERFORMANCE */}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">

        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Gauge size={20} className="text-brand-400" />
              <h2 className="text-lg font-semibold text-content">Monthly budget performance</h2>
            </div>
            <p className="mt-1 text-sm text-content-muted">
              Planned spending compared with all recorded expenses for {monthLabel}.
            </p>
          </div>

          <span className="rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-400">
            {performanceLabel}
          </span>
        </div>

        {historyLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-content-muted">
            <Loader2 size={18} className="animate-spin text-brand-400" />
            Calculating monthly performance...
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <PerformanceCard
                title="Actual expenses"
                value={money(actualMonthlyExpenses)}
                detail="All expense transactions this month"
                icon={Wallet}
                tone="brand"
              />
              <PerformanceCard
                title="Budget variance"
                value={`${budgetVariance < 0 ? '-' : '+'}${money(Math.abs(budgetVariance))}`}
                detail={budgetVariance >= 0 ? 'Total budget is above actual expenses' : 'Expenses are above total budget limits'}
                icon={budgetVariance >= 0 ? TrendingDown : TrendingUp}
                tone={budgetVariance >= 0 ? 'success' : 'danger'}
              />
              <PerformanceCard
                title="Unspent budget"
                value={money(underBudgetAmount)}
                detail="Remaining amount across individual budget categories"
                icon={PiggyBank}
                tone="success"
              />
              <PerformanceCard
                title="Over-budget amount"
                value={money(overBudgetAmount)}
                detail="Combined overspending across budgeted categories"
                icon={AlertTriangle}
                tone={overBudgetAmount > 0 ? 'danger' : 'brand'}
              />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.65fr)]">
              <div className="rounded-xl border border-border bg-surface-overlay/40 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-content">Planned vs actual</p>
                    <p className="mt-1 text-xs text-content-muted">Total category budget limits compared with all monthly expenses.</p>
                  </div>
                  <span className="text-xs font-semibold text-content-muted">{totals.limit > 0 ? `${getPercentage(actualMonthlyExpenses, totals.limit)}%` : 'No budget'}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="mb-1.5 flex justify-between gap-3 text-xs">
                      <span className="text-content-muted">Planned budget</span>
                      <strong className="text-content">{money(totals.limit)}</strong>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-overlay">
                      <div className="h-full rounded-full bg-brand-400" style={{ width: totals.limit > 0 ? '100%' : '0%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex justify-between gap-3 text-xs">
                      <span className="text-content-muted">Actual expenses</span>
                      <strong className="text-content">{money(actualMonthlyExpenses)}</strong>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-overlay">
                      <div
                        className={`h-full rounded-full ${actualMonthlyExpenses > totals.limit && totals.limit > 0 ? 'bg-danger' : 'bg-warning'}`}
                        style={{ width: totals.limit > 0 ? `${Math.min(100, (actualMonthlyExpenses / totals.limit) * 100)}%` : (actualMonthlyExpenses > 0 ? '100%' : '0%') }}
                      />
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-content-muted">
                  {totals.limit > 0
                    ? (budgetVariance >= 0
                      ? `${money(budgetVariance)} below the combined budget limits. Check unbudgeted spending separately.`
                      : `${money(Math.abs(budgetVariance))} above the combined budget limits.`)
                    : 'Create category budgets to compare planned spending with actual expenses.'}
                </p>
              </div>

              <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-content">Budget discipline score</p>
                    <p className="mt-1 text-xs text-content-muted">An estimate based on budget adherence.</p>
                  </div>
                  <div className="grid h-14 w-14 place-items-center rounded-full border-4 border-brand-500/20 bg-surface">
                    <span className="text-lg font-bold text-brand-400">
                      {budgetPerformanceScore === null ? '—' : budgetPerformanceScore}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-content-muted">
                  {budgetPerformanceScore === null
                    ? 'Add at least one category budget to calculate this score.'
                    : `Unbudgeted expenses: ${unbudgetedRatio.toFixed(1)}% of total expenses. This score is a budgeting guide, not a credit score or financial-health rating.`}
                </p>
              </div>
            </div>

            {unbudgetedMonthlySpending > 0 && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 p-4">
                <CircleAlert size={18} className="mt-0.5 shrink-0 text-warning" />
                <div>
                  <p className="text-sm font-semibold text-content">Unbudgeted expenses detected</p>
                  <p className="mt-1 text-xs leading-5 text-content-muted">
                    {money(unbudgetedMonthlySpending)} was spent in categories without a budget for {monthLabel}. Consider creating budgets for those categories.
                  </p>
                </div>
              </div>
            )}

            {overBudgetAmount > 0 && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" />
                <div>
                  <p className="text-sm font-semibold text-content">Category budget exceeded</p>
                  <p className="mt-1 text-xs leading-5 text-content-muted">
                    Your combined overspending across budgeted categories is {money(overBudgetAmount)}. Review the category budgets above.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* CATEGORY BUDGETS + CREATE BUDGET */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">

        {/* CATEGORY BUDGETS */}

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">

          <div className="mb-6 flex items-center justify-between gap-3">

            <div>

              <h2 className="text-lg font-semibold text-content">
                Category budgets
              </h2>

              <p className="mt-1 text-sm text-content-muted">
                Spending breakdown for {monthLabel}
              </p>

            </div>

            <div className="rounded-xl bg-brand-500/10 p-3 text-brand-400">
              <Wallet size={21} />
            </div>

          </div>

          {loading ? (

            <div className="flex flex-col items-center justify-center gap-3 py-16">

              <Loader2 className="animate-spin text-brand-400" size={28} />

              <p className="text-sm text-content-muted">
                Loading your budgets...
              </p>

            </div>

          ) : items.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-border px-5 py-14 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400">
                <Wallet size={26} />
              </div>

              <h3 className="font-semibold text-content">
                No budgets created yet
              </h3>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-content-muted">
                Create your first monthly category budget and start
                monitoring your expenses.
              </p>

            </div>

          ) : (

            <div className="space-y-6">

              {items.map((item) => {

                const color = getCategoryColor(item.category);

                const exceeded = item.status === 'exceeded';
                const warning = item.status === 'warning';

                return (

                  <article
                    key={item._id}
                    className="group rounded-2xl border border-border bg-surface-overlay/40 p-4 transition-all duration-300 hover:border-brand-500/30 hover:shadow-md sm:p-5"
                  >

                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: `${color}18`,
                            color,
                          }}
                        >
                          <Wallet size={20} />
                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate font-semibold text-content">
                            {item.category}
                          </h3>

                          <p className="mt-1 text-xs text-content-muted">
                            {money(item.spent)} spent of {money(item.limit)}
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-3">

                        <span
                          className={`rounded-lg px-2.5 py-1.5 text-sm font-bold ${
                            exceeded
                              ? 'bg-danger/10 text-danger'
                              : warning
                                ? 'bg-warning/10 text-warning'
                                : 'bg-brand-500/10 text-brand-400'
                          }`}
                        >
                          {item.percent}%
                        </span>

                        <button
                          type="button"
                          disabled={removingId === item._id}
                          onClick={() => remove(item._id)}
                          aria-label={`Delete ${item.category} budget`}
                          className="rounded-lg p-2 text-content-muted transition hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                        >
                          {removingId === item._id
                            ? <Loader2 size={17} className="animate-spin" />
                            : <Trash2 size={17} />
                          }
                        </button>

                      </div>

                    </div>

                    <ProgressBar
                      value={item.spent}
                      max={item.limit}
                      tone="auto"
                      label={`${item.category} budget usage`}
                      warnAt={item.alertThreshold}
                      dangerAt={100}
                    />

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-content-muted">

                      <span>
                        {money(Math.max(0, item.remaining))} remaining
                      </span>

                      <span>
                        Alert at {item.alertThreshold}%
                      </span>

                    </div>

                    {(exceeded || warning) && (

                      <div
                        className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium ${
                          exceeded
                            ? 'bg-danger/10 text-danger'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >

                        <AlertTriangle size={15} />

                        {exceeded
                          ? `Budget exceeded by ${money(
                              Math.max(0, item.spent - item.limit)
                            )}`
                          : 'You are approaching this budget limit.'}

                      </div>

                    )}

                    {!exceeded && !warning && (

                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-brand-400">
                        <CheckCircle2 size={15} />
                        Spending is within your planned budget.
                      </div>

                    )}

                  </article>

                );
              })}

            </div>

          )}

        </section>

        {/* CREATE BUDGET */}

        <section className="h-fit rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-xl bg-brand-500/10 p-3 text-brand-400">
              <Plus size={21} />
            </div>

            <div>

              <h2 className="font-semibold text-content">
                Create a budget
              </h2>

              <p className="text-xs text-content-muted">
                Plan your category spending
              </p>

            </div>

          </div>

          <form onSubmit={submit} className="space-y-5">

            <label className="block text-sm font-medium text-content">

              Expense category

              <select
                required
                value={form.category}
                disabled={categoryLoading || categories.length === 0}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                className="mt-2 w-full rounded-xl border border-border bg-surface-overlay px-3 py-3 text-content outline-none transition focus:border-brand-500 disabled:opacity-60"
              >

                {categoryLoading ? (

                  <option value="">Loading categories...</option>

                ) : categories.length === 0 ? (

                  <option value="">No expense categories available</option>

                ) : (

                  categories.map((category) => (

                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>

                  ))

                )}

              </select>

            </label>

            <label className="block text-sm font-medium text-content">

              Monthly spending limit

              <div className="relative mt-2">

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-content-muted">
                  {currencySymbol}
                </span>

                <input
                  required
                  type="number"
                  min="0.01"
                  max="1000000000000"
                  step="0.01"
                  value={form.limit}
                  onChange={(event) =>
                    setForm({ ...form, limit: event.target.value })
                  }
                  placeholder="Enter amount"
                  className="w-full rounded-xl border border-border bg-surface-overlay py-3 pl-8 pr-3 text-content outline-none transition placeholder:text-content-muted focus:border-brand-500"
                />

              </div>

            </label>

            <label className="block text-sm font-medium text-content">

              Spending alert threshold

              <select
                value={form.alertThreshold}
                onChange={(event) =>
                  setForm({ ...form, alertThreshold: event.target.value })
                }
                className="mt-2 w-full rounded-xl border border-border bg-surface-overlay px-3 py-3 text-content outline-none transition focus:border-brand-500"
              >

                <option value="70">70% - Early warning</option>
                <option value="80">80% - Recommended</option>
                <option value="90">90% - Late warning</option>
                <option value="95">95% - Critical warning</option>

              </select>

            </label>

            <button
              type="submit"
              disabled={saving || categoryLoading || categories.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3.5 font-semibold text-on-brand shadow-lg shadow-brand-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >

              {saving ? (

                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving budget...
                </>

              ) : (

                <>
                  <Plus size={18} />
                  Save monthly budget
                </>

              )}

            </button>

          </form>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-brand-500/15 bg-brand-500/5 p-3">

            <ShieldCheck className="mt-0.5 shrink-0 text-brand-400" size={18} />

            <p className="text-xs leading-5 text-content-muted">
              Your budget is linked to your account. Actual spending is
              calculated from expense transactions in the selected month.
            </p>

          </div>

        </section>

      </div>

      {/* ======================================
          SIX-MONTH BUDGET ANALYTICS
      ====================================== */}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

          <div>

            <div className="flex items-center gap-2">

              <Sparkles size={20} className="text-brand-400" />

              <h2 className="text-lg font-semibold text-content">
                Budget Analytics
              </h2>

            </div>

            <p className="mt-1 text-sm text-content-muted">
              Your financial performance over the last six months.
            </p>

          </div>

          <span className="rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-400">
            6 MONTH OVERVIEW
          </span>

        </div>

        {historyLoading ? (

          <div className="flex flex-col items-center justify-center gap-3 py-16">

            <Loader2 size={28} className="animate-spin text-brand-400" />

            <p className="text-sm text-content-muted">
              Loading budget history...
            </p>

          </div>

        ) : (

          <>

            {/* HISTORY SUMMARY */}

            <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-xl border border-border bg-surface-overlay/50 p-4">

                <p className="text-xs text-content-muted">
                  Total budget limits
                </p>

                <p className="mt-2 break-words text-lg font-bold text-content">
                  {money(historyTotals.limit)}
                </p>

              </div>

              <div className="rounded-xl border border-border bg-surface-overlay/50 p-4">

                <p className="text-xs text-content-muted">
                  Spending in budgeted categories
                </p>

                <p className="mt-2 break-words text-lg font-bold text-content">
                  {money(historyTotals.budgetedSpent)}
                </p>

              </div>

              <div className="rounded-xl border border-border bg-surface-overlay/50 p-4">

                <p className="text-xs text-content-muted">
                  Total monthly expenses
                </p>

                <p className="mt-2 break-words text-lg font-bold text-content">
                  {money(historyTotals.actualExpenses)}
                </p>

              </div>

              <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">

                <p className="text-xs text-content-muted">
                  Unbudgeted spending
                </p>

                <p className="mt-2 break-words text-lg font-bold text-warning">
                  {money(historyTotals.unbudgetedSpent)}
                </p>

                <p className="mt-1 text-[10px] text-content-subtle">
                  Expenses outside planned categories
                </p>

              </div>

            </div>

            {/* UNBUDGETED SPENDING BREAKDOWN */}

            <div className="mb-6 rounded-2xl border border-warning/20 bg-warning/5 p-4 sm:p-5">

              <div className="flex flex-wrap items-start justify-between gap-3">

                <div className="flex items-start gap-3">

                  <div className="rounded-xl bg-warning/10 p-2.5 text-warning">
                    <CircleAlert size={19} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-content">
                      Unbudgeted spending
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-content-muted">
                      Expenses recorded in categories that do not have a budget for that month.
                    </p>
                  </div>

                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-warning">
                    {money(historyTotals.unbudgetedSpent)}
                  </p>
                  <p className="mt-1 text-[10px] text-content-muted">
                    Across the six-month period
                  </p>
                </div>

              </div>

              <div className="mt-4 space-y-3">

                {history.some((item) => item.unbudgetedSpent > 0) ? (

                  history.filter((item) => item.unbudgetedSpent > 0).map((item) => (

                    <div
                      key={item.key}
                      className="rounded-xl border border-border/70 bg-surface/70 p-3"
                    >

                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-content">
                          {item.label} {item.key.slice(0, 4)}
                        </p>
                        <p className="text-sm font-bold text-warning">
                          {money(item.unbudgetedSpent)}
                        </p>
                      </div>

                      {item.unbudgetedCategories.length > 0 ? (

                        <div className="flex flex-wrap gap-2">
                          {item.unbudgetedCategories.map((category) => (
                            <span
                              key={`${item.key}-${category.name}`}
                              className="rounded-lg bg-warning/10 px-2.5 py-1 text-xs text-warning"
                            >
                              {category.name}: {money(category.amount)}
                            </span>
                          ))}
                        </div>

                      ) : (

                        <p className="text-xs text-content-muted">
                          Spending occurred outside the categories with saved budgets.
                        </p>

                      )}

                    </div>

                  ))

                ) : (

                  <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-3 text-sm text-brand-400">
                    Great! All recorded expenses are covered by category budgets in this period.
                  </div>

                )}

              </div>

            </div>

            {/* CHART LEGEND */}

            <div className="mb-5 flex flex-wrap gap-5 text-xs text-content-muted">

              <span className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-sm bg-brand-400" />
                Budget limit
              </span>

              <span className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-sm bg-warning" />
                Spending in budgeted categories
              </span>

            </div>

            {/* SIX MONTH CHART */}

            <div className="grid grid-cols-6 gap-2 sm:gap-5">

              {history.map((item) => {

                const limitHeight =
                  (item.limit / historyMax) * 100;

                const spentHeight =
                  (item.budgetedSpent / historyMax) * 100;

                return (

                  <div key={item.key} className="min-w-0">

                    <div className="flex h-44 items-end justify-center gap-1 border-b border-border pb-2 sm:h-52">

                      <div
                        title={`Budget limit: ${money(item.limit)}`}
                        className="w-1/2 max-w-8 rounded-t bg-brand-400 transition-all duration-700"
                        style={{
                          height: item.limit
                            ? `${Math.max(3, limitHeight)}%`
                            : '0%',
                        }}
                      />

                      <div
                        title={`Budgeted category spending: ${money(item.budgetedSpent)}`}
                        className="w-1/2 max-w-8 rounded-t bg-warning transition-all duration-700"
                        style={{
                          height: item.budgetedSpent
                            ? `${Math.max(3, spentHeight)}%`
                            : '0%',
                        }}
                      />

                    </div>

                    <p className="mt-2 truncate text-center text-xs text-content-muted">
                      {item.label}
                    </p>

                    <p className="mt-1 text-center text-[10px] text-content-subtle">
                      {item.limit > 0
                        ? `${getPercentage(item.budgetedSpent, item.limit)}%`
                        : 'No budget'}
                    </p>

                  </div>

                );

              })}

            </div>

            {/* MONTHLY DETAILS */}

            <div className="mt-7 border-t border-border pt-5">

              <h3 className="mb-4 font-semibold text-content">
                Monthly history
              </h3>

              <div className="space-y-3">

                {history.map((item) => (

                  <div
                    key={item.key}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-overlay/50 p-3"
                  >

                    <div>

                      <p className="text-sm font-medium text-content">
                        {item.label} {item.key.slice(0, 4)}
                      </p>

                      <p className="mt-1 text-xs text-content-muted">
                        {item.limit > 0
                          ? `${getPercentage(item.budgetedSpent, item.limit)}% of budget used in budgeted categories`
                          : 'No category budgets created'}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-sm font-semibold text-content">
                        {money(item.budgetedSpent)}
                      </p>

                      <p className="mt-1 text-xs text-content-muted">
                        Budget: {money(item.limit)}
                      </p>

                      <p className="mt-1 text-xs text-warning">
                        Unbudgeted: {money(item.unbudgetedSpent)}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            <p className="mt-5 text-xs leading-5 text-content-muted">
              Historical budget figures are based on saved monthly
              budgets. Spending in budgeted categories is calculated
              from matching expense transactions. Months without
              budgets are shown with zero budget limits.
            </p>

          </>

        )}

      </section>

      {/* ======================================
          SMART BUDGET INSIGHTS
      ====================================== */}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-xl bg-brand-500/10 p-3 text-brand-400">
            <Sparkles size={21} />
          </div>

          <div>

            <h2 className="font-semibold text-content">
              Smart budget insights
            </h2>

            <p className="text-sm text-content-muted">
              Helpful observations about your spending.
            </p>

          </div>

        </div>

        <div className="grid gap-3 md:grid-cols-2">

          {insights.map((insight, index) => {

            const Icon = insight.icon;

            const styles = {
              danger: 'border-danger/20 bg-danger/5 text-danger',
              warning: 'border-warning/20 bg-warning/5 text-warning',
              success: 'border-brand-500/20 bg-brand-500/5 text-brand-400',
              info: 'border-border bg-surface-overlay text-content-muted',
            };

            return (

              <div
                key={index}
                className={`flex items-start gap-3 rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 ${styles[insight.type]}`}
              >

                <Icon className="mt-0.5 shrink-0" size={19} />

                <div>

                  <h3 className="text-sm font-semibold">
                    {insight.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 opacity-80">
                    {insight.description}
                  </p>

                </div>

              </div>

            );

          })}

        </div>

      </section>

    </div>
  );
}

// ==========================================
// REUSABLE PERFORMANCE CARD
// ==========================================

function PerformanceCard({ title, value, detail, icon: Icon, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-500/10 text-brand-400',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div className="rounded-xl border border-border bg-surface-overlay/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-content-muted">{title}</p>
          <p className="mt-2 break-words text-lg font-bold text-content">{value}</p>
        </div>
        <span className={`rounded-lg p-2 ${tones[tone] || tones.brand}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-4 text-content-subtle">{detail}</p>
    </div>
  );
}

// ==========================================
// REUSABLE SUMMARY CARD
// ==========================================

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
}) {

  const tones = {
    brand: 'bg-brand-500/10 text-brand-400',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-brand-500/10 text-brand-400',
    danger: 'bg-danger/10 text-danger',
    purple: 'bg-purple-500/10 text-purple-400',
  };

  return (

    <div className="group rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-lg">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-sm text-content-muted">
            {title}
          </p>

          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-content">
            {value}
          </p>

          <p className="mt-2 text-xs text-content-muted">
            {subtitle}
          </p>

        </div>

        <div className={`rounded-xl p-3 ${tones[tone]}`}>
          <Icon size={21} />
        </div>

      </div>

    </div>

  );
}