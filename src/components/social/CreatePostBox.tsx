import { HelpCircle, Sparkles, Image as ImageIcon } from 'lucide-react'
import { Card, Avatar } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import type { ProfileResponse } from '@/types'
import { useTranslation } from 'react-i18next'

interface CreatePostBoxProps {
  user?: ProfileResponse
  onOpenCreateModal: () => void
}

const composerActions = [
  { label: 'social.discussion', Icon: HelpCircle, color: 'text-tone-warning' },
  { label: 'social.attachment', Icon: ImageIcon, color: 'text-action-accent' },
  { label: 'social.share', Icon: Sparkles, color: 'text-tone-info' },
] as const

export function CreatePostBox({ user, onOpenCreateModal }: Readonly<CreatePostBoxProps>) {
  const { t } = useTranslation()
  const displayName = user?.full_name || t('social.member')
  const initials = displayName.trim().charAt(0).toUpperCase()

  return (
    <Card as="section" padding="none" className="social-card flex items-center gap-1 p-2 sm:gap-2">
      <Avatar
        src={user?.avatar_url || undefined}
        name={displayName}
        fallback={initials}
        size="sm"
        tone="accent"
        className="shrink-0"
      />
      <Button
        variant="secondary"
        onClick={onOpenCreateModal}
        className="min-h-11 min-w-0 flex-1 justify-start rounded-xl bg-surface-hover px-3 text-left text-sm font-normal text-fg-muted"
      >
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Keep the composer prompt on one line without shortening its accessible name] */}
        <span className="min-w-0 truncate">{t('social.composerPrompt')}</span>
      </Button>
      {composerActions.map(({ label, Icon, color }) => (
        <Button
          key={label}
          variant="ghost"
          size="icon"
          aria-label={t(label)}
          title={t(label)}
          onClick={onOpenCreateModal}
          className="min-h-11 min-w-11 rounded-full"
        >
          <Icon size={20} className={color} aria-hidden="true" />
        </Button>
      ))}
    </Card>
  )
}
