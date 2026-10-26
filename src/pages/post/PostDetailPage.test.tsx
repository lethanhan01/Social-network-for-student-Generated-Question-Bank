import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { postService } from '@/services/post.service'
import { commentService } from '@/services/comment.service'
import PostDetailPage from './PostDetailPage'

vi.mock('@/services/post.service', () => ({
  postService: {
    getPostById: vi.fn(),
    deletePost: vi.fn(),
    updatePost: vi.fn(),
    updateLecturerNote: vi.fn(),
  },
}))

vi.mock('@/services/comment.service', () => ({
  commentService: {
    getComments: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}))

describe('PostDetailPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(commentService.getComments).mockResolvedValue({
      items: [
        {
          comment_id: 1,
          content: 'Bình luận thảo luận mẫu',
          author: { user_id: 11, full_name: 'Trần Văn Nam' },
          created_at: new Date().toISOString(),
        },
      ],
    })
  })

  it('renders post details and comments when post exists', async () => {
    vi.mocked(postService.getPostById).mockResolvedValue({
      post_id: 42,
      content: 'Nội dung chi tiết bài viết số 42',
      author: { user_id: 10, full_name: 'Nguyễn Văn A' },
      react_count: 5,
      comment_count: 1,
      created_at: new Date().toISOString(),
    })

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/posts/42']}>
        <Routes>
          <Route path="/posts/:id" element={<PostDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText(/Nội dung chi tiết bài viết số 42/i)).toBeInTheDocument()
    expect(screen.getByText(/Nguyễn Văn A/i)).toBeInTheDocument()
  })

  it('shows not found error when post does not exist', async () => {
    vi.mocked(postService.getPostById).mockRejectedValue(new Error('Post not found'))

    renderWithQueryClient(
      <MemoryRouter initialEntries={['/posts/999']}>
        <Routes>
          <Route path="/posts/:id" element={<PostDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText(/Bài viết không tồn tại hoặc đã bị gỡ/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Trở về bảng tin/i })).toBeInTheDocument()
  })
})
