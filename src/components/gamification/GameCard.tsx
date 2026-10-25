import type { ReactNode } from 'react'
import { Play } from 'lucide-react'
import { Card } from '@/components/ui/data-display'
import { Button } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'

interface GameCardProps {
  icon: ReactNode
  title: string
  description: string
  joinLabel: string
  onJoin: () => void
}

export function GameCard({ icon, title, description, joinLabel, onJoin }: Readonly<GameCardProps>) {
  return (
    <Card as="article" className="flex h-full flex-col gap-4">
      <header className="flex items-start gap-3">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Khung icon trang trí cố định kích thước] */}
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-action-accent-soft text-action-accent"
        >
          {icon}
        </span>
        <hgroup className="min-w-0">
          <Heading level={3} size="xs">
            {title}
          </Heading>
          <Text size="sm" tone="muted">
            {description}
          </Text>
        </hgroup>
      </header>
      <footer className="mt-auto">
        <Button variant="primary" leftIcon={<Play size={16} />} onClick={onJoin} aria-label={`${joinLabel}: ${title}`}>
          {joinLabel}
        </Button>
      </footer>
    </Card>
  )
}
