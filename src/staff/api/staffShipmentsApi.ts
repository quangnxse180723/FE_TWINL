import { axiosClient } from '../../api/axiosClient'
import type { ShipmentResponse } from '../../types/shipment'
import type { GhnCreateShipmentRequest } from '../../types/shipping'

export const staffShipmentsApi = {
  createGhnShipment: (orderId: number, payload: GhnCreateShipmentRequest) =>
    axiosClient.post<ShipmentResponse>(`/api/admin/shipments/ghn/create/${orderId}`, payload),
}
