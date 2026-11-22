import { lazy, type ComponentType } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '@/components/shared/protected-route/ProtectedRoute'
import { preloadNamespaces, type AppNamespace } from '@/lib/i18n'

const lazyWithNs = <T extends { default: ComponentType }>(
  loader: () => Promise<T>,
  ns: AppNamespace[]
) => lazy(() => Promise.all([loader(), preloadNamespaces(ns)]).then(([mod]) => mod))

const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'))

const TeacherDashboardPage = lazyWithNs(() => import('@/pages/teacher/TeacherDashboardPage'), ['academic'])
const TeacherClassesPage = lazyWithNs(() => import('@/pages/teacher/TeacherClassesPage'), ['academic'])
const TeacherReviewsPage = lazyWithNs(() => import('@/pages/teacher/TeacherReviewsPage'), ['academic'])
const TeacherExamsPage = lazyWithNs(() => import('@/pages/teacher/TeacherExamsPage'), ['academic'])

export const teacherRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute allowedRoles={['teacher', 'LECTURER', 'admin', 'ADMIN']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/teacher/dashboard', element: <TeacherDashboardPage /> },
          { path: '/teacher/classes', element: <TeacherClassesPage /> },
          { path: '/teacher/reviews', element: <TeacherReviewsPage /> },
          { path: '/teacher/exams', element: <TeacherExamsPage /> },
          { path: '/teacher/academic', element: <Navigate to="/teacher/dashboard" replace /> },
          { path: '/teacher/reports', element: <Navigate to="/teacher/dashboard" replace /> },
        ],
      },
    ],
  },
  // Legacy Redirects
  { path: '/exams', element: <Navigate to="/teacher/exams" replace /> },
  { path: '/lecturer/classes', element: <Navigate to="/teacher/classes" replace /> },
  { path: '/lecturer/reviews', element: <Navigate to="/teacher/reviews" replace /> },
  { path: '/lecturer/exams', element: <Navigate to="/teacher/exams" replace /> },
]
