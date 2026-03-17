export interface MutationOptions<TData, TVariable> {
  /** The async function that performs the real server-side mutation. */
  mutationFn: (variable: TVariable) => Promise<TData>;

  /**
   * Produces the next optimistic state given the current state and the
   * variable being sent to the server. Called synchronously before the
   * mutationFn promise settles.
   */
  optimisticUpdater: (currentState: TData, variable: TVariable) => TData;

  /** Called when the mutationFn resolves successfully. */
  onSuccess?: (data: TData) => void;

  /** Called when the mutationFn rejects. Receives the rolled-back state. */
  onError?: (error: unknown, rolledBackState: TData) => void;
}

export interface MutationResult<TData, TVariable> {
  /** The current optimistic state (confirmed state + all pending layers). */
  optimisticState: TData;

  /**
   * The last confirmed server state (the result of the most recently
   * resolved mutationFn, or the initial state if nothing has resolved yet).
   */
  confirmedState: TData;

  /** Whether any mutation is currently in-flight. */
  isPending: boolean;

  /** The error from the most recently failed mutation, or null. */
  error: unknown | null;

  /** Trigger a new mutation. */
  mutate: (variable: TVariable) => void;

  /** Reset error state. */
  clearError: () => void;
}
