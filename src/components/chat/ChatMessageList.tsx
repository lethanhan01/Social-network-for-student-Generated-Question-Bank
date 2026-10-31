import { useEffect, useRef, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Reply, Trash2, AlertCircle } from 'lucide-react'
import { Avatar, Image } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import type { MessageDto, ConversationDto } from '@/types'
import { cn } from '@/utils/cn'

interface ChatMessageListProps {
  allMessages: MessageDto[]
  currentUserId?: number
  isLoading: boolean
  isError: boolean
  activeConv?: ConversationDto
  typingNames?: string
  messagesEndRef: RefObject<HTMLDivElement | null>
  onReply: (msg: MessageDto) => void
  onRecall: (msg: MessageDto) => void
  onRetry: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
}

export function ChatMessageList({
  allMessages,
  currentUserId,
  isLoading,
  isError,
  activeConv,
  typingNames,
  messagesEndRef,
  onReply,
  onRecall,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Readonly<ChatMessageListProps>) {
  const { t } = useTranslation('chat')
  const topSentinelRef = useRef<HTMLDivElement>(null)

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

  if (isLoading && allMessages.length === 0) {
    return (
      /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Loading skeleton message container] */
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 animate-pulse">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Left message skeleton item] */}
        <div className="flex items-end gap-2 justify-start max-w-[60%]">
          <div className="w-7 h-7 rounded-full bg-surface-card shrink-0" />
          <div className="h-10 w-48 rounded-2xl bg-surface-card" />
        </div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Right message skeleton item] */}
        <div className="flex items-end gap-2 justify-end max-w-[60%] ml-auto">
          <div className="h-12 w-64 rounded-2xl bg-surface-card" />
        </div>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Left message skeleton item 2] */}
        <div className="flex items-end gap-2 justify-start max-w-[60%]">
          <div className="w-7 h-7 rounded-full bg-surface-card shrink-0" />
          <div className="h-8 w-36 rounded-2xl bg-surface-card" />
        </div>
      </div>
    )
  }

  if (isError && allMessages.length === 0) {
    return (
      /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Message list empty error state] */
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
        <AlertCircle className="w-10 h-10 text-status-danger-fg" />
        <p className="text-sm font-medium text-fg-primary">{t('loadError', 'Không thể tải tin nhắn')}</p>
        <p className="text-xs text-fg-muted max-w-sm">
          {t('loadErrorDesc', 'Kết nối đến máy chủ bị gián đoạn. Vui lòng bấm Thử lại để tải lại tin nhắn.')}
        </p>
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Action button row for retry] */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {t('retry', 'Thử lại')}
          </Button>
        </div>
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
          <p className="text-xs text-fg-muted mt-1">{t('noMessagesDesc', 'Hãy gửi lời chào đầu tiên để bắt đầu trao đổi!')}</p>
        </div>
      </div>
    )
  }

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Message list scroll container] */
    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Top scroll sentinel for infinite scroll] */}
      <div ref={topSentinelRef} />
      {hasNextPage ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Load older messages action container] */
        <div className="flex justify-center pb-2">
          <Button variant="ghost" size="sm" onClick={onLoadMore} loading={isFetchingNextPage} className="text-xs text-fg-muted">
            {t('loadOlder', 'Tải tin nhắn cũ hơn')}
          </Button>
        </div>
      ) : null}
      {isError ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Subtle warning banner for offline/cached messages] */
        <div className="flex items-center justify-center gap-1.5 py-1 px-3 text-xs text-status-warning-fg bg-surface-card rounded-md border border-line-subtle mb-2">
          <AlertCircle size={14} />
          <p>{t('offlineCachedNote', 'Đang hiển thị tin nhắn từ bộ nhớ đệm')}</p>
        </div>
      ) : null}
      {allMessages.map((msg) => {
        const isMe = msg.sender_id === currentUserId
        return (
          /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Message item flex row] */
          <div key={msg.message_id} className={cn('flex items-end gap-2 group', isMe ? 'justify-end' : 'justify-start')}>
            {!isMe ? <Avatar src={msg.avatar_url} name={msg.sender_name ?? 'User'} size="xs" tone="neutral" className="mb-1 shrink-0" /> : null}
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Bubble and actions wrapper] */}
            <div className="flex items-center gap-1.5 max-w-[75%]">
              {isMe ? (
                /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Actions hover bar for current user] */
                <div className="hidden group-hover:flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onReply(msg)} className="w-7 h-7 p-0 rounded-full text-fg-muted hover:text-fg-primary"><Reply size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => onRecall(msg)} className="w-7 h-7 p-0 rounded-full text-status-danger-fg hover:bg-status-danger-bg"><Trash2 size={14} /></Button>
                </div>
              ) : null}
              {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Message bubble bubble content] */}
              <div className={cn('px-3.5 py-2 rounded-2xl text-sm break-words', isMe ? 'bg-action-accent text-fg-on-solid rounded-br-xs' : 'bg-surface-elevated text-fg-primary rounded-bl-xs border border-line-subtle')}>
                {msg.reply_to_message ? <blockquote className={cn('text-xs mb-1.5 p-1 rounded border-l-2', isMe ? 'border-fg-on-solid/50 bg-action-accent-soft/20' : 'border-line-accent-subtle bg-surface-sunken')}>{msg.reply_to_message.content_preview || 'Tin nhắn'}</blockquote> : null}
                {msg.revoked ? <em className="italic opacity-80">{t('recalledNote', 'Tin nhắn đã bị thu hồi')}</em> : (
                  <>
                    {msg.media_urls?.[0] ? <Image src={msg.media_urls[0]} alt="Media" className="rounded-lg max-h-48 mb-1.5 object-cover" /> : null}
                    <p>{msg.content}</p>
                  </>
                )}
              </div>
              {!isMe ? (
                /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Actions hover bar for partner] */
                <div className="hidden group-hover:flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onReply(msg)} className="w-7 h-7 p-0 rounded-full text-fg-muted hover:text-fg-primary"><Reply size={14} /></Button>
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
      {typingNames ? <p className="text-xs text-fg-muted italic animate-pulse">{t('typing', { name: typingNames })}</p> : null}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Scroll anchor element] */}
      <div ref={messagesEndRef} />
    </div>
  )
}
