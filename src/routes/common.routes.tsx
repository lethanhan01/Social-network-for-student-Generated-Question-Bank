import { lazy, type ComponentType } from 'react'
import type { RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '@/components/shared/protected-route/ProtectedRoute'
import { preloadNamespaces, type AppNamespace } from '@/lib/i18n'

const lazyWithNs = <T extends { default: ComponentType }>(
  loader: () => Promise<T>,
  ns: AppNamespace[]
) => lazy(() => Promise.all([loader(), preloadNamespaces(ns)]).then(([mod]) => mod))

const SocialLayout = lazy(() => import('@/layouts/SocialLayout'))
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'))

const FeedPage = lazyWithNs(() => import('@/pages/common/feed/FeedPage'), ['portal'])
const PostDetailPage = lazyWithNs(() => import('@/pages/common/post/PostDetailPage'), ['portal'])
const ProfilePage = lazyWithNs(() => import('@/pages/common/profile/ProfilePage'), ['portal'])
const FriendsPage = lazyWithNs(() => import('@/pages/common/friends/FriendsPage'), ['portal'])
const SearchPage = lazyWithNs(() => import('@/pages/common/search/SearchPage'), ['portal'])
const ChatPage = lazyWithNs(() => import('@/pages/common/chat/ChatPage'), ['chat', 'portal'])
const SettingsPage = lazyWithNs(() => import('@/pages/common/settings/SettingsPage'), ['portal'])
const NotificationsPage = lazyWithNs(() => import('@/pages/common/notifications/NotificationsPage'), ['portal'])

export const commonRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <SocialLayout />,
        children: [
          { path: '/feed', element: <FeedPage /> },
          { path: '/posts/:id', element: <PostDetailPage /> },
          { path: '/profile/:userId', element: <ProfilePage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/friends', element: <FriendsPage /> },
          { path: '/search', element: <SearchPage /> },
        ],
      },
      {
        element: <DashboardLayout />,
        children: [
          { path: '/messages', element: <ChatPage /> },
          { path: '/messages/:conversationId', element: <ChatPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
        ],
      },
    ],
  },
]
