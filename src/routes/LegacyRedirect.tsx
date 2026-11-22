import { generatePath, Navigate, useLocation, useParams } from 'react-router-dom'

export function LegacyRedirect({ to }: Readonly<{ to: string }>) {
  const params = useParams()
  const { search } = useLocation()
  return <Navigate to={`${generatePath(to, params)}${search}`} replace />
}
