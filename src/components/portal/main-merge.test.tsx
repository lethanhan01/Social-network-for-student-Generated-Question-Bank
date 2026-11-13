import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { StartDirectConversation } from './StartDirectConversation'
import { ChatPortalActions } from './ChatPortalActions'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import DashboardLayout from '@/layouts/DashboardLayout'
import { chatService } from '@/services/chat.service'
import { useAuthStore } from '@/stores/authStore'
import i18n from '@/lib/i18n'

vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
function Location() {
  const location = useLocation()
  return <p role="status">{location.search}</p>
}
describe('Main merge integration', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearAuth()
    await i18n.changeLanguage('vi')
    vi.spyOn(chatService, 'getConversations').mockResolvedValue({
      items: [{ conversation_id: 24, display_name: 'Study group', type: 'GROUP' }],
    })
  })
  it('TC-MERGE-01: keeps the profile userId link and creates a conversation only after user confirmation', async () => {
    const user = userEvent.setup()
    const create = vi.spyOn(chatService, 'createDirectConversation').mockResolvedValue({ conversation_id: 24 })
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/messages?userId=9']}>
        <StartDirectConversation />
        <Location />
      </MemoryRouter>
    )
    expect(create).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: i18n.t('social.startConversation') }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('conversation=24'))
    expect(create).toHaveBeenCalledWith({ target_user_id: 9 })
  })
  it('TC-MERGE-02: exposes group administration from the new main chat view', async () => {
    vi.spyOn(chatService, 'getGroupMembers').mockResolvedValue([{ user_id: 9, full_name: 'Mai Anh' }])
    const user = userEvent.setup()
    renderWithQueryClient(
      <MemoryRouter>
        <ChatPortalActions conversationId={24} conversation={{ conversation_id: 24, type: 'GROUP', display_name: 'Study group' }} onClose={vi.fn()} />
      </MemoryRouter>
    )
    await user.click(await screen.findByRole('button', { name: 'Thành viên (1)' }))
    expect(screen.getByText('Mai Anh')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ẩn hội thoại vào kho PIN' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Quản trị nhóm chat' }))
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Quản trị nhóm chat')
  })
  it('TC-MERGE-03: keeps a visible link to the PIN vault in the new chat sidebar', () => {
    renderWithQueryClient(
      <MemoryRouter>
        <ChatSidebar onSelectConversation={vi.fn()} onOpenNewChat={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: 'Kho hội thoại ẩn' })).toHaveAttribute('href', '/messages/hidden-vault')
  })
  it('TC-MERGE-04: does not apply the full-screen chat overflow lock to the PIN vault', () => {
    useAuthStore.setState({
      user: { user_id: 1, roles: ['STUDENT'] },
      token: 'test-token',
      isAuthenticated: true,
      hasHydrated: true,
    })
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/messages/hidden-vault']}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/messages/hidden-vault" element={<h1>Vault</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('main')).not.toHaveClass('overflow-hidden')
    expect(screen.getByRole('navigation', { name: /điều hướng di động/i })).toBeInTheDocument()
  })
})
