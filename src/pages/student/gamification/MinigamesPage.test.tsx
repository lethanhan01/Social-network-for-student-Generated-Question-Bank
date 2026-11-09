import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { renderWithQueryClient } from '@/test/query-test-utils'
import MinigamesPage from './MinigamesPage'
import { gamificationService } from '@/services/gamification.service'

vi.mock('@/services/gamification.service', () => ({
  gamificationService: {
    getMyPredictions: vi.fn(),
    getClassesForGame1: vi.fn(),
    getActiveGameSession: vi.fn(),
    predictGame1: vi.fn(),
    predictGame4: vi.fn(),
    submitGame6: vi.fn(),
  },
}))

vi.mock('@/services/course.service', () => ({
  courseService: {
    getSubjects: vi.fn().mockResolvedValue([{ subject_id: 1, code: 'IT4409', name: 'Công nghệ Web' }]),
  },
}))

const mockedService = vi.mocked(gamificationService)

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter>
      <MinigamesPage />
    </MemoryRouter>
  )
}

describe('MinigamesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedService.getMyPredictions.mockResolvedValue({
      contents: [
        {
          prediction_id: 11,
          game_type: 'GAME_1_PARTICIPANTS',
          prediction_data: { predicted_count: 25, course_class_id: 3 },
          status: 'RESOLVED',
          is_correct: true,
          created_at: '2026-10-20T03:00:00Z',
        },
      ],
    })
    mockedService.getClassesForGame1.mockResolvedValue([
      { course_class_id: 3, class_code: '154321', subject_name: 'Công nghệ Web', lecturer_name: 'TS. B' },
    ])
  })

  it('shows the Game 6 locked state when no session is active, plus prediction history', async () => {
    mockedService.getActiveGameSession.mockRejectedValue(new Error('No active session'))
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: /Đấu trường Minigame Dự đoán/i })).toBeInTheDocument()
    expect(await screen.findByText(/Thử thách chỉ mở vào Thứ Bảy/i)).toBeInTheDocument()
    expect(screen.getByText('Đã khóa')).toBeInTheDocument()
    expect(await screen.findByText('Dự đoán 25 sinh viên nộp bài')).toBeInTheDocument()
    expect(screen.getByText('Chính xác')).toBeInTheDocument()
  })

  it('requires at least one selection before submitting Game 6', async () => {
    mockedService.getActiveGameSession.mockResolvedValue({
      session_id: 9,
      questions: [
        { question_id: 101, content: 'HTTP là giao thức tầng nào?', options: [{ key: 'A', text: 'Ứng dụng' }] },
        { question_id: 102, content: 'CSS viết tắt của gì?' },
      ],
    })
    mockedService.submitGame6.mockResolvedValue({ prediction_id: 12 })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: /Gửi dự đoán/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Hãy chọn ít nhất một câu hỏi/i)

    fireEvent.click(screen.getByRole('checkbox', { name: /Câu 2: Câu này do AI tạo/i }))
    fireEvent.click(screen.getByRole('button', { name: /Gửi dự đoán/i }))

    await waitFor(() =>
      expect(mockedService.submitGame6).toHaveBeenCalledWith({
        minigame_session_id: 9,
        selected_llm_question_ids: [102],
      })
    )
  })

  it('opens the Game 1 modal and validates required fields', async () => {
    mockedService.getActiveGameSession.mockRejectedValue(new Error('No active session'))
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: /Tham gia: Game 1/i }))
    const form = await screen.findByRole('form', { name: /Game 1/i })
    expect(form).toBeInTheDocument()

    fireEvent.submit(form)
    expect(await screen.findByText('Vui lòng chọn lớp học phần.')).toBeInTheDocument()
    expect(screen.getByText('Số dự đoán phải là số nguyên không âm.')).toBeInTheDocument()
    expect(mockedService.predictGame1).not.toHaveBeenCalled()
  })
})
