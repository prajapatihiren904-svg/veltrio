import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import Card, { CardHeader } from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import { transactionService } from '@/services/transactionService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';

const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const currentYear = String(now.getFullYear());
const PAGE_SIZE = 50;

const money = (value, currency) => formatCurrency(Number(value || 0), currency);

function monthBounds(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();

  return {
    from: `${month}-01`,
    to: `${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

function yearBounds(year) {
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

function monthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}

function dateValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function escapeCsv(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadBlob(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// Fetch all transactions in the selected currency.
async function fetchAllTransactions(range, currency) {
  const first = await transactionService.list({
    ...range,
    currency,
    page: 1,
    limit: PAGE_SIZE,
  });

  const all = [...(first.transactions || [])];
  const pages = Number(first.pagination?.pages || 1);

  for (let page = 2; page <= pages; page += 1) {
    const result = await transactionService.list({
      ...range,
      currency,
      page,
      limit: PAGE_SIZE,
    });

    all.push(...(result.transactions || []));
  }

  return all;
}

function MetricCard({ label, value, note, icon: Icon, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-500/10 text-brand-400',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
  };

  return (
    <Card className="group border-border/80 bg-gradient-to-br from-surface to-surface/70 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-content-muted">{label}</p>
          <p className="mt-2 break-words text-2xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-content-subtle">{note}</p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={19} />
        </span>
      </div>
    </Card>
  );
}

function MonthlyChart({ rows, currency }) {
  const maxValue = Math.max(1, ...rows.flatMap((row) => [row.income, row.expense]));

  if (!rows.some((row) => row.income > 0 || row.expense > 0)) {
    return (
      <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed border-line text-sm text-content-muted">
        No transactions recorded in this period.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-content-muted">
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-brand-400" />Income</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-danger" />Expenses</span>
      </div>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12 sm:gap-3">
        {rows.map((row) => (
          <div key={row.key} className="min-w-0">
            <div className="flex h-44 items-end justify-center gap-1 border-b border-line pb-2">
              <div
                title={`Income: ${money(row.income, currency)}`}
                className="w-1/2 max-w-5 rounded-t bg-brand-400 transition-all"
                style={{ height: row.income ? `${Math.max(3, (row.income / maxValue) * 100)}%` : 0 }}
              />
              <div
                title={`Expenses: ${money(row.expense, currency)}`}
                className="w-1/2 max-w-5 rounded-t bg-danger transition-all"
                style={{ height: row.expense ? `${Math.max(3, (row.expense / maxValue) * 100)}%` : 0 }}
              />
            </div>
            <p className="mt-2 truncate text-center text-[11px] text-content-muted">{row.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('month');
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const currency = user?.currency || 'INR';

  const range = useMemo(
    () => (period === 'month' ? monthBounds(month) : yearBounds(year)),
    [period, month, year],
  );

  // Load report using the user's selected currency.
  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const rows = await fetchAllTransactions(range, currency);
      setTransactions(rows);
    } catch (requestError) {
      setError(requestError.message || 'Could not load report data.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [range, currency]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const report = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const expenses = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const net = income - expenses;
    const savingsRate = income > 0 ? (net / income) * 100 : 0;

    const categoryMap = new Map();

    transactions.filter((item) => item.type === 'expense').forEach((item) => {
      const name = item.category?.name || 'Uncategorised';

      const current = categoryMap.get(name) || {
        name,
        amount: 0,
        count: 0,
        color: item.category?.color || '#64748B',
      };

      current.amount += Number(item.amount || 0);
      current.count += 1;

      categoryMap.set(name, current);
    });

    const categories = [...categoryMap.values()]
      .map((item) => ({
        ...item,
        percentage: expenses > 0 ? (item.amount / expenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const monthMap = new Map();

    transactions.forEach((item) => {
      const key = dateValue(item.date).slice(0, 7);
      if (!key) return;

      const slot = monthMap.get(key) || {
        key,
        label: monthLabel(key),
        income: 0,
        expense: 0,
      };

      slot[item.type] += Number(item.amount || 0);
      monthMap.set(key, slot);
    });

    let monthlyRows;

    if (period === 'year') {
      monthlyRows = Array.from({ length: 12 }, (_, index) => {
        const key = `${year}-${String(index + 1).padStart(2, '0')}`;

        return monthMap.get(key) || {
          key,
          label: new Intl.DateTimeFormat('en-IN', {
            month: 'short',
          }).format(new Date(Number(year), index, 1)),
          income: 0,
          expense: 0,
        };
      });
    } else {
      monthlyRows = [{
        key: month,
        label: monthLabel(month),
        income,
        expense: expenses,
      }];
    }

    return {
      income,
      expenses,
      net,
      savingsRate,
      categories,
      monthlyRows,
      count: transactions.length,
      incomeCount: transactions.filter((item) => item.type === 'income').length,
      expenseCount: transactions.filter((item) => item.type === 'expense').length,
    };
  }, [transactions, period, year, month]);

  const periodTitle = period === 'month' ? monthLabel(month) : year;

  function exportCsv() {
    if (!transactions.length) return;

    const headings = [
      'Date',
      'Type',
      'Description',
      'Category',
      'Payment method',
      'Amount',
      'Currency',
      'Notes',
    ];

    const rows = transactions.map((item) => [
      dateValue(item.date),
      item.type,
      item.description,
      item.category?.name || 'Uncategorised',
      item.paymentMethod || '',
      item.amount,
      item.currency || currency,
      item.notes || '',
    ]);

    const csv = [headings, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n');

    downloadBlob(
      `\uFEFF${csv}`,
      'text/csv;charset=utf-8;',
      `veltrio-report-${periodTitle.replaceAll(' ', '-')}.csv`
    );
  }

  function exportPdf() {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');

    if (!printWindow) {
      setError('Allow pop-ups in your browser to print or save the PDF report.');
      return;
    }

    const categoryRows = report.categories.map((item) => (
      `<tr><td>${escapeHtml(item.name)}</td><td>${item.count}</td><td>${item.percentage.toFixed(1)}%</td><td>${money(item.amount, currency)}</td></tr>`
    )).join('');

    const transactionRows = transactions.slice(0, 100).map((item) => (
      `<tr><td>${escapeHtml(dateValue(item.date))}</td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(item.description)}</td><td>${escapeHtml(item.category?.name || 'Uncategorised')}</td><td>${money(item.amount, currency)}</td></tr>`
    )).join('');

    printWindow.document.write(`<!doctype html><html><head><title>VELTRIO Financial Report - ${escapeHtml(periodTitle)}</title><meta charset="utf-8"><style>
      *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#18212b;margin:32px}h1{margin:0 0 6px;font-size:26px}.muted{color:#64748b;font-size:12px}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:24px 0}.card{border:1px solid #dbe2ea;border-radius:10px;padding:14px}.label{font-size:11px;color:#64748b}.value{font-size:20px;font-weight:700;margin-top:8px}.green{color:#059669}.red{color:#dc2626}h2{font-size:16px;margin:28px 0 10px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{text-align:left;border-bottom:1px solid #e2e8f0;padding:9px 7px}th{background:#f1f5f9}.note{margin-top:24px;font-size:10px;color:#64748b}@media print{body{margin:16mm}.no-print{display:none}}
    </style></head><body>
      <h1>VELTRIO · Financial Report</h1><p class="muted">${escapeHtml(periodTitle)} · Generated ${new Date().toLocaleString('en-IN')}</p>
      <div class="cards">
        <div class="card"><div class="label">Total income</div><div class="value green">${money(report.income, currency)}</div></div>
        <div class="card"><div class="label">Total expenses</div><div class="value red">${money(report.expenses, currency)}</div></div>
        <div class="card"><div class="label">Net cash flow</div><div class="value">${money(report.net, currency)}</div></div>
        <div class="card"><div class="label">Savings rate</div><div class="value">${report.savingsRate.toFixed(1)}%</div></div>
      </div>
      <h2>Expense by category</h2><table><thead><tr><th>Category</th><th>Transactions</th><th>Share</th><th>Amount</th></tr></thead><tbody>${categoryRows || '<tr><td colspan="4">No expenses recorded.</td></tr>'}</tbody></table>
      <h2>Transactions ${transactions.length > 100 ? '(first 100 records)' : ''}</h2><table><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead><tbody>${transactionRows || '<tr><td colspan="5">No transactions recorded.</td></tr>'}</tbody></table>
      <p class="note">This report is generated from transactions saved in your VELTRIO account. It is a summary for personal tracking and is not a tax document.</p>
      <div class="no-print"><button onclick="window.print()">Print / Save as PDF</button></div>
      <script>window.onload=()=>setTimeout(()=>window.print(),300);</script>
    </body></html>`);

    printWindow.document.close();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character]);
  }

  const topCategory = report.categories[0];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Financial Reports"
        description="Review your financial performance and export clear reports from your saved transactions."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={loadReport} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
            </Button>

            <Button variant="secondary" onClick={exportCsv} disabled={loading || !transactions.length}>
              <FileSpreadsheet size={15} /> CSV
            </Button>

            <Button onClick={exportPdf} disabled={loading}>
              <FileText size={15} /> PDF
            </Button>
          </div>
        }
      />

      <Card className="overflow-hidden border-brand-500/20 bg-gradient-to-br from-brand-500/10 via-surface to-surface">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400">
              <Sparkles size={14} /> FINANCIAL OVERVIEW
            </span>

            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              Your money, clearly summarized.
            </h2>

            <p className="mt-2 max-w-xl text-sm text-content-muted">
              Analyze income, spending and savings for a selected reporting period.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs text-content-muted">
              Report type
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="mt-1 block rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-content"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </label>

            {period === 'month' ? (
              <label className="text-xs text-content-muted">
                Select month
                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="mt-1 block rounded-xl border border-border bg-surface px-3 py-2 text-sm text-content"
                />
              </label>
            ) : (
              <label className="text-xs text-content-muted">
                Select year
                <select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="mt-1 block rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-content"
                >
                  {Array.from({ length: 8 }, (_, index) => String(now.getFullYear() - index)).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>
      </Card>

      {error && (
        <Card className="border-danger/30 bg-danger/5">
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="mt-0.5 shrink-0 text-danger" size={18} />
            <div>
              <p className="font-semibold text-danger">Report could not be loaded</p>
              <p className="mt-1 text-content-muted">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total income"
          value={loading ? '—' : money(report.income, currency)}
          note={`${report.incomeCount} income records`}
          icon={ArrowDownLeft}
          tone="success"
        />

        <MetricCard
          label="Total expenses"
          value={loading ? '—' : money(report.expenses, currency)}
          note={`${report.expenseCount} expense records`}
          icon={ArrowUpRight}
          tone="danger"
        />

        <MetricCard
          label="Net cash flow"
          value={loading ? '—' : money(report.net, currency)}
          note={report.net >= 0 ? 'Income is higher than expenses' : 'Expenses are higher than income'}
          icon={Wallet}
          tone="info"
        />

        <MetricCard
          label="Savings rate"
          value={loading ? '—' : `${report.savingsRate.toFixed(1)}%`}
          note="(Income − expenses) ÷ income"
          icon={TrendingUp}
          tone="brand"
        />
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <Card>
          <CardHeader
            title={period === 'year' ? 'Monthly cash flow' : 'Period cash flow'}
            description={
              period === 'year'
                ? `Income and expenses across ${year}.`
                : `Income and expenses for ${periodTitle}.`
            }
          />

          {loading ? (
            <div className="skeleton h-56" />
          ) : (
            period === 'year'
              ? <MonthlyChart rows={report.monthlyRows} currency={currency} />
              : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-success/5 p-4">
                    <p className="text-xs text-content-muted">Income</p>
                    <p className="mt-2 text-xl font-bold text-success">
                      {money(report.income, currency)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-danger/5 p-4">
                    <p className="text-xs text-content-muted">Expenses</p>
                    <p className="mt-2 text-xl font-bold text-danger">
                      {money(report.expenses, currency)}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="h-3 overflow-hidden rounded-full bg-danger/80">
                      <div
                        className="h-full rounded-full bg-success"
                        style={{
                          width: `${
                            report.income + report.expenses > 0
                              ? (report.income / (report.income + report.expenses)) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-content-muted">
                      Relative share of income and expenses in this month.
                    </p>
                  </div>
                </div>
              )
          )}
        </Card>

        <Card>
          <CardHeader
            title="Report highlights"
            description={`Key observations for ${periodTitle}.`}
          />

          {loading ? (
            <div className="skeleton h-40" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-brand-500/10 p-2 text-brand-400">
                  <Activity size={17} />
                </span>

                <div>
                  <p className="text-sm font-medium">Transactions recorded</p>
                  <p className="mt-1 text-xl font-bold">{report.count}</p>
                </div>
              </div>

              <div className="border-t border-line pt-4">
                <p className="text-xs text-content-muted">Top expense category</p>
                <p className="mt-1 font-semibold">
                  {topCategory?.name || 'No expense categories yet'}
                </p>
                <p className="text-sm text-content-muted">
                  {topCategory
                    ? `${money(topCategory.amount, currency)} · ${topCategory.percentage.toFixed(1)}% of expenses`
                    : 'Add expenses to see category insights.'}
                </p>
              </div>

              <div className="border-t border-line pt-4">
                <p className="text-xs text-content-muted">Financial position</p>
                <p className={`mt-1 font-semibold ${report.net >= 0 ? 'text-success' : 'text-danger'}`}>
                  {report.net >= 0 ? 'Positive net cash flow' : 'Negative net cash flow'}
                </p>
                <p className="text-sm text-content-muted">
                  {money(Math.abs(report.net), currency)} {report.net >= 0 ? 'surplus' : 'deficit'} for this period.
                </p>
              </div>
            </div>
          )}
        </Card>
      </section>

      <Card>
        <CardHeader
          title="Expense by category"
          description={`Where your money went during ${periodTitle}.`}
        />

        {loading ? (
          <div className="skeleton h-48" />
        ) : report.categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-content-muted">
            No expenses recorded for this reporting period.
          </div>
        ) : (
          <div className="space-y-5">
            {report.categories.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">
                    {item.name}
                    <span className="text-xs text-content-subtle"> · {item.count} records</span>
                  </span>

                  <span className="font-semibold">
                    {money(item.amount, currency)}
                    <span className="text-xs text-content-muted">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-surface-overlay">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, item.percentage)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-semibold">Transaction details</h2>
            <p className="mt-1 text-xs text-content-muted">
              {report.count} records · {periodTitle}
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={exportCsv}
            disabled={loading || !transactions.length}
          >
            <Download size={15} /> Export CSV
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-sm text-content-muted">
            No transactions found for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-surface-overlay/60 text-xs uppercase tracking-wide text-content-muted">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {transactions.slice(0, 12).map((item) => (
                  <tr key={item._id} className="hover:bg-surface-overlay/40">
                    <td className="whitespace-nowrap px-5 py-3 text-content-muted">
                      {formatDate(item.date)}
                    </td>

                    <td className="max-w-[220px] truncate px-5 py-3 font-medium">
                      {item.description}
                    </td>

                    <td className="px-5 py-3 text-content-muted">
                      {item.category?.name || 'Uncategorised'}
                    </td>

                    <td className="px-5 py-3">
                      <span className={item.type === 'income' ? 'text-success' : 'text-danger'}>
                        {item.type}
                      </span>
                    </td>

                    <td className={`whitespace-nowrap px-5 py-3 text-right font-semibold ${item.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {item.type === 'income' ? '+' : '−'}
                      {money(item.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transactions.length > 12 && (
              <p className="px-5 py-3 text-xs text-content-muted">
                Showing the latest 12 records here. Export CSV or PDF for the full report.
              </p>
            )}
          </div>
        )}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-content-subtle">
        <span>Report period: {periodTitle}</span>
        <span>Data is calculated from transactions saved in your VELTRIO account.</span>
      </div>
    </div>
  );
}