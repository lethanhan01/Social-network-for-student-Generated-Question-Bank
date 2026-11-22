import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/services/course.service'
import { queryKeys } from '@/lib/query-keys'
import type { AssignStudentsRequest, CreateCourseClassRequest } from '@/types'

export function useSubjectsQuery() {
  return useQuery({
    queryKey: queryKeys.subjects.list(),
    queryFn: ({ signal }) => courseService.getSubjects({ signal }),
    staleTime: 10 * 60 * 1000,
  })
}

export function useMyClassesQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.courses.myClasses(),
    queryFn: ({ signal }) => courseService.getMyEnrolledClasses({ signal }),
    enabled,
  })
}

export function useCourseClassesQuery(semesterId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.courses.classes(semesterId != null ? { semester_id: semesterId } : undefined),
    queryFn: ({ signal }) =>
      courseService.getCourseClasses(
        semesterId != null ? { semester_id: semesterId } : undefined,
        { signal }
      ),
    enabled,
  })
}

export function useClassStudentsQuery(courseClassId?: number) {
  return useQuery({
    queryKey: queryKeys.courses.students(courseClassId ?? 0),
    queryFn: ({ signal }) => courseService.getClassStudents(courseClassId!, { signal }),
    enabled: courseClassId != null && Number.isFinite(courseClassId) && courseClassId > 0,
  })
}

export function useCreateCourseClassMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCourseClassRequest) => courseService.createCourseClass(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
    },
  })
}

export function useAssignStudentsMutation(courseClassId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AssignStudentsRequest) =>
      courseService.assignStudents(courseClassId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.students(courseClassId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
    },
  })
}

