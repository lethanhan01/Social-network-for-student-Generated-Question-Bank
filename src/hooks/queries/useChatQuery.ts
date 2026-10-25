import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '@/services/chat.service'
import { queryKeys } from '@/lib/query-keys'
import type { CreateDirectConversationDto, CreateGroupConversationDto } from '@/types'

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

export function useCreateDirectConversationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDirectConversationDto) => chatService.createDirectConversation(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all })
    },
  })
}

export function useCreateGroupConversationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGroupConversationDto) => chatService.createGroupConversation(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all })
    },
  })
}
