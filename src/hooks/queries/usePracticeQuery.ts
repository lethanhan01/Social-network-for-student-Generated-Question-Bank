import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { practiceService } from '@/services/practice.service'
import { queryKeys } from '@/lib/query-keys'
import type { AnswerQuestionRequest, RateQuestionRequest } from '@/types'

function isValidId(id: number) {
  return Number.isFinite(id) && id > 0
}

export function useSessionQuestionsQuery(sessionId: number) {
  return useQuery({
    queryKey: queryKeys.practice.questions(sessionId),
    queryFn: ({ signal }) => practiceService.getSessionQuestions(sessionId, { signal }),
    enabled: isValidId(sessionId),
  })
}

export function useAnswerQuestionMutation() {
  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: number; payload: AnswerQuestionRequest }) =>
      practiceService.answerQuestion(questionId, payload),
  })
}

export function useRateQuestionMutation(sessionId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: number; payload: RateQuestionRequest }) =>
      practiceService.rateQuestion(questionId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.questions.statistics(variables.questionId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.questions.ratings(variables.questionId) })
      if (sessionId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.practice.questions(sessionId) })
      }
    },
  })
}

export function useQuestionStatisticsQuery(questionId: number) {
  return useQuery({
    queryKey: queryKeys.questions.statistics(questionId),
    queryFn: ({ signal }) => practiceService.getQuestionStatistics(questionId, { signal }),
    enabled: isValidId(questionId),
  })
}

export function useQuestionRatingsQuery(questionId: number) {
  return useQuery({
    queryKey: queryKeys.questions.ratings(questionId),
    queryFn: ({ signal }) => practiceService.getQuestionRatings(questionId, { signal }),
    enabled: isValidId(questionId),
  })
}

