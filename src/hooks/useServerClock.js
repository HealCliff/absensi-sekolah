import { useEffect, useState } from 'react'
import { useServerClockStore } from '../store/serverClockStore'

export function useServerClock() {
  const fetchServerTime = useServerClockStore((state) => state.fetchServerTime)
  const getNow = useServerClockStore((state) => state.getNow)
  const [now, setNow] = useState(() => getNow())

  useEffect(() => {
    fetchServerTime().catch(() => {})
    const timer = setInterval(() => setNow(getNow()), 1000)
    return () => clearInterval(timer)
  }, [fetchServerTime, getNow])

  return now
}
