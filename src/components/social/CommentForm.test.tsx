import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { commentService } from '@/services/comment.service'
import { CommentForm } from './CommentForm'
import { PostCommentSection } from './PostCommentSection'

describe('Comment draft recovery', () => {
  it('preserves a failed reply and lets the user retry successfully', async () => {
    const send = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({})
    const user = userEvent.setup()
    renderWithQueryClient(<CommentForm label="Reply" onSend={send} />)
    await user.type(screen.getByRole('textbox', { name: 'Reply' }), 'Keep this draft')
    await user.click(screen.getByRole('button', { name: 'Gửi' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline')
    expect(screen.getByRole('textbox', { name: 'Reply' })).toHaveValue('Keep this draft')
    await user.click(screen.getByRole('button', { name: 'Gửi' }))
    expect(screen.getByRole('textbox', { name: 'Reply' })).toHaveValue('')
    expect(send).toHaveBeenCalledTimes(2)
  })

  it('renders comments above the compact comment composer without a sort dropdown', async () => {
    vi.spyOn(commentService, 'getComments').mockResolvedValueOnce({
      items: [
        {
          comment_id: 10,
          content: 'Bình luận đầu tiên',
          reply_count: 2,
          author: { user_id: 2, full_name: 'Hy Liu' },
          created_at: '2026-11-16T14:39:00.000Z',
        },
      ],
      pagination: { has_next: false },
    })

    renderWithQueryClient(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PostCommentSection postId={42} currentUserName="Lê Thành An" />
      </MemoryRouter>
    )

    const commentText = await screen.findByText('Bình luận đầu tiên')
    const composerInput = screen.getByRole('textbox', { name: 'Viết bình luận' })
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Xem câu trả lời \(2\)/ })).toBeInTheDocument()
    expect(
      commentText.compareDocumentPosition(composerInput) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })
})
