import { useTranslation } from 'react-i18next'
import { FileQuestion, Home } from 'lucide-react'
import { ButtonLink } from '@/components/ui/actions'
import { Heading, Text } from '@/components/ui/typography'
import { Card } from '@/components/ui/data-display'
import { useAuthStore } from '@/stores/authStore'

export default function NotFoundPage() {
  const { t } = useTranslation('common')
  const { user, isAuthenticated } = useAuthStore()

  const isTeacher = user?.roles?.some((r) =>
    ['teacher', 'LECTURER', 'admin', 'ADMIN'].includes(r)
  )

  const homeHref = !isAuthenticated ? '/login' : isTeacher ? '/teacher/dashboard' : '/feed'

  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Full-viewport centered layout container] */
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-surface-base text-fg-primary">
      <Card as="section" className="max-w-md w-full p-8 text-center space-y-6 rounded-2xl border border-line-subtle bg-surface-card shadow-card">
        {/* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Decorative icon wrapper] */}
        <div className="w-16 h-16 rounded-full bg-surface-card-hover mx-auto flex items-center justify-center text-action-accent">
          <FileQuestion size={36} />
        </div>

        <header className="space-y-2">
          <Heading level={1} className="text-3xl font-extrabold tracking-tight text-fg-primary">
            404
          </Heading>
          <Heading level={2} className="text-lg font-semibold text-fg-primary">
            {t('errors.pageNotFound')}
          </Heading>
          <Text size="sm" tone="muted">
            {t('errors.pageNotFoundDesc')}
          </Text>
        </header>

        <nav aria-label="Điều hướng quay về" className="pt-2 flex justify-center">
          <ButtonLink
            to={homeHref}
            variant="primary"
            size="md"
            className="min-h-11 px-6 rounded-xl font-medium"
            leftIcon={<Home size={18} />}
          >
            {t('errors.backHome')}
          </ButtonLink>
        </nav>
      </Card>
    </div>
  )
}

