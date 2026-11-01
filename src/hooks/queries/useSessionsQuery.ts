import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '@/services/session.service'
import { queryKeys } from '@/lib/query-keys'
import type { ProposeSessionRequest, UpdateSubmissionSessionRequest } from '@/types'

export function useMySubmissionsQuery(params?: { cursor?: string; limit?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.sessions.mySubmissions(params),
    queryFn: ({ signal }) => sessionService.getMySubmissions(params, { signal }),
  })
}

export function useMySubmissionDetailQuery(sessionId: number) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(sessionId),
    queryFn: ({ signal }) => sessionService.getMySubmissionDetail(sessionId, { signal }),
    enabled: Number.isFinite(sessionId) && sessionId > 0,
  })
}

export function useEnrolledSubjectsQuery() {
  return useQuery({
    queryKey: queryKeys.sessions.enrolledSubjects(),
    queryFn: ({ signal }) => sessionService.getMyEnrolledSubjects({ signal }),
    staleTime: 10 * 60 * 1000,
  })
}

export function useProposeSessionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProposeSessionRequest) => sessionService.proposeSession(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.mySubmissions() })
    },
  })
}

export function useUpdateSubmissionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: number; payload: UpdateSubmissionSessionRequest }) =>
      sessionService.updateMySubmissionSession(sessionId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.mySubmissions() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.detail(variables.sessionId) })
    },
  })
}

export function useDeleteSubmissionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: number) => sessionService.deleteMySubmissionSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.mySubmissions() })
    },
  })
}
