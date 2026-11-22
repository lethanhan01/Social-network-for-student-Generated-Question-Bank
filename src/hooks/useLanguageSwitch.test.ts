import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLanguageSwitch } from './useLanguageSwitch'
import i18n, { preloadNamespaces } from '@/lib/i18n'

describe('useLanguageSwitch Hook (useLanguageSwitch.ts)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('vi')
  })

  it('initializes with current i18n language', () => {
    const { result } = renderHook(() => useLanguageSwitch())
    expect(result.current.currentLanguage).toBe('vi')
    expect(result.current.isRTL).toBe(false)
    expect(document.documentElement.lang).toBe('vi')
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('switches language, lazy-loads ja bundle, and synchronizes document attributes', async () => {
    const { result } = renderHook(() => useLanguageSwitch())

    await act(async () => {
      await result.current.changeLanguage('ja')
    })

    expect(result.current.currentLanguage).toBe('ja')
    expect(document.documentElement.lang).toBe('ja')
    expect(document.documentElement.dir).toBe('ltr')
    expect(localStorage.getItem('gym-locale')).toBe('ja')
    expect(i18n.hasResourceBundle('ja', 'common')).toBe(true)
  })

  it('preloads feature namespaces on demand and excludes legacy RoGym namespaces', async () => {
    await preloadNamespaces(['academic'])
    expect(i18n.hasResourceBundle('vi', 'academic')).toBe(true)
    const initialResources = (i18n.options.resources?.vi ?? {}) as Record<string, unknown>
    for (const legacy of ['member', 'trainer', 'owner', 'staff', 'home']) {
      expect(initialResources[legacy]).toBeUndefined()
    }
  })
})
