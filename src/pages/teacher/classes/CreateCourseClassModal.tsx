import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/overlay'
import { Form, FormField, Input, Select } from '@/components/ui/forms'
import { Button, SubmitButton } from '@/components/ui/actions'
import { useCreateCourseClassMutation } from '@/hooks/queries/useCourseQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { SubjectResponse } from '@/types'

interface CreateCourseClassModalProps {
  open: boolean
  subjects: SubjectResponse[]
  onClose: () => void
}

export function CreateCourseClassModal({
  open,
  subjects,
  onClose,
}: Readonly<CreateCourseClassModalProps>) {
  const { t } = useTranslation('academic')
  const [subjectId, setSubjectId] = useState('')
  const [classCode, setClassCode] = useState('')
  const [errors, setErrors] = useState<{ subjectId?: string; classCode?: string }>({})
  const createMutation = useCreateCourseClassMutation()

  const subjectOptions = subjects
    .filter((item) => item.subject_id != null)
    .map((item) => ({
      value: String(item.subject_id),
      label: `${item.code ?? ''} · ${item.name ?? ''}`.trim(),
    }))

  function handleClose() {
    setSubjectId('')
    setClassCode('')
    setErrors({})
    onClose()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors: { subjectId?: string; classCode?: string } = {}
    const parsedSubjectId = Number(subjectId)
    const trimmedCode = classCode.trim()

    if (!Number.isInteger(parsedSubjectId) || parsedSubjectId <= 0) {
      nextErrors.subjectId = t('teacher.classes.createModal.subjectRequired')
    }
    if (!trimmedCode) {
      nextErrors.classCode = t('teacher.classes.createModal.classCodeRequired')
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      const created = await createMutation.mutateAsync({
        subject_id: parsedSubjectId,
        class_code: trimmedCode,
      })
      toast.success(
        t('teacher.classes.createModal.success', { code: created.class_code ?? trimmedCode })
      )
      handleClose()
    } catch (error) {
      toast.error(getApiError(error, t('teacher.classes.createModal.error')))
    }
  }

  return (
    <Modal open={open} title={t('teacher.classes.createModal.title')} size="md" onClose={handleClose}>
      <Form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label={t('teacher.classes.createModal.subjectLabel')}
          error={errors.subjectId}
          required
        >
          <Select
            ariaLabel={t('teacher.classes.createModal.subjectLabel')}
            value={subjectId}
            placeholder={t('teacher.classes.createModal.subjectPlaceholder')}
            options={subjectOptions}
            onValueChange={(value) => {
              setSubjectId(value)
              setErrors((prev) => ({ ...prev, subjectId: undefined }))
            }}
          />
        </FormField>

        <FormField
          label={t('teacher.classes.createModal.classCodeLabel')}
          error={errors.classCode}
          required
        >
          <Input
            value={classCode}
            placeholder={t('teacher.classes.createModal.classCodePlaceholder')}
            onChange={(event) => {
              setClassCode(event.target.value)
              setErrors((prev) => ({ ...prev, classCode: undefined }))
            }}
          />
        </FormField>

        <footer className="flex items-center justify-end gap-2 pt-2 border-t border-line-subtle">
          <Button variant="outline" className="min-h-11" onClick={handleClose} disabled={createMutation.isPending}>
            {t('cancel')}
          </Button>
          <SubmitButton className="min-h-11" loading={createMutation.isPending}>
            {t('teacher.classes.createModal.submit')}
          </SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}
