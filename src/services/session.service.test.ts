import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import { sessionService } from './session.service'

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  requestData: async (request: Promise<{ data: { data: unknown } }>) => (await request).data.data,
}))

describe('Proposal API contract', () => {
  beforeEach(() => vi.clearAllMocks())
  it('loads enrolled classes from the current endpoint and derives unique subjects', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [
      { course_class_id: 101, subject_id: 7, subject_code: 'IT', subject_name: 'Course', can_propose: true },
      { course_class_id: 102, subject_id: 7, subject_code: 'IT', subject_name: 'Course', can_propose: false },
    ] } })
    const controller = new AbortController()
    expect(await sessionService.getMyEnrolledSubjects({ signal: controller.signal })).toEqual([{ subject_id: 7, code: 'IT', name: 'Course' }])
    expect(api.get).toHaveBeenCalledWith('/sessions/my-enrolled-course-classes', { signal: controller.signal })
  })
  it('sends the class ID to the proposal endpoint', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { session_id: 55 } } })
    const payload = { title: 'Proposal', course_class_id: 101, questions: [{ content: 'Question', options: [], llm_generated: false, confidence: 3 }] }
    expect(await sessionService.proposeSession(payload)).toEqual({ session_id: 55 })
    expect(api.post).toHaveBeenCalledWith('/sessions/propose', payload)
  })
})
