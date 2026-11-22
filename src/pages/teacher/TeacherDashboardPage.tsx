import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, CheckSquare, BookOpen, GraduationCap, Calendar } from 'lucide-react'
import { Heading, Text } from '@/components/ui/typography'
import { Card, Badge } from '@/components/ui/data-display'
import { Button, ButtonLink } from '@/components/ui/actions'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import { useMyClassesQuery } from '@/hooks/queries/useCourseQuery'
import { usePendingSessionsQuery } from '@/hooks/queries/useReviewQuery'
import { useMyExamsQuery } from '@/hooks/queries/useExamQuery'
import { formatDateTime } from '@/utils/date'

function formatCount(isPending: boolean, count: number, hasNext?: boolean): string {
  if (isPending) return '—'
  return hasNext ? `${count}+` : String(count)
}

export default function TeacherDashboardPage() {
  const { t } = useTranslation('academic')
  const myClasses = useMyClassesQuery()
  const pendingSessions = usePendingSessionsQuery({ limit: 5 })
  const myExams = useMyExamsQuery({ limit: 5 })

  const classesList = myClasses.data ?? []
  const totalStudents = classesList.reduce((sum, item) => sum + (item.total_students ?? 0), 0)
  const activeSemester = classesList.find((item) => item.semester_name)?.semester_name

  const pendingItems = pendingSessions.data?.items ?? []
  const pendingCountText = formatCount(
    pendingSessions.isPending,
    pendingItems.length,
    pendingSessions.data?.pagination?.has_next
  )

  const examItems = myExams.data?.items ?? []
  const examCountText = formatCount(
    myExams.isPending,
    examItems.length,
    myExams.data?.pagination?.has_next
  )

  const stats = [
    {
      key: 'classes',
      title: t('teacher.dashboard.classesTitle'),
      value: myClasses.isPending ? '—' : String(classesList.length),
      description: t('teacher.dashboard.totalStudents', { count: totalStudents }),
      icon: <Users size={24} />,
      link: '/teacher/classes',
      isError: myClasses.isError,
      onRetry: myClasses.refetch,
    },
    {
      key: 'reviews',
      title: t('teacher.dashboard.reviewsTitle'),
      value: pendingCountText,
      description:
        pendingItems.length > 0
          ? t('teacher.dashboard.reviewsPendingHint')
          : t('teacher.dashboard.reviewsEmptyHint'),
      icon: <CheckSquare size={24} />,
      link: '/teacher/reviews',
      isError: pendingSessions.isError,
      onRetry: pendingSessions.refetch,
    },
    {
      key: 'exams',
      title: t('teacher.dashboard.examsTitle'),
      value: examCountText,
      description: t('teacher.dashboard.examsHint'),
      icon: <BookOpen size={24} />,
      link: '/teacher/exams',
      isError: myExams.isError,
      onRetry: myExams.refetch,
    },
  ]

  let priorityContent: ReactNode
  if (pendingSessions.isPending) {
    priorityContent = <AcademicFeedback pending />
  } else if (pendingSessions.isError) {
    priorityContent = <AcademicFeedback error={pendingSessions.error} onRetry={pendingSessions.refetch} />
  } else if (pendingItems.length === 0) {
    priorityContent = (
      <Text size="sm" tone="muted" className="py-4">
        {t('teacher.dashboard.priorityEmpty')}
      </Text>
    )
  } else {
    priorityContent = (
      <ul className="space-y-3">
        {pendingItems.slice(0, 3).map((item) => (
          <li
            key={item.session_id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-base border border-line-subtle"
          >
            <section className="space-y-0.5 min-w-0">
              <strong className="text-sm font-semibold text-fg-primary block truncate">
                {item.title || t('teacher.dashboard.untitledSession', { id: item.session_id ?? 0 })}
              </strong>
              <Text size="xs" tone="muted">
                {[item.topic, item.author?.full_name, item.created_at ? formatDateTime(item.created_at) : null]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </section>
            <ButtonLink
              to={`/teacher/reviews?session=${item.session_id ?? ''}`}
              variant="secondary"
              size="sm"
              className="min-h-11 shrink-0 text-xs"
            >
              {t('teacher.dashboard.reviewNow')}
            </ButtonLink>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line-subtle">
        <section className="space-y-1">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Title icon and heading row] */}
          <div className="flex items-center gap-2">
            <GraduationCap className="text-action-accent" size={28} />
            <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
              {t('teacher.dashboard.title')}
            </Heading>
          </div>
          <Text size="sm" tone="muted">
            {t('teacher.dashboard.subtitle')}
          </Text>
        </section>

        {activeSemester ? (
          <Badge tone="accent" emphasis="subtle" size="md" className="gap-1.5 py-1 px-3 self-start sm:self-auto">
            <Calendar size={14} />
            {t('teacher.dashboard.semesterBadge', { name: activeSemester })}
          </Badge>
        ) : null}
      </header>

      <section aria-label={t('teacher.dashboard.statsAria')} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.key}
            as="article"
            className="p-5 rounded-2xl bg-surface-card border border-line-subtle shadow-card flex flex-col justify-between gap-4"
          >
            <header className="flex items-center justify-between gap-2">
              <Text size="xs" className="font-semibold uppercase tracking-wider text-fg-muted">
                {stat.title}
              </Text>
              {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Stat icon container] */}
              <div className="w-10 h-10 rounded-xl bg-surface-card-hover flex items-center justify-center text-action-accent shrink-0">
                {stat.icon}
              </div>
            </header>

            {stat.isError ? (
              <section className="space-y-2">
                <Text size="xs" tone="muted" role="alert">
                  {t('loadError')}
                </Text>
                <Button variant="outline" size="sm" className="min-h-11" onClick={() => { void stat.onRetry() }}>
                  {t('retry')}
                </Button>
              </section>
            ) : (
              <section>
                <p className="text-3xl font-extrabold tracking-tight text-fg-primary">{stat.value}</p>
                <Text size="xs" tone="muted" className="mt-1">
                  {stat.description}
                </Text>
              </section>
            )}

            <nav aria-label={t('teacher.dashboard.accessAria', { title: stat.title })} className="pt-2 border-t border-line-subtle">
              <ButtonLink
                to={stat.link}
                variant="ghost"
                size="sm"
                className="w-full justify-center min-h-11 text-xs font-semibold text-action-accent hover:text-action-accent"
              >
                {t('common.details')}
              </ButtonLink>
            </nav>
          </Card>
        ))}
      </section>

      <section aria-label={t('teacher.dashboard.shortcutsAria')} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card as="section" className="p-6 rounded-2xl bg-surface-card border border-line-subtle shadow-card space-y-4">
          <header className="space-y-1">
            <Heading level={2} className="text-lg font-bold text-fg-primary">
              {t('teacher.dashboard.priorityTitle')}
            </Heading>
            <Text size="sm" tone="muted">
              {t('teacher.dashboard.prioritySubtitle')}
            </Text>
          </header>

          {priorityContent}
        </Card>

        <Card as="section" className="p-6 rounded-2xl bg-surface-card border border-line-subtle shadow-card space-y-4">
          <header className="space-y-1">
            <Heading level={2} className="text-lg font-bold text-fg-primary">
              {t('teacher.dashboard.quickLinksTitle')}
            </Heading>
            <Text size="sm" tone="muted">
              {t('teacher.dashboard.quickLinksSubtitle')}
            </Text>
          </header>
          <nav aria-label={t('teacher.dashboard.quickLinksTitle')} className="grid grid-cols-2 gap-3 pt-2">
            <ButtonLink to="/teacher/classes" variant="outline" size="md" className="flex-col items-center justify-center min-h-20 rounded-xl text-center p-3 gap-2">
              <Users size={20} className="text-action-accent" />
              <strong className="text-xs font-semibold">{t('teacher.dashboard.linkClasses')}</strong>
            </ButtonLink>
            <ButtonLink to="/teacher/reviews" variant="outline" size="md" className="flex-col items-center justify-center min-h-20 rounded-xl text-center p-3 gap-2">
              <CheckSquare size={20} className="text-action-accent" />
              <strong className="text-xs font-semibold">{t('teacher.dashboard.linkReviews')}</strong>
            </ButtonLink>
            <ButtonLink to="/teacher/exams" variant="outline" size="md" className="flex-col items-center justify-center min-h-20 rounded-xl text-center p-3 gap-2">
              <BookOpen size={20} className="text-action-accent" />
              <strong className="text-xs font-semibold">{t('teacher.dashboard.linkExams')}</strong>
            </ButtonLink>
            <ButtonLink to="/feed" variant="outline" size="md" className="flex-col items-center justify-center min-h-20 rounded-xl text-center p-3 gap-2">
              <GraduationCap size={20} className="text-action-accent" />
              <strong className="text-xs font-semibold">{t('teacher.dashboard.linkFeed')}</strong>
            </ButtonLink>
          </nav>
        </Card>
      </section>
    </section>
  )
}
