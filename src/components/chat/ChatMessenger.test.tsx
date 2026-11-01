import { screen, fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createRef } from 'react'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { ChatConversationView } from './ChatConversationView'
import { ChatSidebar } from './ChatSidebar'
import { NewChatModal } from './NewChatModal'
import { ChatMessageList } from './ChatMessageList'

describe('Messenger Chat Components', () => {
  describe('ChatConversationView (EmptyState)', () => {
    it('renders empty state when no conversation is selected', () => {
      const handleOpenNewChat = vi.fn()
      renderWithQueryClient(
        <ChatConversationView
          conversationId={undefined}
          onOpenNewChat={handleOpenNewChat}
          connectionStatus="CONNECTED"
          typingUsers={{}}
          onSendTyping={vi.fn()}
        />
      )

      expect(screen.getByText('Chưa chọn đoạn chat nào')).toBeInTheDocument()
      const newChatBtn = screen.getByRole('button', { name: /tạo đoạn chat mới/i })
      expect(newChatBtn).toBeInTheDocument()

      fireEvent.click(newChatBtn)
      expect(handleOpenNewChat).toHaveBeenCalledTimes(1)
    })
  })

  describe('ChatConversationView (Sending & Binding)', () => {
    it('renders message input and allows typing', () => {
      renderWithQueryClient(
        <ChatConversationView
          conversationId={1}
          onOpenNewChat={vi.fn()}
          connectionStatus="CONNECTED"
          typingUsers={{}}
          onSendTyping={vi.fn()}
        />
      )

      const input = screen.getByPlaceholderText('Nhập tin nhắn...')
      expect(input).toBeInTheDocument()
      fireEvent.change(input, { target: { value: 'Tin nhắn thử nghiệm' } })
      expect(input).toHaveValue('Tin nhắn thử nghiệm')
    })
  })

  describe('ChatMessageList', () => {
    it('renders error state and triggers retry', () => {
      const handleRetry = vi.fn()
      render(
        <ChatMessageList
          allMessages={[]}
          isLoading={false}
          isError={true}
          messagesEndRef={createRef()}
          onReply={vi.fn()}
          onRecall={vi.fn()}
          onRetry={handleRetry}
        />
      )

      expect(screen.getByText('Không thể tải tin nhắn')).toBeInTheDocument()
      const retryBtn = screen.getByRole('button', { name: /thử lại/i })
      fireEvent.click(retryBtn)
      expect(handleRetry).toHaveBeenCalledTimes(1)
    })

    it('renders message bubbles when messages exist', () => {
      const messages = [
        { message_id: 1, sender_id: 99, sender_name: 'Lan', content: 'Xin chào các bạn!' },
        { message_id: 2, sender_id: 1, sender_name: 'An', content: 'Chào Lan!' },
      ]
      render(
        <ChatMessageList
          allMessages={messages}
          currentUserId={1}
          isLoading={false}
          isError={false}
          messagesEndRef={createRef()}
          onReply={vi.fn()}
          onRecall={vi.fn()}
          onRetry={vi.fn()}
        />
      )

      expect(screen.getByText('Xin chào các bạn!')).toBeInTheDocument()
      expect(screen.getByText('Chào Lan!')).toBeInTheDocument()
    })

    it('hides recall button for optimistic message with negative message_id', () => {
      const messages = [
        { message_id: -999, sender_id: 1, sender_name: 'An', content: 'Tin nhắn đang gửi' },
      ]
      render(
        <ChatMessageList
          allMessages={messages}
          currentUserId={1}
          isLoading={false}
          isError={false}
          messagesEndRef={createRef()}
          onReply={vi.fn()}
          onRecall={vi.fn()}
          onRetry={vi.fn()}
        />
      )

      expect(screen.getByText('Tin nhắn đang gửi')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /thu hồi/i })).not.toBeInTheDocument()
    })

    it('shows recall button for confirmed message with positive message_id', () => {
      const messages = [
        { message_id: 123, sender_id: 1, sender_name: 'An', content: 'Tin nhắn đã lưu' },
      ]
      render(
        <ChatMessageList
          allMessages={messages}
          currentUserId={1}
          isLoading={false}
          isError={false}
          messagesEndRef={createRef()}
          onReply={vi.fn()}
          onRecall={vi.fn()}
          onRetry={vi.fn()}
        />
      )

      expect(screen.getByText('Tin nhắn đã lưu')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /thu hồi/i })).toBeInTheDocument()
    })

    it('renders unread messages divider when unreadCount is greater than 0', () => {
      const messages = [
        { message_id: 1, sender_id: 2, sender_name: 'Lan', content: 'Tin cũ' },
        { message_id: 2, sender_id: 2, sender_name: 'Lan', content: 'Tin mới chưa đọc' },
      ]
      render(
        <ChatMessageList
          allMessages={messages}
          currentUserId={1}
          isLoading={false}
          isError={false}
          messagesEndRef={createRef()}
          onReply={vi.fn()}
          onRecall={vi.fn()}
          onRetry={vi.fn()}
          unreadCount={1}
        />
      )

      expect(screen.getByText('Tin nhắn chưa đọc')).toBeInTheDocument()
      expect(screen.getByRole('separator')).toBeInTheDocument()
    })
  })

  describe('ChatSidebar', () => {
    it('renders sidebar title, action buttons, and search input', () => {
      renderWithQueryClient(
        <ChatSidebar
          onSelectConversation={vi.fn()}
          onOpenNewChat={vi.fn()}
        />
      )

      expect(screen.getByRole('heading', { level: 1, name: /đoạn chat/i })).toBeInTheDocument()
      expect(screen.getByRole('searchbox', { name: /tìm kiếm trên messenger/i })).toBeInTheDocument()
    })
  })

  describe('NewChatModal', () => {
    it('renders new chat modal with direct and group chat tabs', () => {
      renderWithQueryClient(
        <NewChatModal
          open={true}
          onClose={vi.fn()}
          onCreated={vi.fn()}
        />
      )

      expect(screen.getByText('Tạo đoạn chat mới')).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /nhắn tin trực tiếp/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /tạo nhóm chat/i })).toBeInTheDocument()
    })
  })
})
