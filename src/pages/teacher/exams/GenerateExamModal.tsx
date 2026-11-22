import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/overlay'
import { Checkbox, Form, FormField, Input, NumberInput, Select, Switch } from '@/components/ui/forms'
import { Button, ButtonLink, SubmitButton } from '@/components/ui/actions'
import { Text } from '@/components/ui/typography'
import { useMyClassesQuery } from '@/hooks/queries/useCourseQuery'
import { useGenerateExamMutation } from '@/hooks/queries/useExamQuery'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { GenerateExamRequest, SubjectResponse } from '@/types'

interface GenerateExamModalProps {
  open: boolean
  subjects: SubjectResponse[]
  onGenerated: (examId?: number) => void
  onClose: () => void
}

const DIFFICULTY_FIELDS = [
  { field: 'easy', key: 'EASY' },
  { field: 'medium', key: 'MEDIUM' },
  { field: 'hard', key: 'HARD' },
  { field: 'unclassified', key: 'UNCLASSIFIED' },
] as const

interface FormErrors {
  subjectId?: string
  classIds?: string
  questionCount?: string
  difficulty?: string
}

export function GenerateExamModal({
  open,
  subjects,
  onGenerated,
  onClose,
}: Readonly<GenerateExamModalProps>) {
  const { t } = useTranslation('academic')
  const myClassesQuery = useMyClassesQuery(open)
  const generateMutation = useGenerateExamMutation()

  const [subjectId, setSubjectId] = useState('')
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([])
  const [title, setTitle] = useState('')
  const [questionCount, setQuestionCount] = useState(20)
  const [shuffleOptions, setShuffleOptions] = useState(true)
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true)
  const [useCustomDifficulty, setUseCustomDifficulty] = useState(false)
  const [difficultyPct, setDifficultyPct] = useState({ easy: 30, medium: 40, hard: 20, unclassified: 10 })
  const [errors, setErrors] = useState<FormErrors>({})

  const parsedSubjectId = Number(subjectId)
  const eligibleClasses = (myClassesQuery.data ?? []).filter(
    (cls) => cls.subject_id === parsedSubjectId && cls.course_class_id != null
  )
  const validSelectedClassIds = selectedClassIds.filter((id) =>
    eligibleClasses.some((cls) => cls.course_class_id === id)
  )
  const difficultySum =
    difficultyPct.easy + difficultyPct.medium + difficultyPct.hard + difficultyPct.unclassified

  const subjectOptions = subjects
    .filter((item) => item.subject_id != null)
    .map((item) => ({
      value: String(item.subject_id),
      label: `${item.code ?? ''} · ${item.name ?? ''}`.trim(),
    }))

  function handleSubjectChange(nextVal: string) {
    setSubjectId(nextVal)
    const nextId = Number(nextVal)
    const matching = (myClassesQuery.data ?? []).filter(
      (cls) => cls.subject_id === nextId && cls.course_class_id != null
    )
    setSelectedClassIds(matching.length === 1 ? [matching[0].course_class_id!] : [])
    setErrors((prev) => ({ ...prev, subjectId: undefined, classIds: undefined }))
  }

  function handleToggleClass(classId: number, checked: boolean) {
    setSelectedClassIds((prev) =>
      checked ? Array.from(new Set([...prev, classId])) : prev.filter((item) => item !== classId)
    )
    setErrors((prev) => ({ ...prev, classIds: undefined }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors: FormErrors = {}
    if (!Number.isInteger(parsedSubjectId) || parsedSubjectId <= 0) {
      nextErrors.subjectId = t('teacher.exams.generateModal.subjectRequired')
    }
    if (validSelectedClassIds.length === 0) {
      nextErrors.classIds = t('teacher.exams.generateModal.classesRequired')
    }
    if (!Number.isFinite(questionCount) || questionCount < 1) {
      nextErrors.questionCount = t('teacher.exams.generateModal.questionCountInvalid')
    }
    if (useCustomDifficulty && difficultySum !== 100) {
      nextErrors.difficulty = t('teacher.exams.generateModal.difficultySumInvalid')
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const payload: GenerateExamRequest = {
      subject_id: parsedSubjectId,
      class_ids: validSelectedClassIds,
      question_count: Math.round(questionCount),
      shuffle_options: shuffleOptions,
      include_answer_key: includeAnswerKey,
      ...(title.trim() ? { title: title.trim() } : {}),
      ...(useCustomDifficulty
        ? {
            difficulty_distribution: {
              easy: difficultyPct.easy / 100,
              medium: difficultyPct.medium / 100,
              hard: difficultyPct.hard / 100,
              unclassified: difficultyPct.unclassified / 100,
            },
          }
        : {}),
    }

    try {
      const created = await generateMutation.mutateAsync(payload)
      toast.success(t('teacher.exams.generateModal.success'))
      onGenerated(created.exam_id)
    } catch (error) {
      toast.error(getApiError(error, t('teacher.exams.generateModal.error')))
    }
  }

  const missingClassesForChosenSubject = parsedSubjectId > 0 && !myClassesQuery.isPending && eligibleClasses.length === 0

  return (
    <Modal open={open} size="xl" title={t('teacher.exams.generateModal.title')} onClose={onClose}>
      <Form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label={t('teacher.exams.generateModal.subjectLabel')} error={errors.subjectId} required>
          <Select
            ariaLabel={t('teacher.exams.generateModal.subjectLabel')}
            value={subjectId}
            placeholder={t('teacher.exams.generateModal.subjectPlaceholder')}
            options={subjectOptions}
            onValueChange={handleSubjectChange}
          />
        </FormField>

        {parsedSubjectId > 0 ? (
          <fieldset className="space-y-2 border border-line-subtle rounded-xl p-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-fg-secondary px-1">
              {t('teacher.exams.generateModal.classesLegend')}
            </legend>
            {missingClassesForChosenSubject ? (
              <section className="space-y-2">
                <Text size="xs" tone="muted">{t('teacher.exams.generateModal.noClassesForSubject')}</Text>
                <ButtonLink to="/teacher/classes" variant="outline" size="sm" className="min-h-11">
                  {t('teacher.exams.generateModal.goCreateClass')}
                </ButtonLink>
              </section>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {eligibleClasses.map((cls) => (
                  <li key={cls.course_class_id}>
                    <Checkbox
                      checked={validSelectedClassIds.includes(cls.course_class_id!)}
                      label={`${cls.class_code ?? ''} (${cls.total_students ?? 0} SV)`}
                      onCheckedChange={(checked) => handleToggleClass(cls.course_class_id!, checked)}
                    />
                  </li>
                ))}
              </ul>
            )}
            {errors.classIds ? (
              <p role="alert" className="text-xs text-status-danger-fg font-medium">{errors.classIds}</p>
            ) : null}
          </fieldset>
        ) : null}

        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Two-column title and question count row] */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label={t('teacher.exams.generateModal.titleLabel')} className="sm:col-span-2">
            <Input value={title} placeholder={t('teacher.exams.generateModal.titlePlaceholder')} onChange={(event) => setTitle(event.target.value)} />
          </FormField>
          <FormField label={t('teacher.exams.generateModal.questionCountLabel')} error={errors.questionCount} required>
            <NumberInput min={1} max={200} value={questionCount} onChange={(value) => { setQuestionCount(value); setErrors((prev) => ({ ...prev, questionCount: undefined })) }} />
          </FormField>
        </div>

        <section className="flex flex-col gap-1">
          <Switch checked={shuffleOptions} onCheckedChange={setShuffleOptions} label={t('teacher.exams.generateModal.shuffleOptions')} />
          <Switch checked={includeAnswerKey} onCheckedChange={setIncludeAnswerKey} label={t('teacher.exams.generateModal.includeAnswerKey')} />
          <Switch
            checked={useCustomDifficulty}
            onCheckedChange={(checked) => { setUseCustomDifficulty(checked); setErrors((prev) => ({ ...prev, difficulty: undefined })) }}
            label={t('teacher.exams.generateModal.customDifficulty')}
            description={t('teacher.exams.generateModal.customDifficultyHint')}
          />
        </section>

        {useCustomDifficulty ? (
          <fieldset className="space-y-3 border border-line-subtle rounded-xl p-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-fg-secondary px-1">
              {t('teacher.exams.generateModal.difficultySum', { sum: difficultySum })}
            </legend>
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Four-column difficulty percentage grid] */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DIFFICULTY_FIELDS.map(({ field, key }) => (
                <FormField key={field} label={t(`teacher.exams.difficulty.${key}`)}>
                  <NumberInput min={0} max={100} value={difficultyPct[field]} onChange={(value) => { setDifficultyPct((prev) => ({ ...prev, [field]: value })); setErrors((prev) => ({ ...prev, difficulty: undefined })) }} />
                </FormField>
              ))}
            </div>
            {errors.difficulty ? <p role="alert" className="text-xs text-status-danger-fg font-medium">{errors.difficulty}</p> : null}
          </fieldset>
        ) : null}

        <footer className="flex items-center justify-end gap-2 pt-2 border-t border-line-subtle">
          <Button variant="outline" className="min-h-11" onClick={onClose} disabled={generateMutation.isPending}>{t('cancel')}</Button>
          <SubmitButton className="min-h-11" loading={generateMutation.isPending} disabled={missingClassesForChosenSubject}>{t('teacher.exams.generateModal.submit')}</SubmitButton>
        </footer>
      </Form>
    </Modal>
  )
}
