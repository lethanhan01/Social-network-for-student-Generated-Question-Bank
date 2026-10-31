import { useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { chatService } from '@/services/chat.service'
import { websocketService, type WsConnectionStatus } from '@/services/websocket.service'
import { queryKeys } from '@/lib/query-keys'
import type {
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  MessageListResponseDto,
  ConversationListResponseDto,
  MessageDto,
} from '@/types'

export function useConversationsQuery(params?: { cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.conversations.list(params),
    queryFn: ({ signal }) => chatService.getConversations(params, { signal }),
  })
}

export function useConversationMessagesQuery(
  conversationId: number,
  params?: { cursor?: string; limit?: number }
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
        pageParam ? { cursor: String(pageParam), limit: 20 } : { limit: 20 },
        { signal }
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.after ? String(lastPage.pagination.after) : undefined,
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
      queryClient.setQueriesData<MessageListResponseDto>(
        { queryKey: queryKeys.conversations.messages(msg.conversation_id) },
        (old) => {
          if (!old) return old
          const exists = old.messages?.some((m) => m.message_id === msg.message_id)
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

          return {
            ...old,
            messages: [...(old.messages || []), newMsg],
          }
        }
      )

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
