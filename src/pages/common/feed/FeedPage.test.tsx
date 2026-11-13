import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { postService } from '@/services/post.service'
import { feedService } from '@/services/feed.service'
import { userService } from '@/services/user.service'
import { courseService } from '@/services/course.service'
import { relationshipService } from '@/services/relationship.service'
import { sessionService } from '@/services/session.service'
import { useAuthStore } from '@/stores/authStore'
import FeedPage from './FeedPage'

vi.mock('@/services/session.service', () => ({
  sessionService: { getMyEnrolledSubjects: vi.fn() },
}))

vi.mock('@/services/post.service', () => ({
  postService: {
    getPostById: vi.fn(),
    getMyPosts: vi.fn(),
    createPost: vi.fn(),
    deletePost: vi.fn(),
    updatePost: vi.fn(),
    updateLecturerNote: vi.fn(),
  },
}))

vi.mock('@/services/feed.service', () => ({
  feedService: {
    getActivityFeeds: vi.fn(),
    getNewFeedCount: vi.fn(),
  },
}))

vi.mock('@/services/user.service', () => ({
  userService: {
    getMyProfile: vi.fn(),
    getUserProfile: vi.fn(),
  },
}))

vi.mock('@/services/course.service', () => ({
  courseService: {
    getSubjects: vi.fn(),
  },
}))

vi.mock('@/services/relationship.service', () => ({
  relationshipService: {
    getMyFriends: vi.fn(),
  },
}))

describe('FeedPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.replaceState({}, '', '/feed')
    useAuthStore.setState({
      user: { user_id: 235, fullName: 'Nguyễn Văn An', roles: ['STUDENT'] },
      token: 'test-token',
      isAuthenticated: true,
      hasHydrated: true,
    })
    vi.mocked(userService.getMyProfile).mockResolvedValue({
      user_id: 235,
      full_name: 'Lê Thành An',
      student_lecturer_code: '20235631',
      role: 'STUDENT',
    })
    vi.mocked(courseService.getSubjects).mockResolvedValue([
      { subject_id: 1, code: 'IT4409', name: 'Công nghệ Web' },
    ])
    vi.mocked(sessionService.getMyEnrolledSubjects).mockResolvedValue([
      { subject_id: 1, code: 'IT4409', name: 'Công nghệ Web' },
    ])
    vi.mocked(relationshipService.getMyFriends).mockResolvedValue({
      items: [],
      total_friends: 0,
    })
    vi.mocked(feedService.getNewFeedCount).mockResolvedValue({ new_count: 0 })
    vi.mocked(feedService.getActivityFeeds).mockResolvedValue({
      items: [{ feed_id: 1, target_type: 'POST', target_id: 102 }],
      pagination: { has_next: false },
    })
    vi.mocked(postService.getPostById).mockResolvedValue({
      post_id: 102,
      content: 'Bài viết kiểm thử trên FeedPage',
    })
    vi.mocked(postService.getMyPosts).mockResolvedValue({
      items: [
        {
          post_id: 102,
          content: 'Bài viết kiểm thử trên FeedPage',
          react_count: 3,
          comment_count: 1,
          author: { user_id: 235, full_name: 'Lê Thành An' },
        },
      ],
      pagination: { has_next: false },
    })
  })

  it('renders header, tabs, create box, and posts', async () => {
    renderWithQueryClient(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FeedPage />
      </BrowserRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: /Bảng tin & Hoạt động/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tất cả bảng tin/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Môn học của tôi/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ghi chú Giảng viên/i })).toBeInTheDocument()
    expect(await screen.findByText(/Bài viết kiểm thử trên FeedPage/i)).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Lối tắt tính năng' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tìm kiếm & Kết nối' })).toHaveAttribute('href', '/friends')
  })

  it('syncs the sidebar subject filter with the feed URL and subject selector', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><FeedPage /></BrowserRouter>)

    await user.click(await screen.findByRole('button', { name: /Công nghệ Web/ }))
    expect(new URLSearchParams(window.location.search).get('subject')).toBe('1')
    expect(screen.getByRole('combobox', { name: 'Lọc theo môn học' })).toHaveTextContent('IT4409')

    await user.click(screen.getByRole('button', { name: /Công nghệ Web/ }))
    expect(new URLSearchParams(window.location.search).has('subject')).toBe(false)
  })
  it('filters posts by enrolled subjects and restores them when returning to all posts', async () => {
    vi.mocked(postService.getPostById).mockResolvedValue({
      post_id: 102, subject_id: 2, content: 'A post from another subject',
    })
    const user = userEvent.setup()
    renderWithQueryClient(<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><FeedPage /></BrowserRouter>)
    expect(await screen.findByText('A post from another subject')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Môn học của tôi' }))
    expect(screen.queryByText('A post from another subject')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tất cả bảng tin' }))
    expect(await screen.findByText('A post from another subject')).toBeInTheDocument()
  })

  it('keeps pagination available when no loaded posts match the lecturer filter', async () => {
    vi.mocked(feedService.getActivityFeeds)
      .mockResolvedValueOnce({
        items: [{ feed_id: 1, target_type: 'POST', target_id: 102 }],
        pagination: { has_next: true, after: 1 },
      })
      .mockResolvedValueOnce({
        items: [{ feed_id: 2, target_type: 'POST', target_id: 103 }],
        pagination: { has_next: false },
      })
    vi.mocked(postService.getPostById).mockImplementation(async (id) => ({
      post_id: id,
      content: id === 103 ? 'Matching lecturer post' : 'Ordinary post',
      lecturer_note: id === 103 ? 'Lecturer note' : undefined,
    }))
    const user = userEvent.setup()
    renderWithQueryClient(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FeedPage />
      </BrowserRouter>
    )
    await user.click(screen.getByRole('button', { name: 'Ghi chú Giảng viên' }))
    await user.click(await screen.findByRole('button', { name: 'Xem thêm' }))
    expect(await screen.findByText('Matching lecturer post')).toBeInTheDocument()
  })

  it('does not fire feed or sidebar API calls when unauthenticated or missing token', () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false, hasHydrated: true })
    renderWithQueryClient(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FeedPage />
      </BrowserRouter>
    )
    expect(userService.getMyProfile).not.toHaveBeenCalled()
    expect(courseService.getSubjects).not.toHaveBeenCalled()
    expect(relationshipService.getMyFriends).not.toHaveBeenCalled()
    expect(sessionService.getMyEnrolledSubjects).not.toHaveBeenCalled()
    expect(feedService.getActivityFeeds).not.toHaveBeenCalled()
    expect(postService.getMyPosts).not.toHaveBeenCalled()
    expect(feedService.getNewFeedCount).not.toHaveBeenCalled()
  })

  it('defers GET /posts/me when tab is not MINE and fetches it on ?tab=MINE', async () => {
    const first = renderWithQueryClient(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FeedPage />
      </BrowserRouter>
    )
    await screen.findByRole('button', { name: 'Tất cả bảng tin' })
    expect(feedService.getActivityFeeds).toHaveBeenCalled()
    expect(postService.getMyPosts).not.toHaveBeenCalled()
    first.unmount()

    vi.clearAllMocks()
    window.history.replaceState({}, '', '/feed?tab=MINE')
    renderWithQueryClient(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FeedPage />
      </BrowserRouter>
    )
    await screen.findByRole('button', { name: 'Tất cả bảng tin' })
    expect(postService.getMyPosts).toHaveBeenCalled()
    expect(feedService.getActivityFeeds).not.toHaveBeenCalled()
  })
})
