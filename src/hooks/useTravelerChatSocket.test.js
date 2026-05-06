import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Client } from '@stomp/stompjs'
import { useTravelerChatSocket } from './useTravelerChatSocket'

vi.mock('@stomp/stompjs', () => ({
  Client: vi.fn(),
}))

describe('useTravelerChatSocket', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('without broker URL does not connect', () => {
    vi.stubEnv('VITE_WS_BROKER_URL', '')
    const { result } = renderHook(() =>
      useTravelerChatSocket('1', { enabled: true, onMessage: vi.fn() }),
    )
    expect(result.current.hasBroker).toBe(false)
    expect(result.current.connected).toBe(false)
  })

  it('with broker creates client, subscribes, publishes when connected', async () => {
    vi.stubEnv('VITE_WS_BROKER_URL', 'ws://localhost/ws')
    localStorage.setItem('smartrip_token', 'st')
    const onMessage = vi.fn()
    let ctorConfig
    Client.mockImplementation((cfg) => {
      ctorConfig = cfg
      const self = {
        connected: false,
        subscribe: vi.fn(),
        publish: vi.fn(),
        activate: vi.fn(() => {
          self.connected = true
          cfg.onConnect?.()
        }),
        deactivate: vi.fn(() => Promise.resolve()),
      }
      return self
    })

    const { result, unmount } = renderHook(() =>
      useTravelerChatSocket('conn-1', { enabled: true, onMessage }),
    )

    expect(result.current.hasBroker).toBe(true)
    const instance = Client.mock.results[0].value
    expect(instance.activate).toHaveBeenCalled()
    expect(ctorConfig.connectHeaders.Authorization).toBe('Bearer st')

    const subCb = instance.subscribe.mock.calls[0][1]
    await act(async () => {
      subCb({ body: JSON.stringify({ text: 'hi' }) })
    })
    expect(onMessage).toHaveBeenCalledWith({ text: 'hi' })

    vi.spyOn(console, 'warn').mockImplementation(() => {})
    await act(async () => {
      subCb({ body: 'not-json' })
    })
    expect(console.warn).toHaveBeenCalled()

    expect(result.current.publishSend(99, 'yo')).toBe(true)
    expect(instance.publish).toHaveBeenCalledWith({
      destination: '/app/chat/conn-1/sendMessage',
      body: JSON.stringify({ senderId: 99, content: 'yo' }),
    })

    vi.spyOn(console, 'error').mockImplementation(() => {})
    await act(async () => {
      ctorConfig.onStompError({ headers: { message: 'x' }, body: 'b' })
    })
    await act(async () => {
      ctorConfig.onDisconnect()
    })
    await act(async () => {
      ctorConfig.onWebSocketClose()
    })

    unmount()
  })

  it('publishSend returns false when disconnected', () => {
    vi.stubEnv('VITE_WS_BROKER_URL', 'ws://localhost/ws')
    Client.mockImplementation(() => ({
      connected: false,
      activate: vi.fn(),
      deactivate: vi.fn(() => Promise.resolve()),
      publish: vi.fn(),
      subscribe: vi.fn(),
    }))
    const { result, unmount } = renderHook(() =>
      useTravelerChatSocket('2', { enabled: true, onMessage: vi.fn() }),
    )
    expect(result.current.hasBroker).toBe(true)
    expect(result.current.publishSend(1, 'x')).toBe(false)
    unmount()
  })
})
