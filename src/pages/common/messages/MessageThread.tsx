import { useEffect, useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Form } from '@/components/ui/forms/Form'
import { FormField } from '@/components/ui/forms/FormField'
import { Textarea } from '@/components/ui/forms/Textarea'
import { Button } from '@/components/ui/actions/Button'
import { SubmitButton } from '@/components/ui/actions/SubmitButton'
import {
  useInfiniteMessagesQuery,
  useRecallMessageMutation,
} from '@/hooks/queries/useMessengerQuery'
import { useAuthStore } from '@/stores/authStore'
import { webSocketService } from '@/services/websocket.service'
import { queryKeys } from '@/lib/query-keys'
import { QueryFeedback } from '@/components/social/QueryFeedback'
import { LoadMore } from '@/components/social/LoadMore'
import { formatDateTime } from '@/utils/date'
import { getApiError } from '@/lib/api-error'
import { toast } from '@/lib/toast'

export function MessageThread({ id }: Readonly<{ id: number }>) {
  const { t } = useTranslation()
  const client = useQueryClient()
  const query = useInfiniteMessagesQuery(id)
  const recall = useRecallMessageMutation(id)
  const userId = useAuthStore((state) => state.user?.user_id ?? Number(state.user?.userId))
  const [text, setText] = useState('')
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')
  const messages = [
    ...new Map(
      (query.data?.pages.flatMap((page) => page.messages ?? []) ?? []).map((message) => [
        message.message_id,
        message,
      ])
    ).values(),
  ].sort((a, b) => (a.message_id ?? 0) - (b.message_id ?? 0))
  useEffect(() => {
    const unsubscribe = webSocketService.onConnection(setConnected)
    const offMessage = webSocketService.onMessage((message) => {
      if (message.conversation_id === id)
        void client.invalidateQueries({ queryKey: queryKeys.conversations.infiniteMessages(id) })
      void client.invalidateQueries({ queryKey: queryKeys.conversations.infiniteList() })
    })
    webSocketService.connect()
    return () => {
      unsubscribe()
      offMessage()
    }
  }, [client, id])
  function send(event: FormEvent) {
    event.preventDefault()
    if (!text.trim()) return
    if (
      !webSocketService.sendMessage({
        conversation_id: id,
        content: text.trim(),
        message_type: 'TEXT',
      })
    ) {
      setError(t('social.connectionError'))
      return
    }
    setText('')
    setError('')
  }
  return (
    <section className="space-y-4 rounded-2xl bg-surface p-4">
      {query.isPending || (query.isError && !query.data) ? (
        <QueryFeedback pending={query.isPending} error={query.error} onRetry={query.refetch} />
      ) : null}
      <LoadMore query={query} />
      <section
        aria-label={t('social.messages')}
        aria-live="polite"
        className="max-h-96 space-y-3 overflow-y-auto"
      >
        {messages.map((message) => (
          <article
            key={message.message_id}
            className={`max-w-full space-y-2 rounded-xl p-3 ${message.sender_id === userId ? 'ml-auto bg-action-accent-soft' : 'bg-surface-hover'}`}
          >
            <header className="flex flex-wrap justify-between gap-2 text-xs text-text-muted">
              <strong>{message.sender_name}</strong>
              <time>{formatDateTime(message.created_at)}</time>
            </header>
            <p className="whitespace-pre-wrap break-words text-sm">
              {message.revoked ? t('social.revoked') : message.content}
            </p>
            {!message.revoked && message.message_id ? (
              <Button
                variant="ghost"
                disabled={recall.isPending}
                onClick={() =>
                  recall.mutate(
                    {
                      messageId: message.message_id!,
                      mode: message.sender_id === userId ? 'EVERYONE' : 'ME',
                    },
                    { onError: (cause) => toast.error(getApiError(cause, t('zone2.actionError'))) }
                  )
                }
              >
                {t(message.sender_id === userId ? 'social.recall' : 'social.hideMessage')}
              </Button>
            ) : null}
          </article>
        ))}
      </section>
      {query.isSuccess && messages.length === 0 ? <p>{t('social.noMessages')}</p> : null}
      {!connected ? (
        <p role="status" className="text-sm text-text-muted">
          {t('social.connecting')}
        </p>
      ) : null}
      <Form onSubmit={send} noValidate className="space-y-3">
        <FormField label={t('social.messageInput')} error={error}>
          <Textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setError('')
            }}
            rows={2}
            maxLength={4000}
          />
        </FormField>
        <SubmitButton disabled={!connected || !text.trim()}>{t('social.send')}</SubmitButton>
      </Form>
    </section>
  )
}
