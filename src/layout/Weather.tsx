import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'

type Now = { temp: number; code: number }

/** WMO weather code → our label key. */
export function sky(code: number): 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm' {
  if (code === 0) return 'clear'
  if (code <= 3) return 'cloudy'
  if (code <= 48) return 'fog'
  if (code >= 95) return 'storm'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  return 'rain'
}

// The device's own position (GPS/Wi-Fi), rounded to ~1 km before it leaves the device. Null if denied/unavailable.
// No IP fallback: an IP lands on the ISP's town, which can be 20 km off. No weather beats the wrong weather.
function devicePosition(): Promise<{ lat: string; lon: string } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude.toFixed(2), lon: p.coords.longitude.toFixed(2) }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10 * 60_000 },
    )
  })
}

async function current(): Promise<Now | null> {
  const at = await devicePosition()
  if (!at) return null
  const d = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${at.lat}&longitude=${at.lon}&current=temperature_2m,weather_code`).then((r) => r.json())
  const temp = d?.current?.temperature_2m
  const code = d?.current?.weather_code
  return typeof temp === 'number' && typeof code === 'number' ? { temp: Math.round(temp), code } : null
}

export default function Weather() {
  const { t } = useI18n()
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
      current()
        .then((n) => alive && n && setNow(n))
        .catch(() => {}) // offline: keep the last reading
    load()
    const id = setInterval(load, 30 * 60_000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  if (!now) return null
  const label = t(`weather.${sky(now.code)}`)
  return (
    <span className="hd-weather" title={label}>
      {now.temp}° · {label}
    </span>
  )
}
