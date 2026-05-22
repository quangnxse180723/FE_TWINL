export interface PaymentCreateResponse {
  orderId: number
  orderCode: string
  paymentUrl: string
}

export interface VnpayReturnResponse {
  orderCode: string
  paymentStatus: string
  message: string
}
