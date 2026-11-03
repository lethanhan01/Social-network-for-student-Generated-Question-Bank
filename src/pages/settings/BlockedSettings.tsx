import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar } from '@/components/ui/data-display/Avatar'
import { Button } from '@/components/ui/actions/Button'
import { EmptyState } from '@/components/ui/feedback/EmptyState'
import { QueryFeedback } from '@/components/portal/QueryFeedback'
import { PortalDialog } from '@/components/portal/PortalDialog'
import { useBlockedSettings } from '@/hooks/queries/useBlockedSettings'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import type { BlockedUserDto } from '@/types'

export function BlockedSettings() {
  const { t } = useTranslation('portal')
  const { query, mutation } = useBlockedSettings()
  const [selected, setSelected] = useState<BlockedUserDto | null>(null)
  async function handleUnblock() {
    if (!selected?.user_id) return
    try {
      await mutation.mutateAsync(selected.user_id)
      setSelected(null)
      toast.success(t('saved'))
    } catch (cause) {
      toast.error(getApiError(cause, t('error')))
    }
  }
  const items = query.data?.pages.flatMap((page) => page.items ?? []) ?? []
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">{t('blocked.title')}</h2>
      <p className="text-sm text-fg-secondary">{t('blocked.description')}</p>
      <QueryFeedback loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
      {!query.isLoading && !query.error && items.length === 0 ? <EmptyState title={t('blocked.empty')} /> : null}
      {items.map((item) => (
        <article key={item.user_id} className="flex gap-3 items-center border border-line-subtle rounded-xl p-4">
          <Avatar src={item.avatar_url} name={item.full_name} />
          <h3 className="flex-1 text-sm font-semibold">{item.full_name}</h3>
          <Button variant="outline" disabled={!item.user_id} onClick={() => setSelected(item)}>
            {t('blocked.unblock')}
          </Button>
        </article>
      ))}
      {query.hasNextPage ? (
        <Button variant="outline" loading={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>
          {t('more')}
        </Button>
      ) : null}
      {selected ? (
        <PortalDialog
          title={t('blocked.unblock')}
          description={t('blocked.confirm', { name: selected.full_name })}
          onClose={() => {
            if (!mutation.isPending) setSelected(null)
          }}
        >
          <footer className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelected(null)} disabled={mutation.isPending}>
              {t('cancel')}
            </Button>
            <Button loading={mutation.isPending} onClick={() => void handleUnblock()}>
              {t('confirm')}
            </Button>
          </footer>
        </PortalDialog>
      ) : null}
    </section>
  )
}
