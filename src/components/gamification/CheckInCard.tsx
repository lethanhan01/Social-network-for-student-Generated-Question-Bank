import { CalendarCheck, Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Skeleton } from '@/components/ui/feedback'
import { Heading, Text } from '@/components/ui/typography'
import { useCheckInMutation, useCheckInStatusQuery } from '@/hooks/queries/useGamificationQuery'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import { formatDate } from '@/utils/date'

export function CheckInCard() {
  const { t } = useTranslation('gamification')
  const statusQuery = useCheckInStatusQuery()
  const checkInMutation = useCheckInMutation()

  const status = statusQuery.data
  const hasCheckedIn = Boolean(status?.has_checked_in_today)

  function handleCheckIn() {
    checkInMutation.mutate(undefined, {
      onSuccess: (result) => {
        toast.success(t('leaderboard.checkIn.success'), {
          description: t('leaderboard.checkIn.successDescription', {
            coins: result.coin_earned ?? 0,
            streak: result.current_streak ?? 0,
          }),
        })
      },
      onError: (error) => {
        toast.error(t('leaderboard.checkIn.error'), { description: getApiError(error) })
      },
    })
  }

  function renderStreak() {
    if (statusQuery.isLoading) {
      return <Skeleton className="h-12 w-32" />
    }
    if (statusQuery.isError) {
      return (
        <Text size="sm" tone="danger">
          {t('leaderboard.checkIn.loadError')}
        </Text>
      )
    }
    return (
      <p className="flex items-baseline gap-2">
        <strong className="text-4xl font-extrabold tracking-tight text-fg-primary">
          {status?.current_streak ?? 0}
        </strong>
        <Text as="span" size="sm" tone="muted">
          {t('leaderboard.checkIn.streakUnit')}
        </Text>
      </p>
    )
  }

  return (
    <Card as="section" aria-labelledby="check-in-heading" className="space-y-4">
      <header className="flex items-start gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Khung icon trang trí cố định kích thước] */}
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-status-warning-bg text-status-warning-fg"
        >
          <Flame size={22} />
        </span>
        <hgroup className="min-w-0">
          <Heading level={2} size="xs" id="check-in-heading">
            {t('leaderboard.checkIn.title')}
          </Heading>
          <Text size="sm" tone="muted">
            {hasCheckedIn ? t('leaderboard.checkIn.doneToday') : t('leaderboard.checkIn.notYet')}
          </Text>
        </hgroup>
      </header>

      {renderStreak()}

      {status?.last_check_in_date ? (
        <Text size="xs" tone="dim">
          {t('leaderboard.checkIn.lastDate', { date: formatDate(status.last_check_in_date) })}
        </Text>
      ) : null}

      <Button
        variant="primary"
        size="lg"
        fullWidth
        leftIcon={<CalendarCheck size={18} />}
        disabled={hasCheckedIn || statusQuery.isLoading || statusQuery.isError}
        loading={checkInMutation.isPending}
        onClick={handleCheckIn}
      >
        {hasCheckedIn ? t('leaderboard.checkIn.done') : t('leaderboard.checkIn.action')}
      </Button>
    </Card>
  )
}
