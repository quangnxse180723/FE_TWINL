import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shipperApi, type ShipperOrderStatus } from '../api/shipperApi'
import type { AdminOrder } from '../../admin/types'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('vi-VN')
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  ASSIGNED: 'Đã giao cho Shipper',
  PICKED_UP: 'Đã lấy hàng',
  DELIVERED: 'Đã giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELED: 'Đã hủy',
  DISPUTED: 'Khiếu nại',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  ASSIGNED: '#3b82f6',
  PICKED_UP: '#8b5cf6',
  DELIVERED: '#10b981',
  COMPLETED: '#059669',
  CANCELED: '#ef4444',
  DISPUTED: '#f97316',
}

function getNextAction(
  status: string,
): { label: string; nextStatus: ShipperOrderStatus } | null {
  if (status === 'ASSIGNED') return { label: '✅ Xác nhận lấy hàng', nextStatus: 'PICKED_UP' }
  if (status === 'PICKED_UP') return { label: '🚚 Xác nhận đã giao', nextStatus: 'DELIVERED' }
  return null
}

// ─── Update Status Modal ───────────────────────────────────────────────────

interface UpdateModalProps {
  order: AdminOrder
  nextAction: { label: string; nextStatus: ShipperOrderStatus }
  onClose: () => void
  onSubmit: (orderId: number, status: ShipperOrderStatus, note: string) => void
  isLoading: boolean
}

function UpdateStatusModal({ order, nextAction, onClose, onSubmit, isLoading }: UpdateModalProps) {
  const [note, setNote] = useState('')

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Cập nhật trạng thái</h2>
          <button type="button" style={closeButtonStyle} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={infoRowStyle}>
            <span style={infoLabelStyle}>Mã đơn:</span>
            <span style={infoValueStyle}>{order.code}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={infoLabelStyle}>Khách hàng:</span>
            <span style={infoValueStyle}>{order.customerName}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={infoLabelStyle}>Địa chỉ:</span>
            <span style={infoValueStyle}>{order.shippingAddress || '—'}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={infoLabelStyle}>Trạng thái mới:</span>
            <span
              style={{
                ...badgeStyle,
                backgroundColor: STATUS_COLORS[nextAction.nextStatus] + '20',
                color: STATUS_COLORS[nextAction.nextStatus],
                border: `1px solid ${STATUS_COLORS[nextAction.nextStatus]}40`,
              }}
            >
              {STATUS_LABELS[nextAction.nextStatus]}
            </span>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={infoLabelStyle}>Ghi chú (tuỳ chọn):</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Giao thành công, khách đã nhận hàng..."
              style={textareaStyle}
              rows={3}
            />
          </div>
        </div>

        <div style={modalFooterStyle}>
          <button type="button" style={cancelButtonStyle} onClick={onClose}>
            Huỷ
          </button>
          <button
            type="button"
            style={{ ...submitButtonStyle, opacity: isLoading ? 0.7 : 1 }}
            disabled={isLoading}
            onClick={() => onSubmit(order.id, nextAction.nextStatus, note)}
          >
            {isLoading ? 'Đang cập nhật...' : nextAction.label}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function ShipperOrdersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['shipper-orders', page],
    queryFn: () => shipperApi.getMyOrders(page, 12),
  })

  const mutation = useMutation({
    mutationFn: ({
      orderId,
      status,
      note,
    }: {
      orderId: number
      status: ShipperOrderStatus
      note: string
    }) => shipperApi.updateStatus(orderId, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipper-orders'] })
      setSelectedOrder(null)
    },
  })

  const nextAction = selectedOrder ? getNextAction(selectedOrder.status) : null

  return (
    <section className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h1>Đơn hàng của tôi</h1>
          <p>Danh sách đơn hàng được giao cho bạn xử lý.</p>
        </div>
        <div style={statsRowStyle}>
          <StatCard
            label="Tổng đơn"
            value={data?.totalElements ?? 0}
            color="#3b82f6"
          />
          <StatCard
            label="Đang xử lý"
            value={
              data?.content?.filter((o) =>
                ['ASSIGNED', 'PICKED_UP'].includes(o.status),
              ).length ?? 0
            }
            color="#8b5cf6"
          />
          <StatCard
            label="Đã giao"
            value={
              data?.content?.filter((o) => o.status === 'DELIVERED').length ?? 0
            }
            color="#10b981"
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Địa chỉ giao</th>
              <th>Tổng tiền</th>
              <th>Ngày đặt</th>
              <th>Trạng thái</th>
              <th>Giao lúc</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8}>
                  <div style={emptyStateStyle}>⏳ Đang tải đơn hàng...</div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={8}>
                  <div style={{ ...emptyStateStyle, color: '#ef4444' }}>
                    ⚠️ Không thể tải dữ liệu. Vui lòng thử lại.
                  </div>
                </td>
              </tr>
            ) : data?.content?.length ? (
              data.content.map((order) => {
                const action = getNextAction(order.status)
                return (
                  <tr key={order.id}>
                    <td>
                      <span style={orderCodeStyle}>{order.code}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {order.customerPhone}
                      </div>
                    </td>
                    <td style={{ maxWidth: 200, wordBreak: 'break-word', fontSize: '0.85rem' }}>
                      {order.shippingAddress || '—'}
                    </td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td>
                      <span
                        style={{
                          ...badgeStyle,
                          backgroundColor: (STATUS_COLORS[order.status] ?? '#94a3b8') + '20',
                          color: STATUS_COLORS[order.status] ?? '#94a3b8',
                          border: `1px solid ${(STATUS_COLORS[order.status] ?? '#94a3b8')}40`,
                        }}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {formatDateTime(order.deliveredAt)}
                    </td>
                    <td>
                      {action ? (
                        <button
                          type="button"
                          style={actionButtonStyle}
                          onClick={() => setSelectedOrder(order)}
                        >
                          {action.label}
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8}>
                  <div style={emptyStateStyle}>📭 Chưa có đơn hàng nào được giao cho bạn.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="admin-pagination">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
          >
            Trước
          </button>
          <span>
            Trang {data ? data.number + 1 : 1} / {data ? data.totalPages || 1 : 1}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => (data && p + 1 < data.totalPages ? p + 1 : p))}
            disabled={!data || page + 1 >= data.totalPages}
          >
            Sau
          </button>
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedOrder && nextAction && (
        <UpdateStatusModal
          order={selectedOrder}
          nextAction={nextAction}
          onClose={() => setSelectedOrder(null)}
          onSubmit={(orderId, status, note) => mutation.mutate({ orderId, status, note })}
          isLoading={mutation.isPending}
        />
      )}
    </section>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ ...statCardStyle, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>{label}</div>
    </div>
  )
}

// ─── Inline styles ─────────────────────────────────────────────────────────

const statsRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  marginTop: '0.5rem',
}

const statCardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  padding: '0.75rem 1.25rem',
  minWidth: 100,
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.25rem 0.65rem',
  borderRadius: 20,
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
}

const orderCodeStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '0.85rem',
  color: '#3b82f6',
  fontWeight: 600,
}

const actionButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '0.4rem 0.8rem',
  fontSize: '0.78rem',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '2.5rem 1rem',
  color: '#94a3b8',
  fontSize: '0.95rem',
}

// Modal styles
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.55)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const modalStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  width: '100%',
  maxWidth: 480,
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  overflow: 'hidden',
}

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid #e2e8f0',
  background: 'linear-gradient(135deg, #f8fafc, #fff)',
}

const modalFooterStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'flex-end',
  padding: '1rem 1.5rem',
  borderTop: '1px solid #e2e8f0',
  background: '#f8fafc',
}

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '0.75rem',
}

const infoLabelStyle: React.CSSProperties = {
  minWidth: 110,
  fontSize: '0.82rem',
  color: '#64748b',
  fontWeight: 500,
}

const infoValueStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#1e293b',
  fontWeight: 500,
}

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.1rem',
  color: '#94a3b8',
  padding: '0.25rem',
  borderRadius: 6,
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '0.65rem 0.85rem',
  fontSize: '0.88rem',
  marginTop: '0.4rem',
  resize: 'vertical',
  fontFamily: 'inherit',
  color: '#1e293b',
  outline: 'none',
  boxSizing: 'border-box',
}

const cancelButtonStyle: React.CSSProperties = {
  background: '#f1f5f9',
  color: '#475569',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '0.5rem 1.2rem',
  fontSize: '0.88rem',
  fontWeight: 500,
  cursor: 'pointer',
}

const submitButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '0.5rem 1.4rem',
  fontSize: '0.88rem',
  fontWeight: 600,
  cursor: 'pointer',
}
