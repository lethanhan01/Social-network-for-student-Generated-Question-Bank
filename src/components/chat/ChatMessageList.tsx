import { useEffect, useRef, useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Reply, Trash2, AlertCircle, ArrowDown } from 'lucide-react'
import { Avatar, Image, Badge } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import type { MessageDto, ConversationDto } from '@/types'
import { cn } from '@/utils/cn'

interface ChatMessageListProps {
  allMessages: MessageDto[]; currentUserId?: number; isLoading: boolean; isError: boolean
  activeConv?: ConversationDto; typingNames?: string; messagesEndRef: RefObject<HTMLDivElement | null>
  onReply: (msg: MessageDto) => void; onRecall: (msg: MessageDto) => void; onRetry: () => void
  hasNextPage?: boolean; isFetchingNextPage?: boolean; onLoadMore?: () => void; unreadCount?: number
}

interface MessageItemRowProps {
  msg: MessageDto; isMe: boolean; showUnreadDivider: boolean
  unreadDividerRef: RefObject<HTMLDivElement | null>
  onReply: (msg: MessageDto) => void; onRecall: (msg: MessageDto) => void
}

function MessageItemRow({ msg, isMe, showUnreadDivider, unreadDividerRef, onReply, onRecall }: Readonly<MessageItemRowProps>) {
  const { t } = useTranslation('chat')
  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Message item and optional divider fragment] */
    <div className="space-y-3">
      {showUnreadDivider ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Unread messages divider bar] */
        <div ref={unreadDividerRef} className="flex items-center gap-3 my-4 py-1" role="separator">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Left divider line] */}
          <div className="flex-1 h-px bg-line-accent-subtle" />
          <Badge tone="accent" size="xs" className="px-2.5 py-0.5 font-medium text-[11px] uppercase tracking-wider">
            {t('unreadMessagesDivider')}
          </Badge>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Right divider line] */}
          <div className="flex-1 h-px bg-line-accent-subtle" />
        </div>
      ) : null}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Message item flex row] */}
      <div className={cn('flex items-end gap-2 group', isMe ? 'justify-end' : 'justify-start')}>
        {!isMe ? <Avatar src={msg.avatar_url} name={msg.sender_name ?? 'User'} size="xs" tone="neutral" className="mb-1 shrink-0" /> : null}
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Bubble and actions wrapper] */}
        <div className="flex items-center gap-1.5 max-w-[75%]">
          {isMe ? (
            /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Actions hover bar for current user] */
            <div className="hidden group-hover:flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => onReply(msg)} aria-label={t('reply')} className="w-7 h-7 p-0 rounded-full text-fg-muted hover:text-fg-primary"><Reply size={14} /></Button>
              {msg.message_id && msg.message_id > 0 ? (
                <Button variant="ghost" size="sm" onClick={() => onRecall(msg)} aria-label={t('recallMessage')} className="w-7 h-7 p-0 rounded-full text-status-danger-fg hover:bg-status-danger-bg"><Trash2 size={14} /></Button>
              ) : null}
            </div>
          ) : null}
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Message bubble bubble content] */}
          <div className={cn('px-3.5 py-2 rounded-2xl text-sm break-words', isMe ? 'bg-action-accent text-fg-on-solid rounded-br-xs' : 'bg-surface-elevated text-fg-primary rounded-bl-xs border border-line-subtle')}>
            {msg.reply_to_message ? <blockquote className={cn('text-xs mb-1.5 p-1 rounded border-l-2', isMe ? 'border-fg-on-solid/50 bg-action-accent-soft/20' : 'border-line-accent-subtle bg-surface-sunken')}>{msg.reply_to_message.content_preview || 'Tin nhắn'}</blockquote> : null}
            {msg.revoked ? <em className="italic opacity-80">{t('recalledNote')}</em> : (
              <>
                {msg.media_urls?.[0] ? <Image src={msg.media_urls[0]} alt="Media" className="rounded-lg max-h-48 mb-1.5 object-cover" /> : null}
                <p>{msg.content}</p>
              </>
            )}
          </div>
          {!isMe ? (
            /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Actions hover bar for partner] */
            <div className="hidden group-hover:flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => onReply(msg)} aria-label={t('reply')} className="w-7 h-7 p-0 rounded-full text-fg-muted hover:text-fg-primary"><Reply size={14} /></Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function ChatMessageList({
  allMessages, currentUserId, isLoading, isError, activeConv, typingNames,
  messagesEndRef, onReply, onRecall, onRetry, hasNextPage, isFetchingNextPage, onLoadMore, unreadCount,
}: Readonly<ChatMessageListProps>) {
  const { t } = useTranslation('chat')
  const topSentinelRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const unreadDividerRef = useRef<HTMLDivElement>(null)
  const [showScrollBottom, setShowScrollBottom] = useState(false)

  const initialUnread = unreadCount ?? activeConv?.unread_count ?? 0
  const initialUnreadRef = useRef(initialUnread)
  const currentConvIdRef = useRef(activeConv?.conversation_id)
  const hasScrolledRef = useRef(false)
  const prevLengthRef = useRef(allMessages.length)

  if (currentConvIdRef.current !== activeConv?.conversation_id) {
    currentConvIdRef.current = activeConv?.conversation_id
    initialUnreadRef.current = initialUnread
    hasScrolledRef.current = false
  }

  const unreadIndex =
    initialUnreadRef.current > 0 && allMessages.length >= initialUnreadRef.current
      ? allMessages.length - initialUnreadRef.current
      : -1

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !onLoadMore) return
    const el = topSentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onLoadMore])

  useEffect(() => {
    if (allMessages.length === 0) return
    if (!hasScrolledRef.current) {
      if (initialUnreadRef.current > 0 && unreadDividerRef.current) {
        unreadDividerRef.current.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
        setShowScrollBottom(true)
      } else {
        messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' })
      }
      hasScrolledRef.current = true
    } else if (allMessages.length > prevLengthRef.current) {
      const container = scrollContainerRef.current
      const isNearBottom = container
        ? container.scrollHeight - container.scrollTop - container.clientHeight < 200
        : true
      const newestMsg = allMessages.at(-1)
      const newestSenderId = newestMsg?.sender_id != null ? Number(newestMsg.sender_id) : undefined
      const isNewestMine =
        currentUserId != null && Number.isFinite(currentUserId) && newestSenderId === currentUserId
      if (isNearBottom || isNewestMine) {
        messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' })
      } else {
        setShowScrollBottom(true)
      }
    }
    prevLengthRef.current = allMessages.length
  }, [allMessages, currentUserId, messagesEndRef])

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    setShowScrollBottom(!isNearBottom)
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' })
    setShowScrollBottom(false)
  }

  if (isLoading && allMessages.length === 0) {
    return (
      /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Loading skeleton message container] */
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 animate-pulse">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Left message skeleton item] */}
        <div className="flex items-end gap-2 justify-start max-w-[60%]"><div className="w-7 h-7 rounded-full bg-surface-card shrink-0" /><div className="h-10 w-48 rounded-2xl bg-surface-card" /></div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Right message skeleton item] */}
        <div className="flex items-end gap-2 justify-end max-w-[60%] ml-auto"><div className="h-12 w-64 rounded-2xl bg-surface-card" /></div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Left message skeleton item 2] */}
        <div className="flex items-end gap-2 justify-start max-w-[60%]"><div className="w-7 h-7 rounded-full bg-surface-card shrink-0" /><div className="h-8 w-36 rounded-2xl bg-surface-card" /></div>
      </div>
    )
  }

  if (isError && allMessages.length === 0) {
    return (
      /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Message list empty error state] */
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
        <AlertCircle className="w-10 h-10 text-status-danger-fg" />
        <p className="text-sm font-medium text-fg-primary">{t('loadError')}</p>
        <p className="text-xs text-fg-muted max-w-sm">{t('loadErrorDesc')}</p>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Action button row for retry] */}
        <div className="flex items-center gap-2"><Button variant="secondary" size="sm" onClick={onRetry}>{t('retry')}</Button></div>
      </div>
    )
  }

  if (allMessages.length === 0) {
    return (
      /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Conversation empty state container] */
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
        <Avatar src={activeConv?.display_avatar_url ?? undefined} name={activeConv?.display_name ?? 'Chat'} size="lg" tone="accent" />
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Empty conversation prompt info] */}
        <div>
          <p className="font-semibold text-fg-primary text-base">{activeConv?.display_name}</p>
          <p className="text-xs text-fg-muted mt-1">{t('noMessagesDesc')}</p>
        </div>
      </div>
    )
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Message list relative wrapper] */
    <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Message list scroll container] */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Top scroll sentinel for infinite scroll] */}
        <div ref={topSentinelRef} />
        {hasNextPage ? (
          /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Load older messages action container] */
          <div className="flex justify-center pb-2">
            <Button variant="ghost" size="sm" onClick={onLoadMore} loading={isFetchingNextPage} className="text-xs text-fg-muted">
              {t('loadOlder')}
            </Button>
          </div>
        ) : null}
        {isError ? (
          /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Subtle warning banner for offline/cached messages] */
          <div className="flex items-center justify-center gap-1.5 py-1 px-3 text-xs text-status-warning-fg bg-surface-card rounded-md border border-line-subtle mb-2">
            <AlertCircle size={14} />
            <p>{t('offlineCachedNote')}</p>
          </div>
        ) : null}
        {allMessages.map((msg, idx) => {
          const msgSenderId = msg.sender_id != null ? Number(msg.sender_id) : undefined
          const isMe = currentUserId != null && Number.isFinite(currentUserId) && msgSenderId === currentUserId
          return (
            <MessageItemRow
              key={msg.message_id} msg={msg} isMe={isMe} showUnreadDivider={idx === unreadIndex}
              unreadDividerRef={unreadDividerRef} onReply={onReply} onRecall={onRecall}
            />
          )
        })}
        {typingNames ? <p className="text-xs text-fg-muted italic animate-pulse">{t('typing', { name: typingNames })}</p> : null}
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Scroll anchor element] */}
        <div ref={messagesEndRef} />
      </div>
      {showScrollBottom ? (
        <Button
          variant="secondary" size="sm" onClick={scrollToBottom} aria-label={t('scrollToBottom')}
          className="absolute bottom-4 right-4 z-10 w-11 h-11 min-h-[44px] min-w-[44px] rounded-full shadow-lg border border-line-subtle p-0 flex items-center justify-center bg-surface-elevated text-fg-primary hover:bg-surface-sunken"
        >
          <ArrowDown size={18} />
          {initialUnreadRef.current > 0 ? (
            <Badge tone="accent" size="xs" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] rounded-full">
              {initialUnreadRef.current}
            </Badge>
          ) : null}
        </Button>
      ) : null}
    </div>
  )
}
