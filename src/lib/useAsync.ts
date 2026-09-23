import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: unknown;
}

export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: undefined });
  const requestId = useRef(0);

  const run = useCallback(() => {
    const id = ++requestId.current;
    setState((prev) => ({ ...prev, loading: true, error: undefined }));
    fetcher().then(
      (data) => {
        if (requestId.current === id) setState({ data, loading: false, error: undefined });
      },
      (error) => {
        if (requestId.current === id) setState((prev) => ({ ...prev, loading: false, error }));
      },
    );
  }, deps);

  useEffect(() => {
    run();
  }, deps);

  return { ...state, reload: run };
}
