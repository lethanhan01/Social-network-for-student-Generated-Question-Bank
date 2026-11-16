import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
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
  let intersectionCallbacks: IntersectionObserverCallback[] = []

  function triggerIntersect(isIntersecting = true) {
    act(() => {
      for (const cb of [...intersectionCallbacks]) {
        cb(
          [{ isIntersecting } as IntersectionObserverEntry],
          {} as IntersectionObserver
        )
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    intersectionCallbacks = []
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        private readonly cb: IntersectionObserverCallback
        constructor(cb: IntersectionObserverCallback) {
          this.cb = cb
        }
        observe = vi.fn(() => {
          intersectionCallbacks.push(this.cb)
        })
        unobserve = vi.fn()
        disconnect = vi.fn(() => {
          intersectionCallbacks = intersectionCallbacks.filter((item) => item !== this.cb)
        })
        takeRecords = vi.fn(() => [])
      }
    )
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

  it('renders header, create box, and posts without filter tabs', async () => {
    renderWithQueryClient(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FeedPage />
      </BrowserRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: /Bảng tin & Hoạt động/i })
    ).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Bộ lọc bảng tin' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Tất cả bảng tin/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Môn học của tôi/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Ghi chú Giảng viên/i })).not.toBeInTheDocument()
    expect(await screen.findByText(/Bài viết kiểm thử trên FeedPage/i)).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Lối tắt' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tìm kiếm & Kết nối' })).toHaveAttribute('href', '/friends')
  })

  it('automatically loads more pages on scroll without a load more button', async () => {
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
      subject_id: id === 103 ? 2 : 1,
      content: id === 103 ? 'Bài viết môn học thứ 2' : 'Bài viết môn học thứ 1',
    }))
    renderWithQueryClient(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FeedPage />
      </BrowserRouter>
    )
    expect(await screen.findByText('Bài viết môn học thứ 1')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).not.toBeInTheDocument()

    triggerIntersect(true)

    expect(await screen.findByText('Bài viết môn học thứ 2')).toBeInTheDocument()
    expect(feedService.getActivityFeeds).toHaveBeenCalledTimes(2)
  })

  it('auto-loads next page on ?tab=MINE when scrolling near bottom', async () => {
    window.history.replaceState({}, '', '/feed?tab=MINE')
    vi.mocked(postService.getMyPosts)
      .mockResolvedValueOnce({
        items: [
          {
            post_id: 201,
            content: 'Bài viết cá nhân trang 1',
            author: { user_id: 235, full_name: 'Lê Thành An' },
          },
        ],
        pagination: { has_next: true, after: 201 },
      })
      .mockResolvedValueOnce({
        items: [
          {
            post_id: 202,
            content: 'Bài viết cá nhân trang 2',
            author: { user_id: 235, full_name: 'Lê Thành An' },
          },
        ],
        pagination: { has_next: false },
      })

    renderWithQueryClient(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FeedPage />
      </BrowserRouter>
    )
    expect(await screen.findByText('Bài viết cá nhân trang 1')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).not.toBeInTheDocument()

    triggerIntersect(true)

    expect(await screen.findByText('Bài viết cá nhân trang 2')).toBeInTheDocument()
    expect(postService.getMyPosts).toHaveBeenCalledTimes(2)
  })

  it('deduplicates repeated posts across infinite scroll pages', async () => {
    vi.mocked(feedService.getActivityFeeds)
      .mockResolvedValueOnce({
        items: [{ feed_id: 1, target_type: 'POST', target_id: 102 }],
        pagination: { has_next: true, after: 1 },
      })
      .mockResolvedValueOnce({
        items: [
          { feed_id: 2, target_type: 'POST', target_id: 102 },
          { feed_id: 3, target_type: 'POST', target_id: 103 },
        ],
        pagination: { has_next: false },
      })
    vi.mocked(postService.getPostById).mockImplementation(async (id) => ({
      post_id: id,
      content: id === 103 ? 'Bài viết mới không trùng' : 'Bài viết gốc 102',
    }))

    renderWithQueryClient(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FeedPage />
      </BrowserRouter>
    )
    expect(await screen.findByText('Bài viết gốc 102')).toBeInTheDocument()

    triggerIntersect(true)

    expect(await screen.findByText('Bài viết mới không trùng')).toBeInTheDocument()
    expect(screen.getAllByText('Bài viết gốc 102')).toHaveLength(1)
  })

  it('stops auto-loading on next-page network error and retries when clicking retry', async () => {
    vi.mocked(feedService.getActivityFeeds)
      .mockResolvedValueOnce({
        items: [{ feed_id: 1, target_type: 'POST', target_id: 102 }],
        pagination: { has_next: true, after: 1 },
      })
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        items: [{ feed_id: 2, target_type: 'POST', target_id: 103 }],
        pagination: { has_next: false },
      })
    vi.mocked(postService.getPostById).mockImplementation(async (id) => ({
      post_id: id,
      content: id === 103 ? 'Bài viết sau khi thử lại' : 'Bài viết trang đầu',
    }))
    const user = userEvent.setup()

    renderWithQueryClient(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FeedPage />
      </BrowserRouter>
    )
    expect(await screen.findByText('Bài viết trang đầu')).toBeInTheDocument()

    triggerIntersect(true)

    const retryButton = await screen.findByRole('button', { name: 'Thử lại' })
    expect(retryButton).toBeInTheDocument()
    expect(feedService.getActivityFeeds).toHaveBeenCalledTimes(2)

    await user.click(retryButton)

    expect(await screen.findByText('Bài viết sau khi thử lại')).toBeInTheDocument()
    expect(feedService.getActivityFeeds).toHaveBeenCalledTimes(3)
  })

  it('halts infinite pagination if the backend returns an empty page despite has_next=true', async () => {
    vi.mocked(feedService.getActivityFeeds)
      .mockResolvedValueOnce({
        items: [{ feed_id: 1, target_type: 'POST', target_id: 102 }],
        pagination: { has_next: true, after: 1 },
      })
      .mockResolvedValueOnce({
        items: [],
        pagination: { has_next: true, after: 2 },
      })

    renderWithQueryClient(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FeedPage />
      </BrowserRouter>
    )
    expect(await screen.findByText(/Bài viết kiểm thử trên FeedPage/i)).toBeInTheDocument()

    triggerIntersect(true)

    await waitFor(() => {
      expect(feedService.getActivityFeeds).toHaveBeenCalledTimes(2)
    })
    triggerIntersect(true)
    expect(feedService.getActivityFeeds).toHaveBeenCalledTimes(2)
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
    await screen.findByText(/Bài viết kiểm thử trên FeedPage/i)
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
    await screen.findByText(/Bài viết kiểm thử trên FeedPage/i)
    expect(postService.getMyPosts).toHaveBeenCalled()
    expect(feedService.getActivityFeeds).not.toHaveBeenCalled()
  })
})
