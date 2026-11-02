import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import PracticePage from './PracticePage'
import { practiceService } from '@/services/practice.service'

vi.mock('@/services/practice.service', () => ({
  practiceService: {
    getSessionQuestions: vi.fn(),
    answerQuestion: vi.fn(),
    rateQuestion: vi.fn(),
    getQuestionStatistics: vi.fn(),
    getQuestionRatings: vi.fn(),
  },
}))

const service = vi.mocked(practiceService)

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={['/practice/5']}>
      <Routes>
        <Route path="/practice/:sessionId" element={<PracticePage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PracticePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    service.getSessionQuestions.mockResolvedValue({
      session_id: 5,
      title: 'Giải tích 1 - Tuần 3',
      subject_name: 'Giải tích 1',
      total_questions: 1,
      questions: [
        {
          question_id: 11,
          content: 'Đạo hàm của x^2 là?',
          updated_at: '2026-01-01T00:00:00Z',
          options: [
            { key: 'A', text: 'x' },
            { key: 'B', text: '2x' },
          ],
        },
      ],
    })
  })

  it('requires an option before submitting', async () => {
    renderPage()

    expect(await screen.findByRole('button', { name: /kiểm tra đáp án/i })).toBeDisabled()
    expect(service.answerQuestion).not.toHaveBeenCalled()
  })

  it('submits the selected option and reveals the explanation', async () => {
    service.answerQuestion.mockResolvedValue({ is_correct: true, correct_answer: 'B', explanation: 'Quy tắc lũy thừa' })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: /B\. 2x/ }))
    fireEvent.click(screen.getByRole('button', { name: /kiểm tra đáp án/i }))

    await waitFor(() =>
      expect(service.answerQuestion).toHaveBeenCalledWith(11, {
        selected_options: ['B'],
        question_updated_at: '2026-01-01T00:00:00Z',
      })
    )
    expect(await screen.findByText('Quy tắc lũy thừa')).toBeInTheDocument()
    expect(screen.getByText(/chính xác/i)).toBeInTheDocument()
  })
})

