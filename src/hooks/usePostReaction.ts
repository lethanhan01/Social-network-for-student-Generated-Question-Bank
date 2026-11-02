import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToggleReactionMutation } from './queries/usePostsQuery'
import { queryKeys } from '@/lib/query-keys'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { PostResponseDto, ReactResponseDto, ReactionType } from '@/types'

export function usePostReaction(
  post: PostResponseDto,
  onToggle?: (id: number, type?: ReactionType) => Promise<unknown>
) {
  const { t } = useTranslation()
  const client = useQueryClient()
  const mutation = useToggleReactionMutation()
  const [pending, setPending] = useState(false)
  const cached = useQuery<ReactResponseDto | null>({
    queryKey: queryKeys.posts.myReaction(post.post_id ?? 0),
    queryFn: () => null,
    enabled: false,
  })
  const reacted = cached.data ? Boolean(cached.data.my_reaction) : Boolean(post.reacted_by_me)
  const count = cached.data?.total_count ?? post.react_count ?? 0
  async function react(type: ReactionType) {
    if (pending || !post.post_id) return
    setPending(true)
    try {
      const response = onToggle
        ? await onToggle(post.post_id, type)
        : await mutation.mutateAsync({
            target_type: 'POST',
            target_id: post.post_id,
            reaction_type: type,
          })
      const previous = cached.data?.my_reaction ?? (reacted ? 'LIKE' : null)
      const next = previous === type ? null : type
      const fallback = {
        my_reaction: next ?? undefined,
        total_count: Math.max(0, count + (previous ? (next ? 0 : -1) : 1)),
      }
      client.setQueryData(
        queryKeys.posts.myReaction(post.post_id),
        response && typeof response === 'object' && 'total_count' in response ? response : fallback
      )
    } catch (error) {
      toast.error(getApiError(error, t('zone2.actionError')))
    } finally {
      setPending(false)
    }
  }
  return { reacted, count, pending, react }
}
