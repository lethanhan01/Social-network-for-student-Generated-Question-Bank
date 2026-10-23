/**
 * query-keys.ts — Centralized TanStack Query Key Factory Pattern.
 * Nguồn chân lý duy nhất quản lý toàn bộ cache keys cho TanStack Query v5 trong SQB HUST.
 */

export const queryKeys = {
  questions: {
    all: ['questions'] as const,
    list: (params?: Record<string, unknown>) => ['questions', 'list', params] as const,
    detail: (id: string) => ['questions', 'detail', id] as const,
    bySubject: (subjectId: string) => ['questions', 'bySubject', subjectId] as const,
  },
  exams: {
    all: ['exams'] as const,
    list: (params?: Record<string, unknown>) => ['exams', 'list', params] as const,
    detail: (id: string) => ['exams', 'detail', id] as const,
  },
  subjects: {
    all: ['subjects'] as const,
    list: () => ['subjects', 'list'] as const,
    detail: (id: string) => ['subjects', 'detail', id] as const,
  },
  posts: {
    all: ['posts'] as const,
    feed: (params?: Record<string, unknown>) => ['posts', 'feed', params] as const,
    detail: (id: string) => ['posts', 'detail', id] as const,
    comments: (postId: string) => ['posts', postId, 'comments'] as const,
  },
  users: {
    all: ['users'] as const,
    profile: (id?: string) => ['users', 'profile', id] as const,
    search: (query: string) => ['users', 'search', query] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: () => ['notifications', 'unread'] as const,
    list: (params?: Record<string, unknown>) => ['notifications', 'list', params] as const,
  },
} as const
