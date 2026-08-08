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
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Thành công</span>
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">Chờ xử lý</span>
      case 'FAILED':
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">Thất bại</span>
      default:
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">{status}</span>
    }
  }

  return (
    <div className="p-6 md:p-8 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Giải ngân</h1>
          <p className="text-gray-500 mt-1">Theo dõi số dư và lịch sử giải ngân của tài khoản</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm" onClick={fetchWallets}>
          <RefreshCcw size={18} /> Cập nhật
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 max-w-md">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">Người dùng</th>
                <th className="p-4 font-semibold">Số dư khả dụng</th>
                <th className="p-4 font-semibold">Chờ giải ngân</th>
                <th className="p-4 font-semibold">Ngân hàng</th>
                <th className="p-4 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-500">Đang tải...</td>
                </tr>
              ) : filteredWallets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-500">Không tìm thấy ví nào</td>
                </tr>
              ) : (
                filteredWallets.map((wallet) => (
                  <tr key={wallet.userId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{wallet.sellerName}</div>
                      <div className="text-sm text-gray-500">{wallet.sellerEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-green-600">
                        {formatPrice(wallet.balance)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-orange-500">
                        {formatPrice(wallet.escrowBalance)}
                      </span>
                    </td>
                    <td className="p-4">
                      {wallet.bankName ? (
                        <>
                          <div className="font-semibold text-sm text-gray-800">{wallet.bankName}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{wallet.bankAccountNumber}</div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Chưa cập nhật</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleViewHistory(wallet)}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
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

      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Lịch sử giao dịch</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Người dùng: <span className="font-medium text-gray-700">{selectedUser.sellerName}</span> ({selectedUser.sellerEmail})
                </p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {txLoading ? (
                <div className="text-center p-8 text-gray-500">Đang tải lịch sử...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center p-8 text-gray-500">Chưa có giao dịch nào.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                        <th className="p-3 font-semibold">Thời gian</th>
                        <th className="p-3 font-semibold">Loại</th>
                        <th className="p-3 font-semibold text-right">Số tiền</th>
                        <th className="p-3 font-semibold text-center">Trạng thái</th>
                        <th className="p-3 font-semibold">Mô tả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="p-3 text-gray-600">{formatDate(tx.createdAt)}</td>
                          <td className="p-3">
                            <span className={`font-medium ${tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'text-green-600' : 'text-blue-600'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {tx.amount > 0 ? '+' : ''}{formatPrice(tx.amount)}
                            </span>
                          </td>
                          <td className="p-3 text-center">{getStatusBadge(tx.status)}</td>
                          <td className="p-3 text-gray-500 truncate max-w-[200px]" title={tx.description}>
                            {tx.description}
                            {tx.orderCode && <div className="text-xs text-blue-500 mt-1">Đơn: {tx.orderCode}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
