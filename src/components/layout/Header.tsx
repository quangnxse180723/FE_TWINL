import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { PATHS } from '../../routes/paths'
import SearchBar from '../shared/SearchBar'
import { authApi } from '../../api/auth/authApi'
import { logout } from '../../store/slices/authSlice'
import { clearAuth } from '../../utils/authStorage'
import type { RootState } from '../../store'
import '../../styles/components/header.css'

export default function Header() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      clearAuth()
      dispatch(logout())
    }
  }

  return (
    <header className="header">
      <div className="header__promo">
        <span>Giảm 10 % khi đăng ký mua hàng đầu tiên</span>
      </div>
      <div className="header__main">
        <Link to={PATHS.home} className="header__logo">
          Twinl
        </Link>
        <SearchBar />
        <nav className="header__actions">
          {user ? (
            <>
              <span>Xin chào, {user.displayName}</span>
              <button type="button" className="header__link" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to={PATHS.register}>Đăng ký</Link>
              <Link to={PATHS.login}>Đăng nhập</Link>
            </>
          )}
          <button type="button" className="header__cta">
            Bán ngay
          </button>
        </nav>
      </div>
      <div className="header__nav">
        <Link to={PATHS.home}>Nữ</Link>
        <Link to={PATHS.home}>Nam</Link>
        <Link to={PATHS.home}>Trẻ em</Link>
        <Link to={PATHS.home}>Thương hiệu</Link>
        <Link to={PATHS.home}>Thể thao</Link>
        <Link to={PATHS.home}>Xu hướng</Link>
        <Link to={PATHS.home}>Liên hệ</Link>
      </div>
    </header>
  )
}
