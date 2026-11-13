import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '@/components/shared/protected-route/ProtectedRoute'

const SocialLayout = lazy(() => import('@/layouts/SocialLayout'))
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'))

const FeedPage = lazy(() => import('@/pages/common/feed/FeedPage'))
const PostDetailPage = lazy(() => import('@/pages/common/post/PostDetailPage'))
const ProfilePage = lazy(() => import('@/pages/common/profile/ProfilePage'))
const FriendsPage = lazy(() => import('@/pages/common/friends/FriendsPage'))
const SearchPage = lazy(() => import('@/pages/common/search/SearchPage'))
const ChatPage = lazy(() => import('@/pages/common/chat/ChatPage'))
const SettingsPage = lazy(() => import('@/pages/common/settings/SettingsPage'))
const NotificationsPage = lazy(() => import('@/pages/common/notifications/NotificationsPage'))

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

