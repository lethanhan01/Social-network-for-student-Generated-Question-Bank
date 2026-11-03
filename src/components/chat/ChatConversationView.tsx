import { useState, useRef, useMemo, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import EmojiPicker, { Theme as EmojiTheme, type EmojiClickData } from 'emoji-picker-react'
import { MessageCircle, Send, ThumbsUp, ImagePlus, Smile, X, SquarePen, AlertCircle } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback/EmptyState'
import { Avatar, Badge, Image } from '@/components/ui/data-display'
import { Button, BackButton } from '@/components/ui/actions'
import { Input, Form } from '@/components/ui/forms'
import { Popover, PopoverTrigger, PopoverContent, ConfirmDialog } from '@/components/ui/overlay'
import {
  useConversationMessagesInfiniteQuery,
  useRecallMessageMutation,
  useSendMessageMutation,
  useAutoMarkAsRead,
} from '@/hooks/queries/useChatQuery'
import { useInfiniteConversationsQuery } from '@/hooks/queries/useMessengerQuery'
import { type WsConnectionStatus } from '@/services/websocket.service'
import { uploadSingleMedia } from '@/services/media-upload.service'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import type { MessageDto } from '@/types'
import { ChatMessageList } from './ChatMessageList'

function getConnectionBadgeConfig(status: WsConnectionStatus, t: (key: string, fallback: string) => string) {
  if (status === 'CONNECTED') return { tone: 'success' as const, label: t('connected', 'Đã kết nối') }
  if (status === 'CONNECTING') return { tone: 'warning' as const, label: t('reconnecting', 'Đang kết nối lại...') }
  return { tone: 'danger' as const, label: t('disconnected', 'Mất kết nối') }
}

interface ChatConversationViewProps {
  conversationId?: number; onBackToList?: () => void; onOpenNewChat: () => void
  connectionStatus: WsConnectionStatus; typingUsers: Record<number, string>; onSendTyping: (isTyping: boolean) => void
}

export function ChatConversationView({
  conversationId, onBackToList, onOpenNewChat,
  connectionStatus, typingUsers, onSendTyping,
}: Readonly<ChatConversationViewProps>) {
  const { t } = useTranslation('chat')
  const currentUserId = useAuthStore((state) => state.user?.user_id ?? Number(state.user?.userId))
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  const [text, setText] = useState('')
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [replyTo, setReplyTo] = useState<MessageDto | null>(null)
  const [recallTarget, setRecallTarget] = useState<MessageDto | null>(null)
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: convListData } = useInfiniteConversationsQuery()
  const activeConv = useMemo(
    () => convListData?.pages.flatMap((page) => page.items ?? []).find((c) => c.conversation_id === conversationId),
    [convListData, conversationId]
  )

  const messagesQuery = useConversationMessagesInfiniteQuery(conversationId ?? 0)
  const recallMutation = useRecallMessageMutation()
  const sendMessageMutation = useSendMessageMutation()
  const connectionBadge = useMemo(() => getConnectionBadgeConfig(connectionStatus, t), [connectionStatus, t])

  useAutoMarkAsRead(conversationId, activeConv?.unread_count, activeConv?.last_message?.message_id)

  const allMessages = useMemo(() => {
    if (!messagesQuery.data?.pages) return []
    const list: MessageDto[] = []
    messagesQuery.data.pages.forEach((page) => {
      if (page.messages) list.push(...page.messages)
    })
    return list.slice().reverse()
  }, [messagesQuery.data?.pages])

  function handleTextChange(val: string) {
    setText(val)
    onSendTyping(val.length > 0)
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const res = await uploadSingleMedia(file, 'CHAT')
      setMediaUrl(res.url ?? null)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleEmojiClick(data: EmojiClickData) {
    setText((prev) => prev + data.emoji)
    setIsEmojiOpen(false)
  }

  async function sendMessageContent(content: string, type: 'TEXT' | 'IMAGE' = 'TEXT', urls?: string[]) {
    if (!conversationId) return
    const prevText = text
    const prevMedia = mediaUrl
    const prevReply = replyTo

    setText('')
    setMediaUrl(null)
    setReplyTo(null)
    onSendTyping(false)

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        content,
        messageType: type,
        mediaUrls: urls,
        replyTo: prevReply,
      })
    } catch {
      setText(prevText)
      setMediaUrl(prevMedia)
      setReplyTo(prevReply)
      toast.error(t('sendErrorDisconnected', 'Không thể gửi tin nhắn. Kết nối máy chủ realtime bị gián đoạn. Vui lòng thử lại.'))
    }
  }

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!text.trim() && !mediaUrl) return
    if (mediaUrl) {
      void sendMessageContent(text.trim() || t('sentImage', 'đã gửi một ảnh'), 'IMAGE', [mediaUrl])
    } else {
      void sendMessageContent(text.trim(), 'TEXT')
    }
  }

  async function handleConfirmRecall() {
    if (!recallTarget?.message_id) return
    try {
      await recallMutation.mutateAsync({ messageId: recallTarget.message_id, mode: 'EVERYONE' })
      toast.success(t('recallSuccess', 'Đã thu hồi tin nhắn'))
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
          title={t('noConversationSelected', 'Chưa chọn đoạn chat nào')}
          description={t('noConversationSelectedDesc', 'Hãy chọn một đoạn chat từ danh sách bên trái hoặc bắt đầu cuộc trò chuyện mới để kết nối.')}
          action={<Button variant="primary" size="sm" leftIcon={<SquarePen size={18} />} onClick={onOpenNewChat}>{t('newMessage', 'Tạo đoạn chat mới')}</Button>}
        />
      </section>
    )
  }

  const typingNames = Object.values(typingUsers).join(', ')

  return (
    <section className="flex-1 flex flex-col h-full min-h-0 bg-surface-base overflow-hidden min-w-0">
      <header className="h-16 px-4 bg-surface-card border-b border-line-subtle flex items-center justify-between shrink-0 z-10">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header profile and status row] */}
        <div className="flex items-center gap-3 min-w-0">
          {onBackToList ? <BackButton iconOnly onClick={onBackToList} className="md:hidden mr-1 min-h-11 min-w-11" /> : null}
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Avatar relative wrap for online dot] */}
          <div className="relative shrink-0">
            <Avatar src={activeConv?.display_avatar_url ?? undefined} name={activeConv?.display_name ?? 'Chat'} size="sm" tone="accent" />
          </div>
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Header chat name and status text block] */}
          <div className="truncate">
            <p className="text-sm font-bold text-fg-primary truncate">{activeConv?.display_name || t('messengerTitle', 'Đoạn chat')}</p>
            <p className="text-xs text-fg-muted">{t(activeConv?.type === 'GROUP' ? 'newGroup' : 'newDirect')}</p>
          </div>
        </div>
        <Badge tone={connectionBadge.tone} size="xs">
          {connectionBadge.label}
        </Badge>
      </header>

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
        onRetry={() => void messagesQuery.refetch()}
        hasNextPage={messagesQuery.hasNextPage}
        isFetchingNextPage={messagesQuery.isFetchingNextPage}
        onLoadMore={() => void messagesQuery.fetchNextPage()}
        unreadCount={activeConv?.unread_count}
      />

      <footer className="p-3 bg-surface-card border-t border-line-subtle shrink-0">
        {replyTo ? (
          /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Reply preview bar] */
          <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-surface-sunken rounded-lg text-xs text-fg-muted">
            <span className="truncate">{t('replyingTo', { name: replyTo.sender_name || 'bạn bè' })}: {replyTo.content}</span>
            <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="w-5 h-5 p-0"><X size={13} /></Button>
          </div>
        ) : null}
        {mediaUrl ? (
          /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Media preview thumbnail] */
          <div className="relative inline-block mb-2">
            <Image src={mediaUrl} alt="Upload preview" className="w-16 h-16 rounded-lg object-cover border border-line-subtle" />
            <Button variant="ghost" size="sm" onClick={() => setMediaUrl(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 p-0 bg-surface-elevated rounded-full border"><X size={12} /></Button>
          </div>
        ) : null}
        <Form onSubmit={handleSubmit} noValidate className="flex items-center gap-2">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS, NO_RAW_FORM_ELEMENTS [Hidden native file input for media upload] */}
          <div className="hidden"><input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} aria-label="Upload image" /></div>
          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} loading={isUploading} aria-label={t('uploadImage')} className="w-11 h-11 p-0 rounded-full text-fg-muted hover:text-action-accent"><ImagePlus size={19} /></Button>
          <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
            <PopoverTrigger asChild><Button variant="ghost" size="sm" aria-label={t('emojiPicker')} className="w-11 h-11 p-0 rounded-full text-fg-muted hover:text-action-accent"><Smile size={19} /></Button></PopoverTrigger>
            <PopoverContent side="top" align="start" className="p-0 border-0 bg-transparent shadow-none z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} theme={resolvedTheme === 'dark' ? EmojiTheme.DARK : EmojiTheme.LIGHT} lazyLoadEmojis />
            </PopoverContent>
          </Popover>
          <Input value={text} onChange={(e) => handleTextChange(e.target.value)} placeholder={t('typeMessage', 'Nhập tin nhắn...')} aria-label={t('typeMessage', 'Nhập tin nhắn...')} className="flex-1 min-w-0 rounded-full bg-surface-sunken" />
          {!text.trim() && !mediaUrl ? (
            <Button variant="ghost" size="sm" onClick={() => { void sendMessageContent('👍', 'TEXT') }} aria-label={t('likeThumb', 'Thích')} className="w-11 h-11 p-0 rounded-full text-action-accent hover:bg-action-accent/10"><ThumbsUp size={19} /></Button>
          ) : (
            <Button variant="primary" size="sm" type="submit" disabled={isUploading} aria-label={t('send', 'Gửi')} className="w-11 h-11 p-0 rounded-full"><Send size={16} /></Button>
          )}
        </Form>
      </footer>

      <ConfirmDialog open={Boolean(recallTarget)} onClose={() => setRecallTarget(null)} onConfirm={handleConfirmRecall} title={t('recallConfirmTitle', 'Thu hồi tin nhắn?')} description={t('recallConfirmDesc', 'Bạn có chắc chắn muốn thu hồi tin nhắn này với mọi người không?')} confirmLabel={t('confirmDelete', 'Thu hồi')} variant="danger" icon={<AlertCircle size={24} />} />
    </section>
  )
}
