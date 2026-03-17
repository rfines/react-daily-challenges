# The Optimistic Update Engine

**Date:** 2026-03-17
**Category:** Data Fetching
**Type:** Build Feature
**Difficulty:** Senior / Staff

## Problem

You're building a collaborative task manager where responsiveness is critical. Users expect instant feedback when they toggle a task's status, edit a title, or reorder items — even on slow connections.

Your job is to implement `useOptimisticMutation`, a custom hook that applies changes to local state immediately (optimistically) while the real mutation runs in the background. If the mutation fails, the hook must **roll back** to the previous state and surface the error. If multiple mutations fire concurrently against the same item, the hook must handle them without corrupting state.

A stub file with full type signatures is provided. A comprehensive test suite is already written and currently failing. Make all tests pass.

## Requirements

1. **Instant optimistic update** — When `mutate()` is called, the `optimisticState` returned by the hook must reflect the change synchronously (before the async `mutationFn` resolves).
2. **Automatic rollback on failure** — If `mutationFn` rejects, the state must revert to its value from _before_ that specific mutation was applied, and the error must be exposed via the hook's return value.
3. **Concurrent mutation safety** — If two mutations are in-flight simultaneously, a failure in the first must only roll back its own change, not undo the second mutation's optimistic update.

## Hints

<details>
<summary>Hint 1</summary>

Think of each in-flight mutation as a "layer" on top of the confirmed server state. When one layer fails, you remove just that layer and recompute the optimistic state from the remaining layers.

</details>

<details>
<summary>Hint 2</summary>

`useRef` is your friend for tracking in-flight mutations without causing re-renders. Consider storing a queue of pending mutations with their individual optimistic transforms, then deriving the final optimistic state by reducing over the confirmed state + all pending transforms.

</details>

## Running the Tests

```bash
cd ~/Projects/react-daily-challenges && npm run test:challenge -- challenges/2026-03-17
```
