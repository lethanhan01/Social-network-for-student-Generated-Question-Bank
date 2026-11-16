import { useTranslation } from 'react-i18next'
import { ThumbsUp, Heart, Smile, MessageSquare, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/actions'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/overlay'

interface PostCardActionsProps {
  disabled?: boolean
  localReacted: boolean
  onReact: (type: 'LIKE' | 'LOVE' | 'WOW') => void
  onToggleComments: () => void
  onShare: () => void
}

export function PostCardActions({
  disabled,
  localReacted,
  onReact,
  onToggleComments,
  onShare,
}: Readonly<PostCardActionsProps>) {
  const { t } = useTranslation()

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Inline action buttons group] */
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={disabled}
            variant="ghost"
            size="sm"
            className={`justify-center gap-1.5 px-2.5 text-xs min-h-11 ${
              localReacted ? 'text-action-accent font-bold' : ''
            }`}
            leftIcon={<ThumbsUp size={16} />}
          >
            {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Responsive label hidden on narrow mobile] */}
            <span className="sr-only sm:not-sr-only">
              {localReacted ? t('reaction.reacted') : t('reaction.like')}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="flex items-center gap-1 p-1 bg-surface border-line-subtle shadow-card rounded-full"
        >
          <DropdownMenuItem
            onClick={() => onReact('LIKE')}
            className="p-2 rounded-full hover:bg-surface-elevated"
            aria-label="Thích"
          >
            <ThumbsUp size={18} className="text-action-accent" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onReact('LOVE')}
            className="p-2 rounded-full hover:bg-surface-elevated"
            aria-label="Yêu thích"
          >
            <Heart size={18} className="text-tone-danger" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onReact('WOW')}
            className="p-2 rounded-full hover:bg-surface-elevated"
            aria-label="Bất ngờ"
          >
            <Smile size={18} className="text-tone-warning" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleComments}
        className="justify-center gap-1.5 px-2.5 text-xs min-h-11"
        leftIcon={<MessageSquare size={16} />}
      >
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Responsive label hidden on narrow mobile] */}
        <span className="sr-only sm:not-sr-only">{t('post.comment')}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onShare}
        className="justify-center gap-1.5 px-2.5 text-xs min-h-11"
        leftIcon={<Share2 size={16} />}
      >
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Responsive label hidden on narrow mobile] */}
        <span className="sr-only sm:not-sr-only">{t('post.share')}</span>
      </Button>
    </div>
  )
}
