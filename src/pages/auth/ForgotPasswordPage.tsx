import { Eye, EyeOff } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PATHS } from '../../routes/paths'
import { useSendForgotPasswordOtpMutation, useResetPasswordMutation } from '../../hooks/useAuth'
import { getApiErrorMessage } from '../../utils/apiError'
import { toast } from 'react-toastify'

import logo from '../../assets/images/logo-removebg.png'
import '../../styles/pages/auth.css'

const OTP_LENGTH = 6

export default function ForgotPasswordPage() {
  
  const sendOtpMutation      = useSendForgotPasswordOtpMutation()
  const resetPasswordMutation = useResetPasswordMutation()
  const navigate = useNavigate()

  const [step,            setStep]            = useState<1 | 2 | 3>(1)
  const [email,           setEmail]           = useState('')
  const [otpDigits,       setOtpDigits]       = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd,         setShowPwd]         = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [timeLeft,        setTimeLeft]        = useState(300)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000)
    return () => clearInterval(timer)
  }, [step, timeLeft])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    sendOtpMutation.mutate(email, {
      onSuccess: () => {
        setStep(2)
        setTimeLeft(300)
        setOtpDigits(Array(OTP_LENGTH).fill(''))
        toast.success(`${'Mã OTP đã được gửi đến'} ${email}`)
      },
    })
  }

  const handleOtpChange = (i: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otpDigits]
    next[i] = value
    setOtpDigits(next)
    if (value && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const handleConfirmOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return }
    resetPasswordMutation.mutate(
      { email, otp: otpDigits.join(''), newPassword },
      { onSuccess: () => { toast.success('Đặt lại mật khẩu thành công!'); navigate(PATHS.login) } }
    )
  }

  const stepLabels = ['Email', 'Mã OTP', 'Mật khẩu mới']

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

      {/* ── RIGHT: Forgot Password Steps ────────────────── */}
      <div className="auth-right">
        <Link to={PATHS.home}>
          <img src={logo} alt="TWINL" className="auth-logo-img" />
        </Link>
        <div style={{ textAlign: 'left' }}>
          <span className="auth-heading-badge">{'Quên mật khẩu'}</span>
        </div>

        {/* Step progress indicator */}
        <div className="auth-steps">
          {stepLabels.map((label, i) => (
            <div
              key={label}
              className={`auth-step ${step > i ? 'auth-step--done' : ''} ${step === i + 1 ? 'auth-step--active' : ''}`}
              title={label}
            />
          ))}
        </div>

        {/* STEP 1: Email */}
        {step === 1 && (
          <form className="auth-form" onSubmit={handleSendOtp}>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>{'Nhập email của bạn để nhận mã xác minh đổi mật khẩu.'}</p>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="forgot-email">{'Email'}</label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                className="auth-field__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            {sendOtpMutation.isError && (
              <p className="auth-error">{getApiErrorMessage(sendOtpMutation.error)}</p>
            )}
            <button type="submit" className="auth-btn auth-btn--primary" disabled={!email || sendOtpMutation.isPending}>
              {sendOtpMutation.isPending ? '...' : 'Gửi mã OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP verification */}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleConfirmOtp}>
            <p style={{ fontSize: 14, color: '#888' }}>
              Mã xác thực đã gửi đến <strong style={{ color: '#0a0a0a' }}>{email}</strong>
            </p>

            <div className="auth-modal__otp-wrap" style={{ justifyContent: 'flex-start' }}>
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

            <p className="auth-modal__timer" style={{ textAlign: 'left' }}>
              {timeLeft > 0
                ? `Mã hết hạn sau ${formatTime(timeLeft)}`
                : <span style={{ color: '#c0392b' }}>Mã đã hết hạn</span>}
            </p>

            <button
              type="submit"
              className="auth-btn auth-btn--primary"
              disabled={otpDigits.join('').length !== OTP_LENGTH}
            >
              Tiếp tục
            </button>
            <button
              type="button"
              className="auth-btn auth-btn--google"
              onClick={() => handleSendOtp()}
              disabled={timeLeft > 240 || sendOtpMutation.isPending}
            >
              Gửi lại mã {timeLeft > 240 ? `(${formatTime(timeLeft - 240)})` : ''}
            </button>
          </form>
        )}

        {/* STEP 3: New password */}
        {step === 3 && (
          <form className="auth-form" onSubmit={handleReset}>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="new-pwd">{'Mật khẩu mới'}</label>
              <div className="auth-field__pw-wrap">
                <input
                  id="new-pwd"
                  type={showPwd ? 'text' : 'password'}
                  className="auth-field__input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                />
                <button type="button" className="auth-field__eye" onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="confirm-pwd">{'Xác nhận mật khẩu'}</label>
              <div className="auth-field__pw-wrap">
                <input
                  id="confirm-pwd"
                  type={showConfirm ? 'text' : 'password'}
                  className="auth-field__input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="button" className="auth-field__eye" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {confirmPassword && confirmPassword !== newPassword && (
              <p className="auth-error">{'Mật khẩu xác nhận không khớp'}</p>
            )}
            {resetPasswordMutation.isError && (
              <p className="auth-error">{getApiErrorMessage(resetPasswordMutation.error)}</p>
            )}

            <button
              type="submit"
              className="auth-btn auth-btn--primary"
              disabled={
                resetPasswordMutation.isPending ||
                !newPassword || !confirmPassword ||
                newPassword !== confirmPassword
              }
            >
              {resetPasswordMutation.isPending ? '...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: 32 }}>
          <Link to={PATHS.login}>← Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}
