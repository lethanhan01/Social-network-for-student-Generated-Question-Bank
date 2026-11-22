import { useRoutes, type RouteObject } from 'react-router-dom'
import { publicRoutes } from './public.routes'
import { commonRoutes } from './common.routes'
import { studentRoutes } from './student.routes'
import { teacherRoutes } from './teacher.routes'
import { RootRedirect } from './RootRedirect'
import NotFoundPage from '@/pages/common/not-found/NotFoundPage'

const APP_ROUTES: RouteObject[] = [
  ...publicRoutes,
  ...commonRoutes,
  ...studentRoutes,
  ...teacherRoutes,
  { path: '/', element: <RootRedirect /> },
  { path: '/dashboard', element: <RootRedirect /> },
  { path: '*', element: <NotFoundPage /> },
]

export function AppRoutes() {
  return useRoutes(APP_ROUTES)
}

export * from './types'
