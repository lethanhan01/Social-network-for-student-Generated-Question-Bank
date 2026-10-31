import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LockKeyhole, Plus, MessageCircle } from 'lucide-react'
import { Page, PageHeader } from '@/components/ui/layout'
import { Button, ButtonLink } from '@/components/ui/actions'
import { EmptyState } from '@/components/ui/feedback/EmptyState'
import { ConversationList } from '@/components/portal/ConversationList'
import { MessageThread } from '@/components/portal/MessageThread'
import { GroupSettingsModal } from '@/components/portal/GroupSettingsModal'
import { NewConversationModal } from '@/components/portal/NewConversationModal'
import { ReportModal } from '@/components/social/ReportPostModal'
import { useInboxQuery } from '@/hooks/queries/usePortalQuery'
import { useChatRealtime } from '@/hooks/useChatRealtime'

export function Inbox({ hidden = false }: { hidden?: boolean }) {
  const { t } = useTranslation('portal')
  const [params, setParams] = useSearchParams()
  const selected = Number(params.get('conversation')) || 0
  const [isGroupOpen, setIsGroupOpen] = useState(false)
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [reportId, setReportId] = useState<number | null>(null)
  const query = useInboxQuery(hidden)
  const connected = useChatRealtime()
  const items = [
    ...new Map(query.data?.pages.flatMap((p) => p.items ?? []).map((item) => [item.conversation_id, item])).values(),
  ]
  const conversation = items.find((item) => item.conversation_id === selected)
  function handleSelect(id: number) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (id > 0) next.set('conversation', String(id))
      else next.delete('conversation')
      return next
    })
  }
  return (
    <>
      <section className="portal-inbox" aria-label={t(hidden ? 'vault.title' : 'messages.title')}>
        <ConversationList
          onNew={!hidden ? () => setIsNewOpen(true) : undefined}
          items={items}
          selected={conversation ? selected : 0}
          onSelect={handleSelect}
          loading={query.isLoading}
          error={query.error}
          retry={() => void query.refetch()}
          hasMore={!!query.hasNextPage}
          loadingMore={query.isFetchingNextPage}
          loadMore={() => void query.fetchNextPage()}
        />
        {conversation ? (
          <MessageThread
            key={conversation.conversation_id}
            conversation={conversation}
            hidden={hidden}
            connected={connected}
            onBack={() => handleSelect(0)}
            onSettings={() => setIsGroupOpen(true)}
            onReport={setReportId}
          />
        ) : (
          <section className="hidden md:flex flex-1 items-center justify-center p-4 md:p-8">
            <EmptyState
              icon={<MessageCircle size={36} />}
              title={t('messages.welcome')}
              description={t('messages.welcomeDescription')}
              action={
                !hidden ? (
                  <Button onClick={() => setIsNewOpen(true)}>
                    <Plus size={18} />
                    {t('messages.new')}
                  </Button>
                ) : undefined
              }
            />
          </section>
        )}
      </section>
      {!hidden ? (
        <Button variant="outline" className="mt-4 min-h-11 md:hidden" onClick={() => setIsNewOpen(true)}>
          <Plus size={18} />
          {t('messages.new')}
        </Button>
      ) : null}
      {isGroupOpen && conversation ? (
        <GroupSettingsModal
          conversation={conversation}
          onClose={() => setIsGroupOpen(false)}
          onLeft={() => {
            setIsGroupOpen(false)
            handleSelect(0)
          }}
        />
      ) : null}
      {isNewOpen ? (
        <NewConversationModal
          onClose={() => setIsNewOpen(false)}
          onCreated={(id) => {
            setIsNewOpen(false)
            handleSelect(id)
          }}
        />
      ) : null}
      {reportId ? <ReportModal isOpen targetType="USER" targetId={reportId} onClose={() => setReportId(null)} /> : null}
    </>
  )
}
export default function MessagesPage() {
  const { t } = useTranslation('portal')
  return (
    <Page>
      <PageHeader eyebrow={t('eyebrow')} title={t('messages.title')} description={t('messages.description')} />
      <nav className="mb-4 flex justify-end">
        <ButtonLink to="/messages/hidden-vault" variant="outline">
          <LockKeyhole size={18} />
          {t('vault.title')}
        </ButtonLink>
      </nav>
      <Inbox />
    </Page>
  )
}
