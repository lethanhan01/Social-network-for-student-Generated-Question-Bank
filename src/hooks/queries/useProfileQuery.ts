import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { queryKeys } from '@/lib/query-keys'
import type { UpdateProfileRequest } from '@/types'

export function useMyProfileQuery() {
  return useQuery({
    queryKey: queryKeys.users.profile('me'),
    queryFn: ({ signal }) => userService.getMyProfile({ signal }),
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
      queryClient.setQueryData(queryKeys.users.profile('me'), updated)
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}
