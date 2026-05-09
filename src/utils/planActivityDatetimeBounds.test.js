import { describe, it, expect } from 'vitest'
import {
  parsePlanLocalDay,
  planDayStartDatetimeLocal,
  planDayEndDatetimeLocal,
} from './planActivityDatetimeBounds'

describe('planActivityDatetimeBounds', () => {
  it('parsePlanLocalDay handles ISO date strings', () => {
    const d = parsePlanLocalDay('2026-06-15')
    expect(d).toBeInstanceOf(Date)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(5)
    expect(d.getDate()).toBe(15)
  })

  it('parsePlanLocalDay handles Date input', () => {
    const input = new Date(2025, 0, 1)
    const out = parsePlanLocalDay(input)
    expect(out.getTime()).toBe(input.getTime())
  })

  it('parsePlanLocalDay returns null for invalid input', () => {
    expect(parsePlanLocalDay(null)).toBeNull()
    expect(parsePlanLocalDay('')).toBeNull()
    expect(parsePlanLocalDay('not-a-date')).toBeNull()
  })

  it('planDayStartDatetimeLocal formats with 00:00 prefix', () => {
    expect(planDayStartDatetimeLocal('2026-06-15')).toBe('2026-06-15T00:00')
  })

  it('planDayStartDatetimeLocal returns "" for invalid input', () => {
    expect(planDayStartDatetimeLocal(null)).toBe('')
  })

  it('planDayEndDatetimeLocal formats with 23:59 suffix', () => {
    expect(planDayEndDatetimeLocal('2026-06-15')).toBe('2026-06-15T23:59')
  })

  it('planDayEndDatetimeLocal returns "" for invalid input', () => {
    expect(planDayEndDatetimeLocal('not-a-date')).toBe('')
  })
})
