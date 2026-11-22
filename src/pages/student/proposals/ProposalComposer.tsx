import { useState, type ReactNode, type SubmitEvent } from 'react'
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
import type { AcademicSessionDetail, EnrolledCourseClass } from '@/types/academic.types'
import {
  buildProposalPayload,
  buildUpdateProposalPayload,
  createDraftQuestion,
  draftFromDetail,
  filterEligibleClasses,
  removeDraftQuestion,
  replaceDraftQuestion,
  resolveDefaultClassId,
  validateProposalDraft,
  type ProposalFormValues,
} from './proposal-draft'
import { QuestionDraftEditor } from './QuestionDraftEditor'

type ClassesQueryResult = ReturnType<typeof useEnrolledCourseClassesQuery>

function renderClassesFeedback(classes: ClassesQueryResult, eligibleCount: number, emptyMessage: string): ReactNode {
  if (classes.isPending) return <AcademicFeedback pending />
  if (classes.isError) return <AcademicFeedback error={classes.error} onRetry={classes.refetch} />
  if (eligibleCount === 0) return <AcademicFeedback empty={emptyMessage} />
  return null
}

function formatClassOption(item: EnrolledCourseClass) {
  return {
    value: String(item.course_class_id),
    label: `${item.subject_code} · ${item.subject_name} · ${item.class_code} · ${item.semester_name}`,
  }
}

interface ProposalComposerFormProps {
  eligible: EnrolledCourseClass[]
  subjectId?: number
  detail?: AcademicSessionDetail
  busy: boolean
  onClose: () => void
  onSubmitValues: (values: ProposalFormValues) => Promise<void>
}

function ProposalComposerForm({
  eligible,
  subjectId,
  detail,
  busy,
  onClose,
  onSubmitValues,
}: Readonly<ProposalComposerFormProps>) {
  const { t } = useTranslation('academic')
  const [title, setTitle] = useState(detail?.title ?? '')
  const [content, setContent] = useState(detail?.content ?? '')
  const [source, setSource] = useState(detail?.source_url ?? '')
  const [selected, setSelected] = useState(detail?.course_class_id ? String(detail.course_class_id) : '')
  const selectedClass = selected || resolveDefaultClassId(eligible, subjectId)
  const [questions, setQuestions] = useState(() => draftFromDetail(detail))
  const [error, setError] = useState('')
  const submitLabel = t(detail ? 'composer.save' : 'composer.send')

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const values: ProposalFormValues = { title, content, source, courseClassId: Number(selectedClass), questions }
    const validationError = validateProposalDraft(values, eligible)
    if (validationError) {
      setError(t(validationError))
      return
    }
    try {
      await onSubmitValues(values)
    } catch (cause) {
      setError(getApiError(cause, t('saveError')))
    }
  }

  return (
    <Form onSubmit={submit} noValidate onInput={() => setError('')} className="space-y-5">
      <fieldset disabled={busy} className="space-y-4">
        <FormField label={t('composer.courseClass')} required>
          <Select
            ariaLabel={t('composer.courseClass')}
            disabled={busy}
            value={selectedClass}
            placeholder={t('composer.chooseClass')}
            onValueChange={(value) => { setSelected(value); setError('') }}
            options={eligible.map(formatClassOption)}
          />
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
        {questions.map((question, index) => (
          <QuestionDraftEditor
            key={question.draftId}
            question={question}
            index={index}
            canRemove={questions.length > 1}
            onRemove={() => setQuestions((previous) => removeDraftQuestion(previous, question.draftId))}
            onChange={(next) => { setError(''); setQuestions((previous) => replaceDraftQuestion(previous, next)) }}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          leftIcon={<Plus size={18} />}
          onClick={() => setQuestions((previous) => [...previous, createDraftQuestion()])}
        >
          {t('composer.add')}
        </Button>
      </fieldset>
      {error ? <Text role="alert" className="text-status-danger-fg">{error}</Text> : null}
      <footer className="flex justify-end gap-2 border-t border-line-subtle pt-4">
        <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{t('cancel')}</Button>
        <SubmitButton loading={busy}>{submitLabel}</SubmitButton>
      </footer>
    </Form>
  )
}

export function ProposalComposer({ subjectId, detail, onClose }: Readonly<{
  subjectId?: number; detail?: AcademicSessionDetail; onClose: () => void
}>) {
  const { t } = useTranslation('academic')
  const create = useProposeSessionMutation()
  const update = useManageProposalMutation()
  const classes = useEnrolledCourseClassesQuery()
  const eligible = filterEligibleClasses(classes.data)
  const busy = create.isPending || update.isPending
  const modalTitle = t(detail ? 'composer.editTitle' : 'composer.title')
  const successMessage = t(detail ? 'composer.updated' : 'composer.created')
  const feedback = renderClassesFeedback(classes, eligible.length, t('composer.noSubjects'))

  async function handleSubmitValues(values: ProposalFormValues) {
    if (detail?.session_id) {
      await update.mutateAsync({ id: detail.session_id, payload: buildUpdateProposalPayload(values) })
    } else {
      await create.mutateAsync(buildProposalPayload(values))
    }
    toast.success(successMessage)
    onClose()
  }

  return (
    <Modal open onClose={() => { if (!busy) onClose() }} title={modalTitle} size="2xl">
      {feedback ?? (
        <ProposalComposerForm
          eligible={eligible}
          subjectId={subjectId}
          detail={detail}
          busy={busy}
          onClose={onClose}
          onSubmitValues={handleSubmitValues}
        />
      )}
    </Modal>
  )
}
