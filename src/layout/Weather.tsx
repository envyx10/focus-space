import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { isRecord, readJSON, writeJSON } from '../lib/storage'

export const PLACE_KEY = 'focus-space:place'
type Place = { lat: number; lon: number; city: string }
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

function loadPlace(): Place | null {
  const v = readJSON(PLACE_KEY)
  return isRecord(v) && typeof v.lat === 'number' && typeof v.lon === 'number' && typeof v.city === 'string' ? (v as Place) : null
}

// City-level location from the IP: no permission prompt (geolocation is off in our Permissions-Policy). No API keys.
// BigDataCloud moved this API to api-bdc.io; the old host only redirects there, which the CSP would block.
async function locate(lang: string): Promise<Place> {
  const r = await fetch(`https://api-bdc.io/data/reverse-geocode-client?localityLanguage=${lang}`).then((r) => r.json())
  if (typeof r.latitude !== 'number' || typeof r.longitude !== 'number') throw new Error('no location')
  const lat = Math.round(r.latitude * 100) / 100
  const lon = Math.round(r.longitude * 100) / 100
  return { lat, lon, city: String(r.city || r.locality || r.principalSubdivision || '') }
}

export default function Weather() {
  const { t, lang } = useI18n()
  const [place, setPlace] = useState(loadPlace)
  const [now, setNow] = useState<Now | null>(null)

  // Re-locate on every load (the stored place only paints instantly); a moved laptop picks up its new city.
  useEffect(() => {
    let alive = true
    locate(lang)
      .then((p) => {
        if (!alive) return
        writeJSON(PLACE_KEY, p)
        setPlace((old) => (old && old.lat === p.lat && old.lon === p.lon && old.city === p.city ? old : p))
      })
      .catch(() => {}) // offline or blocked: keep the stored place, or show nothing
    return () => {
      alive = false
    }
  }, [lang])

  useEffect(() => {
    if (!place) return
    let alive = true
    const load = () =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=temperature_2m,weather_code`)
        .then((r) => r.json())
        .then((d) => alive && setNow({ temp: Math.round(d.current.temperature_2m), code: d.current.weather_code }))
        .catch(() => {}) // offline: keep the last reading
    load()
    const id = setInterval(load, 30 * 60_000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [place])

  if (!place || !now) return null
  return (
    <span className="hd-weather" title={t(`weather.${sky(now.code)}`)}>
      {place.city && `${place.city} `}
      {now.temp}° · {t(`weather.${sky(now.code)}`)}
    </span>
  )
}
