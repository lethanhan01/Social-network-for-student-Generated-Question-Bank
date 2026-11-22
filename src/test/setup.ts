import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import i18n from '@/lib/i18n'
import viAuth from '@/locales/vi/auth.json'
import viValidation from '@/locales/vi/validation.json'
import viChat from '@/locales/vi/chat.json'
import viPortal from '@/locales/vi/portal.json'
import viGamification from '@/locales/vi/gamification.json'
import viAcademic from '@/locales/vi/academic.json'

// Pre-register vi bundles synchronously for deterministic Vitest assertions without async Suspense waits.
i18n.addResourceBundle('vi', 'auth', viAuth, true, true)
i18n.addResourceBundle('vi', 'validation', viValidation, true, true)
i18n.addResourceBundle('vi', 'chat', viChat, true, true)
i18n.addResourceBundle('vi', 'portal', viPortal, true, true)
i18n.addResourceBundle('vi', 'gamification', viGamification, true, true)
i18n.addResourceBundle('vi', 'academic', viAcademic, true, true)

afterEach(() => {
  cleanup()
})
