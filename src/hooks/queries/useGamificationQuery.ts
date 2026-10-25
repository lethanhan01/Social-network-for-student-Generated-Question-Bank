import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gamificationService } from '@/services/gamification.service'
import { queryKeys } from '@/lib/query-keys'

export type LeaderboardPeriod = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'

export function useCheckInStatusQuery() {
  return useQuery({
    queryKey: queryKeys.gamification.checkIn(),
    queryFn: ({ signal }) => gamificationService.getCheckInStatus({ signal }),
  })
}

export function useCheckInMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => gamificationService.checkInDaily(),
    onSuccess: () => {
      // Điểm danh làm thay đổi streak, điểm xếp hạng và số dư xu trong cửa hàng
      void queryClient.invalidateQueries({ queryKey: queryKeys.gamification.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.cosmetics.all })
    },
  })
}

export function useLeaderboardQuery(type: LeaderboardPeriod) {
  return useQuery({
    queryKey: queryKeys.gamification.leaderboard({ type }),
    queryFn: ({ signal }) => gamificationService.getLeaderboard({ type, limit: 50 }, { signal }),
  })
}
