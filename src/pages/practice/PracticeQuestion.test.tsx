import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { practiceService } from '@/services/practice.service'
import i18n from '@/lib/i18n'
import { PracticeQuestion } from './PracticeQuestion'

describe('Practice answer flow', () => {
  beforeEach(async () => { vi.restoreAllMocks(); await i18n.changeLanguage('vi') })
  it('keeps the answer retryable when the server fails instead of inventing a result', async () => {
    const answer = vi.spyOn(practiceService, 'answerQuestion').mockRejectedValue(new Error('Offline'))
    const user = userEvent.setup()
    renderWithQueryClient(<MemoryRouter><PracticeQuestion sessionId={9} onNext={vi.fn()}
      question={{ question_id: 12, content: 'Question', updated_at: '2026-01-01', options: [{ key: 'A', text: 'First' }] }} /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: 'A. First' }))
    await user.click(screen.getByRole('button', { name: 'Kiểm tra đáp án' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText('Chưa chính xác')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kiểm tra đáp án' })).toBeEnabled()
    expect(answer).toHaveBeenCalledWith(12, { selected_options: ['A'], question_updated_at: '2026-01-01' })
  })
  it('shows the server explanation and enables rating only after a successful answer', async () => {
    vi.spyOn(practiceService, 'answerQuestion').mockResolvedValue({ is_correct: true, correct_answer: 'B', explanation: 'Server explanation' })
    const user = userEvent.setup()
    renderWithQueryClient(<MemoryRouter><PracticeQuestion sessionId={9} onNext={vi.fn()}
      question={{ question_id: 12, content: 'Question', options: [{ key: 'B', text: 'Second' }] }} /></MemoryRouter>)
    expect(screen.queryByRole('button', { name: 'Đánh giá / Báo lỗi' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'B. Second' }))
    await user.click(screen.getByRole('button', { name: 'Kiểm tra đáp án' }))
    expect(await screen.findByText('Server explanation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đánh giá / Báo lỗi' })).toBeEnabled()
  })
})
