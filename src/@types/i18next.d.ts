import type viPortal from '../locales/vi/portal.json'
import type viCommon from '../locales/vi/common.json'
import type viAuth from '../locales/vi/auth.json'
import type viValidation from '../locales/vi/validation.json'
import type viChat from '../locales/vi/chat.json'
import type viGamification from '../locales/vi/gamification.json'
import type viAcademic from '../locales/vi/academic.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof viCommon
      auth: typeof viAuth
      validation: typeof viValidation
      chat: typeof viChat
      portal: typeof viPortal
      gamification: typeof viGamification
      academic: typeof viAcademic
    }
  }
}
