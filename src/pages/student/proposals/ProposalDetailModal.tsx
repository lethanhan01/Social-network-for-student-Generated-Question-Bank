import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/overlay/Modal'
import { ConfirmDialog } from '@/components/ui/overlay/ConfirmDialog'
import { Button } from '@/components/ui/actions/Button'
import { Card } from '@/components/ui/data-display/Card'
import { Heading } from '@/components/ui/typography/Heading'
import { Text } from '@/components/ui/typography/Text'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import { useMySubmissionDetailQuery } from '@/hooks/queries/useSessionsQuery'
import { useManageProposalMutation } from '@/hooks/queries/useAcademicQuery'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import { readSessionStatus, type AcademicSession, type AcademicSessionDetail } from '@/types/academic.types'
import type { SubjectResponse } from '@/types'
import { ProposalComposer } from './ProposalComposer'

export function ProposalDetailModal({ sessionId, summary, subjects, onClose }: Readonly<{
  sessionId: number; summary?: AcademicSession; subjects: SubjectResponse[]; onClose: () => void
}>) {
  const { t } = useTranslation('academic')
  const query = useMySubmissionDetailQuery(sessionId)
  const mutation = useManageProposalMutation()
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view')
  const detail: AcademicSessionDetail | undefined = query.data
  const editable = query.isSuccess && readSessionStatus({ status: detail?.status ?? summary?.status }) === 'PENDING'

  async function remove() {
    if (mutation.isPending || !editable) return
    try { await mutation.mutateAsync({ id: sessionId }); toast.success(t('proposals.deleted')); onClose() }
    catch (error) { toast.error(getApiError(error, t('saveError'))) }
  }

  if (mode === 'edit' && detail && editable) return <ProposalComposer subjects={subjects} detail={detail} onClose={() => setMode('view')} />
  return (
    <>
      <Modal open onClose={() => { if (!mutation.isPending) onClose() }} title={detail?.title ?? t('proposals.detail')} size="2xl"
        footer={<footer className="flex flex-wrap gap-2">
          {editable ? <Button variant="secondary" onClick={() => setMode('edit')}>{t('proposals.edit')}</Button> : null}
          {editable ? <Button variant="danger" onClick={() => setMode('delete')}>{t('proposals.delete')}</Button> : null}
          <Button variant="ghost" onClick={onClose}>{t('close')}</Button>
        </footer>}>
        {query.isPending ? <AcademicFeedback pending /> : query.isError ? <AcademicFeedback error={query.error} onRetry={query.refetch} /> : (
          <section className="space-y-4">
            <Text tone="muted">{detail?.subject_name}</Text>
            <Text className="whitespace-pre-wrap">{detail?.content}</Text>
            {(detail?.questions ?? []).map((question, index) => (
              <Card as="article" key={question.question_id ?? index} className="space-y-3 bg-surface-sunken">
                <Heading level={3} className="text-base font-semibold">{index + 1}. {question.content}</Heading>
                <ul className="space-y-2 text-sm">
                  {(question.options ?? []).map((option) => <li key={option.key}
                    className={option.is_correct ? 'font-semibold text-status-success-fg' : 'text-text-secondary'}>
                    {option.key}. {option.text}{option.is_correct ? ` · ${t('composer.correct')}` : ''}
                  </li>)}
                </ul>
                {question.explanation ? <Text size="sm" tone="muted">{question.explanation}</Text> : null}
              </Card>
            ))}
          </section>
        )}
      </Modal>
      <ConfirmDialog open={mode === 'delete'} onClose={() => { if (!mutation.isPending) setMode('view') }} title={t('proposals.delete')}
        description={t('proposals.deleteConfirm')} variant="danger" loading={mutation.isPending} onConfirm={remove} />
    </>
  )
}
