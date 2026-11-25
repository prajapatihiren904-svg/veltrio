import { useCallback, useEffect, useRef, useState } from 'react';
import { getHealth } from '@/services/healthService';
import { isRequestCanceled } from '@/services/apiClient';

/** Loads API + database health. Status: 'loading' | 'success' | 'error'. */
export function useHealth() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const controllerRef = useRef(null);

  const refresh = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((previous) => ({ ...previous, status: 'loading', error: null }));
    try {
      const data = await getHealth({ signal: controller.signal });
      setState({ status: 'success', data, error: null });
    } catch (error) {
      if (isRequestCanceled(error)) return;
      setState({ status: 'error', data: null, error });
    }
  }, []);

  useEffect(() => {
    refresh();
    return () => controllerRef.current?.abort();
  }, [refresh]);

  return { ...state, isLoading: state.status === 'loading', refresh };
}
