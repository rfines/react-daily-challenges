# The Broken Notification Hub

**Date:** 2026-03-19
**Category:** typescript
**Type:** debug
**Difficulty:** Senior

---

## Problem Statement

A teammate shipped a `NotificationHub` component that uses a discriminated union for
four notification kinds (`success`, `error`, `warning`, `info`). It compiles cleanly
with no TypeScript errors, but at runtime three distinct bugs make it misbehave:

1. One notification kind always displays the wrong icon.
2. Dismissing a notification that was added *after* the initial render wipes out
   other notifications instead of removing only the targeted one.
3. Error notifications report their retryability and error code in the opposite order
   from what the UI contract specifies.

---

## Requirements

1. **All icons must match their kind.** `success → ✅`, `error → ❌`,
   `warning → ⚠️`, `info → ℹ️`.
2. **Dismiss must be surgical.** Clicking the dismiss button on any notification —
   whether it was present at mount or added dynamically — must remove *only* that
   notification. All others must remain intact.
3. **Error metadata must be correct.** A retryable error shows the text `"Retryable"`.
   A non-retryable error shows `"Code: {code}"`. Never the reverse.

---

## Hints

<details>
<summary>Hint 1 — Bug 1</summary>

`switch` statements in TypeScript don't require exhaustive coverage unless you use a
`never`-typed exhaustiveness check or enable the `noImplicitReturns` rule. A `default`
case silently swallows missing branches. Count the `case` labels in `getIcon()` and
compare them to the number of members in the `AppNotification` discriminated union.

</details>

<details>
<summary>Hint 2 — Bug 2</summary>

`useCallback` with an empty dependency array memoizes the *initial* closure — it
captures the value of every variable referenced inside it at the time of the first
render and never updates. Think about what `notifications` refers to inside
`dismissNotification` when items are added after mount, and consider whether
`setNotifications` supports an updater function that always receives the *current*
state rather than a captured snapshot.

</details>

---

## Running the Tests

```bash
cd ~/Projects/react-daily-challenges
npm run test:challenge -- solutions/2026-03-19-notification-hub
```

All tests should be **red** before you start. All tests should be **green** when
you're done — without modifying the test file.
