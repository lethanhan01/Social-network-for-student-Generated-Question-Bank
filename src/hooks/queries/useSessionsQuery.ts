import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService } from '@/services/session.service'
import { queryKeys } from '@/lib/query-keys'
import type { ProposeSessionRequest } from '@/types'

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

export function useEnrolledCourseClassesQuery() {
  return useQuery({
    queryKey: queryKeys.sessions.enrolledClasses(),
    queryFn: ({ signal }) => sessionService.getMyEnrolledCourseClasses({ signal }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProposeSessionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProposeSessionRequest) => sessionService.proposeSession(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
    },
  })
}
