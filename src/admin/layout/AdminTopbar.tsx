import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth/authApi'
import { PATHS } from '../../routes/paths'
import { logout } from '../../store/slices/authSlice'
import { clearAuth } from '../../utils/authStorage'
import type { RootState } from '../../store'

export default function AdminTopbar() {
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
    <div className="admin__topbar" style={{ justifyContent: 'flex-end' }}>
      <div className="admin__topbar-actions">
        <button type="button" className="admin__icon-button">🔔</button>
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
