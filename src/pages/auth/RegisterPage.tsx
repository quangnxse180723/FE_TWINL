import { Eye, EyeOff, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PATHS } from '../../routes/paths'
import { useRegisterMutation, useGoogleLoginMutation, useSendOtpMutation } from '../../hooks/useAuth'
import { useGoogleLogin } from '@react-oauth/google'
import { getApiErrorMessage } from '../../utils/apiError'
import { toast } from 'react-toastify'

import type { RootState } from '../../store'
import logo from '../../assets/images/logo-removebg.png'
import '../../styles/pages/auth.css'

const OTP_LENGTH = 6

export default function RegisterPage() {
  
  const registerMutation    = useRegisterMutation()
  const googleLoginMutation = useGoogleLoginMutation()
  const sendOtpMutation     = useSendOtpMutation()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)

  const [displayName,      setDisplayName]      = useState('')
  const [email,            setEmail]            = useState('')
  const [password,         setPassword]         = useState('')
  const [confirmPassword,  setConfirmPassword]  = useState('')
  const [showPassword,     setShowPassword]     = useState(false)
  const [showConfirmPwd,   setShowConfirmPwd]   = useState(false)
  const [showOtpModal,     setShowOtpModal]     = useState(false)
  const [otpDigits,        setOtpDigits]        = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [timeLeft,         setTimeLeft]         = useState(300)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate(PATHS.home)
  }, [navigate, user])

  useEffect(() => {
    if (googleLoginMutation.isSuccess && user) {
      const isAdmin   = user.roles?.some((r) => r === 'ADMIN')
      const isStaff   = user.roles?.some((r) => r === 'STAFF')
      const isShipper = user.roles?.some((r) => r === 'SHIPPER')
      navigate(isAdmin ? PATHS.admin : isStaff ? PATHS.staff : isShipper ? PATHS.shipper : PATHS.home)
    }
  }, [googleLoginMutation.isSuccess, navigate, user])

  // OTP countdown timer
  useEffect(() => {
    if (!showOtpModal || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000)
    return () => clearInterval(timer)
  }, [showOtpModal, timeLeft])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tr) => googleLoginMutation.mutate(tr.access_token),
    onError:   ()   => console.error('Google login failed'),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirmPassword) return
    sendOtpMutation.mutate(email, {
      onSuccess: () => {
        setShowOtpModal(true)
        setTimeLeft(300)
        setOtpDigits(Array(OTP_LENGTH).fill(''))
        toast.success(`${'Mã OTP đã được gửi đến'} ${email}`)
      },
    })
  }

  // OTP box keyboard handling
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otpDigits]
    next[index] = value
    setOtpDigits(next)
    if (value && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = () => {
    const otp = otpDigits.join('')
    registerMutation.mutate({ displayName, email, password, otp }, {
      onSuccess: () => toast.success('Đăng ký thành công!'),
    })
  }

  const handleResendOtp = () => {
    sendOtpMutation.mutate(email, {
      onSuccess: () => { setTimeLeft(300); toast.success('Mã OTP đã được gửi đến') },
    })
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

      {/* ── RIGHT: Register Form ─────────────────────────── */}
      <div className="auth-right">
        <Link to={PATHS.home}>
          <img src={logo} alt="TWINL" className="auth-logo-img" />
        </Link>
        <div style={{ textAlign: 'left' }}>
          <span className="auth-heading-badge">{'Tạo tài khoản'}</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-name">{'Họ và tên'}</label>
            <input
              id="reg-name"
              type="text"
              className="auth-field__input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-email">{'Email'}</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              className="auth-field__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-pwd">{'Mật khẩu'}</label>
            <div className="auth-field__pw-wrap">
              <input
                id="reg-pwd"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="auth-field__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="auth-field__eye" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-confirm">{'Xác nhận mật khẩu'}</label>
            <div className="auth-field__pw-wrap">
              <input
                id="reg-confirm"
                type={showConfirmPwd ? 'text' : 'password'}
                autoComplete="new-password"
                className="auth-field__input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button type="button" className="auth-field__eye" onClick={() => setShowConfirmPwd(v => !v)}>
                {showConfirmPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {confirmPassword && confirmPassword !== password && (
            <p className="auth-error">{'Mật khẩu xác nhận không khớp'}</p>
          )}
          {registerMutation.isError && (
            <p className="auth-error">{getApiErrorMessage(registerMutation.error)}</p>
          )}
          {sendOtpMutation.isError && !showOtpModal && (
            <p className="auth-error">{getApiErrorMessage(sendOtpMutation.error)}</p>
          )}

          <button
            type="submit"
            className="auth-btn auth-btn--primary"
            disabled={sendOtpMutation.isPending || !email || !password || !displayName || (!!confirmPassword && confirmPassword !== password)}
          >
            {sendOtpMutation.isPending ? '...' : 'Đăng ký'}
          </button>
        </form>

        <div className="auth-divider">{'Hoặc'}</div>

        {googleLoginMutation.isError && (
          <p className="auth-error" style={{ marginBottom: 12 }}>{getApiErrorMessage(googleLoginMutation.error)}</p>
        )}

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
          {'Đã có tài khoản?'} <Link to={PATHS.login}>{'Đăng nhập ngay'}</Link>
        </div>
      </div>

      {/* ── OTP MODAL ───────────────────────────────────── */}
      {showOtpModal && (
        <div className="auth-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowOtpModal(false)}>
          <div className="auth-modal">
            <button className="auth-modal__close" onClick={() => setShowOtpModal(false)} aria-label="Close">
              <X size={18} />
            </button>
            <h2 className="auth-modal__title">Xác nhận Email</h2>
            <p className="auth-modal__desc">
              Mã xác thực 6 chữ số đã gửi đến <strong>{email}</strong>. Kiểm tra hộp thư đến (hoặc Spam).
            </p>

            {/* Individual OTP boxes */}
            <div className="auth-modal__otp-wrap">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="auth-modal__otp-box"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {registerMutation.isError && (
              <p className="auth-error" style={{ textAlign: 'center', marginBottom: 4 }}>{getApiErrorMessage(registerMutation.error)}</p>
            )}
            {sendOtpMutation.isError && (
              <p className="auth-error" style={{ textAlign: 'center', marginBottom: 4 }}>{getApiErrorMessage(sendOtpMutation.error)}</p>
            )}

            <p className="auth-modal__timer">
              {timeLeft > 0 ? `Mã hết hạn sau ${formatTime(timeLeft)}` : <span style={{ color: '#c0392b' }}>Mã đã hết hạn</span>}
            </p>

            <div className="auth-modal__actions">
              <button
                className="auth-btn auth-btn--primary"
                onClick={handleVerifyOtp}
                disabled={otpDigits.join('').length !== OTP_LENGTH || registerMutation.isPending || timeLeft === 0}
              >
                {registerMutation.isPending ? '...' : 'Xác nhận'}
              </button>
              <button
                className="auth-btn auth-btn--google"
                onClick={handleResendOtp}
                disabled={timeLeft > 240 || sendOtpMutation.isPending}
              >
                Gửi lại {timeLeft > 240 ? `(${formatTime(timeLeft - 240)})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
