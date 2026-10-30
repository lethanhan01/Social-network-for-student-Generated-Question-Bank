import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { utilityService } from '@/services/utility.service'
import { queryKeys } from '@/lib/query-keys'

export interface SearchQueryParams {
  keyword: string
  type?: 'ALL' | 'POST' | 'QUESTION' | 'USER'
  cursor?: string
  limit?: number
  [key: string]: unknown
}

export function useGlobalSearchQuery(params: SearchQueryParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.search.results(params),
    queryFn: ({ signal }) => utilityService.search(params, { signal }),
    enabled: (options?.enabled ?? true) && Boolean(params.keyword.trim()),
    staleTime: 60 * 1000,
  })
}

export function useSavedAndTrendingSearchesQuery() {
  return useQuery({
    queryKey: queryKeys.search.saved(),
    queryFn: ({ signal }) => utilityService.getSavedAndTrendingSearches({ signal }),
    staleTime: 2 * 60 * 1000,
  })
}

export function useDeleteSavedSearchMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => utilityService.deleteSavedSearch(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.search.saved() })
    },
  })
}
