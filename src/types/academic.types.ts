import type { MySubmissionDetailResponse, SubmissionSessionSummaryDto } from './api.generated'

export type SessionStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'
export type AcademicSession = SubmissionSessionSummaryDto & { status?: SessionStatus; approved_question_count?: number | null }
export type AcademicSessionDetail = MySubmissionDetailResponse & { status?: SessionStatus; source_url?: string; course_class_id?: number }

export interface EnrolledCourseClass {
  course_class_id?: number
  class_code?: string
  subject_id?: number
  subject_code?: string
  subject_name?: string
  semester_id?: number
  semester_name?: string
  active_semester?: boolean
  can_propose?: boolean
}

export function readSessionStatus(value: { status?: unknown; approved_question_count?: number | null; question_counts?: number | null }): SessionStatus | 'UNKNOWN' {
  const status = value.status
  if (status === 'PENDING' || status === 'REVIEWING' || status === 'APPROVED' || status === 'REJECTED') return status
  if (status === 'RESOLVED') {
    if (typeof value.approved_question_count === 'number') {
      return value.approved_question_count > 0 ? 'APPROVED' : 'REJECTED'
    }
    return 'RESOLVED'
  }
  return 'UNKNOWN'
}

export function matchesSessionFilter(session: AcademicSession, filter: 'ALL' | SessionStatus): boolean {
  if (filter === 'ALL') return true
  if (filter === 'RESOLVED') return session.status === 'RESOLVED'
  const derived = readSessionStatus(session)
  return derived === 'UNKNOWN' || derived === filter
}

export function positiveId(value: string | null | undefined): number | undefined {
  if (!value || !/^[1-9]\d*$/.test(value)) return undefined
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : undefined
}

export function canPracticeSession(session: AcademicSession): boolean {
  const status = readSessionStatus(session)
  return status === 'APPROVED' || status === 'RESOLVED'
}
