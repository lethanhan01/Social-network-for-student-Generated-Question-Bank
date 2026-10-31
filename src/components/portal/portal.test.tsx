import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { PinModal } from './PinModal'
import { ReportModal } from '@/components/social/ReportPostModal'
import HiddenVaultPage from '@/pages/messages/HiddenVaultPage'
import { chatService } from '@/services/chat.service'
import { userService } from '@/services/user.service'
import { utilityService } from '@/services/utility.service'
import i18n from '@/lib/i18n'
import { notificationPath } from '@/pages/notifications/notification-target'

vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
describe('Portal security and forms', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    await i18n.changeLanguage('vi')
  })

  it('TC-PIN-01: rejects invalid and mismatched PIN without sending it to the server', async () => {
    const user = userEvent.setup()
    const submit = vi.spyOn(userService, 'setHiddenChatPin').mockResolvedValue()
    renderWithQueryClient(<PinModal mode="setup" onClose={vi.fn()} onSuccess={vi.fn()} />)
    await user.type(screen.getByLabelText(/Mã PIN 6 chữ số/), '123')
    await user.click(screen.getByRole('button', { name: 'Thiết lập mã PIN' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('đúng 6 chữ số')
    expect(submit).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText(/Mã PIN 6 chữ số/), '456')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText(/Nhập lại mã PIN/), '654321')
    await user.click(screen.getByRole('button', { name: 'Thiết lập mã PIN' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('chưa khớp')
    expect(submit).not.toHaveBeenCalled()
  })

  it('TC-VAULT-02: keeps hidden data locked until successful server verification and locks again', async () => {
    const user = userEvent.setup()
    const unlock = vi
      .spyOn(chatService, 'unlockHiddenConversations')
      .mockRejectedValueOnce(new Error('PIN không đúng'))
      .mockResolvedValueOnce()
    const hidden = vi.spyOn(chatService, 'getHiddenConversations').mockResolvedValue({ items: [] })
    renderWithQueryClient(
      <MemoryRouter>
        <HiddenVaultPage />
      </MemoryRouter>
    )
    expect(hidden).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Mở khóa kho' }))
    await user.type(screen.getByLabelText(/Mã PIN 6 chữ số/), '123456')
    await user.click(screen.getByRole('button', { name: 'Mở khóa kho' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('PIN không đúng')
    expect(hidden).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Mở khóa kho' }))
    await waitFor(() => expect(hidden).toHaveBeenCalledTimes(1))
    expect(unlock).toHaveBeenLastCalledWith({ pin: '123456' })
    await user.click(screen.getByRole('button', { name: 'Khóa kho' }))
    expect(await screen.findByRole('heading', { name: 'Kho hội thoại đang khóa' })).toBeInTheDocument()
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
