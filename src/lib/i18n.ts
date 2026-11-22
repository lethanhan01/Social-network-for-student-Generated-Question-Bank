import i18n, { type BackendModule } from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import viCommon from '../locales/vi/common.json'

export type AppNamespace =
  | 'common'
  | 'auth'
  | 'validation'
  | 'chat'
  | 'portal'
  | 'gamification'
  | 'academic'

type LocaleLoader = () => Promise<{ default: Record<string, unknown> }>

const LOCALE_LOADERS: Record<string, Record<AppNamespace, LocaleLoader>> = {
  vi: {
    common: () => Promise.resolve({ default: viCommon as unknown as Record<string, unknown> }),
    auth: () => import('../locales/vi/auth.json'),
    validation: () => import('../locales/vi/validation.json'),
    chat: () => import('../locales/vi/chat.json'),
    portal: () => import('../locales/vi/portal.json'),
    gamification: () => import('../locales/vi/gamification.json'),
    academic: () => import('../locales/vi/academic.json'),
  },
  ja: {
    common: () => import('../locales/ja/common.json'),
    auth: () => import('../locales/ja/auth.json'),
    validation: () => import('../locales/ja/validation.json'),
    chat: () => import('../locales/ja/chat.json'),
    portal: () => import('../locales/ja/portal.json'),
    gamification: () => import('../locales/ja/gamification.json'),
    academic: () => import('../locales/ja/academic.json'),
  },
}

const dynamicLocaleBackend: BackendModule = {
  type: 'backend',
  init() {
    // no-op
  },
  read(language, namespace, callback) {
    const langKey = language.split('-')[0]
    const loader = LOCALE_LOADERS[langKey]?.[namespace as AppNamespace]
    if (!loader) {
      callback(null, {})
      return
    }
    loader()
      .then((mod) => callback(null, mod.default))
      .catch((err) => callback(err as Error, null))
  },
}

const initialLng =
  typeof localStorage !== 'undefined' ? (localStorage.getItem('gym-locale') ?? 'vi') : 'vi'

void i18n
  .use(dynamicLocaleBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { common: viCommon },
    },
    partialBundledLanguages: true,
    lng: initialLng,
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'ja'],
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'gym-locale',
      caches: ['localStorage'],
    },
  })

if (initialLng !== 'vi') {
  void i18n.loadNamespaces('common')
}

export async function preloadNamespaces(namespaces: AppNamespace[]): Promise<void> {
  if (namespaces.length === 0) return
  await i18n.loadNamespaces(namespaces)
}

export default i18n
