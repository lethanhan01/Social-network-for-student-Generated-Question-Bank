import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { relationshipService } from '@/services/relationship.service'
import { queryKeys } from '@/lib/query-keys'

export function useBlockedSettings() {
  const client = useQueryClient()
  const query = useInfiniteQuery({
    queryKey: queryKeys.relationships.blocked({ view: 'settings' }),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      relationshipService.getBlockedUsers({ cursor: pageParam, limit: 30 }, { signal }),
    getNextPageParam: (page) =>
      page.pagination?.has_next && page.pagination.after != null ? String(page.pagination.after) : undefined,
  })
  const mutation = useMutation({
    mutationFn: (id: number) => relationshipService.unblockUser(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.relationships.all })
    },
  })
  return { query, mutation }
}
