import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { userService } from '@/services/user.service'
import { gamificationService } from '@/services/gamification.service'
import { postService } from '@/services/post.service'
import { useAuthStore } from '@/stores/authStore'
import { relationshipService } from '@/services/relationship.service'
import ProfilePage from './ProfilePage'

vi.mock('@/services/relationship.service', () => ({
  relationshipService: { getRelationshipStats: vi.fn() },
}))

vi.mock('@/services/user.service', () => ({
  userService: {
    getMyProfile: vi.fn(),
    getUserProfile: vi.fn(),
    updateMyProfile: vi.fn(),
  },
}))

vi.mock('@/services/gamification.service', () => ({
  gamificationService: {
    getMyBadges: vi.fn(),
    getUserBadges: vi.fn(),
  },
}))

vi.mock('@/services/post.service', () => ({
  postService: {
    getUserPosts: vi.fn(),
  },
}))

describe('ProfilePage Component', () => {
  it('updates the current account name after saving the profile', async () => {
    const user = userEvent.setup()
    vi.mocked(userService.updateMyProfile).mockResolvedValue({ user_id: 100, role: 'STUDENT', full_name: 'Updated account name' })
    renderWithQueryClient(<MemoryRouter initialEntries={['/profile/me']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Routes><Route path="/profile/:userId" element={<ProfilePage />} /></Routes></MemoryRouter>)
    await user.click(await screen.findByRole('button', { name: 'Chỉnh sửa hồ sơ' }))
    const name = screen.getByRole('textbox', { name: 'Họ và tên' })
    await user.clear(name)
    await user.type(name, 'Updated account name')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
    await waitFor(() => expect(useAuthStore.getState().user?.fullName).toBe('Updated account name'))
  })
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(relationshipService.getRelationshipStats).mockResolvedValue({
      relationship_with_me: {
        friend: false,
        following: false,
        blocked: false,
        friend_request_status: 'NONE',
      },
    })
    useAuthStore.setState({
      user: {
        user_id: 100,
        fullName: 'Nguyễn Văn Minh',
        role: 'STUDENT',
        roles: ['STUDENT'],
      },
      token: 'test-token',
      isAuthenticated: true,
      hasHydrated: true,
    })

    vi.mocked(postService.getUserPosts).mockResolvedValue({
      items: [],
      pagination: { has_next: false },
    })
    vi.mocked(userService.getMyProfile).mockResolvedValue({
      user_id: 100,
      role: 'STUDENT',
      full_name: 'Nguyễn Văn Minh',
    })

    vi.mocked(gamificationService.getMyBadges).mockResolvedValue([
      { badge_id: 1, name: 'Chiến binh Giải tích', description: 'Đạt 10 bài điểm tối đa' },
    ])

    vi.mocked(gamificationService.getUserBadges).mockResolvedValue([
      { badge_id: 2, name: 'Bậc thầy Lập trình', description: 'Hoàn thành 50 câu hỏi' },
    ])
  })

  it('renders my profile with edit button', async () => {
    vi.mocked(userService.getMyProfile).mockResolvedValue({
      user_id: 100,
      full_name: 'Nguyễn Văn Minh',
      email: 'minh.nv@sis.hust.edu.vn',
      role: 'STUDENT',
      bio: 'Sinh viên năm 4 ĐHBK Hà Nội',
    })

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/profile/me']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText(/Nguyễn Văn Minh/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Chỉnh sửa hồ sơ/i })).toBeInTheDocument()
    expect(await screen.findByText(/Chiến binh Giải tích/i)).toBeInTheDocument()
  })

  it('renders other user profile with message and peer friend button', async () => {
    vi.mocked(userService.getUserProfile).mockResolvedValue({
      user_id: 200,
      full_name: 'Hoàng Thị Lan',
      role: 'STUDENT',
      school_faculty: 'Viện CNTT & TT',
      relationships: {
        is_friend: false,
        friend_request_status: 'NONE',
      },
    })

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/profile/200']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText(/Hoàng Thị Lan/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Nhắn tin/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Kết bạn/i })).toBeInTheDocument()
    expect(await screen.findByText(/Bậc thầy Lập trình/i)).toBeInTheDocument()
  })

  it('opens the user report dialog from another profile', async () => {
    vi.mocked(userService.getUserProfile).mockResolvedValue({
      user_id: 200,
      role: 'STUDENT',
      full_name: 'Hoàng Thị Lan',
    })
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/profile/200']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Tùy chọn hồ sơ' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Gửi báo cáo' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('recognizes my numeric route when the auth user uses the userId alias', async () => {
    useAuthStore.setState({ user: { userId: '100', roles: ['STUDENT'] } })
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/profile/100']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(await screen.findByRole('button', { name: /Chỉnh sửa hồ sơ/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tùy chọn hồ sơ' })).not.toBeInTheDocument()
  })
})
