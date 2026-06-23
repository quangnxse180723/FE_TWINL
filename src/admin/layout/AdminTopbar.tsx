import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth/authApi'
import { PATHS } from '../../routes/paths'
import { logout } from '../../store/slices/authSlice'
import { clearAuth } from '../../utils/authStorage'
import type { RootState } from '../../store'
import { Menu } from 'lucide-react'
import NotificationBell from '../../components/shared/NotificationBell'

export default function AdminTopbar({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      clearAuth()
      dispatch(logout())
      navigate(PATHS.login)
    }
  }

  return (
    <div className="admin__topbar" style={{ justifyContent: 'space-between' }}>
      <div className="admin__topbar-left">
        <button type="button" className="admin__icon-button" onClick={toggleSidebar} style={{ padding: '8px' }}>
          <Menu size={20} />
        </button>
      </div>
      <div className="admin__topbar-actions">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <NotificationBell />
        </div>
        <button type="button" className="admin__icon-button">⚙️</button>
        <button type="button" className="admin__logout" onClick={handleLogout}>
          Đăng xuất
        </button>
        <div className="admin__profile">
          <div className="admin__profile-avatar">
            {user?.displayName?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <div className="admin__profile-name">{user?.displayName || 'Admin User'}</div>
            <div className="admin__profile-role">SUPER ADMIN</div>
          </div>
        </div>
      </div>
    </div>
  )
}
