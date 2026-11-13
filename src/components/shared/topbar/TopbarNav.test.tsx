import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { TopbarNav } from './TopbarNav'

describe('TopbarNav', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { user_id: 1, roles: ['STUDENT'] },
      token: 'test-token',
      isAuthenticated: true,
      hasHydrated: true,
    })
  })

  it('renders all 5 student navigation links with accessible names', () => {
    render(
      <MemoryRouter initialEntries={['/feed']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TopbarNav />
      </MemoryRouter>
    )

    const nav = screen.getByRole('navigation', { name: /thanh điều hướng chính/i })
    expect(nav).toBeInTheDocument()

    const feedLink = screen.getByRole('link', { name: /mạng xã hội học tập/i })
    expect(feedLink).toHaveAttribute('href', '/feed')
    expect(feedLink).toHaveClass('text-action-accent', 'border-b-2', 'border-action-accent')
    expect(feedLink).toHaveAttribute('aria-current', 'page')

    const friendsLink = screen.getByRole('link', { name: /bạn bè & kết nối/i })
    expect(friendsLink).toHaveAttribute('href', '/friends')
    expect(friendsLink).toHaveClass('border-transparent')

    expect(screen.getByRole('link', { name: /ngân hàng câu hỏi/i })).toHaveAttribute('href', '/student/subjects')
    expect(screen.getByRole('link', { name: /đấu trường minigame/i })).toHaveAttribute('href', '/student/gamification/minigames')
    expect(screen.getByRole('link', { name: /cửa hàng & túi đồ/i })).toHaveAttribute('href', '/student/shop')
  })

  it('renders all 5 teacher navigation links when logged in as LECTURER', () => {
    useAuthStore.setState({
      user: { user_id: 2, role: 'LECTURER', roles: ['LECTURER'] },
      token: 'test-token',
      isAuthenticated: true,
      hasHydrated: true,
    })

    render(
      <MemoryRouter initialEntries={['/teacher/dashboard']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TopbarNav />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /tổng quan giảng dạy/i })).toHaveAttribute('href', '/teacher/dashboard')
    expect(screen.getByRole('link', { name: /lớp học phần/i })).toHaveAttribute('href', '/teacher/classes')
    expect(screen.getByRole('link', { name: /thẩm định câu hỏi/i })).toHaveAttribute('href', '/teacher/reviews')
    expect(screen.getByRole('link', { name: /ngân hàng đề thi/i })).toHaveAttribute('href', '/teacher/exams')
    expect(screen.getByRole('link', { name: /quản trị đào tạo/i })).toHaveAttribute('href', '/teacher/academic')
    expect(screen.queryByRole('link', { name: /đấu trường minigame/i })).not.toBeInTheDocument()
  })

  it('renders nothing when unauthenticated', () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false, hasHydrated: true })
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TopbarNav />
      </MemoryRouter>
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
