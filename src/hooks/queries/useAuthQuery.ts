import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { queryKeys } from '@/lib/query-keys'
import type { ChangePasswordRequest } from '@/types'

export function useLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof authService.login>[0]) => authService.login(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => authService.changePassword(payload),
  })
}
