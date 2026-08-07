import { useEffect, useState } from 'react'
import { walletApi, type AdminWalletResponse, type WalletTransactionResponse } from '../../api/wallet/walletApi'
import { Search, RefreshCcw, History, X } from 'lucide-react'
import { toast } from 'react-toastify'

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<AdminWalletResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminWalletResponse | null>(null)
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>([])
  const [txLoading, setTxLoading] = useState(false)

  const fetchWallets = async () => {
    setLoading(true)
    try {
      const data = await walletApi.getAllWallets()
      setWallets(data)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách ví')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallets()
  }, [])

  const handleViewHistory = async (wallet: AdminWalletResponse) => {
    setSelectedUser(wallet)
    setTxLoading(true)
    try {
      const data = await walletApi.getWalletTransactions(wallet.userId)
      setTransactions(data)
    } catch (error) {
      toast.error('Lỗi khi tải lịch sử giao dịch')
      console.error(error)
    } finally {
      setTxLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN')
  }

  const filteredWallets = wallets.filter(
    (w) =>
      w.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.sellerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="admin__badge admin__badge--success">Thành công</span>
      case 'PENDING':
        return <span className="admin__badge admin__badge--warning">Chờ xử lý</span>
      case 'FAILED':
        return <span className="admin__badge admin__badge--danger">Thất bại</span>
      default:
        return <span className="admin__badge">{status}</span>
    }
  }

  return (
    <div className="admin__page fade-in">
      <div className="admin__page-header">
        <div>
          <h1 className="admin__page-title">Quản lý Giải ngân</h1>
          <p className="admin__page-subtitle">Theo dõi số dư và lịch sử giải ngân của tài khoản</p>
        </div>
        <button className="btn btn--primary" onClick={fetchWallets}>
          <RefreshCcw size={18} /> Cập nhật
        </button>
      </div>

      <div className="admin__card">
        <div className="admin__card-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="admin__search" style={{ flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <Search size={20} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', paddingLeft: '0.5rem', width: '100%' }}
            />
          </div>
        </div>

        <div className="admin__table-container">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Số dư khả dụng</th>
                <th>Chờ giải ngân</th>
                <th>Ngân hàng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</td>
                </tr>
              ) : filteredWallets.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Không tìm thấy ví nào</td>
                </tr>
              ) : (
                filteredWallets.map((wallet) => (
                  <tr key={wallet.userId}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{wallet.sellerName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{wallet.sellerEmail}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--success-color)' }}>
                        {formatPrice(wallet.balance)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--warning-color)' }}>
                        {formatPrice(wallet.escrowBalance)}
                      </span>
                    </td>
                    <td>
                      {wallet.bankName ? (
                        <>
                          <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{wallet.bankName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{wallet.bankAccountNumber}</div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chưa cập nhật</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn--outline"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
                        onClick={() => handleViewHistory(wallet)}
                      >
                        <History size={16} /> Lịch sử
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lịch sử giao dịch */}
      {selectedUser && (
        <div className="admin__modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin__modal-content" style={{ width: '900px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Lịch sử giao dịch - {selectedUser.sellerName}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedUser.sellerEmail}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Số dư khả dụng</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success-color)' }}>{formatPrice(selectedUser.balance)}</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Chờ giải ngân</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--warning-color)' }}>{formatPrice(selectedUser.escrowBalance)}</div>
              </div>
            </div>

            <div className="admin__table-container">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Loại</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {txLoading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải lịch sử...</td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Chưa có giao dịch nào</td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ fontSize: '0.9rem' }}>{formatDate(tx.createdAt)}</td>
                        <td>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '4px',
                            background: 'var(--bg-secondary)',
                            fontWeight: '600'
                          }}>
                            {tx.type}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            fontWeight: '600', 
                            color: tx.amount > 0 ? 'var(--success-color)' : tx.amount < 0 ? 'var(--danger-color)' : 'var(--text-color)' 
                          }}>
                            {tx.amount > 0 ? '+' : ''}{formatPrice(tx.amount)}
                          </span>
                        </td>
                        <td>{getStatusBadge(tx.status)}</td>
                        <td style={{ fontSize: '0.9rem', maxWidth: '300px' }}>
                          {tx.description}
                          {tx.orderCode && <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', marginTop: '0.25rem' }}>Đơn: {tx.orderCode}</div>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
