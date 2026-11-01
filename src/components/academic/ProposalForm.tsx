import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, SubmitButton } from '@/components/ui/actions'
import {
  Form,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui/forms'
import { Skeleton } from '@/components/ui/feedback'
import { Flex } from '@/components/ui/layout'
import {
  useEnrolledSubjectsQuery,
  useMySubmissionDetailQuery,
  useProposeSessionMutation,
  useUpdateSubmissionMutation,
} from '@/hooks/queries'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { ProposalQuestionFields } from './ProposalQuestionFields'
import {
  createEmptyDraft,
  createQuestionDraft,
  draftFromDetail,
  toProposeRequest,
  toUpdateRequest,
  validateDraft,
  type ProposalDraft,
  type ProposalErrors,
  type QuestionDraft,
} from './proposal-form-utils'

interface ProposalFormProps {
  initialDraft: ProposalDraft
  editSessionId?: number
  onDone: () => void
}

export function ProposalForm({ initialDraft, editSessionId, onDone }: Readonly<ProposalFormProps>) {
  const { t } = useTranslation('academic')
  const [draft, setDraft] = useState(initialDraft)
  const [errors, setErrors] = useState<ProposalErrors>({})
  const subjectsQuery = useEnrolledSubjectsQuery()
  const proposeMutation = useProposeSessionMutation()
  const updateMutation = useUpdateSubmissionMutation()
  const isEdit = editSessionId !== undefined
  const pending = proposeMutation.isPending || updateMutation.isPending
  const subjects = subjectsQuery.data ?? []

  function clearError(...keys: string[]) {
    setErrors((prev) => {
      if (keys.every((key) => !(key in prev))) return prev
      const next = { ...prev }
      keys.forEach((key) => delete next[key])
      return next
    })
  }

  function patchDraft(patch: Partial<ProposalDraft>, errorKey?: string) {
    setDraft((prev) => ({ ...prev, ...patch }))
    if (errorKey) clearError(errorKey)
  }

  function patchQuestion(uid: string, patch: Partial<QuestionDraft>) {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question) => (question.uid === uid ? { ...question, ...patch } : question)),
    }))
    clearError(`${uid}.content`, `${uid}.options`, `${uid}.correct`)
  }

  function addQuestion() {
    setDraft((prev) => ({ ...prev, questions: [...prev.questions, createQuestionDraft()] }))
    clearError('questions')
  }

  function removeQuestion(uid: string) {
    setDraft((prev) => ({ ...prev, questions: prev.questions.filter((question) => question.uid !== uid) }))
  }

  async function handleSubmit() {
    const found = validateDraft(draft)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ sessionId: editSessionId, payload: toUpdateRequest(draft) })
        toast.success(t('proposals.form.updateSuccess'))
      } else {
        await proposeMutation.mutateAsync(toProposeRequest(draft))
        toast.success(t('proposals.form.createSuccess'))
      }
      onDone()
    } catch (error) {
      toast.error(getApiError(error, t('proposals.form.submitError')))
    }
  }

  return (
    <Form onSubmit={handleSubmit} noValidate aria-label={t(isEdit ? 'proposals.form.editTitle' : 'proposals.form.createTitle')} className="space-y-5">
      <FormField
        label={t('proposals.form.subject')}
        required
        error={errors.subject ? t(`proposals.form.errors.${errors.subject}`) : null}
      >
        <Select
          value={draft.courseClassId ? `${draft.subjectId}:${draft.courseClassId}` : draft.subjectId}
          onValueChange={(value) => {
            const [sId, cId] = value.split(':')
            patchDraft({ subjectId: sId, courseClassId: cId || undefined }, 'subject')
          }}
        >
          <SelectTrigger aria-label={t('proposals.form.subject')} className="min-h-11">
            <SelectValue placeholder={t('proposals.form.subjectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => {
              const sId = String(subject.subject_id)
              const cId = (subject as any).course_class_id ? String((subject as any).course_class_id) : ''
              const val = cId ? `${sId}:${cId}` : sId
              const classCode = (subject as any).class_code ? ` [Lớp ${(subject as any).class_code}]` : ''
              return (
                <SelectItem key={val} value={val}>
                  {((subject as any).code ?? (subject as any).subject_code)} - {((subject as any).name ?? (subject as any).subject_name)}{classCode}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        label={t('proposals.form.title')}
        required
        error={errors.title ? t(`proposals.form.errors.${errors.title}`) : null}
      >
        <Input value={draft.title} onChange={(event) => patchDraft({ title: event.target.value }, 'title')} />
      </FormField>

      <FormField label={t('proposals.form.content')}>
        <Textarea rows={3} value={draft.content} onChange={(event) => patchDraft({ content: event.target.value })} />
      </FormField>

      <FormField
        label={t('proposals.form.sourceUrl')}
        hint={t('proposals.form.sourceUrlHint')}
        error={errors.sourceUrl ? t(`proposals.form.errors.${errors.sourceUrl}`) : null}
      >
        <Input
          type="url"
          inputMode="url"
          value={draft.sourceUrl}
          onChange={(event) => patchDraft({ sourceUrl: event.target.value }, 'sourceUrl')}
        />
      </FormField>

      {draft.questions.map((question, index) => (
        <ProposalQuestionFields
          key={question.uid}
          index={index}
          question={question}
          errors={errors}
          canRemove={draft.questions.length > 1}
          onChange={patchQuestion}
          onRemove={removeQuestion}
        />
      ))}
      {errors.questions ? (
        <p role="alert" className="text-xs text-status-danger-fg">
          {t(`proposals.form.errors.${errors.questions}`)}
        </p>
      ) : null}

      <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" leftIcon={<Plus size={16} />} onClick={addQuestion} disabled={pending}>
          {t('proposals.form.addQuestion')}
        </Button>
        <Flex align="center" justify="end" gap={3}>
          <Button type="button" variant="ghost" onClick={onDone} disabled={pending}>
            {t('common.cancel')}
          </Button>
          <SubmitButton loading={pending}>{t(isEdit ? 'proposals.form.saveChanges' : 'proposals.form.submit')}</SubmitButton>
        </Flex>
      </footer>
    </Form>
  )
}

interface ProposalFormLoaderProps {
  editSessionId?: number
  defaultSubjectId?: string
  onDone: () => void
}

/** Loads the session detail when editing, then mounts the form with its initial draft. */
export function ProposalFormLoader({ editSessionId, defaultSubjectId, onDone }: Readonly<ProposalFormLoaderProps>) {
  const { t } = useTranslation('academic')
  const detailQuery = useMySubmissionDetailQuery(editSessionId ?? 0)

  if (editSessionId === undefined) {
    return <ProposalForm initialDraft={createEmptyDraft(defaultSubjectId)} onDone={onDone} />
  }
  if (detailQuery.isError) {
    return (
      <p role="alert" className="text-sm text-status-danger-fg">
        {getApiError(detailQuery.error, t('proposals.form.loadError'))}
      </p>
    )
  }
  if (!detailQuery.data) {
    return <Skeleton height={240} rounded="xl" aria-label={t('common.loading')} />
  }
  return <ProposalForm initialDraft={draftFromDetail(detailQuery.data)} editSessionId={editSessionId} onDone={onDone} />
}
