import React, { useEffect, useState } from 'react'
import { disputesApi } from '../../api/disputesApi'
import type { DisputeResponse } from '../../api/disputesApi'
import { toast } from 'react-toastify'

export const AdminDisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<DisputeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<DisputeResponse | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchDisputes = async () => {
    try {
      setLoading(true)
      const res = await disputesApi.getAdminDisputes()
      setDisputes(res.content)
    } catch (err) {
      toast.error('Lỗi khi tải danh sách khiếu nại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDisputes()
  }, [])

  const handleResolve = async (id: number, resolution: 'ACCEPT' | 'REJECT') => {
    try {
      setSubmitting(true)
      await disputesApi.resolveDispute(id, resolution, note)
      toast.success('Đã xử lý khiếu nại thành công')
      setSelectedDispute(null)
      setNote('')
      fetchDisputes()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xử lý khiếu nại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Quản lý Trả hàng / Hoàn tiền</h2>
      
      {loading ? (
        <p>Đang tải...</p>
      ) : disputes.length === 0 ? (
        <p>Chưa có yêu cầu trả hàng nào.</p>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '16px', fontWeight: 600, color: '#374151' }}>ID</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#374151' }}>Đơn hàng</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#374151' }}>Người yêu cầu</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#374151' }}>Lý do</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#374151' }}>Trạng thái</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#374151' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px' }}>{d.id}</td>
                  <td style={{ padding: '16px', color: '#2563eb', fontWeight: 500 }}>#{d.orderCode}</td>
                  <td style={{ padding: '16px' }}>{d.requesterName}<br/><span style={{ fontSize: '12px', color: '#6b7280' }}>{d.requesterEmail}</span></td>
                  <td style={{ padding: '16px' }}>{d.reason}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 500,
                      backgroundColor: d.status === 'PENDING' ? '#fef3c7' : d.status === 'ACCEPTED' ? '#dcfce7' : '#fee2e2',
                      color: d.status === 'PENDING' ? '#d97706' : d.status === 'ACCEPTED' ? '#16a34a' : '#dc2626'
                    }}>
                      {d.status === 'PENDING' ? 'Chờ xử lý' : d.status === 'ACCEPTED' ? 'Chấp nhận' : 'Từ chối'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button 
                      onClick={() => setSelectedDispute(d)}
                      style={{ padding: '6px 12px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedDispute && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Chi tiết khiếu nại #{selectedDispute.id}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Đơn hàng</p>
                <p style={{ fontWeight: 500 }}>#{selectedDispute.orderCode}</p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Người yêu cầu</p>
                <p style={{ fontWeight: 500 }}>{selectedDispute.requesterName} ({selectedDispute.requesterEmail})</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Lý do</p>
                <p style={{ fontWeight: 500 }}>{selectedDispute.reason}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Mô tả chi tiết</p>
                <p style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>{selectedDispute.description}</p>
              </div>
              
              {selectedDispute.evidenceImages && selectedDispute.evidenceImages.length > 0 && (
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>Bằng chứng đính kèm</p>
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {selectedDispute.evidenceImages.map((img, i) => (
                      <img key={i} src={img} alt="Evidence" style={{ height: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedDispute.status === 'PENDING' ? (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Ghi chú xử lý (sẽ gửi cho các bên)</label>
                  <textarea 
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', minHeight: '80px' }}
                    placeholder="Nhập lý do chấp nhận hoặc từ chối..."
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setSelectedDispute(null)}
                    disabled={submitting}
                    style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#f3f4f6', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Đóng
                  </button>
                  <button 
                    onClick={() => handleResolve(selectedDispute.id, 'REJECT')}
                    disabled={submitting}
                    style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Từ chối (Giải ngân)
                  </button>
                  <button 
                    onClick={() => handleResolve(selectedDispute.id, 'ACCEPT')}
                    disabled={submitting}
                    style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Chấp nhận (Hoàn tiền)
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setSelectedDispute(null)}
                  style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#f3f4f6', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                >
                  Đóng
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
