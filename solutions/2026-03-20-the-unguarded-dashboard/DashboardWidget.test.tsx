import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DashboardWidget, DashboardErrorBoundary } from './DashboardWidget';
import {
  mockWidgetData,
  mockFetchSuccess,
  mockFetchNetworkError,
  mockFetchNotFound,
  mockFetchServerError,
  createFetchError,
} from './mockData';

describe('DashboardWidget', () => {
  // TODO: Write comprehensive tests covering:
  //
  // Happy path
  // - Renders the widget title
  // - Shows a loading indicator initially
  // - Displays the summary, all items, and the last-updated time after a
  //   successful fetch
  // - Calls the onDataLoad callback with the fetched data
  //
  // Loading / retry states
  // - Shows "Loading…" on the first attempt
  // - Shows "Retrying… (attempt N of M)" while auto-retrying after a
  //   retryable error
  //
  // Error states
  // - Displays the error message and a Retry button when all retries are
  //   exhausted
  // - Displays the HTTP status code alongside the message when present
  // - A non-retryable error (retryable: false) surfaces immediately without
  //   retrying (e.g. 404 Not Found)
  //
  // Retry button
  // - Clicking Retry clears the error and triggers a new fetch sequence
  // - Clicking Retry can lead to a successful render if the next fetch
  //   succeeds
  //
  // Config prop
  // - Respects a custom maxRetries value from the config prop
  // - Respects a custom retryDelay value from the config prop
  //
  // Cleanup / memory-safety
  // - Does not call setState / trigger React warnings after the component
  //   unmounts mid-fetch
  //
  // DashboardErrorBoundary — default UI
  // - Renders children when there is no error
  // - Catches a render-phase error thrown by a child and shows the default
  //   "Something went wrong." fallback
  // - The default "Try again" button resets the boundary so children render
  //   again
  //
  // DashboardErrorBoundary — custom fallback
  // - Renders the custom fallback when the fallback prop is provided
  // - Passes the caught error to the custom fallback
  // - Passes a working reset callback to the custom fallback
  //
  // DashboardErrorBoundary — onError callback
  // - Calls onError with the error and React error info when a child throws
});
