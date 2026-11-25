const RATE_CACHE_DURATION = 60 * 60 * 1000;

const rateCache = new Map();
const SUPPORTED_CURRENCIES = [
  'AUD',
  'BGN',
  'BRL',
  'CAD',
  'CHF',
  'CNY',
  'CZK',
  'DKK',
  'EUR',
  'GBP',
  'HKD',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'ISK',
  'JPY',
  'KRW',
  'MXN',
  'MYR',
  'NOK',
  'NZD',
  'PHP',
  'PLN',
  'RON',
  'SEK',
  'SGD',
  'THB',
  'TRY',
  'USD',
  'ZAR',
];

function validateCurrency(currency) {
  const code = String(currency || '').toUpperCase();

  if (!SUPPORTED_CURRENCIES.includes(code)) {
    throw new Error(`Unsupported currency: ${code}`);
  }

  return code;
}

// ======================================
// GET EXCHANGE RATE
// ======================================

export async function getExchangeRate(fromCurrency, toCurrency) {
  const from = validateCurrency(fromCurrency);
  const to = validateCurrency(toCurrency);

  if (from === to) return 1;

  const cacheKey = `${from}_${to}`;

  const cached = rateCache.get(cacheKey);

  if (
    cached &&
    Date.now() - cached.timestamp < RATE_CACHE_DURATION
  ) {
    return cached.rate;
  }

  const url =
    `https://api.frankfurter.app/latest?from=${from}&to=${to}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Unable to fetch current exchange rates');
  }

  const data = await response.json();

  const rate = Number(data.rates?.[to]);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('Invalid exchange rate received');
  }

  rateCache.set(cacheKey, {
    rate,
    timestamp: Date.now(),
  });

  return rate;
}

// ======================================
// CONVERT AMOUNT
// ======================================

export async function convertAmount(
  amount,
  fromCurrency,
  toCurrency
) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    throw new Error('Invalid amount');
  }

  const rate = await getExchangeRate(
    fromCurrency,
    toCurrency
  );

  return Math.round((value * rate + Number.EPSILON) * 100) / 100;
}

// ======================================
// CONVERT MULTIPLE TRANSACTIONS
// ======================================

export async function convertTransactions(
  transactions,
  targetCurrency
) {
  const target = validateCurrency(targetCurrency);

  const rateMap = new Map();

  const converted = await Promise.all(
    transactions.map(async (transaction) => {
      const source = validateCurrency(
        transaction.currency || 'INR'
      );

      const key = `${source}_${target}`;

      let rate = rateMap.get(key);

      if (rate === undefined) {
        rate = await getExchangeRate(source, target);
        rateMap.set(key, rate);
      }

      return {
        ...transaction,
        originalAmount: transaction.amount,
        originalCurrency: source,
        amount:
          Math.round(
            (Number(transaction.amount) * rate + Number.EPSILON) *
              100
          ) / 100,
        currency: target,
        exchangeRate: rate,
      };
    })
  );

  return converted;
}