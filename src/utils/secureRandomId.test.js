import { describe, it, expect, afterEach, vi } from 'vitest'
import { randomOpaqueId, newLocalChatSessionId } from './secureRandomId'

const origCrypto = globalThis.crypto

function setGlobalCrypto(value) {
  Object.defineProperty(globalThis, 'crypto', {
    value,
    configurable: true,
    enumerable: true,
    writable: true,
  })
}

describe('secureRandomId', () => {
  afterEach(() => {
    setGlobalCrypto(origCrypto)
    vi.restoreAllMocks()
  })

  it('randomOpaqueId usa randomUUID cuando existe', () => {
    setGlobalCrypto({
      randomUUID: () => 'uuid-test-123',
      getRandomValues: vi.fn(),
    })
    expect(randomOpaqueId()).toBe('uuid-test-123')
  })

  it('randomOpaqueId usa getRandomValues si no hay randomUUID', () => {
    const buf = new Uint8Array(16).fill(0xab)
    setGlobalCrypto({
      randomUUID: undefined,
      getRandomValues: (out) => {
        out.set(buf)
        return out
      },
    })
    expect(randomOpaqueId()).toMatch(/^[a-f0-9]{32}$/)
  })

  it('randomOpaqueId cae en fallback opaco sin crypto util', () => {
    setGlobalCrypto({})
    const a = randomOpaqueId()
    const b = randomOpaqueId()
    expect(a).toMatch(/^opaque-\d+-\d+$/)
    expect(b).not.toBe(a)
  })

  it('newLocalChatSessionId prefija sess- con randomUUID', () => {
    setGlobalCrypto({
      randomUUID: () => 'abc-def',
      getRandomValues: vi.fn(),
    })
    expect(newLocalChatSessionId()).toBe('sess-abc-def')
  })

  it('newLocalChatSessionId usa hex con getRandomValues', () => {
    const buf = new Uint8Array(16).fill(1)
    setGlobalCrypto({
      randomUUID: undefined,
      getRandomValues: (out) => {
        out.set(buf)
        return out
      },
    })
    expect(newLocalChatSessionId()).toMatch(/^sess-[a-f0-9]{32}$/)
  })

  it('newLocalChatSessionId fallback sin crypto fuerte', () => {
    setGlobalCrypto({})
    const id = newLocalChatSessionId()
    expect(id).toMatch(/^sess-fallback-\d+-\d+$/)
  })
})
