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
  markMessageAsRead,
  getTravelerSummary,
  getConversations,
  getSocialFeed,
  createPost,
  likePost,
  unlikePost,
  commentOnPost,
  getPostComments,
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  socialService,
} from './socialService'

beforeEach(() => vi.clearAllMocks())

describe('socialService', () => {
  it('getCompatibleTravelers', async () => {
    apiMock.get.mockResolvedValue([{ id: 1 }])
    expect(await getCompatibleTravelers('p1')).toEqual([{ id: 1 }])
  })

  it('sendConnectionRequest', async () => {
    apiMock.post.mockResolvedValue({ id: 1 })
    expect(await sendConnectionRequest({ recipientId: 2 })).toEqual({ id: 1 })
  })

  it('acceptConnectionRequest / rejectConnectionRequest', async () => {
    apiMock.put.mockResolvedValue({})
    await acceptConnectionRequest('r1')
    await rejectConnectionRequest('r2')
  })

  it('getPendingRequests / getSentRequests', async () => {
    apiMock.get.mockResolvedValue([1])
    expect(await getPendingRequests()).toEqual([1])
    apiMock.get.mockResolvedValue([2])
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
    apiMock.post.mockResolvedValue({ x: 1 })
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

  it('propagates errors from getCompatibleTravelers, send/accept/reject and pending/sent', async () => {
    apiMock.get.mockRejectedValueOnce(new Error('comp-fail'))
    await expect(getCompatibleTravelers('p')).rejects.toThrow('comp-fail')
    apiMock.post.mockRejectedValueOnce(new Error('conn-fail'))
    await expect(sendConnectionRequest({ recipientId: 1 })).rejects.toThrow('conn-fail')
    apiMock.put.mockRejectedValueOnce(new Error('acc-fail'))
    await expect(acceptConnectionRequest('r')).rejects.toThrow('acc-fail')
    apiMock.put.mockRejectedValueOnce(new Error('rej-fail'))
    await expect(rejectConnectionRequest('r')).rejects.toThrow('rej-fail')
    apiMock.get.mockRejectedValueOnce(new Error('pend-fail'))
    await expect(getPendingRequests()).rejects.toThrow('pend-fail')
    apiMock.get.mockRejectedValueOnce(new Error('sent-fail'))
    await expect(getSentRequests()).rejects.toThrow('sent-fail')
    apiMock.get.mockRejectedValueOnce(new Error('uc-fail'))
    await expect(getUserConnections(1)).rejects.toThrow('uc-fail')
    apiMock.delete.mockRejectedValueOnce(new Error('del-fail'))
    await expect(removeConnection(1)).rejects.toThrow('del-fail')
  })

  it('returns [] when api responses are nullish', async () => {
    apiMock.get.mockResolvedValue(null)
    expect(await getCompatibleTravelers('p')).toEqual([])
    apiMock.get.mockResolvedValue(null)
    expect(await getPendingRequests()).toEqual([])
    apiMock.get.mockResolvedValue(null)
    expect(await getSentRequests()).toEqual([])
  })

  it('messages helpers (markRead, summary, demo endpoints)', async () => {
    apiMock.put.mockResolvedValue({})
    await markMessageAsRead(99)
    expect(apiMock.put).toHaveBeenCalledWith('/social/messages/99/read')
    apiMock.put.mockRejectedValueOnce(new Error('mark'))
    await expect(markMessageAsRead(1)).rejects.toThrow('mark')

    apiMock.get.mockResolvedValue({ summary: 1 })
    await getTravelerSummary(7)
    expect(apiMock.get).toHaveBeenCalledWith('/social/travelers/7/summary')
    apiMock.get.mockRejectedValueOnce(new Error('sum'))
    await expect(getTravelerSummary(7)).rejects.toThrow('sum')

    apiMock.get.mockResolvedValue({})
    await getConversations(1)
    expect(apiMock.get).toHaveBeenCalledWith('/social/conversations/1')
    await getSocialFeed(1, 0, 10)
    expect(apiMock.get).toHaveBeenCalledWith('/social/feed/1', { params: { page: 0, size: 10 } })

    apiMock.post.mockResolvedValue({})
    await createPost({ content: 'hi' })
    expect(apiMock.post).toHaveBeenCalledWith('/social/posts', { content: 'hi' })
    await likePost(2)
    expect(apiMock.post).toHaveBeenCalledWith('/social/posts/2/like')
    apiMock.delete.mockResolvedValue({})
    await unlikePost(2)
    expect(apiMock.delete).toHaveBeenCalledWith('/social/posts/2/like')
    await commentOnPost(2, { body: 'x' })
    expect(apiMock.post).toHaveBeenCalledWith('/social/posts/2/comments', { body: 'x' })
    await getPostComments(2, 1, 5)
    expect(apiMock.get).toHaveBeenCalledWith('/social/posts/2/comments', {
      params: { page: 1, size: 5 },
    })

    await createReview({ rating: 5 })
    expect(apiMock.post).toHaveBeenCalledWith('/social/reviews', { rating: 5 })
    await getReviews('TRIP', 9)
    expect(apiMock.get).toHaveBeenCalledWith('/social/reviews/TRIP/9', {
      params: { page: 0, size: 20 },
    })
    await updateReview(1, { rating: 4 })
    expect(apiMock.put).toHaveBeenCalledWith('/social/reviews/1', { rating: 4 })
    await deleteReview(1)
    expect(apiMock.delete).toHaveBeenCalledWith('/social/reviews/1')
  })

  it('socialService aggregates exported helpers', () => {
    expect(typeof socialService.markMessageAsRead).toBe('function')
    expect(typeof socialService.createPost).toBe('function')
    expect(typeof socialService.deleteReview).toBe('function')
  })
})
