import { describe, it, expect, vi, beforeEach } from 'vitest'
import { websocketService } from './websocket.service'
import { useAuthStore } from '@/stores/authStore'
import { Client } from '@stomp/stompjs'

vi.mock('@stomp/stompjs', () => {
  return {
    Client: vi.fn().mockImplementation((config: { onConnect?: () => void; onWebSocketClose?: () => void }) => {
      const mockInstance = {
        active: false,
        activate: vi.fn().mockImplementation(() => {
          mockInstance.active = true
          config.onConnect?.()
        }),
        deactivate: vi.fn().mockImplementation(() => {
          mockInstance.active = false
        }),
        publish: vi.fn(),
        subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
      }
      return mockInstance
    }),
  }
})

describe('websocketService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clearAuth()
    websocketService.disconnect()
  })

  it('connect does not activate if no auth token is present', () => {
    websocketService.connect()
    expect(Client).not.toHaveBeenCalled()
  })

  it('connect activates STOMP client with Bearer token when user is logged in', () => {
    useAuthStore.getState().setAuth(
      {
        user_id: 1,
        email: 'test@sis.hust.edu.vn',
        username: 'testuser',
        fullName: 'Test User',
        role: 'STUDENT',
        roles: ['STUDENT'],
      },
      'test-jwt-token'
    )

    websocketService.connect()
    expect(Client).toHaveBeenCalledWith(
      expect.objectContaining({
        brokerURL: expect.stringContaining('/api/v1/ws/websocket'),
        connectHeaders: {
          Authorization: 'Bearer test-jwt-token',
        },
      })
    )
  })

  it('sendMessage publishes JSON body to /app/chat.send', () => {
    useAuthStore.getState().setAuth(
      {
        user_id: 1,
        email: 'test@sis.hust.edu.vn',
        username: 'testuser',
        fullName: 'Test User',
        role: 'STUDENT',
        roles: ['STUDENT'],
      },
      'test-token'
    )
    websocketService.connect()

    const payload = {
      conversation_id: 10,
      client_msg_id: 'client-1',
      content: 'Hello STOMP',
    }
    websocketService.sendMessage(payload)

    const clientInstance = vi.mocked(Client).mock.results[0]?.value
    expect(clientInstance.publish).toHaveBeenCalledWith({
      destination: '/app/chat.send',
      body: JSON.stringify(payload),
    })
  })

  it('sendTyping publishes JSON body to /app/chat.typing', () => {
    useAuthStore.getState().setAuth(
      {
        user_id: 1,
        email: 'test@sis.hust.edu.vn',
        username: 'testuser',
        fullName: 'Test User',
        role: 'STUDENT',
        roles: ['STUDENT'],
      },
      'test-token'
    )
    websocketService.connect()

    const payload = {
      conversation_id: 10,
      is_typing: true,
    }
    websocketService.sendTyping(payload)

    const clientInstance = vi.mocked(Client).mock.results[0]?.value
    expect(clientInstance.publish).toHaveBeenCalledWith({
      destination: '/app/chat.typing',
      body: JSON.stringify(payload),
    })
  })

  it('disconnect deactivates STOMP client', () => {
    useAuthStore.getState().setAuth(
      {
        user_id: 1,
        email: 'test@sis.hust.edu.vn',
        username: 'testuser',
        fullName: 'Test User',
        role: 'STUDENT',
        roles: ['STUDENT'],
      },
      'test-token'
    )
    websocketService.connect()
    const clientInstance = vi.mocked(Client).mock.results[0]?.value

    websocketService.disconnect()
    expect(clientInstance.deactivate).toHaveBeenCalled()
  })

  it('notifies both chat consumers when the transport closes', () => {
    useAuthStore.setState({ token: 'test-token' })
    const status = vi.fn()
    const connected = vi.fn()
    const unsubscribeStatus = websocketService.onStatusChange(status)
    const unsubscribeConnection = websocketService.onConnection(connected)
    websocketService.connect()
    expect(status).toHaveBeenLastCalledWith('CONNECTED')
    expect(connected).toHaveBeenLastCalledWith(true)

    vi.mocked(Client).mock.calls[0][0]?.onWebSocketClose?.({} as CloseEvent)
    expect(status).toHaveBeenLastCalledWith('DISCONNECTED')
    expect(connected).toHaveBeenLastCalledWith(false)
    expect(websocketService.sendMessage({ conversation_id: 10, content: 'Offline' })).toBe(false)
    unsubscribeStatus()
    unsubscribeConnection()
  })

  it('normalizes camelCase, string IDs, nested sender, and data-wrapped STOMP messages', () => {
    useAuthStore.setState({ token: 'test-token' })
    const received: unknown[] = []
    const unsub = websocketService.onMessage((msg) => received.push(msg))
    websocketService.connect()

    const clientInstance = vi.mocked(Client).mock.results[0]?.value
    const subscribeCall = clientInstance.subscribe.mock.calls.find(
      (call: [string, (msg: { body: string }) => void]) => call[0] === '/user/queue/messages'
    )
    expect(subscribeCall).toBeDefined()
    const handler = subscribeCall[1]

    handler({
      body: JSON.stringify({
        data: {
          messageId: '901',
          conversationId: '15',
          content: 'Xin chào',
          messageType: 'TEXT',
          sender: { userId: '42', fullName: 'Minh An', avatarUrl: 'https://img/a.png' },
          createdAt: '2026-11-13T07:00:00Z',
        },
      }),
    })

    expect(received).toEqual([
      expect.objectContaining({
        message_id: 901,
        conversation_id: 15,
        sender_id: 42,
        sender_name: 'Minh An',
        sender_avatar: 'https://img/a.png',
        content: 'Xin chào',
        message_type: 'TEXT',
        created_at: '2026-11-13T07:00:00Z',
      }),
    ])
    unsub()
  })
})
