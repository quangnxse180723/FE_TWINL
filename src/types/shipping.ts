export interface GhnCreateShipmentItemRequest {
  name: string
  quantity: number
  price: number
  weight: number
}

export interface GhnCreateShipmentRequest {
  toName: string
  toPhone: string
  toAddress: string
  toWardCode: string
  toDistrictId: number
  toProvinceId: number
  codAmount: number
  weight: number
  length: number
  width: number
  height: number
  note?: string
  requiredNote?: string
  items: GhnCreateShipmentItemRequest[]
}
