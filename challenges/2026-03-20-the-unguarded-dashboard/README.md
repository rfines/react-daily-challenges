# The Unguarded Dashboard

**Date:** 2026-03-20
**Category:** error-handling
**Type:** add-coverage
**Difficulty:** Senior

---

## Problem Statement

`DashboardWidget` is a fully functional React component that fetches data
asynchronously, auto-retries on transient errors (with exponential back-off),
distinguishes retryable from non-retryable errors, and exposes a manual Retry
button. It is paired with `DashboardErrorBoundary`, a class-based error
boundary that catches render-phase exceptions, supports a custom fallback
renderer, and provides a reset callback.

The component works perfectly — but it ships with **zero tests**.

Your task is to write a comprehensive test suite in `DashboardWidget.test.tsx`
that covers every meaningful behaviour of both `DashboardWidget` and
`DashboardErrorBoundary`. Aim for edge cases and failure paths, not just the
happy path.

---

## Requirements

1. **Happy path & loading states** — Verify that the widget progresses through
   loading → success, renders all data fields correctly, and fires the
   `onDataLoad` callback.

2. **Error handling & retry logic** — Cover auto-retry messaging during
   in-flight retries, exhaustion of retries leading to an error state, the
   behaviour of non-retryable errors (they must surface immediately, no
   retry), and the manual Retry button resetting the fetch cycle.

3. **DashboardErrorBoundary** — Test the default fallback UI, the custom
   `fallback` prop (including the reset callback it receives), and the
   `onError` callback.

---

## Hints

<details>
<summary>Hint 1 — Testing async retry behaviour</summary>

`useFetchWithRetry` uses `setTimeout` internally for back-off delays. Wrap
your test in `jest.useFakeTimers()` / `jest.useRealTimers()` so you can
advance time with `jest.runAllTimers()` without actually waiting. Don't forget
to flush pending promises between timer advances — a small
`await Promise.resolve()` loop or `waitFor` usually does the trick.

</details>

<details>
<summary>Hint 2 — Testing error boundaries</summary>

React logs `console.error` for every caught render error, which pollutes test
output. Spy on (and suppress) `console.error` in your boundary tests:

```ts
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
// ... test ...
consoleSpy.mockRestore();
```

To trigger a boundary, create a tiny `Bomb` component that throws when a prop
is set to `true`, then flip it via `rerender`.

</details>

---

## Running the Tests

```bash
cd ~/Projects/react-daily-challenges
npm run test:challenge -- solutions/2026-03-20-the-unguarded-dashboard
```
