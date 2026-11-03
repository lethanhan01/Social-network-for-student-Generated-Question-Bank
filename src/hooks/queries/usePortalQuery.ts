import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { chatService } from '@/services/chat.service'
import { notificationService } from '@/services/notification.service'
import { deviceService } from '@/services/device.service'
import { userService } from '@/services/user.service'
import { authService } from '@/services/auth.service'
import type { UpdatePushSettingsRequestDto, SetHiddenChatPinDto, ChangePasswordRequest } from '@/types'

export function useInboxQuery(hidden: boolean) {
  return useInfiniteQuery({
    queryKey: hidden ? queryKeys.conversations.hidden() : queryKeys.conversations.inbox(),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      hidden
        ? chatService.getHiddenConversations({ signal })
        : chatService.getConversations({ cursor: pageParam, limit: 30 }, { signal }),
    getNextPageParam: (page) =>
      !hidden && page.pagination?.has_next && page.pagination.after != null ? String(page.pagination.after) : undefined,
    gcTime: hidden ? 0 : 300000,
  })
}
export function useMessagesQuery(id: number, hidden: boolean) {
  return useInfiniteQuery({
    queryKey: queryKeys.conversations.messages(id, { hidden }),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) => chatService.getMessages(id, { cursor: pageParam, limit: 40 }, { signal }),
    getNextPageParam: (page) =>
      page.pagination?.has_next && page.pagination.after != null ? String(page.pagination.after) : undefined,
    enabled: id > 0,
    gcTime: hidden ? 0 : 300000,
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
export function usePinMutation(mode: 'unlock' | 'setup' | 'change') {
  return useMutation({
    mutationFn: (payload: SetHiddenChatPinDto) =>
      mode === 'unlock'
        ? chatService.unlockHiddenConversations({ pin: payload.pin })
        : userService.setHiddenChatPin(payload),
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
