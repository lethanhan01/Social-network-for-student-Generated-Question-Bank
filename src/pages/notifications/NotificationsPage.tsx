import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, CheckCheck, Settings2 } from 'lucide-react'
import { Page, PageHeader } from '@/components/ui/layout'
import { Button, ButtonLink } from '@/components/ui/actions'
import { Avatar } from '@/components/ui/data-display/Avatar'
import { Card } from '@/components/ui/data-display/Card'
import { EmptyState } from '@/components/ui/feedback/EmptyState'
import { SegmentedControl } from '@/components/ui/navigation'
import { QueryFeedback } from '@/components/portal/QueryFeedback'
import { useNotificationsQuery, usePortalMutation } from '@/hooks/queries/usePortalQuery'
import { notificationService } from '@/services/notification.service'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { formatDateTime } from '@/utils/date'
import { cn } from '@/utils/cn'
import { notificationPath } from './notification-target'
import type { NotificationDto } from '@/types'

export default function NotificationsPage() {
  const { t } = useTranslation('portal')
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const unreadOnly = params.get('filter') === 'unread'
  const query = useNotificationsQuery()
  const read = usePortalMutation((id: number) => notificationService.markAsRead(id), 'notifications')
  const readAll = usePortalMutation(() => notificationService.markAllAsRead(), 'notifications')
  const items = [
    ...new Map(query.data?.pages.flatMap((p) => p.items ?? []).map((item) => [item.notification_id, item])).values(),
  ]
  const visible = unreadOnly ? items.filter((item) => !item.read_at) : items
  async function handleOpen(item: NotificationDto) {
    try {
      if (!item.read_at && item.notification_id) await read.mutateAsync(item.notification_id)
      const path = notificationPath(item.target)
      if (path) navigate(path)
    } catch (cause) {
      toast.error(getApiError(cause, t('error')))
    }
  }
  async function handleReadAll() {
    try {
      await readAll.mutateAsync(undefined)
      toast.success(t('notifications.readSuccess'))
    } catch (cause) {
      toast.error(getApiError(cause, t('error')))
    }
  }
  return (
    <Page>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('notifications.title')}
        description={t('notifications.description')}
      />
      <section className="mx-auto w-full max-w-4xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <SegmentedControl
            size="sm"
            value={unreadOnly ? 'unread' : 'all'}
            options={(['all', 'unread'] as const).map((value) => ({ value, label: t(`notifications.${value}`) }))}
            onValueChange={(value) => setParams({ filter: value }, { replace: true })}
          />
          <nav className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              loading={readAll.isPending}
              disabled={!items.some((item) => !item.read_at)}
              onClick={() => void handleReadAll()}
            >
              <CheckCheck size={17} />
              {t('notifications.readAll')}
            </Button>
            <ButtonLink to="/settings?tab=notifications" variant="ghost" aria-label={t('notifications.settings')}>
              <Settings2 size={19} />
            </ButtonLink>
          </nav>
        </header>
        <Card as="section" className="overflow-hidden" padding="none">
          <QueryFeedback loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
          {!query.isLoading && !query.error && visible.length === 0 ? (
            <EmptyState
              icon={<Bell size={30} />}
              title={t('notifications.empty')}
              description={t('notifications.emptyDescription')}
            />
          ) : null}
          <ul className="divide-y divide-line-subtle">
            {visible.map((item) => (
              <li key={item.notification_id}>
                <Button
                  variant="ghost"
                  disabled={read.isPending}
                  onClick={() => void handleOpen(item)}
                  className={cn('portal-notification', !item.read_at ? 'bg-action-accent-soft' : '')}
                >
                  <Avatar src={item.actor?.avatar_url || item.icon_url} name={item.actor?.full_name || item.title} />
                  <section className="min-w-0 flex-1 text-left space-y-1">
                    <h2 className="text-sm font-bold">{item.title || t('notifications.title')}</h2>
                    <p className="text-sm text-fg-secondary whitespace-pre-wrap">{item.body}</p>
                    <p className="text-xs text-fg-muted">{formatDateTime(item.created_at)}</p>
                  </section>
                  {!item.read_at ? (
                    <strong className="text-xs text-action-accent">{t('notifications.new')}</strong>
                  ) : null}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
        {query.hasNextPage ? (
          <Button
            variant="outline"
            className="w-full"
            loading={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {t('more')}
          </Button>
        ) : null}
      </section>
    </Page>
  )
}
