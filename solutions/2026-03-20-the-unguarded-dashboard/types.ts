export interface WidgetData {
  summary: string;
  items: Array<{ id: string; label: string; value: string | number }>;
  lastUpdated?: string;
}

export interface FetchError extends Error {
  statusCode?: number;
  retryable?: boolean;
}

export interface WidgetConfig {
  maxRetries?: number;
  retryDelay?: number;
}
