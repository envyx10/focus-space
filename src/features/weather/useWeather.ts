import { useEffect, useState } from 'react'
import { fetchWeather, type Now } from './api'

/** The weather where the device is, or null. Called once in App: the header and the phone's clock panel share it. */
export function useWeather(): Now | null {
  const [now, setNow] = useState<Now | null>(null)

  // Locates again on every refresh, so a laptop that moved shows the weather where it is now.
  useEffect(() => {
    // Older versions stored a town looked up from the IP; nothing reads it any more.
    try {
      localStorage.removeItem('focus-space:place')
    } catch {
      // storage unavailable: nothing to clean
    }
    let alive = true
    const load = () =>
      fetchWeather()
        .then((n) => alive && n && setNow(n))
        .catch(() => {}) // offline: keep the last reading
    load()
    const id = setInterval(load, 30 * 60_000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  return now
}
