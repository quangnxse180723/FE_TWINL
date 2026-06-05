import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { PATHS } from '../../routes/paths'
import SearchBar from '../shared/SearchBar'
import NotificationBell from '../shared/NotificationBell'
import { authApi } from '../../api/auth/authApi'
import cartApi from '../../api/cart/cartApi'
import { logout } from '../../store/slices/authSlice'
import { clearAuth } from '../../utils/authStorage'
import { API_BASE_URL } from '../../config/constants'
import logo from '../../assets/images/logo-removebg.png'
import type { RootState } from '../../store'
import '../../styles/components/header.css'

export default function Header() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const [cartCount, setCartCount] = useState(0)
  const avatarSrc = user?.avatarUrl
    ? user.avatarUrl.startsWith('http')
      ? user.avatarUrl
      : `${API_BASE_URL}${user.avatarUrl}`
    : null

  useEffect(() => {
    if (!user) {
      setCartCount(0)
      return
    }

    let active = true
    const fetchCart = async () => {
      try {
        const response = await cartApi.getCart()
        if (!active) return
        setCartCount(response.data.items?.length ?? 0)
      } catch {
        if (active) setCartCount(0)
      }
    }

    fetchCart()

    const onCartUpdated = (e: Event) => {
      if (e instanceof CustomEvent && typeof e.detail === 'number') {
        setCartCount(e.detail)
      } else {
        fetchCart()
      }
    }
    window.addEventListener('cart-updated', onCartUpdated)

    return () => {
      active = false
      window.removeEventListener('cart-updated', onCartUpdated)
    }
  }, [user])

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
          <img src={logo} alt="Twinl" />
        </Link>
        <SearchBar />
        <nav className="header__actions">
          <Link to={PATHS.cart} id="header-cart-icon" className="header__cart" aria-label="Giỏ hàng">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M7 4h-2l-1 2m2 0h13l-1.6 7.2a2 2 0 0 1-2 1.6h-6.9a2 2 0 0 1-2-1.6l-1.5-6.2zm2.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {cartCount > 0 ? <span className="header__cart-count">{cartCount}</span> : null}
          </Link>
          {user ? (
            <>
              <NotificationBell />
              <Link to={PATHS.profile} className="header__user">
                <span className="header__avatar">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={user.displayName} />
                  ) : (
                    <span>{user.displayName?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </span>
                <span>Xin chào, {user.displayName}</span>
              </Link>
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
        </nav>
      </div>
      <div className="header__nav">
        <Link to={PATHS.women}>Nữ</Link>
        <Link to={PATHS.men}>Nam</Link>
        <Link to={PATHS.kids}>Trẻ em</Link>
        <Link to={PATHS.brands}>Thương hiệu</Link>
        <Link to={PATHS.sport}>Thể thao</Link>
        <Link to={PATHS.contact}>Liên hệ</Link>
      </div>
    </header>
  )
}
