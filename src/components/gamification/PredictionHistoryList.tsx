import { useTranslation } from 'react-i18next'
import { Badge, Card } from '@/components/ui/data-display'
import { PageEmptyState, PageErrorState, PageSkeleton } from '@/components/ui/layout'
import { Heading, Text } from '@/components/ui/typography'
import { useMyPredictionsQuery } from '@/hooks/queries/useGamificationQuery'
import { getApiError } from '@/lib/api-error'
import { formatDateTime } from '@/utils/date'
import type { Tone } from '@/lib/variants'
import type { GamePredictionResponse } from '@/types'

type GameType = NonNullable<GamePredictionResponse['game_type']>
type SummarizedGame = 'GAME_1_PARTICIPANTS' | 'GAME_4_SUBJECT_BANK_SIZE' | 'GAME_6_LLM_IDENTIFICATION'

const PREDICTION_FIELDS: Record<SummarizedGame, string> = {
  GAME_1_PARTICIPANTS: 'predicted_count',
  GAME_4_SUBJECT_BANK_SIZE: 'predicted_bank_size',
  GAME_6_LLM_IDENTIFICATION: 'selected_llm_question_ids',
}

function isSummarizedGame(gameType: GameType): gameType is SummarizedGame {
  return gameType in PREDICTION_FIELDS
}

function getPredictionValue(prediction: GamePredictionResponse): number | undefined {
  const gameType = prediction.game_type
  if (!gameType || !isSummarizedGame(gameType)) return undefined
  const raw = prediction.prediction_data?.[PREDICTION_FIELDS[gameType]]
  if (Array.isArray(raw)) return raw.length
  return typeof raw === 'number' ? raw : undefined
}

function getStatusTone(prediction: GamePredictionResponse): Tone {
  if (prediction.status !== 'RESOLVED') return 'warning'
  return prediction.is_correct ? 'success' : 'danger'
}

function PredictionHistoryItem({ prediction }: Readonly<{ prediction: GamePredictionResponse }>) {
  const { t } = useTranslation('gamification')
  const gameType = prediction.game_type
  const value = getPredictionValue(prediction)

  function getStatusLabel() {
    if (prediction.status !== 'RESOLVED') return t('minigames.history.status.PENDING')
    if (prediction.is_correct === undefined) return t('minigames.history.status.RESOLVED')
    return prediction.is_correct ? t('minigames.history.correct') : t('minigames.history.wrong')
  }

  return (
    <Card as="article" variant="compact" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <section className="min-w-0 space-y-0.5">
        <Text size="sm" weight="semibold">
          {gameType ? t(`minigames.gameType.${gameType}`) : '—'}
        </Text>
        {gameType && isSummarizedGame(gameType) && value !== undefined ? (
          <Text size="sm" tone="muted">
            {t(`minigames.history.prediction.${gameType}`, { value })}
          </Text>
        ) : null}
        <Text size="xs" tone="dim">
          {t('minigames.history.predictedAt', { date: formatDateTime(prediction.created_at) })}
        </Text>
      </section>
      <Badge tone={getStatusTone(prediction)} size="sm" className="self-start sm:self-center">
        {getStatusLabel()}
      </Badge>
    </Card>
  )
}

export function PredictionHistoryList() {
  const { t } = useTranslation('gamification')
  const historyQuery = useMyPredictionsQuery()
  const predictions = historyQuery.data?.contents ?? []

  function renderBody() {
    if (historyQuery.isLoading) {
      return <PageSkeleton rows={3} />
    }
    if (historyQuery.isError) {
      return (
        <PageErrorState
          message={getApiError(historyQuery.error, t('minigames.history.error'))}
          onRetry={() => void historyQuery.refetch()}
        />
      )
    }
    if (predictions.length === 0) {
      return (
        <PageEmptyState title={t('minigames.history.empty')} description={t('minigames.history.emptyDescription')} />
      )
    }
    return (
      <ol className="space-y-2">
        {predictions.map((prediction) => (
          <li key={prediction.prediction_id ?? prediction.created_at}>
            <PredictionHistoryItem prediction={prediction} />
          </li>
        ))}
      </ol>
    )
  }

  return (
    <section aria-labelledby="prediction-history-heading" className="space-y-3">
      <Heading level={2} size="sm" id="prediction-history-heading">
        {t('minigames.history.title')}
      </Heading>
      {renderBody()}
    </section>
  )
}
