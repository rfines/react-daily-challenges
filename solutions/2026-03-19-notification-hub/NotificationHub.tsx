/**
 * NotificationHub — a centralised notification system built on a discriminated union.
 *
 * This file contains 3 bugs. Find and fix them to make all tests pass.
 * Do NOT modify the test file.
 *
 * BUG 1: One notification kind is missing from getIcon(), so it always renders the
 *        wrong icon. TypeScript doesn't flag it because a `default` case is present.
 *
 * BUG 2: dismissNotification captures a stale snapshot of `notifications` in its
 *        closure and never updates. Dismissing a dynamically-added notification can
 *        clobber unrelated notifications that were added after mount.
 *
 * BUG 3: The ternary that renders error metadata (retryable vs. error code) is
 *        inverted — retryable errors show the code, non-retryable errors show
 *        "Retryable".
 */

import { useState, useCallback, useEffect } from 'react';

// ─── Discriminated union ──────────────────────────────────────────────────────

type BaseNotification = {
  id: string;
  message: string;
};

export type SuccessNotification = BaseNotification & {
  kind: 'success';
  autoClose: boolean;
  autoCloseDelay?: number;
};

export type ErrorNotification = BaseNotification & {
  kind: 'error';
  code: number;
  retryable: boolean;
};

export type WarningNotification = BaseNotification & {
  kind: 'warning';
  acknowledged: boolean;
};

export type InfoNotification = BaseNotification & {
  kind: 'info';
  source: string;
};

export type AppNotification =
  | SuccessNotification
  | ErrorNotification
  | WarningNotification
  | InfoNotification;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// BUG 1: The 'warning' case is absent. Because `default` is present TypeScript
// raises no error, but warning notifications silently render '❓' instead of '⚠️'.
function getIcon(notification: AppNotification): string {
  switch (notification.kind) {
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'info':
      return 'ℹ️';
    default:
      return '❓';
  }
}

function getBackgroundColor(kind: AppNotification['kind']): string {
  const palette: Record<AppNotification['kind'], string> = {
    success: '#2e7d32',
    error:   '#c62828',
    warning: '#e65100',
    info:    '#1565c0',
  };
  return palette[kind];
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: AppNotification;
  onDismiss: (id: string) => void;
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  useEffect(() => {
    if (notification.kind !== 'success' || !notification.autoClose) return;
    const delay = notification.autoCloseDelay ?? 3000;
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, delay);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  return (
    <div
      role="alert"
      aria-label={`${notification.kind} notification: ${notification.message}`}
      style={{
        backgroundColor: getBackgroundColor(notification.kind),
        color: 'white',
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '1.2em' }}>
        {getIcon(notification)}
      </span>

      <span style={{ flex: 1 }}>{notification.message}</span>

      {notification.kind === 'error' && (
        <span
          aria-label={
            notification.retryable
              ? 'retryable error'
              : `error code ${notification.code}`
          }
          style={{ fontSize: '0.75em', opacity: 0.85, whiteSpace: 'nowrap' }}
        >
          {/* BUG 3: The ternary is inverted. retryable === true should produce
              "Retryable"; retryable === false should produce "Code: {code}".
              Currently it is the other way around. */}
          {notification.retryable ? 'Retryable': `Code: ${notification.code}`}
        </span>
      )}

      <button
        onClick={() => onDismiss(notification.id)}
        aria-label={`Dismiss ${notification.kind} notification`}
        style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,0.6)',
          color: 'white',
          cursor: 'pointer',
          borderRadius: '4px',
          padding: '2px 10px',
          fontSize: '1em',
        }}
      >
        ×
      </button>
    </div>
  );
}

// ─── NotificationHub ──────────────────────────────────────────────────────────

export interface NotificationHubProps {
  initialNotifications?: AppNotification[];
}

export function NotificationHub({ initialNotifications = [] }: NotificationHubProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  // BUG 2: `notifications` is captured in a stale closure.
  // The empty dependency array means this callback always operates on the value of
  // `notifications` from the very first render (i.e. `initialNotifications`, which
  // defaults to []). Any notification added *after* mount is invisible to this
  // function — so the filter runs against a stale snapshot and can wipe every
  // notification that was added dynamically.
  //
  // Fix: use the functional-updater form so React supplies the latest state:
  //   setNotifications(prev => prev.filter((n) => n.id !== id))
  const dismissNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id)); // BUG 2
    },
    [] // BUG 2: `notifications` must be in deps, or use functional updater instead
  );

  const addNotification = useCallback((notification: AppNotification) => {
    setNotifications((prev) => [...prev, notification]);
  }, []);

  return (
    <div aria-label="Notification hub">
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.1em' }}>Notifications</h2>
        <span aria-live="polite" aria-atomic="true" style={{ fontSize: '0.875em', color: '#555' }}>
          {notifications.length} active
        </span>
      </header>

      <div role="region" aria-label="Active notifications">
        {notifications.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>All clear — no notifications</p>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onDismiss={dismissNotification} />
          ))
        )}
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() =>
            addNotification({
              id: `w-${Date.now()}`,
              kind: 'warning',
              message: 'Low disk space on /dev/sda1',
              acknowledged: false,
            })
          }
        >
          Add Warning
        </button>
        <button
          onClick={() =>
            addNotification({
              id: `e-${Date.now()}`,
              kind: 'error',
              message: 'Failed to sync',
              code: 503,
              retryable: true,
            })
          }
        >
          Add Error
        </button>
        <button
          onClick={() =>
            addNotification({
              id: `s-${Date.now()}`,
              kind: 'success',
              message: 'Export complete',
              autoClose: false,
            })
          }
        >
          Add Success
        </button>
      </div>
    </div>
  );
}
