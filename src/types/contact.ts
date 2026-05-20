export interface ContactRequest {
  name: string
  email: string
  phone?: string | null
  message: string
}

export interface ContactResponse {
  id: number
  name: string
  email: string
  phone?: string | null
  message: string
  createdAt: string
}
