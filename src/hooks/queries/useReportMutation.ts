import { useMutation } from '@tanstack/react-query'
import { utilityService } from '@/services/utility.service'
import type { CreateReportRequestDto } from '@/types'

export function useReportMutation() {
  return useMutation({
    mutationFn: (payload: CreateReportRequestDto) => utilityService.createReport(payload),
  })
}
