import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Users, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Heading, Text } from '@/components/ui/typography'
import { Card, Badge } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { SearchInput, Select } from '@/components/ui/forms'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import {
  useCourseClassesQuery,
  useMyClassesQuery,
  useSubjectsQuery,
} from '@/hooks/queries/useCourseQuery'
import { useAuthStore } from '@/stores/authStore'
import { positiveId } from '@/types/academic.types'
import type { CourseClassResponse } from '@/types'
import { formatDate } from '@/utils/date'
import { canManageCourseClass } from './classes/class-utils'
import { CreateCourseClassModal } from './classes/CreateCourseClassModal'
import { ClassStudentsModal } from './classes/ClassStudentsModal'

export default function TeacherClassesPage() {
  const { t } = useTranslation('academic')
  const [params, setParams] = useSearchParams()
  const currentUser = useAuthStore((state) => state.user)
  const tab = params.get('tab') === 'all' ? 'all' : 'mine'
  const subjectId = positiveId(params.get('subjectId'))
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<CourseClassResponse | null>(null)

  const subjectsQuery = useSubjectsQuery()
  const myClassesQuery = useMyClassesQuery(tab === 'mine')
  const allClassesQuery = useCourseClassesQuery(undefined, tab === 'all')
  const activeQuery = tab === 'all' ? allClassesQuery : myClassesQuery

  const subjects = subjectsQuery.data ?? []
  const subjectOptions = [
    { value: '', label: t('teacher.classes.allSubjects') },
    ...subjects
      .filter((item) => item.subject_id != null)
      .map((item) => ({
        value: String(item.subject_id),
        label: `${item.code ?? ''} · ${item.name ?? ''}`.trim(),
      })),
  ]

  const keyword = search.trim().toLowerCase()
  const visibleClasses = (activeQuery.data ?? []).filter((cls) => {
    if (subjectId && cls.subject_id !== subjectId) return false
    if (!keyword) return true
    return [cls.class_code, cls.subject_code, cls.subject_name, cls.lecturer_name]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(keyword))
  })

  function updateParam(key: string, value?: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  let classesContent: ReactNode
  if (activeQuery.isPending) {
    classesContent = <AcademicFeedback pending />
  } else if (activeQuery.isError) {
    classesContent = <AcademicFeedback error={activeQuery.error} onRetry={activeQuery.refetch} />
  } else if (visibleClasses.length === 0) {
    classesContent = (
      <AcademicFeedback empty={tab === 'mine' ? t('teacher.classes.emptyMine') : t('teacher.classes.emptyAll')} />
    )
  } else {
    classesContent = (
      <section aria-label={t('teacher.classes.listAria')} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleClasses.map((cls) => {
          const manageable = tab === 'mine' || canManageCourseClass(cls, currentUser)
          return (
            <Card
              key={cls.course_class_id ?? cls.class_code}
              as="article"
              className="p-5 rounded-2xl bg-surface-card border border-line-subtle shadow-card space-y-4"
            >
              <header className="flex items-start justify-between gap-2">
                <section className="space-y-1 min-w-0">
                  <Badge tone="accent" emphasis="subtle" size="sm">
                    {[cls.class_code, cls.subject_code].filter(Boolean).join(' · ')}
                  </Badge>
                  <Heading level={2} className="text-lg font-bold text-fg-primary">
                    {cls.subject_name}
                  </Heading>
                </section>
                {cls.semester_name ? (
                  <Badge tone="neutral" emphasis="outline" size="sm" className="shrink-0">
                    {cls.semester_name}
                  </Badge>
                ) : null}
              </header>

              <section className="space-y-1 text-sm text-fg-muted">
                <p>
                  {t('teacher.classes.lecturerLabel')}{' '}
                  <strong className="text-fg-primary font-medium">{cls.lecturer_name}</strong>
                </p>
                <p>
                  {t('teacher.classes.studentsLabel')}{' '}
                  <strong className="text-fg-primary font-medium">
                    {t('teacher.classes.studentsCount', { count: cls.total_students ?? 0 })}
                  </strong>
                </p>
                {cls.created_at ? (
                  <p>
                    {t('teacher.classes.createdAtLabel')}{' '}
                    <strong className="text-fg-primary font-medium">{formatDate(cls.created_at)}</strong>
                  </p>
                ) : null}
              </section>

              <footer className="pt-3 border-t border-line-subtle flex items-center justify-between gap-2">
                {manageable ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="min-h-11 text-xs gap-1.5"
                    leftIcon={<Users size={16} />}
                    onClick={() => setSelectedClass(cls)}
                  >
                    {t('teacher.classes.viewStudents', { count: cls.total_students ?? 0 })}
                  </Button>
                ) : (
                  <Badge tone="neutral" emphasis="outline" size="sm">
                    {t('teacher.classes.readOnlyBadge')}
                  </Badge>
                )}
              </footer>
            </Card>
          )
        })}
      </section>
    )
  }

  return (
    <section className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line-subtle">
        <section className="space-y-1">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title icon and heading row] */}
          <div className="flex items-center gap-2">
            <Users className="text-action-accent" size={26} />
            <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
              {t('teacher.classes.title')}
            </Heading>
          </div>
          <Text size="sm" tone="muted">
            {t('teacher.classes.subtitle')}
          </Text>
        </section>

        <Button
          variant="primary"
          size="md"
          className="min-h-11 gap-2 rounded-xl text-xs sm:text-sm self-start sm:self-auto"
          leftIcon={<Plus size={18} />}
          onClick={() => setCreateOpen(true)}
        >
          {t('teacher.classes.createButton')}
        </Button>
      </header>

      <nav aria-label={t('teacher.classes.tabsAria')} className="flex flex-wrap items-center gap-2">
        <Button
          variant={tab === 'mine' ? 'secondary' : 'ghost'}
          size="sm"
          className="min-h-11"
          aria-pressed={tab === 'mine'}
          onClick={() => updateParam('tab')}
        >
          {t('teacher.classes.tabMine')}
        </Button>
        <Button
          variant={tab === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          className="min-h-11"
          aria-pressed={tab === 'all'}
          onClick={() => updateParam('tab', 'all')}
        >
          {t('teacher.classes.tabAll')}
        </Button>
      </nav>

      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Two-column search and subject filter bar] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          debounceMs={0}
          aria-label={t('teacher.classes.searchAria')}
          placeholder={t('teacher.classes.searchPlaceholder')}
        />
        <Select
          ariaLabel={t('teacher.classes.subjectFilterAria')}
          value={subjectId ? String(subjectId) : ''}
          placeholder={t('teacher.classes.allSubjects')}
          options={subjectOptions}
          onValueChange={(value) => updateParam('subjectId', value)}
        />
      </div>

      {classesContent}

      <CreateCourseClassModal
        open={createOpen}
        subjects={subjects}
        onClose={() => setCreateOpen(false)}
      />

      {selectedClass ? (
        <ClassStudentsModal
          key={selectedClass.course_class_id}
          courseClass={selectedClass}
          onClose={() => setSelectedClass(null)}
        />
      ) : null}
    </section>
  )
}
