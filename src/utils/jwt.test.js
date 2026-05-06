import { describe, it, expect, vi } from 'vitest'
import { safeJsonParse, decodeJwtPayload, getNumericId } from './jwt'

describe('jwt utils', () => {
  it('safeJsonParse parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 })
  })

  it('safeJsonParse returns null on invalid', () => {
    expect(safeJsonParse('not json')).toBeNull()
  })

  it('decodeJwtPayload decodes payload', () => {
    const payload = { sub: '1', name: 'u' }
    const b64 = globalThis.btoa(JSON.stringify(payload)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
    const token = `h.${b64}.s`
    expect(decodeJwtPayload(token)).toEqual(payload)
  })

  it('decodeJwtPayload returns null for bad token', () => {
    expect(decodeJwtPayload('x')).toBeNull()
    expect(decodeJwtPayload('')).toBeNull()
  })

  it('decodeJwtPayload handles padding', () => {
    const raw = globalThis.btoa(JSON.stringify({ ok: true }))
    const token = `h.${raw}.s`
    expect(decodeJwtPayload(token)?.ok).toBe(true)
  })

  it('getNumericId', () => {
    expect(getNumericId(42)).toBe(42)
    expect(getNumericId(' 99 ')).toBe(99)
    expect(getNumericId('x')).toBeNull()
    expect(getNumericId(NaN)).toBeNull()
  })
})
