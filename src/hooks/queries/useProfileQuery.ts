import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { queryKeys } from '@/lib/query-keys'
import type { UpdateProfileRequest } from '@/types'
import { useAuthStore } from '@/stores/authStore'

export function useMyProfileQuery() {
  const isAuthReady = useAuthStore((s) => s.isAuthenticated && Boolean(s.token))
  return useQuery({
    queryKey: queryKeys.users.profile('me'),
    queryFn: ({ signal }) => userService.getMyProfile({ signal }),
    enabled: isAuthReady,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUserProfileQuery(userId: number) {
  return useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: ({ signal }) => userService.getUserProfile(userId, { signal }),
    enabled: Number.isFinite(userId) && userId > 0,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => userService.updateMyProfile(payload),
    onSuccess: (updated) => {
      const current = useAuthStore.getState().user
      if (current) useAuthStore.getState().setUser({ ...current,
        fullName: updated.full_name ?? current.fullName,
        avatarUrl: updated.avatar_url ?? current.avatarUrl,
        avatar_url: updated.avatar_url ?? current.avatar_url,
        cover_url: updated.cover_url ?? current.cover_url,
      })
      queryClient.setQueryData(queryKeys.users.profile('me'), updated)
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}
