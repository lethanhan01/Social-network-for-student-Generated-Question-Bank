import type {
  MySubmissionDetailResponse,
  ProposeSessionRequest,
  QuestionOption,
  UpdateSubmissionSessionRequest,
} from '@/types'

export const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const
export const CONFIDENCE_LEVELS = [0, 1, 2, 3, 4] as const
export const DEFAULT_CONFIDENCE = 3

export interface QuestionDraft {
  /** Local stable key for React lists. */
  uid: string
  /** Existing question id (edit mode); undefined for newly added questions. */
  questionId?: number
  content: string
  options: string[]
  correctKey: string
  explanation: string
  confidence: number
}

export interface ProposalDraft {
  title: string
  content: string
  sourceUrl: string
  subjectId: string
  courseClassId?: string
  questions: QuestionDraft[]
}

/** Error codes map to i18n keys under `proposals.form.errors.*`. */
export type ProposalErrorCode =
  | 'titleRequired'
  | 'subjectRequired'
  | 'questionsRequired'
  | 'questionContentRequired'
  | 'optionsRequired'
  | 'correctRequired'
  | 'sourceUrlInvalid'

export type ProposalErrors = Record<string, ProposalErrorCode>

let uidCounter = 0

export function createQuestionDraft(partial?: Partial<QuestionDraft>): QuestionDraft {
  uidCounter += 1
  return {
    uid: `question-draft-${uidCounter}`,
    content: '',
    options: OPTION_KEYS.map(() => ''),
    correctKey: '',
    explanation: '',
    confidence: DEFAULT_CONFIDENCE,
    ...partial,
  }
}

export function createEmptyDraft(subjectId = ''): ProposalDraft {
  return { title: '', content: '', sourceUrl: '', subjectId, courseClassId: '', questions: [createQuestionDraft()] }
}

export function draftFromDetail(detail: MySubmissionDetailResponse): ProposalDraft {
  return {
    title: detail.title ?? '',
    content: detail.content ?? '',
    sourceUrl: '',
    subjectId: detail.subject_id ? String(detail.subject_id) : '',
    courseClassId: '',
    questions: (detail.questions ?? []).map((question) => {
      const options: QuestionOption[] = question.options ?? []
      return createQuestionDraft({
        questionId: question.question_id,
        content: question.content ?? '',
        options: OPTION_KEYS.map((key) => options.find((option) => option.key === key)?.text ?? ''),
        correctKey: options.find((option) => option.is_correct)?.key ?? '',
        explanation: question.explanation ?? '',
        confidence: question.confidence_score ?? DEFAULT_CONFIDENCE,
      })
    }),
  }
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateDraft(draft: ProposalDraft): ProposalErrors {
  const errors: ProposalErrors = {}
  if (!draft.title.trim()) errors.title = 'titleRequired'
  if (!draft.subjectId || !Number.isSafeInteger(Number(draft.courseClassId)) || Number(draft.courseClassId) <= 0) errors.subject = 'subjectRequired'
  if (draft.sourceUrl.trim() && !isValidUrl(draft.sourceUrl.trim())) errors.sourceUrl = 'sourceUrlInvalid'
  if (draft.questions.length === 0) errors.questions = 'questionsRequired'
  draft.questions.forEach((question) => {
    if (!question.content.trim()) errors[`${question.uid}.content`] = 'questionContentRequired'
    if (question.options.some((option) => !option.trim())) errors[`${question.uid}.options`] = 'optionsRequired'
    if (!question.correctKey) errors[`${question.uid}.correct`] = 'correctRequired'
  })
  return errors
}

function toOptions(question: QuestionDraft): QuestionOption[] {
  return OPTION_KEYS.map((key, index) => ({
    key,
    text: question.options[index].trim(),
    is_correct: key === question.correctKey,
  }))
}

export function toProposeRequest(draft: ProposalDraft): ProposeSessionRequest {
  return {
    title: draft.title.trim(),
    content: draft.content.trim() || undefined,
    source_url: draft.sourceUrl.trim() || undefined,
    course_class_id: Number(draft.courseClassId),
    questions: draft.questions.map((question) => ({
      content: question.content.trim(),
      options: toOptions(question),
      explanation: question.explanation.trim() || undefined,
      llm_generated: false,
      confidence: question.confidence,
    })),
  }
}

export function toUpdateRequest(draft: ProposalDraft): UpdateSubmissionSessionRequest {
  return {
    title: draft.title.trim(),
    content: draft.content.trim() || undefined,
    source_url: draft.sourceUrl.trim() || undefined,
    subject_id: Number(draft.subjectId),
    questions: draft.questions.map((question) => ({
      question_id: question.questionId,
      content: question.content.trim(),
      options: toOptions(question),
      explanation: question.explanation.trim() || undefined,
      source: 'HOMO_SAPIENS',
      confidence: question.confidence,
    })),
  }
}

