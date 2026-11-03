import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { GroupMembers } from './GroupMembers'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import { DeviceSettings } from '@/pages/settings/DeviceSettings'
import { notificationService } from '@/services/notification.service'
import { deviceService } from '@/services/device.service'
import i18n from '@/lib/i18n'
import type { ConversationMemberDto } from '@/types'

vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
const members: ConversationMemberDto[] = [
  { user_id: 1, full_name: 'Trưởng nhóm', role: 'CHIEF' },
  { user_id: 2, full_name: 'Thành viên', role: 'VILLAGER' },
]
function Location() {
  const location = useLocation()
  return <p role="status">{location.pathname}</p>
}
describe('Portal workflows', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    await i18n.changeLanguage('vi')
  })
  it('TC-GROUP-01: only the chief can assign roles, and regular members cannot remove peers', () => {
    const { unmount } = renderWithQueryClient(
      <GroupMembers members={members} userId={2} busy={false} onAction={vi.fn()} />
    )
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xóa khỏi nhóm' })).not.toBeInTheDocument()
    unmount()
    renderWithQueryClient(<GroupMembers members={members} userId={1} busy={false} onAction={vi.fn()} />)
    expect(screen.getByRole('combobox', { name: 'Vai trò của Thành viên' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xóa khỏi nhóm' })).toBeInTheDocument()
  })
  it('TC-NOTIFICATION-02: marks the notification read before navigating to its target', async () => {
    const user = userEvent.setup()
    vi.spyOn(notificationService, 'getNotifications').mockResolvedValue({
      items: [
        {
          notification_id: 7,
          title: 'Phản hồi mới',
          body: 'Bạn có bình luận mới',
          target: { type: 'POST', target_id: 15 },
        },
      ],
    })
    const read = vi.spyOn(notificationService, 'markAsRead').mockResolvedValue()
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/notifications']}>
        <NotificationsPage />
        <Location />
      </MemoryRouter>
    )
    await user.click(await screen.findByRole('button', { name: /Phản hồi mới/ }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('/posts/15'))
    expect(read).toHaveBeenCalledWith(7)
  })
  it('TC-DEVICES-03: requires confirmation before revoking a remote device', async () => {
    const user = userEvent.setup()
    vi.spyOn(deviceService, 'getMyDevices').mockResolvedValue({
      devices: [
        { device_id: 'current', device_name: 'Current browser', is_current_device: true },
        { device_id: 'remote', device_name: 'Other browser', is_current_device: false },
      ],
    })
    const revoke = vi.spyOn(deviceService, 'revokeDevice').mockResolvedValue()
    renderWithQueryClient(<DeviceSettings />)
    await user.click(await screen.findByRole('button', { name: 'Đăng xuất thiết bị' }))
    expect(revoke).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Xác nhận' }))
    await waitFor(() => expect(revoke).toHaveBeenCalledWith('remote'))
  })
})
