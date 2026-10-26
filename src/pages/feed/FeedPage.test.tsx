import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { postService } from '@/services/post.service'
import { feedService } from '@/services/feed.service'
import { userService } from '@/services/user.service'
import { courseService } from '@/services/course.service'
import { relationshipService } from '@/services/relationship.service'
import FeedPage from './FeedPage'

vi.mock('@/services/post.service', () => ({
  postService: {
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
    vi.mocked(userService.getMyProfile).mockResolvedValue({
      user_id: 235,
      full_name: 'Lê Thành An',
      student_lecturer_code: '20235631',
      role: 'STUDENT',
    })
    vi.mocked(courseService.getSubjects).mockResolvedValue([
      { subject_id: 1, code: 'IT4409', name: 'Công nghệ Web' },
    ])
    vi.mocked(relationshipService.getMyFriends).mockResolvedValue({
      items: [],
      total_friends: 0,
    })
    vi.mocked(feedService.getNewFeedCount).mockResolvedValue({ new_count: 0 })
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
      <BrowserRouter>
        <FeedPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Bảng tin & Hoạt động/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tất cả bảng tin/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Môn học/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ghi chú Giảng viên/i })).toBeInTheDocument()
    expect(await screen.findByText(/Bài viết kiểm thử trên FeedPage/i)).toBeInTheDocument()
  })
})
