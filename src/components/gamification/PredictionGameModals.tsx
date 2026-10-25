import { useTranslation } from 'react-i18next'
import {
  useGame1ClassesQuery,
  usePredictGame1Mutation,
  usePredictGame4Mutation,
  useSubjectListQuery,
} from '@/hooks/queries/useGamificationQuery'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import { NumberPredictionModal } from './NumberPredictionModal'

interface PredictionGameModalProps {
  open: boolean
  onClose: () => void
}

function usePredictionToasts() {
  const { t } = useTranslation('gamification')
  return {
    onSuccess: () => toast.success(t('minigames.success')),
    onError: (error: unknown) => toast.error(t('minigames.error'), { description: getApiError(error) }),
  }
}

export function Game1Modal({ open, onClose }: Readonly<PredictionGameModalProps>) {
  const { t } = useTranslation('gamification')
  const classesQuery = useGame1ClassesQuery(open)
  const predictMutation = usePredictGame1Mutation()
  const toasts = usePredictionToasts()

  const options = (classesQuery.data ?? []).map((courseClass) => ({
    value: String(courseClass.course_class_id),
    label: [courseClass.class_code, courseClass.subject_name].filter(Boolean).join(' · '),
    description: courseClass.already_predicted
      ? t('minigames.game1.alreadyPredicted', { count: courseClass.predicted_count ?? 0 })
      : courseClass.lecturer_name,
    disabled: Boolean(courseClass.already_predicted),
  }))

  return (
    <NumberPredictionModal
      open={open}
      onClose={onClose}
      formId="game1-prediction-form"
      title={t('minigames.game1.title')}
      description={t('minigames.game1.description')}
      targetLabel={t('minigames.game1.classLabel')}
      targetPlaceholder={t('minigames.game1.classPlaceholder')}
      targetRequiredMessage={t('minigames.game1.classRequired')}
      valueLabel={t('minigames.game1.countLabel')}
      valueInvalidMessage={t('minigames.game1.countInvalid')}
      options={options}
      optionsLoading={classesQuery.isLoading}
      emptyMessage={t('minigames.game1.noClasses')}
      submitting={predictMutation.isPending}
      onSubmit={(courseClassId, predictedCount, done) => {
        predictMutation.mutate(
          { course_class_id: courseClassId, predicted_count: predictedCount },
          {
            onSuccess: () => {
              toasts.onSuccess()
              done()
            },
            onError: toasts.onError,
          }
        )
      }}
    />
  )
}

export function Game4Modal({ open, onClose }: Readonly<PredictionGameModalProps>) {
  const { t } = useTranslation('gamification')
  const subjectsQuery = useSubjectListQuery(open)
  const predictMutation = usePredictGame4Mutation()
  const toasts = usePredictionToasts()

  const options = (subjectsQuery.data ?? []).map((subject) => ({
    value: String(subject.subject_id),
    label: [subject.code, subject.name].filter(Boolean).join(' · '),
  }))

  return (
    <NumberPredictionModal
      open={open}
      onClose={onClose}
      formId="game4-prediction-form"
      title={t('minigames.game4.title')}
      description={t('minigames.game4.description')}
      targetLabel={t('minigames.game4.subjectLabel')}
      targetPlaceholder={t('minigames.game4.subjectPlaceholder')}
      targetRequiredMessage={t('minigames.game4.subjectRequired')}
      valueLabel={t('minigames.game4.sizeLabel')}
      valueInvalidMessage={t('minigames.game4.sizeInvalid')}
      options={options}
      optionsLoading={subjectsQuery.isLoading}
      emptyMessage={t('minigames.game4.noSubjects')}
      submitting={predictMutation.isPending}
      onSubmit={(subjectId, predictedBankSize, done) => {
        predictMutation.mutate(
          { subject_id: subjectId, predicted_bank_size: predictedBankSize },
          {
            onSuccess: () => {
              toasts.onSuccess()
              done()
            },
            onError: toasts.onError,
          }
        )
      }}
    />
  )
}
