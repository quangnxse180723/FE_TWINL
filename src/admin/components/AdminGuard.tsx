import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { RootState } from '../../store'
import { PATHS } from '../../routes/paths'

interface AdminGuardProps {
  children: ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const user = useSelector((state: RootState) => state.auth.user)

  if (!user) {
    return <Navigate to={PATHS.login} replace />
  }

  const isAdmin = user.roles?.some((role) => role === 'ADMIN')
  if (!isAdmin) {
    return <Navigate to={PATHS.home} replace />
  }

  return <>{children}</>
}
