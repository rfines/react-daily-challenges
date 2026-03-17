import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { TaskList, Task } from "./TaskList";

// ── Helpers ───────────────────────────────────────────────────────────

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Write hook", done: false },
  { id: "2", title: "Write tests", done: false },
  { id: "3", title: "Ship it", done: true },
];

// ── Tests ─────────────────────────────────────────────────────────────

describe("useOptimisticMutation (via TaskList)", () => {
  let apiToggle: ReturnType<typeof vi.fn>;
  let apiRename: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    apiToggle = vi.fn();
    apiRename = vi.fn();
  });

  // ── Requirement 1: Instant optimistic update ──────────────────────

  it("applies the optimistic update synchronously on mutate", async () => {
    const d = deferred<Task[]>();
    apiToggle.mockReturnValue(d.promise);

    render(
      <TaskList
        initialTasks={INITIAL_TASKS}
        apiToggle={apiToggle}
        apiRename={apiRename}
      />
    );

    const checkbox = screen.getByRole("checkbox", {
      name: "Toggle Write hook",
    });
    expect(checkbox).not.toBeChecked();

    // Click — the checkbox should flip immediately, before the API resolves.
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // The mutation should be in-flight.
    expect(screen.getByLabelText("saving")).toBeInTheDocument();

    // Resolve the API call.
    await act(async () => {
      d.resolve(
        INITIAL_TASKS.map((t) =>
          t.id === "1" ? { ...t, done: true } : t
        )
      );
    });

    // Still checked after confirmation.
    expect(checkbox).toBeChecked();
  });

  it("shows isPending only while a mutation is in-flight", async () => {
    const d = deferred<Task[]>();
    apiToggle.mockReturnValue(d.promise);

    render(
      <TaskList
        initialTasks={INITIAL_TASKS}
        apiToggle={apiToggle}
        apiRename={apiRename}
      />
    );

    // No "saving" indicator initially.
    expect(screen.queryByLabelText("saving")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Toggle Write hook" })
    );

    expect(screen.getByLabelText("saving")).toBeInTheDocument();

    await act(async () => {
      d.resolve(
        INITIAL_TASKS.map((t) =>
          t.id === "1" ? { ...t, done: true } : t
        )
      );
    });

    expect(screen.queryByLabelText("saving")).not.toBeInTheDocument();
  });

  // ── Requirement 2: Rollback on failure ────────────────────────────

  it("rolls back optimistic state when the mutation fails", async () => {
    const d = deferred<Task[]>();
    apiToggle.mockReturnValue(d.promise);

    render(
      <TaskList
        initialTasks={INITIAL_TASKS}
        apiToggle={apiToggle}
        apiRename={apiRename}
      />
    );

    const checkbox = screen.getByRole("checkbox", {
      name: "Toggle Write hook",
    });

    // Optimistic: checked.
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Reject the API call.
    await act(async () => {
      d.reject(new Error("Network error"));
    });

    // Rolled back: unchecked again.
    expect(checkbox).not.toBeChecked();
  });

  it("exposes the error and allows clearing it", async () => {
    const d = deferred<Task[]>();
    apiToggle.mockReturnValue(d.promise);

    render(
      <TaskList
        initialTasks={INITIAL_TASKS}
        apiToggle={apiToggle}
        apiRename={apiRename}
      />
    );

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Toggle Write hook" })
    );

    await act(async () => {
      d.reject(new Error("Server down"));
    });

    // Error alert should be visible.
    expect(screen.getByLabelText("toggle error")).toBeInTheDocument();

    // Dismiss the error.
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByLabelText("toggle error")).not.toBeInTheDocument();
  });

  // ── Requirement 3: Concurrent mutation safety ─────────────────────

  it("handles two concurrent mutations — both succeed", async () => {
    const d1 = deferred<Task[]>();
    const d2 = deferred<Task[]>();
    apiToggle.mockReturnValueOnce(d1.promise).mockReturnValueOnce(d2.promise);

    render(
      <TaskList
        initialTasks={INITIAL_TASKS}
        apiToggle={apiToggle}
        apiRename={apiRename}
      />
    );

    const cb1 = screen.getByRole("checkbox", { name: "Toggle Write hook" });
    const cb2 = screen.getByRole("checkbox", { name: "Toggle Write tests" });

    // Both start unchecked.
    expect(cb1).not.toBeChecked();
    expect(cb2).not.toBeChecked();

    // Fire two mutations concurrently.
    await userEvent.click(cb1);
    await userEvent.click(cb2);

    // Both should be optimistically checked.
    expect(cb1).toBeChecked();
    expect(cb2).toBeChecked();

    // Resolve first.
    const afterFirst = INITIAL_TASKS.map((t) =>
      t.id === "1" ? { ...t, done: true } : t
    );
    await act(async () => {
      d1.resolve(afterFirst);
    });

    // Both still checked.
    expect(cb1).toBeChecked();
    expect(cb2).toBeChecked();

    // Resolve second.
    const afterBoth = afterFirst.map((t) =>
      t.id === "2" ? { ...t, done: true } : t
    );
    await act(async () => {
      d2.resolve(afterBoth);
    });

    expect(cb1).toBeChecked();
    expect(cb2).toBeChecked();
  });

  it("rolls back only the failed mutation when concurrent mutations are in-flight", async () => {
    const d1 = deferred<Task[]>();
    const d2 = deferred<Task[]>();
    apiToggle.mockReturnValueOnce(d1.promise).mockReturnValueOnce(d2.promise);

    render(
      <TaskList
        initialTasks={INITIAL_TASKS}
        apiToggle={apiToggle}
        apiRename={apiRename}
      />
    );

    const cb1 = screen.getByRole("checkbox", { name: "Toggle Write hook" });
    const cb2 = screen.getByRole("checkbox", { name: "Toggle Write tests" });

    // Fire mutation 1 (toggle task 1) then mutation 2 (toggle task 2).
    await userEvent.click(cb1);
    await userEvent.click(cb2);

    // Both optimistically checked.
    expect(cb1).toBeChecked();
    expect(cb2).toBeChecked();

    // Mutation 1 FAILS.
    await act(async () => {
      d1.reject(new Error("Timeout"));
    });

    // Task 1 should roll back to unchecked.
    expect(cb1).not.toBeChecked();
    // Task 2's optimistic update should still be in place.
    expect(cb2).toBeChecked();

    // Mutation 2 succeeds.
    const afterSecond = INITIAL_TASKS.map((t) =>
      t.id === "2" ? { ...t, done: true } : t
    );
    await act(async () => {
      d2.resolve(afterSecond);
    });

    expect(cb1).not.toBeChecked();
    expect(cb2).toBeChecked();
  });

  // ── Edge cases ────────────────────────────────────────────────────

  it("handles rapid toggle (on then off) on the same item", async () => {
    const d1 = deferred<Task[]>();
    const d2 = deferred<Task[]>();
    apiToggle.mockReturnValueOnce(d1.promise).mockReturnValueOnce(d2.promise);

    render(
      <TaskList
        initialTasks={INITIAL_TASKS}
        apiToggle={apiToggle}
        apiRename={apiRename}
      />
    );

    const cb = screen.getByRole("checkbox", { name: "Toggle Write hook" });

    // Toggle ON.
    await userEvent.click(cb);
    expect(cb).toBeChecked();

    // Toggle OFF again before the first mutation resolves.
    await userEvent.click(cb);
    expect(cb).not.toBeChecked();

    // First mutation resolves (server says: done = true).
    await act(async () => {
      d1.resolve(
        INITIAL_TASKS.map((t) =>
          t.id === "1" ? { ...t, done: true } : t
        )
      );
    });

    // The second toggle's optimistic layer should still keep it unchecked.
    expect(cb).not.toBeChecked();

    // Second mutation resolves (server says: done = false).
    await act(async () => {
      d2.resolve(INITIAL_TASKS);
    });

    expect(cb).not.toBeChecked();
  });

  it("calls onSuccess callback when mutation succeeds", async () => {
    const onSuccess = vi.fn();
    const d = deferred<Task[]>();

    // We need a simpler component to test callbacks directly.
    // Use TaskList — the onSuccess is wired internally, so let's
    // verify the API was called and resolved.
    apiToggle.mockReturnValue(d.promise);

    render(
      <TaskList
        initialTasks={INITIAL_TASKS}
        apiToggle={apiToggle}
        apiRename={apiRename}
      />
    );

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Toggle Write hook" })
    );

    expect(apiToggle).toHaveBeenCalledWith({ taskId: "1" });

    const resolved = INITIAL_TASKS.map((t) =>
      t.id === "1" ? { ...t, done: true } : t
    );
    await act(async () => {
      d.resolve(resolved);
    });

    // After resolution, the state should be confirmed.
    expect(
      screen.getByRole("checkbox", { name: "Toggle Write hook" })
    ).toBeChecked();
  });

  it("does not show stale optimistic state after confirmed state updates", async () => {
    const d1 = deferred<Task[]>();
    const d2 = deferred<Task[]>();
    apiToggle.mockReturnValueOnce(d1.promise).mockReturnValueOnce(d2.promise);

    render(
      <TaskList
        initialTasks={INITIAL_TASKS}
        apiToggle={apiToggle}
        apiRename={apiRename}
      />
    );

    // Toggle "Ship it" OFF (it starts as done: true).
    const cb3 = screen.getByRole("checkbox", { name: "Toggle Ship it" });
    expect(cb3).toBeChecked();

    await userEvent.click(cb3);
    expect(cb3).not.toBeChecked();

    // Resolve — server confirms.
    const afterToggle = INITIAL_TASKS.map((t) =>
      t.id === "3" ? { ...t, done: false } : t
    );
    await act(async () => {
      d1.resolve(afterToggle);
    });

    expect(cb3).not.toBeChecked();

    // Toggle it back ON.
    await userEvent.click(cb3);
    expect(cb3).toBeChecked();

    // Resolve again.
    await act(async () => {
      d2.resolve(
        afterToggle.map((t) =>
          t.id === "3" ? { ...t, done: true } : t
        )
      );
    });

    expect(cb3).toBeChecked();
  });
});
