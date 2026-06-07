import { axiosClient } from '../axiosClient'
import type { PaymentCreateResponse } from '../../types/payment'

const sepayApi = {
  createPayment: () => {
    return axiosClient.post<PaymentCreateResponse>('/api/payments/sepay/create')
  }
}

export default sepayApi
