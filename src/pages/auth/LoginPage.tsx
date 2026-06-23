import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PATHS } from '../../routes/paths'
import { useLoginMutation, useGoogleLoginMutation } from '../../hooks/useAuth'
import { useGoogleLogin } from '@react-oauth/google'
import { getApiErrorMessage } from '../../utils/apiError'

import type { RootState } from '../../store'
import logo from '../../assets/images/logo-removebg.png'
import '../../styles/pages/auth.css'

export default function LoginPage() {
  
  const loginMutation = useLoginMutation()
  const googleLoginMutation = useGoogleLoginMutation()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) {
      const isAdmin   = user.roles?.some((r) => r === 'ADMIN')
      const isStaff   = user.roles?.some((r) => r === 'STAFF')
      const isShipper = user.roles?.some((r) => r === 'SHIPPER')
      navigate(isAdmin ? PATHS.admin : isStaff ? PATHS.staff : isShipper ? PATHS.shipper : PATHS.home)
    }
  }, [navigate, user])

  useEffect(() => {
    if ((loginMutation.isSuccess || googleLoginMutation.isSuccess) && user) {
      const isAdmin   = user.roles?.some((r) => r === 'ADMIN')
      const isStaff   = user.roles?.some((r) => r === 'STAFF')
      const isShipper = user.roles?.some((r) => r === 'SHIPPER')
      navigate(isAdmin ? PATHS.admin : isStaff ? PATHS.staff : isShipper ? PATHS.shipper : PATHS.home)
    }
  }, [loginMutation.isSuccess, googleLoginMutation.isSuccess, navigate, user])

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tr) => googleLoginMutation.mutate(tr.access_token),
    onError:   ()   => console.error('Google login failed'),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <div className="auth-swiss">
      {/* ── LEFT: Typographic Manifesto ─────────────────── */}
      <div className="auth-left">
        <div className="auth-manifesto">
          <h1 className="auth-manifesto__headline">
            <span className="auth-manifesto__line">{'WEAR'}</span>
            <span className="auth-manifesto__line auth-manifesto__line--indent">{'THE'}</span>
            <span className="auth-manifesto__line">{'STORY.'}</span>
          </h1>
          <hr className="auth-manifesto__rule" />
          <p className="auth-manifesto__sub" style={{ whiteSpace: 'pre-line' }}>
            {'TRUST\nTHE PROCESS.'}
          </p>
        </div>

        <div className="auth-footnotes">
          <p className="auth-footnote"><sup>1</sup> {'1 AI Legit Check — mỗi sản phẩm đều được kiểm định bằng trí tuệ nhân tạo'}</p>
          <p className="auth-footnote"><sup>2</sup> {'2 48h Secure Escrow — tiền của bạn được bảo vệ cho đến khi xác nhận nhận hàng'}</p>
        </div>
      </div>

      {/* ── RIGHT: Form (no card/box) ────────────────────── */}
      <div className="auth-right">
        <Link to={PATHS.home}>
          <img src={logo} alt="TWINL" className="auth-logo-img" />
        </Link>
        <div style={{ textAlign: 'left' }}>
          <span className="auth-heading-badge">{'Đăng nhập'}</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="login-email">{'Email'}</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="auth-field__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="login-password">{'Mật khẩu'}</label>
            <div className="auth-field__pw-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="auth-field__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="auth-field__eye" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {loginMutation.isError && (
            <p className="auth-error">{getApiErrorMessage(loginMutation.error)}</p>
          )}
          {googleLoginMutation.isError && (
            <p className="auth-error">{getApiErrorMessage(googleLoginMutation.error)}</p>
          )}

          <div className="auth-forgot">
            <Link to={PATHS.forgotPassword}>{'Quên mật khẩu?'}</Link>
          </div>

          <button type="submit" className="auth-btn auth-btn--primary" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? '...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-divider">{'Hoặc'}</div>

        <button
          type="button"
          className="auth-btn auth-btn--google"
          onClick={() => handleGoogleLogin()}
          disabled={googleLoginMutation.isPending}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoginMutation.isPending ? '...' : 'Đăng nhập với Google'}
        </button>

        <div className="auth-footer">
          {'Chưa có tài khoản?'} <Link to={PATHS.register}>{'Tạo tài khoản'}</Link>
        </div>
      </div>
    </div>
  )
}
