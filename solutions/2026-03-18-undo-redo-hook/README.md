# The Time Machine Hook

**Date:** 2026-03-18
**Category:** hooks
**Type:** build-feature
**Difficulty:** Senior

---

## Problem

Implement `useUndoRedo<T>` — a generic React hook that wraps any piece of state
with full undo/redo support.

The type signatures, option shapes, and JSDoc contracts are already written in
`useUndoRedo.ts`. The test suite is comprehensive and covers happy paths, edge
cases, and invariants. Your job is to make every test pass.

---

## Requirements

1. **Core behaviour** — `set()` updates state and records history. `undo()` and
   `redo()` move the history cursor. `clear()` resets everything to the initial
   value. A functional updater `set(prev => next)` must work alongside plain
   values.

2. **`maxHistory` option** — When provided, the past-entries portion of history
   is capped at that number. Older entries are evicted from the front. The
   invariant `history[historyIndex] === state` must always hold.

3. **Redo stack is cleared on `set()`** — Calling `set()` after an undo must
   discard any future states, exactly as most editors behave.

---

## Running the tests

```bash
cd ~/Projects/react-daily-challenges
npm run test:challenge -- solutions/2026-03-18-undo-redo-hook
```

---

## Hints

<details>
<summary>Hint 1 — state shape</summary>

One clean approach: store a single `{ history: T[], index: number }` in a
single `useReducer`. All operations (set, undo, redo, clear) become reducer
actions, which keeps the logic pure and easy to test in isolation.

</details>

<details>
<summary>Hint 2 — functional updater</summary>

To support `set(prev => next)`, check `typeof value === 'function'` and call it
with the current state to resolve the next value before pushing to history.
TypeScript requires a cast here: `(value as (prev: T) => T)(currentState)`.

</details>
