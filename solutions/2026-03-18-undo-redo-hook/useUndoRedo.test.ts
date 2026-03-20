import { act, renderHook } from '@testing-library/react';
import { useUndoRedo } from './useUndoRedo';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render the hook and return a stable `result` ref. */
function setup<T>(initialValue: T, options?: Parameters<typeof useUndoRedo>[1]) {
  return renderHook(() => useUndoRedo(initialValue, options));
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('useUndoRedo — initial state', () => {
  it('returns the initial value as state', () => {
    const { result } = setup(42);
    expect(result.current.state).toBe(42);
  });

  it('works with object initial values', () => {
    const { result } = setup({ x: 0, y: 0 });
    expect(result.current.state).toEqual({ x: 0, y: 0 });
  });

  it('starts with canUndo false and canRedo false', () => {
    const { result } = setup('hello');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('starts with history containing only the initial value', () => {
    const { result } = setup(0);
    expect(result.current.history).toEqual([0]);
    expect(result.current.historyIndex).toBe(0);
  });

  it('always satisfies history[historyIndex] === state on mount', () => {
    const { result } = setup('init');
    expect(result.current.history[result.current.historyIndex]).toBe(
      result.current.state,
    );
  });
});

// ---------------------------------------------------------------------------
// set()
// ---------------------------------------------------------------------------

describe('useUndoRedo — set()', () => {
  it('updates state when called with a plain value', () => {
    const { result } = setup(0);
    act(() => result.current.set(5));
    expect(result.current.state).toBe(5);
  });

  it('updates state when called with a functional updater', () => {
    const { result } = setup(10);
    act(() => result.current.set((n) => n + 1));
    expect(result.current.state).toBe(11);
  });

  it('adds the new value to history', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    expect(result.current.history).toEqual([0, 1, 2]);
    expect(result.current.historyIndex).toBe(2);
  });

  it('enables canUndo after first set()', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    expect(result.current.canUndo).toBe(true);
  });

  it('history[historyIndex] === state invariant holds after set()', () => {
    const { result } = setup('a');
    act(() => result.current.set('b'));
    act(() => result.current.set('c'));
    expect(result.current.history[result.current.historyIndex]).toBe(
      result.current.state,
    );
  });

  it('clears the redo stack when set() is called after an undo', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.undo()); // back to 1
    act(() => result.current.set(99)); // branch — redo stack should clear
    expect(result.current.canRedo).toBe(false);
    expect(result.current.state).toBe(99);
    expect(result.current.history).toEqual([0, 1, 99]);
  });
});

// ---------------------------------------------------------------------------
// undo()
// ---------------------------------------------------------------------------

describe('useUndoRedo — undo()', () => {
  it('moves state back by one step', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.undo());
    expect(result.current.state).toBe(1);
  });

  it('is a no-op when canUndo is false', () => {
    const { result } = setup(42);
    act(() => result.current.undo());
    expect(result.current.state).toBe(42);
    expect(result.current.history).toEqual([42]);
  });

  it('enables canRedo after undoing', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);
  });

  it('sets canUndo to false after undoing to the initial value', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    act(() => result.current.undo());
    expect(result.current.canUndo).toBe(false);
  });

  it('can undo multiple steps', () => {
    const { result } = setup('a');
    act(() => result.current.set('b'));
    act(() => result.current.set('c'));
    act(() => result.current.set('d'));
    act(() => result.current.undo());
    act(() => result.current.undo());
    expect(result.current.state).toBe('b');
    expect(result.current.historyIndex).toBe(1);
  });

  it('does not mutate history — only moves the index', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.undo());
    expect(result.current.history).toEqual([0, 1, 2]);
  });
});

// ---------------------------------------------------------------------------
// redo()
// ---------------------------------------------------------------------------

describe('useUndoRedo — redo()', () => {
  it('moves state forward by one step after undo', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.state).toBe(2);
  });

  it('is a no-op when canRedo is false', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    act(() => result.current.redo()); // nothing to redo
    expect(result.current.state).toBe(1);
    expect(result.current.history).toEqual([0, 1]);
  });

  it('sets canRedo to false after redoing to the latest state', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.canRedo).toBe(false);
  });

  it('can redo multiple steps', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.set(3));
    act(() => result.current.undo());
    act(() => result.current.undo());
    act(() => result.current.undo());
    act(() => result.current.redo());
    act(() => result.current.redo());
    expect(result.current.state).toBe(2);
    expect(result.current.historyIndex).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// maxHistory option
// ---------------------------------------------------------------------------

describe('useUndoRedo — maxHistory option', () => {
  it('caps history length at maxHistory + 1 (past entries + current)', () => {
    const { result } = setup(0, { maxHistory: 3 });
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.set(3));
    act(() => result.current.set(4)); // should evict 0
    expect(result.current.history).toEqual([1, 2, 3, 4]);
    expect(result.current.historyIndex).toBe(3);
  });

  it('evicts oldest entry when maxHistory is exceeded', () => {
    const { result } = setup('a', { maxHistory: 2 });
    act(() => result.current.set('b'));
    act(() => result.current.set('c'));
    act(() => result.current.set('d')); // evicts 'a'
    expect(result.current.history[0]).toBe('b');
    expect(result.current.state).toBe('d');
  });

  it('maintains invariant history[historyIndex] === state with maxHistory', () => {
    const { result } = setup(0, { maxHistory: 2 });
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.set(3));
    expect(result.current.history[result.current.historyIndex]).toBe(
      result.current.state,
    );
  });

  it('undo still works correctly when history has been trimmed', () => {
    const { result } = setup(0, { maxHistory: 2 });
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.set(3)); // evicts 0
    act(() => result.current.undo());
    expect(result.current.state).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// clear()
// ---------------------------------------------------------------------------

describe('useUndoRedo — clear()', () => {
  it('resets state to the initial value', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.clear());
    expect(result.current.state).toBe(0);
  });

  it('resets history to [initialValue]', () => {
    const { result } = setup('start');
    act(() => result.current.set('middle'));
    act(() => result.current.set('end'));
    act(() => result.current.clear());
    expect(result.current.history).toEqual(['start']);
    expect(result.current.historyIndex).toBe(0);
  });

  it('sets canUndo and canRedo to false after clear()', () => {
    const { result } = setup(0);
    act(() => result.current.set(1));
    act(() => result.current.undo()); // creates redo stack
    act(() => result.current.clear());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('works correctly if called on an already-fresh hook', () => {
    const { result } = setup(7);
    act(() => result.current.clear());
    expect(result.current.state).toBe(7);
    expect(result.current.history).toEqual([7]);
  });
});
