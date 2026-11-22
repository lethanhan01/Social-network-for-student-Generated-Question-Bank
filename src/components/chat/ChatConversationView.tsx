import { lazy, Suspense, useState, useRef, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, SquarePen, AlertCircle } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback/EmptyState'
import { Button } from '@/components/ui/actions/Button'
import { ConfirmDialog } from '@/components/ui/overlay/ConfirmDialog'
import {
  useConversationMessagesInfiniteQuery,
  useRecallMessageMutation,
  useSendMessageMutation,
  useAutoMarkAsRead,
  resolveCurrentUserId,
} from '@/hooks/queries/useChatQuery'
import { useInfiniteConversationsQuery } from '@/hooks/queries/useMessengerQuery'
import { type WsConnectionStatus } from '@/services/websocket.service'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import type { MessageDto } from '@/types'
import { ChatMessageList } from './ChatMessageList'
import { ChatConversationHeader } from './ChatConversationHeader'
import { ChatComposer } from './ChatComposer'
import { cn } from '@/utils/cn'

const LazyChatPortalActions = lazy(() =>
  import('@/components/portal/ChatPortalActions').then((m) => ({ default: m.ChatPortalActions }))
)

interface ChatConversationViewProps {
  conversationId?: number
  onBackToList?: () => void
  onOpenNewChat: () => void
  connectionStatus: WsConnectionStatus
  typingUsers: Record<number, string>
  onSendTyping: (isTyping: boolean) => void
}

export function ChatConversationView({
  conversationId,
  onBackToList,
  onOpenNewChat,
  connectionStatus,
  typingUsers,
  onSendTyping,
}: Readonly<ChatConversationViewProps>) {
  const { t } = useTranslation('chat')
  const { t: tp } = useTranslation('portal')
  const currentUserId = useAuthStore((state) => resolveCurrentUserId(state.user))
  const [replyTo, setReplyTo] = useState<MessageDto | null>(null)
  const [recallTarget, setRecallTarget] = useState<MessageDto | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const detailsTrigger = useRef<HTMLButtonElement>(null)
  const focusDetails = useCallback((panel: HTMLElement | null) => panel?.focus(), [])
  const closeDetails = useCallback(() => {
    setIsDetailsOpen(false)
    requestAnimationFrame(() => detailsTrigger.current?.focus())
  }, [])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: convListData } = useInfiniteConversationsQuery()
  const activeConv = useMemo(
    () =>
      convListData?.pages
        .flatMap((page) => page.items ?? [])
        .find((c) => c.conversation_id === conversationId),
    [convListData, conversationId]
  )

  const messagesQuery = useConversationMessagesInfiniteQuery(conversationId ?? 0)
  const recallMutation = useRecallMessageMutation()
  const sendMessageMutation = useSendMessageMutation()

  useAutoMarkAsRead(conversationId, activeConv?.unread_count, activeConv?.last_message?.message_id)

  const allMessages = useMemo(() => {
    if (!messagesQuery.data?.pages) return []
    const list: MessageDto[] = []
    messagesQuery.data.pages.forEach((page) => {
      if (page.messages) list.push(...page.messages)
    })
    return list.slice().reverse()
  }, [messagesQuery.data?.pages])

  const { refetch, fetchNextPage } = messagesQuery
  const handleRetry = useCallback(() => {
    void refetch()
  }, [refetch])
  const handleLoadMore = useCallback(() => {
    void fetchNextPage()
  }, [fetchNextPage])
  const handleClearReply = useCallback(() => setReplyTo(null), [])

  const { mutateAsync: sendMutateAsync } = sendMessageMutation
  const handleSend = useCallback(
    async (content: string, type: 'TEXT' | 'IMAGE', urls?: string[]): Promise<boolean> => {
      if (!conversationId) return false
      const prevReply = replyTo
      setReplyTo(null)
      try {
        await sendMutateAsync({
          conversationId,
          content,
          messageType: type,
          mediaUrls: urls,
          replyTo: prevReply,
        })
        return true
      } catch (err) {
        setReplyTo(prevReply)
        toast.error(
          err instanceof Error && err.message === 'WS_DISCONNECTED'
            ? t('sendErrorDisconnected')
            : getApiError(err, t('sendErrorDisconnected'))
        )
        return false
      }
    },
    [conversationId, replyTo, sendMutateAsync, t]
  )

  async function handleConfirmRecall() {
    if (!recallTarget?.message_id) return
    try {
      await recallMutation.mutateAsync({ messageId: recallTarget.message_id, mode: 'EVERYONE' })
      toast.success(t('recallSuccess'))
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setRecallTarget(null)
    }
  }

  if (!conversationId) {
    return (
      <section className="flex-1 flex flex-col items-center justify-center p-6 bg-surface-base h-full">
        <EmptyState
          size="lg"
          icon={<MessageCircle size={48} className="text-action-accent" />}
          title={t('noConversationSelected')}
          description={t('noConversationSelectedDesc')}
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<SquarePen size={18} />}
              onClick={onOpenNewChat}
            >
              {t('newMessage')}
            </Button>
          }
        />
      </section>
    )
  }

  const typingNames = Object.values(typingUsers).join(', ')
  return (
    <>
      <section
        className={cn(
          'flex-1 flex flex-col h-full min-h-0 bg-surface-base overflow-hidden min-w-0',
          isDetailsOpen && 'hidden xl:flex'
        )}
      >
        <ChatConversationHeader
          conversation={activeConv}
          status={connectionStatus}
          onBack={onBackToList}
          detailsOpen={isDetailsOpen}
          onToggleDetails={(event) => {
            detailsTrigger.current = event.currentTarget
            if (isDetailsOpen) closeDetails()
            else setIsDetailsOpen(true)
          }}
        />

        <ChatMessageList
          allMessages={allMessages}
          currentUserId={currentUserId}
          isLoading={messagesQuery.isLoading}
          isError={messagesQuery.isError}
          activeConv={activeConv}
          typingNames={typingNames}
          messagesEndRef={messagesEndRef}
          onReply={setReplyTo}
          onRecall={setRecallTarget}
          onRetry={handleRetry}
          hasNextPage={messagesQuery.hasNextPage}
          isFetchingNextPage={messagesQuery.isFetchingNextPage}
          onLoadMore={handleLoadMore}
          unreadCount={activeConv?.unread_count}
        />

        <ChatComposer
          replyTo={replyTo}
          onClearReply={handleClearReply}
          onSend={handleSend}
          onSendTyping={onSendTyping}
        />

        {recallTarget ? (
          <ConfirmDialog
            open
            onClose={() => setRecallTarget(null)}
            onConfirm={handleConfirmRecall}
            title={t('recallConfirmTitle')}
            description={t('recallConfirmDesc')}
            confirmLabel={t('confirmDelete')}
            variant="danger"
            icon={<AlertCircle size={24} />}
          />
        ) : null}
      </section>
      {isDetailsOpen ? (
        <aside
          ref={focusDetails}
          tabIndex={-1}
          id="conversation-details"
          aria-label={tp('messages.details')}
          className="h-full min-w-0 flex-1 overflow-y-auto border-line-subtle bg-surface-card xl:w-72 xl:flex-none xl:border-l"
        >
          <Suspense fallback={null}>
            <LazyChatPortalActions
              conversationId={conversationId}
              conversation={activeConv}
              onClose={closeDetails}
            />
          </Suspense>
        </aside>
      ) : null}
    </>
  )
}
