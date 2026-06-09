import { Button, TextField, InputAdornment, IconButton } from '@mui/material'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PATHS } from '../../routes/paths'
import { useRegisterMutation, useGoogleLoginMutation } from '../../hooks/useAuth'
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

    registerMutation.mutate({ displayName, email, password })
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
          <Button
            variant="contained"
            size="large"
            color="success"
            type="submit"
            fullWidth
            disabled={
              registerMutation.isPending ||
              (confirmPassword.length > 0 && confirmPassword !== password)
            }
          >
            {registerMutation.isPending ? 'Đang xử lý...' : 'Đăng ký'}
          </Button>
        </form>

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
