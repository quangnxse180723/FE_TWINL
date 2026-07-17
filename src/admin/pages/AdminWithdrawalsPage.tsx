import { useEffect, useState } from 'react';
import { walletApi } from '../../api/wallet/walletApi';
import type { WithdrawalRequestResponse } from '../../api/wallet/walletApi';
import { toast } from 'react-toastify';
import { Loader2, CheckCircle, XCircle, CreditCard, Banknote } from 'lucide-react';
import '../../styles/pages/admin.css';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const data = await walletApi.getPendingWithdrawals();
      setWithdrawals(data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách yêu cầu rút tiền');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (id: number) => {
    if (!window.confirm('Bạn đã chuyển tiền cho người bán này chưa? Nhấn OK nếu đã chuyển tiền thành công.')) {
      return;
    }
    setProcessingId(id);
    try {
      await walletApi.approveWithdrawal(id);
      toast.success('Đã duyệt yêu cầu rút tiền thành công');
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi duyệt yêu cầu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (id: number) => {
    setSelectedId(id);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedId) return;
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setProcessingId(selectedId);
    try {
      await walletApi.rejectWithdrawal(selectedId, rejectReason);
      toast.success('Đã từ chối yêu cầu rút tiền');
      setIsRejectModalOpen(false);
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi từ chối yêu cầu');
    } finally {
      setProcessingId(null);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="admin-page">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Yêu cầu Rút tiền</h1>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
          <Banknote size={18} />
          {withdrawals.length} Yêu cầu chờ duyệt
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">Hiện không có yêu cầu rút tiền nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold">Người yêu cầu</th>
                  <th className="p-4 font-semibold">Số tiền</th>
                  <th className="p-4 font-semibold w-[250px]">Thông tin ngân hàng</th>
                  <th className="p-4 font-semibold">Ngày yêu cầu</th>
                  <th className="p-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">{item.sellerName}</p>
                      <p className="text-sm text-gray-500">{item.sellerEmail}</p>
                    </td>
                    <td className="p-4 font-bold text-blue-600">
                      {formatMoney(item.amount)}
                    </td>
                    <td className="p-4">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                        <p className="font-semibold text-gray-800">{item.bankName}</p>
                        <p className="text-gray-600 font-mono my-0.5">{item.bankAccountNumber}</p>
                        <p className="text-gray-500 uppercase">{item.bankAccountName}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={processingId === item.id}
                          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {processingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleRejectClick(item.id)}
                          disabled={processingId === item.id}
                          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <XCircle size={16} /> Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Từ chối rút tiền</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối (bắt buộc)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-red-500"
                rows={3}
                placeholder="Nhập lý do để người bán biết..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleRejectConfirm}
                disabled={processingId === selectedId || !rejectReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center disabled:opacity-50"
              >
                {processingId === selectedId ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
