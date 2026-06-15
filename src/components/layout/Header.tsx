import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, LogIn, Globe, LogOut, User, Menu, X } from 'lucide-react'
import { PATHS } from '../../routes/paths'
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
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const location = useLocation()
  const user = useSelector((state: RootState) => state.auth.user)
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [isOnDark, setIsOnDark] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const avatarSrc = user?.avatarUrl
    ? user.avatarUrl.startsWith('http')
      ? user.avatarUrl
      : `${API_BASE_URL}${user.avatarUrl}`
    : null

  // Scroll detection for header shadow/backdrop intensify and dark mode drop
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      
      let overDark = false
      const headerBottom = 75 // Approximate header height + padding
      const darkSections = document.querySelectorAll('.dark-section')
      
      darkSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= headerBottom && rect.bottom >= 30) {
          overDark = true
        }
      })
      
      // Mặc định: nếu ở homepage mà chưa scroll quá 20px thì coi như isOnDark = true (hero luôn ở trên cùng)
      if (window.scrollY < 20 && document.body.contains(document.querySelector('.hp-hero'))) {
        overDark = true
      }

      setIsOnDark(overDark)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // Init state
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!user) { setCartCount(0); return }
    let active = true
    const fetchCart = async () => {
      try {
        const res = await cartApi.getCart()
        if (active) setCartCount(res.data.items?.length ?? 0)
      } catch { if (active) setCartCount(0) }
    }
    fetchCart()
    const onCartUpdated = (e: Event) => {
      if (e instanceof CustomEvent && typeof e.detail === 'number') setCartCount(e.detail)
      else fetchCart()
    }
    window.addEventListener('cart-updated', onCartUpdated)
    return () => { active = false; window.removeEventListener('cart-updated', onCartUpdated) }
  }, [user])

  const handleLogout = async () => {
    try { await authApi.logout() } finally { clearAuth(); dispatch(logout()) }
  }

  const toggleLang = () => {
    const currentLang = i18n.language || 'vi'
    i18n.changeLanguage(currentLang.startsWith('vi') ? 'en' : 'vi')
  }

  const navLinks = [
    { to: PATHS.women,   label: t('header.women') },
    { to: PATHS.men,     label: t('header.men') },
    { to: PATHS.kids,    label: t('header.kids') },
    { to: PATHS.sport,   label: t('header.sport') },
    { to: PATHS.contact, label: t('header.contact') },
  ]

  const isActive = (path: string) => location.pathname === path

  const isHome = location.pathname === '/'

  return (
    <>
      {/* ── FLOATING HEADER ─────────────────────────────────── */}
      <header className={[
        'fh',
        scrolled ? 'fh--scrolled' : '',
        isOnDark ? 'fh--on-dark' : '',
      ].filter(Boolean).join(' ')}>
        <div className="fh__inner">

          {/* LEFT – Logo (free-floating, uncontained) */}
          <Link to={PATHS.home} className="fh__logo" aria-label="TWINL Home">
            <img src={logo} alt="TWINL" />
          </Link>

          {/* CENTER – Navigation Pill */}
          <nav className="fh__nav-pill" aria-label="Main navigation">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`fh__nav-link${isActive(to) ? ' fh__nav-link--active' : ''}`}
              >
                {label}
                {isActive(to) && <span className="fh__nav-dot" aria-hidden="true" />}
              </Link>
            ))}
          </nav>

          {/* RIGHT – Action Pill */}
          <div className="fh__action-pill">
            {/* Cart */}
            <Link to={PATHS.cart} className="fh__action-btn" aria-label={t('header.cart')}>
              <ShoppingBag size={18} strokeWidth={1.6} />
              {cartCount > 0 && (
                <span className="fh__cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </Link>

            {/* Notification (only if logged in) */}
            {user && (
              <span className="fh__action-btn">
                <NotificationBell />
              </span>
            )}

            {/* Auth */}
            {user ? (
              <div className="fh__user-group">
                <Link to={PATHS.profile} className="fh__avatar-btn" title={user.displayName}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={user.displayName} className="fh__avatar-img" />
                  ) : (
                    <span className="fh__avatar-initial">
                      {user.displayName?.charAt(0).toUpperCase() || <User size={14} />}
                    </span>
                  )}
                </Link>
                <button type="button" onClick={handleLogout} className="fh__action-btn fh__action-btn--logout" title={t('header.logout')}>
                  <LogOut size={17} strokeWidth={1.6} />
                </button>
              </div>
            ) : (
              <Link to={PATHS.login} className="fh__action-btn" aria-label={t('header.login')}>
                <LogIn size={18} strokeWidth={1.6} />
              </Link>
            )}

            {/* Language */}
            <button type="button" onClick={toggleLang} className="fh__action-btn fh__lang-btn" aria-label="Switch language">
              <Globe size={17} strokeWidth={1.6} />
              <span className="fh__lang-label">{(i18n.language || 'vi').startsWith('vi') ? 'VI' : 'EN'}</span>
            </button>
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className="fh__hamburger"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── MOBILE DRAWER ───────────────────────────────────── */}
      {mobileOpen && (
        <div className="fh__mobile-drawer" role="dialog" aria-modal="true">
          <nav className="fh__mobile-nav">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`fh__mobile-link${isActive(to) ? ' fh__mobile-link--active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="fh__mobile-actions">
            <Link to={PATHS.cart} className="fh__mobile-action-item">
              <ShoppingBag size={18} /> {t('header.cart')} {cartCount > 0 && `(${cartCount})`}
            </Link>
            {user ? (
              <>
                <Link to={PATHS.profile} className="fh__mobile-action-item">
                  <User size={18} /> {user.displayName}
                </Link>
                <button type="button" onClick={handleLogout} className="fh__mobile-action-item">
                  <LogOut size={18} /> {t('header.logout')}
                </button>
              </>
            ) : (
              <Link to={PATHS.login} className="fh__mobile-action-item">
                <LogIn size={18} /> {t('header.login')}
              </Link>
            )}
            <button type="button" onClick={toggleLang} className="fh__mobile-action-item">
              <Globe size={18} /> {(i18n.language || 'vi').startsWith('vi') ? 'Tiếng Việt' : 'English'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
