import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { PostCard } from './PostCard'
import type { PostResponseDto } from '@/types'
import { reactionService } from '@/services/reaction.service'

vi.mock('@/services/reaction.service', () => ({ reactionService: { toggleReact: vi.fn() } }))

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
    renderWithQueryClient(<MemoryRouter><PostCard post={mockPost} /></MemoryRouter>)

    expect(screen.getByText('Lê Thành An')).toBeInTheDocument()
    expect(screen.getByText('MI1110')).toBeInTheDocument()
    expect(screen.getByText(/Thảo luận câu hỏi tích phân/i)).toBeInTheDocument()
    expect(screen.getByText(/Lưu ý xét tính hội tụ/i)).toBeInTheDocument()
    expect(screen.getByText(/5 lượt/)).toBeInTheDocument()
    expect(screen.getByText('2 bình luận')).toBeInTheDocument()
  })

  it('triggers reaction toggle on click', async () => {
    const handleToggleReact = vi.fn().mockResolvedValue({})

    renderWithQueryClient(
      <MemoryRouter><PostCard post={mockPost} onToggleReact={handleToggleReact} /></MemoryRouter>
    )

    const likeBtn = screen.getByRole('button', { name: /Thích/i })
    const user = userEvent.setup()
    await user.click(likeBtn)
    await user.click(await screen.findByRole('menuitem', { name: 'Thích' }))

    expect(screen.getByText(/6 lượt/)).toBeInTheDocument()
    expect(handleToggleReact).toHaveBeenCalledWith(101, 'LIKE')
  })

  it('persists reactions when the parent does not provide a callback', async () => {
    vi.mocked(reactionService.toggleReact).mockResolvedValue({})
    renderWithQueryClient(<MemoryRouter><PostCard post={mockPost} /></MemoryRouter>)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Thích' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Thích' }))
    await waitFor(() => expect(reactionService.toggleReact).toHaveBeenCalledWith({ target_type: 'POST', target_id: 101, reaction_type: 'LIKE' }))
  })

  it('rolls back the reaction count when saving fails', async () => {
    const onToggleReact = vi.fn().mockRejectedValue(new Error('Unavailable'))
    renderWithQueryClient(<MemoryRouter><PostCard post={mockPost} onToggleReact={onToggleReact} /></MemoryRouter>)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Thích' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Thích' }))
    await waitFor(() => expect(screen.getByText(/5 lượt/)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Thích' })).toBeEnabled()
  })
})
