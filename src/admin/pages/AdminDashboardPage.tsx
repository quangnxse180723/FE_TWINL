import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi } from '../api/adminDashboardApi'
import '../../styles/pages/admin.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

const formatDateTime = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('vi-VN')
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminDashboardApi.get(),
  })

  const cards = [
    {
      label: 'Tổng doanh thu',
      value: data ? formatPrice(data.totalRevenue) : '--',
      change: `${data?.totalOrders ?? 0} đơn hàng`,
    },
    {
      label: 'Tổng sản phẩm',
      value: data ? `${data.totalProducts} sản phẩm` : '--',
      change: 'Tổng trong kho',
    },
    {
      label: 'Người dùng hoạt động',
      value: data ? `${data.totalUsers}` : '--',
      change: 'Tổng người dùng',
    },
  ]

  return (
    <section className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Tổng quan hệ thống</h1>
          <p>Thống kê hoạt động kinh doanh trong 30 ngày qua.</p>
        </div>
      </div>

      <div className="admin-cards">
        {cards.map((card) => (
          <div key={card.label} className="admin-card">
            <div className="admin-card__meta">{card.label}</div>
            <div className="admin-card__value">{card.value}</div>
            <div className="admin-card__badge">{card.change}</div>
          </div>
        ))}
      </div>

      <div className="admin-grid">
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3>Biểu đồ tăng trưởng doanh thu</h3>
            <span>30 ngày qua</span>
          </div>
          <div className="admin-chart">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className={`admin-chart__bar ${index === 5 ? 'admin-chart__bar--active' : ''}`}
                style={{ height: `${20 + index * 6}px` }}
              />
            ))}
          </div>
        </div>
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3>Top sản phẩm bán chạy</h3>
          </div>
          {isLoading ? (
            <div className="admin-state">Đang tải dữ liệu...</div>
          ) : isError ? (
            <div className="admin-state admin-state--error">Không thể tải dữ liệu.</div>
          ) : (
            <div className="admin-list">
              {data?.topProducts?.length ? (
                data.topProducts.map((item) => (
                  <div key={item.productId} className="admin-list__item">
                    <div>
                      <div className="admin-list__title">{item.productName}</div>
                      <div className="admin-list__subtitle">{item.totalSold} đơn hàng</div>
                    </div>
                    <span className="admin-list__value">Top</span>
                  </div>
                ))
              ) : (
                <div className="admin-state">Chưa có dữ liệu.</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header">
          <h3>Đơn hàng mới nhất</h3>
          <span>Quản lý tất cả đơn hàng</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5}>Đang tải dữ liệu...</td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5}>Không thể tải đơn hàng.</td>
              </tr>
            ) : data?.recentOrders?.length ? (
              data.recentOrders.map((order) => (
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
      </div>
    </section>
  )
}
