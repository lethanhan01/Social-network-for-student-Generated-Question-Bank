import { useEffect, useState, useCallback, useRef } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query'
import { chatService } from '@/services/chat.service'
import { websocketService, type WsConnectionStatus } from '@/services/websocket.service'
import { useAuthStore } from '@/stores/authStore'
import { queryKeys } from '@/lib/query-keys'
import type {
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  MessageListResponseDto,
  ConversationDto,
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
    queryKey: queryKeys.conversations.infiniteMessages(conversationId),
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

let optimisticSeq = 0

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

export function resolveCurrentUserId(
  user: { user_id?: unknown; userId?: unknown } | null | undefined
): number | undefined {
  return toFiniteNumber(user?.user_id ?? user?.userId)
}

function nextOptimisticId(): number {
  optimisticSeq = (optimisticSeq + 1) % 1000
  return -(Date.now() * 1000 + optimisticSeq)
}

function waitForWsConnected(timeoutMs = 2000): Promise<void> {
  if (websocketService.getStatus() === 'CONNECTED') return Promise.resolve()
  return new Promise((resolve, reject) => {
    const state: {
      settled: boolean
      timer?: ReturnType<typeof setTimeout>
      unsub?: () => void
    } = { settled: false }

    const finish = (ok: boolean) => {
      if (state.settled) return
      state.settled = true
      if (state.timer) clearTimeout(state.timer)
      state.unsub?.()
      if (ok) resolve()
      else reject(new Error('WS_DISCONNECTED'))
    }

    state.timer = setTimeout(() => finish(false), timeoutMs)
    state.unsub = websocketService.onStatusChange((status) => {
      if (status === 'CONNECTED') finish(true)
      else if (status === 'DISCONNECTED') finish(false)
    })
    if (state.settled) state.unsub()
  })
}

function hasPendingOptimisticMessage(
  queryClient: QueryClient,
  conversationId: number,
  optimisticId: number
): boolean {
  const snapshots = queryClient.getQueriesData<InfiniteData<MessageListResponseDto>>({
    queryKey: queryKeys.conversations.infiniteMessages(conversationId),
  })
  return snapshots.some(([, data]) =>
    data?.pages?.some((page) => page.messages?.some((m) => m.message_id === optimisticId))
  )
}

function mergeReplyPreview(
  existing: MessageDto['reply_to_message'],
  replyToMessageId?: number | null
): MessageDto['reply_to_message'] {
  if (!replyToMessageId) return existing
  return existing ? { ...existing, message_id: replyToMessageId } : { message_id: replyToMessageId }
}

function reconcileIncomingMessage(
  old: InfiniteData<MessageListResponseDto> | undefined,
  params: {
    convId: number
    activeConvId?: number
    newMsg: MessageDto
    incomingSenderId?: number
    currentUserId?: number
  }
): InfiniteData<MessageListResponseDto> | undefined {
  const { convId, activeConvId, newMsg, incomingSenderId, currentUserId } = params
  if (!old?.pages?.length) {
    if (convId !== activeConvId) return old
    return {
      pageParams: [undefined],
      pages: [{ conversation_id: convId, messages: [newMsg], pagination: { has_next: false } }],
    }
  }
  const msgId = newMsg.message_id
  const exists = old.pages.some((page) => page.messages?.some((m) => m.message_id === msgId))
  if (exists) return old

  const firstMessages = old.pages[0]?.messages || []
  let matchIdx = -1
  for (let idx = firstMessages.length - 1; idx >= 0; idx -= 1) {
    const candidate = firstMessages[idx]
    if ((candidate.message_id ?? 0) >= 0) continue
    const sameContent = (candidate.content ?? '') === (newMsg.content ?? '')
    const sameType = (candidate.message_type ?? 'TEXT') === (newMsg.message_type ?? 'TEXT')
    const senderCompatible =
      incomingSenderId === undefined ||
      incomingSenderId === currentUserId ||
      (candidate.sender_id != null && Number(candidate.sender_id) === incomingSenderId)
    if (sameContent && sameType && senderCompatible) {
      matchIdx = idx
      break
    }
  }

  if (matchIdx >= 0) {
    const matched = firstMessages[matchIdx]
    const replaced: MessageDto = {
      ...matched,
      message_id: msgId,
      sender_id: incomingSenderId ?? matched.sender_id ?? currentUserId,
      sender_name: newMsg.sender_name || matched.sender_name,
      avatar_url: newMsg.avatar_url ?? matched.avatar_url,
      content: newMsg.content,
      message_type: newMsg.message_type,
      media_urls: newMsg.media_urls ?? matched.media_urls,
      reply_to_message: mergeReplyPreview(matched.reply_to_message, newMsg.reply_to_message?.message_id),
      created_at: newMsg.created_at || matched.created_at,
    }
    const nextFirst = [...firstMessages]
    nextFirst[matchIdx] = replaced
    return {
      ...old,
      pages: old.pages.map((p, i) => (i === 0 ? { ...p, messages: nextFirst } : p)),
    }
  }

  return {
    ...old,
    pages: old.pages.map((p, i) => (i === 0 ? { ...p, messages: [newMsg, ...(p.messages || [])] } : p)),
  }
}

function removeOptimisticMessage(
  queryClient: QueryClient,
  conversationId: number,
  optimisticId: number
): void {
  queryClient.setQueriesData<InfiniteData<MessageListResponseDto>>(
    { queryKey: queryKeys.conversations.infiniteMessages(conversationId) },
    (old) => {
      if (!old?.pages?.length) return old
      return {
        ...old,
        pages: old.pages.map((p) => ({
          ...p,
          messages: (p.messages || []).filter((m) => m.message_id !== optimisticId),
        })),
      }
    }
  )
}

function updateConversationPreviews(
  queryClient: QueryClient,
  conversationId: number,
  lastMessage: {
    message_id: number
    content?: string
    message_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'GIF'
    created_at?: string
  },
  incrementUnread: boolean
): boolean {
  let foundInInfinite = false
  queryClient.setQueriesData<InfiniteData<ConversationListResponseDto>>(
    { queryKey: queryKeys.conversations.infiniteList() },
    (old) => {
      if (!old?.pages?.length) return old
      let matchedConv: ConversationDto | undefined
      const strippedPages = old.pages.map((page) => {
        const items = page.items ?? []
        const idx = items.findIndex((c) => c.conversation_id === conversationId)
        if (idx < 0) return page
        matchedConv = items[idx]
        const nextItems = [...items]
        nextItems.splice(idx, 1)
        return { ...page, items: nextItems }
      })
      if (!matchedConv) return old
      foundInInfinite = true
      const updated = {
        ...matchedConv,
        last_message: lastMessage,
        unread_count: incrementUnread ? (matchedConv.unread_count || 0) + 1 : matchedConv.unread_count,
      }
      const pages = strippedPages.map((page, idx) =>
        idx === 0 ? { ...page, items: [updated, ...(page.items ?? [])] } : page
      )
      return { ...old, pages }
    }
  )

  queryClient.setQueriesData<ConversationListResponseDto>(
    { queryKey: queryKeys.conversations.list() },
    (old) => {
      if (!old?.items) return old
      const items = [...old.items]
      const idx = items.findIndex((c) => c.conversation_id === conversationId)
      if (idx < 0) return old
      const current = items[idx]
      const updated = {
        ...current,
        last_message: lastMessage,
        unread_count: incrementUnread ? (current.unread_count || 0) + 1 : current.unread_count,
      }
      items.splice(idx, 1)
      items.unshift(updated)
      return { ...old, items }
    }
  )

  return foundInInfinite
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
      const status = websocketService.getStatus()
      if (status === 'DISCONNECTED') {
        websocketService.connect()
        throw new Error('WS_DISCONNECTED')
      }

      const user = useAuthStore.getState().user
      const optimisticId = nextOptimisticId()
      const currentUserId = resolveCurrentUserId(user)

      const optimisticMsg: MessageDto = {
        message_id: optimisticId,
        sender_id: currentUserId ?? 0,
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
        { queryKey: queryKeys.conversations.infiniteMessages(conversationId) },
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

      // 2. Update conversation list preview (infiniteList + legacy list)
      updateConversationPreviews(
        queryClient,
        conversationId,
        {
          message_id: optimisticId,
          content: optimisticMsg.content,
          message_type: optimisticMsg.message_type,
          created_at: optimisticMsg.created_at,
        },
        false
      )

      // 3. Wait briefly if CONNECTING, then send over STOMP WebSocket
      try {
        if (status === 'CONNECTING') {
          await waitForWsConnected(2000)
        }
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
      } catch (err) {
        removeOptimisticMessage(queryClient, conversationId, optimisticId)
        throw err
      }

      return optimisticMsg
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.infiniteList() })
    },
    onSuccess: (optimisticMsg, variables) => {
      // 4. Conditional reconcile only if WS echo did not replace the optimistic message
      setTimeout(() => {
        if (
          optimisticMsg.message_id == null ||
          !hasPendingOptimisticMessage(queryClient, variables.conversationId, optimisticMsg.message_id)
        ) {
          return
        }
        void queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.infiniteMessages(variables.conversationId),
        })
        void queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.infiniteList(),
        })
      }, 1500)
    },
  })
}

export function useChatRealtimeSync(activeConversationId?: number) {
  const queryClient = useQueryClient()
  const [connectionStatus, setConnectionStatus] = useState<WsConnectionStatus>(
    websocketService.getStatus()
  )
  const [typingUsers, setTypingUsers] = useState<Record<number, string>>({})
  const activeConvRef = useRef(activeConversationId)
  activeConvRef.current = activeConversationId

  // Connect websocket on mount
  useEffect(() => {
    websocketService.connect()
    const unsubStatus = websocketService.onStatusChange(setConnectionStatus)

    const unsubMsg = websocketService.onMessage((rawMsg) => {
      const convId = toFiniteNumber(rawMsg.conversation_id)
      const msgId = toFiniteNumber(rawMsg.message_id)
      if (convId === undefined || msgId === undefined) return

      const incomingSenderId = toFiniteNumber(rawMsg.sender_id)
      const currentUserId = resolveCurrentUserId(useAuthStore.getState().user)
      const msgType = (rawMsg.message_type ?? 'TEXT') as MessageDto['message_type']

      const newMsg: MessageDto = {
        message_id: msgId,
        sender_id: incomingSenderId,
        sender_name: rawMsg.sender_name,
        avatar_url: rawMsg.sender_avatar ?? undefined,
        content: rawMsg.content,
        message_type: msgType,
        media_urls: rawMsg.media_urls,
        reply_to_message: rawMsg.reply_to_message_id
          ? { message_id: rawMsg.reply_to_message_id }
          : undefined,
        created_at: rawMsg.created_at,
      }

      // 1. Reconcile optimistic message or append new message to conversation cache
      queryClient.setQueriesData<InfiniteData<MessageListResponseDto>>(
        { queryKey: queryKeys.conversations.infiniteMessages(convId) },
        (old) =>
          reconcileIncomingMessage(old, {
            convId,
            activeConvId: activeConvRef.current,
            newMsg,
            incomingSenderId,
            currentUserId,
          })
      )

      if (activeConvRef.current === convId) {
        const queryState = queryClient.getQueryState(queryKeys.conversations.infiniteMessages(convId))
        if (queryState?.status === 'error') {
          void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.infiniteMessages(convId) })
        }
      }

      // 2. Update conversation list preview (infiniteList + legacy list)
      const isMine = currentUserId !== undefined && incomingSenderId === currentUserId
      const foundInInfinite = updateConversationPreviews(
        queryClient,
        convId,
        {
          message_id: msgId,
          content: rawMsg.content,
          message_type: msgType,
          created_at: rawMsg.created_at,
        },
        convId !== activeConvRef.current && !isMine
      )
      if (!foundInInfinite) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.infiniteList() })
      }
    })

    return () => {
      unsubStatus()
      unsubMsg()
    }
  }, [queryClient])

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
    queryClient.setQueryData<InfiniteData<ConversationListResponseDto>>(
      queryKeys.conversations.infiniteList(),
      (old) => {
        if (!old?.pages) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items?.map((c) => c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c),
          })),
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
        queryKey: queryKeys.conversations.infiniteMessages(conversationId),
      })
    }, 400)

    return () => clearTimeout(timer)
  }, [conversationId, unreadCount, lastMessageId, queryClient])
}
