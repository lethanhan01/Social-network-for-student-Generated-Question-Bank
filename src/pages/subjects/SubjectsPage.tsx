import { useState } from 'react'
import { BookOpen, GraduationCap, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge, Card } from '@/components/ui/data-display'
import { ButtonLink } from '@/components/ui/actions'
import { Checkbox, Input } from '@/components/ui/forms'
import { Grid, Page, PageEmptyState, PageErrorState, PageHeader, PageSkeleton } from '@/components/ui/layout'
import { Heading, Text } from '@/components/ui/typography'
import { useEnrolledSubjectsQuery, useSubjectsQuery } from '@/hooks/queries'
import { useDebounceValue } from '@/hooks/useDebounce'
import { getApiError } from '@/lib/api-error'
import type { SubjectResponse } from '@/types'

function matchesKeyword(subject: SubjectResponse, keyword: string): boolean {
  if (!keyword) return true
  const normalized = keyword.toLowerCase()
  return (
    (subject.name ?? '').toLowerCase().includes(normalized) ||
    (subject.code ?? '').toLowerCase().includes(normalized)
  )
}

export default function SubjectsPage() {
  const { t } = useTranslation('academic')
  const [keyword, setKeyword] = useState('')
  const [enrolledOnly, setEnrolledOnly] = useState(false)
  const debouncedKeyword = useDebounceValue(keyword.trim(), 250)
  const subjectsQuery = useSubjectsQuery()
  const enrolledQuery = useEnrolledSubjectsQuery()

  const enrolledIds = new Set((enrolledQuery.data ?? []).map((s) => s.subject_id ?? (s as any).course_class_id))
  const subjects = (subjectsQuery.data ?? []).filter(
    (subject) => matchesKeyword(subject, debouncedKeyword) && (!enrolledOnly || enrolledIds.has(subject.subject_id))
  )

  function renderList() {
    if (subjectsQuery.isLoading) return <PageSkeleton rows={3} />
    if (subjectsQuery.isError) {
      return (
        <PageErrorState
          message={getApiError(subjectsQuery.error, t('subjects.loadError'))}
          onRetry={() => void subjectsQuery.refetch()}
        />
      )
    }
    if (subjects.length === 0) {
      return (
        <PageEmptyState
          title={t(debouncedKeyword || enrolledOnly ? 'subjects.empty.filtered' : 'subjects.empty.title')}
          description={t('subjects.empty.description')}
        />
      )
    }
    return (
      <Grid cols={1} smCols={2} lgCols={3} gap={4} as="section" aria-label={t('subjects.listLabel')}>
        {subjects.map((subject) => {
          const enrolled = enrolledIds.has(subject.subject_id)
          return (
            <Card as="article" variant="compact" key={subject.subject_id} className="flex h-full flex-col gap-3">
              <header className="flex items-start justify-between gap-2">
                <Badge tone="accent" size="xs" leftIcon={<BookOpen size={12} />}>
                  {subject.code}
                </Badge>
                {enrolled ? (
                  <Badge tone="success" size="xs" leftIcon={<GraduationCap size={12} />}>
                    {t('subjects.enrolled')}
                  </Badge>
                ) : null}
              </header>
              <Heading level={3} size="xs">
                {subject.name}
              </Heading>
              <footer className="mt-auto">
                {enrolled ? (
                  <ButtonLink
                    to={`/proposals?subject=${subject.subject_id}`}
                    variant="outline"
                    size="sm"
                    touchTarget
                    aria-label={t('subjects.viewProposalsAria', { name: subject.name })}
                  >
                    {t('subjects.viewProposals')}
                  </ButtonLink>
                ) : (
                  <Text size="xs" tone="dim">
                    {t('subjects.notEnrolled')}
                  </Text>
                )}
              </footer>
            </Card>
          )
        })}
      </Grid>
    )
  }

  return (
    <Page>
      <PageHeader eyebrow={t('eyebrow')} title={t('subjects.title')} description={t('subjects.description')} />

      <section aria-label={t('subjects.searchLabel')} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          aria-label={t('subjects.searchLabel')}
          placeholder={t('subjects.searchPlaceholder')}
          leftIcon={<Search size={16} />}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="min-h-11"
        />
        <Checkbox
          label={t('subjects.enrolledOnly')}
          checked={enrolledOnly}
          onCheckedChange={setEnrolledOnly}
        />
      </section>

      {renderList()}
    </Page>
  )
}
