import { MemoryRouter } from 'react-router-dom'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { useAuthStore } from '@/stores/authStore'
import { courseService } from '@/services/course.service'
import { reviewService } from '@/services/review.service'
import { examService } from '@/services/exam.service'
import TeacherDashboardPage from './TeacherDashboardPage'
import TeacherClassesPage from './TeacherClassesPage'
import TeacherReviewsPage from './TeacherReviewsPage'
import TeacherExamsPage from './TeacherExamsPage'

vi.mock('@/services/course.service', () => ({
  courseService: {
    getSubjects: vi.fn(),
    getMyEnrolledClasses: vi.fn(),
    getCourseClasses: vi.fn(),
    createCourseClass: vi.fn(),
    getClassStudents: vi.fn(),
    assignStudents: vi.fn(),
  },
}))

vi.mock('@/services/review.service', () => ({
  reviewService: {
    getPendingSessions: vi.fn(),
    getSessionDetailForReview: vi.fn(),
    approveQuestions: vi.fn(),
    rejectQuestions: vi.fn(),
    editQuestion: vi.fn(),
    completeSessionReview: vi.fn(),
  },
}))

vi.mock('@/services/exam.service', () => ({
  examService: {
    getMyExams: vi.fn(),
    generateExam: vi.fn(),
    getExamDetail: vi.fn(),
    exportExam: vi.fn(),
    exportQuestions: vi.fn(),
  },
}))

const mockedCourse = vi.mocked(courseService)
const mockedReview = vi.mocked(reviewService)
const mockedExam = vi.mocked(examService)

function renderInRouter(ui: React.ReactElement, initialEntries = ['/']) {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={initialEntries} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {ui}
    </MemoryRouter>
  )
}

describe('Teacher Portal pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: { user_id: 252, fullName: 'TS. Trần Hoàng Hải', role: 'LECTURER', roles: ['LECTURER'] },
      token: 'teacher-token',
      isAuthenticated: true,
      hasHydrated: true,
    })

    mockedCourse.getSubjects.mockResolvedValue([
      { subject_id: 2, code: 'IT4409', name: 'Công nghệ Web' },
      { subject_id: 1, code: 'IT4788', name: 'Đa nền tảng' },
    ])
    mockedCourse.getMyEnrolledClasses.mockResolvedValue([
      {
        course_class_id: 52,
        class_code: '171149',
        subject_id: 1,
        subject_code: 'IT4788',
        subject_name: 'Đa nền tảng',
        semester_name: '20261',
        lecturer_id: 252,
        lecturer_name: 'TS. Trần Hoàng Hải',
        total_students: 8,
        created_at: '2026-11-01T15:28:52Z',
      },
    ])
    mockedCourse.getCourseClasses.mockResolvedValue([
      {
        course_class_id: 52,
        class_code: '171149',
        subject_id: 1,
        subject_code: 'IT4788',
        subject_name: 'Đa nền tảng',
        semester_name: '20261',
        lecturer_id: 252,
        lecturer_name: 'TS. Trần Hoàng Hải',
        total_students: 8,
      },
      {
        course_class_id: 3,
        class_code: '171146',
        subject_id: 2,
        subject_code: 'IT4409',
        subject_name: 'Công nghệ Web',
        semester_name: '20261',
        lecturer_id: 2,
        lecturer_name: 'Nguyễn Tiến Thành',
        total_students: 100,
      },
    ])
    mockedReview.getPendingSessions.mockResolvedValue({
      items: [
        {
          session_id: 700,
          topic: 'IT4409',
          title: 'Bộ câu hỏi React Query',
          status: 'PENDING',
          author: { user_id: 157, full_name: 'Lê Thành An' },
          created_at: '2026-11-18T08:00:00Z',
        },
      ],
      pagination: { has_next: false, has_prev: false },
    })
    mockedExam.getMyExams.mockResolvedValue({
      items: [
        {
          exam_id: 103,
          title: 'Đề thi giữa kỳ Đa nền tảng',
          subject_name: 'Đa nền tảng',
          question_count: 5,
          created_at: '2026-11-16T07:05:49Z',
          statistic: { easy_count: 0, medium_count: 0, hard_count: 0, unclassified_count: 5 },
        },
      ],
      pagination: { has_next: false, has_prev: false },
    })
  })

  it('renders TeacherDashboardPage with live counts, semester badge, and no dead links', async () => {
    renderInRouter(<TeacherDashboardPage />, ['/teacher/dashboard'])

    expect(await screen.findByText('Học kỳ 20261')).toBeInTheDocument()
    expect(screen.getByText('Bộ câu hỏi React Query')).toBeInTheDocument()
    expect(screen.getByText('8 sinh viên đang ghi danh')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /quản trị đào tạo/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /báo cáo vi phạm/i })).not.toBeInTheDocument()
  })

  it('handles TeacherClassesPage tabs, read-only foreign class, create class, and student assignment', async () => {
    const user = userEvent.setup()
    mockedCourse.createCourseClass.mockResolvedValue({
      course_class_id: 99,
      class_code: '171199',
      subject_id: 2,
    })
    mockedCourse.getClassStudents.mockResolvedValue([
      {
        user_id: 157,
        student_code: '20235631',
        full_name: 'Lê Thành An',
        email: 'an.lt235631@sis.hust.edu.vn',
        enrolled_at: '2026-11-02T10:00:00Z',
      },
    ])
    mockedCourse.assignStudents.mockResolvedValue({
      total_enrolled: 1,
      already_enrolled_count: 1,
      not_found_count: 1,
      not_found_codes: ['99999999'],
    })

    renderInRouter(<TeacherClassesPage />, ['/teacher/classes'])
    expect(await screen.findByText('171149 · IT4788')).toBeInTheDocument()

    // Open student roster & assign MSSV
    await user.click(screen.getByRole('button', { name: /danh sách sv/i }))
    expect(await screen.findByText('Lê Thành An')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: /danh sách mã số sinh viên/i }), '20235631, 99999999')
    await user.click(screen.getByRole('button', { name: /^ghi danh$/i }))
    expect(await screen.findByText(/không tìm thấy \(1\): 99999999/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /đóng/i }))

    // Switch to all classes tab: foreign class 171146 shows read-only badge instead of students button
    await user.click(screen.getByRole('button', { name: /tất cả lớp trong kỳ/i }))
    expect(await screen.findByText('171146 · IT4409')).toBeInTheDocument()
    expect(screen.getByText('Chỉ xem')).toBeInTheDocument()
  })

  it('handles TeacherReviewsPage detail, duplicate warning, edit, reject validation, approve, and complete-review', async () => {
    const user = userEvent.setup()
    let questionStatus: 'PENDING' | 'APPROVED' = 'PENDING'
    mockedReview.getSessionDetailForReview.mockImplementation(async () => ({
      session_status: 'REVIEWING',
      duplicate_warnings: [
        { question_index: 0, similar_question_id: 12, similarity_score: 0.88, tier: 'TRIGRAM', matched_snipet: 'React Query hook' },
      ],
      items: [
        {
          question_id: 501,
          content: 'Hook nào dùng để tải dữ liệu?',
          options: [
            { key: 'A', text: 'useQuery', media_url: 'https://cdn/img.png', is_correct: true },
            { key: 'B', text: 'useState', is_correct: false },
          ],
          correct_answer: 'A',
          explanation: 'useQuery quản lý server state.',
          status: questionStatus,
        },
      ],
    }))
    mockedReview.editQuestion.mockResolvedValue({ question_id: 501, status: 'PENDING' })
    mockedReview.approveQuestions.mockImplementation(async () => {
      questionStatus = 'APPROVED'
      return { points_earned: 15 }
    })
    mockedReview.completeSessionReview.mockResolvedValue(undefined)

    renderInRouter(<TeacherReviewsPage />, ['/teacher/reviews?session=700'])
    expect(await screen.findByText('Hook nào dùng để tải dữ liệu?')).toBeInTheDocument()
    expect(screen.getByText(/cảnh báo trùng lặp \(88% · TRIGRAM\)/i)).toBeInTheDocument()

    // Complete review is disabled while PENDING
    expect(screen.getByRole('button', { name: /hoàn tất duyệt phiên/i })).toBeDisabled()

    // Edit question preserves option media_url
    await user.click(screen.getByRole('button', { name: /sửa câu hỏi/i }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /lưu chỉnh sửa/i }))
    await waitFor(() => {
      expect(mockedReview.editQuestion).toHaveBeenCalledWith(501, expect.objectContaining({
        options: expect.arrayContaining([expect.objectContaining({ key: 'A', media_url: 'https://cdn/img.png', is_correct: true })]),
      }))
    })

    // Reject requires a non-empty reason
    await user.click(screen.getByRole('button', { name: /^từ chối$/i }))
    const rejectDialog = screen.getByRole('dialog')
    await user.click(within(rejectDialog).getByRole('button', { name: /xác nhận từ chối/i }))
    expect(await within(rejectDialog).findByRole('alert')).toHaveTextContent(/vui lòng nhập lý do/i)
    await user.click(within(rejectDialog).getByRole('button', { name: /hủy/i }))

    // Approve question -> unlocks Complete review
    await user.click(screen.getByRole('button', { name: /^phê duyệt$/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /hoàn tất duyệt phiên/i })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: /hoàn tất duyệt phiên/i }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /hoàn tất phiên/i }))
    await waitFor(() => {
      expect(mockedReview.completeSessionReview).toHaveBeenCalledWith(700)
    })
  })

  it('handles TeacherExamsPage list, preview, PDF/Excel export with answer key, and generate exam', async () => {
    const user = userEvent.setup()
    const openSpy = vi.spyOn(window, 'open').mockReturnValue({} as Window)
    mockedExam.getExamDetail.mockResolvedValue({
      exam_id: 103,
      title: 'Đề thi giữa kỳ Đa nền tảng',
      subject_name: 'Đa nền tảng',
      question_count: 1,
      questions: [
        {
          order: 1,
          question_id: 673,
          content: 'Ba cây cấu trúc Flutter là gì?',
          options: [
            { key: 'A', text: 'Widget, Element, RenderObject', is_correct: true },
            { key: 'B', text: 'DOM, CSSOM, AST', is_correct: false },
          ],
          difficulty: 'UNCLASSIFIED',
        },
      ],
    })
    mockedExam.exportExam.mockResolvedValue({
      download_url: 'https://r2.example/exam_103_ans_true.xlsx',
      file_size_mb: 0.24,
      questions_count: 5,
    })

    renderInRouter(<TeacherExamsPage />, ['/teacher/exams'])
    expect(await screen.findByText('Đề thi giữa kỳ Đa nền tảng')).toBeInTheDocument()
    expect(screen.getByText('Chưa phân loại: 5')).toBeInTheDocument()

    // Toggle include answer key and export Excel
    await user.click(screen.getByRole('switch', { name: /kèm bảng đáp án khi xuất file/i }))
    await user.click(screen.getByRole('button', { name: /^excel$/i }))
    await waitFor(() => {
      expect(mockedExam.exportExam).toHaveBeenCalledWith(103, { format: 'EXCEL', include_answer_key: true })
      expect(openSpy).toHaveBeenCalledWith('https://r2.example/exam_103_ans_true.xlsx', '_blank', 'noopener,noreferrer')
    })

    // Preview modal renders ordered questions
    await user.click(screen.getByRole('button', { name: /xem trước/i }))
    expect(await screen.findByText('Ba cây cấu trúc Flutter là gì?')).toBeInTheDocument()
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /đóng/i }))

    // Generate modal validates required subject before submit
    await user.click(screen.getByRole('button', { name: /cấu hình sinh đề mới/i }))
    const genDialog = screen.getByRole('dialog')
    await user.click(within(genDialog).getByRole('button', { name: /sinh đề thi/i }))
    expect(await within(genDialog).findByRole('alert')).toHaveTextContent(/vui lòng chọn môn học/i)
    await user.click(within(genDialog).getByRole('button', { name: /hủy/i }))

    // Export question bank modal opens and validates subject
    await user.click(screen.getByRole('button', { name: /xuất ngân hàng câu hỏi/i }))
    const bankDialog = screen.getByRole('dialog')
    await user.click(within(bankDialog).getByRole('button', { name: /xuất tệp/i }))
    expect(await within(bankDialog).findByRole('alert')).toHaveTextContent(/vui lòng chọn môn học/i)
    openSpy.mockRestore()
  })
})
