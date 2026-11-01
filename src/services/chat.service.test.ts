import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chatService } from './chat.service'
import api from './api'

vi.mock('./api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api')>()
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('chatService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getMessages returns directly when API returns 200 OK', async () => {
    const mockMessages = {
      conversation_id: 5,
      messages: [{ message_id: 10, content: 'Chào bạn', sender_id: 1 }],
      pagination: { has_next: false, after: null },
    }

    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        code: '1000',
        message: 'SUCCESS',
        data: mockMessages,
      },
    })

    const res = await chatService.getMessages(5, { limit: 20 })
    expect(res).toEqual(mockMessages)
    expect(api.get).toHaveBeenCalledWith('/conversations/5/messages', {
      params: { limit: 20 },
      signal: undefined,
    })
  })

  it('getMessages triggers level 1 probe (after = lastMsg.id + 1) when 500 occurs on initial load', async () => {
    // 1st call fails with 500 (read receipt write error)
    vi.mocked(api.get).mockRejectedValueOnce(new Error('500 Internal Server Error'))

    // Fallback step 1: GET /conversations to inspect metadata
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        code: '1000',
        message: 'SUCCESS',
        data: {
          items: [
            {
              conversation_id: 5,
              display_name: 'Nhóm Học Tập',
              unread_count: 2,
              last_message: {
                message_id: 70,
                content: 'Tin mới nhất',
                message_type: 'TEXT',
                created_at: '2026-11-01T00:00:00Z',
              },
            },
          ],
        },
      },
    })

    // Level 1 probe: GET /conversations/5/messages?after=71 returns full server messages including 70
    const serverData = {
      conversation_id: 5,
      messages: [
        { message_id: 70, content: 'Tin mới nhất', sender_id: 2 },
        { message_id: 68, content: 'Tin cũ hơn', sender_id: 2 },
      ],
      pagination: { has_next: true, after: 60 },
    }
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        code: '1000',
        message: 'SUCCESS',
        data: serverData,
      },
    })

    const res = await chatService.getMessages(5, { limit: 20 })

    expect(res).toBeDefined()
    expect(res.messages).toHaveLength(2)
    expect(res.messages?.[0]?.message_id).toBe(70)
    expect(res.messages?.[1]?.message_id).toBe(68)
    expect(api.get).toHaveBeenCalledWith('/conversations/5/messages', {
      params: { after: 71, limit: 20 },
      signal: undefined,
    })
  })

  it('getMessages triggers level 2 fallback (after = lastMsg.id) when level 1 probe fails', async () => {
    // 1st call fails with 500
    vi.mocked(api.get).mockRejectedValueOnce(new Error('500 Internal Server Error'))

    // GET /conversations metadata
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        code: '1000',
        message: 'SUCCESS',
        data: {
          items: [
            {
              conversation_id: 5,
              display_name: 'Nhóm Học Tập',
              unread_count: 2,
              last_message: {
                message_id: 70,
                content: 'Tin mới nhất',
                message_type: 'TEXT',
                created_at: '2026-11-01T00:00:00Z',
              },
            },
          ],
        },
      },
    })

    // Level 1 probe (after=71) fails
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Rejected +1'))

    // Level 2 probe (after=70) succeeds returning messages < 70
    const recoveredData = {
      conversation_id: 5,
      messages: [{ message_id: 68, content: 'Tin cũ hơn', sender_id: 2 }],
      pagination: { has_next: true, after: 60 },
    }
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        code: '1000',
        message: 'SUCCESS',
        data: recoveredData,
      },
    })

    const res = await chatService.getMessages(5, { limit: 20 })

    expect(res).toBeDefined()
    expect(res.messages).toHaveLength(2)
    // The latest message from conversation preview was prepended
    expect(res.messages?.[0]?.message_id).toBe(70)
    expect(res.messages?.[0]?.content).toBe('Tin mới nhất')
    expect(res.messages?.[1]?.message_id).toBe(68)
  })

  it('getMessages handles empty conversation with no messages gracefully on 500', async () => {
    // 1st call fails with 500
    vi.mocked(api.get).mockRejectedValueOnce(new Error('500 Internal Server Error'))

    // GET /conversations returns empty last_message
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        code: '1000',
        message: 'SUCCESS',
        data: {
          items: [
            {
              conversation_id: 9,
              display_name: 'Hội thoại mới',
              unread_count: 0,
              last_message: undefined,
            },
          ],
        },
      },
    })

    const res = await chatService.getMessages(9, { limit: 20 })
    expect(res).toEqual({
      conversation_id: 9,
      conversation_type: undefined,
      messages: [],
      pagination: { has_next: false },
    })
  })

  it('getMessages does not trigger fallback and rethrows when after param is already specified', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('500 Internal Server Error'))

    await expect(chatService.getMessages(5, { after: 50, limit: 20 })).rejects.toThrow('500 Internal Server Error')
    expect(api.get).toHaveBeenCalledTimes(1)
  })
})

