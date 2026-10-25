import { HelpCircle, Sparkles, Image as ImageIcon } from 'lucide-react'
import { Card, Avatar } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Separator } from '@/components/ui/layout'
import type { ProfileResponse } from '@/types'

interface CreatePostBoxProps {
  user?: ProfileResponse
  onOpenCreateModal: () => void
}

export function CreatePostBox({
  user,
  onOpenCreateModal,
}: Readonly<CreatePostBoxProps>) {
  const displayName = user?.full_name || 'Bạn'
  const initials = displayName.trim().charAt(0).toUpperCase()

  return (
    <Card className="p-4 bg-surface border-line-subtle shadow-card rounded-2xl space-y-3">
      {/* Top Input Trigger */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Flex layout container for post trigger bar] */}
      <div className="flex items-center gap-3">
        <Avatar
          src={user?.avatar_url || undefined}
          name={displayName}
          fallback={initials}
          size="md"
          tone="accent"
        />
        <Button
          variant="secondary"
          size="md"
          onClick={onOpenCreateModal}
          className="flex-1 justify-start text-text-muted hover:text-text-primary bg-surface-hover rounded-full px-4 h-11 text-sm font-normal border border-line-subtle"
        >
          Bạn muốn thảo luận bài tập hoặc chia sẻ tài liệu gì hôm nay?
        </Button>
      </div>

      <Separator />

      {/* Action Buttons Row */}
      {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Grid layout container for post action buttons] */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenCreateModal}
          className="justify-center gap-2 text-xs min-h-11"
          leftIcon={<HelpCircle size={18} className="text-tone-warning" />}
        >
          <strong className="font-normal hidden sm:inline">Hỏi bài tập</strong>
          <strong className="font-normal sm:hidden">Hỏi bài</strong>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenCreateModal}
          className="justify-center gap-2 text-xs min-h-11"
          leftIcon={<ImageIcon size={18} className="text-action-accent" />}
        >
          <strong className="font-normal hidden sm:inline">Ảnh / Tài liệu</strong>
          <strong className="font-normal sm:hidden">Tài liệu</strong>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenCreateModal}
          className="justify-center gap-2 text-xs min-h-11"
          leftIcon={<Sparkles size={18} className="text-tone-info" />}
        >
          <strong className="font-normal hidden sm:inline">Đố vui nhanh</strong>
          <strong className="font-normal sm:hidden">Đố vui</strong>
        </Button>
      </div>
    </Card>
  )
}
