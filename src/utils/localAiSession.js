import { newLocalChatSessionId } from './secureRandomId.js'

const STORAGE_PREFIX = 'voyager-local-chat-session:'

export function getOrCreateLocalChatSessionId(userId) {
  if (!userId) return null
  const key = STORAGE_PREFIX + String(userId)
  let sid = ''
  try {
    sid = globalThis.sessionStorage?.getItem(key) || ''
  } catch {
    sid = ''
  }
  if (!sid) {
    sid = newLocalChatSessionId()
    try {
      globalThis.sessionStorage?.setItem(key, sid)
    } catch {
      /* ignore */
    }
  }
  return sid
}

export function rotateLocalChatSessionId(userId) {
  if (!userId) return null
  const key = STORAGE_PREFIX + String(userId)
  const sid = newLocalChatSessionId()
  try {
    globalThis.sessionStorage?.setItem(key, sid)
  } catch {
    /* ignore */
  }
  return sid
}
