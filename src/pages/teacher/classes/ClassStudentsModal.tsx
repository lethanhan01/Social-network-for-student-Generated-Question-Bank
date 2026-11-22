import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/overlay'
import { Form, FormField, SearchInput, Textarea } from '@/components/ui/forms'
import { SubmitButton } from '@/components/ui/actions'
import { Badge, Card } from '@/components/ui/data-display'
import { Text } from '@/components/ui/typography'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import { useAssignStudentsMutation, useClassStudentsQuery } from '@/hooks/queries/useCourseQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { formatDate } from '@/utils/date'
import type { AssignStudentsResponse, CourseClassResponse } from '@/types'
import { parseStudentCodes } from './class-utils'

interface ClassStudentsModalProps {
  courseClass: CourseClassResponse
  onClose: () => void
}

export function ClassStudentsModal({ courseClass, onClose }: Readonly<ClassStudentsModalProps>) {
  const { t } = useTranslation('academic')
  const classId = courseClass.course_class_id ?? 0
  const [rawCodes, setRawCodes] = useState('')
  const [assignError, setAssignError] = useState<string | undefined>()
  const [assignResult, setAssignResult] = useState<AssignStudentsResponse | null>(null)
  const [search, setSearch] = useState('')

  const studentsQuery = useClassStudentsQuery(classId)
  const assignMutation = useAssignStudentsMutation(classId)

  const allStudents = studentsQuery.data ?? []
  const keyword = search.trim().toLowerCase()
  const filteredStudents = keyword
    ? allStudents.filter((student) =>
        [student.student_code, student.full_name, student.email, student.class_name]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(keyword))
      )
    : allStudents

  async function handleAssign(event: FormEvent) {
    event.preventDefault()
    const codes = parseStudentCodes(rawCodes)
    if (codes.length === 0) {
      setAssignError(t('teacher.classes.studentsModal.codesRequired'))
      return
    }
    setAssignError(undefined)
    try {
      const response = await assignMutation.mutateAsync({ student_codes: codes })
      setAssignResult(response)
      setRawCodes('')
      toast.success(
        t('teacher.classes.studentsModal.assignSuccess', { enrolled: response.total_enrolled ?? 0 })
      )
    } catch (error) {
      toast.error(getApiError(error, t('teacher.classes.studentsModal.assignError')))
    }
  }

  let studentsContent: ReactNode
  if (studentsQuery.isPending) {
    studentsContent = <AcademicFeedback pending />
  } else if (studentsQuery.isError) {
    studentsContent = <AcademicFeedback error={studentsQuery.error} onRetry={studentsQuery.refetch} />
  } else if (filteredStudents.length === 0) {
    const emptyMsg =
      allStudents.length === 0
        ? t('teacher.classes.studentsModal.empty')
        : t('teacher.classes.studentsModal.emptySearch')
    studentsContent = <AcademicFeedback empty={emptyMsg} />
  } else {
    studentsContent = (
      <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {filteredStudents.map((student) => (
          <li
            key={student.user_id ?? student.student_code}
            className="p-3 rounded-xl bg-surface-base border border-line-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <section className="space-y-0.5 min-w-0">
              <p className="text-sm font-semibold text-fg-primary truncate">{student.full_name}</p>
              <Text size="xs" tone="muted" className="truncate">
                {[student.student_code, student.email, student.class_name].filter(Boolean).join(' · ')}
              </Text>
            </section>
            {student.enrolled_at ? (
              <Text size="xs" tone="muted" className="shrink-0">
                {t('teacher.classes.studentsModal.enrolledAt', { date: formatDate(student.enrolled_at) })}
              </Text>
            ) : null}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Modal
      open
      size="2xl"
      title={t('teacher.classes.studentsModal.title', { code: courseClass.class_code ?? '' })}
      description={[courseClass.subject_code, courseClass.subject_name].filter(Boolean).join(' · ')}
      onClose={onClose}
    >
      <section className="space-y-6">
        <Card as="section" className="p-4 rounded-xl bg-surface-base border border-line-subtle space-y-3">
          <Form onSubmit={handleAssign} className="space-y-3" noValidate>
            <FormField
              label={t('teacher.classes.studentsModal.assignLabel')}
              hint={t('teacher.classes.studentsModal.assignHint')}
              error={assignError}
            >
              <Textarea
                rows={2}
                value={rawCodes}
                placeholder={t('teacher.classes.studentsModal.assignPlaceholder')}
                onChange={(event) => {
                  setRawCodes(event.target.value)
                  if (assignError) setAssignError(undefined)
                }}
              />
            </FormField>
            <footer className="flex justify-end">
              <SubmitButton size="sm" className="min-h-11" loading={assignMutation.isPending}>
                {t('teacher.classes.studentsModal.assignSubmit')}
              </SubmitButton>
            </footer>
          </Form>

          {assignResult ? (
            <aside role="status" className="flex flex-wrap items-center gap-2 pt-2 border-t border-line-subtle">
              <Badge tone="success" emphasis="subtle" size="sm">
                {t('teacher.classes.studentsModal.resultEnrolled', { count: assignResult.total_enrolled ?? 0 })}
              </Badge>
              <Badge tone="neutral" emphasis="subtle" size="sm">
                {t('teacher.classes.studentsModal.resultExisting', { count: assignResult.already_enrolled_count ?? 0 })}
              </Badge>
              {(assignResult.not_found_count ?? 0) > 0 ? (
                <Badge tone="warning" emphasis="subtle" size="sm">
                  {t('teacher.classes.studentsModal.resultNotFound', {
                    count: assignResult.not_found_count ?? 0,
                    codes: (assignResult.not_found_codes ?? []).join(', '),
                  })}
                </Badge>
              ) : null}
            </aside>
          ) : null}
        </Card>

        <section className="space-y-3" aria-label={t('teacher.classes.studentsModal.studentListAria')}>
          <SearchInput
            value={search}
            onChange={setSearch}
            debounceMs={0}
            aria-label={t('teacher.classes.studentsModal.searchAria')}
            placeholder={t('teacher.classes.studentsModal.searchPlaceholder')}
          />

          {studentsContent}
        </section>
      </section>
    </Modal>
  )
}
