import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { ShoppingBag, LogIn, Globe, LogOut, User, Menu, X } from 'lucide-react'
import { PATHS } from '../../routes/paths'
import NotificationBell from '../shared/NotificationBell'
import { authApi } from '../../api/auth/authApi'
import cartApi from '../../api/cart/cartApi'
import { categoriesApi } from '../../api/categories/categoriesApi'
import type { Category } from '../../api/categories/categoriesApi'
import { logout } from '../../store/slices/authSlice'
import { clearAuth } from '../../utils/authStorage'
import { API_BASE_URL } from '../../config/constants'
import logo from '../../assets/images/logo-removebg.png'
import type { RootState } from '../../store'
import '../../styles/components/header.css'

export default function Header() {
  
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

  const [currentLang, setCurrentLang] = useState('vi')

  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/vi\/([a-z]{2})/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }
  }, []);

  const toggleLang = () => {
    const newLang = currentLang === 'vi' ? 'en' : 'vi'
    document.cookie = `googtrans=/vi/${newLang}; path=/`
    window.location.reload()
  }

  const [categories, setCategories] = useState<Category[]>([])
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.list()
        setCategories(data)
      } catch (err) {
        console.error('Failed to fetch categories', err)
      }
    }
    fetchCategories()
  }, [])

  const navLinks = [
    { to: PATHS.women,   label: 'Nữ' },
    { to: PATHS.men,     label: 'Nam' },
    { to: PATHS.sport,   label: 'Thể thao' },
    { to: PATHS.contact, label: 'Liên hệ' },
  ]

  const isActive = (path: string) => location.pathname === path

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
            {navLinks.map(({ to, label }) => {
              const hasDropdown = ['Nữ', 'Nam', 'Thể thao'].includes(label)
              return (
                <div 
                  key={to} 
                  className="fh__nav-item-wrapper" 
                  style={{ position: 'relative' }}
                  onMouseEnter={() => hasDropdown && setHoveredNav(label)}
                  onMouseLeave={() => hasDropdown && setHoveredNav(null)}
                >
                  <Link
                    to={to}
                    className={`fh__nav-link${isActive(to) ? ' fh__nav-link--active' : ''}`}
                  >
                    {label}
                    {isActive(to) && <span className="fh__nav-dot" aria-hidden="true" />}
                  </Link>

                  {/* Dropdown Menu */}
                  {(() => {
                    if (!hasDropdown || hoveredNav !== label) return null;
                    const activeCategory = categories.find(c => c.name === label);
                    if (!activeCategory || !activeCategory.children || activeCategory.children.length === 0) return null;

                    return (
                      <div className="fh__dropdown" style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '10px',
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        minWidth: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        zIndex: 100
                      }}>
                        <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '12px', background: '#fff', rotate: '45deg' }} />
                        <div style={{ position: 'absolute', top: '-10px', left: 0, right: 0, height: '10px', background: 'transparent' }} />
                        
                        {activeCategory.children.map(child => (
                          <Link 
                            key={child.id}
                            to={`${to}?category=${encodeURIComponent(child.name)}`}
                            className="fh__dropdown-link"
                            style={{ fontSize: '13px', fontWeight: 500, color: '#333', textDecoration: 'none', padding: '4px 0' }}
                            onClick={() => setHoveredNav(null)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )
            })}
          </nav>

          {/* RIGHT – Action Pill */}
          <div className="fh__action-pill">
            {/* Cart */}
            <Link to={PATHS.cart} className="fh__action-btn" aria-label={'Giỏ hàng'}>
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
                <button type="button" onClick={handleLogout} className="fh__action-btn fh__action-btn--logout" title={'Đăng xuất'}>
                  <LogOut size={17} strokeWidth={1.6} />
                </button>
              </div>
            ) : (
              <Link to={PATHS.login} className="fh__action-btn" aria-label={'Đăng nhập'}>
                <LogIn size={18} strokeWidth={1.6} />
              </Link>
            )}

            {/* Language */}
              <button type="button" onClick={toggleLang} className="fh__action-btn fh__lang-btn" aria-label="Switch language">
                <Globe size={17} strokeWidth={1.6} />
                <span className="fh__lang-label">{currentLang === 'vi' ? 'VI' : 'EN'}</span>
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
              <ShoppingBag size={18} /> {'Giỏ hàng'} {cartCount > 0 && `(${cartCount})`}
            </Link>
            {user ? (
              <>
                <Link to={PATHS.profile} className="fh__mobile-action-item">
                  <User size={18} /> {user.displayName}
                </Link>
                <button type="button" onClick={handleLogout} className="fh__mobile-action-item">
                  <LogOut size={18} /> {'Đăng xuất'}
                </button>
              </>
            ) : (
              <Link to={PATHS.login} className="fh__mobile-action-item">
                <LogIn size={18} /> {'Đăng nhập'}
              </Link>
            )}
            <button type="button" onClick={toggleLang} className="fh__mobile-action-item">
              <Globe size={18} /> Ngôn ngữ
            </button>
          </div>
        </div>
      )}
    </>
  )
}
