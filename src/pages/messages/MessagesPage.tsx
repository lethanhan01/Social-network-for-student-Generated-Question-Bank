import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heading } from '@/components/ui/typography/Heading'
import { Button } from '@/components/ui/actions/Button'
import { useInfiniteConversationsQuery } from '@/hooks/queries/useMessengerQuery'
import { useCreateDirectConversationMutation } from '@/hooks/queries/useChatQuery'
import { QueryFeedback } from '@/components/social/QueryFeedback'
import { LoadMore } from '@/components/social/LoadMore'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { MessageThread } from './MessageThread'

function validId(raw: string | null) {
  return raw && /^[1-9]\d*$/.test(raw) && Number.isSafeInteger(Number(raw)) ? Number(raw) : 0
}
export default function MessagesPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const conversationId = validId(params.get('conversation'))
  const targetId = validId(params.get('userId'))
  const query = useInfiniteConversationsQuery()
  const create = useCreateDirectConversationMutation()
  const items = query.data?.pages.flatMap((page) => page.items ?? []) ?? []
  async function start() {
    if (!targetId || create.isPending) return
    try {
      const conversation = await create.mutateAsync({ target_user_id: targetId })
      if (!conversation.conversation_id) throw new Error(t('zone2.actionError'))
      setParams({ conversation: String(conversation.conversation_id) })
    } catch (cause) {
      toast.error(getApiError(cause, t('zone2.actionError')))
    }
  }
  return (
    <section className="space-y-5">
      <Heading level={1} className="text-2xl font-bold">
        {t('social.messages')}
      </Heading>
      {targetId ? (
        <Button
          loading={create.isPending}
          onClick={() => {
            void start()
          }}
        >
          {t('social.startConversation')}
        </Button>
      ) : null}
      <section className="grid gap-4 2xl:grid-cols-3">
        <nav aria-label={t('social.messages')} className="space-y-2">
          {query.isPending || (query.isError && !query.data) ? (
            <QueryFeedback pending={query.isPending} error={query.error} onRetry={query.refetch} />
          ) : null}
          {query.isSuccess && items.length === 0 ? (
            <p className="text-sm text-text-muted">{t('social.noConversations')}</p>
          ) : null}
          {items.map((item) => (
            <Button
              key={item.conversation_id}
              variant={conversationId === item.conversation_id ? 'secondary' : 'ghost'}
              className="min-h-14 w-full justify-start whitespace-normal text-left"
              onClick={() => setParams({ conversation: String(item.conversation_id) })}
            >
              {item.display_name ?? t('social.member')}
              {item.unread_count ? ` (${item.unread_count})` : ''}
            </Button>
          ))}
          <LoadMore query={query} />
        </nav>
        <section className="min-w-0 2xl:col-span-2">
          {conversationId ? (
            <MessageThread key={conversationId} id={conversationId} />
          ) : (
            <p>{t('social.chooseConversation')}</p>
          )}
        </section>
      </section>
    </section>
  )
}
