import type { RefObject } from 'react'
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
}: Readonly<ChatMessageListProps>) {
  const { t } = useTranslation('chat')

  if (isLoading) {
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

  if (isError) {
    return (
      /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Message list error state] */
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center p-6 space-y-2">
        <AlertCircle className="w-10 h-10 text-status-danger-fg" />
        <p className="text-sm text-fg-muted">{t('loadError', 'Không thể tải tin nhắn')}</p>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('retry', 'Thử lại')}
        </Button>
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
