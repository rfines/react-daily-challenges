import { useCallback, useRef, useState } from "react";
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

  throw new Error("Not implemented — this is your challenge!");
}
