import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { sessionService } from '@/services/session.service'
import i18n from '@/lib/i18n'
import { ProposalComposer } from './ProposalComposer'

describe('Proposal submission', () => {
  const scrollDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView')
  beforeAll(() => Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() }))
  afterAll(() => {
    if (scrollDescriptor) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', scrollDescriptor)
    else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
  })
  beforeEach(async () => {
    vi.restoreAllMocks(); await i18n.changeLanguage('vi')
    vi.spyOn(sessionService, 'getMyEnrolledCourseClasses').mockResolvedValue([
      { course_class_id: 101, subject_id: 1, subject_code: 'IT', subject_name: 'Course', class_code: '123', semester_name: '20261', can_propose: true },
      { course_class_id: 102, subject_id: 1, subject_code: 'IT', subject_name: 'Course', class_code: '456', semester_name: '20261', can_propose: true },
    ])
  })
  it('does not allow submitting proposals to historical classes', async () => {
    const send = vi.spyOn(sessionService, 'proposeSession')
    vi.mocked(sessionService.getMyEnrolledCourseClasses).mockResolvedValue([
      { course_class_id: 201, subject_id: 1, can_propose: false, active_semester: false },
    ])
    renderWithQueryClient(<ProposalComposer subjects={[]} onClose={vi.fn()} />)
    expect(await screen.findByText('Bạn chưa có lớp học phần được phép gửi đề xuất trong học kỳ hiện tại.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Gửi đề xuất' })).not.toBeInTheDocument()
    expect(send).not.toHaveBeenCalled()
  })
  it('selects a subject and submits the chosen correct answer', async () => {
    const send = vi.spyOn(sessionService, 'proposeSession').mockResolvedValue({ session_id: 99 })
    const close = vi.fn()
    const user = userEvent.setup()
    renderWithQueryClient(<ProposalComposer subjects={[{ subject_id: 1, code: 'IT', name: 'Course' }]} onClose={close} />)
    const select = await screen.findByRole('combobox', { name: 'Lớp học phần' })
    fireEvent.keyDown(select, { key: 'ArrowDown' })
    fireEvent.click(await screen.findByRole('option', { name: 'IT · Course · 123 · 20261' }))
    await user.type(screen.getByLabelText(/Tiêu đề phiên/), 'My proposal')
    await user.type(screen.getByLabelText(/Nội dung câu hỏi/), 'A question')
    for (const key of ['A', 'B', 'C', 'D']) await user.type(screen.getByLabelText(new RegExp(`Phương án ${key}`)), `Option ${key}`)
    await user.click(screen.getByRole('radio', { name: 'B' }))
    await user.click(screen.getByRole('button', { name: 'Gửi đề xuất' }))
    expect(close).toHaveBeenCalledOnce()
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ course_class_id: 101, questions: [expect.objectContaining({ options: [
      { key: 'A', text: 'Option A', is_correct: false }, { key: 'B', text: 'Option B', is_correct: true },
      { key: 'C', text: 'Option C', is_correct: false }, { key: 'D', text: 'Option D', is_correct: false },
    ] })] }))
    expect(send.mock.calls[0][0]).not.toHaveProperty('subject_id')
  }, 15000)
  it('preserves the draft and keeps the dialog open if the server rejects submission', async () => {
    vi.spyOn(sessionService, 'proposeSession').mockRejectedValue(new Error('Unavailable'))
    const close = vi.fn()
    const user = userEvent.setup()
    vi.mocked(sessionService.getMyEnrolledCourseClasses).mockResolvedValue([
      { course_class_id: 101, subject_id: 1, subject_code: 'IT', subject_name: 'Course', can_propose: true },
    ])
    renderWithQueryClient(<ProposalComposer subjects={[{ subject_id: 1, code: 'IT', name: 'Course' }]} subjectId={1} onClose={close} />)
    await user.type(await screen.findByLabelText(/Tiêu đề phiên/), 'My proposal')
    await user.type(screen.getByLabelText(/Nội dung câu hỏi/), 'A question')
    for (const key of ['A', 'B', 'C', 'D']) await user.type(screen.getByLabelText(new RegExp(`Phương án ${key}`)), `Option ${key}`)
    await user.click(screen.getByRole('button', { name: 'Gửi đề xuất' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(close).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/Tiêu đề phiên/)).toHaveValue('My proposal')
    expect(screen.getByLabelText(/Nội dung câu hỏi/)).toHaveValue('A question')
  }, 15000)
})
