import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminOrdersApi } from '../api/adminOrdersApi'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

const formatDateTime = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('vi-VN')
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(0)
  const [sizePage] = useState(12)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-orders', page, sizePage],
    queryFn: () => adminOrdersApi.list(page, sizePage),
  })

  return (
    <section className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Đơn hàng</h1>
          <p>Theo dõi toàn bộ đơn hàng và trạng thái xử lý.</p>
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
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5}>Đang tải đơn hàng...</td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5}>Không thể tải đơn hàng.</td>
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>Chưa có đơn hàng.</td>
              </tr>
            )}
          </tbody>
        </table>

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
