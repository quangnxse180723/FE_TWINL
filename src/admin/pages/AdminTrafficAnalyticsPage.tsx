import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAnalyticsApi } from '../api/adminAnalyticsApi'
import { Eye, Users, MousePointerClick, UserPlus } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import '../../styles/pages/admin.css'

const formatDateTime = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('vi-VN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminTrafficAnalyticsPage() {
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [userType, setUserType] = useState('ALL')
  const [isMounted, setIsMounted] = useState(false)

  const itemsPerPage = 5

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['analytics-overview', startDate, endDate],
    queryFn: () => adminAnalyticsApi.getOverview(startDate, endDate),
  })

  const { data: trafficChartData } = useQuery({
    queryKey: ['analytics-traffic', startDate, endDate],
    queryFn: () => adminAnalyticsApi.getTrafficChart(startDate, endDate),
  })

  const { data: topSourcesData } = useQuery({
    queryKey: ['analytics-top-sources', startDate, endDate],
    queryFn: () => adminAnalyticsApi.getTopSources(startDate, endDate),
  })

  const { data: logs, isLoading: isLogsLoading } = useQuery({
    queryKey: ['analytics-logs', startDate, endDate, userType],
    queryFn: () => adminAnalyticsApi.getAccessLogs(startDate, endDate, userType),
  })

  const { data: onlineData } = useQuery({
    queryKey: ['analytics-online-users'],
    queryFn: () => adminAnalyticsApi.getOnlineUsers(),
    refetchInterval: 5000,
  })

  const paginatedLogs = logs?.data?.slice((page - 1) * itemsPerPage, page * itemsPerPage) || []
  const totalPages = Math.ceil((logs?.data?.length || 0) / itemsPerPage)

  return (
    <section className="admin-page">
      <div className="admin-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Tổng quan Thống kê</h1>
          <p>Theo dõi hiệu suất và lưu lượng truy cập của cửa hàng.</p>
        </div>
        <div className="admin-page__filters" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TỪ</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none', color: '#334155', fontWeight: 500 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>ĐẾN</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', outline: 'none', color: '#334155', fontWeight: 500 }} />
          </div>
          <select className="admin-input" style={{ width: 140, cursor: 'pointer' }} onChange={(e) => {
             const today = new Date();
             const yyyy = today.getFullYear();
             const mm = String(today.getMonth() + 1).padStart(2, '0');
             const dd = String(today.getDate()).padStart(2, '0');
             const todayStr = `${yyyy}-${mm}-${dd}`;
             
             if(e.target.value === 'Hôm nay') {
               setStartDate(todayStr); setEndDate(todayStr);
             } else if(e.target.value === 'Tháng này') {
               setStartDate(`${yyyy}-${mm}-01`); setEndDate(todayStr);
             } else if(e.target.value === 'Tất cả') {
               setStartDate(''); setEndDate('');
             }
          }}>
            <option>Tùy chọn nhanh</option>
            <option>Tất cả</option>
            <option>Hôm nay</option>
            <option>Tháng này</option>
          </select>
        </div>
      </div>

      <div className="admin-analytics-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {/* Total Visits */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="admin-card__icon" style={{ background: '#e0f2fe', color: '#0284c7', padding: '12px', borderRadius: '8px' }}><Eye size={20} /></div>
            <div className="admin-card__trend" style={{ color: '#16a34a', fontWeight: 600 }}>↗ 12.5%</div>
          </div>
          <div className="admin-card__meta" style={{ marginTop: '16px', color: '#64748b', textTransform: 'uppercase', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>Lượt truy cập</div>
          <div className="admin-card__value" style={{ fontSize: '28px' }}>{isOverviewLoading ? '--' : overview?.data.totalVisits.toLocaleString('vi-VN')}</div>
        </div>
        {/* Active Users (Realtime) */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="admin-card__icon" style={{ background: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '8px' }}><Users size={20} /></div>
            <div className="admin-card__trend" style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }}></span>
              Online
            </div>
          </div>
          <div className="admin-card__meta" style={{ marginTop: '16px', color: '#64748b', textTransform: 'uppercase', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>Người dùng hoạt động</div>
          <div className="admin-card__value" style={{ fontSize: '28px' }}>{onlineData?.data.onlineUsers ?? 0}</div>
        </div>
        {/* Bounce Rate */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="admin-card__icon" style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px' }}><MousePointerClick size={20} /></div>
            <div className="admin-card__trend" style={{ color: '#dc2626', fontWeight: 600 }}>↘ 2.1%</div>
          </div>
          <div className="admin-card__meta" style={{ marginTop: '16px', color: '#64748b', textTransform: 'uppercase', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>Tỷ lệ thoát</div>
          <div className="admin-card__value" style={{ fontSize: '28px' }}>{isOverviewLoading ? '--' : overview?.data.bounceRate}</div>
        </div>
        {/* New Signups */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="admin-card__icon" style={{ background: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '8px' }}><UserPlus size={20} /></div>
            <div className="admin-card__trend" style={{ color: '#16a34a', fontWeight: 600 }}>↗ 15.3%</div>
          </div>
          <div className="admin-card__meta" style={{ marginTop: '16px', color: '#64748b', textTransform: 'uppercase', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>Đăng ký mới</div>
          <div className="admin-card__value" style={{ fontSize: '28px' }}>{isOverviewLoading ? '--' : overview?.data.newSignups.toLocaleString('vi-VN')}</div>
        </div>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Traffic Chart */}
        <div className="admin-panel">
          <div className="admin-panel__header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Biểu đồ Lưu lượng</h3>
            <span style={{ cursor: 'pointer' }}>•••</span>
          </div>
          <div style={{ width: '100%' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height={300} minWidth={0}>
                <LineChart data={trafficChartData?.data || []} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                  <Tooltip />
                  <Line type="monotone" dataKey="uv" stroke="#16a34a" strokeWidth={4} dot={{ r: 4, fill: '#fff', stroke: '#16a34a', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Sources */}
        <div className="admin-panel">
          <div className="admin-panel__header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Nguồn truy cập</h3>
            <span style={{ cursor: 'pointer' }}>•••</span>
          </div>
          <div className="admin-sources" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(topSourcesData?.data || []).map(source => (
              <div key={source.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: source.color }}></span>
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>{source.label}</span>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{source.val}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: source.val, height: '100%', backgroundColor: source.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Access Logs */}
      <div className="admin-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-panel__header" style={{ padding: '24px', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Lịch sử Truy cập</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select className="admin-input" style={{ width: 140, cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }} value={userType} onChange={(e) => { setUserType(e.target.value); setPage(1); }}>
              <option value="ALL">Tất cả đối tượng</option>
              <option value="GUEST">Chỉ Khách</option>
              <option value="USER">Người dùng</option>
              <option value="STAFF">Nhân viên/Admin</option>
            </select>
          </div>
        </div>
        <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>THỜI GIAN</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>TÊN NGƯỜI DÙNG</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>VAI TRÒ</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>VỊ TRÍ</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>THIẾT BỊ</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {isLogsLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center' }}>Đang tải dữ liệu...</td>
                </tr>
              ) : paginatedLogs.length ? (
                paginatedLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155' }}>{formatDateTime(log.createdAt)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155' }}>{log.userId ? `USR-${log.userId}` : <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>-</span>}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>{log.userName}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: 600, 
                        backgroundColor: log.userRole === 'ADMIN' ? '#fee2e2' : log.userRole === 'STAFF' ? '#fef08a' : log.userRole === 'GUEST' ? '#f1f5f9' : '#dcfce7',
                        color: log.userRole === 'ADMIN' ? '#dc2626' : log.userRole === 'STAFF' ? '#854d0e' : log.userRole === 'GUEST' ? '#64748b' : '#16a34a'
                      }}>
                        {log.userRole === 'GUEST' ? 'Khách' : log.userRole}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155' }}>📍 {log.location || 'Chưa rõ'}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#334155' }}>{log.device}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: 600, 
                        backgroundColor: log.status === 'SUCCESS' ? '#22c55e' : log.status === 'FAILED' ? '#fecaca' : '#f1f5f9',
                        color: log.status === 'SUCCESS' ? '#fff' : log.status === 'FAILED' ? '#ef4444' : '#475569'
                      }}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center' }}>Chưa có log truy cập.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', gap: '12px', borderTop: '1px solid #e2e8f0' }}>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              Trang trước
            </button>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Trang {page} / {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #e2e8f0', background: page === totalPages ? '#f8fafc' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
