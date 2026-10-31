import { MessageBubble } from './MessageBubble'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Send, Settings, EyeOff, Eye, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/actions/Button'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import { Form, FormField, Textarea } from '@/components/ui/forms'
import { Avatar } from '@/components/ui/data-display/Avatar'
import { EmptyState } from '@/components/ui/feedback/EmptyState'
import { useMessagesQuery, usePortalMutation } from '@/hooks/queries/usePortalQuery'
import { chatService } from '@/services/chat.service'
import { webSocketService } from '@/services/websocket.service'
import { useAuthStore } from '@/stores/authStore'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'
import { QueryFeedback } from './QueryFeedback'
import { messageSchema } from './portal.schemas'
import type { ConversationDto } from '@/types'

interface Props {
  conversation: ConversationDto
  hidden: boolean
  connected: boolean
  onBack: () => void
  onSettings: () => void
  onReport: (userId: number) => void
}
export function MessageThread({ conversation, hidden, connected, onBack, onSettings, onReport }: Props) {
  const { t } = useTranslation('portal')
  const id = conversation.conversation_id ?? 0
  const query = useMessagesQuery(id, hidden)
  const userId = useAuthStore((s) => Number(s.user?.user_id ?? s.user?.userId))
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const end = useRef<HTMLParagraphElement>(null)
  const messages = [
    ...new Map(query.data?.pages.flatMap((p) => p.messages ?? []).map((m) => [m.message_id, m])).values(),
  ].sort((a, b) => (a.message_id ?? 0) - (b.message_id ?? 0))
  const lastId = messages.at(-1)?.message_id
  const visibility = usePortalMutation(() =>
    hidden ? chatService.unhideConversation(id) : chatService.hideConversation(id)
  )
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
    if (lastId && connected) webSocketService.markAsRead({ conversation_id: id, message_id: lastId })
  }, [id, lastId, connected])
  function handleSend() {
    const result = messageSchema.safeParse(draft)
    if (!result.success) {
      setError(t('messages.invalid'))
      return
    }
    if (!webSocketService.connected) {
      setError(t('messages.offline'))
      return
    }
    webSocketService.sendMessage({ conversation_id: id, content: result.data, message_type: 'TEXT' })
    setDraft('')
  }
  async function handleVisibility() {
    try {
      await visibility.mutateAsync(undefined)
      onBack()
      toast.success(t('saved'))
    } catch (cause) {
      toast.error(getApiError(cause, t('error')))
    }
  }
  return (
    <section className="portal-thread" aria-label={conversation.display_name || t('messages.title')}>
      <header className="flex items-center gap-3 border-b border-line-subtle p-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 min-h-11 min-w-11 p-0 md:hidden"
          aria-label={t('back')}
          onClick={onBack}
        >
          <ArrowLeft size={20} />
        </Button>
        <Avatar src={conversation.display_avatar_url} name={conversation.display_name} />
        <section className="flex-1 min-w-0">
          <h2 className="truncate font-bold">{conversation.display_name || t('messages.untitled')}</h2>
          <p role="status" className="truncate text-xs text-fg-secondary">
            {t(connected ? 'messages.connected' : 'messages.offline')}
          </p>
        </section>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 min-h-11 min-w-11 p-0"
          aria-label={t(hidden ? 'messages.unhide' : 'messages.hide')}
          loading={visibility.isPending}
          onClick={() => void handleVisibility()}
        >
          {hidden ? <Eye size={19} /> : <EyeOff size={19} />}
        </Button>
        {conversation.type === 'GROUP' ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 min-h-11 min-w-11 p-0"
            aria-label={t('group.title')}
            onClick={onSettings}
          >
            <Settings size={19} />
          </Button>
        ) : null}
      </header>
      <section className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" aria-label={t('messages.history')}>
        <QueryFeedback loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
        {query.hasNextPage ? (
          <Button variant="ghost" loading={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>
            {t('messages.older')}
          </Button>
        ) : null}
        {!query.isLoading && !query.error && messages.length === 0 ? (
          <EmptyState icon={<MessageCircle />} title={t('messages.noMessages')} description={t('messages.sayHello')} />
        ) : null}
        {messages.map((message) => (
          <MessageBubble key={message.message_id} message={message} userId={userId} onReport={onReport} />
        ))}
        <p ref={end} aria-hidden="true" />
      </section>
      <Form
        noValidate
        aria-label={t('messages.compose')}
        onSubmit={handleSend}
        className="flex items-end gap-3 p-4 border-t border-line-subtle"
      >
        <FormField label={t('messages.compose')} error={error}>
          <Textarea
            aria-label={t('messages.compose')}
            rows={2}
            maxLength={5000}
            value={draft}
            placeholder={t('messages.placeholder')}
            onChange={(e) => {
              setDraft(e.target.value)
              setError('')
            }}
          />
        </FormField>
        <SubmitButton
          disabled={!connected || !draft.trim()}
          aria-label={t('messages.send')}
          className="min-h-11 min-w-11"
        >
          <Send size={18} />
        </SubmitButton>
      </Form>
    </section>
  )
}
