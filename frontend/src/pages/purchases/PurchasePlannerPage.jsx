import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ShoppingBag,
  Wallet,
  CreditCard,
  TrendingUp,
  Plus,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Search,
  Sparkles,
  ArrowUpRight,
  Package,
  X,
  RefreshCw,
  History,
} from 'lucide-react';

import toast from 'react-hot-toast';

import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';

import { purchaseService } from '@/services/purchaseService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';

const today = () => new Date().toISOString().slice(0, 10);

const emptyPurchase = () => ({
  productName: '',
  category: 'electronics',
  description: '',
  totalPrice: '',
  initialPaidAmount: '',
  paymentFrequency: 'full',
  installmentAmount: '',
  customIntervalDays: '30',
  startDate: today(),
});

const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'home_appliances', label: 'Home Appliances' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'travel', label: 'Travel' },
  { value: 'other', label: 'Other' },
];

function StatCard({ title, value, description, icon: Icon, tone }) {
  return (
    <article className="purchase-stat group relative min-w-0 overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/[0.07] blur-3xl transition-all duration-500 group-hover:bg-emerald-400/[0.16]" />

      <div className="relative flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-content-muted">
          {title}
        </p>

        <div className={`rounded-xl border p-2.5 ${tone}`}>
          <Icon size={19} />
        </div>
      </div>

      <p className="relative mt-5 break-words text-2xl font-bold tracking-tight sm:text-3xl">
        {value}
      </p>

      <p className="relative mt-2 text-xs text-content-muted">
        {description}
      </p>
    </article>
  );
}

function Progress({ value }) {
  const percentage = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className="purchase-progress h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block min-w-0 text-sm font-medium text-content">
      {label}
      {children}
    </label>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`mt-2 w-full min-w-0 rounded-xl border border-white/10 bg-[#101816]/90 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 ${className}`}
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="mt-2 w-full min-w-0 rounded-xl border border-white/10 bg-[#101816]/90 px-3.5 py-3 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
    >
      {children}
    </select>
  );
}

export default function PurchasePlannerPage() {
  const { user } = useAuth();

  const currency = String(user?.currency || 'INR').toUpperCase();

  const money = (amount) =>
    formatCurrency(Number(amount) || 0, currency);

  const [purchases, setPurchases] = useState([]);
  const [totals, setTotals] = useState({
    totalPurchaseValue: 0,
    totalPaid: 0,
    outstandingAmount: 0,
    activePurchases: 0,
    completedPurchases: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [editingPurchase, setEditingPurchase] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [form, setForm] = useState(emptyPurchase);

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: today(),
    note: '',
  });

  // ======================================
  // LOAD PURCHASES
  // ======================================

  const loadPurchases = useCallback(async () => {
    setLoading(true);

    try {
      const result = await purchaseService.list();

      setPurchases(result.items || []);

      setTotals(
        result.totals || {
          totalPurchaseValue: 0,
          totalPaid: 0,
          outstandingAmount: 0,
          activePurchases: 0,
          completedPurchases: 0,
        }
      );
    } catch (error) {
      toast.error(error.message || 'Could not load purchases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  // ======================================
  // FILTER PURCHASES
  // ======================================

  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      const matchesSearch =
        purchase.productName
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' ||
        purchase.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        purchase.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [purchases, search, categoryFilter, statusFilter]);

  // ======================================
  // UPCOMING PAYMENTS
  // ======================================

  const upcomingPayments = useMemo(() => {
    return purchases
      .flatMap((purchase) =>
        (purchase.payments || [])
          .filter((payment) => payment.status !== 'paid')
          .map((payment) => ({
            ...payment,
            productName: purchase.productName,
            purchaseId: purchase._id,
          }))
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate) - new Date(b.dueDate)
      )
      .slice(0, 5);
  }, [purchases]);

    // ======================================
  // PAYMENT HISTORY
  // ======================================

  const paymentHistory = useMemo(() => {
    return purchases
      .flatMap((purchase) => {
        const history = [];

        // Initial / down payment
        if (Number(purchase.initialPaidAmount) > 0) {
          history.push({
            id: `${purchase._id}-initial`,
            productName: purchase.productName,
            amount: purchase.initialPaidAmount,
            paidDate: purchase.startDate,
            note: 'Initial / down payment',
            type: 'initial',
          });
        }

        // Recorded installment payments
        (purchase.payments || [])
          .filter(
            (payment) =>
              payment.status === 'paid' && payment.paidDate
          )
          .forEach((payment) => {
            history.push({
              id: payment._id,
              productName: purchase.productName,
              amount: payment.amount,
              paidDate: payment.paidDate,
              note: payment.note || 'Installment payment',
              type: 'installment',
            });
          });

        return history;
      })
      .sort(
        (a, b) =>
          new Date(b.paidDate) - new Date(a.paidDate)
      );
  }, [purchases]);

  const monthlyCommitment = useMemo(() => {
    return purchases.reduce((sum, purchase) => {
      if (purchase.paymentFrequency === 'monthly') {
        return sum + Number(purchase.installmentAmount || 0);
      }

      if (purchase.paymentFrequency === 'weekly') {
        return sum + Number(purchase.installmentAmount || 0) * 4.33;
      }

      if (purchase.paymentFrequency === 'custom') {
        const days = Number(purchase.customIntervalDays || 30);

        return sum +
          Number(purchase.installmentAmount || 0) *
          (30 / days);
      }

      return sum;
    }, 0);
  }, [purchases]);

  // ======================================
  // OPEN CREATE FORM
  // ======================================

  const openCreate = () => {
    setEditingPurchase(null);
    setForm(emptyPurchase());
    setPurchaseModalOpen(true);
  };

  // ======================================
  // OPEN EDIT FORM
  // ======================================

  const openEdit = (purchase) => {
    setEditingPurchase(purchase);

    setForm({
      productName: purchase.productName,
      category: purchase.category,
      description: purchase.description || '',
      totalPrice: String(purchase.totalPrice),
      initialPaidAmount: String(purchase.initialPaidAmount),
      paymentFrequency: purchase.paymentFrequency,
      installmentAmount: String(purchase.installmentAmount || ''),
      customIntervalDays: String(purchase.customIntervalDays || 30),
      startDate: new Date(purchase.startDate).toISOString().slice(0, 10),
    });

    setPurchaseModalOpen(true);
  };

  // ======================================
  // SAVE PURCHASE
  // ======================================

  const savePurchase = async (event) => {
    event.preventDefault();

    const total = Number(form.totalPrice);
    const initial = Number(form.initialPaidAmount || 0);

    if (!form.productName.trim() || total <= 0) {
      toast.error('Enter a valid product name and price');
      return;
    }

    if (initial < 0 || initial > total) {
      toast.error('Initial payment cannot exceed total price');
      return;
    }

    if (form.paymentFrequency === 'full' && initial !== total) {
      toast.error('For full payment, paid amount must equal total price');
      return;
    }

    if (
      form.paymentFrequency !== 'full' &&
      total > initial &&
      Number(form.installmentAmount) <= 0
    ) {
      toast.error('Enter a valid installment amount');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        productName: form.productName.trim(),
        totalPrice: total,
        initialPaidAmount: initial,
        installmentAmount: Number(form.installmentAmount || 0),
        customIntervalDays: Number(form.customIntervalDays || 30),
      };

      if (editingPurchase) {
        await purchaseService.update(editingPurchase._id, payload);
        toast.success('Purchase updated successfully');
      } else {
        await purchaseService.create(payload);
        toast.success('Purchase added successfully');
      }

      setPurchaseModalOpen(false);
      await loadPurchases();
    } catch (error) {
      toast.error(error.message || 'Could not save purchase');
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // OPEN PAYMENT FORM
  // ======================================

  const openPayment = (purchase) => {
    const nextPayment = purchase.payments?.find(
      (payment) => payment.status !== 'paid'
    );

    if (!nextPayment) {
      toast.error('No pending installment found');
      return;
    }

    setSelectedPurchase(purchase);

    setPaymentForm({
      amount: String(nextPayment.originalAmount ?? nextPayment.amount),
      date: today(),
      note: '',
    });

    setPaymentModalOpen(true);
  };

  // ======================================
  // RECORD PAYMENT
  // ======================================

  const savePayment = async (event) => {
    event.preventDefault();

    if (!selectedPurchase || Number(paymentForm.amount) <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }

    setSaving(true);

    try {
      await purchaseService.recordPayment(selectedPurchase._id, {
        amount: Number(paymentForm.amount),
        date: paymentForm.date,
        note: paymentForm.note,
      });

      toast.success('Payment recorded successfully');

      setPaymentModalOpen(false);
      await loadPurchases();
    } catch (error) {
      toast.error(error.message || 'Could not record payment');
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // DELETE PURCHASE
  // ======================================

  const deletePurchase = async (purchase) => {
    const confirmed = window.confirm(
      `Delete "${purchase.productName}" and its payment history?`
    );

    if (!confirmed) return;

    try {
      await purchaseService.remove(purchase._id);

      toast.success('Purchase deleted');

      await loadPurchases();
    } catch (error) {
      toast.error(error.message || 'Could not delete purchase');
    }
  };

  // ======================================
  // CATEGORY LABEL
  // ======================================

  const categoryName = (value) =>
    categories.find((category) => category.value === value)?.label || 'Other';

  // ======================================
  // UI
  // ======================================

  return (
    <div className="purchase-planner relative min-w-0 space-y-7">

      <PageHeader
        title="Purchase Planner"
        description="Track your purchases, manage installments and stay ahead of your financial commitments."
        actions={
          <Button onClick={openCreate}>
            <Plus size={17} />
            Add Purchase
          </Button>
        }
      />

      {/* SUMMARY */}

      <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Purchase Value"
          value={money(totals.totalPurchaseValue)}
          description={`${purchases.length} purchases recorded`}
          icon={ShoppingBag}
          tone="border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
        />

        <StatCard
          title="Total Amount Paid"
          value={money(totals.totalPaid)}
          description="Including initial and installment payments"
          icon={Wallet}
          tone="border-sky-400/20 bg-sky-400/10 text-sky-400"
        />

        <StatCard
          title="Outstanding Balance"
          value={money(totals.outstandingAmount)}
          description="Amount remaining to be paid"
          icon={CreditCard}
          tone="border-amber-400/20 bg-amber-400/10 text-amber-400"
        />

        <StatCard
          title="Active Purchases"
          value={String(totals.activePurchases)}
          description={`${totals.completedPurchases} purchases completed`}
          icon={TrendingUp}
          tone="border-purple-400/20 bg-purple-400/10 text-purple-400"
        />

      </section>

      {/* INSIGHTS */}

      <section className="purchase-glass relative overflow-hidden rounded-2xl border p-5 sm:p-6">

        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-400/[0.08] blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-400" />
              <h2 className="font-semibold">
                Purchase Financial Insights
              </h2>
            </div>

            <p className="mt-2 text-sm text-content-muted">
              Understand your upcoming financial commitments.
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-content-muted">
              Estimated monthly commitment
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {money(monthlyCommitment)}
            </p>
          </div>

        </div>

        <div className="relative mt-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="text-xs text-content-muted">
              Overall paid
            </p>
            <p className="mt-2 text-lg font-semibold">
              {money(totals.totalPaid)}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="text-xs text-content-muted">
              Remaining balance
            </p>
            <p className="mt-2 text-lg font-semibold text-amber-400">
              {money(totals.outstandingAmount)}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="text-xs text-content-muted">
              Purchase completion
            </p>
            <p className="mt-2 text-lg font-semibold text-emerald-400">
              {totals.totalPurchaseValue > 0
                ? Math.round(
                    (totals.totalPaid / totals.totalPurchaseValue) * 100
                  )
                : 0}%
            </p>
          </div>

        </div>

      </section>

      {/* UPCOMING PAYMENTS */}

      <section className="purchase-glass overflow-hidden rounded-2xl border">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6">

          <div>
            <h2 className="font-semibold">
              Upcoming Payments
            </h2>

            <p className="mt-1 text-xs text-content-muted">
              Your next scheduled installment commitments.
            </p>
          </div>

          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
            {upcomingPayments.length} upcoming
          </span>

        </div>

        {upcomingPayments.length === 0 ? (

          <div className="px-5 py-9 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="mt-3 text-sm font-medium">
              No pending installments
            </p>
            <p className="mt-1 text-xs text-content-muted">
              Your upcoming payments will appear here.
            </p>
          </div>

        ) : (

          <div className="divide-y divide-white/[0.06]">

            {upcomingPayments.map((payment) => (

              <div
                key={payment._id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-emerald-400/[0.025] sm:px-6"
              >

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-400">
                    <CalendarDays size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {payment.productName}
                    </p>

                    <p className="mt-1 text-xs text-content-muted">
                      Due {formatDate(payment.dueDate)}
                    </p>
                  </div>

                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {money(payment.amount)}
                  </p>

                  <span className={`mt-1 inline-flex items-center gap-1 text-xs ${
                    payment.status === 'overdue'
                      ? 'text-danger'
                      : 'text-amber-400'
                  }`}>
                    {payment.status === 'overdue'
                      ? <AlertCircle size={12} />
                      : <Clock3 size={12} />}
                    {payment.status}
                  </span>
                </div>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* PURCHASE LIST */}

      <section className="space-y-4">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              Your Purchases
            </h2>

            <p className="mt-1 text-sm text-content-muted">
              Manage and track everything you have purchased.
            </p>
          </div>

          <Button variant="secondary" size="sm" onClick={loadPurchases}>
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>

              {/* PAYMENT HISTORY */}

      <section className="purchase-glass overflow-hidden rounded-2xl border">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6">

          <div>
            <div className="flex items-center gap-2">
              <History size={18} className="text-emerald-400" />
              <h2 className="font-semibold">
                Payment History
              </h2>
            </div>

            <p className="mt-1 text-xs text-content-muted">
              Track all your recorded purchase payments.
            </p>
          </div>

          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
            {paymentHistory.length} payments
          </span>

        </div>

        {paymentHistory.length === 0 ? (

          <div className="px-5 py-10 text-center">

            <Wallet className="mx-auto h-9 w-9 text-content-muted" />

            <h3 className="mt-3 font-semibold">
              No payment history yet
            </h3>

            <p className="mt-1 text-sm text-content-muted">
              Your completed payments will appear here.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-white/[0.06]">

            {paymentHistory.map((payment) => (

              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-emerald-400/[0.025] sm:px-6"
              >

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                    <CheckCircle2 size={19} />
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold">
                      {payment.productName}
                    </p>

                    <p className="mt-1 text-xs text-content-muted">
                      {payment.note}
                    </p>

                    <p className="mt-1 text-xs text-content-muted">
                      {formatDate(payment.paidDate)}
                    </p>

                  </div>

                </div>

                <div className="text-right">

                  <p className="font-semibold text-emerald-400">
                    {money(payment.amount)}
                  </p>

                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 size={12} />
                    Paid
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

        {/* FILTERS */}

        <div className="purchase-glass grid gap-3 rounded-2xl border p-4 md:grid-cols-3">

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-[22px] text-content-muted"
            />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search purchases..."
              className="pl-9"
              aria-label="Search purchases"
            />
          </div>

          <Select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
          </Select>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="purchase-glass rounded-2xl border p-12 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />
            <p className="mt-4 text-sm text-content-muted">
              Loading your purchases...
            </p>
          </div>

        ) : filteredPurchases.length === 0 ? (

          <div className="purchase-glass relative overflow-hidden rounded-3xl border border-dashed p-10 text-center sm:p-16">

            <div className="pointer-events-none absolute left-[15%] top-[15%] h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative mx-auto flex max-w-md flex-col items-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                <Package size={30} />
              </div>

              <h3 className="mt-5 text-xl font-bold">
                {purchases.length === 0
                  ? 'Start tracking your purchases'
                  : 'No matching purchases found'}
              </h3>

              <p className="mt-2 text-sm leading-6 text-content-muted">
                {purchases.length === 0
                  ? 'Add your first purchase and keep all your payment commitments organized in one place.'
                  : 'Try changing your search or filters.'}
              </p>

              {purchases.length === 0 && (
                <Button className="mt-6" onClick={openCreate}>
                  <Plus size={16} />
                  Add your first purchase
                </Button>
              )}

            </div>

          </div>

        ) : (

          <div className="grid min-w-0 gap-5 xl:grid-cols-2">

            {filteredPurchases.map((purchase) => {

              const progress = Number(purchase.progress || 0);

              const nextPayment = purchase.payments?.find(
                (payment) => payment.status !== 'paid'
              );

              return (

                <article
                  key={purchase._id}
                  className="purchase-glass purchase-item group relative min-w-0 overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 sm:p-6"
                >

                  <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-300/50 to-transparent" />

                  {/* HEADER */}

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-start gap-3">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                        <ShoppingBag size={22} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {purchase.productName}
                        </h3>

                        <p className="mt-1 text-xs text-content-muted">
                          {categoryName(purchase.category)}
                        </p>

                        <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                          purchase.status === 'completed'
                            ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400'
                            : purchase.status === 'overdue'
                              ? 'border-red-400/20 bg-red-400/10 text-red-400'
                              : 'border-amber-400/20 bg-amber-400/10 text-amber-400'
                        }`}>
                          {purchase.status}
                        </span>
                      </div>

                    </div>

                    <div className="flex shrink-0 gap-1">

                      <button
                        type="button"
                        onClick={() => openEdit(purchase)}
                        className="rounded-lg p-2 text-content-muted transition hover:bg-emerald-400/10 hover:text-emerald-400"
                        aria-label={`Edit ${purchase.productName}`}
                        title="Edit purchase"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => deletePurchase(purchase)}
                        className="rounded-lg p-2 text-content-muted transition hover:bg-red-400/10 hover:text-red-400"
                        aria-label={`Delete ${purchase.productName}`}
                        title="Delete purchase"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>

                  {/* AMOUNT */}

                  <div className="mt-7 grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs text-content-muted">
                        Total price
                      </p>

                      <p className="mt-2 break-words text-xl font-bold">
                        {money(purchase.totalPrice)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-content-muted">
                        Remaining
                      </p>

                      <p className="mt-2 break-words text-xl font-bold text-amber-400">
                        {money(purchase.remainingAmount)}
                      </p>
                    </div>

                  </div>

                  {/* PROGRESS */}

                  <div className="mt-6">

                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-content-muted">
                        Payment progress
                      </span>

                      <span className="text-sm font-bold text-emerald-400">
                        {progress}%
                      </span>
                    </div>

                    <Progress value={progress} />

                    <div className="mt-3 flex justify-between gap-2 text-xs text-content-muted">
                      <span>Paid: {money(purchase.totalPaid)}</span>
                      <span>Remaining: {money(purchase.remainingAmount)}</span>
                    </div>

                  </div>

                  {/* PAYMENT DETAILS */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                      <p className="text-[11px] text-content-muted">
                        Payment frequency
                      </p>

                      <p className="mt-1 text-sm font-semibold capitalize">
                        {purchase.paymentFrequency}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                      <p className="text-[11px] text-content-muted">
                        Installment
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {purchase.installmentAmount
                          ? money(purchase.installmentAmount)
                          : 'Full payment'}
                      </p>
                    </div>

                  </div>

                  {/* FOOTER */}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">

                    <div className="min-w-0">
                      {nextPayment ? (
                        <>
                          <p className="text-[11px] text-content-muted">
                            Next payment
                          </p>

                          <p className="mt-1 text-xs font-medium">
                            {formatDate(nextPayment.dueDate)}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-emerald-400">
                          Fully paid
                        </span>
                      )}
                    </div>

                    {nextPayment && (
                      <Button
                        size="sm"
                        onClick={() => openPayment(purchase)}
                      >
                        <CheckCircle2 size={15} />
                        Record Payment
                      </Button>
                    )}

                  </div>

                </article>

              );
            })}

          </div>

        )}

      </section>

      {/* CREATE / EDIT PURCHASE MODAL */}

      <Modal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        title={editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}
        description="Enter your purchase details and payment plan."
      >

        <form onSubmit={savePurchase} className="space-y-4">

          <Field label="Product name">
            <Input
              required
              minLength={2}
              maxLength={100}
              value={form.productName}
              onChange={(event) =>
                setForm({ ...form, productName: event.target.value })
              }
              placeholder="e.g. iPhone 17"
            />
          </Field>

          <Field label="Category">
            <Select
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={`Total purchase price (${currency})`}>
            <Input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={form.totalPrice}
              onChange={(event) =>
                setForm({ ...form, totalPrice: event.target.value })
              }
              placeholder="80000"
            />
          </Field>

          <Field label={`Already paid / Down payment (${currency})`}>
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.initialPaidAmount}
              onChange={(event) =>
                setForm({
                  ...form,
                  initialPaidAmount: event.target.value,
                })
              }
              placeholder="20000"
            />
          </Field>

          <Field label="Payment type">
            <Select
              value={form.paymentFrequency}
              onChange={(event) =>
                setForm({
                  ...form,
                  paymentFrequency: event.target.value,
                })
              }
            >
              <option value="full">Full payment</option>
              <option value="weekly">Weekly installments</option>
              <option value="monthly">Monthly EMI</option>
              <option value="custom">Custom schedule</option>
            </Select>
          </Field>

          {form.paymentFrequency !== 'full' && (
            <Field label={`Installment amount (${currency})`}>
              <Input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.installmentAmount}
                onChange={(event) =>
                  setForm({
                    ...form,
                    installmentAmount: event.target.value,
                  })
                }
                placeholder="5000"
              />
            </Field>
          )}

          {form.paymentFrequency === 'custom' && (
            <Field label="Payment interval (days)">
              <Input
                required
                type="number"
                min="1"
                max="365"
                value={form.customIntervalDays}
                onChange={(event) =>
                  setForm({
                    ...form,
                    customIntervalDays: event.target.value,
                  })
                }
              />
            </Field>
          )}

          <Field label="Start date">
            <Input
              required
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm({ ...form, startDate: event.target.value })
              }
            />
          </Field>

          <Field label="Description (optional)">
            <Input
              maxLength={300}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Purchase details..."
            />
          </Field>

          {Number(form.totalPrice) > 0 && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">

              <p className="text-xs text-content-muted">
                Remaining purchase amount
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-400">
                {money(
                  Math.max(
                    0,
                    Number(form.totalPrice || 0) -
                    Number(form.initialPaidAmount || 0)
                  )
                )}
              </p>

            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-white/[0.08] pt-4">

            <Button
              type="button"
              variant="secondary"
              onClick={() => setPurchaseModalOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" loading={saving} disabled={saving}>
              {editingPurchase ? 'Save Changes' : 'Create Purchase'}
            </Button>

          </div>

        </form>

      </Modal>

      {/* PAYMENT MODAL */}

      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Installment Payment"
        description={
          selectedPurchase
            ? `Record the next installment for ${selectedPurchase.productName}.`
            : ''
        }
      >

        <form onSubmit={savePayment} className="space-y-4">

          <Field label={`Payment amount (${currency})`}>
            <Input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={paymentForm.amount}
              onChange={(event) =>
                setPaymentForm({
                  ...paymentForm,
                  amount: event.target.value,
                })
              }
            />
          </Field>

          <Field label="Payment date">
            <Input
              required
              type="date"
              value={paymentForm.date}
              max={today()}
              onChange={(event) =>
                setPaymentForm({
                  ...paymentForm,
                  date: event.target.value,
                })
              }
            />
          </Field>

          <Field label="Note (optional)">
            <Input
              maxLength={160}
              value={paymentForm.note}
              onChange={(event) =>
                setPaymentForm({
                  ...paymentForm,
                  note: event.target.value,
                })
              }
              placeholder="e.g. November EMI paid"
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-white/[0.08] pt-4">

            <Button
              type="button"
              variant="secondary"
              onClick={() => setPaymentModalOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" loading={saving} disabled={saving}>
              Confirm Payment
            </Button>

          </div>

        </form>

      </Modal>

      {/* SCOPED ANIMATIONS */}

      <style>{`
        .purchase-planner {
          animation: purchasePageEntry .65s cubic-bezier(.2,.7,.2,1) both;
        }

        @keyframes purchasePageEntry {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .purchase-glass,
        .purchase-stat {
          background: rgba(8, 20, 17, .48);
          border-color: rgba(16, 185, 129, .17);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow:
            0 10px 35px rgba(0,0,0,.12),
            inset 0 1px 0 rgba(255,255,255,.025);
        }

        .purchase-stat:hover,
        .purchase-item:hover {
          border-color: rgba(52,211,153,.38);
          box-shadow:
            0 14px 38px rgba(0,0,0,.20),
            0 0 25px rgba(16,185,129,.07);
        }

        .purchase-progress {
          transition: width 1.2s cubic-bezier(.2,.7,.2,1);
          box-shadow: 0 0 14px rgba(16,185,129,.35);
        }

        @media (prefers-reduced-motion: reduce) {
          .purchase-planner,
          .purchase-planner * {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

    </div>
  );
}