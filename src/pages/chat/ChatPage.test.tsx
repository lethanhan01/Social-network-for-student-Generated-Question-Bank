import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { chatService } from '@/services/chat.service'
import ChatPage from './ChatPage'

vi.mock('@/services/chat.service', () => ({ chatService: {
  getConversations: vi.fn(), getMessages: vi.fn(), createDirectConversation: vi.fn(),
} }))
vi.mock('@/services/relationship.service', () => ({ relationshipService: {
  getMyFriends: vi.fn(async () => ({ items: [] })),
} }))
vi.mock('@/services/websocket.service', () => ({ websocketService: {
  getStatus: () => 'CONNECTED', connect: vi.fn(),
  onStatusChange: () => () => {}, onMessage: () => () => {},
  subscribeTyping: () => () => {}, sendTyping: vi.fn(), markAsRead: vi.fn(),
} }))

function renderRoute(route: string) {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/messages" element={<ChatPage />} />
        <Route path="/messages/:conversationId" element={<ChatPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Chat routes share the Messenger interface', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(chatService.getConversations).mockResolvedValue({
      items: [{ conversation_id: 7, display_name: 'Bạn cùng lớp', type: 'DIRECT' }],
      pagination: { has_next: false },
    })
    vi.mocked(chatService.getMessages).mockResolvedValue({
      conversation_id: 7,
      messages: [{ message_id: 1, content: 'Existing thread', sender_id: 2 }],
      pagination: { has_next: false },
    })
    vi.mocked(chatService.createDirectConversation).mockResolvedValue({ conversation_id: 7 })
  })

  it.each(['/messages/7', '/messages?conversation=7'])(
    'opens %s in the conversation view', async (route) => {
      renderRoute(route)
      expect(screen.getByRole('searchbox', { name: 'Tìm kiếm trên Messenger' })).toBeInTheDocument()
      expect(await screen.findByText('Existing thread')).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Nhập tin nhắn...' })).toBeInTheDocument()
    }
  )

  it('starts a direct conversation from the friend link and keeps the Messenger interface', async () => {
    const user = userEvent.setup()
    renderRoute('/messages?userId=501')
    expect(chatService.createDirectConversation).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Bắt đầu trò chuyện' }))
    expect(chatService.createDirectConversation).toHaveBeenCalledWith({ target_user_id: 501 })
    expect(await screen.findByText('Existing thread')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Nhập tin nhắn...' })).toBeInTheDocument()
  })
})
