import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { ReportModal } from '@/components/social/ReportPostModal'
import { ChatPortalActions } from './ChatPortalActions'
import { SecuritySettings } from '@/pages/common/settings/SecuritySettings'
import { utilityService } from '@/services/utility.service'
import i18n from '@/lib/i18n'
import { notificationPath } from '@/pages/common/notifications/notification-target'

vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
describe('Portal security and forms', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    await i18n.changeLanguage('vi')
  })

  it('TC-SECURITY-01: renders password change only without hidden vault PIN settings', () => {
    renderWithQueryClient(<SecuritySettings />)
    expect(screen.getByRole('heading', { name: 'Đổi mật khẩu' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /kho hội thoại ẩn/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mã pin/i })).not.toBeInTheDocument()
  })

  it('TC-DIRECT-02: renders direct conversation details without hidden vault action', () => {
    renderWithQueryClient(
      <MemoryRouter>
        <ChatPortalActions conversationId={12} conversation={{ conversation_id: 12, type: 'DIRECT', display_name: 'Lan' }} onClose={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByText('Lan')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /ẩn hội thoại/i })).not.toBeInTheDocument()
  })

  it('TC-REPORT-03: preserves input on API error and submits the correct target on retry', async () => {
    const user = userEvent.setup()
    const submit = vi
      .spyOn(utilityService, 'createReport')
      .mockRejectedValueOnce(new Error('Mất kết nối'))
      .mockResolvedValueOnce({ report_id: 4 })
    const close = vi.fn()
    renderWithQueryClient(<ReportModal isOpen targetType="USER" targetId={42} onClose={close} />)
    await user.type(screen.getByLabelText('Mô tả bổ sung'), 'Tin nhắn quấy rối')
    await user.click(screen.getByRole('button', { name: 'Gửi báo cáo' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Mất kết nối')
    expect(screen.getByLabelText('Mô tả bổ sung')).toHaveValue('Tin nhắn quấy rối')
    expect(close).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Gửi báo cáo' }))
    await waitFor(() => expect(close).toHaveBeenCalledTimes(1))
    expect(submit).toHaveBeenLastCalledWith({
      target_type: 'USER',
      target_id: 42,
      violation_type: 'SPAM',
      description: 'Tin nhắn quấy rối',
    })
  })

  it('TC-NOTIFICATION-04: only navigates to known routes and ignores arbitrary target URLs', () => {
    expect(notificationPath({ type: 'POST', target_id: 3, url: 'javascript:alert(1)' })).toBe('/posts/3')
    expect(notificationPath({ type: 'USER', target_id: -1 })).toBeNull()
    expect(notificationPath({ url: 'https://evil.example/' })).toBeNull()
    expect(notificationPath({ type: 'CONVERSATION', target_id: 7 })).toBe('/messages?conversation=7')
  })
})
