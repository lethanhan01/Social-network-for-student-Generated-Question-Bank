import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '@/components/shared/protected-route/ProtectedRoute'

const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'))

const TeacherDashboardPage = lazy(() => import('@/pages/teacher/TeacherDashboardPage'))
const TeacherClassesPage = lazy(() => import('@/pages/teacher/TeacherClassesPage'))
const TeacherReviewsPage = lazy(() => import('@/pages/teacher/TeacherReviewsPage'))
const TeacherExamsPage = lazy(() => import('@/pages/teacher/TeacherExamsPage'))
const TeacherAcademicPage = lazy(() => import('@/pages/teacher/TeacherAcademicPage'))
const TeacherReportsPage = lazy(() => import('@/pages/teacher/TeacherReportsPage'))

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
          { path: '/teacher/academic', element: <TeacherAcademicPage /> },
          { path: '/teacher/reports', element: <TeacherReportsPage /> },
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

