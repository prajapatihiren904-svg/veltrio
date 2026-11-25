import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
  Pencil,
  Sparkles,
  ArrowUpRight,
  Trophy,
} from 'lucide-react';

import toast from 'react-hot-toast';

import PageHeader from '@/components/common/PageHeader';
import ProgressBar from '@/components/common/ProgressBar';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

import { goalService } from '@/services/goalService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';

const today = () => new Date().toISOString().slice(0, 10);

const defaultTargetDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return date.toISOString().slice(0, 10);
};

const emptyGoal = () => ({
  name: '',
  description: '',
  targetAmount: '',
  targetDate: defaultTargetDate(),
});

function statusPresentation(status) {
  if (status === 'completed') {
    return {
      label: 'Completed',
      icon: CheckCircle2,
      tone: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    };
  }

  if (status === 'overdue') {
    return {
      label: 'Overdue',
      icon: AlertCircle,
      tone: 'text-danger bg-danger/10 border-danger/20',
    };
  }

  return {
    label: 'Active',
    icon: Clock3,
    tone: 'text-content-muted bg-surface-overlay border-border',
  };
}

function StatCard({ label, value, Icon, description }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5">

      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/[0.04] blur-2xl transition-all duration-500 group-hover:bg-brand-500/10" />

      <div className="relative flex items-center justify-between gap-3">

        <p className="text-sm font-medium text-content-muted">
          {label}
        </p>

        <div className="rounded-xl border border-brand-500/15 bg-brand-500/10 p-2.5">
          <Icon size={19} className="text-brand-400" />
        </div>

      </div>

      <p className="relative mt-4 text-2xl font-bold tracking-tight">
        {value}
      </p>

      {description && (
        <p className="relative mt-1 text-xs text-content-muted">
          {description}
        </p>
      )}

    </div>
  );
}

export default function GoalsPage() {

  // ======================================
  // USER CURRENCY
  // ======================================

  const { user } = useAuth();

  const currency = String(user?.currency || 'INR').toUpperCase();

  const money = (value) =>
    formatCurrency(Number(value) || 0, currency);

  const currencySymbol = useMemo(() => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
      })
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value || currency;
    } catch {
      return currency;
    }
  }, [currency]);

  // ======================================
  // STATES
  // ======================================

  const [goals, setGoals] = useState([]);

  const [totals, setTotals] = useState({
    targetAmount: 0,
    savedAmount: 0,
    remainingAmount: 0,
    completedCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);

  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [goalForm, setGoalForm] = useState(emptyGoal);

  const [contributionForm, setContributionForm] = useState({
    amount: '',
    note: '',
    date: today(),
  });

  // ======================================
  // LOAD GOALS
  // ======================================

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const result = await goalService.list();

      setGoals(result.items || []);

      setTotals(
        result.totals || {
          targetAmount: 0,
          savedAmount: 0,
          remainingAmount: 0,
          completedCount: 0,
        }
      );

    } catch (error) {
      toast.error(error.message || 'Could not load savings goals');

    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    load();
  }, [load]);

  // ======================================
  // CREATE GOAL
  // ======================================

  const openCreate = () => {
    setEditingGoal(null);
    setGoalForm(emptyGoal());
    setGoalModalOpen(true);
  };

  // ======================================
  // EDIT GOAL
  // ======================================

  const openEdit = (goal) => {
    setEditingGoal(goal);

    setGoalForm({
      name: goal.name,
      description: goal.description || '',
      targetAmount: String(goal.targetAmount),
      targetDate: new Date(goal.targetDate).toISOString().slice(0, 10),
    });

    setGoalModalOpen(true);
  };

  // ======================================
  // SAVE GOAL
  // ======================================

  const saveGoal = async (event) => {
    event.preventDefault();

    if (
      !goalForm.name.trim() ||
      Number(goalForm.targetAmount) <= 0 ||
      !goalForm.targetDate
    ) {
      toast.error('Enter a goal name, valid target amount and target date');
      return;
    }

    if (
      editingGoal &&
      Number(goalForm.targetAmount) <
        Number(editingGoal.savedAmount)
    ) {
      toast.error('Target amount cannot be lower than the amount already saved');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...goalForm,
        name: goalForm.name.trim(),
        targetAmount: Number(goalForm.targetAmount),
      };

      if (editingGoal) {
        await goalService.update(editingGoal._id, payload);
      } else {
        await goalService.create(payload);
      }

      toast.success(editingGoal ? 'Goal updated' : 'Savings goal created');

      setGoalModalOpen(false);

      await load();

    } catch (error) {
      toast.error(error.message || 'Could not save goal');

    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // ADD CONTRIBUTION
  // ======================================

  const openContribution = (goal) => {
    setSelectedGoal(goal);

    setContributionForm({
      amount: '',
      note: '',
      date: today(),
    });

    setContributionModalOpen(true);
  };

  // ======================================
  // SAVE CONTRIBUTION
  // ======================================

  const saveContribution = async (event) => {
    event.preventDefault();

    if (Number(contributionForm.amount) <= 0) {
      toast.error('Enter a contribution greater than zero');
      return;
    }

    if (
      Number(contributionForm.amount) >
      Number(selectedGoal?.remainingAmount)
    ) {
      toast.error('Contribution cannot exceed the remaining amount');
      return;
    }

    setSaving(true);

    try {
      await goalService.contribute(selectedGoal._id, {
        amount: Number(contributionForm.amount),
        note: contributionForm.note,
        date: contributionForm.date,
      });

      toast.success('Savings contribution added');

      setContributionModalOpen(false);

      await load();

    } catch (error) {
      toast.error(error.message || 'Could not add contribution');

    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // DELETE GOAL
  // ======================================

  const removeGoal = async (goal) => {

    if (
      !window.confirm(
        `Delete "${goal.name}" and its contribution history? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await goalService.remove(goal._id);

      toast.success('Goal deleted');

      await load();

    } catch (error) {
      toast.error(error.message || 'Could not delete goal');
    }
  };

  // ======================================
  // OVERALL PROGRESS
  // ======================================

  const averageProgress = useMemo(() => {

    if (totals.targetAmount <= 0) return 0;

    return Math.min(
      100,
      Math.round(
        (totals.savedAmount / totals.targetAmount) * 100
      )
    );

  }, [totals]);

  const activeGoals = goals.filter(
    (goal) => goal.status !== 'completed'
  ).length;

  // ======================================
  // UI
  // ======================================

  return (
    <div className="relative space-y-7">

      {/* PAGE HEADER */}

      <PageHeader
        title="Savings goals"
        description="Turn your plans into progress, one contribution at a time."
        actions={
          <Button onClick={openCreate}>
            <Plus size={17} />
            New goal
          </Button>
        }
      />

      {/* SUMMARY CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total targets"
          value={money(totals.targetAmount)}
          Icon={Target}
          description={`${goals.length} savings goals`}
        />

        <StatCard
          label="Total saved"
          value={money(totals.savedAmount)}
          Icon={Wallet}
          description={`${averageProgress}% of total targets`}
        />

        <StatCard
          label="Still to save"
          value={money(totals.remainingAmount)}
          Icon={TrendingUp}
          description="Remaining savings amount"
        />

        <StatCard
          label="Goals completed"
          value={String(totals.completedCount)}
          Icon={Trophy}
          description={`${activeGoals} goals in progress`}
        />

      </div>

      {/* OVERALL SAVINGS PROGRESS */}

      {goals.length > 0 && (

        <section className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-500/[0.10] via-surface to-surface p-5 sm:p-6">

          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-500/[0.08] blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Sparkles size={17} className="text-brand-400" />

                <p className="text-sm font-semibold">
                  Overall savings progress
                </p>

              </div>

              <p className="mt-2 text-sm text-content-muted">
                Every contribution brings you closer to your financial goals.
              </p>

            </div>

            <div className="sm:text-right">

              <p className="text-3xl font-bold text-brand-400">
                {averageProgress}%
              </p>

              <p className="mt-1 text-xs text-content-muted">
                Overall completed
              </p>

            </div>

          </div>

          <ProgressBar
            value={totals.savedAmount}
            max={totals.targetAmount}
            tone="brand"
            label="Overall savings progress"
            className="relative mt-5"
          />

          <div className="relative mt-3 flex flex-wrap justify-between gap-2 text-xs text-content-muted">

            <span>
              Saved: {money(totals.savedAmount)}
            </span>

            <span>
              Target: {money(totals.targetAmount)}
            </span>

          </div>

        </section>

      )}

      {/* LOADING STATE */}

      {loading ? (

        <div className="rounded-2xl border border-border bg-surface px-5 py-16 text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-brand-500/20 border-t-brand-400" />

          <p className="text-sm font-medium">
            Loading your savings goals...
          </p>

          <p className="mt-1 text-xs text-content-muted">
            Preparing your financial progress.
          </p>

        </div>

      ) : goals.length === 0 ? (

        /* EMPTY STATE */

        <section className="relative overflow-hidden rounded-3xl border border-dashed border-brand-500/20 bg-surface px-5 py-16 text-center sm:py-20">

          <div className="pointer-events-none absolute inset-0 opacity-40">

            <div className="absolute left-[15%] top-[20%] h-32 w-32 rounded-full bg-brand-500/10 blur-3xl" />

            <div className="absolute bottom-[10%] right-[15%] h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />

          </div>

          <div className="relative mx-auto flex max-w-xl flex-col items-center">

            <div className="relative mb-7 flex h-24 w-24 items-center justify-center">

              <div className="absolute inset-0 animate-pulse rounded-full border border-brand-500/20" />

              <div className="absolute inset-3 rounded-full border border-brand-500/30" />

              <div className="absolute inset-6 rounded-full border border-brand-500/40" />

              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10 shadow-lg shadow-brand-500/10">

                <Target size={27} className="text-brand-400" />

              </div>

            </div>

            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">

              <Sparkles size={13} />

              Start your savings journey

            </span>

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Your next big goal starts here.
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-content-muted">
              Whether it's a new laptop, an emergency fund, a dream vacation
              or something special, turn your plans into achievable milestones.
            </p>

            <Button className="mt-7" onClick={openCreate}>
              <Plus size={17} />
              Create your first goal
            </Button>

            <p className="mt-4 text-xs text-content-muted">
              Small steps today. Bigger achievements tomorrow.
            </p>

          </div>

        </section>

      ) : (

        /* GOAL CARDS */

        <section className="space-y-4">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>

              <h2 className="text-lg font-semibold">
                Your goals
              </h2>

              <p className="mt-1 text-sm text-content-muted">
                Track your savings and celebrate every milestone.
              </p>

            </div>

            <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-content-muted">
              {goals.length} {goals.length === 1 ? 'Goal' : 'Goals'}
            </span>

          </div>

          <div className="grid gap-5 lg:grid-cols-2">

            {goals.map((goal) => {

              const status = statusPresentation(goal.status);
              const StatusIcon = status.icon;

              const progress = Math.min(
                100,
                Math.max(0, Number(goal.percent) || 0)
              );

              return (

                <article
                  key={goal._id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/[0.04] sm:p-6"
                >

                  <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-brand-500/80 via-brand-400/40 to-transparent" />

                  {/* GOAL HEADER */}

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-start gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10">

                        <Target size={21} className="text-brand-400" />

                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="truncate text-lg font-semibold">
                            {goal.name}
                          </h2>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.tone}`}
                          >
                            <StatusIcon size={12} />
                            {status.label}
                          </span>

                        </div>

                        {goal.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-content-muted">
                            {goal.description}
                          </p>
                        )}

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex shrink-0 items-center gap-1">

                      <button
                        type="button"
                        onClick={() => openEdit(goal)}
                        className="rounded-lg p-2 text-content-muted transition hover:bg-brand-500/10 hover:text-brand-400"
                        aria-label={`Edit ${goal.name}`}
                        title="Edit goal"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeGoal(goal)}
                        className="rounded-lg p-2 text-content-muted transition hover:bg-danger/10 hover:text-danger"
                        aria-label={`Delete ${goal.name}`}
                        title="Delete goal"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>

                  {/* SAVED AMOUNT */}

                  <div className="mt-7 flex items-end justify-between gap-3">

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wider text-content-muted">
                        Saved so far
                      </p>

                      <p className="mt-2 text-2xl font-bold tracking-tight">
                        {money(goal.savedAmount)}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-xs text-content-muted">
                        Progress
                      </p>

                      <p className="mt-1 text-xl font-bold text-brand-400">
                        {progress}%
                      </p>

                    </div>

                  </div>

                  {/* PROGRESS BAR */}

                  <ProgressBar
                    value={goal.savedAmount}
                    max={goal.targetAmount}
                    tone="brand"
                    label={`${goal.name} savings progress`}
                    className="mt-4"
                  />

                  {/* TARGET DETAILS */}

                  <div className="mt-3 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-surface-overlay/70 p-3">

                      <p className="text-[11px] text-content-muted">
                        Target amount
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {money(goal.targetAmount)}
                      </p>

                    </div>

                    <div className="rounded-xl bg-surface-overlay/70 p-3">

                      <p className="text-[11px] text-content-muted">
                        Remaining amount
                      </p>

                      <p className="mt-1 text-sm font-semibold text-brand-400">
                        {money(goal.remainingAmount)}
                      </p>

                    </div>

                  </div>

                  {/* FOOTER */}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">

                    <span className="inline-flex items-center gap-1.5 text-xs text-content-muted">

                      <CalendarDays size={14} />

                      Due {formatDate(goal.targetDate)}

                    </span>

                    {goal.status !== 'completed' ? (

                      <Button
                        size="sm"
                        onClick={() => openContribution(goal)}
                      >
                        <Plus size={15} />
                        Add savings
                      </Button>

                    ) : (

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-400">

                        <CheckCircle2 size={15} />
                        Goal reached

                      </span>

                    )}

                  </div>

                  {/* CONTRIBUTION HISTORY */}

                  {goal.contributions?.length > 0 && (

                    <details className="mt-4 border-t border-border pt-4">

                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-content-muted transition hover:text-brand-400">

                        <span>
                          Contribution history ({goal.contributions.length})
                        </span>

                        <ArrowUpRight size={15} />

                      </summary>

                      <div className="mt-4 max-h-44 space-y-2 overflow-y-auto pr-1">

                        {[...goal.contributions]
                          .reverse()
                          .map((entry) => (

                            <div
                              key={entry._id}
                              className="flex items-center justify-between gap-3 rounded-xl bg-surface-overlay/60 px-3 py-3"
                            >

                              <div className="flex min-w-0 items-center gap-2">

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10">

                                  <CircleDollarSign
                                    size={16}
                                    className="text-brand-400"
                                  />

                                </div>

                                <div className="min-w-0">

                                  <p className="truncate text-xs font-medium">
                                    {entry.note || 'Savings contribution'}
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-content-muted">
                                    {formatDate(entry.date)}
                                  </p>

                                </div>

                              </div>

                              <span className="shrink-0 text-sm font-semibold text-brand-400">
                                +{money(entry.amount)}
                              </span>

                            </div>

                          ))}

                      </div>

                    </details>

                  )}

                </article>

              );

            })}

          </div>

        </section>

      )}

      {/* CREATE / EDIT GOAL MODAL */}

      <Modal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title={editingGoal ? 'Edit savings goal' : 'Create savings goal'}
        description="Choose a clear target and a date to work towards."
      >

        <form onSubmit={saveGoal} className="space-y-4">

          <label className="block text-sm font-medium">

            Goal name

            <input
              required
              minLength="2"
              maxLength="60"
              value={goalForm.name}
              onChange={(e) =>
                setGoalForm({ ...goalForm, name: e.target.value })
              }
              placeholder="e.g. Emergency fund"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-overlay px-3 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />

          </label>

          <label className="block text-sm font-medium">

            Description (optional)

            <textarea
              maxLength="240"
              rows="3"
              value={goalForm.description}
              onChange={(e) =>
                setGoalForm({ ...goalForm, description: e.target.value })
              }
              placeholder="What are you saving for?"
              className="mt-1.5 w-full resize-none rounded-xl border border-border bg-surface-overlay px-3 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />

          </label>

          <label className="block text-sm font-medium">

            Target amount ({currencySymbol})

            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={goalForm.targetAmount}
              onChange={(e) =>
                setGoalForm({
                  ...goalForm,
                  targetAmount: e.target.value,
                })
              }
              placeholder="e.g. 50000"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-overlay px-3 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />

          </label>

          <label className="block text-sm font-medium">

            Target date

            <input
              required
              type="date"
              min={editingGoal ? undefined : today()}
              value={goalForm.targetDate}
              onChange={(e) =>
                setGoalForm({
                  ...goalForm,
                  targetDate: e.target.value,
                })
              }
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-overlay px-3 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />

          </label>

          {editingGoal &&
            Number(goalForm.targetAmount) <
              Number(editingGoal.savedAmount) && (

              <p className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-xs text-danger">
                Target cannot be lower than the amount already saved (
                {money(editingGoal.savedAmount)}).
              </p>

            )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">

            <Button
              type="button"
              variant="secondary"
              onClick={() => setGoalModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={saving}
              disabled={
                saving ||
                (editingGoal &&
                  Number(goalForm.targetAmount) <
                    Number(editingGoal.savedAmount))
              }
            >
              {editingGoal ? 'Save changes' : 'Create goal'}
            </Button>

          </div>

        </form>

      </Modal>

      {/* ADD CONTRIBUTION MODAL */}

      <Modal
        isOpen={contributionModalOpen}
        onClose={() => setContributionModalOpen(false)}
        title="Add savings"
        description={
          selectedGoal
            ? `${selectedGoal.name} · ${money(selectedGoal.remainingAmount)} remaining`
            : ''
        }
      >

        <form onSubmit={saveContribution} className="space-y-4">

          <label className="block text-sm font-medium">

            Contribution amount ({currencySymbol})

            <input
              required
              type="number"
              min="0.01"
              max={selectedGoal?.remainingAmount || undefined}
              step="0.01"
              value={contributionForm.amount}
              onChange={(e) =>
                setContributionForm({
                  ...contributionForm,
                  amount: e.target.value,
                })
              }
              placeholder="e.g. 1000"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-overlay px-3 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />

          </label>

          <label className="block text-sm font-medium">

            Date

            <input
              type="date"
              value={contributionForm.date}
              max={today()}
              onChange={(e) =>
                setContributionForm({
                  ...contributionForm,
                  date: e.target.value,
                })
              }
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-overlay px-3 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />

          </label>

          <label className="block text-sm font-medium">

            Note (optional)

            <input
              maxLength="160"
              value={contributionForm.note}
              onChange={(e) =>
                setContributionForm({
                  ...contributionForm,
                  note: e.target.value,
                })
              }
              placeholder="e.g. Monthly savings"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-overlay px-3 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />

          </label>

          <div className="flex justify-end gap-2 border-t border-border pt-4">

            <Button
              type="button"
              variant="secondary"
              onClick={() => setContributionModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={saving}
              disabled={
                saving ||
                Number(contributionForm.amount) <= 0 ||
                Number(contributionForm.amount) >
                  Number(selectedGoal?.remainingAmount || 0)
              }
            >
              Add contribution
            </Button>

          </div>

        </form>

      </Modal>

    </div>
  );
}