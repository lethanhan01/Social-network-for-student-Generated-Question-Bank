import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreatePostModal } from './CreatePostModal'
import type { SubjectResponse } from '@/types'

const mockSubjects: SubjectResponse[] = [
  { subject_id: 1, code: 'IT4409', name: 'Công nghệ Web' },
  { subject_id: 2, code: 'MI1110', name: 'Giải tích 1' },
]

describe('CreatePostModal Component', () => {
  it('renders modal with form inputs when open', () => {
    render(
      <CreatePostModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        subjects={mockSubjects}
      />
    )

    expect(screen.getByRole('heading', { name: /Tạo bài viết thảo luận mới/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Nội dung bài viết/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Đăng bài viết/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hủy bỏ/i })).toBeInTheDocument()
  })

  it('displays validation error if content is empty on submit', async () => {
    const handleSubmit = vi.fn()
    render(
      <CreatePostModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        subjects={mockSubjects}
      />
    )

    const submitBtn = screen.getByRole('button', { name: /Đăng bài viết/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Vui lòng nhập nội dung bài viết thảo luận/i)).toBeInTheDocument()
      expect(handleSubmit).not.toHaveBeenCalled()
    })
  })

  it('submits form with valid content', async () => {
    const handleSubmit = vi.fn().mockResolvedValue({})
    const handleClose = vi.fn()

    render(
      <CreatePostModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        subjects={mockSubjects}
      />
    )

    const textarea = screen.getByLabelText(/Nội dung bài viết/i)
    fireEvent.change(textarea, { target: { value: 'Bài tập tuần này khó quá, có ai làm xong chưa?' } })

    const submitBtn = screen.getByRole('button', { name: /Đăng bài viết/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Bài tập tuần này khó quá, có ai làm xong chưa?',
          visibility: 'PUBLIC',
          post_type: 'SOCIAL_POST',
        })
      )
      expect(handleClose).toHaveBeenCalled()
    })
  })
})
