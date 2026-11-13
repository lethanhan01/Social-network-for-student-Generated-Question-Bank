import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { chatService } from '@/services/chat.service'
import { notificationService } from '@/services/notification.service'
import { deviceService } from '@/services/device.service'
import { authService } from '@/services/auth.service'
import type { UpdatePushSettingsRequestDto, ChangePasswordRequest } from '@/types'

export function useInboxQuery() {
  return useInfiniteQuery({
    queryKey: queryKeys.conversations.inbox(),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) => chatService.getConversations({ cursor: pageParam, limit: 30 }, { signal }),
    getNextPageParam: (page) =>
      page.pagination?.has_next && page.pagination.after != null ? String(page.pagination.after) : undefined,
  })
}
export function useMessagesQuery(id: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.conversations.messages(id),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) => chatService.getMessages(id, { cursor: pageParam, limit: 40 }, { signal }),
    getNextPageParam: (page) =>
      page.pagination?.has_next && page.pagination.after != null ? String(page.pagination.after) : undefined,
    enabled: id > 0,
  })
}
export function useGroupMembersQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.conversations.members(id),
    queryFn: ({ signal }) => chatService.getGroupMembers(id, { signal }),
    enabled: id > 0,
  })
}
export function usePortalMutation<T, R>(
  mutationFn: (payload: T) => Promise<R>,
  domain: 'conversations' | 'notifications' | 'auth' = 'conversations'
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys[domain].all })
    },
  })
}
export function useNotificationsQuery() {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      notificationService.getNotifications({ cursor: pageParam, limit: 30 }, { signal }),
    getNextPageParam: (page) =>
      page.pagination?.has_next && page.pagination.after != null ? String(page.pagination.after) : undefined,
  })
}
export function usePushSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.notifications.pushSettings(),
    queryFn: ({ signal }) => notificationService.getPushSettings({ signal }),
  })
}
export function useUpdatePushMutation() {
  return usePortalMutation(
    (payload: UpdatePushSettingsRequestDto) => notificationService.updatePushSettings(payload),
    'notifications'
  )
}
export function useDevicesQuery() {
  return useQuery({
    queryKey: queryKeys.auth.devices(),
    queryFn: ({ signal }) => deviceService.getMyDevices({ signal }),
  })
}
export function useRevokeDeviceMutation() {
  return usePortalMutation((id: string) => deviceService.revokeDevice(id), 'auth')
}
export function usePasswordMutation() {
  return useMutation({ mutationFn: (payload: ChangePasswordRequest) => authService.changePassword(payload) })
}
