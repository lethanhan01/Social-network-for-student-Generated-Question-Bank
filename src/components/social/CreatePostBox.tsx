import { HelpCircle, Sparkles, Image as ImageIcon } from 'lucide-react'
import { Card, Avatar } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Separator } from '@/components/ui/layout'
import type { ProfileResponse } from '@/types'
import { useTranslation } from 'react-i18next'

interface CreatePostBoxProps {
  user?: ProfileResponse
  onOpenCreateModal: () => void
}

export function CreatePostBox({ user, onOpenCreateModal }: Readonly<CreatePostBoxProps>) {
  const { t } = useTranslation()
  const displayName = user?.full_name || t('social.member')
  const initials = displayName.trim().charAt(0).toUpperCase()

  return (
    <Card as="section" padding="none" className="social-card p-3 space-y-2">
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
          className="flex-1 min-w-0 justify-start text-text-muted hover:text-text-primary bg-surface-hover rounded-full px-4 h-auto min-h-11 py-2 text-left text-sm font-normal border border-line-subtle whitespace-normal"
        >
          {t('social.composerPrompt')}
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
          className="justify-center gap-1.5 px-1.5 text-sm min-h-11 whitespace-normal"
          leftIcon={<HelpCircle size={18} className="text-tone-warning" />}
        >
          <strong className="font-normal">{t('social.discussion')}</strong>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenCreateModal}
          className="justify-center gap-1.5 px-1.5 text-sm min-h-11 whitespace-normal"
          leftIcon={<ImageIcon size={18} className="text-action-accent" />}
        >
          <strong className="font-normal">{t('social.attachment')}</strong>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenCreateModal}
          className="justify-center gap-1.5 px-1.5 text-sm min-h-11 whitespace-normal"
          leftIcon={<Sparkles size={18} className="text-tone-info" />}
        >
          <strong className="font-normal">{t('social.share')}</strong>
        </Button>
      </div>
    </Card>
  )
}
