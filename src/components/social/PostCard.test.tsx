import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { PostCard } from './PostCard'
import type { PostResponseDto } from '@/types'

const mockPost: PostResponseDto = {
  post_id: 101,
  content: 'Thảo luận câu hỏi tích phân suy rộng giải tích 1',
  subject_code: 'MI1110',
  react_count: 5,
  comment_count: 2,
  reacted_by_me: false,
  author: {
    user_id: 235,
    full_name: 'Lê Thành An',
  },
  lecturer_note: 'Lưu ý xét tính hội tụ của hàm số dưới dấu tích phân tại điểm kỳ dị.',
}

describe('PostCard Component', () => {
  it('renders author, content, subject tag and lecturer note', () => {
    renderWithQueryClient(<PostCard post={mockPost} />)

    expect(screen.getByText('Lê Thành An')).toBeInTheDocument()
    expect(screen.getByText('MI1110')).toBeInTheDocument()
    expect(screen.getByText(/Thảo luận câu hỏi tích phân/i)).toBeInTheDocument()
    expect(screen.getByText(/Lưu ý xét tính hội tụ/i)).toBeInTheDocument()
    expect(screen.getByText('5 lượt thích')).toBeInTheDocument()
    expect(screen.getByText('2 bình luận')).toBeInTheDocument()
  })

  it('triggers reaction toggle on click', async () => {
    const handleToggleReact = vi.fn().mockResolvedValue({})

    renderWithQueryClient(
      <PostCard post={mockPost} onToggleReact={handleToggleReact} />
    )

    const likeBtn = screen.getByRole('button', { name: /Thích/i })
    fireEvent.click(likeBtn)

    expect(screen.getByText('6 lượt thích')).toBeInTheDocument()
    expect(handleToggleReact).toHaveBeenCalledWith(101)
  })
})
