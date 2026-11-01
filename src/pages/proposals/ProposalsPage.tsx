import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/actions'
import { Grid, Page, PageEmptyState, PageErrorState, PageHeader, PageSkeleton } from '@/components/ui/layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/forms'
import { Pagination } from '@/components/ui/navigation'
import { ConfirmDialog, Modal } from '@/components/ui/overlay'
import { ProposalFormLoader } from '@/components/academic/ProposalForm'
import { ProposalSessionCard } from '@/components/academic/ProposalSessionCard'
import {
  useDeleteSubmissionMutation,
  useEnrolledSubjectsQuery,
  useMySubmissionsQuery,
} from '@/hooks/queries'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { SubmissionSessionSummaryDto } from '@/types'

const PAGE_SIZE = 12
const ALL_SUBJECTS = 'ALL'

type FormState = { mode: 'create' } | { mode: 'edit'; sessionId: number } | null

interface SubjectOptionItem {
  subject_id?: number
  code?: string
  subject_code?: string
  name?: string
  subject_name?: string
}

export default function ProposalsPage() {
  const { t } = useTranslation('academic')
  const [searchParams, setSearchParams] = useSearchParams()
  const subjectFilter = searchParams.get('subject') ?? ALL_SUBJECTS
  const [cursors, setCursors] = useState<string[]>([])
  const [formState, setFormState] = useState<FormState>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubmissionSessionSummaryDto | null>(null)

  const cursor = cursors.at(-1)
  const submissionsQuery = useMySubmissionsQuery({ cursor, limit: PAGE_SIZE })
  const subjectsQuery = useEnrolledSubjectsQuery()
  const deleteMutation = useDeleteSubmissionMutation()

  const pagination = submissionsQuery.data?.pagination
  const sessions = (submissionsQuery.data?.contents ?? []).filter(
    (session) => subjectFilter === ALL_SUBJECTS || String(session.subject_id) === subjectFilter
  )

  function changeSubject(value: string) {
    setSearchParams(value === ALL_SUBJECTS ? {} : { subject: value }, { replace: true })
  }

  function goToPage(page: number) {
    if (page > cursors.length + 1 && pagination?.after !== undefined) {
      setCursors((prev) => [...prev, String(pagination.after)])
    } else if (page <= cursors.length) {
      setCursors((prev) => prev.slice(0, page - 1))
    }
  }

  async function confirmDelete() {
    if (!deleteTarget?.session_id) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.session_id)
      toast.success(t('proposals.deleteSuccess'))
      setDeleteTarget(null)
    } catch (error) {
      toast.error(getApiError(error, t('proposals.deleteError')))
    }
  }

  function renderList() {
    if (submissionsQuery.isLoading) return <PageSkeleton rows={3} />
    if (submissionsQuery.isError) {
      return (
        <PageErrorState
          message={getApiError(submissionsQuery.error, t('proposals.loadError'))}
          onRetry={() => void submissionsQuery.refetch()}
        />
      )
    }
    if (sessions.length === 0) {
      return (
        <PageEmptyState
          title={t('proposals.empty.title')}
          description={t('proposals.empty.description')}
          action={<Button onClick={() => setFormState({ mode: 'create' })}>{t('proposals.create')}</Button>}
        />
      )
    }
    return (
      <Grid cols={1} smCols={2} lgCols={3} gap={4} as="section" aria-label={t('proposals.listLabel')}>
        {sessions.map((session) => (
          <ProposalSessionCard
            key={session.session_id}
            session={session}
            onEdit={(sessionId) => setFormState({ mode: 'edit', sessionId })}
            onDelete={setDeleteTarget}
          />
        ))}
      </Grid>
    )
  }

  return (
    <Page>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('proposals.title')}
        description={t('proposals.description')}
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => setFormState({ mode: 'create' })}>
            {t('proposals.create')}
          </Button>
        }
      />

      <Select value={subjectFilter} onValueChange={changeSubject}>
        <SelectTrigger aria-label={t('proposals.filter.label')} className="min-h-11 w-full sm:w-72">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_SUBJECTS}>{t('proposals.filter.all')}</SelectItem>
          {(subjectsQuery.data ?? []).map((subject) => {
            const item = subject as unknown as SubjectOptionItem
            return (
              <SelectItem key={item.subject_id} value={String(item.subject_id)}>
                {(item.code ?? item.subject_code)} - {(item.name ?? item.subject_name)}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {renderList()}

      {cursors.length > 0 || pagination?.has_next ? (
        <Pagination
          page={cursors.length + 1}
          totalPages={cursors.length + (pagination?.has_next ? 2 : 1)}
          onPageChange={goToPage}
        />
      ) : null}

      <Modal
        open={formState !== null}
        onClose={() => setFormState(null)}
        size="2xl"
        title={t(formState?.mode === 'edit' ? 'proposals.form.editTitle' : 'proposals.form.createTitle')}
      >
        {formState ? (
          <ProposalFormLoader
            editSessionId={formState.mode === 'edit' ? formState.sessionId : undefined}
            defaultSubjectId={subjectFilter === ALL_SUBJECTS ? undefined : subjectFilter}
            onDone={() => setFormState(null)}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t('proposals.deleteConfirm.title')}
        description={t('proposals.deleteConfirm.description', { title: deleteTarget?.title ?? '' })}
        confirmLabel={t('proposals.card.delete')}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </Page>
  )
}

