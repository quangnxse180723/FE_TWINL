import axios from 'axios'

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string }
    return data?.message ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Co loi xay ra. Vui long thu lai.'
}
