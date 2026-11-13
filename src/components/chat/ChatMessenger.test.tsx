import { MemoryRouter } from 'react-router-dom'
import { screen, fireEvent, render, waitFor, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { useAuthStore } from '@/stores/authStore'
import { websocketService, type WsConnectionStatus } from '@/services/websocket.service'
import type { WsMessageBroadcastDto } from '@/types/websocket.types'
import { queryKeys } from '@/lib/query-keys'
import { useChatRealtimeSync, useSendMessageMutation } from '@/hooks/queries/useChatQuery'
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
    it('renders sidebar title, action buttons, and search input without hidden vault link', () => {
      renderWithQueryClient(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ChatSidebar onSelectConversation={vi.fn()} onOpenNewChat={vi.fn()} /></MemoryRouter>
      )

      expect(screen.getByRole('heading', { level: 1, name: /đoạn chat/i })).toBeInTheDocument()
      expect(screen.getByRole('searchbox', { name: /tìm kiếm trên messenger/i })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /kho hội thoại ẩn/i })).not.toBeInTheDocument()
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

  describe('Optimistic Binding & WS Echo Reconciliation', () => {
    afterEach(() => {
      vi.restoreAllMocks()
      vi.useRealTimers()
      useAuthStore.getState().clearAuth()
    })

    function setupRealtimeHarness(initialStatus: WsConnectionStatus = 'CONNECTED') {
      let currentStatus: WsConnectionStatus = initialStatus
      let msgListener: ((msg: WsMessageBroadcastDto) => void) | undefined
      const statusListeners = new Set<(status: WsConnectionStatus) => void>()

      vi.spyOn(websocketService, 'connect').mockImplementation(() => {})
      vi.spyOn(websocketService, 'getStatus').mockImplementation(() => currentStatus)
      vi.spyOn(websocketService, 'onStatusChange').mockImplementation((cb) => {
        statusListeners.add(cb)
        cb(currentStatus)
        return () => statusListeners.delete(cb)
      })
      vi.spyOn(websocketService, 'onMessage').mockImplementation((cb) => {
        msgListener = cb
        return () => {
          if (msgListener === cb) msgListener = undefined
        }
      })
      vi.spyOn(websocketService, 'subscribeTyping').mockImplementation(() => () => {})
      const sendSpy = vi.spyOn(websocketService, 'sendMessage').mockReturnValue(true)

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      useAuthStore.getState().setAuth({ user_id: 7, username: 'an.nguyen', fullName: 'An', roles: ['STUDENT'] }, 'tok')

      queryClient.setQueryData(queryKeys.conversations.infiniteMessages(1), {
        pageParams: [undefined],
        pages: [{ conversation_id: 1, messages: [{ message_id: 10, sender_id: 99, content: 'hello' }], pagination: { has_next: false } }],
      })
      queryClient.setQueryData(queryKeys.conversations.infiniteList(), {
        pageParams: [undefined],
        pages: [{ items: [{ conversation_id: 1, display_name: 'Lan', unread_count: 0 }], pagination: { has_next: false } }],
      })

      let triggerSend!: (content: string) => Promise<unknown>
      function Harness() {
        useChatRealtimeSync(1)
        const sendMutation = useSendMessageMutation()
        const data = queryClient.getQueryData<{ pages: Array<{ messages?: Array<{ message_id?: number; sender_id?: number; sender_name?: string; content?: string }> }> }>(
          queryKeys.conversations.infiniteMessages(1)
        )
        const allMessages = (data?.pages.flatMap((p) => p.messages ?? []) ?? []).slice().reverse()
        triggerSend = (content: string) => sendMutation.mutateAsync({ conversationId: 1, content })
        return (
          <ChatMessageList
            allMessages={allMessages}
            currentUserId={7}
            isLoading={false}
            isError={false}
            messagesEndRef={createRef()}
            onReply={vi.fn()}
            onRecall={vi.fn()}
            onRetry={vi.fn()}
          />
        )
      }

      const utils = render(
        <QueryClientProvider client={queryClient}>
          <Harness />
        </QueryClientProvider>
      )

      return {
        ...utils,
        queryClient,
        sendSpy,
        triggerSend: (c: string) => triggerSend(c),
        emitWsMessage: (msg: WsMessageBroadcastDto) => msgListener?.(msg),
        setWsStatus: (next: WsConnectionStatus) => {
          currentStatus = next
          statusListeners.forEach((cb) => cb(next))
        },
      }
    }

    it('binds optimistic message immediately on right and replaces it in-place when WS echo arrives (even without sender_id/sender_name)', async () => {
      const { queryClient, triggerSend, emitWsMessage, rerender } = setupRealtimeHarness('CONNECTED')

      await act(async () => {
        await triggerSend('hiiiiii')
      })

      act(() => {
        emitWsMessage({
          message_id: 505,
          conversation_id: 1,
          sender_id: undefined,
          sender_name: undefined,
          content: 'hiiiiii',
          message_type: 'TEXT',
          created_at: '2026-11-13T07:00:00Z',
        })
      })

      const cache = queryClient.getQueryData<{
        pages: Array<{ messages?: Array<{ message_id?: number; sender_id?: number; content?: string }> }>
      }>(queryKeys.conversations.infiniteMessages(1))
      const messages = cache?.pages[0]?.messages ?? []
      expect(messages.filter((m) => m.content === 'hiiiiii')).toHaveLength(1)
      expect(messages[0]?.message_id).toBe(505)
      expect(messages[0]?.sender_id).toBe(7)

      const listCache = queryClient.getQueryData<{
        pages: Array<{ items?: Array<{ last_message?: { message_id?: number; content?: string } }> }>
      }>(queryKeys.conversations.infiniteList())
      expect(listCache?.pages[0]?.items?.[0]?.last_message?.message_id).toBe(505)
      expect(listCache?.pages[0]?.items?.[0]?.last_message?.content).toBe('hiiiiii')

      rerender(<QueryClientProvider client={queryClient}><div /></QueryClientProvider>)
    })

    it('binds immediately when CONNECTING, waits for CONNECTED, and rolls back exact message on timeout', async () => {
      vi.useFakeTimers()
      const { queryClient, triggerSend, sendSpy } = setupRealtimeHarness('CONNECTING')

      let rejected = false
      const promise = triggerSend('tin đang kết nối').catch(() => {
        rejected = true
      })

      // Flush microtask so TanStack Query enters mutationFn and binds optimistically before WS finishes connecting
      await act(async () => {
        await Promise.resolve()
      })

      const midCache = queryClient.getQueryData<{ pages: Array<{ messages?: Array<{ content?: string }> }> }>(
        queryKeys.conversations.infiniteMessages(1)
      )
      expect(midCache?.pages[0]?.messages?.some((m) => m.content === 'tin đang kết nối')).toBe(true)
      expect(sendSpy).not.toHaveBeenCalled()

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2100)
        await promise
      })

      expect(rejected).toBe(true)
      const afterCache = queryClient.getQueryData<{ pages: Array<{ messages?: Array<{ content?: string }> }> }>(
        queryKeys.conversations.infiniteMessages(1)
      )
      expect(afterCache?.pages[0]?.messages?.some((m) => m.content === 'tin đang kết nối')).toBe(false)
    })

    it('fails fast when DISCONNECTED without inserting optimistic message', async () => {
      const { queryClient, triggerSend, sendSpy } = setupRealtimeHarness('DISCONNECTED')
      await expect(triggerSend('offline msg')).rejects.toThrow('WS_DISCONNECTED')
      expect(sendSpy).not.toHaveBeenCalled()
      const cache = queryClient.getQueryData<{ pages: Array<{ messages?: Array<{ content?: string }> }> }>(
        queryKeys.conversations.infiniteMessages(1)
      )
      expect(cache?.pages[0]?.messages?.some((m) => m.content === 'offline msg')).toBe(false)
    })

    it('aligns own messages on the right even when sender_id arrives as numeric string and auto-scrolls', async () => {
      const scrollIntoView = vi.fn()
      const origScrollIntoView = HTMLElement.prototype.scrollIntoView
      HTMLElement.prototype.scrollIntoView = scrollIntoView
      try {
        const endRef = createRef<HTMLDivElement>()
        const { rerender } = render(
          <ChatMessageList
            allMessages={[{ message_id: 1, sender_id: '7' as unknown as number, sender_name: 'An', content: 'Tin của mình' }]}
            currentUserId={7}
            isLoading={false}
            isError={false}
            messagesEndRef={endRef}
            onReply={vi.fn()}
            onRecall={vi.fn()}
            onRetry={vi.fn()}
          />
        )

        const bubbleText = screen.getByText('Tin của mình')
        const row = bubbleText.closest('.justify-end')
        expect(row).not.toBeNull()

        scrollIntoView.mockClear()
        rerender(
          <ChatMessageList
            allMessages={[
              { message_id: 1, sender_id: 7, sender_name: 'An', content: 'Tin của mình' },
              { message_id: 2, sender_id: 7, sender_name: 'An', content: 'Tin mới gửi' },
            ]}
            currentUserId={7}
            isLoading={false}
            isError={false}
            messagesEndRef={endRef}
            onReply={vi.fn()}
            onRecall={vi.fn()}
            onRetry={vi.fn()}
          />
        )
        await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
      } finally {
        HTMLElement.prototype.scrollIntoView = origScrollIntoView
      }
    })
  })
})
