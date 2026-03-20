import React, {
  Component,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { WidgetConfig, WidgetData, FetchError } from './types';

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  /** Custom fallback renderer. Receives the caught error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
  children: React.ReactNode;
  /** Called whenever an error is caught — useful for logging. */
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

export class DashboardErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <div role="alert" aria-live="assertive">
          <p>Something went wrong.</p>
          <button onClick={this.reset}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// useFetchWithRetry
// ---------------------------------------------------------------------------

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface FetchState<T> {
  data: T | null;
  error: FetchError | null;
  status: FetchStatus;
  retryCount: number;
  retry: () => void;
}

function useFetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: { maxRetries?: number; retryDelay?: number } = {}
): FetchState<T> {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<FetchError | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [retryCount, setRetryCount] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const execute = useCallback(
    async (attempt: number) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setStatus('loading');
      setError(null);

      try {
        const result = await fetchFn();
        setData(result);
        setStatus('success');
        setRetryCount(0);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;

        const fetchError = err as FetchError;

        if (attempt < maxRetries && fetchError.retryable !== false) {
          setRetryCount(attempt + 1);
          const delay = retryDelay * Math.pow(2, attempt);
          timeoutRef.current = setTimeout(() => execute(attempt + 1), delay);
        } else {
          setError(fetchError);
          setStatus('error');
        }
      }
    },
    [fetchFn, maxRetries, retryDelay]
  );

  const retry = useCallback(() => {
    setRetryCount(0);
    execute(0);
  }, [execute]);

  useEffect(() => {
    execute(0);
    return () => {
      abortRef.current?.abort();
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [execute]);

  return { data, error, status, retryCount, retry };
}

// ---------------------------------------------------------------------------
// DashboardWidget
// ---------------------------------------------------------------------------

export interface DashboardWidgetProps {
  title: string;
  fetchData: () => Promise<WidgetData>;
  config?: WidgetConfig;
  onDataLoad?: (data: WidgetData) => void;
}

export function DashboardWidget({
  title,
  fetchData,
  config = {},
  onDataLoad,
}: DashboardWidgetProps) {
  const { maxRetries = 3, retryDelay = 500 } = config;
  const { data, error, status, retryCount, retry } = useFetchWithRetry(
    fetchData,
    { maxRetries, retryDelay }
  );

  useEffect(() => {
    if (data) {
      onDataLoad?.(data);
    }
  }, [data, onDataLoad]);

  return (
    <section aria-label={title}>
      <h2>{title}</h2>

      {status === 'loading' && (
        <div role="status" aria-label="Loading">
          {retryCount > 0 ? (
            <span>
              Retrying… (attempt {retryCount} of {maxRetries})
            </span>
          ) : (
            <span>Loading…</span>
          )}
        </div>
      )}

      {status === 'error' && error && (
        <div role="alert">
          <p>{error.message}</p>
          {error.statusCode !== undefined && (
            <p>Status: {error.statusCode}</p>
          )}
          <button onClick={retry}>Retry</button>
        </div>
      )}

      {status === 'success' && data && (
        <div>
          <p>{data.summary}</p>
          <ul>
            {data.items.map((item) => (
              <li key={item.id}>
                {item.label}: {item.value}
              </li>
            ))}
          </ul>
          {data.lastUpdated && (
            <time dateTime={data.lastUpdated}>
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </time>
          )}
        </div>
      )}
    </section>
  );
}
