import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewService } from '@/services/review.service'
import { queryKeys } from '@/lib/query-keys'
import type { ApproveQuestionsRequest, RejectQuestionsRequest, EditQuestionRequest } from '@/types'

export function usePendingSessionsQuery(params?: { cursor?: string; limit?: number; subject_id?: number }) {
  return useQuery({
    queryKey: queryKeys.sessions.pending(params),
    queryFn: ({ signal }) => reviewService.getPendingSessions(params, { signal }),
  })
}

export function useInfinitePendingSessionsQuery(subjectId?: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.sessions.pending({ subject_id: subjectId, infinite: true }),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      reviewService.getPendingSessions(
        { cursor: pageParam, limit: 20, subject_id: subjectId },
        { signal }
      ),
    getNextPageParam: (last) =>
      last.pagination?.has_next && last.pagination.after != null
        ? String(last.pagination.after)
        : undefined,
  })
}

export function useSessionReviewDetailQuery(sessionId?: number) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(sessionId ?? 0),
    queryFn: ({ signal }) => reviewService.getSessionDetailForReview(sessionId!, { signal }),
    enabled: sessionId != null && Number.isFinite(sessionId) && sessionId > 0,
  })
}

export function useApproveQuestionsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ApproveQuestionsRequest) => reviewService.approveQuestions(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
    },
  })
}

export function useRejectQuestionsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RejectQuestionsRequest) => reviewService.rejectQuestions(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
    },
  })
}

export function useEditQuestionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: number; payload: EditQuestionRequest }) =>
      reviewService.editQuestion(questionId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.questions.detail(variables.questionId) })
    },
  })
}

export function useCompleteSessionReviewMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: number) => reviewService.completeSessionReview(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
    },
  })
}
