import { useMemo, useState } from 'react';

import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

import toast from 'react-hot-toast';

import PageHeader from '@/components/common/PageHeader';
import Card, { CardHeader } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Select from '@/components/forms/Select';
import Badge from '@/components/common/Badge';

import { transactionService } from '@/services/transactionService';

const FIELD_LABELS = {
  date: 'Date',
  description: 'Description',
  amount: 'Amount',
  type: 'Type (income / expense)',
  category: 'Category',
  paymentMethod: 'Payment method',
};

const ALIASES = {
  date: ['date', 'transaction date', 'expense date', 'entry date'],
  description: [
    'description',
    'details',
    'particulars',
    'name',
    'title',
    'transaction',
    'expense name',
    'expense',
    'transaction name',
    'item',
  ],
  amount: ['amount', 'value', 'total', 'debit', 'credit'],
  type: ['type', 'transaction type', 'income/expense', 'transactiontype'],
  category: ['category', 'expense category', 'income category'],
  paymentMethod: [
    'payment method',
    'payment mode',
    'payment type',
    'mode',
    'method',
  ],
};

const normalize = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const findColumn = (headers, field) =>
  headers.find((header) =>
    ALIASES[field].includes(normalize(header))
  ) || '';

function toISODate(value) {
  // JavaScript Date
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(
      value.getMonth() + 1
    ).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }

  // Excel serial date without loading XLSX library
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(
      Date.UTC(1899, 11, 30) + value * 86400000
    );

    if (!Number.isNaN(date.getTime())) {
      return `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1
      ).padStart(2, '0')}-${String(
        date.getUTCDate()
      ).padStart(2, '0')}`;
    }
  }

  const text = String(value ?? '').trim();

  if (!text) return '';

  // DD/MM/YYYY or DD-MM-YYYY
  const dayFirst = text.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
  );

  if (dayFirst) {
    const day = Number(dayFirst[1]);
    const month = Number(dayFirst[2]);
    const year = Number(dayFirst[3]);

    const check = new Date(year, month - 1, day);

    if (
      check.getFullYear() === year &&
      check.getMonth() === month - 1 &&
      check.getDate() === day
    ) {
      return `${year}-${String(month).padStart(
        2,
        '0'
      )}-${String(day).padStart(2, '0')}`;
    }

    return '';
  }

  // YYYY-MM-DD
  const iso = text.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  );

  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);

    const check = new Date(year, month - 1, day);

    if (
      check.getFullYear() === year &&
      check.getMonth() === month - 1 &&
      check.getDate() === day
    ) {
      return `${year}-${String(month).padStart(
        2,
        '0'
      )}-${String(day).padStart(2, '0')}`;
    }

    return '';
  }

  return '';
}

function inferType(value, fallback) {
  const text = normalize(value);

  if (
    ['income', 'credit', 'received', 'earning'].includes(text)
  ) {
    return 'income';
  }

  if (
    ['expense', 'debit', 'spent', 'payment'].includes(text)
  ) {
    return 'expense';
  }

  return fallback;
}

function mapPayment(value) {
  const text = normalize(value);

  if (text.includes('upi')) return 'upi';
  if (text.includes('cash')) return 'cash';
  if (text.includes('card')) return 'card';
  if (text.includes('bank')) return 'bank_transfer';

  return 'other';
}

export default function DataImportPage() {
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [fallbackType, setFallbackType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const rows = useMemo(
    () =>
      rawRows.map((raw, index) => {
        const value = (field) =>
          mapping[field] ? raw[mapping[field]] : '';

        const type = inferType(value('type'), fallbackType);

        const amount = Number(
          String(value('amount') ?? '').replace(/[₹$,\s]/g, '')
        );

        const date = toISODate(value('date'));

        const description =
          String(value('description') ?? '').trim() ||
          'Imported transaction';

        const category =
          String(value('category') ?? '').trim() ||
          (type === 'income' ? 'Other income' : 'Other expense');

        const errors = [];

        if (!date) errors.push('Date');

        if (
          !description ||
          description.length < 2 ||
          description.length > 120
        ) {
          errors.push('Description');
        }

        if (!Number.isFinite(amount) || amount <= 0) {
          errors.push('Amount');
        }

        return {
          rowNumber: index + 2,
          type,
          amount,
          date,
          description,
          category,
          paymentMethod: mapPayment(value('paymentMethod')),
          errors,
        };
      }),
    [rawRows, mapping, fallbackType]
  );

  const validRows = rows.filter(
    (row) => row.errors.length === 0
  );

  const invalidRows = rows.length - validRows.length;

  // Upload Excel / CSV file
  async function handleFile(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setResult(null);

    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      toast.error(
        'Choose an Excel (.xlsx, .xls) or CSV file.'
      );

      event.target.value = '';
      return;
    }

    try {
      // Load XLSX only when the user uploads a file
      const XLSX = await import('xlsx');

      const workbook = XLSX.read(
        await file.arrayBuffer(),
        {
          type: 'array',
          cellDates: true,
        }
      );

      const sheet =
        workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) {
        throw new Error('No worksheet found in this file.');
      }

      const data = XLSX.utils.sheet_to_json(sheet, {
        defval: '',
        raw: true,
      });

      if (!data.length) {
        throw new Error('The first sheet is empty.');
      }

      const nextHeaders = Object.keys(data[0]);

      const cleanRows = data.filter((row) => {
        const categoryHeader = nextHeaders.find(
          (header) =>
            ['category', 'expense category'].includes(
              normalize(header)
            )
        );

        const categoryValue = categoryHeader
          ? normalize(row[categoryHeader])
          : '';

        if (
          [
            'total',
            'grand total',
            'total expenses',
            'total expense',
          ].includes(categoryValue)
        ) {
          return false;
        }

        return Object.entries(row).some(
          ([key, value]) =>
            normalize(key) !== 'sr' &&
            String(value ?? '').trim() !== ''
        );
      });

      setHeaders(nextHeaders);
      setRawRows(cleanRows.slice(0, 500));

      setMapping(
        Object.fromEntries(
          Object.keys(FIELD_LABELS).map((field) => [
            field,
            findColumn(nextHeaders, field),
          ])
        )
      );

      setFileName(file.name);

      if (cleanRows.length > 500) {
        toast(
          'Only the first 500 transaction rows can be imported in one batch.',
          { icon: 'ℹ️' }
        );
      }
    } catch (error) {
      toast.error(
        error.message || 'Could not read this file.'
      );
    }

    event.target.value = '';
  }

  // Import valid transactions
  async function handleImport() {
    if (!validRows.length) {
      return toast.error(
        'There are no valid rows to import.'
      );
    }

    if (validRows.length > 500) {
      return toast.error(
        'Import is limited to 500 rows at a time.'
      );
    }

    setLoading(true);

    try {
      const response = await transactionService.import(
        validRows.map(
          ({
            type,
            amount,
            date,
            description,
            category,
            paymentMethod,
          }) => ({
            type,
            amount,
            date,
            description,
            category,
            paymentMethod,
          })
        )
      );

      setResult(response);

      toast.success(
        `${response.imported} transactions imported successfully.`
      );
    } catch (error) {
      toast.error(
        error.message ||
          'Import failed. Please check your file and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  // Reset import form
  function reset() {
    setFileName('');
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setResult(null);
  }

  // Download Excel template
  async function downloadTemplate() {
    try {
      // Load XLSX only when downloading the template
      const XLSX = await import('xlsx');

      const sample = [
        {
          Date: '2026-11-01',
          Description: 'Monthly salary',
          Amount: 25000,
          Type: 'income',
          Category: 'Salary',
          'Payment Method': 'Bank transfer',
        },
        {
          Date: '2026-11-02',
          Description: 'Groceries',
          Amount: 1500,
          Type: 'expense',
          Category: 'Food & dining',
          'Payment Method': 'UPI',
        },
      ];

      const book = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        book,
        XLSX.utils.json_to_sheet(sample),
        'Transactions'
      );

      XLSX.writeFile(
        book,
        'veltrio-import-template.xlsx'
      );
    } catch (error) {
      toast.error(
        'Could not generate the Excel template.'
      );
    }
  }

  return (
    <div className="mx-auto max-w-6xl">

      <PageHeader
        title="Import financial data"
        description="Bring your existing Excel or CSV records into VELTRIO. Preview and check everything before it is saved."
        actions={
          <Button
            variant="secondary"
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4" />
            Sample template
          </Button>
        }
      />

      <Card className="mb-5">
        <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-surface/50 px-5 py-10 text-center">

          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
            <FileSpreadsheet className="h-7 w-7" />
          </span>

          <h2 className="text-lg font-semibold">
            Upload your existing records
          </h2>

          <p className="mt-2 max-w-lg text-sm text-content-muted">
            Supported formats: .xlsx, .xls and .csv. The first worksheet is read. You can import up to 500 valid rows per batch.
          </p>

          <label className="mt-5 inline-flex h-11 cursor-pointer items-center gap-2 rounded-control bg-brand-500 px-5 text-sm font-semibold text-brand-ink shadow-glow transition hover:bg-brand-400">

            <Upload className="h-4 w-4" />
            Choose file

            <input
              className="sr-only"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
            />

          </label>

          {fileName && (
            <div className="mt-4 flex items-center gap-2 text-sm text-content-muted">

              <FileSpreadsheet className="h-4 w-4 text-brand-300" />

              {fileName}

              <button
                className="ml-2 text-brand-300 hover:text-brand-200"
                onClick={reset}
              >
                Remove
              </button>

            </div>
          )}

        </div>
      </Card>

      {headers.length > 0 && (
        <>
          <Card className="mb-5">

            <CardHeader
              title="Match your spreadsheet columns"
              description="VELTRIO detects common column names automatically. Change any field if the match is incorrect."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {Object.entries(FIELD_LABELS).map(
                ([field, label]) => (
                  <Select
                    key={field}
                    label={label}
                    value={mapping[field] || ''}
                    onChange={(event) =>
                      setMapping((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Not mapped</option>

                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}

                  </Select>
                )
              )}

            </div>

            {!mapping.type && (
              <div className="mt-4 max-w-xs">

                <Select
                  label="Use this type for every row"
                  value={fallbackType}
                  onChange={(event) =>
                    setFallbackType(event.target.value)
                  }
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </Select>

              </div>
            )}

          </Card>

          <Card padded={false} className="mb-5">

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">

              <div>
                <h2 className="font-semibold">
                  Import preview
                </h2>

                <p className="mt-1 text-xs text-content-muted">
                  Review the first records before saving them.
                </p>
              </div>

              <div className="flex gap-2">
                <Badge tone="success">
                  {validRows.length} valid
                </Badge>

                <Badge tone={invalidRows ? 'danger' : 'neutral'}>
                  {invalidRows} need attention
                </Badge>
              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[720px] text-left text-sm">

                <thead className="bg-surface text-xs uppercase tracking-wide text-content-subtle">
                  <tr>
                    {[
                      'Date',
                      'Description',
                      'Type',
                      'Category',
                      'Amount',
                      'Status',
                    ].map((item) => (
                      <th
                        key={item}
                        className="px-4 py-3 font-medium"
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">

                  {rows.slice(0, 12).map((row) => (
                    <tr key={row.rowNumber}>

                      <td className="px-4 py-3 text-content-muted">
                        {row.date || '—'}
                      </td>

                      <td className="px-4 py-3">
                        {row.description || '—'}
                      </td>

                      <td className="px-4 py-3 capitalize">
                        {row.type}
                      </td>

                      <td className="px-4 py-3">
                        {row.category}
                      </td>

                      <td className="px-4 py-3">
                        {Number.isFinite(row.amount)
                          ? row.amount.toLocaleString('en-IN')
                          : '—'}
                      </td>

                      <td className="px-4 py-3">

                        {row.errors.length ? (
                          <span className="inline-flex items-center gap-1 text-danger">
                            <AlertTriangle className="h-4 w-4" />
                            {row.errors.join(', ')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-success">
                            <CheckCircle2 className="h-4 w-4" />
                            Ready
                          </span>
                        )}

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

            {rows.length > 12 && (
              <p className="border-t border-line px-5 py-3 text-xs text-content-muted">
                Showing 12 of {rows.length} rows in preview.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">

              <p className="text-xs text-content-muted">
                Invalid rows are excluded. Existing duplicate transactions are skipped automatically.
              </p>

              <Button
                onClick={handleImport}
                loading={loading}
                disabled={
                  !validRows.length ||
                  validRows.length > 500 ||
                  Boolean(result)
                }
              >
                <ArrowRight className="h-4 w-4" />
                Import {validRows.length} transactions
              </Button>

            </div>

          </Card>
        </>
      )}

      {result && (
        <Card className="border border-success/30">

          <div className="flex items-start gap-3">

            <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />

            <div className="flex-1">

              <h2 className="font-semibold">
                Import completed
              </h2>

              <p className="mt-1 text-sm text-content-muted">
                {result.imported} new transactions imported ·{' '}
                {result.repairedLegacy || 0} old imported descriptions repaired ·{' '}
                {result.skippedDuplicates} duplicates skipped ·{' '}
                {result.totalReceived} rows processed.
              </p>

              <Button
                className="mt-4"
                size="sm"
                variant="secondary"
                onClick={reset}
              >
                <RefreshCw className="h-4 w-4" />
                Import another file
              </Button>

            </div>

          </div>

        </Card>
      )}

    </div>
  );
}