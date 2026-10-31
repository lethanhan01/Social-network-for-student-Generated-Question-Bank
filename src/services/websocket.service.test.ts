import { describe, it, expect, vi, beforeEach } from 'vitest'
import { websocketService } from './websocket.service'
import { useAuthStore } from '@/stores/authStore'
import { Client } from '@stomp/stompjs'

vi.mock('@stomp/stompjs', () => {
  return {
    Client: vi.fn().mockImplementation((config: { onConnect?: () => void }) => {
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
        brokerURL: expect.stringContaining('/websocket?token=test-jwt-token'),
        connectHeaders: {
          Authorization: 'Bearer test-jwt-token',
        },
      })
    )
  })

  it('sendMessage returns false when client is not connected', () => {
    const payload = {
      conversation_id: 10,
      content: 'Hello offline',
    }
    const result = websocketService.sendMessage(payload)
    expect(result).toBe(false)
  })

  it('sendMessage publishes JSON body to /app/chat.send and returns true', () => {
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
      content: 'Hello STOMP',
    }
    const result = websocketService.sendMessage(payload)
    expect(result).toBe(true)

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
})
