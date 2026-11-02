import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PenLine, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AcademicLayout } from '@/components/academic/AcademicLayout'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import { useAcademicSessionsQuery } from '@/hooks/queries/useAcademicQuery'
import { useEnrolledSubjectsQuery } from '@/hooks/queries/useSessionsQuery'
import { Button } from '@/components/ui/actions/Button'
import { Card } from '@/components/ui/data-display/Card'
import { Select } from '@/components/ui/forms/Select'
import { positiveId, readSessionStatus, type AcademicSession } from '@/types/academic.types'
import { ProposalCard } from './ProposalCard'
import { ProposalDetailModal } from './ProposalDetailModal'
import { ProposalComposer } from './ProposalComposer'

const FILTERS = ['ALL', 'PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'RESOLVED'] as const

export default function ProposalsPage() {
  const { t } = useTranslation('academic')
  const [params, setParams] = useSearchParams()
  const status = FILTERS.find((value) => value === params.get('status')) ?? 'ALL'
  const subjectId = positiveId(params.get('subjectId'))
  const selectedId = positiveId(params.get('session'))
  const [creating, setCreating] = useState(false)
  const sessions = useAcademicSessionsQuery(status === 'ALL' ? undefined : status)
  const enrolled = useEnrolledSubjectsQuery()
  const all: AcademicSession[] = sessions.data?.pages.flatMap((page) => page.contents ?? []) ?? []
  const visible = all.filter((session) => (!subjectId || session.subject_id === subjectId) &&
    (status === 'ALL' || readSessionStatus(session) === 'UNKNOWN' || readSessionStatus(session) === status))

  function update(key: string, value?: string) {
    setParams((previous) => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); return next })
  }

  return (
    <AcademicLayout title={t('proposals.title')} subtitle={t('proposals.subtitle')}>
      <Card as="section" className="space-y-4 rounded-2xl">
        <Button variant="secondary" className="min-h-14 w-full justify-start rounded-full px-5 text-text-muted"
          leftIcon={<PenLine size={24} />} onClick={() => setCreating(true)}>{t('proposals.composer')}</Button>
        <footer className="border-t border-line-subtle pt-3">
          <Button variant="ghost" className="w-full" onClick={() => setCreating(true)} leftIcon={<Plus size={18} />}>{t('proposals.create')}</Button>
        </footer>
      </Card>
      <nav aria-label={t('proposals.filters')} className="flex gap-1 overflow-x-auto border-b border-line-subtle pb-2">
        {FILTERS.map((value) => <Button key={value} variant={status === value ? 'secondary' : 'ghost'}
          aria-pressed={status === value} className="shrink-0" onClick={() => update('status', value)}>{t(`status.${value}`)}</Button>)}
      </nav>
      <Select ariaLabel={t('subjects.filter')} value={subjectId ? String(subjectId) : ''}
        placeholder={t('subjects.all')} onValueChange={(value) => update('subjectId', value)}
        options={(enrolled.data ?? []).filter((subject) => subject.subject_id).map((subject) => ({ value: String(subject.subject_id), label: `${subject.code} · ${subject.name}` }))} />
      {sessions.isPending ? <AcademicFeedback pending /> : sessions.isError ? <AcademicFeedback error={sessions.error} onRetry={sessions.refetch} /> : (
        <section className="space-y-4" aria-label={t('proposals.history')}>
          {visible.length === 0 ? <AcademicFeedback empty={t('proposals.empty')} /> : visible.map((session) => (
            <ProposalCard key={session.session_id} session={session} onOpen={(id) => update('session', String(id))} />
          ))}
          {sessions.hasNextPage ? <Button variant="outline" className="w-full" loading={sessions.isFetchingNextPage}
            onClick={() => { void sessions.fetchNextPage() }}>{t('loadMore')}</Button> : null}
        </section>
      )}
      {creating ? <ProposalComposer subjects={enrolled.data ?? []} subjectId={subjectId}
        subjectsPending={enrolled.isPending} subjectsError={enrolled.error} retrySubjects={enrolled.refetch}
        onClose={() => setCreating(false)} /> : null}
      {selectedId ? <ProposalDetailModal key={selectedId} sessionId={selectedId} onClose={() => update('session')}
        summary={all.find((session) => session.session_id === selectedId)} subjects={enrolled.data ?? []} /> : null}
    </AcademicLayout>
  )
}
