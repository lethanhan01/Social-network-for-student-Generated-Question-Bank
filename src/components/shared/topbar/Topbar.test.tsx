import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { Topbar } from './Topbar'

describe('Topbar', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { user_id: 1, roles: ['STUDENT'] },
      token: 'test-token',
      isAuthenticated: true,
      hasHydrated: true,
    })
  })
  it('renders a full-width fixed header with solid surface token (bg-surface-card) and border', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Topbar />
      </MemoryRouter>
    )

    const header = screen.getByRole('banner')
    expect(header).toHaveClass(
      'fixed',
      'top-0',
      'left-0',
      'right-0',
      'z-20',
      'h-16',
      'bg-surface-card',
      'border-b',
      'border-line-subtle'
    )
    expect(header).not.toHaveClass('bg-transparent')

    expect(screen.getByRole('link', { name: /sqb hust/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /sqb hust/i })).toBeInTheDocument()
    expect(screen.queryByText('Question Bank')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /menu người dùng/i })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: /tìm kiếm trên sqb hust/i })).toBeInTheDocument()
  })

  it('renders 5 primary navigation tabs in TopbarNav', () => {
    render(
      <MemoryRouter initialEntries={['/feed']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Topbar />
      </MemoryRouter>
    )

    const mainNav = screen.getByRole('navigation', { name: /thanh điều hướng chính/i })
    expect(mainNav).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /mạng xã hội học tập/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /bạn bè & kết nối/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ngân hàng câu hỏi/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /đấu trường minigame/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cửa hàng & túi đồ/i })).toBeInTheDocument()
  })

  it('renders and toggles mobile menu button when onToggleMobileMenu is provided', () => {
    const onToggle = vi.fn()
    const { rerender } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Topbar isMobileMenuOpen={false} onToggleMobileMenu={onToggle} />
      </MemoryRouter>
    )

    const openBtn = screen.getByRole('button', { name: /mở menu/i })
    expect(openBtn).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(openBtn)
    expect(onToggle).toHaveBeenCalledTimes(1)

    rerender(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Topbar isMobileMenuOpen={true} onToggleMobileMenu={onToggle} />
      </MemoryRouter>
    )

    const closeBtn = screen.getByRole('button', { name: /đóng menu/i })
    expect(closeBtn).toHaveAttribute('aria-expanded', 'true')
  })
})
