import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getOrCreateLocalChatSessionId,
  rotateLocalChatSessionId,
} from './localAiSession'

describe('localAiSession', () => {
  beforeEach(() => {
    globalThis.sessionStorage?.clear?.()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns null without userId', () => {
    expect(getOrCreateLocalChatSessionId(null)).toBeNull()
    expect(rotateLocalChatSessionId(undefined)).toBeNull()
  })

  it('creates and persists a session id', () => {
    const id = getOrCreateLocalChatSessionId('u1')
    expect(id).toBeTruthy()
    const again = getOrCreateLocalChatSessionId('u1')
    expect(again).toBe(id)
  })

  it('rotateLocalChatSessionId yields a new id', () => {
    const first = getOrCreateLocalChatSessionId('u1')
    const second = rotateLocalChatSessionId('u1')
    expect(second).toBeTruthy()
    expect(second).not.toBe(first)
  })

  it('falls back to non-uuid id when crypto.randomUUID is unavailable', () => {
    const cryptoSpy = vi.spyOn(globalThis, 'crypto', 'get').mockReturnValue({})
    const id = rotateLocalChatSessionId('u2')
    expect(id).toMatch(/^sess-/)
    cryptoSpy.mockRestore()
  })

  it('survives sessionStorage exceptions', () => {
    const setSpy = vi
      .spyOn(globalThis.sessionStorage, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota')
      })
    const getSpy = vi
      .spyOn(globalThis.sessionStorage, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked')
      })
    expect(getOrCreateLocalChatSessionId('u3')).toBeTruthy()
    expect(rotateLocalChatSessionId('u3')).toBeTruthy()
    setSpy.mockRestore()
    getSpy.mockRestore()
  })
})
