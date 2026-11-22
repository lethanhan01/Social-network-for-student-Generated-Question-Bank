import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { preloadNamespaces } from '@/lib/i18n'

const AuthLayout = lazy(() => import('@/layouts/AuthLayout'))
const LoginPage = lazy(() =>
  Promise.all([import('@/pages/auth/LoginPage'), preloadNamespaces(['auth', 'validation'])]).then(
    ([mod]) => mod
  )
)

export const publicRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
]

