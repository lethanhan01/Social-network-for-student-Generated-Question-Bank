import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewService } from '@/services/review.service'
import { queryKeys } from '@/lib/query-keys'
import type { ApproveQuestionsRequest, RejectQuestionsRequest, EditQuestionRequest } from '@/types'

export function usePendingSessionsQuery(params?: { cursor?: string; limit?: number; subject_id?: number }) {
  return useQuery({
    queryKey: queryKeys.sessions.pending(params),
    queryFn: ({ signal }) => reviewService.getPendingSessions(params, { signal }),
  })
}

export function useSessionReviewDetailQuery(sessionId: number) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(sessionId),
    queryFn: ({ signal }) => reviewService.getSessionDetailForReview(sessionId, { signal }),
    enabled: Number.isFinite(sessionId) && sessionId > 0,
  })
}

export function useApproveQuestionsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ApproveQuestionsRequest) => reviewService.approveQuestions(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.pending() })
    },
  })
}

export function useRejectQuestionsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RejectQuestionsRequest) => reviewService.rejectQuestions(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.pending() })
    },
  })
}

export function useEditQuestionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: number; payload: EditQuestionRequest }) =>
      reviewService.editQuestion(questionId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.questions.detail(variables.questionId) })
    },
  })
}
