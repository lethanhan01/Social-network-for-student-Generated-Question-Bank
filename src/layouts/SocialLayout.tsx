import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/actions/Button'
import { ThemeToggle } from '@/components/ui/navigation'
import { LanguageSwitcher } from '@/components/ui/typography'
import { TopbarAvatarDropdown } from '@/components/shared/topbar/TopbarAvatarDropdown'
import { SocialNavigation } from '@/components/social/SocialNavigation'
import { SocialRightSidebar } from '@/components/social/SocialRightSidebar'
import { useFriendsQuery } from '@/hooks/queries/useRelationshipsQuery'

export default function SocialLayout() {
  const { t } = useTranslation()
  const friends = useFriendsQuery()
  return (
    <section className="min-h-screen bg-bg-base text-text-primary">
      <header className="sticky top-0 z-20 border-b border-line-subtle bg-surface shadow-sm">
        <section className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-4 py-3">
          <ButtonLink
            to="/feed"
            variant="ghost"
            className="text-lg font-extrabold text-action-accent"
          >
            {t('social.brand')}
          </ButtonLink>
          <nav aria-label={t('social.account')} className="flex items-center gap-2">
            <ButtonLink to="/search" variant="secondary" className="hidden sm:inline-flex">
              {t('search.title')}
            </ButtonLink>
            <ThemeToggle />
            <LanguageSwitcher />
            <TopbarAvatarDropdown />
          </nav>
        </section>
        <section className="px-3 pb-2 lg:hidden">
          <SocialNavigation compact />
        </section>
      </header>
      <section className="mx-auto flex max-w-screen-2xl items-start gap-6 px-3 py-6 sm:px-6">
        <aside className="sticky top-24 hidden w-60 shrink-0 lg:block">
          <SocialNavigation />
        </aside>
        <main id="social-content" className="min-w-0 flex-1">
          <Outlet />
        </main>
        <aside className="sticky top-24 hidden w-64 shrink-0 xl:block">
          <SocialRightSidebar friends={friends.data?.items ?? []} />
        </aside>
      </section>
    </section>
  )
}
