import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const AuthLayout = lazy(() => import('@/layouts/AuthLayout'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const DesignSystemShowcasePage = lazy(() => import('@/pages/dev/DesignSystemShowcasePage'))

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
  {
    path: '/showcase',
    element: <DesignSystemShowcasePage />,
  },
]

