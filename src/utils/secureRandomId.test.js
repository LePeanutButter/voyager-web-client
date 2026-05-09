import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { randomOpaqueId, newLocalChatSessionId } from './secureRandomId'

describe('secureRandomId', () => {
  const origCrypto = globalThis.crypto

  afterEach(() => {
    globalThis.crypto = origCrypto
    vi.restoreAllMocks()
  })

  it('randomOpaqueId usa randomUUID cuando existe', () => {
    globalThis.crypto = {
      randomUUID: () => 'uuid-test-123',
      getRandomValues: vi.fn(),
    }
    expect(randomOpaqueId()).toBe('uuid-test-123')
  })

  it('randomOpaqueId usa getRandomValues si no hay randomUUID', () => {
    const buf = new Uint8Array(16).fill(0xab)
    globalThis.crypto = {
      randomUUID: undefined,
      getRandomValues: (out) => {
        out.set(buf)
        return out
      },
    }
    expect(randomOpaqueId()).toMatch(/^[a-f0-9]{32}$/)
  })

  it('randomOpaqueId cae en fallback opaco sin crypto util', () => {
    globalThis.crypto = {}
    const a = randomOpaqueId()
    const b = randomOpaqueId()
    expect(a).toMatch(/^opaque-\d+-\d+$/)
    expect(b).not.toBe(a)
  })

  it('newLocalChatSessionId prefija sess- con randomUUID', () => {
    globalThis.crypto = {
      randomUUID: () => 'abc-def',
      getRandomValues: vi.fn(),
    }
    expect(newLocalChatSessionId()).toBe('sess-abc-def')
  })

  it('newLocalChatSessionId usa hex con getRandomValues', () => {
    const buf = new Uint8Array(16).fill(1)
    globalThis.crypto = {
      randomUUID: undefined,
      getRandomValues: (out) => {
        out.set(buf)
        return out
      },
    }
    expect(newLocalChatSessionId()).toMatch(/^sess-[a-f0-9]{32}$/)
  })

  it('newLocalChatSessionId fallback sin crypto fuerte', () => {
    globalThis.crypto = {}
    const id = newLocalChatSessionId()
    expect(id).toMatch(/^sess-fallback-\d+-\d+$/)
  })
})
