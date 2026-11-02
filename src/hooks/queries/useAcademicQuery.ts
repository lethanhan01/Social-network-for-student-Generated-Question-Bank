import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/services/course.service'
import { sessionService } from '@/services/session.service'
import { practiceService } from '@/services/practice.service'
import { queryKeys } from '@/lib/query-keys'
import type { AnswerQuestionRequest, RateQuestionRequest, UpdateSubmissionSessionRequest } from '@/types'

export function useSubjectsQuery() {
  return useQuery({
    queryKey: queryKeys.subjects.list(),
    queryFn: ({ signal }) => courseService.getSubjects({ signal }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAcademicSessionsQuery(status?: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.sessions.mySubmissions({ status, infinite: true }),
    enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => sessionService.getMySubmissions(
      { status, cursor: pageParam, limit: 20 }, { signal }),
    getNextPageParam: (last) => last.pagination?.has_next && last.pagination.after != null
      ? String(last.pagination.after) : undefined,
  })
}

export function useSessionQuestionsQuery(sessionId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.practice.questions(sessionId ?? 0),
    queryFn: ({ signal }) => practiceService.getSessionQuestions(sessionId!, { signal }),
    enabled: sessionId !== undefined,
  })
}

export function useAnswerQuestionMutation(questionId: number) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AnswerQuestionRequest) => {
      const result = await practiceService.answerQuestion(questionId, payload)
      if (typeof result.is_correct !== 'boolean') throw new Error()
      return result
    },
    onSuccess: (result, payload) => {
      client.setQueryData(queryKeys.practice.answer(questionId, payload.question_updated_at), { result, selected: payload.selected_options })
      void client.invalidateQueries({ queryKey: queryKeys.questions.statistics(questionId) })
    },
  })
}

export function useRateQuestionMutation(questionId: number) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: RateQuestionRequest) => practiceService.rateQuestion(questionId, payload),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.questions.statistics(questionId) })
      void client.invalidateQueries({ queryKey: queryKeys.questions.ratings(questionId) })
    },
  })
}

export function useQuestionStatisticsQuery(questionId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.questions.statistics(questionId ?? 0),
    queryFn: ({ signal }) => practiceService.getQuestionStatistics(questionId!, { signal }),
    enabled: questionId !== undefined,
  })
}

export function useQuestionRatingsQuery(questionId: number | undefined) {
  return useInfiniteQuery({
    queryKey: queryKeys.questions.ratings(questionId ?? 0),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) => practiceService.getQuestionRatings(questionId!, { signal }, { cursor: pageParam, limit: 20 }),
    getNextPageParam: (last) => last.pagination?.has_next && last.pagination.after != null
      ? String(last.pagination.after) : undefined,
    enabled: questionId !== undefined,
  })
}

export function useManageProposalMutation() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: UpdateSubmissionSessionRequest & { course_class_id?: number } }) =>
      payload ? sessionService.updateMySubmissionSession(id, payload) : sessionService.deleteMySubmissionSession(id),
    onSuccess: (_data, { id, payload }) => {
      void client.invalidateQueries({ queryKey: queryKeys.sessions.all })
      if (!payload) client.removeQueries({ queryKey: queryKeys.sessions.detail(id), type: 'inactive' })
    },
  })
}
