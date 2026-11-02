import type { MySubmissionDetailResponse, SubmissionSessionSummaryDto } from './api.generated'

export type SessionStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'
export type AcademicSession = SubmissionSessionSummaryDto & { status?: SessionStatus }
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

export function readSessionStatus(value: { status?: unknown }): SessionStatus | 'UNKNOWN' {
  const status = value.status
  return status === 'PENDING' || status === 'REVIEWING' || status === 'APPROVED' ||
    status === 'REJECTED' || status === 'RESOLVED' ? status : 'UNKNOWN'
}

export function positiveId(value: string | null | undefined): number | undefined {
  if (!value || !/^[1-9]\d*$/.test(value)) return undefined
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : undefined
}

export function canPracticeSession(session: AcademicSession): boolean {
  return readSessionStatus(session) === 'APPROVED' || readSessionStatus(session) === 'RESOLVED'
}
