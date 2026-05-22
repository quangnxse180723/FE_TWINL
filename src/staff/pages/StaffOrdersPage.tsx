import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { staffOrdersApi } from '../api/staffOrdersApi'
import { staffShipmentsApi } from '../api/staffShipmentsApi'
import type { AdminOrder } from '../../admin/api/adminOrdersApi'
import type { GhnCreateShipmentRequest } from '../../types/shipping'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

const formatDateTime = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('vi-VN')
}

export default function StaffOrdersPage() {
  const [page, setPage] = useState(0)
  const [sizePage] = useState(12)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [shipmentForm, setShipmentForm] = useState<GhnCreateShipmentRequest | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['staff-orders', page, sizePage],
    queryFn: () => staffOrdersApi.list(page, sizePage),
  })

  const handleOpenShipmentForm = (order: AdminOrder) => {
    const items = order.items.map((item) => ({
      name: item.productName ?? 'Sản phẩm',
      quantity: item.quantity,
      price: Math.round(item.unitPrice ?? 0),
      weight: 500,
    }))

    setSelectedOrder(order)
    setShipmentForm({
      toName: order.customerName,
      toPhone: order.customerPhone ?? '',
      toAddress: order.shippingAddress ?? '',
      toWardCode: '',
      toDistrictId: 0,
      toProvinceId: 0,
      codAmount: 0,
      weight: 1000,
      length: 20,
      width: 15,
      height: 10,
      note: '',
      requiredNote: 'KHONGCHOXEMHANG',
      items,
    })
    setActionError('')
    setActionSuccess('')
  }

  const handleCloseShipmentForm = () => {
    setSelectedOrder(null)
    setShipmentForm(null)
    setActionError('')
    setActionSuccess('')
  }

  const canSubmit = useMemo(() => {
    if (!shipmentForm) return false
    return Boolean(
      shipmentForm.toName &&
      shipmentForm.toPhone &&
      shipmentForm.toAddress &&
      shipmentForm.toWardCode &&
      shipmentForm.toDistrictId > 0 &&
      shipmentForm.toProvinceId > 0
    )
  }, [shipmentForm])

  const handleSubmitShipment = async () => {
    if (!selectedOrder || !shipmentForm) return
    try {
      setSubmitting(true)
      setActionError('')
      const payload = {
        ...shipmentForm,
        codAmount: Math.max(0, shipmentForm.codAmount),
      }
      await staffShipmentsApi.createGhnShipment(selectedOrder.id, payload)
      setActionSuccess('Đã tạo vận đơn GHN thành công.')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không thể tạo vận đơn GHN.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateField = (field: keyof GhnCreateShipmentRequest, value: string | number) => {
    if (!shipmentForm) return
    setShipmentForm({
      ...shipmentForm,
      [field]: value,
    })
  }

  const handleUpdateItem = (index: number, field: 'price' | 'weight' | 'quantity', value: number) => {
    if (!shipmentForm) return
    const items = shipmentForm.items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    )
    setShipmentForm({
      ...shipmentForm,
      items,
    })
  }

  return (
    <section className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Đơn hàng</h1>
          <p>Quản lý trạng thái và tạo vận đơn cho đơn hàng.</p>
        </div>
      </div>

      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Vận đơn</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>Đang tải đơn hàng...</td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6}>Không thể tải đơn hàng.</td>
              </tr>
            ) : data?.content?.length ? (
              data.content.map((order) => (
                <tr key={order.id}>
                  <td>{order.code}</td>
                  <td>{order.customerName}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>{formatPrice(order.totalAmount)}</td>
                  <td>
                    <span className={`admin-status admin-status--${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="admin-table__actions">
                    <button type="button" onClick={() => handleOpenShipmentForm(order)}>
                      Tạo vận đơn GHN
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>Chưa có đơn hàng.</td>
              </tr>
            )}
          </tbody>
        </table>

        {selectedOrder && shipmentForm ? (
          <div className="admin-form" style={{ marginTop: '20px' }}>
            <div className="admin-form__section">
              <h3>Tạo vận đơn GHN - {selectedOrder.code}</h3>
              {actionError ? <div className="admin-state admin-state--error">{actionError}</div> : null}
              {actionSuccess ? <div className="admin-state">{actionSuccess}</div> : null}
              <label>
                Người nhận
                <input
                  type="text"
                  value={shipmentForm.toName}
                  onChange={(event) => handleUpdateField('toName', event.target.value)}
                />
              </label>
              <label>
                Số điện thoại
                <input
                  type="text"
                  value={shipmentForm.toPhone}
                  onChange={(event) => handleUpdateField('toPhone', event.target.value)}
                />
              </label>
              <label>
                Địa chỉ
                <input
                  type="text"
                  value={shipmentForm.toAddress}
                  onChange={(event) => handleUpdateField('toAddress', event.target.value)}
                />
              </label>
              <div className="admin-form__grid">
                <label>
                  Ward Code
                  <input
                    type="text"
                    value={shipmentForm.toWardCode}
                    onChange={(event) => handleUpdateField('toWardCode', event.target.value)}
                  />
                </label>
                <label>
                  District ID
                  <input
                    type="number"
                    value={shipmentForm.toDistrictId}
                    onChange={(event) => handleUpdateField('toDistrictId', Number(event.target.value))}
                  />
                </label>
                <label>
                  Province ID
                  <input
                    type="number"
                    value={shipmentForm.toProvinceId}
                    onChange={(event) => handleUpdateField('toProvinceId', Number(event.target.value))}
                  />
                </label>
                <label>
                  COD Amount
                  <input
                    type="number"
                    value={shipmentForm.codAmount}
                    onChange={(event) => handleUpdateField('codAmount', Number(event.target.value))}
                  />
                </label>
              </div>
              <div className="admin-form__grid">
                <label>
                  Tổng khối lượng (gram)
                  <input
                    type="number"
                    value={shipmentForm.weight}
                    onChange={(event) => handleUpdateField('weight', Number(event.target.value))}
                  />
                </label>
                <label>
                  Dài (cm)
                  <input
                    type="number"
                    value={shipmentForm.length}
                    onChange={(event) => handleUpdateField('length', Number(event.target.value))}
                  />
                </label>
                <label>
                  Rộng (cm)
                  <input
                    type="number"
                    value={shipmentForm.width}
                    onChange={(event) => handleUpdateField('width', Number(event.target.value))}
                  />
                </label>
                <label>
                  Cao (cm)
                  <input
                    type="number"
                    value={shipmentForm.height}
                    onChange={(event) => handleUpdateField('height', Number(event.target.value))}
                  />
                </label>
              </div>
              <label>
                Ghi chú
                <textarea
                  value={shipmentForm.note ?? ''}
                  onChange={(event) => handleUpdateField('note', event.target.value)}
                />
              </label>
              <label>
                Required Note
                <input
                  type="text"
                  value={shipmentForm.requiredNote ?? ''}
                  onChange={(event) => handleUpdateField('requiredNote', event.target.value)}
                />
              </label>
              <div className="admin-form__actions">
                <button
                  type="button"
                  className="admin-primary"
                  onClick={handleSubmitShipment}
                  disabled={!canSubmit || submitting}
                >
                  {submitting ? 'Đang tạo...' : 'Tạo vận đơn'}
                </button>
                <button type="button" className="admin-secondary" onClick={handleCloseShipmentForm}>
                  Đóng
                </button>
              </div>
            </div>
            <div className="admin-form__section">
              <h3>Hàng hóa</h3>
              {shipmentForm.items.map((item, index) => (
                <div key={`${item.name}-${index}`} className="admin-form__grid">
                  <label>
                    Tên hàng
                    <input type="text" value={item.name} disabled />
                  </label>
                  <label>
                    Số lượng
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(event) => handleUpdateItem(index, 'quantity', Number(event.target.value))}
                    />
                  </label>
                  <label>
                    Giá
                    <input
                      type="number"
                      value={item.price}
                      onChange={(event) => handleUpdateItem(index, 'price', Number(event.target.value))}
                    />
                  </label>
                  <label>
                    Khối lượng (gram)
                    <input
                      type="number"
                      value={item.weight}
                      onChange={(event) => handleUpdateItem(index, 'weight', Number(event.target.value))}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="admin-pagination">
          <button type="button" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
            Trước
          </button>
          <span>Trang {data ? data.number + 1 : 1} / {data ? data.totalPages : 1}</span>
          <button
            type="button"
            onClick={() => setPage((prev) => (data && prev + 1 < data.totalPages ? prev + 1 : prev))}
            disabled={!data || page + 1 >= data.totalPages}
          >
            Sau
          </button>
        </div>
      </div>
    </section>
  )
}
