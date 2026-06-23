import React, { useEffect, useState, useRef } from 'react';
import { Package, PlusCircle, ShoppingBag, Loader2, Sparkles, CheckCircle2, AlertTriangle, Clock, Wallet as WalletIcon, CreditCard, Save, TrendingUp, LayoutDashboard, Shield, Camera, RotateCcw, Store } from 'lucide-react';
import { sellerApi } from '../../api/seller/sellerApi';
import { categoriesApi } from '../../api/categories/categoriesApi';
import type { Category } from '../../api/categories/categoriesApi';
import { colorsApi } from '../../api/colors/colorsApi';
import type { ProductResponse } from '../../types/product';
import type { Order } from '../../types/order';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config/constants';
import { walletApi } from '../../api/wallet/walletApi';
import type { WalletResponse } from '../../api/wallet/walletApi';
import orderApi from '../../api/orders/orderApi';
import { compressImage } from '../../utils/imageCompressor';
import '../../styles/pages/seller.css';

type Tab = 'overview' | 'products' | 'new-product' | 'orders' | 'my-orders' | 'wallet';


interface AiAutoFillResult {
  name?: string; brand?: string; style?: string; gender?: string;
  description?: string; estimatedPrice?: string; material?: string; condition?: string;
  color?: string; conditionPercentage?: number; defects?: string[];
  category?: string; categoryId?: number;
  colorIds?: number[]; colorNames?: string[];
}

// Typewriter effect hook
function useTypewriter(target: string, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!target) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(target.slice(0, i + 1));
      i++;
      if (i >= target.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [target, speed]);
  return { displayed, done };
}

export default function SellerDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // States cho Thống kê
  const [stats, setStats] = useState<any>(null);

  // States cho Danh sách Sản phẩm
  const [products, setProducts] = useState<ProductResponse[]>([]);

  // States cho Danh sách Đơn hàng
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  // States cho Quản lý tiền giữ & Ngân hàng
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: '', bankAccountNumber: '', bankAccountName: '' });

  // States cho Form Thêm Sản Phẩm
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', categoryId: '', brand: '', gender: 'Unisex', style: '', stock: '', conditionPercentage: '100',
    length: '', shoulder: '', chest: '', waist: ''
  });

  const [sizes, setSizes] = useState('');
  const [colorIds, setColorIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<{id: number, name: string}[]>([]);
  const [defects, setDefects] = useState<string[]>([]);

  // AI Auto-fill states
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [aiSuggested, setAiSuggested] = useState<Record<string, boolean>>({});
  const [aiResult, setAiResult] = useState<AiAutoFillResult>({});

  // ── Legit Check 6-slot state (Primary Images) ─────────────────
  type LegitSlotKey = 'front' | 'back' | 'tag' | 'opt1' | 'opt2' | 'opt3'
  type LegitSlotState = {
    file: File | null; preview: string | null
    validating: boolean; valid: boolean | null; errorMsg: string
  }
  const LEGIT_SLOTS: { key: LegitSlotKey; icon: string; title: string; hint: string; required: boolean }[] = [
    { key: 'front', icon: '👕', title: 'Mặt trước', hint: 'Bắt buộc', required: true },
    { key: 'back',  icon: '👕', title: 'Mặt sau', hint: 'Bắt buộc', required: true },
    { key: 'tag',   icon: '🏷️', title: 'Mác/Logo/Size', hint: 'Bắt buộc', required: true },
    { key: 'opt1',  icon: '📷', title: 'Ảnh phụ 1', hint: 'Không bắt buộc', required: false },
    { key: 'opt2',  icon: '📷', title: 'Ảnh phụ 2', hint: 'Không bắt buộc', required: false },
    { key: 'opt3',  icon: '📷', title: 'Ảnh phụ 3', hint: 'Không bắt buộc', required: false },
  ]
  const emptyLegitSlot = (): LegitSlotState => ({ file: null, preview: null, validating: false, valid: null, errorMsg: '' })
  const [legitSlots, setLegitSlots] = useState<Record<LegitSlotKey, LegitSlotState>>({
    front: emptyLegitSlot(), back: emptyLegitSlot(), tag: emptyLegitSlot(),
    opt1: emptyLegitSlot(), opt2: emptyLegitSlot(), opt3: emptyLegitSlot(),
  })
  const legitFileRefs = useRef<Partial<Record<LegitSlotKey, HTMLInputElement | null>>>({})

  const validLegitSlots = [legitSlots.front, legitSlots.back, legitSlots.tag].filter(s => s.file && s.valid !== false).length
  const [twName, setTwName] = useState('');
  const [twDesc, setTwDesc] = useState('');
  const twNameEffect = useTypewriter(twName, 20);
  const twDescEffect = useTypewriter(twDesc, 12);

  useEffect(() => {
    if (twNameEffect.displayed) setFormData(p => ({ ...p, name: twNameEffect.displayed }));
  }, [twNameEffect.displayed]);
  useEffect(() => {
    if (twDescEffect.displayed) setFormData(p => ({ ...p, description: twDescEffect.displayed }));
  }, [twDescEffect.displayed]);

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [cats, cols] = await Promise.all([categoriesApi.list(), colorsApi.list()]);
        setCategories(cats);
        setColors(cols);
      } catch (error) {
        console.error('Lỗi khi tải danh mục và màu sắc', error);
      }
    };
    fetchSelectData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await sellerApi.getStatistics();
        setStats(res.data);
      } else if (activeTab === 'products') {
        const res = await sellerApi.getMyProducts(0, 50);
        setProducts(res.data.content);
      } else if (activeTab === 'orders') {
        const res = await sellerApi.getMyOrders(0, 50);
        setOrders(res.data.content);
      } else if (activeTab === 'my-orders') {
        const res = await orderApi.list(0, 50);
        setMyOrders(res.data.content);
      } else if (activeTab === 'wallet') {
        const res = await walletApi.getMyWallet();
        setWallet(res);
        setBankForm({
          bankName: res.bankName || '', bankAccountNumber: res.bankAccountNumber || '', bankAccountName: res.bankAccountName || ''
        });
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'new-product') {
      fetchData();
    }
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleAutoFill = async () => {
    const files = Object.values(legitSlots).map(s => s.file).filter(Boolean) as File[];
    if (files.length === 0) {
      toast.warn('Vui lòng tải ít nhất 1 ảnh kiểm định trước.');
      return;
    }
    setIsAutoFilling(true);
    setAiSuggested({});
    try {
      const fd = new FormData();
      files.slice(0, 3).forEach(f => fd.append('files', f));
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/autofill`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('AI trả về lỗi');
      const data: AiAutoFillResult = await res.json();
      setAiResult(data);

      if (data.name) setTwName(data.name);
      if (data.description) setTwDesc(data.description);

      let detectedCategoryId = formData.categoryId;
      if (data.categoryId && data.category) {
        const strId = data.categoryId.toString();
        const exists = categories.some(cat => cat.id.toString() === strId || cat.children?.some(c => c.id.toString() === strId));
        if (!exists) {
          setCategories(prev => [...prev, { id: data.categoryId!, name: data.category!, children: [] }]);
        }
        detectedCategoryId = strId;
      } else if (data.category) {
        for (const cat of categories) {
          if (cat.name.toLowerCase() === data.category.toLowerCase()) {
            detectedCategoryId = cat.id.toString();
            break;
          }
          if (cat.children) {
            const childMatch = cat.children.find(c => c.name.toLowerCase() === data.category?.toLowerCase());
            if (childMatch) {
              detectedCategoryId = childMatch.id.toString();
              break;
            }
          }
        }
      }

      setFormData(prev => ({
        ...prev,
        categoryId: detectedCategoryId,
        brand: data.brand ?? prev.brand,
        style: data.style ?? prev.style,
        gender: data.gender ?? prev.gender,
        price: data.estimatedPrice ? String(Number(data.estimatedPrice.replace(/\D/g, ''))) || prev.price : prev.price,
        conditionPercentage: data.conditionPercentage ? String(data.conditionPercentage) : prev.conditionPercentage
      }));
      
      if (data.defects && data.defects.length > 0) {
        setDefects(data.defects.filter(d => d !== 'MINT'));
      }
      
      let colorDetected = false;
      if (data.colorIds && data.colorIds.length > 0 && data.colorNames) {
        const newColorIds = data.colorIds;
        setColors(prev => {
          const updated = [...prev];
          data.colorIds!.forEach((cId, i) => {
            if (!updated.some(c => c.id === cId)) {
              updated.push({ id: cId, name: data.colorNames![i] });
            }
          });
          return updated;
        });
        setColorIds(prev => Array.from(new Set([...prev, ...newColorIds])));
        colorDetected = true;
      } else if (data.color) {
        const detectedColorIds = colors
          .filter(c => data.color?.toLowerCase().includes(c.name.toLowerCase()))
          .map(c => c.id);
        if (detectedColorIds.length > 0) {
          setColorIds(prev => Array.from(new Set([...prev, ...detectedColorIds])));
          colorDetected = true;
        }
      }

      setAiSuggested({ name: true, description: true, brand: !!data.brand, style: !!data.style, gender: !!data.gender, price: !!data.estimatedPrice, color: colorDetected, condition: !!data.conditionPercentage });
      toast.success('✨ AI đã điền thông tin xong!');
    } catch (e: any) {
      toast.error(e.message || 'AI phân tích thất bại.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  // ── Legit Check: validate từng slot ảnh kiểm định ────────────
  const handleLegitSlotChange = async (slotKey: LegitSlotKey, file: File | null) => {
    if (!file) return
    
    // Nén ảnh trên browser để tránh OOM ở server và tăng tốc độ upload
    const compressedFile = await compressImage(file, 800, 0.7);
    const previewUrl = URL.createObjectURL(compressedFile)
    
    setLegitSlots(prev => ({ ...prev, [slotKey]: { file: compressedFile, preview: previewUrl, validating: true, valid: null, errorMsg: '' } }))
    try {
      const fd = new FormData()
      fd.append('file', compressedFile)
      fd.append('slotType', slotKey)
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/validate-slot`, { method: 'POST', body: fd })
      const data = res.ok ? await res.json() : { valid: true }
      const isValid: boolean = data.valid !== false
      setLegitSlots(prev => ({ ...prev, [slotKey]: { file, preview: previewUrl, validating: false, valid: isValid, errorMsg: isValid ? '' : data.message || '' } }))
      if (!isValid) toast.warning(data.message, { autoClose: 5000 })
    } catch {
      setLegitSlots(prev => ({ ...prev, [slotKey]: { file, preview: previewUrl, validating: false, valid: true, errorMsg: '' } }))
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const filesToUpload = Object.values(legitSlots).map(s => s.file).filter(Boolean) as File[];
    const requiredFiles = [legitSlots.front.file, legitSlots.back.file, legitSlots.tag.file].filter(Boolean);
    if (requiredFiles.length < 3) {
      toast.error('Vui lòng chụp đủ 3 ảnh bắt buộc (mặt trước, sau, mác).');
      return;
    }
    if (!sizes.trim()) {
      toast.error('Vui lòng nhập kích thước sản phẩm.');
      return;
    }
    if (colorIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 màu sắc.');
      return;
    }
    setIsLoading(true);
    try {
      const uploadedUrls = await sellerApi.uploadImages(filesToUpload);
      
      const payload = {
        ...formData,
        price: Number(formData.price),
        categoryId: Number(formData.categoryId),
        stock: Number(formData.stock),
        length: formData.length ? Number(formData.length) : null,
        shoulder: formData.shoulder ? Number(formData.shoulder) : null,
        chest: formData.chest ? Number(formData.chest) : null,
        waist: formData.waist ? Number(formData.waist) : null,
        imageUrls: uploadedUrls,
        sizes: sizes.split(',').map((item) => item.trim()).filter(Boolean),
        colorIds: colorIds,
        conditionPercentage: Number(formData.conditionPercentage),
        defects: defects.length > 0 ? defects : ['MINT']
      };
      await sellerApi.createProduct(payload);
      toast.success('Đăng sản phẩm thành công!');
      setFormData({ name: '', description: '', price: '', categoryId: '', brand: '', gender: 'Unisex', style: '', stock: '', conditionPercentage: '100', length: '', shoulder: '', chest: '', waist: '' });
      setLegitSlots({ front: emptyLegitSlot(), back: emptyLegitSlot(), tag: emptyLegitSlot(), opt1: emptyLegitSlot(), opt2: emptyLegitSlot(), opt3: emptyLegitSlot() });
      setSizes('');
      setColorIds([]);
      setDefects([]);
      setAiSuggested({});
      setAiResult({});
      setActiveTab('products');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMoney = (amount: number | null | undefined) => {
    if (amount == null) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleSaveBank = async () => {
    setIsSavingBank(true);
    try {
      await walletApi.updateBankAccount(bankForm);
      toast.success('Cập nhật tài khoản ngân hàng thành công!');
      setIsEditingBank(false);
      fetchData(); // reload ví
    } catch (error) {
      toast.error('Lỗi khi cập nhật tài khoản ngân hàng');
    } finally {
      setIsSavingBank(false);
    }
  };

  return (
    <div className="seller-page">
      <div className="seller-layout">

        {/* ── SIDEBAR ──────────────────────────── */}
        <aside className="seller-sidebar">
          <div className="seller-sidebar__brand">
            <div className="seller-sidebar__brand-icon">
              <Store size={20} />
            </div>
            <div>
              <div className="seller-sidebar__brand-text">Kênh người bán</div>
              <div className="seller-sidebar__brand-sub">Quản lý trung tâm</div>
            </div>
          </div>

          <nav className="seller-sidebar__nav">
            <button
              onClick={() => setActiveTab('overview')}
              className={`seller-sidebar__nav-item${activeTab === 'overview' ? ' active' : ''}`}
            >
              <LayoutDashboard size={16} /> Tổng quan
            </button>

            <div className="seller-sidebar__section-label">Kênh người bán</div>

            <button
              onClick={() => setActiveTab('products')}
              className={`seller-sidebar__nav-item${activeTab === 'products' ? ' active' : ''}`}
            >
              <Package size={16} /> Sản phẩm ký gửi
            </button>
            <button
              onClick={() => setActiveTab('new-product')}
              className={`seller-sidebar__nav-item${activeTab === 'new-product' ? ' active' : ''}`}
            >
              <PlusCircle size={16} /> Đăng bán sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`seller-sidebar__nav-item${activeTab === 'orders' ? ' active' : ''}`}
            >
              <ShoppingBag size={16} /> Đơn hàng chờ xử lý
            </button>

            <div className="seller-sidebar__section-label">Tài chính</div>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`seller-sidebar__nav-item${activeTab === 'wallet' ? ' active' : ''}`}
            >
              <WalletIcon size={16} /> Ví & Ngân hàng
            </button>
          </nav>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────── */}
        <main className="seller-main">
          {isLoading && activeTab !== 'new-product' ? (
            <div className="seller-loading">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <>
              {/* TAB: TỔNG QUAN (THỐNG KÊ) */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Thống kê hoạt động</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Package size={24} /></div>
                      <div>
                        <p className="text-gray-500 text-sm">Tổng sản phẩm</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.totalProducts || 0}</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600"><ShoppingBag size={24} /></div>
                      <div>
                        <p className="text-gray-500 text-sm">Đơn hàng (Đã bán)</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.totalOrders || 0}</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><TrendingUp size={24} /></div>
                      <div>
                        <p className="text-gray-500 text-sm">Doanh thu dự kiến</p>
                        <p className="text-2xl font-bold text-gray-800">{formatMoney(stats?.totalRevenue)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: QUẢN LÝ TIỀN GIỮ */}
              {activeTab === 'wallet' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-blue-100">
                        <WalletIcon size={20} /> <span className="font-medium">Số dư khả dụng</span>
                      </div>
                      <div className="text-3xl font-bold mb-4">{formatMoney(wallet?.balance)}</div>
                      <p className="text-sm text-blue-100 bg-black/10 inline-block px-3 py-1 rounded-full">Có thể rút bất cứ lúc nào</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-amber-100">
                        <Clock size={20} /> <span className="font-medium">Tiền đang tạm giữ (Escrow)</span>
                      </div>
                      <div className="text-3xl font-bold mb-4">{formatMoney(wallet?.escrowBalance)}</div>
                      <p className="text-sm text-amber-100 bg-black/10 inline-block px-3 py-1 rounded-full">Sẽ tự động cộng vào Số dư khả dụng sau 48h giao hàng</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-800">Tài khoản ngân hàng nhận tiền</h3>
                      {!isEditingBank ? (
                        <button onClick={() => setIsEditingBank(true)} className="text-blue-600 hover:text-blue-700 font-medium text-sm px-4 py-2 border border-blue-600 rounded-lg">Chỉnh sửa</button>
                      ) : (
                        <button onClick={() => setIsEditingBank(false)} className="text-gray-500 hover:text-gray-700 font-medium text-sm px-4 py-2 border rounded-lg">Hủy</button>
                      )}
                    </div>

                    {isEditingBank ? (
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tên Ngân hàng</label>
                          <input type="text" value={bankForm.bankName} onChange={e => setBankForm(p => ({...p, bankName: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" placeholder="VD: Vietcombank, MB Bank" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Số Tài Khoản</label>
                          <input type="text" value={bankForm.bankAccountNumber} onChange={e => setBankForm(p => ({...p, bankAccountNumber: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" placeholder="Nhập số tài khoản" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tên Chủ Tài Khoản</label>
                          <input type="text" value={bankForm.bankAccountName} onChange={e => setBankForm(p => ({...p, bankAccountName: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" placeholder="NGUYEN VAN A" />
                        </div>
                        <button onClick={handleSaveBank} disabled={isSavingBank} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center">
                          {isSavingBank ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />} Lưu thông tin
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4 max-w-md">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                          <CreditCard size={24} />
                        </div>
                        <div>
                          {wallet?.bankAccountNumber ? (
                            <>
                              <p className="font-semibold text-gray-800">{wallet.bankName} - {wallet.bankAccountNumber}</p>
                              <p className="text-sm text-gray-500 uppercase">{wallet.bankAccountName}</p>
                            </>
                          ) : (
                            <p className="text-gray-500 italic">Chưa thiết lập tài khoản ngân hàng</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="text-lg font-semibold text-gray-800">Lịch sử giao dịch</h3>
                    </div>
                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                            <th className="p-4 font-medium">Thời gian</th>
                            <th className="p-4 font-medium">Loại</th>
                            <th className="p-4 font-medium">Số tiền</th>
                            <th className="p-4 font-medium">Mô tả</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!wallet?.transactions || wallet.transactions.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Chưa có giao dịch nào.</td></tr>
                          ) : (
                            wallet.transactions.map(txn => (
                              <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 text-sm text-gray-600">{new Date(txn.createdAt).toLocaleString('vi-VN')}</td>
                                <td className="p-4">
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${txn.type === 'ESCROW_HOLD' ? 'bg-amber-100 text-amber-700' : txn.type === 'ESCROW_RELEASE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {txn.type}
                                  </span>
                                </td>
                                <td className={`p-4 font-semibold ${txn.type === 'ESCROW_RELEASE' ? 'text-green-600' : 'text-amber-600'}`}>
                                  {txn.type === 'ESCROW_RELEASE' ? '+' : ''}{formatMoney(txn.amount)}
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                  {txn.description}
                                  {txn.orderCode && <span className="block text-xs text-gray-400 mt-0.5">Đơn hàng: {txn.orderCode}</span>}
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

              {/* TAB: ĐƠN HÀNG CỦA TÔI (MUA) */}
              {activeTab === 'my-orders' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">Đơn hàng bạn đã mua</h3>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                          <th className="p-4 font-medium">Mã đơn</th>
                          <th className="p-4 font-medium">Thời gian đặt</th>
                          <th className="p-4 font-medium">Tổng tiền</th>
                          <th className="p-4 font-medium">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myOrders.length === 0 ? (
                          <tr><td colSpan={4} className="p-8 text-center text-gray-500">Bạn chưa mua đơn hàng nào.</td></tr>
                        ) : (
                          myOrders.map(order => (
                            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="p-4 font-medium text-blue-600">#{order.code}</td>
                              <td className="p-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                              <td className="p-4 font-semibold">{formatMoney(order.totalAmount)}</td>
                              <td className="p-4">
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                  order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                  order.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                  order.status === 'CANCELED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: SẢN PHẨM CỦA TÔI */}
              {activeTab === 'products' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">Danh sách Sản phẩm Ký gửi</h3>
                    <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm font-medium">
                      {products.length} sản phẩm
                    </span>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                          <th className="p-4 font-medium">Sản phẩm</th>
                          <th className="p-4 font-medium">Phân loại</th>
                          <th className="p-4 font-medium">Giá bán</th>
                          <th className="p-4 font-medium">Tồn kho</th>
                          <th className="p-4 font-medium">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-gray-500">Bạn chưa có sản phẩm nào.</td></tr>
                        ) : (
                          products.map(product => (
                            <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative">
                                    {product.imageUrls && product.imageUrls[0] ? (
                                      <img src={product.imageUrls[0].startsWith('http') ? product.imageUrls[0] : `${API_BASE_URL}${product.imageUrls[0]}`} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No IMG</div>
                                    )}
                                    {product.conditionPercentage && (
                                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-bold text-center py-0.5">
                                        {product.conditionPercentage}%
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.brand}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-gray-600">{product.category || `ID: ${product.categoryId}`}</td>
                              <td className="p-4 text-sm font-medium text-blue-600">{formatMoney(product.price)}</td>
                              <td className="p-4 text-sm text-gray-600">{product.stock}</td>
                              <td className="p-4">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : product.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : product.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {product.status === 'PENDING' ? 'Chờ duyệt' : product.status === 'REJECTED' ? 'Từ chối' : product.status === 'ACTIVE' ? 'Đã duyệt' : (product.status || 'Đã duyệt')}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: ĐƠN HÀNG */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">Đơn hàng chứa sản phẩm của bạn</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {orders.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">Chưa có đơn hàng nào.</div>
                    ) : (
                      orders.map(order => (
                        <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                            <div><p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p><p className="font-bold text-gray-800">#{order.code}</p></div>
                            <div><p className="text-sm text-gray-500 mb-1">Ngày tạo</p><p className="font-medium text-gray-800">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p></div>
                            <div><p className="text-sm text-gray-500 mb-1">Trạng thái Giao hàng</p><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase">{order.status}</span></div>
                          </div>
                          <div className="p-5 border-b border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">Sản phẩm trong đơn:</h4>
                            <div className="space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">{item.quantity}x</span>
                                    <span className="text-gray-700">{item.productName || `Product #${item.productId}`}</span>
                                  </div>
                                  <span className="font-medium text-gray-800">{formatMoney(item.lineTotal)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="bg-blue-50/30 p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                            {order.status === 'DELIVERED' ? (
                              <>
                                <div className="w-full sm:w-auto">
                                  <p className="text-sm text-gray-500 mb-1">Thanh toán cho Seller</p>
                                  <p className="text-xl font-bold text-blue-700">{formatMoney(order.sellerAmount)}</p>
                                  <p className="text-xs text-gray-400 mt-1">Phí sàn: {formatMoney(order.platformFee)}</p>
                                </div>
                                <div className="w-full sm:w-auto text-right">
                                  <p className="text-sm text-gray-500 mb-2">Trạng thái Tiền (Escrow)</p>
                                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${order.escrowStatus === 'RELEASED' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                                    {order.escrowStatus === 'RELEASED' ? 'Đã Thanh Toán (RELEASED)' : 'Đang Giữ 48h (HELD)'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="w-full text-center text-sm text-gray-500 italic py-2">
                                Đơn hàng chưa giao thành công. Doanh thu sẽ được tính sau khi trạng thái là DELIVERED.
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: TẠO SẢN PHẨM */}
              {activeTab === 'new-product' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">Đăng sản phẩm ký gửi</h3>
                    <p className="text-sm text-gray-500 mt-1">Tải ảnh lên trước, TWINL AI sẽ giúp bạn tự động điền thông tin.</p>
                  </div>
                  
                  <form onSubmit={handleCreateProduct} className="p-6">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                      
                      {/* Cột trái: Upload Image (Legit Check Section) */}
                      <div className="xl:col-span-5 bg-white border border-gray-200 rounded-xl p-6 sticky top-8">
                        <div className="flex items-center gap-2 mb-4">
                          <Shield size={20} className="text-emerald-600" />
                          <h4 className="font-semibold text-gray-800">1. Ảnh sản phẩm & Kiểm định *</h4>
                        </div>
                        <p className="text-xs text-gray-500 mb-5">
                          Tải lên đủ 3 ảnh bắt buộc để AI tự động điền thông tin và kiểm định chính hãng.
                        </p>

                        <div className="grid grid-cols-3 gap-3 mb-5">
                          {LEGIT_SLOTS.map((slot, idx) => {
                            const st = legitSlots[slot.key]
                            const isFilled = !!st.file
                            const isInvalid = st.valid === false
                            return (
                              <div key={slot.key} className="flex flex-col gap-1.5">
                                <input
                                  ref={el => { legitFileRefs.current[slot.key] = el }}
                                  type="file" accept="image/*" capture="environment"
                                  className="hidden"
                                  onChange={e => { handleLegitSlotChange(slot.key, e.target.files?.[0] ?? null); e.target.value = '' }}
                                />
                                <div
                                  role="button" tabIndex={0}
                                  onClick={() => legitFileRefs.current[slot.key]?.click()}
                                  onKeyDown={e => e.key === 'Enter' && legitFileRefs.current[slot.key]?.click()}
                                  className={`relative aspect-[3/4] rounded-xl border-2 cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-1 transition-all ${
                                    isInvalid ? 'border-red-400 bg-red-50' :
                                    isFilled && st.valid ? 'border-emerald-400 bg-emerald-50/30' :
                                    'border-dashed border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/20'
                                  }`}
                                >
                                  {st.preview ? (
                                    <>
                                      <img src={st.preview} className="w-full h-full object-cover absolute inset-0" alt={slot.title} />
                                      {/* validating spinner */}
                                      {st.validating && (
                                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1 text-white">
                                          <Loader2 size={18} className="animate-spin" />
                                          <span className="text-[10px]">AI kiểm tra...</span>
                                        </div>
                                      )}
                                      {/* valid badge */}
                                      {st.valid && !st.validating && (
                                        <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                                          <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                      )}
                                      {/* invalid badge */}
                                      {isInvalid && !st.validating && (
                                        <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow">
                                          <AlertTriangle size={11} className="text-white" />
                                        </div>
                                      )}
                                      {/* hover re-upload */}
                                      <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                                        <RotateCcw size={16} className="text-white" />
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-2xl">{slot.icon}</span>
                                      <Camera size={13} className="text-gray-400" />
                                    </>
                                  )}
                                </div>
                                <p className={`text-[11px] text-center font-medium leading-tight mt-1 ${
                                  isInvalid ? 'text-red-500' : isFilled && st.valid ? 'text-emerald-600' : slot.required ? 'text-gray-700' : 'text-gray-400'
                                }`}>
                                  <span className="text-gray-400 mr-1">{idx+1}.</span>{slot.title}
                                  {slot.required && <span className="text-red-500 ml-0.5">*</span>}
                                </p>
                                {!isFilled && <p className="text-[10px] text-center text-gray-400 leading-tight">{slot.hint}</p>}
                                {isInvalid && <p className="text-[10px] text-center text-red-500 leading-tight">{st.errorMsg}</p>}
                              </div>
                            )
                          })}
                        </div>

                        {/* Progress indicator */}
                        <div className="flex flex-col gap-3 mb-5">
                          <div className="flex-1">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-700 to-emerald-400 rounded-full transition-all duration-300"
                                style={{ width: `${(validLegitSlots / 3) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-[10px] text-gray-400">
                                {`${validLegitSlots}/3 ảnh bắt buộc`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* AI Auto Fill Button */}
                        <div className="pt-5 border-t border-gray-100">
                          <button type="button" onClick={handleAutoFill} disabled={isAutoFilling || validLegitSlots < 3} className="w-full bg-gradient-to-r from-teal-800 to-green-500 hover:from-teal-700 hover:to-green-400 text-white rounded-xl py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                              <Sparkles size={16} className={isAutoFilling ? "animate-spin" : ""} />
                              {isAutoFilling ? 'AI đang phân tích...' : '2. Nhờ AI điền thông tin'}
                          </button>
                          <p className="text-[10px] text-gray-400 mt-2 text-center">AI sẽ đọc chi tiết từ các ảnh kiểm định trên để viết mô tả cho bạn.</p>
                        </div>
                      </div>

                      {/* Cột phải: Form Content */}
                      <div className="xl:col-span-7 bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-semibold text-gray-800">3. Thông tin chi tiết</h4>
                            {isAutoFilling && <span className="text-green-500 text-xs font-bold flex items-center gap-1 animate-pulse"><Sparkles size={12}/> AI đang điền</span>}
                        </div>

                        <div className="space-y-5">
                          {/* Tên */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
                                Tên sản phẩm *
                                {aiSuggested.name && <span className="bg-green-50 text-green-600 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold leading-none">✦ AI Gợi ý</span>}
                            </label>
                            {isAutoFilling && !twNameEffect.done ? <div className="h-[42px] w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-pulse" /> : 
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ví dụ: Áo khoác dạ vintage" className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-colors ${aiSuggested.name ? 'bg-green-50/30 border-green-300 focus:border-green-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} />}
                          </div>

                          <div className="grid grid-cols-2 gap-5">
                            {/* Giá */}
                            <div>
                              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
                                  Giá bán (VNĐ) * 
                                  {aiSuggested.price && <span className="bg-green-50 text-green-600 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold leading-none">✦ AI Gợi ý</span>}
                              </label>
                              <input required type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Ví dụ: 150000" className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-colors ${aiSuggested.price ? 'bg-green-50/30 border-green-300 focus:border-green-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} />
                            </div>
                            
                            {/* Thương hiệu */}
                            <div>
                              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
                                  Thương hiệu * 
                                  {aiSuggested.brand && <span className="bg-green-50 text-green-600 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold leading-none">✦ AI Gợi ý</span>}
                              </label>
                              <input required type="text" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Nike, Adidas, No brand..." className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-colors ${aiSuggested.brand ? 'bg-green-50/30 border-green-300 focus:border-green-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} />
                            </div>

                            {/* Danh mục */}
                            <div>
                              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">Danh mục *</label>
                              <select required name="categoryId" value={formData.categoryId} onChange={(e) => {
                                const selectedId = e.target.value;
                                let detectedGender = formData.gender;
                                for (const cat of categories) {
                                  if (cat.id.toString() === selectedId) { detectedGender = cat.name; break; }
                                  if (cat.children?.some(child => child.id.toString() === selectedId)) {
                                    if (['Nữ', 'Nam', 'Thể thao'].includes(cat.name)) {
                                      detectedGender = cat.name;
                                    }
                                    break;
                                  }
                                }
                                setFormData(prev => ({ ...prev, categoryId: selectedId, gender: detectedGender }));
                              }} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white">
                                <option value="" disabled>Chọn danh mục</option>
                                {categories.map((category) => (
                                  <optgroup key={category.id} label={category.name}>
                                    {category.children && category.children.length > 0 ? (
                                      category.children.map(child => (
                                        <option key={child.id} value={child.id}>{child.name}</option>
                                      ))
                                    ) : (
                                      <option value={category.id}>{category.name}</option>
                                    )}
                                  </optgroup>
                                ))}
                              </select>
                            </div>

                            {/* Phong cách */}
                            <div>
                              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
                                  Phong cách 
                                  {aiSuggested.style && <span className="bg-green-50 text-green-600 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold leading-none">✦ AI Gợi ý</span>}
                              </label>
                              <input type="text" name="style" value={formData.style} onChange={handleInputChange} placeholder="Streetwear, Minimal..." className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-colors ${aiSuggested.style ? 'bg-green-50/30 border-green-300 focus:border-green-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} />
                            </div>

                            {/* Stock */}
                            <div>
                              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">Số lượng kho *</label>
                              <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="Số lượng ký gửi" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" />
                            </div>
                          </div>


                          {/* Tình trạng & Lỗi (Smart Filter cho đồ Si) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                            {/* Condition Percentage */}
                            <div>
                              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
                                Độ mới (%) *
                                {aiSuggested.condition && <span className="bg-green-50 text-green-600 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold leading-none">✦ AI Gợi ý</span>}
                              </label>
                              <div className="flex items-center gap-4">
                                <input 
                                  type="range" 
                                  min="50" 
                                  max="100" 
                                  step="5"
                                  name="conditionPercentage" 
                                  value={formData.conditionPercentage} 
                                  onChange={handleInputChange} 
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                                />
                                <span className="font-semibold text-blue-600 w-12">{formData.conditionPercentage}%</span>
                              </div>
                            </div>

                            {/* Defects */}
                            <div>
                              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                Tình trạng lỗi
                                {aiSuggested.condition && <span className="bg-green-50 text-green-600 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold leading-none">✦ AI Gợi ý</span>}
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { value: 'MINT', label: 'Không lỗi' },
                                  { value: 'MINOR_FLAW', label: 'Sờn nhẹ' },
                                  { value: 'STAINED', label: 'Bẩn/Ố vàng' },
                                  { value: 'MISSING_BUTTON', label: 'Mất cúc' },
                                  { value: 'TORN', label: 'Rách nhỏ' },
                                  { value: 'FADED', label: 'Phai màu' }
                                ].map((defect) => (
                                  <label 
                                    key={defect.value}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-all border ${
                                      defects.includes(defect.value) || (defects.length === 0 && defect.value === 'MINT')
                                        ? 'bg-red-50 text-red-700 border-red-200 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      className="hidden"
                                      checked={defects.includes(defect.value) || (defects.length === 0 && defect.value === 'MINT')}
                                      onChange={(e) => {
                                        if (defect.value === 'MINT') {
                                          setDefects([]);
                                        } else {
                                          if (e.target.checked) {
                                            setDefects(prev => [...prev.filter(d => d !== 'MINT'), defect.value]);
                                          } else {
                                            setDefects(prev => prev.filter(d => d !== defect.value));
                                          }
                                        }
                                      }}
                                    />
                                    {defect.label}
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Kích thước */}
                          <div className="mt-5">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">Kích thước (phân cách dấu phẩy) <span className="text-red-500">*</span></label>
                            <input required type="text" value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="Ví dụ: S, M, L, XL" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" />
                          </div>

                          {/* Số đo chi tiết */}
                          <div className="mt-5">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">Số đo chi tiết (tuỳ chọn - tính bằng cm)</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Dài</label>
                                <input type="number" name="length" value={formData.length} onChange={handleInputChange} placeholder="Ví dụ: 124" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Vai</label>
                                <input type="number" name="shoulder" value={formData.shoulder} onChange={handleInputChange} placeholder="Ví dụ: 53" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Ngực</label>
                                <input type="number" name="chest" value={formData.chest} onChange={handleInputChange} placeholder="Ví dụ: 116" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Eo</label>
                                <input type="number" name="waist" value={formData.waist} onChange={handleInputChange} placeholder="Ví dụ: 116" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" />
                              </div>
                            </div>
                          </div>

                          {/* Màu sắc */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                Màu sắc <span className="text-red-500">*</span> 
                                {aiSuggested.color && <span className="bg-green-50 text-green-600 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold leading-none">✦ AI Gợi ý</span>}
                            </label>
                            <div className="flex flex-wrap gap-2.5">
                              {colors.map((color) => (
                                <label key={color.id} className={`flex items-center gap-2 px-3 py-1.5 border rounded-full cursor-pointer transition-colors ${colorIds.includes(color.id) ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'border-gray-200 hover:bg-gray-50'}`}>
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={colorIds.includes(color.id)}
                                    onChange={() => {
                                      setColorIds((prev) =>
                                        prev.includes(color.id)
                                          ? prev.filter((id) => id !== color.id)
                                          : [...prev, color.id]
                                      );
                                    }}
                                  />
                                  <span className="text-sm">{color.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Mô tả */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
                              Mô tả chi tiết
                              {aiSuggested.description && <span className="bg-green-50 text-green-600 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold leading-none">✦ AI Gợi ý</span>}
                            </label>
                            {isAutoFilling && !twDescEffect.done ? <div className="h-24 w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-pulse" /> : 
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-colors resize-none ${aiSuggested.description ? 'bg-green-50/30 border-green-300 focus:border-green-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`} placeholder="Mô tả tình trạng, chất liệu..." />}
                          </div>

                          {/* AI Condition Note */}
                          {aiResult.condition && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-start gap-2">
                              <Sparkles size={16} className="text-green-600 shrink-0 mt-0.5" />
                              <p>
                                <strong>AI nhận định:</strong> Tình trạng <span className="font-semibold">{aiResult.condition}</span> 
                                {aiResult.material && <>, Chất liệu <span className="font-semibold">{aiResult.material}</span></>}
                                {aiResult.color && <>, Màu sắc <span className="font-semibold">{aiResult.color}</span></>}
                              </p>
                            </div>
                          )}

                          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                            <button type="submit" disabled={isLoading || validLegitSlots < 3} className="ml-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-xl shadow-sm transition-all focus:ring-4 focus:ring-blue-100 flex items-center">
                              {isLoading ? (
                                <><Loader2 className="animate-spin mr-2" size={18} /> Đang xử lý...</>
                              ) : '4. Xác nhận Đăng bán'}
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
