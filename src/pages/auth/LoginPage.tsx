import { Button, TextField } from '@mui/material'
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

  useEffect(() => {
    if (user) {
      const isAdmin = user.roles?.some((role) => role === 'ADMIN')
      navigate(isAdmin ? PATHS.admin : PATHS.home)
    }
  }, [navigate, user])

  useEffect(() => {
    if (loginMutation.isSuccess && user) {
      const isAdmin = user.roles?.some((role) => role === 'ADMIN')
      navigate(isAdmin ? PATHS.admin : PATHS.home)
    }
  }, [loginMutation.isSuccess, navigate, user])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <section className="auth">
      <div className="auth__card">
        <h1 className="auth__logo">Twinl</h1>
        <h2>Đăng nhập</h2>
        <p className="auth__subtitle">Nhập thông tin tài khoản để tiếp tục</p>

        <form className="auth__form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            label="Mật khẩu"
            type="password"
            fullWidth
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
