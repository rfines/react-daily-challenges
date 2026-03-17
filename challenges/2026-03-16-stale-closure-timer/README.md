# Challenge: The Haunted Timer

**Date:** 2026-03-16
**Category:** hooks
**Difficulty:** hard
**Type:** debug

---

## Problem Statement

You've inherited a `useTimer` custom hook and a `TimerDashboard` component from a teammate who left the company. Users are reporting three distinct bugs:

1. The timer's displayed count drifts out of sync with reality — it seems to "freeze" or show stale values under certain conditions.
2. The "lap" feature captures the wrong time — it always records the time from when the lap button handler was first created, not the current time.
3. When the component unmounts while the timer is running, there's a React warning about updating state on an unmounted component, and the interval is never cleaned up.

Your job is to find and fix all three bugs. The existing tests describe the correct behavior.

## Requirements

1. Fix the stale closure in `useTimer` so the count always reflects the true elapsed time
2. Fix the lap capture so it records the count at the moment the button is pressed
3. Fix the cleanup so unmounting while running produces no warnings and stops the interval

## Hints

<details>
<summary>Hint 1</summary>
Look carefully at the dependency arrays and think about what values are captured in each closure. Is the callback passed to <code>setInterval</code> reading the latest state, or a snapshot from when it was created?
</details>

<details>
<summary>Hint 2</summary>
Consider using <code>useRef</code> to hold mutable values that need to survive across renders without triggering re-renders, and think about the <code>useEffect</code> cleanup function — when does it run, and what should it do?
</details>

## Running This Challenge

```bash
# Run the tests for this challenge
npm run test:challenge -- challenges/2026-03-16

# Watch mode
npm run test:watch -- challenges/2026-03-16
```

## Success Criteria

All tests pass when you run `npm run test:challenge -- challenges/2026-03-16`
