export type Now = { temp: number; code: number }

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

/** The current temperature and sky where the device is, or null without a position. */
export async function fetchWeather(): Promise<Now | null> {
  const at = await devicePosition()
  if (!at) return null
  const d = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${at.lat}&longitude=${at.lon}&current=temperature_2m,weather_code`).then((r) => r.json())
  const temp = d?.current?.temperature_2m
  const code = d?.current?.weather_code
  return typeof temp === 'number' && typeof code === 'number' ? { temp: Math.round(temp), code } : null
}
