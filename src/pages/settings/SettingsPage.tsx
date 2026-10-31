import { BlockedSettings } from './BlockedSettings'
import { useLanguageSwitch } from '@/hooks/useLanguageSwitch'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Palette, ShieldCheck, Bell, Monitor } from 'lucide-react'
import { Page, PageHeader } from '@/components/ui/layout'
import { Card } from '@/components/ui/data-display/Card'
import { Button } from '@/components/ui/actions/Button'
import { FormField, Select } from '@/components/ui/forms'
import { useThemeStore, type Theme } from '@/stores/themeStore'
import { cn } from '@/utils/cn'
import { DeviceSettings } from './DeviceSettings'
import { SecuritySettings } from './SecuritySettings'
import { PushSettings } from './PushSettings'

const tabs = [
  { key: 'appearance', icon: Palette },
  { key: 'security', icon: ShieldCheck },
  { key: 'notifications', icon: Bell },
  { key: 'devices', icon: Monitor },
  { key: 'blocked', icon: ShieldCheck },
] as const
function AppearanceSettings() {
  const { t } = useTranslation('portal')
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const { currentLanguage, changeLanguage } = useLanguageSwitch()
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">{t('settings.appearance')}</h2>
      <p className="text-sm text-fg-secondary">{t('settings.appearanceDescription')}</p>
      <FormField htmlFor="portal-settingspage-0" label={t('settings.theme')}>
        <Select
          id="portal-settingspage-0"
          ariaLabel={t('settings.theme')}
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
          options={(['dark', 'light', 'system'] as const).map((value) => ({
            value,
            label: t(`settings.themes.${value}`),
          }))}
        />
      </FormField>
      <FormField htmlFor="portal-settingspage-1" label={t('settings.language')}>
        <Select
          id="portal-settingspage-1"
          ariaLabel={t('settings.language')}
          value={currentLanguage.startsWith('ja') ? 'ja' : 'vi'}
          onValueChange={(value) => void changeLanguage(value === 'ja' ? 'ja' : 'vi')}
          options={[
            { value: 'vi', label: t('settings.languages.vi') },
            { value: 'ja', label: t('settings.languages.ja') },
          ]}
        />
      </FormField>
    </section>
  )
}
export default function SettingsPage() {
  const { t } = useTranslation('portal')
  const [params, setParams] = useSearchParams()
  const active = tabs.find((tab) => tab.key === params.get('tab'))?.key ?? 'appearance'
  return (
    <Page>
      <PageHeader eyebrow={t('eyebrow')} title={t('settings.title')} description={t('settings.description')} />
      <section className="grid gap-6 lg:grid-cols-4">
        <nav className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch" aria-label={t('settings.title')}>
          {tabs.map(({ key, icon: Icon }) => (
            <Button
              key={key}
              variant="ghost"
              aria-pressed={active === key}
              className={cn(
                'min-h-11 justify-start gap-3',
                active === key ? 'bg-action-accent-soft text-action-accent' : ''
              )}
              onClick={() => setParams({ tab: key }, { replace: true })}
            >
              <Icon size={19} />
              {t(`settings.${key}`)}
            </Button>
          ))}
        </nav>
        <Card as="section" className="lg:col-span-3 p-5 sm:p-8">
          {active === 'appearance' ? (
            <AppearanceSettings />
          ) : active === 'security' ? (
            <SecuritySettings />
          ) : active === 'notifications' ? (
            <PushSettings />
          ) : active === 'blocked' ? (
            <BlockedSettings />
          ) : (
            <DeviceSettings />
          )}
        </Card>
      </section>
    </Page>
  )
}
