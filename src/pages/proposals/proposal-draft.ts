import type { AcademicSessionDetail } from '@/types/academic.types'
import type { QuestionProposeDto } from '@/types'

export type DraftQuestion = QuestionProposeDto & { draftId: string; question_id?: number }

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
