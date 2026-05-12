import { describe, it, expect } from 'vitest'
import { getTravelStatusText, getTravelStatusBadgeClass } from './travelStatus'

describe('travelStatus', () => {
  it('getTravelStatusText maps known', () => {
    expect(getTravelStatusText('ACTIVE')).toBe('Activo')
  })

  it('getTravelStatusText passthrough unknown', () => {
    expect(getTravelStatusText('CUSTOM')).toBe('CUSTOM')
  })

  it('getTravelStatusBadgeClass fallback', () => {
    expect(getTravelStatusBadgeClass('ACTIVE')).toContain('green')
    expect(getTravelStatusBadgeClass('UNKNOWN')).toContain('gray')
  })
})
