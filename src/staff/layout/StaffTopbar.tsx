import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth/authApi'
import { PATHS } from '../../routes/paths'
import { logout } from '../../store/slices/authSlice'
import { clearAuth } from '../../utils/authStorage'
import type { RootState } from '../../store'
import { Menu } from 'lucide-react'

export default function StaffTopbar({ toggleSidebar }: { toggleSidebar?: () => void }) {
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
    <div className="admin__topbar">
      <div className="admin__topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button type="button" className="admin__icon-button" onClick={toggleSidebar} style={{ padding: '8px' }}>
          <Menu size={20} />
        </button>
        <div className="admin__search">
          <span className="admin__search-icon">🔍</span>
          <input type="text" placeholder="Tìm kiếm nhanh..." />
        </div>
      </div>
      <div className="admin__topbar-actions">
        <button type="button" className="admin__icon-button">🔔</button>
        <button type="button" className="admin__icon-button">⚙️</button>
        <button type="button" className="admin__logout" onClick={handleLogout}>
          Đăng xuất
        </button>
        <div className="admin__profile">
          <div className="admin__profile-avatar">
            {user?.displayName?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <div className="admin__profile-name">{user?.displayName || 'Staff User'}</div>
            <div className="admin__profile-role">STAFF</div>
          </div>
        </div>
      </div>
    </div>
  )
}
