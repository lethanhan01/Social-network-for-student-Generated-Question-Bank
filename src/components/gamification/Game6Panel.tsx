import { useState } from 'react'
import { Bot, Lock, Unlock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge, Card } from '@/components/ui/data-display'
import { Skeleton } from '@/components/ui/feedback'
import { Heading, Text } from '@/components/ui/typography'
import { useGame6ActiveSessionQuery } from '@/hooks/queries/useGamificationQuery'
import { msUntilNextSaturday, splitDurationDaysHours } from '@/utils/date'
import { Game6QuestionForm } from './Game6QuestionForm'

export function Game6Panel() {
  const { t } = useTranslation('gamification')
  const sessionQuery = useGame6ActiveSessionQuery()
  // Chốt thời điểm hiện tại một lần để render thuần
  const [now] = useState(() => new Date())

  const session = sessionQuery.data
  const isOpen = sessionQuery.isSuccess && (session?.questions ?? []).length > 0

  function renderLockedState() {
    const remainingMs = msUntilNextSaturday(now)
    const { days, hours } = splitDurationDaysHours(remainingMs)
    return (
      <section className="flex flex-col items-start gap-1 rounded-xl border border-dashed border-line-subtle bg-surface-sunken p-4">
        <Text size="sm" weight="medium">
          {t('minigames.game6.locked')}
        </Text>
        <Text size="sm" tone="muted">
          {remainingMs > 0
            ? t('minigames.game6.countdown', { days, hours })
            : t('minigames.game6.openingToday')}
        </Text>
      </section>
    )
  }

  function renderBody() {
    if (sessionQuery.isLoading) {
      return <Skeleton className="h-24 w-full" />
    }
    if (isOpen && session) {
      return <Game6QuestionForm session={session} />
    }
    return renderLockedState()
  }

  return (
    <Card as="article" aria-labelledby="game6-heading" className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <section className="flex items-start gap-3">
          <Bot size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-action-accent" />
          <hgroup>
            <Heading level={3} size="xs" id="game6-heading">
              {t('minigames.game6.title')}
            </Heading>
            <Text size="sm" tone="muted">
              {t('minigames.game6.description')}
            </Text>
          </hgroup>
        </section>
        {sessionQuery.isLoading ? null : (
          <Badge
            tone={isOpen ? 'success' : 'neutral'}
            size="sm"
            leftIcon={isOpen ? <Unlock size={12} /> : <Lock size={12} />}
          >
            {isOpen ? t('minigames.game6.openBadge') : t('minigames.game6.lockedBadge')}
          </Badge>
        )}
      </header>
      {renderBody()}
    </Card>
  )
}
