import { axiosClient } from '../axiosClient'
import type { PaymentCreateResponse, VnpayReturnResponse } from '../../types/payment'

const vnpayApi = {
  createPayment: () => axiosClient.post<PaymentCreateResponse>('/api/payments/vnpay/create'),
  handleReturn: (params: Record<string, string>) =>
    axiosClient.get<VnpayReturnResponse>('/api/payments/vnpay/return', { params }),
}

export default vnpayApi
