import { lazy, Suspense, useEffect, useRef, useState, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { EmojiClickData } from 'emoji-picker-react'
import { Send, ThumbsUp, ImagePlus, Smile, X } from 'lucide-react'
import { Image } from '@/components/ui/data-display/Image'
import { Button } from '@/components/ui/actions/Button'
import { Input } from '@/components/ui/forms/Input'
import { Form } from '@/components/ui/forms/Form'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/overlay/Popover'
import { uploadSingleMedia } from '@/services/media-upload.service'
import { useThemeStore } from '@/stores/themeStore'
import { toast } from '@/lib/toast'
import { getApiError } from '@/lib/api-error'
import type { MessageDto } from '@/types'

const LazyEmojiPicker = lazy(() => import('emoji-picker-react'))

const TYPING_THROTTLE_MS = 1500
const TYPING_IDLE_STOP_MS = 2500

export interface ChatComposerProps {
  replyTo: MessageDto | null
  onClearReply: () => void
  onSend: (content: string, type: 'TEXT' | 'IMAGE', urls?: string[]) => Promise<boolean>
  onSendTyping: (isTyping: boolean) => void
}

export function ChatComposer({
  replyTo,
  onClearReply,
  onSend,
  onSendTyping,
}: Readonly<ChatComposerProps>) {
  const { t } = useTranslation('chat')
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  const [text, setText] = useState('')
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastTypingSentRef = useRef(0)
  const isTypingActiveRef = useRef(false)
  const stopTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function stopTypingNow() {
    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current)
      stopTypingTimerRef.current = null
    }
    if (isTypingActiveRef.current) {
      isTypingActiveRef.current = false
      lastTypingSentRef.current = 0
      onSendTyping(false)
    }
  }

  useEffect(() => {
    return () => {
      if (stopTypingTimerRef.current) clearTimeout(stopTypingTimerRef.current)
      if (isTypingActiveRef.current) {
        isTypingActiveRef.current = false
        onSendTyping(false)
      }
    }
  }, [onSendTyping])

  function handleTextChange(val: string) {
    setText(val)
    if (val.length === 0) {
      stopTypingNow()
      return
    }
    const now = Date.now()
    if (!isTypingActiveRef.current || now - lastTypingSentRef.current >= TYPING_THROTTLE_MS) {
      isTypingActiveRef.current = true
      lastTypingSentRef.current = now
      onSendTyping(true)
    }
    if (stopTypingTimerRef.current) clearTimeout(stopTypingTimerRef.current)
    stopTypingTimerRef.current = setTimeout(() => {
      stopTypingTimerRef.current = null
      if (isTypingActiveRef.current) {
        isTypingActiveRef.current = false
        lastTypingSentRef.current = 0
        onSendTyping(false)
      }
    }, TYPING_IDLE_STOP_MS)
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

  async function submitContent(content: string, type: 'TEXT' | 'IMAGE', urls?: string[]) {
    const prevText = text
    const prevMedia = mediaUrl
    setText('')
    setMediaUrl(null)
    stopTypingNow()
    const ok = await onSend(content, type, urls)
    if (!ok) {
      setText(prevText)
      setMediaUrl(prevMedia)
    }
  }

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!text.trim() && !mediaUrl) return
    if (mediaUrl) {
      void submitContent(text.trim() || t('sentImage'), 'IMAGE', [mediaUrl])
    } else {
      void submitContent(text.trim(), 'TEXT')
    }
  }

  return (
    <footer className="p-3 bg-surface-card border-t border-line-subtle shrink-0">
      {replyTo ? (
        /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Reply preview bar] */
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-surface-sunken rounded-lg text-xs text-fg-muted">
          {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Truncated reply preview text] */}
          <span className="truncate">{t('replyingTo', { name: replyTo.sender_name || 'bạn bè' })}: {replyTo.content}</span>
          <Button variant="ghost" size="sm" onClick={onClearReply} className="w-5 h-5 p-0"><X size={13} /></Button>
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
            {isEmojiOpen ? (
              <Suspense fallback={null}>
                <LazyEmojiPicker onEmojiClick={handleEmojiClick} theme={resolvedTheme as never} lazyLoadEmojis />
              </Suspense>
            ) : null}
          </PopoverContent>
        </Popover>
        <Input value={text} onChange={(e) => handleTextChange(e.target.value)} placeholder={t('typeMessage')} aria-label={t('typeMessage')} className="flex-1 min-w-0 rounded-full bg-surface-sunken" />
        {!text.trim() && !mediaUrl ? (
          <Button variant="ghost" size="sm" onClick={() => { void submitContent('👍', 'TEXT') }} aria-label={t('likeThumb')} className="w-11 h-11 p-0 rounded-full text-action-accent hover:bg-action-accent/10"><ThumbsUp size={19} /></Button>
        ) : (
          <Button variant="primary" size="sm" type="submit" disabled={isUploading} aria-label={t('send')} className="w-11 h-11 p-0 rounded-full"><Send size={16} /></Button>
        )}
      </Form>
    </footer>
  )
}
