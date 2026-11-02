import { describe, it, expect } from 'vitest'
import {
  createEmptyDraft,
  createQuestionDraft,
  draftFromDetail,
  toProposeRequest,
  toUpdateRequest,
  validateDraft,
  type ProposalDraft,
} from './proposal-form-utils'

function validDraft(): ProposalDraft {
  const question = createQuestionDraft({
    content: '1 + 1 = ?',
    options: ['1', '2', '3', '4'],
    correctKey: 'B',
    explanation: 'Basic arithmetic',
  })
  return { title: 'Session', content: '', sourceUrl: '', subjectId: '7', courseClassId: '12', questions: [question] }
}

describe('proposal-form-utils', () => {
  it('flags every missing required field on an empty draft', () => {
    const draft = createEmptyDraft()
    const errors = validateDraft(draft)
    const uid = draft.questions[0].uid

    expect(errors.title).toBe('titleRequired')
    expect(errors.subject).toBe('subjectRequired')
    expect(errors[`${uid}.content`]).toBe('questionContentRequired')
    expect(errors[`${uid}.options`]).toBe('optionsRequired')
    expect(errors[`${uid}.correct`]).toBe('correctRequired')
  })

  it('accepts a complete draft and rejects non-http source URLs', () => {
    expect(validateDraft(validDraft())).toEqual({})
    expect(validateDraft({ ...validDraft(), sourceUrl: 'ftp://x' }).sourceUrl).toBe('sourceUrlInvalid')
  })

  it('maps a draft to the propose request with exactly one correct option', () => {
    const request = toProposeRequest(validDraft())

    expect(request.course_class_id).toBe(12)
    expect(request.questions[0].llm_generated).toBe(false)
    expect(request.questions[0].options.map((option) => option.is_correct)).toEqual([false, true, false, false])
  })

  it('round-trips an existing submission into an update request', () => {
    const draft = draftFromDetail({
      subject_id: 7,
      title: 'Session',
      questions: [
        {
          question_id: 99,
          content: 'Q',
          options: [
            { key: 'A', text: 'a' },
            { key: 'B', text: 'b', is_correct: true },
            { key: 'C', text: 'c' },
            { key: 'D', text: 'd' },
          ],
        },
      ],
    })
    const request = toUpdateRequest(draft)

    expect(draft.questions[0].correctKey).toBe('B')
    expect(request.questions?.[0].question_id).toBe(99)
    expect(request.questions?.[0].source).toBe('HOMO_SAPIENS')
  })
})

