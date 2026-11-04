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

// Open-Meteo and BigDataCloud need no API key; only rounded coordinates leave the browser.
async function locate(lang: string): Promise<Place> {
  const pos = await new Promise<GeolocationPosition>((ok, ko) => navigator.geolocation.getCurrentPosition(ok, ko, { maximumAge: 3_600_000 }))
  const lat = Math.round(pos.coords.latitude * 100) / 100
  const lon = Math.round(pos.coords.longitude * 100) / 100
  const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`).then((r) => r.json())
  return { lat, lon, city: String(r.city || r.locality || r.principalSubdivision || '') }
}

export default function Weather() {
  const { t, lang } = useI18n()
  const [place, setPlace] = useState(loadPlace)
  const [now, setNow] = useState<Now | null>(null)
  const [failed, setFailed] = useState(false)

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

  const ask = () =>
    locate(lang)
      .then((p) => {
        writeJSON(PLACE_KEY, p)
        setPlace(p)
      })
      .catch(() => setFailed(true))

  if (!place) {
    if (failed || !('geolocation' in navigator)) return null
    return (
      <button className="hd-weather" onClick={ask} title={t('weather.hint')}>
        {t('weather.ask')}
      </button>
    )
  }
  if (!now) return null
  return (
    <span className="hd-weather" title={t(`weather.${sky(now.code)}`)}>
      {place.city && `${place.city} `}
      {now.temp}° · {t(`weather.${sky(now.code)}`)}
    </span>
  )
}
