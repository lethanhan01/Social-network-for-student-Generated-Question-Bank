import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import { reviewService } from './review.service'
import { examService } from './exam.service'
import { courseService } from './course.service'
import { canManageCourseClass, parseStudentCodes } from '@/pages/teacher/classes/class-utils'

vi.mock('./api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api')>()
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

const mockedGet = vi.mocked(api.get)
const mockedPost = vi.mocked(api.post)
const mockedPut = vi.mocked(api.put)

describe('Teacher services API contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls /lecturer/sessions/* and /lecturer/questions/* endpoints with after cursor', async () => {
    mockedGet.mockResolvedValue({ data: { code: '1000', message: 'SUCCESS', data: { items: [] } } })
    mockedPost.mockResolvedValue({ data: { code: '1000', message: 'SUCCESS', data: { points_earned: 10 } } })
    mockedPut.mockResolvedValue({ data: { code: '1000', message: 'SUCCESS', data: { question_id: 99 } } })

    await reviewService.getPendingSessions({ limit: 20, subject_id: 2 })
    expect(mockedGet).toHaveBeenCalledWith('/lecturer/sessions/reviewable', {
      params: { limit: 20, subject_id: 2 },
      signal: undefined,
    })

    await reviewService.getPendingSessions({ cursor: '42', limit: 20 })
    expect(mockedGet).toHaveBeenCalledWith('/lecturer/sessions/reviewable', {
      params: { after: '42', limit: 20 },
      signal: undefined,
    })

    await reviewService.getSessionDetailForReview(55)
    expect(mockedGet).toHaveBeenCalledWith('/lecturer/sessions/55', { signal: undefined })

    await reviewService.approveQuestions({ question_ids: [1, 2] })
    expect(mockedPost).toHaveBeenCalledWith('/lecturer/sessions/approve', { question_ids: [1, 2] })

    await reviewService.rejectQuestions({ question_ids: [3], reason: 'Sai kiến thức' })
    expect(mockedPost).toHaveBeenCalledWith('/lecturer/sessions/reject', {
      question_ids: [3],
      reason: 'Sai kiến thức',
    })

    await reviewService.editQuestion(99, { content: 'Updated', auto_approve: true })
    expect(mockedPut).toHaveBeenCalledWith('/lecturer/questions/99', {
      content: 'Updated',
      auto_approve: true,
    })

    await reviewService.completeSessionReview(55)
    expect(mockedPost).toHaveBeenCalledWith('/lecturer/sessions/55/complete-review')
  })

  it('calls /exams/* with after pagination and PDF/EXCEL + include_answer_key', async () => {
    mockedGet.mockResolvedValue({ data: { code: '1000', message: 'SUCCESS', data: { items: [] } } })

    await examService.getMyExams({ cursor: '103', limit: 10, subject_id: 1 })
    expect(mockedGet).toHaveBeenCalledWith('/exams/my-exams', {
      params: { after: '103', limit: 10, subject_id: 1 },
      signal: undefined,
    })

    await examService.exportExam(103, { format: 'EXCEL', include_answer_key: true })
    expect(mockedGet).toHaveBeenCalledWith('/exams/103/export', {
      params: { format: 'EXCEL', include_answer_key: true },
      signal: undefined,
    })

    await examService.exportQuestions({ subject_id: 2, format: 'PDF', include_answer_key: false })
    expect(mockedGet).toHaveBeenCalledWith('/lecturer/questions/export', {
      params: { subject_id: 2, format: 'PDF', include_answer_key: false },
      signal: undefined,
    })
  })

  it('calls /lecturer/course-classes/* endpoints', async () => {
    mockedGet.mockResolvedValue({ data: { code: '1000', message: 'SUCCESS', data: [] } })
    mockedPost.mockResolvedValue({ data: { code: '1000', message: 'SUCCESS', data: { total_enrolled: 2 } } })

    await courseService.getMyEnrolledClasses()
    expect(mockedGet).toHaveBeenCalledWith('/lecturer/course-classes/my-classes', { signal: undefined })

    await courseService.getClassStudents(52)
    expect(mockedGet).toHaveBeenCalledWith('/lecturer/course-classes/52/students', { signal: undefined })

    await courseService.assignStudents(52, { student_codes: ['20235631'] })
    expect(mockedPost).toHaveBeenCalledWith('/lecturer/course-classes/52/students', {
      student_codes: ['20235631'],
    })
  })
})

describe('class-utils helpers', () => {
  it('parses and deduplicates student codes across delimiters', () => {
    expect(parseStudentCodes('20235631, 20235635\n20235631; 20235766   ')).toEqual([
      '20235631',
      '20235635',
      '20235766',
    ])
    expect(parseStudentCodes('   , ; \n ')).toEqual([])
  })

  it('checks class ownership and admin override', () => {
    const cls = { course_class_id: 52, lecturer_id: 252 }
    expect(canManageCourseClass(cls, { user_id: 252, roles: ['LECTURER'] })).toBe(true)
    expect(canManageCourseClass(cls, { user_id: 253, roles: ['LECTURER'] })).toBe(false)
    expect(canManageCourseClass(cls, { user_id: 1, roles: ['ADMIN'] })).toBe(true)
  })
})
