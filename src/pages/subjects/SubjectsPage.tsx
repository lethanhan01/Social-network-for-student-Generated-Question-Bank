import { useSearchParams } from 'react-router-dom'
import { BookOpen, PenLine, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AcademicLayout } from '@/components/academic/AcademicLayout'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import { useSubjectsQuery } from '@/hooks/queries/useAcademicQuery'
import { useEnrolledSubjectsQuery } from '@/hooks/queries/useSessionsQuery'
import { Card } from '@/components/ui/data-display/Card'
import { Badge } from '@/components/ui/data-display/Badge'
import { Button } from '@/components/ui/actions/Button'
import { ButtonLink } from '@/components/ui/actions/Button'
import { SearchInput } from '@/components/ui/forms/SearchInput'
import { Heading } from '@/components/ui/typography/Heading'
import { Text } from '@/components/ui/typography/Text'

export default function SubjectsPage() {
  const { t } = useTranslation('academic')
  const [params, setParams] = useSearchParams()
  const subjects = useSubjectsQuery()
  const enrolled = useEnrolledSubjectsQuery()
  const mine = params.get('tab') === 'mine'
  const search = params.get('q') ?? ''
  const active = mine ? enrolled : subjects
  const enrolledIds = new Set((enrolled.data ?? []).map((subject) => subject.subject_id))
  const filtered = (active.data ?? []).filter((subject) =>
    `${subject.code ?? ''} ${subject.name ?? ''}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))

  function update(key: string, value: string) {
    setParams((previous) => { const next = new URLSearchParams(previous); next.set(key, value); return next }, { replace: true })
  }

  return (
    <AcademicLayout title={t('subjects.title')} subtitle={t('subjects.subtitle')}>
      <Card as="section" className="space-y-4 rounded-2xl">
        <SearchInput aria-label={t('subjects.search')} placeholder={t('subjects.search')}
          value={search} onChange={(value) => update('q', value)} fullWidth />
        <nav aria-label={t('subjects.filter')} className="flex gap-2">
          <Button variant={!mine ? 'secondary' : 'ghost'} aria-pressed={!mine} onClick={() => update('tab', 'all')}>{t('subjects.all')}</Button>
          <Button variant={mine ? 'secondary' : 'ghost'} aria-pressed={mine} onClick={() => update('tab', 'mine')}>{t('subjects.mine')}</Button>
        </nav>
      </Card>
      {!mine && enrolled.isError ? <AcademicFeedback error={enrolled.error} onRetry={enrolled.refetch} /> : null}
      {active.isPending ? <AcademicFeedback pending /> : active.isError ? (
        <AcademicFeedback error={active.error} onRetry={active.refetch} />
      ) : filtered.length === 0 ? <AcademicFeedback empty={t('subjects.empty')} /> : (
        <section aria-label={t('subjects.title')} className="grid gap-4 sm:grid-cols-2">
          {filtered.map((subject) => (
            <Card as="article" key={subject.subject_id ?? subject.code} className="flex flex-col gap-4 rounded-2xl">
              <header className="flex items-center gap-3">
                <BookOpen size={32} className="shrink-0 text-action-accent" />
                <hgroup className="min-w-0 space-y-1">
                  <Text size="xs" tone="muted">{subject.code}</Text>
                  <Heading level={2} className="text-base font-bold">{subject.name}</Heading>
                </hgroup>
              </header>
              {enrolledIds.has(subject.subject_id) ? <Badge tone="success">{t('subjects.enrolled')}</Badge> : null}
              <footer className="mt-auto flex flex-wrap gap-2 border-t border-line-subtle pt-4">
                {subject.subject_id ? <ButtonLink to={`/practice?subjectId=${subject.subject_id}`} variant="secondary"
                  leftIcon={<Play size={16} />}>{t('subjects.practice')}</ButtonLink> : null}
                {subject.subject_id && enrolledIds.has(subject.subject_id) ? (
                  <ButtonLink to={`/proposals?subjectId=${subject.subject_id}`} variant="ghost"
                    leftIcon={<PenLine size={16} />}>{t('subjects.propose')}</ButtonLink>
                ) : null}
              </footer>
            </Card>
          ))}
        </section>
      )}
    </AcademicLayout>
  )
}
