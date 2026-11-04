import { describe, expect, it } from 'vitest'
import { sky } from './Weather'

describe('sky', () => {
  it('buckets WMO codes', () => {
    expect([0, 2, 45, 61, 81, 73, 86, 95].map(sky)).toEqual(['clear', 'cloudy', 'fog', 'rain', 'rain', 'snow', 'snow', 'storm'])
  })
})
