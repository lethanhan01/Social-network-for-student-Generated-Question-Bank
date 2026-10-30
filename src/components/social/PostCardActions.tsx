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
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Action buttons 3-column grid container] */
    <div className="grid grid-cols-3 gap-1 pt-1 border-t border-line-subtle">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={disabled}
            variant={localReacted ? 'secondary' : 'ghost'}
            size="sm"
            className={`justify-center gap-2 text-xs min-h-11 ${
              localReacted ? 'text-action-accent font-bold' : ''
            }`}
            leftIcon={<ThumbsUp size={16} />}
          >
            {localReacted ? t('reaction.reacted', 'Đã thích') : t('reaction.like', 'Thích')}
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
        className="justify-center gap-2 text-xs min-h-11"
        leftIcon={<MessageSquare size={16} />}
      >
        {t('post.comment', 'Bình luận')}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onShare}
        className="justify-center gap-2 text-xs min-h-11"
        leftIcon={<Share2 size={16} />}
      >
        {t('post.share', 'Chia sẻ')}
      </Button>
    </div>
  )
}
