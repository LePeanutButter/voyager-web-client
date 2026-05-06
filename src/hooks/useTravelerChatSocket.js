import { useCallback, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'

/**
 * STOMP over WebSocket for real-time traveler chat (Spring @MessageMapping /app/chat/{id}/sendMessage).
 * Set VITE_WS_BROKER_URL (e.g. ws://localhost:8080/ws) to enable; otherwise chat uses REST only.
 */
export function useTravelerChatSocket(connectionId, { enabled = true, onMessage } = {}) {
  const [connected, setConnected] = useState(false)
  const clientRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  const brokerURL = import.meta === undefined ? undefined : import.meta.env?.VITE_WS_BROKER_URL

  useEffect(() => {
    if (!enabled || !connectionId || !brokerURL) {
      setConnected(false)
      return undefined
    }

    const token = localStorage.getItem('smartrip_token') || localStorage.getItem('token')
    const client = new Client({
      brokerURL,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 4000,
      heartbeatIncoming: 15000,
      heartbeatOutgoing: 15000,
      onConnect: () => {
        setConnected(true)
        client.subscribe(`/topic/chat/${connectionId}`, (frame) => {
          try {
            const msg = JSON.parse(frame.body)
            onMessageRef.current?.(msg)
          } catch (e) {
            console.warn('STOMP parse error', e)
          }
        })
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      onStompError: (frame) => {
        console.error('STOMP error', frame.headers?.message, frame.body)
      },
    })

    clientRef.current = client
    client.activate()

    return () => {
      setConnected(false)
      const c = clientRef.current
      clientRef.current = null
      c?.deactivate?.().catch?.(() => {})
    }
  }, [enabled, connectionId, brokerURL])

  const publishSend = useCallback(
    (senderId, content) => {
      const c = clientRef.current
      if (!c?.connected || !connectionId) return false
      c.publish({
        destination: `/app/chat/${connectionId}/sendMessage`,
        body: JSON.stringify({ senderId, content }),
      })
      return true
    },
    [connectionId]
  )

  return {
    connected,
    publishSend,
    hasBroker: Boolean(brokerURL),
  }
}
