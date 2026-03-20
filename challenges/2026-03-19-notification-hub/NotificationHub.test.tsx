/**
 * NotificationHub test suite.
 *
 * DO NOT MODIFY THIS FILE.
 *
 * All tests are currently failing because of 3 bugs in NotificationHub.tsx.
 * Fix the bugs until every test is green.
 */

import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificationHub } from './NotificationHub';
import type { AppNotification } from './NotificationHub';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SUCCESS: AppNotification = {
  id: 's1',
  kind: 'success',
  message: 'File uploaded successfully',
  autoClose: false,
};

const RETRYABLE_ERROR: AppNotification = {
  id: 'e1',
  kind: 'error',
  message: 'Gateway timeout',
  code: 504,
  retryable: true,
};

const FATAL_ERROR: AppNotification = {
  id: 'e2',
  kind: 'error',
  message: 'Not found',
  code: 404,
  retryable: false,
};

const WARNING: AppNotification = {
  id: 'w1',
  kind: 'warning',
  message: 'Session expires in 5 minutes',
  acknowledged: false,
};

const INFO: AppNotification = {
  id: 'i1',
  kind: 'info',
  message: 'New version available',
  source: 'updater',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NotificationHub', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // ── Icons ──────────────────────────────────────────────────────────────────

  describe('notification icons', () => {
    it.each([
      ['success', SUCCESS,        '✅'],
      ['error',   RETRYABLE_ERROR, '❌'],
      ['warning', WARNING,         '⚠️'], // BUG 1: currently renders '❓'
      ['info',    INFO,            'ℹ️'],
    ] as const)('renders %s icon correctly', (_kind, notification, expectedIcon) => {
      render(<NotificationHub initialNotifications={[notification]} />);
      expect(screen.getByText(expectedIcon)).toBeInTheDocument();
    });
  });

  // ── Error metadata ─────────────────────────────────────────────────────────

  describe('error notification metadata', () => {
    it('shows "Retryable" for retryable errors', () => {
      render(<NotificationHub initialNotifications={[RETRYABLE_ERROR]} />);
      // BUG 3: with inverted ternary this renders "Code: 504" instead
      const metadata = screen.getByLabelText('retryable error');
      expect(metadata).toHaveTextContent('Retryable');
    });

    it('shows error code for non-retryable errors', () => {
      render(<NotificationHub initialNotifications={[FATAL_ERROR]} />);
      // BUG 3: with inverted ternary this renders "Retryable" instead
      const metadata = screen.getByLabelText('error code 404');
      expect(metadata).toHaveTextContent('Code: 404');
    });
  });

  // ── Dismiss ────────────────────────────────────────────────────────────────

  describe('dismissing notifications', () => {
    it('removes only the targeted notification from an initial list', () => {
      render(<NotificationHub initialNotifications={[SUCCESS, WARNING]} />);

      const successAlert = screen.getByRole('alert', {
        name: /success notification: File uploaded successfully/i,
      });
      fireEvent.click(within(successAlert).getByRole('button', { name: /dismiss/i }));

      expect(screen.queryByText(SUCCESS.message)).not.toBeInTheDocument();
      expect(screen.getByText(WARNING.message)).toBeInTheDocument();
    });

    it('removes the only dynamically-added notification and shows empty state', () => {
      render(<NotificationHub />);

      fireEvent.click(screen.getByRole('button', { name: /add warning/i }));
      expect(screen.getByText('Low disk space on /dev/sda1')).toBeInTheDocument();

      const alert = screen.getByRole('alert', { name: /warning notification/i });
      fireEvent.click(within(alert).getByRole('button', { name: /dismiss/i }));

      expect(screen.getByText(/All clear/i)).toBeInTheDocument();
    });

    it('only removes the targeted notification when multiple dynamic ones exist', () => {
      // BUG 2: stale closure makes setNotifications run on the initial [] snapshot,
      // which clears *all* notifications rather than just the dismissed one.
      render(<NotificationHub />);

      fireEvent.click(screen.getByRole('button', { name: /add warning/i }));
      fireEvent.click(screen.getByRole('button', { name: /add error/i }));

      expect(screen.getAllByRole('alert')).toHaveLength(2);

      const warningAlert = screen.getByRole('alert', { name: /warning notification/i });
      fireEvent.click(within(warningAlert).getByRole('button', { name: /dismiss/i }));

      expect(
        screen.queryByRole('alert', { name: /warning notification/i }),
      ).not.toBeInTheDocument();
      // BUG 2: this fails — the error notification disappears too
      expect(screen.getByRole('alert', { name: /error notification/i })).toBeInTheDocument();
    });
  });

  // ── Auto-close ─────────────────────────────────────────────────────────────

  describe('auto-close behavior', () => {
    it('automatically dismisses a success notification after autoCloseDelay ms', () => {
      const autoClose: AppNotification = {
        id: 'ac1',
        kind: 'success',
        message: 'Changes saved',
        autoClose: true,
        autoCloseDelay: 2000,
      };
      render(<NotificationHub initialNotifications={[autoClose]} />);

      expect(screen.getByText('Changes saved')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.queryByText('Changes saved')).not.toBeInTheDocument();
    });

    it('never auto-dismisses when autoClose is false', () => {
      render(<NotificationHub initialNotifications={[SUCCESS]} />);

      act(() => {
        vi.advanceTimersByTime(10_000);
      });

      expect(screen.getByText(SUCCESS.message)).toBeInTheDocument();
    });

    it('leaves other notifications intact after an auto-close fires', () => {
      // BUG 2: even through the auto-close timer path, the stale closure means
      // the timer's dismissal call wipes dynamically-added notifications.
      const autoClose: AppNotification = {
        id: 'ac2',
        kind: 'success',
        message: 'Sync complete',
        autoClose: true,
        autoCloseDelay: 1000,
      };
      render(<NotificationHub initialNotifications={[autoClose]} />);

      // Add a dynamic notification after mount — now state has 2 items,
      // but the memoized dismissNotification still sees only [autoClose]
      fireEvent.click(screen.getByRole('button', { name: /add warning/i }));
      expect(screen.getByText('Low disk space on /dev/sda1')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // 'Sync complete' should be gone; the warning must still be visible
      expect(screen.queryByText('Sync complete')).not.toBeInTheDocument();
      // BUG 2: fails — stale closure also deletes the dynamically-added warning
      expect(screen.getByText('Low disk space on /dev/sda1')).toBeInTheDocument();
    });
  });

  // ── Accessibility ──────────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('renders an accessible region for active notifications', () => {
      render(<NotificationHub />);
      expect(
        screen.getByRole('region', { name: /active notifications/i }),
      ).toBeInTheDocument();
    });

    it('exposes a live notification count', () => {
      render(<NotificationHub initialNotifications={[SUCCESS, WARNING, INFO]} />);
      expect(screen.getByText('3 active')).toBeInTheDocument();
    });

    it('each notification has an accessible alert with a descriptive label', () => {
      render(<NotificationHub initialNotifications={[SUCCESS, WARNING]} />);

      expect(
        screen.getByRole('alert', {
          name: /success notification: File uploaded successfully/i,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole('alert', {
          name: /warning notification: Session expires in 5 minutes/i,
        }),
      ).toBeInTheDocument();
    });
  });
});
