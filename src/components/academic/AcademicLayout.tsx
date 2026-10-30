import type { ReactNode } from 'react'
import { BookOpen, FileQuestion, GraduationCap, Lightbulb, PenLine, Play, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { ButtonLink } from '@/components/ui/actions/Button'
import { Card } from '@/components/ui/data-display/Card'
import { Heading } from '@/components/ui/typography/Heading'
import { Text } from '@/components/ui/typography/Text'

export function AcademicLayout({ children, title, subtitle }: Readonly<{
  children: ReactNode; title: string; subtitle: string
}>) {
  const { t } = useTranslation('academic')
  const { pathname } = useLocation()
  const links = [
    { to: '/subjects', icon: BookOpen, label: t('subjects.title') },
    { to: '/proposals', icon: PenLine, label: t('proposals.title') },
    { to: '/practice', icon: Play, label: t('practice.title') },
  ]
  return (
    <section className="mx-auto flex max-w-screen-2xl items-start gap-6">
      <aside className="hidden w-60 shrink-0 space-y-6 lg:block lg:sticky lg:top-20">
        <header className="space-y-2 px-3">
          <GraduationCap className="text-action-accent" size={32} />
          <Heading level={2} className="text-xl font-bold">{t('hub')}</Heading>
          <Text size="sm" tone="muted">{t('hubSubtitle')}</Text>
        </header>
        <nav aria-label={t('navigation')} className="flex flex-col gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <ButtonLink key={to} to={to} variant={pathname.startsWith(to) ? 'secondary' : 'ghost'}
              aria-current={pathname.startsWith(to) ? 'page' : undefined}
              className="min-h-12 justify-start gap-3 rounded-xl px-3" leftIcon={<Icon size={22} />}>
              {label}
            </ButtonLink>
          ))}
          <ButtonLink to="/feed" variant="ghost" className="min-h-12 justify-start" leftIcon={<ArrowLeft size={20} />}>
            {t('backToFeed')}
          </ButtonLink>
        </nav>
      </aside>
      <section className="min-w-0 flex-1 space-y-5">
        <header className="space-y-2">
          <Text size="xs" className="font-semibold uppercase tracking-wider text-action-accent">{t('hub')}</Text>
          <Heading level={1} className="text-2xl font-bold sm:text-3xl">{title}</Heading>
          <Text size="sm" tone="muted">{subtitle}</Text>
        </header>
        <nav aria-label={t('navigation')} className="flex gap-1 overflow-x-auto lg:hidden">
          {links.map(({ to, label }) => <ButtonLink key={to} to={to}
            variant={pathname.startsWith(to) ? 'secondary' : 'ghost'} className="min-h-11 shrink-0">{label}</ButtonLink>)}
        </nav>
        {children}
      </section>
      <aside className="hidden w-64 shrink-0 space-y-4 xl:block xl:sticky xl:top-20">
        <Card as="section" className="space-y-4 rounded-2xl">
          <Lightbulb size={24} className="text-action-accent" />
          <Heading level={2} className="text-base font-bold">{t('guide.title')}</Heading>
          <ol className="list-inside list-decimal space-y-3 text-sm text-text-secondary">
            <li>{t('guide.subject')}</li><li>{t('guide.proposal')}</li><li>{t('guide.practice')}</li>
          </ol>
        </Card>
        <Card as="section" className="space-y-3 rounded-2xl bg-surface-sunken">
          <FileQuestion size={24} className="text-text-muted" />
          <Heading level={2} className="text-base font-bold">{t('guide.quality')}</Heading>
          <Text size="sm" tone="muted">{t('guide.qualityHint')}</Text>
        </Card>
      </aside>
    </section>
  )
}
