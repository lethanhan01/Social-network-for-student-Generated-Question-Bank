import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { examService, type ExamExportFormat } from '@/services/exam.service'
import { queryKeys } from '@/lib/query-keys'
import type { GenerateExamRequest } from '@/types'

export function useMyExamsQuery(params?: { cursor?: string; limit?: number; subject_id?: number }) {
  return useQuery({
    queryKey: queryKeys.exams.list(params),
    queryFn: ({ signal }) => examService.getMyExams(params, { signal }),
  })
}

export function useInfiniteMyExamsQuery(subjectId?: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.exams.list({ subject_id: subjectId, infinite: true }),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      examService.getMyExams(
        { cursor: pageParam, limit: 20, subject_id: subjectId },
        { signal }
      ),
    getNextPageParam: (last) =>
      last.pagination?.has_next && last.pagination.after != null
        ? String(last.pagination.after)
        : undefined,
  })
}

export function useExamDetailQuery(examId?: number) {
  return useQuery({
    queryKey: queryKeys.exams.detail(examId ?? 0),
    queryFn: ({ signal }) => examService.getExamDetail(examId!, { signal }),
    enabled: examId != null && Number.isFinite(examId) && examId > 0,
  })
}

export function useGenerateExamMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: GenerateExamRequest) => examService.generateExam(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.exams.all })
    },
  })
}

export function useExportExamMutation() {
  return useMutation({
    mutationFn: ({
      examId,
      format,
      includeAnswerKey,
    }: {
      examId: number
      format: ExamExportFormat
      includeAnswerKey?: boolean
    }) => examService.exportExam(examId, { format, include_answer_key: includeAnswerKey }),
  })
}

export function useExportQuestionsMutation() {
  return useMutation({
    mutationFn: ({
      subjectId,
      format,
      includeAnswerKey,
    }: {
      subjectId: number
      format: ExamExportFormat
      includeAnswerKey?: boolean
    }) =>
      examService.exportQuestions({
        subject_id: subjectId,
        format,
        include_answer_key: includeAnswerKey,
      }),
  })
}
