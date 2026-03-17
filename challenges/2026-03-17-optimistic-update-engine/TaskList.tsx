import React from "react";
import { useOptimisticMutation } from "./useOptimisticMutation";

// ── Domain types ──────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  done: boolean;
}

interface ToggleVariable {
  taskId: string;
}

interface RenameVariable {
  taskId: string;
  newTitle: string;
}

// ── Simulated API ─────────────────────────────────────────────────────

export type ApiToggle = (v: ToggleVariable) => Promise<Task[]>;
export type ApiRename = (v: RenameVariable) => Promise<Task[]>;

// ── Component ─────────────────────────────────────────────────────────

interface TaskListProps {
  initialTasks: Task[];
  apiToggle: ApiToggle;
  apiRename: ApiRename;
}

/**
 * TaskList uses the useOptimisticMutation hook to give instant feedback
 * when the user toggles a task or renames it.
 *
 * This component is provided as-is — you should NOT need to modify it.
 * Focus on making useOptimisticMutation work correctly so this component
 * behaves as the tests expect.
 */
export function TaskList({ initialTasks, apiToggle, apiRename }: TaskListProps) {
  const toggle = useOptimisticMutation<Task[], ToggleVariable>(initialTasks, {
    mutationFn: apiToggle,
    optimisticUpdater: (tasks, { taskId }) =>
      tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    onError: (err) => {
      console.error("Toggle failed:", err);
    },
  });

  const rename = useOptimisticMutation<Task[], RenameVariable>(initialTasks, {
    mutationFn: apiRename,
    optimisticUpdater: (tasks, { taskId, newTitle }) =>
      tasks.map((t) => (t.id === taskId ? { ...t, title: newTitle } : t)),
    onError: (err) => {
      console.error("Rename failed:", err);
    },
  });

  const tasks = toggle.optimisticState;

  return (
    <div>
      <h1>Tasks</h1>

      {toggle.error && (
        <div role="alert" aria-label="toggle error">
          Toggle failed.{" "}
          <button onClick={toggle.clearError}>Dismiss</button>
        </div>
      )}

      {rename.error && (
        <div role="alert" aria-label="rename error">
          Rename failed.{" "}
          <button onClick={rename.clearError}>Dismiss</button>
        </div>
      )}

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <label>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggle.mutate({ taskId: task.id })}
                aria-label={`Toggle ${task.title}`}
              />
              <span
                style={{
                  textDecoration: task.done ? "line-through" : "none",
                }}
              >
                {task.title}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {toggle.isPending && <p aria-label="saving">Saving...</p>}
    </div>
  );
}
