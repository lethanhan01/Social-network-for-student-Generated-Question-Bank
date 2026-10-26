import { useQuery } from '@tanstack/react-query'
import { gamificationService } from '@/services/gamification.service'
import { queryKeys } from '@/lib/query-keys'

export function useUserBadgesQuery(userId?: number) {
  const isMe = !userId || userId === 0
  return useQuery({
    queryKey: isMe ? queryKeys.gamification.badges() : ['gamification', 'badges', 'user', userId],
    queryFn: ({ signal }) =>
      isMe
        ? gamificationService.getMyBadges({ signal })
        : gamificationService.getUserBadges(userId, { signal }),
  })
}
