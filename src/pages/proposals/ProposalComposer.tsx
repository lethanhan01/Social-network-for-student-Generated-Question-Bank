import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/overlay/Modal'
import { Form } from '@/components/ui/forms/Form'
import { FormField } from '@/components/ui/forms/FormField'
import { Input } from '@/components/ui/forms/Input'
import { Textarea } from '@/components/ui/forms/Textarea'
import { Select } from '@/components/ui/forms/Select'
import { Button } from '@/components/ui/actions/Button'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { Text } from '@/components/ui/typography/Text'
import { AcademicFeedback } from '@/components/academic/AcademicFeedback'
import { useEnrolledCourseClassesQuery, useProposeSessionMutation } from '@/hooks/queries/useSessionsQuery'
import { useManageProposalMutation } from '@/hooks/queries/useAcademicQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { SubjectResponse } from '@/types'
import type { AcademicSessionDetail } from '@/types/academic.types'
import { createDraftQuestion, draftFromDetail, validDraftQuestions } from './proposal-draft'
import { QuestionDraftEditor } from './QuestionDraftEditor'

export function ProposalComposer({ subjectId, detail, onClose }: Readonly<{
  subjects: SubjectResponse[]; subjectId?: number; detail?: AcademicSessionDetail; onClose: () => void;
  subjectsPending?: boolean; subjectsError?: unknown; retrySubjects?: () => unknown
}>) {
  const { t } = useTranslation('academic')
  const create = useProposeSessionMutation()
  const update = useManageProposalMutation()
  const classes = useEnrolledCourseClassesQuery()
  const eligible = (classes.data ?? []).filter((item) => item.can_propose === true && item.course_class_id)
  const preferred = eligible.filter((item) => item.subject_id === subjectId)
  const [title, setTitle] = useState(detail?.title ?? '')
  const [content, setContent] = useState(detail?.content ?? '')
  const [source, setSource] = useState(detail?.source_url ?? '')
  const [selected, setSelected] = useState(detail?.course_class_id ? String(detail.course_class_id) : '')
  const selectedClass = selected || (preferred.length === 1 ? String(preferred[0].course_class_id) : eligible.length === 1 ? String(eligible[0].course_class_id) : '')
  const [questions, setQuestions] = useState(() => draftFromDetail(detail))
  const [error, setError] = useState('')
  const busy = create.isPending || update.isPending

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (!title.trim() || !eligible.some((item) => item.course_class_id === Number(selectedClass)) || !validDraftQuestions(questions)) {
      setError(t('composer.invalid')); return
    }
    if (source.trim()) {
      try { const url = new URL(source); if (!['https:', 'http:'].includes(url.protocol)) throw new Error() }
      catch { setError(t('composer.invalidSource')); return }
    }
    const payload = { title: title.trim(), content: content.trim(), source_url: source.trim() || undefined,
      course_class_id: Number(selectedClass), questions: questions.map(({ draftId: _draftId, ...question }) => question) }
    try {
      if (detail?.session_id) await update.mutateAsync({ id: detail.session_id, payload: { ...payload,
        questions: payload.questions.map(({ llm_generated, ...question }) => ({ ...question, source: llm_generated ? 'LLM' : 'HOMO_SAPIENS' })) } })
      else await create.mutateAsync(payload)
      toast.success(t(detail ? 'composer.updated' : 'composer.created'))
      onClose()
    } catch (cause) { setError(getApiError(cause, t('saveError'))) }
  }

  return (
    <Modal open onClose={() => { if (!busy) onClose() }} title={t(detail ? 'composer.editTitle' : 'composer.title')} size="2xl">
      {classes.isPending ? <AcademicFeedback pending /> : classes.isError ? <AcademicFeedback error={classes.error} onRetry={classes.refetch} /> : eligible.length === 0 ? (
        <AcademicFeedback empty={t('composer.noSubjects')} />
      ) : (
        <Form onSubmit={submit} noValidate onInput={() => setError('')} className="space-y-5">
          <fieldset disabled={busy} className="space-y-4">
            <FormField label={t('composer.courseClass')} required>
              <Select ariaLabel={t('composer.courseClass')} disabled={busy} value={selectedClass} placeholder={t('composer.chooseClass')}
                onValueChange={(value) => { setSelected(value); setError('') }}
                options={eligible.map((item) => ({ value: String(item.course_class_id), label: `${item.subject_code} · ${item.subject_name} · ${item.class_code} · ${item.semester_name}` }))} />
            </FormField>
            <FormField label={t('composer.sessionTitle')} required>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </FormField>
            <FormField label={t('composer.description')}>
              <Textarea value={content} onChange={(event) => setContent(event.target.value)} rows={2} />
            </FormField>
            <FormField label={t('composer.source')}>
              <Input type="url" value={source} onChange={(event) => setSource(event.target.value)} />
            </FormField>
            {questions.map((question, index) => <QuestionDraftEditor key={question.draftId} question={question} index={index}
              canRemove={questions.length > 1} onRemove={() => setQuestions((previous) => previous.filter((item) => item.draftId !== question.draftId))}
              onChange={(next) => { setError(''); setQuestions((previous) => previous.map((item) => item.draftId === next.draftId ? next : item)) }} />)}
            <Button type="button" variant="outline" className="w-full" leftIcon={<Plus size={18} />}
              onClick={() => setQuestions((previous) => [...previous, createDraftQuestion()])}>{t('composer.add')}</Button>
          </fieldset>
          {error ? <Text role="alert" className="text-status-danger-fg">{error}</Text> : null}
          <footer className="flex justify-end gap-2 border-t border-line-subtle pt-4">
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{t('cancel')}</Button>
            <SubmitButton loading={busy}>{t(detail ? 'composer.save' : 'composer.send')}</SubmitButton>
          </footer>
        </Form>
      )}
    </Modal>
  )
}
