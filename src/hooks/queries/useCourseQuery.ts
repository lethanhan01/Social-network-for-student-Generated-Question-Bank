import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/services/course.service'
import { queryKeys } from '@/lib/query-keys'

export function useSubjectsQuery() {
  return useQuery({
    queryKey: queryKeys.subjects.list(),
    queryFn: ({ signal }) => courseService.getSubjects({ signal }),
    staleTime: 10 * 60 * 1000,
  })
}

