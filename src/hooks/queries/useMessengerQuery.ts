import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '@/services/chat.service'
import { getNextCursor } from '@/lib/pagination'
import { queryKeys } from '@/lib/query-keys'

export function useInfiniteConversationsQuery() {
  return useInfiniteQuery({
    queryKey: queryKeys.conversations.infiniteList(),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      chatService.getConversations({ cursor: pageParam, limit: 20 }, { signal }),
    getNextPageParam: (last) => getNextCursor(last.pagination),
    refetchInterval: 30_000,
  })
}
export function useInfiniteMessagesQuery(id: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.conversations.infiniteMessages(id),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      chatService.getMessages(id, { cursor: pageParam, limit: 30 }, { signal }),
    getNextPageParam: (last) => getNextCursor(last.pagination),
    enabled: id > 0,
    refetchInterval: 20_000,
  })
}
export function useRecallMessageMutation(id: number) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId, mode }: { messageId: number; mode: 'ME' | 'EVERYONE' }) =>
      chatService.recallMessage(messageId, { mode }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.conversations.infiniteMessages(id) })
      void client.invalidateQueries({ queryKey: queryKeys.conversations.all })
    },
  })
}
