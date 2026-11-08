import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Weather, { sky, useWeather } from './Weather'

// As App wires it: the hook once, the label wherever it is shown.
const Live = () => <Weather now={useWeather()} />

describe('sky', () => {
  it('buckets WMO codes', () => {
    expect([0, 2, 45, 61, 81, 73, 86, 95].map(sky)).toEqual(['clear', 'cloudy', 'fog', 'rain', 'rain', 'snow', 'snow', 'storm'])
  })
})

describe('Weather', () => {
  const geolocation = (coords: { latitude: number; longitude: number } | null) =>
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: {
        getCurrentPosition: (ok: PositionCallback, fail: PositionErrorCallback) =>
          coords ? ok({ coords } as GeolocationPosition) : fail({} as GeolocationPositionError),
      },
    })

  afterEach(() => vi.unstubAllGlobals())

  it("shows the weather at the device's position, sent rounded to ~1 km, with no town and no IP lookup", async () => {
    geolocation({ latitude: 36.735412, longitude: -4.553871 })
    const fetch = vi.fn().mockResolvedValue({ json: async () => ({ current: { temperature_2m: 21.6, weather_code: 0 } }) })
    vi.stubGlobal('fetch', fetch)
    render(<Live />)
    expect(await screen.findByText('22° · Despejado')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toBe('https://api.open-meteo.com/v1/forecast?latitude=36.74&longitude=-4.55&current=temperature_2m,weather_code')
  })

  it('shows nothing and asks no server when the position is denied', async () => {
    geolocation(null)
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const { container } = render(<Live />)
    await new Promise((r) => setTimeout(r, 0))
    expect(container).toBeEmptyDOMElement()
    expect(fetch).not.toHaveBeenCalled()
  })
})
