import { Button, TextField, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PATHS } from '../../routes/paths'
import { useRegisterMutation, useGoogleLoginMutation, useSendOtpMutation } from '../../hooks/useAuth'
import { useGoogleLogin } from '@react-oauth/google'
import { getApiErrorMessage } from '../../utils/apiError'
import type { RootState } from '../../store'
import '../../styles/pages/auth.css'

export default function RegisterPage() {
  const registerMutation = useRegisterMutation()
  const googleLoginMutation = useGoogleLoginMutation()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // OTP States
  const sendOtpMutation = useSendOtpMutation()
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otp, setOtp] = useState('')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showOtpModal && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [showOtpModal, timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  useEffect(() => {
    if (user) {
      navigate(PATHS.home)
    }
  }, [navigate, user])

  useEffect(() => {
    if (googleLoginMutation.isSuccess && user) {
      const isAdmin = user.roles?.some((role) => role === 'ADMIN')
      const isStaff = user.roles?.some((role) => role === 'STAFF')
      const isShipper = user.roles?.some((role) => role === 'SHIPPER')
      navigate(isAdmin ? PATHS.admin : isStaff ? PATHS.staff : isShipper ? PATHS.shipper : PATHS.home)
    }
  }, [googleLoginMutation.isSuccess, navigate, user])

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      googleLoginMutation.mutate(tokenResponse.access_token)
    },
    onError: () => {
      console.error('Google Login Failed')
    }
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      return
    }

    sendOtpMutation.mutate(email, {
      onSuccess: () => {
        setShowOtpModal(true)
        setTimeLeft(300)
      }
    })
  }

  const handleVerifyOtp = () => {
    registerMutation.mutate({ displayName, email, password, otp })
  }

  const handleResendOtp = () => {
    sendOtpMutation.mutate(email, {
      onSuccess: () => {
        setTimeLeft(300)
      }
    })
  }

  return (
    <section className="auth">
      <div className="auth__card">
        <h1 className="auth__logo">
          <Link to={PATHS.home} style={{ textDecoration: 'none', color: 'inherit' }}>Twinl</Link>
        </h1>
        <h2>Đăng ký</h2>
        <p className="auth__subtitle">Tạo tài khoản mới để trở thành thành viên của Twinl</p>

        <form className="auth__form" onSubmit={handleSubmit}>
          <TextField
            label="Tên hiển thị"
            fullWidth
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Xác nhận lại mật khẩu"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {confirmPassword.length > 0 && confirmPassword !== password ? (
            <div className="auth__error">Mật khẩu xác nhận không khớp.</div>
          ) : null}
          {registerMutation.isError ? (
            <div className="auth__error">{getApiErrorMessage(registerMutation.error)}</div>
          ) : null}
          {sendOtpMutation.isError && !showOtpModal ? (
            <div className="auth__error">{getApiErrorMessage(sendOtpMutation.error)}</div>
          ) : null}
          <Button
            variant="contained"
            size="large"
            color="success"
            type="submit"
            fullWidth
            disabled={
              sendOtpMutation.isPending ||
              (confirmPassword.length > 0 && confirmPassword !== password) ||
              !email || !password || !displayName
            }
          >
            {sendOtpMutation.isPending ? 'Đang gửi mã OTP...' : 'Đăng ký'}
          </Button>
        </form>

        <Dialog open={showOtpModal} onClose={() => {}} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Xác nhận Email</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Một mã xác thực 6 chữ số đã được gửi đến email <strong>{email}</strong>. Vui lòng kiểm tra hộp thư (hoặc Spam).
            </Typography>
            <TextField
              label="Mã OTP (6 chữ số)"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem' } }}
              autoFocus
            />
            {registerMutation.isError ? (
              <div className="auth__error" style={{ marginTop: '1rem', textAlign: 'center' }}>{getApiErrorMessage(registerMutation.error)}</div>
            ) : null}
            {sendOtpMutation.isError ? (
              <div className="auth__error" style={{ marginTop: '1rem', textAlign: 'center' }}>{getApiErrorMessage(sendOtpMutation.error)}</div>
            ) : null}
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              {timeLeft > 0 ? (
                <span style={{ color: '#666' }}>Mã sẽ hết hạn sau {formatTime(timeLeft)}</span>
              ) : (
                <span style={{ color: 'red' }}>Mã đã hết hạn</span>
              )}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              color="success"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || registerMutation.isPending || timeLeft === 0}
            >
              {registerMutation.isPending ? 'Đang xử lý...' : 'Xác nhận mã OTP'}
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={handleResendOtp}
              disabled={timeLeft > 240 || sendOtpMutation.isPending}
            >
              Gửi lại mã {timeLeft > 240 ? `(${formatTime(timeLeft - 240)})` : ''}
            </Button>
            <Button
              variant="text"
              color="inherit"
              fullWidth
              onClick={() => setShowOtpModal(false)}
            >
              Quay lại
            </Button>
          </DialogActions>
        </Dialog>

        <div className="auth__divider">hoặc</div>
        {googleLoginMutation.isError ? (
            <div className="auth__error">{getApiErrorMessage(googleLoginMutation.error)}</div>
        ) : null}
        <Button 
          variant="outlined" 
          size="large" 
          fullWidth 
          onClick={() => handleGoogleLogin()}
          disabled={googleLoginMutation.isPending}
        >
          {googleLoginMutation.isPending ? 'Đang kết nối...' : 'Đăng ký với Google'}
        </Button>
        <div className="auth__footer">
          Đã có tài khoản? <Link to={PATHS.login}>Đăng nhập</Link>
        </div>
      </div>
    </section>
  )
}
