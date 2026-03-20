/**
 * useUndoRedo<T>
 *
 * A generic hook that wraps a piece of state with full undo/redo support.
 *
 * TODO: Implement this hook so that all tests in useUndoRedo.test.ts pass.
 *
 * The return type and option shape are specified below — do not change them.
 * The implementation is entirely up to you.
 */

export interface UseUndoRedoOptions {
  /**
   * Maximum number of past states to keep in history (not counting the
   * current state). When the limit is reached, the oldest entry is evicted.
   * Defaults to Infinity (unlimited).
   */
  maxHistory?: number;
}

export interface UseUndoRedoReturn<T> {
  /** The current value. */
  state: T;

  /**
   * Update the current value. Accepts either a plain value or a functional
   * updater `(prev: T) => T`, just like React's setState.
   * Calling set() clears the redo stack.
   */
  set: (value: T | ((prev: T) => T)) => void;

  /** Move one step back in history. No-op when canUndo is false. */
  undo: () => void;

  /** Move one step forward in history. No-op when canRedo is false. */
  redo: () => void;

  /** True when there is at least one past state to undo to. */
  canUndo: boolean;

  /** True when there is at least one future state to redo to. */
  canRedo: boolean;

  /**
   * The full history array including the current state.
   * history[historyIndex] === state must always hold.
   */
  history: T[];

  /** Index of the current state within history. */
  historyIndex: number;

  /**
   * Reset to the initial value and wipe all history.
   * After calling clear(), history === [initialValue] and historyIndex === 0.
   */
  clear: () => void;
}

export function useUndoRedo<T>(
  initialValue: T,
  options?: UseUndoRedoOptions,
): UseUndoRedoReturn<T> {
  throw new Error('Not implemented');
}
