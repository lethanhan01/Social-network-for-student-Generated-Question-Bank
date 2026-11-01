import { useEffect, useState, useCallback } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from '@tanstack/react-query'
import { chatService } from '@/services/chat.service'
import { websocketService, type WsConnectionStatus } from '@/services/websocket.service'
import { useAuthStore } from '@/stores/authStore'
import { queryKeys } from '@/lib/query-keys'
import type {
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  MessageListResponseDto,
  ConversationListResponseDto,
  MessageDto,
} from '@/types'

export function useConversationsQuery(params?: { after?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.conversations.list(params),
    queryFn: ({ signal }) => chatService.getConversations(params, { signal }),
  })
}

export function useConversationMessagesQuery(
  conversationId: number,
  params?: { after?: number; limit?: number }
) {
  return useQuery({
    queryKey: queryKeys.conversations.messages(conversationId, params),
    queryFn: ({ signal }) => chatService.getMessages(conversationId, params, { signal }),
    enabled: Number.isFinite(conversationId) && conversationId > 0,
  })
}

export function useConversationMessagesInfiniteQuery(conversationId: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.conversations.messages(conversationId),
    queryFn: ({ pageParam, signal }) =>
      chatService.getMessages(
        conversationId,
        pageParam != null ? { after: Number(pageParam), limit: 20 } : { limit: 20 },
        { signal }
      ),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.has_next && lastPage.pagination?.after != null
        ? Number(lastPage.pagination.after)
        : undefined,
    enabled: Number.isFinite(conversationId) && conversationId > 0,
  })
}

export function useCreateDirectConversationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDirectConversationDto) =>
      chatService.createDirectConversation(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all })
    },
  })
}

export function useCreateGroupConversationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGroupConversationDto) =>
      chatService.createGroupConversation(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all })
    },
  })
}

export function useRecallMessageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId, mode }: { messageId: number; mode?: 'ME' | 'EVERYONE' }) =>
      chatService.recallMessage(messageId, { mode }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all })
    },
  })
}

export interface SendMessagePayload {
  conversationId: number
  content: string
  messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'GIF'
  mediaUrls?: string[]
  replyTo?: MessageDto | null
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      messageType = 'TEXT',
      mediaUrls,
      replyTo,
    }: SendMessagePayload) => {
      const user = useAuthStore.getState().user
      const optimisticId = -Date.now()

      const optimisticMsg: MessageDto = {
        message_id: optimisticId,
        sender_id: user?.user_id ?? 0,
        sender_name: user?.fullName || user?.username || 'Tôi',
        avatar_url: user?.avatar_url || user?.avatarUrl || undefined,
        content,
        message_type: messageType,
        media_urls: mediaUrls,
        reply_to_message: replyTo
          ? {
              message_id: replyTo.message_id,
              sender_id: replyTo.sender_id,
              sender_name: replyTo.sender_name,
              content_preview: replyTo.content,
            }
          : undefined,
        created_at: new Date().toISOString(),
      }

      // 1. Optimistic insert into infinite query cache
      queryClient.setQueriesData<InfiniteData<MessageListResponseDto>>(
        { queryKey: queryKeys.conversations.messages(conversationId) },
        (old) => {
          if (!old?.pages?.length) {
            return {
              pageParams: [undefined],
              pages: [
                {
                  conversation_id: conversationId,
                  messages: [optimisticMsg],
                  pagination: { has_next: false },
                },
              ],
            }
          }
          const pages = old.pages.map((p, idx) =>
            idx === 0 ? { ...p, messages: [optimisticMsg, ...(p.messages || [])] } : p
          )
          return { ...old, pages }
        }
      )

      // 2. Update conversation list preview
      queryClient.setQueriesData<ConversationListResponseDto>(
        { queryKey: queryKeys.conversations.list() },
        (old) => {
          if (!old?.items) return old
          const items = [...old.items]
          const idx = items.findIndex((c) => c.conversation_id === conversationId)
          if (idx >= 0) {
            const current = items[idx]
            const updated = {
              ...current,
              last_message: {
                message_id: optimisticId,
                content: optimisticMsg.content,
                message_type: optimisticMsg.message_type,
                created_at: optimisticMsg.created_at,
              },
            }
            items.splice(idx, 1)
            items.unshift(updated)
          }
          return { ...old, items }
        }
      )

      // 3. Send over STOMP WebSocket
      const sent = websocketService.sendMessage({
        conversation_id: conversationId,
        content,
        message_type: messageType === 'IMAGE' ? 'IMAGE' : 'TEXT',
        media_urls: mediaUrls,
        reply_to_message_id: replyTo?.message_id ?? null,
      })

      if (!sent) {
        websocketService.connect()
        throw new Error('WS_DISCONNECTED')
      }

      return optimisticMsg
    },
    onSuccess: (_data, variables) => {
      // 4. Reconcile with server ID after 500ms
      setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.messages(variables.conversationId),
        })
        void queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.list(),
        })
      }, 500)
    },
  })
}

export function useChatRealtimeSync(activeConversationId?: number) {
  const queryClient = useQueryClient()
  const [connectionStatus, setConnectionStatus] = useState<WsConnectionStatus>(
    websocketService.getStatus()
  )
  const [typingUsers, setTypingUsers] = useState<Record<number, string>>({})

  // Connect websocket on mount
  useEffect(() => {
    websocketService.connect()
    const unsubStatus = websocketService.onStatusChange(setConnectionStatus)

    const unsubMsg = websocketService.onMessage((msg) => {
      // 1. Append message to active conversation cache if open
      queryClient.setQueriesData<InfiniteData<MessageListResponseDto>>(
        { queryKey: queryKeys.conversations.messages(msg.conversation_id) },
        (old) => {
          if (!old?.pages?.length) return old
          const exists = old.pages.some((page) =>
            page.messages?.some((m) => m.message_id === msg.message_id)
          )
          if (exists) return old

          const newMsg: MessageDto = {
            message_id: msg.message_id,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name,
            avatar_url: msg.sender_avatar ?? undefined,
            content: msg.content,
            message_type: msg.message_type as 'TEXT' | 'IMAGE' | 'VIDEO' | 'GIF',
            media_urls: msg.media_urls,
            reply_to_message: msg.reply_to_message_id
              ? { message_id: msg.reply_to_message_id }
              : undefined,
            created_at: msg.created_at,
          }

          const newPages = old.pages.map((p, i) =>
            i === 0 ? { ...p, messages: [newMsg, ...(p.messages || [])] } : p
          )
          return {
            ...old,
            pages: newPages,
          }
        }
      )

      if (activeConversationId === msg.conversation_id) {
        const queryState = queryClient.getQueryState(queryKeys.conversations.messages(msg.conversation_id))
        if (queryState?.status === 'error') {
          void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.messages(msg.conversation_id) })
        }
      }

      // 2. Update conversation list preview
      queryClient.setQueriesData<ConversationListResponseDto>(
        { queryKey: queryKeys.conversations.list() },
        (old) => {
          if (!old || !old.items) return old
          const items = [...old.items]
          const targetIndex = items.findIndex((c) => c.conversation_id === msg.conversation_id)

          if (targetIndex >= 0) {
            const current = items[targetIndex]
            const updated = {
              ...current,
              last_message: {
                message_id: msg.message_id,
                content: msg.content,
                message_type: msg.message_type as 'TEXT' | 'IMAGE' | 'VIDEO' | 'GIF',
                created_at: msg.created_at,
              },
              unread_count:
                activeConversationId === msg.conversation_id
                  ? current.unread_count
                  : (current.unread_count || 0) + 1,
            }
            items.splice(targetIndex, 1)
            items.unshift(updated)
          } else {
            void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() })
          }

          return {
            ...old,
            items,
          }
        }
      )
    })

    return () => {
      unsubStatus()
      unsubMsg()
    }
  }, [queryClient, activeConversationId])

  // Subscribe to typing indicators for active conversation
  useEffect(() => {
    if (!activeConversationId) return

    const unsubTyping = websocketService.subscribeTyping(activeConversationId, (data) => {
      if (data.is_typing) {
        setTypingUsers((prev) => ({ ...prev, [data.user_id]: data.username }))
        const timer = setTimeout(() => {
          setTypingUsers((prev) => {
            const next = { ...prev }
            delete next[data.user_id]
            return next
          })
        }, 3000)
        return () => clearTimeout(timer)
      } else {
        setTypingUsers((prev) => {
          const next = { ...prev }
          delete next[data.user_id]
          return next
        })
      }
    })

    return () => {
      unsubTyping()
      setTypingUsers({})
    }
  }, [activeConversationId])

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!activeConversationId) return
      websocketService.sendTyping({
        conversation_id: activeConversationId,
        is_typing: isTyping,
      })
    },
    [activeConversationId]
  )

  return {
    connectionStatus,
    typingUsers,
    sendTypingStatus,
  }
}

export function useAutoMarkAsRead(
  conversationId?: number,
  unreadCount?: number,
  lastMessageId?: number
) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!conversationId || !unreadCount || unreadCount <= 0 || !lastMessageId) return

    // 1. Optimistic clear unread badge in conversation list
    queryClient.setQueriesData<ConversationListResponseDto>(
      { queryKey: queryKeys.conversations.list() },
      (old) => {
        if (!old?.items) return old
        return {
          ...old,
          items: old.items.map((c) =>
            c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c
          ),
        }
      }
    )

    // 2. Send STOMP markAsRead
    websocketService.markAsRead({
      conversation_id: conversationId,
      message_id: lastMessageId,
    })

    // 3. Reconcile with server after 400ms
    const timer = setTimeout(() => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      })
    }, 400)

    return () => clearTimeout(timer)
  }, [conversationId, unreadCount, lastMessageId, queryClient])
}
