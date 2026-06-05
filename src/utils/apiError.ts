import axios from 'axios'

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as {
      message?: string
      detail?: string
      error?: string
      title?: string
    } | string | undefined

    if (typeof data === 'string' && data.trim()) {
      return data
    }

    if (data && typeof data === 'object') {
      return data.message || data.detail || data.error || data.title || error.message
    }

    if (error.response?.status === 401) {
      return 'Sai email hoặc mật khẩu'
    }

    if (error.response?.status === 403) {
      return 'Tài khoản của bạn đã bị khóa, vui lòng liên hệ admin qua gmail: twinl2hand@gmail.com'
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Co loi xay ra. Vui long thu lai.'
}
