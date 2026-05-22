import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { RootState } from '../../store'
import { PATHS } from '../../routes/paths'

interface StaffGuardProps {
  children: ReactNode
}

export default function StaffGuard({ children }: StaffGuardProps) {
  const user = useSelector((state: RootState) => state.auth.user)

  if (!user) {
    return <Navigate to={PATHS.login} replace />
  }

  const isStaff = user.roles?.some((role) => role === 'STAFF' || role === 'ADMIN')
  if (!isStaff) {
    return <Navigate to={PATHS.home} replace />
  }

  return <>{children}</>
}
