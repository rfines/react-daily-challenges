import { useCallback, useEffect, useRef, useState, useOptimistic } from "react";
import { MutationOptions, MutationResult } from "./types";

/**
 * useOptimisticMutation
 *
 * A hook that manages optimistic local state while async mutations are
 * in-flight. Supports concurrent mutations with per-mutation rollback.
 *
 * @param initialState - The starting confirmed state.
 * @param options      - Configuration (mutationFn, optimisticUpdater, callbacks).
 * @returns            - The MutationResult object.
 */
export function useOptimisticMutation<TData, TVariable>(
  initialState: TData,
  options: MutationOptions<TData, TVariable>
): MutationResult<TData, TVariable> {
  // inflight mutation = { variable: TVariable, pending: boolean, fn: ((variable: TVariable) => Promise<TData>), id: string }
  // 
  const optimisticStateRef = useRef(initialState);
  const confirmedStateRef = useRef(initialState);
  const inflightMutationsRef = useRef<Record<string, TVariable | TData | boolean | string | ((variable: TVariable) => Promise<TData>)>[]>([]);
  const [optimisticState, setOptimisticState] = useState<TData>(initialState);
  const [confirmedState, setConfirmendState] = useState<TData>(initialState); //source of
  const [inflightMutations, setInFlightMutations] = useState<Record<string, TVariable | TData | boolean | string | ((variable: TVariable) => Promise<TData>)>[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<unknown | null>();
  const clearError = useCallback(()=> setError(() => null), []) 
  useEffect(()=> {
    optimisticStateRef.current = optimisticState;
  },[optimisticState])
  useEffect(()=> {
    confirmedStateRef.current = confirmedState;
  },[confirmedState])

  async function mutate(variable: TVariable) {
    setPendingCount((prev) => prev + 1);
    const mutationId = crypto.randomUUID();
    inflightMutationsRef.current = [...inflightMutationsRef.current, {variable, pending: true, fn: options.mutationFn, id: mutationId }]
    setInFlightMutations([...inflightMutations, {variable, pending: true, fn: options.mutationFn }])
    optimisticStateRef.current = options.optimisticUpdater(optimisticState, variable);
    setOptimisticState(options.optimisticUpdater(optimisticState, variable))
    try {
      const response = await options.mutationFn(variable);
      setConfirmendState(response);
    } catch (error) {
      setError(error)
      options.onError?.(error, optimisticStateRef.current);
      //rollback only the failed mutation by removing it from the inflight list and recomputing optimistic state, if multiple mutations are pending, only the one that fails should be rolled back
      inflightMutationsRef.current = inflightMutationsRef.current.map((mutation) => {
        if (mutation.id === mutationId) {
          return { ...mutation, pending: false }
        }
        return mutation;
      })
      
      optimisticStateRef.current = inflightMutationsRef.current.reduce((state, mutation) => {
        if (mutation.pending) {
          return options.optimisticUpdater(state, mutation.variable as TVariable);
        }
        return state;
      }, confirmedStateRef.current);
      setOptimisticState(inflightMutationsRef.current.reduce((state, mutation) => {
        if (mutation.pending) {
          return options.optimisticUpdater(state, mutation.variable as TVariable);
        }
        return state;
      }, confirmedStateRef.current))
    } finally {
      setPendingCount((prev) => prev - 1);
      inflightMutationsRef.current = inflightMutationsRef.current.slice(0, inflightMutationsRef.current.findIndex((i) => i.pending === true && i.id === mutationId));
    }
    
    return
  }
  // TODO: Implement this hook.
  //
  // Key things to figure out:
  // 1. How to track the "confirmed" server state separately from the
  //    optimistic layers.
  // 2. How to represent pending mutations so that each one's optimistic
  //    transform can be independently removed on failure.
  // 3. How to derive the final optimistic state from confirmed + all
  //    pending layers.
  // 4. How to handle the resolved/rejected lifecycle of each mutation
  //    and trigger the right state updates.
  //
  // Good luck!

  return { optimisticState, mutate, clearError, error, isPending: pendingCount > 0, confirmedState }
 
}
