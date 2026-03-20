import {  useRef, useReducer } from "react";

type Action<T> =
  | { type: 'SET'; payload: T | ((prev: T) => T) }
  | { type: 'UNDO' | 'REDO' | 'CLEAR' };

type ReducerState<T> = { history: T[]; index: number };
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
  const maxHistory = useRef(options?.maxHistory ?? Infinity);

  const [state, dispatch] = useReducer((state: ReducerState<T>, action: Action<T>) => {
    if(action.type === 'SET') {
      const newValue = typeof action.payload === 'function'
        ? (action.payload as (prev: T) => T)(state.history[state.index])
        : action.payload;
      if(state.history.length > maxHistory.current) {
        return { ...state, history: [...state.history.slice(1, state.index + 1), newValue], index: state.index };
      }
      return { ...state, history: [...state.history.slice(0, state.index + 1), newValue], index: state.index + 1 };
    }
    if(action.type === 'UNDO') {      
      if (state.index === 0) return state;
      return { ...state, index: state.index - 1 };
    }
    if(action.type === 'REDO') {
      if (state.index === state.history.length - 1) return state;
      return { ...state, index: state.index + 1 };
    }
    if(action.type === 'CLEAR') {
      return { history: [initialValue], index: 0 };
    }
    return state;
  }, {history: [initialValue], index: 0}); 


  function set(value: T | ((prev: T) => T)) {
    dispatch({ type: 'SET', payload: value });
  }

  function undo() {
    dispatch({ type: 'UNDO' });
  }

  function redo() {
    dispatch({ type: 'REDO' }); 
  }

  function clear() {
    dispatch({ type: 'CLEAR' });
  }
  return {
      state: state.history[state.index],
      set,
      undo,
      redo,
      clear,
      canUndo: state.index > 0,
      canRedo: state.index < state.history.length - 1,
      history: state.history,
      historyIndex: state.index,
  }
}
