import { useState, useEffect, useCallback, useRef } from 'react'

// --- Custom Hook: useTimer ---

interface UseTimerReturn {
  count: number
  isRunning: boolean
  start: () => void
  stop: () => void
  reset: () => void
  laps: number[]
  recordLap: () => void
}

export function useTimer(intervalMs: number = 1000): UseTimerReturn {
  const countRef = useRef(0)
  const [count, setCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])

  useEffect(() => {
    countRef.current = count
  }, [count])
  
  
  // BUG 1: This effect has a stale closure over `count`.
  // The setInterval callback captures the initial `count` value (0)
  // and never sees updates because `count` isn't in the dependency array,
  // but adding it would cause the interval to be torn down and recreated every tick.
 
  useEffect(() => {
    if (!isRunning) return

    const id = setInterval(() => {
      setCount((prev) => {return prev+1})
    }, intervalMs)

    // BUG 3: Missing cleanup — the interval is never cleared.
    // When `isRunning` changes or the component unmounts, the interval
    // keeps firing and calling setCount on an unmounted component.
    return () => clearInterval(id)
  }, [intervalMs, isRunning])
  
  
  const start = useCallback(() => {
    setIsRunning(() => {return true})
  }, [])

  const stop = useCallback(() => {
    setIsRunning(() => {return false})
  }, [])

  const reset = useCallback(() => {
    countRef.current = 0;
    setIsRunning((prev) => {return false})
    setCount((prev) => {return 0})
    setLaps((prev) => {return []})
  }, [])

  // BUG 2: This callback captures `count` at creation time due to
  // the empty dependency array. Every call to recordLap pushes the
  // same stale value instead of the current count.
  const recordLap = useCallback(() => {
    setLaps((prev) => [...prev, countRef.current])
  }, [])

  return { count, isRunning, start, stop, reset, laps, recordLap }
}

// --- Component: TimerDashboard ---

export default function TimerDashboard() {
  const { count, isRunning, start, stop, reset, laps, recordLap } = useTimer(100)

  return (
    <div>
      <h1>Timer Dashboard</h1>

      <div aria-label="timer count" role="status">
        {count}
      </div>

      <div>
        {!isRunning ? (
          <button onClick={start}>Start</button>
        ) : (
          <button onClick={stop}>Stop</button>
        )}
        <button onClick={reset}>Reset</button>
        <button onClick={recordLap} disabled={!isRunning}>
          Lap
        </button>
      </div>

      {laps.length > 0 && (
        <div>
          <h2>Laps</h2>
          <ol aria-label="lap list">
            {laps.map((lap, i) => (
              <li key={i}>Lap {i + 1}: {lap}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
