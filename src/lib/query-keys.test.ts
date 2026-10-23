import { describe, it, expect } from 'vitest'
import { queryKeys } from './query-keys'

describe('query-keys.ts — Centralized TanStack Query Key Factory Pattern', () => {
  it('defines all SQB core domains', () => {
    const domains = [
      'questions',
      'exams',
      'subjects',
      'posts',
      'users',
      'notifications',
    ] as const

    for (const domain of domains) {
      expect(queryKeys, `Domain "${domain}" must be defined`).toHaveProperty(domain)
    }
  })

  it('produces correct query key tuples for questions', () => {
    expect(queryKeys.questions.all).toEqual(['questions'])
    expect(queryKeys.questions.list({ page: 1 })).toEqual(['questions', 'list', { page: 1 }])
    expect(queryKeys.questions.detail('q-123')).toEqual(['questions', 'detail', 'q-123'])
    expect(queryKeys.questions.bySubject('sub-1')).toEqual(['questions', 'bySubject', 'sub-1'])
  })

  it('produces correct query key tuples for exams', () => {
    expect(queryKeys.exams.all).toEqual(['exams'])
    expect(queryKeys.exams.list()).toEqual(['exams', 'list', undefined])
    expect(queryKeys.exams.detail('ex-456')).toEqual(['exams', 'detail', 'ex-456'])
  })

  it('produces correct query key tuples for subjects', () => {
    expect(queryKeys.subjects.all).toEqual(['subjects'])
    expect(queryKeys.subjects.list()).toEqual(['subjects', 'list'])
    expect(queryKeys.subjects.detail('s-789')).toEqual(['subjects', 'detail', 's-789'])
  })

  it('produces correct query key tuples for posts and comments', () => {
    expect(queryKeys.posts.all).toEqual(['posts'])
    expect(queryKeys.posts.feed({ page: 1 })).toEqual(['posts', 'feed', { page: 1 }])
    expect(queryKeys.posts.detail('p-1')).toEqual(['posts', 'detail', 'p-1'])
    expect(queryKeys.posts.comments('p-1')).toEqual(['posts', 'p-1', 'comments'])
  })

  it('produces correct query key tuples for users and notifications', () => {
    expect(queryKeys.users.all).toEqual(['users'])
    expect(queryKeys.users.profile('u-1')).toEqual(['users', 'profile', 'u-1'])
    expect(queryKeys.users.search('An')).toEqual(['users', 'search', 'An'])

    expect(queryKeys.notifications.all).toEqual(['notifications'])
    expect(queryKeys.notifications.unread()).toEqual(['notifications', 'unread'])
    expect(queryKeys.notifications.list({ unreadOnly: true })).toEqual([
      'notifications',
      'list',
      { unreadOnly: true },
    ])
  })
})
