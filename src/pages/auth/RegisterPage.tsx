import { Button, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PATHS } from '../../routes/paths'
import { useRegisterMutation } from '../../hooks/useAuth'
import { getApiErrorMessage } from '../../utils/apiError'
import type { RootState } from '../../store'
import '../../styles/pages/auth.css'

export default function RegisterPage() {
  const registerMutation = useRegisterMutation()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user) {
      navigate(PATHS.home)
    }
  }, [navigate, user])

  useEffect(() => {
    if (registerMutation.isSuccess) {
      navigate(PATHS.login)
    }
  }, [registerMutation.isSuccess, navigate])

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
        <h1 className="auth__logo">Twinl</h1>
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
            type="password"
            fullWidth
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <TextField
            label="Xác nhận lại mật khẩu"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
        <Button variant="outlined" size="large" fullWidth>
          Đăng nhập
        </Button>

        <div className="auth__footer">
          Đã có tài khoản? <Link to={PATHS.login}>Đăng nhập</Link>
        </div>
      </div>
    </section>
  )
}
