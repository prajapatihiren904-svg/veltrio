import { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Plus,
  Search,
  Trash2,
  WalletCards,
} from 'lucide-react';

import toast from 'react-hot-toast';

import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Card, { CardHeader } from '@/components/common/Card';
import EmptyState from '@/components/feedback/EmptyState';
import Input from '@/components/forms/Input';
import Select from '@/components/forms/Select';
import PageHeader from '@/components/common/PageHeader';

import TransactionForm from './TransactionForm';

import { useTransactions } from '@/hooks/useTransactions';
import { transactionService } from '@/services/transactionService';

import { formatCurrency, formatDate } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';

const PAYMENT_LABELS = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  bank_transfer: 'Bank transfer',
  other: 'Other',
};

export default function TransactionWorkspace({ type = '' }) {
  const { user } = useAuth();

  const currency = user?.currency || 'INR';

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    from: '',
    to: '',
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const stableFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value)
      ),
    [filters]
  );

  const {
    transactions,
    pagination,
    categories,
    loading,
    error,
    refresh,
  } = useTransactions({
    type,
    filters: stableFilters,
    page,
    limit: 10,
  });

  // Converted transaction amounts
  const incomeTotal = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expenseTotal = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // Display converted amount and original amount
  function renderTransactionAmount(transaction) {
    const originalCurrency =
      transaction.originalCurrency || transaction.currency || currency;

    const targetCurrency = currency;

    const isConverted = originalCurrency !== targetCurrency;

    return (
      <div>
        <div className="font-semibold">
          {transaction.type === 'income' ? '+' : '−'}
          {formatCurrency(transaction.amount, targetCurrency)}
        </div>

        {isConverted && transaction.originalAmount !== undefined && (
          <div className="mt-1 text-xs text-content-subtle">
            Original:{' '}
            {formatCurrency(
              transaction.originalAmount,
              originalCurrency
            )}
          </div>
        )}
      </div>
    );
  }

  function applySearch(event) {
    event.preventDefault();

    setPage(1);

    setFilters((current) => ({
      ...current,
      search: searchInput.trim(),
    }));
  }

  function changeFilter(field, value) {
    setPage(1);

    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(transaction) {
    setEditing(transaction);
    setFormOpen(true);
  }

  async function removeTransaction(transaction) {
    const confirmed = window.confirm(
      `Delete “${transaction.description}”? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await transactionService.remove(transaction._id);

      toast.success('Transaction deleted');

      if (transactions.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        refresh();
      }
    } catch (requestError) {
      toast.error(
        requestError.message || 'Could not delete transaction'
      );
    }
  }

  const title =
    type === 'income'
      ? 'Income'
      : type === 'expense'
        ? 'Expenses'
        : 'Transactions';

  const description =
    type === 'income'
      ? 'Track money coming into your account.'
      : type === 'expense'
        ? 'Keep an eye on where your money goes.'
        : 'Review and manage all your income and expenses in one place.';

  return (
    <div className="transaction-workspace mx-auto w-full max-w-6xl min-w-0">

      {/* Page Header */}

      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add{' '}
            {type === 'income'
              ? 'income'
              : type === 'expense'
                ? 'expense'
                : 'transaction'}
          </Button>
        }
      />

      {/* Summary Cards */}

      <div className="transaction-summary-grid mb-6 grid gap-3 sm:grid-cols-3">

        <Card padded={false} className="transaction-summary-card p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-content-subtle">
            Records found
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {pagination.total}
          </p>

          <p className="mt-1 text-xs text-content-muted">
            Matching your current filters
          </p>
        </Card>

        <Card padded={false} className="transaction-summary-card p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-content-subtle">
            Income on this page
          </p>

          <p className="mt-2 text-2xl font-semibold text-success">
            {formatCurrency(incomeTotal, currency)}
          </p>

          <p className="mt-1 text-xs text-content-muted">
            Current page only
          </p>
        </Card>

        <Card padded={false} className="transaction-summary-card p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-content-subtle">
            Expenses on this page
          </p>

          <p className="mt-2 text-2xl font-semibold text-danger">
            {formatCurrency(expenseTotal, currency)}
          </p>

          <p className="mt-1 text-xs text-content-muted">
            Current page only
          </p>
        </Card>

      </div>

      {/* Search and Filters */}

      <Card className="transaction-filter-card mb-5">

        <CardHeader
          title="Find transactions"
          description="Search by description or narrow the list by category and date."
        />

        <form
          onSubmit={applySearch}
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
        >

          <div className="xl:col-span-2">
            <Input
              label="Search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search description..."
              icon={Search}
            />
          </div>

          <Select
            label="Category"
            value={filters.category}
            onChange={(event) =>
              changeFilter('category', event.target.value)
            }
          >
            <option value="">All categories</option>

            {categories
              .filter(
                (category) =>
                  !type || category.type === type
              )
              .map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name}
                </option>
              ))}
          </Select>

          <Input
            label="From"
            type="date"
            value={filters.from}
            onChange={(event) =>
              changeFilter('from', event.target.value)
            }
          />

          <Input
            label="To"
            type="date"
            value={filters.to}
            onChange={(event) =>
              changeFilter('to', event.target.value)
            }
          />

          <div className="flex flex-wrap items-end gap-2 md:col-span-2 xl:col-span-5">

            <Button type="submit" variant="secondary">
              <Search className="h-4 w-4" />
              Search
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchInput('');

                setFilters({
                  search: '',
                  category: '',
                  from: '',
                  to: '',
                });

                setPage(1);
              }}
            >
              Clear filters
            </Button>

          </div>

        </form>
      </Card>

      {/* Transaction List */}

      <Card padded={false} className="transaction-list-card">

        <div className="transaction-list-header flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">

          <div>
            <h2 className="font-semibold">
              Recent records
            </h2>

            <p className="mt-1 text-xs text-content-muted">
              {pagination.total} total · sorted by newest date
            </p>
          </div>

          <Badge tone="brand">
            {type || 'all types'}
          </Badge>

        </div>

        {loading ? (

          <div className="space-y-3 p-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="skeleton h-14 w-full"
              />
            ))}
          </div>

        ) : error ? (

          <div className="p-6 text-sm text-danger">
            {error}

            <Button
              size="sm"
              variant="secondary"
              className="ml-2"
              onClick={refresh}
            >
              Retry
            </Button>
          </div>

        ) : transactions.length === 0 ? (

          <EmptyState
            icon={WalletCards}
            title="No transactions yet"
            description="Add your first record or adjust the filters to see matching transactions."
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add transaction
              </Button>
            }
          />

        ) : (

          <>

            {/* Desktop Table */}

            <div className="transaction-table-wrap hidden overflow-x-auto md:block">

              <table className="w-full text-left text-sm">

                <thead className="bg-surface text-xs uppercase tracking-wide text-content-subtle">

                  <tr>
                    <th className="px-6 py-3 font-medium">
                      Description
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Category
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Date
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Method
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Amount
                    </th>

                    <th className="px-6 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-line">

                  {transactions.map((transaction) => (

                    <tr
                      key={transaction._id}
                      className="transition-colors hover:bg-surface/60"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-control ${
                              transaction.type === 'income'
                                ? 'bg-success/10 text-success'
                                : 'bg-danger/10 text-danger'
                            }`}
                          >
                            {transaction.type === 'income' ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </span>

                          <div>
                            <p className="font-medium text-content">
                              {transaction.description}
                            </p>

                            {transaction.notes && (
                              <p className="mt-0.5 max-w-xs truncate text-xs text-content-subtle">
                                {transaction.notes}
                              </p>
                            )}
                          </div>

                        </div>

                      </td>

                      <td className="px-4 py-4">
                        <Badge>
                          {transaction.category?.name || 'Uncategorized'}
                        </Badge>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-content-muted">
                        {formatDate(transaction.date)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-content-muted">
                        {PAYMENT_LABELS[transaction.paymentMethod] || 'Other'}
                      </td>

                      <td
                        className={`whitespace-nowrap px-4 py-4 text-right ${
                          transaction.type === 'income'
                            ? 'text-success'
                            : 'text-content'
                        }`}
                      >
                        {renderTransactionAmount(transaction)}
                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-1">

                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Edit ${transaction.description}`}
                            onClick={() => openEdit(transaction)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-danger hover:bg-danger/10 hover:text-danger"
                            aria-label={`Delete ${transaction.description}`}
                            onClick={() =>
                              removeTransaction(transaction)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* Mobile Transaction List */}

            <div className="transaction-mobile-list divide-y divide-line md:hidden">

              {transactions.map((transaction) => (

                <div
                  key={transaction._id}
                  className="flex items-start justify-between gap-3 p-4"
                >

                  <div className="flex min-w-0 gap-3">

                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-control ${
                        transaction.type === 'income'
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-medium">
                        {transaction.description}
                      </p>

                      <p className="mt-1 text-xs text-content-muted">
                        {transaction.category?.name || 'Uncategorized'}
                        {' · '}
                        {formatDate(transaction.date)}
                      </p>

                      <p className="mt-1 text-xs text-content-subtle">
                        {PAYMENT_LABELS[transaction.paymentMethod] || 'Other'}
                      </p>

                    </div>

                  </div>

                  <div className="shrink-0 text-right">

                    <div
                      className={`text-sm ${
                        transaction.type === 'income'
                          ? 'text-success'
                          : 'text-content'
                      }`}
                    >
                      {renderTransactionAmount(transaction)}
                    </div>

                    <div className="mt-2 flex justify-end gap-1">

                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Edit transaction"
                        onClick={() => openEdit(transaction)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-danger"
                        aria-label="Delete transaction"
                        onClick={() =>
                          removeTransaction(transaction)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </>

        )}

        {/* Pagination */}

        {!loading && pagination.pages > 1 && (

          <div className="flex items-center justify-between border-t border-line px-5 py-4 sm:px-6">

            <p className="text-xs text-content-muted">
              Page {pagination.page} of {pagination.pages}
            </p>

            <div className="flex gap-2">

              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) => current - 1)
                }
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                size="sm"
                variant="secondary"
                disabled={page >= pagination.pages}
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>

            </div>

          </div>

        )}

      </Card>

      {/* Footer */}

      <div className="mt-4 flex items-center gap-2 text-xs text-content-subtle">
        <CalendarDays className="h-4 w-4" />
        Amount summaries above reflect the records currently displayed on this page.
      </div>

      {/* Transaction Form */}

      <TransactionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={refresh}
        categories={categories}
        initialValue={editing}
        defaultType={type || 'expense'}
      />

      <style>{`
        .transaction-workspace {
          animation: transactionPageIn .55s cubic-bezier(.2,.7,.2,1) both;
        }

        @keyframes transactionPageIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .transaction-workspace .transaction-summary-card,
        .transaction-workspace .transaction-filter-card,
        .transaction-workspace .transaction-list-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border: 1px solid rgba(16,185,129,.13);
          background: linear-gradient(
            145deg,
            rgba(17,35,31,.92),
            rgba(10,19,18,.94)
          );
          box-shadow:
            0 10px 30px rgba(0,0,0,.14),
            inset 0 1px 0 rgba(255,255,255,.035);
          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }

        .transaction-workspace .transaction-summary-card:hover {
          transform: translateY(-3px);
          border-color: rgba(52,211,153,.38);
          box-shadow:
            0 14px 34px rgba(0,0,0,.2),
            0 0 22px rgba(16,185,129,.08);
        }

        .transaction-workspace .transaction-summary-card:nth-child(2) {
          background: linear-gradient(
            145deg,
            rgba(9,57,42,.78),
            rgba(10,25,21,.96)
          );
        }

        .transaction-workspace .transaction-summary-card:nth-child(2) p:nth-of-type(2) {
          text-shadow: 0 0 22px rgba(52,211,153,.22);
        }

        .transaction-workspace .transaction-filter-card,
        .transaction-workspace .transaction-list-card {
          border-radius: 18px;
        }

        .transaction-workspace .transaction-list-header {
          background: linear-gradient(
            90deg,
            rgba(16,185,129,.075),
            transparent 72%
          );
        }

        .transaction-workspace .transaction-table-wrap table {
          min-width: 760px;
        }

        .transaction-workspace .transaction-table-wrap tbody tr {
          transition: background-color .2s ease;
        }

        .transaction-workspace .transaction-table-wrap tbody tr:hover {
          background: rgba(16,185,129,.055);
        }

        .transaction-workspace .transaction-mobile-list > div {
          transition: background-color .2s ease;
        }

        .transaction-workspace .transaction-mobile-list > div:hover {
          background: rgba(16,185,129,.045);
        }

        .transaction-workspace button {
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease;
        }

        .transaction-workspace button:active {
          transform: scale(.97);
        }

        .transaction-workspace .transaction-footer-note {
          opacity: .78;
        }

        @media (prefers-reduced-motion: reduce) {
          .transaction-workspace,
          .transaction-workspace * {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }
          /* VELTRIO DASHBOARD-STYLE GLASS EFFECT */

.transaction-workspace .transaction-summary-card,
.transaction-workspace .transaction-filter-card,
.transaction-workspace .transaction-list-card {
  background: rgba(8, 20, 17, 0.58) !important;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  border: 1px solid rgba(16, 185, 129, 0.20);

  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.035);

  transition: all 0.35s ease;
}

/* Emerald hover glow */

.transaction-workspace .transaction-summary-card:hover,
.transaction-workspace .transaction-filter-card:hover,
.transaction-workspace .transaction-list-card:hover {
  border-color: rgba(52, 211, 153, 0.35);

  box-shadow:
    0 12px 35px rgba(0, 0, 0, 0.22),
    0 0 25px rgba(16, 185, 129, 0.08);
}

/* Transparent table */

.transaction-workspace .transaction-table-wrap thead {
  background: rgba(5, 12, 10, 0.55);
}

.transaction-workspace .transaction-table-wrap tbody tr {
  background: rgba(8, 20, 17, 0.18);
}

.transaction-workspace .transaction-table-wrap tbody tr:hover {
  background: rgba(16, 185, 129, 0.08);
}
      `}</style>

    </div>
  );
}