import { WidgetData, FetchError } from './types';

export const mockWidgetData: WidgetData = {
  summary: 'System is running normally.',
  items: [
    { id: '1', label: 'CPU Usage', value: '42%' },
    { id: '2', label: 'Memory', value: '3.2 GB' },
    { id: '3', label: 'Active Users', value: 1204 },
  ],
  lastUpdated: '2026-03-20T09:00:00Z',
};

export function createFetchError(
  message: string,
  statusCode?: number,
  retryable = true
): FetchError {
  const error = new Error(message) as FetchError;
  error.statusCode = statusCode;
  error.retryable = retryable;
  return error;
}

export const mockFetchSuccess = (): Promise<WidgetData> =>
  Promise.resolve(mockWidgetData);

export const mockFetchNetworkError = (): Promise<WidgetData> =>
  Promise.reject(createFetchError('Network error', undefined, true));

export const mockFetchNotFound = (): Promise<WidgetData> =>
  Promise.reject(createFetchError('Widget data not found', 404, false));

export const mockFetchServerError = (): Promise<WidgetData> =>
  Promise.reject(createFetchError('Internal server error', 500, true));
