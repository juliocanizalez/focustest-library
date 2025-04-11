import { useState, useCallback } from 'react';
import { ApiError } from '../types';

interface RequestState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

type RequestFunction<T, P = void> = (params?: P) => Promise<T>;

export function useRequest<T, P = void>(requestFn: RequestFunction<T, P>) {
  const [state, setState] = useState<RequestState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (params?: P) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const data = await requestFn(params);
        setState({ data, isLoading: false, error: null });
        return data;
      } catch (error) {
        const apiError = error as ApiError;
        setState((prev) => ({ ...prev, isLoading: false, error: apiError }));
        throw apiError;
      }
    },
    [requestFn],
  );

  return {
    ...state,
    execute,
    reset: useCallback(() => {
      setState({ data: null, isLoading: false, error: null });
    }, []),
  };
}
