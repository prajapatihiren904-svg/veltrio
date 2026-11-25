import { useCallback, useEffect, useMemo, useState } from 'react';
import { transactionService } from '@/services/transactionService';
import { useAuth } from '@/contexts/AuthContext';

export function useTransactions({
  type = '',
  filters = {},
  page = 1,
  limit = 10,
} = {}) {
  const { user } = useAuth();

  const currency = user?.currency || 'INR';

  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit,
    total: 0,
    pages: 0,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const params = useMemo(
    () => ({
      ...filters,
      ...(type ? { type } : {}),
      page,
      limit,
      currency,
    }),
    [filters, type, page, limit, currency]
  );

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    Promise.all([
      transactionService.list(params),
      transactionService.categories(type || undefined),
    ])
      .then(([result, categoryItems]) => {
        if (!active) return;

        setTransactions(result.transactions || []);

        setPagination(
          result.pagination || {
            page,
            limit,
            total: 0,
            pages: 0,
          }
        );

        setCategories(categoryItems || []);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.message || 'Could not load transactions.'
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [params, page, limit, type, refreshKey]);

  return {
    transactions,
    pagination,
    categories,
    loading,
    error,
    refresh,
  };
}