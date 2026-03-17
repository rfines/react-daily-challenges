import { render, screen, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import TimerDashboard, { useTimer } from './TimerDashboard'
import { renderHook } from '@testing-library/react'

describe('useTimer hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start at 0', () => {
    const { result } = renderHook(() => useTimer(100))
    expect(result.current.count).toBe(0)
    expect(result.current.isRunning).toBe(false)
  })

  it('should increment count correctly over multiple ticks', () => {
    const { result } = renderHook(() => useTimer(100))

    act(() => {
      result.current.start()
    })

    // After 5 ticks (500ms), count should be 5 — not stuck at 1
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current.count).toBe(5)
  })

  it('should continue counting beyond the first tick (no stale closure)', () => {
    const { result } = renderHook(() => useTimer(100))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.count).toBe(1)

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.count).toBe(2)

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.count).toBe(3)
  })

  it('should stop incrementing when stopped', () => {
    const { result } = renderHook(() => useTimer(100))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.count).toBe(3)

    act(() => {
      result.current.stop()
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Count should stay at 3 after stopping
    expect(result.current.count).toBe(3)
    expect(result.current.isRunning).toBe(false)
  })

  it('should reset count and laps', () => {
    const { result } = renderHook(() => useTimer(100))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    act(() => {
      result.current.recordLap()
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.count).toBe(0)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.laps).toEqual([])
  })

  it('should record laps with the CURRENT count, not a stale value', () => {
    const { result } = renderHook(() => useTimer(100))

    act(() => {
      result.current.start()
    })

    // Advance to count = 3, record a lap
    act(() => {
      vi.advanceTimersByTime(300)
    })

    act(() => {
      result.current.recordLap()
    })

    expect(result.current.laps).toEqual([3])

    // Advance to count = 7, record another lap
    act(() => {
      vi.advanceTimersByTime(400)
    })

    act(() => {
      result.current.recordLap()
    })

    // Both laps should have the correct counts — not [0, 0] or [3, 3]
    expect(result.current.laps).toEqual([3, 7])
  })

  it('should clean up the interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { result, unmount } = renderHook(() => useTimer(100))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Unmount while running — should clear the interval
    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })

  it('should clean up the interval when stopping', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    const { result } = renderHook(() => useTimer(100))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    act(() => {
      result.current.stop()
    })

    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })
})

describe('TimerDashboard component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render initial state', () => {
    render(<TimerDashboard />)

    expect(screen.getByRole('status')).toHaveTextContent('0')
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lap/i })).toBeDisabled()
  })

  it('should start counting when Start is clicked', () => {
    render(<TimerDashboard />)

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /start/i }))
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(screen.getByRole('status')).toHaveTextContent('3')
  })

  it('should switch Start button to Stop when running', () => {
    render(<TimerDashboard />)

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /start/i }))
    })

    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /start/i })).not.toBeInTheDocument()
  })

  it('should enable Lap button when running', () => {
    render(<TimerDashboard />)

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /start/i }))
    })

    expect(screen.getByRole('button', { name: /lap/i })).toBeEnabled()
  })

  it('should display laps with correct values', () => {
    render(<TimerDashboard />)

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /start/i }))
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /lap/i }))
    })

    const lapList = screen.getByRole('list', { name: /lap list/i })
    expect(lapList).toHaveTextContent('Lap 1: 3')
  })

  it('should not update state after unmounting', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { unmount } = render(<TimerDashboard />)

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /start/i }))
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    unmount()

    // Advancing timers after unmount should NOT produce React warnings
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Check no React state-update-on-unmounted-component warnings
    const reactWarnings = consoleSpy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('unmounted')
    )
    expect(reactWarnings).toHaveLength(0)

    consoleSpy.mockRestore()
  })
})
