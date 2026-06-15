import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffOrdersApi } from '../api/staffOrdersApi'
import { adminOrdersApi } from '../../admin/api/adminOrdersApi'
import { adminUsersApi } from '../../admin/api/adminUsersApi'
import type { AdminOrder, AdminUser } from '../../admin/types'

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
  ASSIGNED: 'Đã giao Shipper',
  PICKED_UP: 'Đang lấy hàng',
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

// ─── Assign Shipper Modal ──────────────────────────────────────────────────

interface AssignModalProps {
  order: AdminOrder
  onClose: () => void
  onSuccess: () => void
}

function AssignShipperModal({ order, onClose, onSuccess }: AssignModalProps) {
  const [selectedShipperId, setSelectedShipperId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminUsersApi.list(),
  })

  const shippers: AdminUser[] =
    users?.filter((u) => u.roles.includes('SHIPPER') && u.active !== false) ?? []

  const mutation = useMutation({
    mutationFn: () => adminOrdersApi.assign(order.id, selectedShipperId!),
    onSuccess: () => {
      onSuccess()
      onClose()
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      setError(msg ?? 'Gán Shipper thất bại. Vui lòng thử lại.')
    },
  })

  const handleSubmit = () => {
    if (!selectedShipperId) {
      setError('Vui lòng chọn Shipper.')
      return
    }
    setError('')
    mutation.mutate()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b' }}>Gán Shipper</h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Đơn hàng: <strong>{order.code}</strong>
            </p>
          </div>
          <button type="button" style={closeButtonStyle} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem', marginBottom: '0.35rem' }}>
            <InfoItem label="Khách hàng" value={order.customerName} />
            <InfoItem label="Tổng tiền" value={formatPrice(order.totalAmount)} />
          </div>
          <InfoItem label="Địa chỉ" value={order.shippingAddress ?? '—'} />
        </div>

        <div style={{ padding: '1.25rem 1.5rem' }}>
          <label style={fieldLabelStyle}>Chọn Shipper *</label>
          {loadingUsers ? (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Đang tải danh sách...</p>
          ) : shippers.length === 0 ? (
            <p style={{ color: '#ef4444', fontSize: '0.88rem' }}>
              Chưa có Shipper nào. Hãy tạo tài khoản với role SHIPPER trước.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 220, overflowY: 'auto' }}>
              {shippers.map((shipper) => (
                <label
                  key={shipper.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
                    background: selectedShipperId === shipper.id ? '#eff6ff' : '#fff',
                    border: `2px solid ${selectedShipperId === shipper.id ? '#3b82f6' : '#e2e8f0'}`,
                  }}
                >
                  <input
                    type="radio" name="shipper" value={shipper.id}
                    checked={selectedShipperId === shipper.id}
                    onChange={() => setSelectedShipperId(shipper.id)}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    color: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, flexShrink: 0,
                  }}>
                    {shipper.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                      {shipper.displayName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{shipper.email}</div>
                  </div>
                  {selectedShipperId === shipper.id && (
                    <div style={{ marginLeft: 'auto', color: '#3b82f6', fontSize: '1.2rem' }}>✓</div>
                  )}
                </label>
              ))}
            </div>
          )}
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.83rem', marginTop: '0.75rem' }}>
              {error}
            </div>
          )}
        </div>

        <div style={modalFooterStyle}>
          <button type="button" style={cancelButtonStyle} onClick={onClose}>Huỷ</button>
          <button
            type="button"
            style={{ ...submitButtonStyle, opacity: mutation.isPending || !selectedShipperId ? 0.65 : 1 }}
            disabled={mutation.isPending || !selectedShipperId}
            onClick={handleSubmit}
          >
            {mutation.isPending ? '⏳ Đang gán...' : '🚀 Xác nhận gán Shipper'}
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: '0.35rem' }}>
      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{label}: </span>
      <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function StaffOrdersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [sizePage] = useState(12)
  const [assignTarget, setAssignTarget] = useState<AdminOrder | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['staff-orders', page, sizePage],
    queryFn: () => staffOrdersApi.list(page, sizePage),
  })

  const handleAssignSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['staff-orders'] })
    setSuccessMsg('✅ Gán Shipper thành công!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  return (
    <section className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Quản lý Đơn hàng</h1>
          <p>Theo dõi và gán Shipper cho các đơn hàng đang chờ xử lý.</p>
        </div>
      </div>

      {successMsg && (
        <div style={{
          background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7',
          borderRadius: 10, padding: '0.75rem 1.25rem', marginBottom: '1rem',
          fontWeight: 500, fontSize: '0.9rem',
        }}>
          {successMsg}
        </div>
      )}

      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Shipper</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7}><div style={emptyStyle}>⏳ Đang tải đơn hàng...</div></td></tr>
            ) : isError ? (
              <tr><td colSpan={7}><div style={{ ...emptyStyle, color: '#ef4444' }}>⚠️ Không thể tải đơn hàng.</div></td></tr>
            ) : data?.content?.length ? (
              data.content.map((order) => (
                <tr key={order.id}>
                  <td><span style={codeStyle}>{order.code}</span></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{order.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.customerEmail}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{formatDateTime(order.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{formatPrice(order.totalAmount)}</td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '0.25rem 0.65rem', borderRadius: 20,
                      fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: (STATUS_COLORS[order.status] ?? '#94a3b8') + '20',
                      color: STATUS_COLORS[order.status] ?? '#94a3b8',
                      border: `1px solid ${(STATUS_COLORS[order.status] ?? '#94a3b8')}40`,
                    }}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td>
                    {order.shipperName ? (
                      <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 500 }}>
                        👤 {order.shipperName}
                      </span>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>Chưa gán</span>
                    )}
                  </td>
                  <td>
                    {order.status === 'PENDING' ? (
                      <button
                        type="button"
                        style={assignButtonStyle}
                        onClick={() => setAssignTarget(order)}
                      >
                        🚀 Gán Shipper
                      </button>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7}><div style={emptyStyle}>📭 Chưa có đơn hàng nào.</div></td></tr>
            )}
          </tbody>
        </table>

        <div className="admin-pagination">
          <button type="button" onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0}>
            Trước
          </button>
          <span>Trang {data ? data.number + 1 : 1} / {data ? data.totalPages || 1 : 1}</span>
          <button
            type="button"
            onClick={() => setPage((p) => (data && p + 1 < data.totalPages ? p + 1 : p))}
            disabled={!data || page + 1 >= data.totalPages}
          >
            Sau
          </button>
        </div>
      </div>

      {assignTarget && (
        <AssignShipperModal
          order={assignTarget}
          onClose={() => setAssignTarget(null)}
          onSuccess={handleAssignSuccess}
        />
      )}
    </section>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────

const codeStyle: React.CSSProperties = {
  fontFamily: 'monospace', fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600,
}

const assignButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
  color: '#fff', border: 'none', borderRadius: 8,
  padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 600,
  cursor: 'pointer', whiteSpace: 'nowrap',
}

const emptyStyle: React.CSSProperties = {
  textAlign: 'center', padding: '2.5rem', color: '#94a3b8',
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
  backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', zIndex: 1000,
}

const modalStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500,
  maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
}

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
  padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0',
}

const modalFooterStyle: React.CSSProperties = {
  display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
  padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc',
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: '0.82rem', color: '#64748b', fontWeight: 600,
  display: 'block', marginBottom: '0.65rem',
}

const closeButtonStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#94a3b8',
}

const cancelButtonStyle: React.CSSProperties = {
  background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0',
  borderRadius: 8, padding: '0.5rem 1.2rem', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer',
}

const submitButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
  color: '#fff', border: 'none', borderRadius: 8,
  padding: '0.5rem 1.4rem', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
}
