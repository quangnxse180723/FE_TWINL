import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { RootState } from '../../store'
import { PATHS } from '../../routes/paths'

interface ShipperGuardProps {
  children: ReactNode
}

export default function ShipperGuard({ children }: ShipperGuardProps) {
  const user = useSelector((state: RootState) => state.auth.user)

  if (!user) {
    return <Navigate to={PATHS.login} replace />
  }

  const isShipper = user.roles?.some((role) => role === 'SHIPPER')
  if (!isShipper) {
    return <Navigate to={PATHS.home} replace />
  }

  return <>{children}</>
}
