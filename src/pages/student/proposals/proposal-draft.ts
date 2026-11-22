import type { AcademicSessionDetail, EnrolledCourseClass } from '@/types/academic.types'
import type { ProposeSessionRequest, QuestionProposeDto, UpdateSubmissionSessionRequest } from '@/types'

export type DraftQuestion = QuestionProposeDto & { draftId: string; question_id?: number }
export type UpdateProposalPayload = UpdateSubmissionSessionRequest & { course_class_id?: number }
export type ProposalValidationErrorKey = 'composer.invalid' | 'composer.invalidSource' | null

export interface ProposalFormValues {
  title: string
  content: string
  source: string
  courseClassId: number
  questions: DraftQuestion[]
}

let draftSequence = 0

function createDraftId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `draft-${++draftSequence}`
}

export function createDraftQuestion(): DraftQuestion {
  return {
    draftId: createDraftId(), content: '', explanation: '', llm_generated: false, confidence: 3,
    options: ['A', 'B', 'C', 'D'].map((key) => ({ key, text: '', is_correct: key === 'A' })),
  }
}

export function draftFromDetail(detail?: AcademicSessionDetail): DraftQuestion[] {
  if (!detail?.questions?.length) return [createDraftQuestion()]
  return detail.questions.map((question) => ({
    draftId: createDraftId(), question_id: question.question_id,
    content: question.content ?? '', explanation: question.explanation ?? '',
    options: (question.options ?? []).map((option) => ({ ...option })),
    media_urls: question.image_urls, llm_generated: question.source === 'LLM', confidence: question.confidence_score ?? 3,
  }))
}

export function validDraftQuestions(questions: DraftQuestion[]): boolean {
  return questions.length > 0 && questions.every((question) => question.content.trim() &&
    question.options.length === 4 && question.options.every((option) => option.text?.trim()) &&
    question.options.filter((option) => option.is_correct).length === 1)
}

export function filterEligibleClasses(classes: EnrolledCourseClass[] | undefined): EnrolledCourseClass[] {
  return (classes ?? []).filter((item) => item.can_propose === true && Boolean(item.course_class_id))
}

export function resolveDefaultClassId(eligible: EnrolledCourseClass[], subjectId?: number): string {
  const preferred = eligible.filter((item) => item.subject_id === subjectId)
  if (preferred.length === 1) return String(preferred[0].course_class_id)
  if (eligible.length === 1) return String(eligible[0].course_class_id)
  return ''
}

export function isValidSourceUrl(raw: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed) return true
  try {
    const { protocol } = new URL(trimmed)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

export function validateProposalDraft(
  values: ProposalFormValues,
  eligible: EnrolledCourseClass[]
): ProposalValidationErrorKey {
  const hasValidClass = eligible.some((item) => item.course_class_id === values.courseClassId)
  if (!values.title.trim() || !hasValidClass || !validDraftQuestions(values.questions)) {
    return 'composer.invalid'
  }
  if (!isValidSourceUrl(values.source)) {
    return 'composer.invalidSource'
  }
  return null
}

export function buildProposalPayload(values: ProposalFormValues): ProposeSessionRequest {
  return {
    title: values.title.trim(),
    content: values.content.trim(),
    source_url: values.source.trim() || undefined,
    course_class_id: values.courseClassId,
    questions: values.questions.map(({ draftId: _draftId, ...question }) => question),
  }
}

export function buildUpdateProposalPayload(values: ProposalFormValues): UpdateProposalPayload {
  return {
    title: values.title.trim(),
    content: values.content.trim(),
    source_url: values.source.trim() || undefined,
    course_class_id: values.courseClassId,
    questions: values.questions.map(({ draftId: _draftId, llm_generated, ...question }) => ({
      ...question,
      source: llm_generated ? 'LLM' : 'HOMO_SAPIENS',
    })),
  }
}

export function replaceDraftQuestion(questions: DraftQuestion[], next: DraftQuestion): DraftQuestion[] {
  return questions.map((item) => (item.draftId === next.draftId ? next : item))
}

export function removeDraftQuestion(questions: DraftQuestion[], draftId: string): DraftQuestion[] {
  return questions.filter((item) => item.draftId !== draftId)
}
