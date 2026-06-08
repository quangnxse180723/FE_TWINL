import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminBusinessApi } from '../api/adminBusinessApi'
import { Banknote, ShoppingBag, UserPlus, Package, MoreHorizontal, AlertTriangle } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import '../../styles/pages/admin.css'

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M đ'
  }
  return value.toLocaleString('vi-VN') + ' đ'
}

export default function AdminDashboardPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['business-dashboard', startDate, endDate],
    queryFn: () => adminBusinessApi.getDashboard(startDate, endDate),
  })

  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải dữ liệu kinh doanh...</div>
  }

  const d = dashboard?.data

  return (
    <section className="admin-page">
      <div className="admin-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Hiệu quả Kinh doanh</h1>
          <p>Theo dõi hoạt động kinh doanh, tài chính và vận hành.</p>
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
             } else if(e.target.value === '7 Ngày') {
               const past = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
               setStartDate(`${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`); 
               setEndDate(todayStr);
             } else if(e.target.value === '30 Ngày') {
               const past = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
               setStartDate(`${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`); 
               setEndDate(todayStr);
             } else {
               setStartDate(''); setEndDate('');
             }
          }}>
            <option>Tất cả</option>
            <option>Hôm nay</option>
            <option>7 Ngày</option>
            <option>30 Ngày</option>
          </select>
        </div>
      </div>

      <div className="admin-analytics-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {/* Revenue */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="admin-card__icon" style={{ background: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '8px' }}><Banknote size={20} /></div>
            <div className="admin-card__trend" style={{ color: '#16a34a', fontWeight: 600 }}>↗ {d?.metrics.revenueTrend}</div>
          </div>
          <div className="admin-card__meta" style={{ marginTop: '16px', color: '#64748b', fontSize: 13 }}>Tổng Doanh Thu</div>
          <div className="admin-card__value" style={{ fontSize: '24px', marginTop: '4px' }}>{formatCurrency(d?.metrics.totalRevenue || 0)}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Đã trừ đơn hủy</div>
        </div>
        {/* Orders */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="admin-card__icon" style={{ background: '#e0f2fe', color: '#0284c7', padding: '12px', borderRadius: '8px' }}><ShoppingBag size={20} /></div>
            <div className="admin-card__trend" style={{ color: '#16a34a', fontWeight: 600 }}>↗ {d?.metrics.ordersTrend}</div>
          </div>
          <div className="admin-card__meta" style={{ marginTop: '16px', color: '#64748b', fontSize: 13 }}>Tổng Đơn Hàng</div>
          <div className="admin-card__value" style={{ fontSize: '24px', marginTop: '4px' }}>{d?.metrics.totalOrders.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#16a34a' }}>{d?.metrics.ordersSuccess}</span> •
            <span style={{ color: '#0284c7' }}>{d?.metrics.ordersShipping}</span> •
            <span style={{ color: '#64748b' }}>{d?.metrics.ordersPending}</span> •
            <span style={{ color: '#dc2626' }}>{d?.metrics.ordersCancelled}</span>
          </div>
        </div>
        {/* Users */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="admin-card__icon" style={{ background: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '8px' }}><UserPlus size={20} /></div>
            <div className="admin-card__trend" style={{ color: '#16a34a', fontWeight: 600 }}>↗ {d?.metrics.usersTrend}</div>
          </div>
          <div className="admin-card__meta" style={{ marginTop: '16px', color: '#64748b', fontSize: 13 }}>Người Dùng Mới</div>
          <div className="admin-card__value" style={{ fontSize: '24px', marginTop: '4px' }}>{d?.metrics.newUsers.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>+{d?.metrics.newUsersToday} hôm nay</div>
        </div>
        {/* Products */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="admin-card__icon" style={{ background: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '8px' }}><Package size={20} /></div>
          </div>
          <div className="admin-card__meta" style={{ marginTop: '16px', color: '#64748b', fontSize: 13 }}>Sản Phẩm Đang Bán (Active)</div>
          <div className="admin-card__value" style={{ fontSize: '24px', marginTop: '4px' }}>{d?.metrics.activeProducts.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Sẵn sàng giao</div>
        </div>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '1fr 2.5fr', gap: '24px', marginBottom: '24px' }}>
        {/* Finance */}
        <div className="admin-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="admin-panel__header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Tài Chính & Escrow</h3>
            <MoreHorizontal size={20} color="#94a3b8" cursor="pointer" />
          </div>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
            <div style={{ color: '#475569', fontSize: '13px', marginBottom: '4px' }}>Số dư Ví Escrow</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(d?.finance.escrowBalance || 0)}</div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>Chờ giải ngân</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
            <div style={{ color: '#475569', fontSize: '13px', marginBottom: '4px' }}>Phí Sàn (Platform Commission)</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#16a34a' }}>{formatCurrency(d?.finance.platformCommission || 0)}</div>
          </div>
          <div style={{ background: '#22c55e', padding: '16px', borderRadius: '8px', marginTop: 'auto' }}>
            <div style={{ color: '#fff', fontSize: '13px', marginBottom: '4px' }}>Chờ Giải Ngân (Ready to Pay)</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{formatCurrency(d?.finance.readyToPay || 0)}</div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="admin-panel">
          <div className="admin-panel__header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Doanh thu (Theo Ngày)</h3>
            <MoreHorizontal size={20} color="#94a3b8" cursor="pointer" />
          </div>
          <div style={{ width: '100%' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height={300} minWidth={0}>
                <AreaChart data={d?.salesChart || []} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(val) => val >= 1000000 ? (val/1000000) + 'M' : val} />
                  <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value} />
                  <Area type="monotone" dataKey="uv" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorUv)" activeDot={{ r: 6, fill: '#fff', stroke: '#22c55e', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Top Categories */}
        <div className="admin-panel">
          <div className="admin-panel__header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Top Danh Mục Bán Chạy</h3>
            <MoreHorizontal size={20} color="#94a3b8" cursor="pointer" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(d?.topCategories || []).map((cat) => (
              <div key={cat.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>{cat.name}</span>
                  <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{cat.orders.toLocaleString()} Đơn</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.percent}%`, height: '100%', backgroundColor: '#16a34a', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Monitor */}
        <div className="admin-panel">
          <div className="admin-panel__header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Giám Sát Vận Chuyển (In-house)</h3>
            <MoreHorizontal size={20} color="#94a3b8" cursor="pointer" />
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Hiệu suất Giao Thành Công</div>
              <div style={{ fontSize: '24px', color: '#16a34a', fontWeight: 700 }}>{d?.shipping.successRate}</div>
            </div>
            <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Thời gian Giao TB</div>
              <div style={{ fontSize: '24px', color: '#0f172a', fontWeight: 700 }}>{d?.shipping.avgDeliveryDays}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
            <AlertTriangle size={16} /> Đơn hàng cần xử lý gấp
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#334155' }}>Đơn hàng &gt;48h chưa cập nhật trạng thái</span>
              <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: 600 }}>{d?.shipping.delayedOrdersCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#334155' }}>Đơn bị hoàn trả (Kỳ này)</span>
              <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>{d?.shipping.returnedOrdersCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attention Orders */}
      <div className="admin-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-panel__header" style={{ padding: '24px', marginBottom: 0, display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Danh sách Đơn hàng Cần Chú Ý</h3>
          <span style={{ color: '#16a34a', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}>Xem tất cả ❯</span>
        </div>
        <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>MÃ ĐƠN</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>KHÁCH HÀNG</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>TÌNH TRẠNG</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>SHIPPER PHỤ TRÁCH</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {(d?.attentionOrders || []).length > 0 ? (
                d?.attentionOrders.map((ord) => (
                  <tr key={ord.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#334155' }}>{ord.code}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#334155' }}>{ord.customer}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {ord.status === 'DELAY' || ord.status === 'DISPUTE' ? <AlertTriangle size={14} /> : null}
                      {ord.issue}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#334155' }}>{ord.shipper}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '10px', 
                        fontWeight: 600, 
                        backgroundColor: ord.status === 'DELAY' || ord.status === 'DISPUTE' ? '#fee2e2' : '#e2e8f0',
                        color: ord.status === 'DELAY' || ord.status === 'DISPUTE' ? '#dc2626' : '#475569'
                      }}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>Không có đơn hàng nào cần chú ý.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
