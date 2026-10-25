import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import FeedPage from './FeedPage'

vi.mock('@/hooks/useSocialFeed', () => ({
  useSocialFeed: () => ({
    currentUser: {
      user_id: 235,
      full_name: 'Lê Thành An',
      student_lecturer_code: '20235631',
      role: 'STUDENT',
    },
    subjects: [
      { subject_id: 1, code: 'IT4409', name: 'Công nghệ Web' },
    ],
    friends: [],
    myPosts: [
      {
        post_id: 102,
        content: 'Bài viết kiểm thử trên FeedPage',
        react_count: 3,
        comment_count: 1,
        author: { user_id: 235, full_name: 'Lê Thành An' },
      },
    ],
    isLoadingFeed: false,
    isRefetchingFeed: false,
    refetchFeed: vi.fn(),
    createPost: vi.fn(),
    toggleReact: vi.fn(),
  }),
}))

describe('FeedPage Component', () => {
  it('renders header, tabs, create box, and posts', () => {
    renderWithQueryClient(
      <BrowserRouter>
        <FeedPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Bảng tin & Hoạt động/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tất cả bảng tin/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Môn học/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ghi chú Giảng viên/i })).toBeInTheDocument()
    expect(screen.getByText(/Bài viết kiểm thử trên FeedPage/i)).toBeInTheDocument()
  })
})
