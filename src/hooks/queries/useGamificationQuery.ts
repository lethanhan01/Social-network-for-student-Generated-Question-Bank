import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gamificationService } from '@/services/gamification.service'
import { courseService } from '@/services/course.service'
import { queryKeys } from '@/lib/query-keys'
import type { Game1PredictionRequest, Game4PredictionRequest, Game6SubmitRequest } from '@/types'

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

export function useMyPredictionsQuery() {
  return useQuery({
    queryKey: queryKeys.gamification.myPredictions(),
    queryFn: ({ signal }) => gamificationService.getMyPredictions({ limit: 20 }, { signal }),
  })
}

export function useGame1ClassesQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.gamification.game1Classes(),
    queryFn: ({ signal }) => gamificationService.getClassesForGame1({ signal }),
    enabled,
  })
}

export function useSubjectListQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.subjects.list(),
    queryFn: ({ signal }) => courseService.getSubjects({ signal }),
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

export function useGame6ActiveSessionQuery() {
  return useQuery({
    queryKey: queryKeys.gamification.activeSession(),
    queryFn: ({ signal }) => gamificationService.getActiveGameSession({ signal }),
    // Ngoài Thứ Bảy backend trả lỗi "không có phiên" — không cần retry
    retry: false,
  })
}

export function usePredictGame1Mutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Game1PredictionRequest) => gamificationService.predictGame1(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gamification.myPredictions() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.gamification.game1Classes() })
    },
  })
}

export function usePredictGame4Mutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Game4PredictionRequest) => gamificationService.predictGame4(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gamification.myPredictions() })
    },
  })
}

export function useSubmitGame6Mutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Game6SubmitRequest) => gamificationService.submitGame6(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gamification.myPredictions() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.gamification.activeSession() })
    },
  })
}

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
