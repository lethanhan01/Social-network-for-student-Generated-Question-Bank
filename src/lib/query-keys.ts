/**
 * query-keys.ts — Centralized TanStack Query Key Factory Pattern.
 * Nguồn chân lý duy nhất quản lý toàn bộ cache keys cho TanStack Query v5 trong SQB HUST.
 */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => ['auth', 'session'] as const,
    devices: () => ['auth', 'devices'] as const,
  },
  questions: {
    all: ['questions'] as const,
    list: (params?: Record<string, unknown>) => ['questions', 'list', params] as const,
    detail: (id: string | number) => ['questions', 'detail', id] as const,
    bySubject: (subjectId: string | number) => ['questions', 'bySubject', subjectId] as const,
    statistics: (id: number) => ['questions', 'statistics', id] as const,
    ratings: (id: number) => ['questions', 'ratings', id] as const,
  },
  exams: {
    all: ['exams'] as const,
    list: (params?: Record<string, unknown>) => ['exams', 'list', params] as const,
    detail: (id: string | number) => ['exams', 'detail', id] as const,
  },
  subjects: {
    all: ['subjects'] as const,
    list: () => ['subjects', 'list'] as const,
    detail: (id: string | number) => ['subjects', 'detail', id] as const,
  },
  posts: {
    all: ['posts'] as const,
    feed: (params?: Record<string, unknown>) => ['posts', 'feed', params] as const,
    detail: (id: string | number) => ['posts', 'detail', id] as const,
    comments: (postId: string | number) => ['posts', postId, 'comments'] as const,
    userPosts: (userId: number, params?: Record<string, unknown>) => ['posts', 'user', userId, params] as const,
    videos: (params?: Record<string, unknown>) => ['posts', 'videos', params] as const,
    /** Client-side cache of the reaction type the current user picked (API only exposes a boolean on posts). */
    myReaction: (id: string | number) => ['posts', 'myReaction', id] as const,
    /** Posts created in this session; shown on top of the feed (server response, not mock data). */
    recentlyCreated: () => ['posts', 'recentlyCreated'] as const,
  },
  comments: {
    all: ['comments'] as const,
    byPost: (postId: number, params?: Record<string, unknown>) => ['comments', 'post', postId, params] as const,
    replies: (postId: number, parentId: number, params?: Record<string, unknown>) =>
      ['comments', 'replies', postId, parentId, params] as const,
  },
  users: {
    all: ['users'] as const,
    profile: (id?: string | number) => ['users', 'profile', id] as const,
    search: (query: string) => ['users', 'search', query] as const,
    relationshipStats: (id: number) => ['users', 'relationshipStats', id] as const,
  },
  relationships: {
    all: ['relationships'] as const,
    friends: (params?: Record<string, unknown>) => ['relationships', 'friends', params] as const,
    sentRequests: (params?: Record<string, unknown>) => ['relationships', 'requests', 'sent', params] as const,
    receivedRequests: (params?: Record<string, unknown>) => ['relationships', 'requests', 'received', params] as const,
    followers: (params?: Record<string, unknown>) => ['relationships', 'followers', params] as const,
    following: (params?: Record<string, unknown>) => ['relationships', 'following', params] as const,
    blocked: (params?: Record<string, unknown>) => ['relationships', 'blocked', params] as const,
  },
  feed: {
    all: ['feed'] as const,
    activity: (params?: Record<string, unknown>) => ['feed', 'activity', params] as const,
    newCount: (since?: string) => ['feed', 'newCount', since] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    inbox: () => ['conversations', 'inbox'] as const,
    messageThread: (id: number) => ['conversations', 'messages', id] as const,
    list: (params?: Record<string, unknown>) => ['conversations', 'list', params] as const,
    detail: (id: number) => ['conversations', 'detail', id] as const,
    members: (id: number) => ['conversations', 'members', id] as const,
    messages: (id: number, params?: Record<string, unknown>) => ['conversations', 'messages', id, params] as const,
    hidden: () => ['conversations', 'hidden'] as const,
  },
  courses: {
    all: ['courses'] as const,
    classes: (params?: Record<string, unknown>) => ['courses', 'classes', params] as const,
    detail: (id: number) => ['courses', 'detail', id] as const,
    students: (id: number) => ['courses', 'students', id] as const,
    myClasses: () => ['courses', 'myClasses'] as const,
    lecturers: () => ['courses', 'lecturers'] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    mySubmissions: (params?: Record<string, unknown>) => ['sessions', 'mySubmissions', params] as const,
    detail: (id: number) => ['sessions', 'detail', id] as const,
    enrolledSubjects: () => ['sessions', 'enrolledSubjects'] as const,
    pending: (params?: Record<string, unknown>) => ['sessions', 'pending', params] as const,
  },
  practice: {
    all: ['practice'] as const,
    questions: (sessionId: number) => ['practice', 'session', sessionId, 'questions'] as const,
    userSessions: (userId: number) => ['practice', 'user', userId, 'sessions'] as const,
  },
  gamification: {
    all: ['gamification'] as const,
    checkIn: () => ['gamification', 'checkIn'] as const,
    leaderboard: (params?: Record<string, unknown>) => ['gamification', 'leaderboard', params] as const,
    myPredictions: (params?: Record<string, unknown>) => ['gamification', 'predictions', params] as const,
    activeSession: () => ['gamification', 'activeSession'] as const,
    game1Classes: () => ['gamification', 'game1Classes'] as const,
    badges: () => ['gamification', 'badges'] as const,
    myBadges: () => ['gamification', 'myBadges'] as const,
    userBadges: (userId: number) => ['gamification', 'badges', 'user', userId] as const,
  },
  cosmetics: {
    all: ['cosmetics'] as const,
    shop: (params?: Record<string, unknown>) => ['cosmetics', 'shop', params] as const,
    inventory: () => ['cosmetics', 'inventory'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: () => ['notifications', 'unread'] as const,
    list: (params?: Record<string, unknown>) => ['notifications', 'list', params] as const,
    pushSettings: () => ['notifications', 'pushSettings'] as const,
  },
  search: {
    all: ['search'] as const,
    results: (params: Record<string, unknown>) => ['search', 'results', params] as const,
    saved: () => ['search', 'saved'] as const,
  },
} as const
