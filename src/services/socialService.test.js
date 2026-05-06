import { describe, it, expect, vi, beforeEach } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('./api', () => ({ default: apiMock }))

import {
  getCompatibleTravelers,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getPendingRequests,
  getSentRequests,
  getUserConnections,
  removeConnection,
  getConversationMessages,
  getAllConversationMessages,
  sendTravelerMessage,
  socialService,
} from './socialService'

beforeEach(() => vi.clearAllMocks())

describe('socialService', () => {
  it('getCompatibleTravelers', async () => {
    apiMock.get.mockResolvedValue({ data: [{ id: 1 }] })
    expect(await getCompatibleTravelers('p1')).toEqual([{ id: 1 }])
  })

  it('sendConnectionRequest', async () => {
    apiMock.post.mockResolvedValue({ data: { id: 1 } })
    expect(await sendConnectionRequest({ recipientId: 2 })).toEqual({ id: 1 })
  })

  it('acceptConnectionRequest / rejectConnectionRequest', async () => {
    apiMock.put.mockResolvedValue({ data: {} })
    await acceptConnectionRequest('r1')
    await rejectConnectionRequest('r2')
  })

  it('getPendingRequests / getSentRequests', async () => {
    apiMock.get.mockResolvedValue({ data: [1] })
    expect(await getPendingRequests()).toEqual([1])
    apiMock.get.mockResolvedValue({ data: [2] })
    expect(await getSentRequests()).toEqual([2])
  })

  it('getUserConnections unwrapList', async () => {
    apiMock.get.mockResolvedValue([{ id: 1 }])
    expect(await getUserConnections(1)).toEqual([{ id: 1 }])
    apiMock.get.mockResolvedValue({ data: [{ id: 2 }] })
    expect(await getUserConnections(1)).toEqual([{ id: 2 }])
  })

  it('removeConnection', async () => {
    apiMock.delete.mockResolvedValue(undefined)
    await removeConnection(5)
  })

  it('getConversationMessages', async () => {
    apiMock.get.mockResolvedValue({ content: [{ id: 'm1' }] })
    const { messages, raw } = await getConversationMessages(1, 2, 0, 10)
    expect(messages.length).toBeGreaterThan(0)
    expect(raw).toBeDefined()
  })

  it('getAllConversationMessages aggregates pages', async () => {
    apiMock.get
      .mockResolvedValueOnce({
        content: [{ id: 1 }],
        last: false,
        totalPages: 2,
        number: 0,
      })
      .mockResolvedValueOnce({
        content: [{ id: 2 }],
        last: true,
        number: 1,
      })
    const all = await getAllConversationMessages(1, 2, 1)
    expect(all.map((m) => m.id)).toEqual([1, 2])
  })

  it('getAllConversationMessages stops when empty', async () => {
    apiMock.get.mockReset()
    apiMock.get.mockResolvedValue({ content: [], last: true })
    expect(await getAllConversationMessages(1, 2)).toEqual([])
  })

  it('sendTravelerMessage', async () => {
    apiMock.post.mockResolvedValue({ id: 1 })
    expect(await sendTravelerMessage({ connectionId: 1, senderId: 2, content: 'hi' })).toEqual({ id: 1 })
    apiMock.post.mockResolvedValue({ data: { x: 1 } })
    expect(await sendTravelerMessage({ connectionId: 1, senderId: 2, content: 'hi' })).toEqual({ x: 1 })
  })

  it('getConversationMessages and sendTravelerMessage propagate errors', async () => {
    apiMock.get.mockRejectedValueOnce(new Error('net'))
    await expect(getConversationMessages(1, 2)).rejects.toThrow('net')
    apiMock.post.mockRejectedValueOnce(new Error('send-fail'))
    await expect(sendTravelerMessage({ connectionId: 1, senderId: 1, content: 'x' })).rejects.toThrow('send-fail')
  })

  it('unwrapPageContent uses records array', async () => {
    apiMock.get.mockResolvedValue({ records: [{ id: 'r1' }] })
    const { messages } = await getConversationMessages(1, 2, 0, 10)
    expect(messages[0].id).toBe('r1')
  })

  it('getAllConversationMessages stops on totalPages', async () => {
    apiMock.get
      .mockResolvedValueOnce({
        content: [{ id: 1 }],
        last: false,
        totalPages: 1,
        number: 0,
      })
    const all = await getAllConversationMessages(1, 2, 10)
    expect(all).toHaveLength(1)
  })

  it('socialService namespace', async () => {
    apiMock.get.mockResolvedValue([])
    await socialService.getUserConnections(1)
    expect(apiMock.get).toHaveBeenCalled()
  })
})
