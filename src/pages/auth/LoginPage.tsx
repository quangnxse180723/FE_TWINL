import { Button, TextField, InputAdornment, IconButton } from '@mui/material'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PATHS } from '../../routes/paths'
import { useLoginMutation } from '../../hooks/useAuth'
import { getApiErrorMessage } from '../../utils/apiError'
import type { RootState } from '../../store'
import '../../styles/pages/auth.css'

export default function LoginPage() {
  const loginMutation = useLoginMutation()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) {
      const isAdmin = user.roles?.some((role) => role === 'ADMIN')
      const isStaff = user.roles?.some((role) => role === 'STAFF')
      const isShipper = user.roles?.some((role) => role === 'SHIPPER')
      navigate(isAdmin ? PATHS.admin : isStaff ? PATHS.staff : isShipper ? PATHS.shipper : PATHS.home)
    }
  }, [navigate, user])

  useEffect(() => {
    if (loginMutation.isSuccess && user) {
      const isAdmin = user.roles?.some((role) => role === 'ADMIN')
      const isStaff = user.roles?.some((role) => role === 'STAFF')
      const isShipper = user.roles?.some((role) => role === 'SHIPPER')
      navigate(isAdmin ? PATHS.admin : isStaff ? PATHS.staff : isShipper ? PATHS.shipper : PATHS.home)
    }
  }, [loginMutation.isSuccess, navigate, user])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <section className="auth">
      <div className="auth__card">
        <h1 className="auth__logo">
          <Link to={PATHS.home} style={{ textDecoration: 'none', color: 'inherit' }}>Twinl</Link>
        </h1>
        <h2>Đăng nhập</h2>
        <p className="auth__subtitle">Nhập thông tin tài khoản để tiếp tục</p>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="text"
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
          {loginMutation.isError ? (
            <div className="auth__error">{getApiErrorMessage(loginMutation.error)}</div>
          ) : null}
          <div className="auth__forgot">Quên mật khẩu?</div>
          <Button
            variant="contained"
            size="large"
            type="submit"
            fullWidth
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>

        <div className="auth__divider">hoặc</div>
        <Button variant="outlined" size="large" fullWidth>
          Đăng nhập với Google
        </Button>

        <div className="auth__footer">
          Chưa có tài khoản? <Link to={PATHS.register}>Đăng ký</Link>
        </div>
      </div>
    </section>
  )
}
