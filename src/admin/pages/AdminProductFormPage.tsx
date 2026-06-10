import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { adminProductsApi } from '../api/adminProductsApi'
import { categoriesApi } from '../../api/categories/categoriesApi'
import { colorsApi } from '../../api/colors/colorsApi'
import { PATHS } from '../../routes/paths'
import type { AdminProductPayload } from '../types'
import { API_BASE_URL } from '../../config/constants'
import { toast } from 'react-toastify'
import { Sparkles, CheckCircle2, AlertTriangle, Loader2, ArrowRight, Shield, Camera, RotateCcw } from 'lucide-react'
import { compressImage } from '../../utils/imageCompressor'
import '../../styles/pages/adminProductForm.css'

const emptyForm: AdminProductPayload = {
  name: '', description: '', price: 0, categoryId: 0,
  brand: '', gender: '', imageUrls: [], status: 'ACTIVE',
  style: '', stock: 0, sizes: [], colorIds: [],
}

interface AiAutoFillResult {
  name?: string; brand?: string; style?: string; gender?: string
  description?: string; estimatedPrice?: string; material?: string; condition?: string
  color?: string;
}

// ── Legit Check 6-slot state ─────────────────
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

// Typewriter effect hook
function useTypewriter(target: string, speed = 18) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!target) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(target.slice(0, i + 1))
      i++
      if (i >= target.length) { clearInterval(interval); setDone(true) }
    }, speed)
    return () => clearInterval(interval)
  }, [target, speed])
  return { displayed, done }
}

export default function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<AdminProductPayload>(emptyForm)
  const [sizes, setSizes] = useState('')
  const [colorIds, setColorIds] = useState<number[]>([])
  const [formError, setFormError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [aiSuggested, setAiSuggested] = useState<Record<string, boolean>>({})
  const [aiResult, setAiResult] = useState<AiAutoFillResult>({})
  
  const [legitSlots, setLegitSlots] = useState<Record<LegitSlotKey, LegitSlotState>>({
    front: emptyLegitSlot(), back: emptyLegitSlot(), tag: emptyLegitSlot(),
    opt1: emptyLegitSlot(), opt2: emptyLegitSlot(), opt3: emptyLegitSlot(),
  })
  const legitFileRefs = useRef<Partial<Record<LegitSlotKey, HTMLInputElement | null>>>({})
  const validLegitSlots = [legitSlots.front, legitSlots.back, legitSlots.tag].filter(s => (s.file || s.preview) && s.valid !== false).length

  const isEdit = Boolean(id)

  // Typewriter targets
  const [twName, setTwName] = useState('')
  const [twDesc, setTwDesc] = useState('')
  const twNameEffect = useTypewriter(twName, 20)
  const twDescEffect = useTypewriter(twDesc, 12)

  useEffect(() => {
    if (twNameEffect.displayed) setForm(p => ({ ...p, name: twNameEffect.displayed }))
  }, [twNameEffect.displayed])
  useEffect(() => {
    if (twDescEffect.displayed) setForm(p => ({ ...p, description: twDescEffect.displayed }))
  }, [twDescEffect.displayed])

  const { data } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => adminProductsApi.getById(id ?? ''),
    enabled: isEdit,
  })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list() })
  const { data: colors = [] } = useQuery({ queryKey: ['colors'], queryFn: () => colorsApi.list() })

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name, description: data.description ?? '', price: data.price,
        categoryId: data.categoryId ?? 0, brand: data.brand, gender: data.gender ?? '',
        imageUrls: data.imageUrls ?? [], status: data.status ?? 'ACTIVE',
        style: data.style ?? '', stock: data.stock, sizes: data.sizes ?? [], colorIds: data.colorIds ?? [],
      })
      setSizes((data.sizes ?? []).join(', '))
      setColorIds(data.colorIds ?? [])

      // Load existing images into legitSlots
      if (data.imageUrls && data.imageUrls.length > 0) {
        const slotKeys: LegitSlotKey[] = ['front', 'back', 'tag', 'opt1', 'opt2', 'opt3']
        const updatedSlots = { ...legitSlots }
        data.imageUrls.forEach((url, index) => {
          if (index < 6) {
            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
            updatedSlots[slotKeys[index]] = {
              file: null, // we don't have the File object yet, but we have preview
              preview: fullUrl,
              validating: false,
              valid: true,
              errorMsg: ''
            }
          }
        })
        setLegitSlots(updatedSlots)
        
        // Optionally fetch as File object in background so it can be re-validated or re-uploaded
        // But for Edit, we only need to re-upload if they changed it. If they didn't, we keep the original URL.
        // To handle this, we need to track which slots are new files vs existing URLs.
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const mutation = useMutation({
    mutationFn: (payload: AdminProductPayload) =>
      isEdit ? adminProductsApi.update(id ?? '', payload) : adminProductsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      navigate(PATHS.adminProducts)
    },
    onError: () => toast.error('Lưu sản phẩm thất bại, vui lòng thử lại.'),
  })

  const handleLegitSlotChange = async (slotKey: LegitSlotKey, file: File | null) => {
    if (!file) return
    
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
      setLegitSlots(prev => ({ ...prev, [slotKey]: { file: compressedFile, preview: previewUrl, validating: false, valid: isValid, errorMsg: isValid ? '' : data.message || '' } }))
      if (!isValid) toast.warning(data.message, { autoClose: 5000 })
    } catch {
      setLegitSlots(prev => ({ ...prev, [slotKey]: { file: compressedFile, preview: previewUrl, validating: false, valid: true, errorMsg: '' } }))
    }
  }

  const handleAutoFill = async () => {
    const files = Object.values(legitSlots).map(s => s.file).filter(Boolean) as File[]
    if (files.length === 0) {
      toast.warn('Vui lòng tải ảnh mới từ thiết bị để AI phân tích.')
      return
    }
    setIsAutoFilling(true)
    setAiSuggested({})
    try {
      const fd = new FormData()
      files.slice(0, 3).forEach(f => fd.append('files', f))
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/autofill`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error('AI trả về lỗi')
      const data: AiAutoFillResult = await res.json()
      setAiResult(data)

      if (data.name) setTwName(data.name)
      if (data.description) setTwDesc(data.description)

      setForm(prev => ({
        ...prev,
        brand: data.brand ?? prev.brand,
        style: data.style ?? prev.style,
        gender: data.gender ?? prev.gender,
        price: data.estimatedPrice ? Number(data.estimatedPrice.replace(/\D/g, '')) || prev.price : prev.price,
      }))
      
      let colorDetected = false
      if (data.color) {
        const detectedColorIds = colors
          .filter(c => data.color?.toLowerCase().includes(c.name.toLowerCase()))
          .map(c => c.id)
        if (detectedColorIds.length > 0) {
          setColorIds(prev => Array.from(new Set([...prev, ...detectedColorIds])))
          colorDetected = true
        }
      }

      setAiSuggested({ name: true, description: true, brand: !!data.brand, style: !!data.style, gender: !!data.gender, price: !!data.estimatedPrice, color: colorDetected })
      toast.success('✨ AI đã điền thông tin xong!')
    } catch (e: any) {
      toast.error(e.message || 'AI phân tích thất bại.')
    } finally {
      setIsAutoFilling(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.categoryId) { setFormError('Vui lòng chọn danh mục trước khi lưu.'); return }
    
    const requiredSlots = [legitSlots.front, legitSlots.back, legitSlots.tag]
    if (requiredSlots.some(s => !s.preview)) {
      toast.error('Vui lòng chụp đủ 3 ảnh bắt buộc (mặt trước, sau, mác).')
      return
    }

    setIsUploading(true)
    try {
      // For Edit mode, we mix existing URLs with new File uploads
      const finalImageUrls: string[] = []
      const slotKeys: LegitSlotKey[] = ['front', 'back', 'tag', 'opt1', 'opt2', 'opt3']
      
      // Upload new files
      const filesToUpload = slotKeys.map(k => legitSlots[k].file).filter(Boolean) as File[]
      let newUploadedUrls: string[] = []
      if (filesToUpload.length > 0) {
        newUploadedUrls = await adminProductsApi.uploadImages(filesToUpload)
      }

      // Reconstruct imageUrls array
      let newUrlIdx = 0
      for (const k of slotKeys) {
        const slot = legitSlots[k]
        if (slot.file) {
          finalImageUrls.push(newUploadedUrls[newUrlIdx])
          newUrlIdx++
        } else if (slot.preview) {
          // It's an existing image, we need to extract the original path (relative)
          // The preview is a full URL, e.g., http://localhost:8080/uploads/...
          const urlObj = new URL(slot.preview, window.location.origin)
          finalImageUrls.push(urlObj.pathname)
        }
      }

      mutation.mutate({
        ...form,
        imageUrls: finalImageUrls,
        colorIds,
        sizes: sizes.split(',').map(s => s.trim()).filter(Boolean),
      })
    } catch (err) {
      toast.error('Có lỗi xảy ra khi tải ảnh lên.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>{isEdit ? 'Cập nhật sản phẩm' : 'Đăng bán sản phẩm mới'}</h1>
          <p>Tải ảnh lên và để AI tự động điền thông tin cho bạn.</p>
        </div>
        <div className="admin-form__actions">
          <button type="button" className="admin-secondary" onClick={() => navigate(PATHS.adminProducts)}>Hủy bỏ</button>
          <button type="submit" form="admin-product-form" className="admin-primary" disabled={mutation.isPending || isUploading}>
            {mutation.isPending || isUploading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <form id="admin-product-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* ─── LEFT: Image Upload Panel (Tailwind styled) ─── */}
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
                const isFilled = !!st.preview
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

          {/* ─── RIGHT: Form Panel ─── */}
          <div className="xl:col-span-7 apf-form-panel" style={{ height: 'fit-content' }}>
            <div className="apf-form-panel__header">
              <h3 className="apf-form-panel__title">Thông tin sản phẩm</h3>
              {isAutoFilling && (
                <div className="apf-ai-processing-badge">
                  <Sparkles size={14} /> AI đang điền...
                </div>
              )}
            </div>

            {/* Tên sản phẩm */}
            <div className="apf-field">
              <label>
                Tên sản phẩm
                {aiSuggested.name && <span className="apf-ai-tag">✦ AI Gợi ý</span>}
              </label>
              {isAutoFilling && !twNameEffect.done ? (
                <div className="apf-skeleton" />
              ) : (
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className={aiSuggested.name ? 'ai-filled' : ''}
                  placeholder="Ví dụ: Áo khoác da vintage 90s"
                  required
                />
              )}
            </div>

            <div className="apf-field-row">
              {/* Brand */}
              <div className="apf-field">
                <label>
                  Thương hiệu
                  {aiSuggested.brand && <span className="apf-ai-tag">✦ AI Gợi ý</span>}
                </label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
                  className={aiSuggested.brand ? 'ai-filled' : ''}
                  placeholder="Nike, Zara, Uniqlo..."
                  required
                />
              </div>

              {/* Phong cách */}
              <div className="apf-field">
                <label>
                  Phong cách
                  {aiSuggested.style && <span className="apf-ai-tag">✦ AI Gợi ý</span>}
                </label>
                <input
                  type="text"
                  value={form.style ?? ''}
                  onChange={e => setForm(p => ({ ...p, style: e.target.value }))}
                  className={aiSuggested.style ? 'ai-filled' : ''}
                  placeholder="Streetwear, Minimal, Vintage..."
                />
              </div>
            </div>

            <div className="apf-field-row">
              {/* Giá */}
              <div className="apf-field">
                <label>
                  Giá bán (VNĐ)
                  {aiSuggested.price && <span className="apf-ai-tag">✦ AI Gợi ý</span>}
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                  className={aiSuggested.price ? 'ai-filled' : ''}
                  required
                />
              </div>

              {/* Kho */}
              <div className="apf-field">
                <label>Số lượng kho</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={e => setForm(p => ({ ...p, stock: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <div className="apf-field-row">
              {/* Danh mục */}
              <div className="apf-field">
                <label>Danh mục</label>
                <select
                  value={form.categoryId}
                  onChange={e => { setFormError(''); setForm(p => ({ ...p, categoryId: Number(e.target.value) })) }}
                  required
                >
                  <option value={0} disabled>Chọn danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {formError && <p className="apf-error">{formError}</p>}
              </div>

              {/* Giới tính */}
              <div className="apf-field">
                <label>
                  Giới tính
                  {aiSuggested.gender && <span className="apf-ai-tag">✦ AI Gợi ý</span>}
                </label>
                <select
                  value={form.gender ?? ''}
                  onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                  className={aiSuggested.gender ? 'ai-filled' : ''}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
            </div>

            <div className="apf-field-row">
              {/* Tình trạng */}
              <div className="apf-field">
                <label>Trạng thái đăng bán</label>
                <select value={form.status ?? 'ACTIVE'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="ACTIVE">Đang bán</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                  <option value="DRAFT">Nháp</option>
                </select>
              </div>

              {/* Size */}
              <div className="apf-field">
                <label>Size (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={sizes}
                  onChange={e => setSizes(e.target.value)}
                  placeholder="S, M, L, XL"
                />
              </div>
            </div>

            {/* Mô tả */}
            <div className="apf-field">
              <label>
                Mô tả sản phẩm
                {aiSuggested.description && <span className="apf-ai-tag">✦ AI Gợi ý</span>}
              </label>
              {isAutoFilling && !twDescEffect.done ? (
                <div className="apf-skeleton apf-skeleton--tall" />
              ) : (
                <textarea
                  value={form.description ?? ''}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className={aiSuggested.description ? 'ai-filled' : ''}
                  placeholder="Mô tả chất liệu, tình trạng, đặc điểm nổi bật..."
                />
              )}
            </div>

            {/* Màu sắc */}
            <div className="apf-field">
              <label>Màu sắc {aiSuggested.color && <span className="apf-ai-tag" style={{marginLeft: 8}}>✦ AI Gợi ý</span>}</label>
              <div className="apf-chips">
                {colors.map(color => (
                  <label key={color.id} className={`apf-chip ${colorIds.includes(color.id) ? 'apf-chip--selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={colorIds.includes(color.id)}
                      onChange={() => setColorIds(prev => prev.includes(color.id) ? prev.filter(id => id !== color.id) : [...prev, color.id])}
                    />
                    <span>{color.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* AI condition note */}
            {aiResult.condition && (
              <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, fontSize: 13, color: '#166534', marginBottom: 12 }}>
                <strong>AI nhận định:</strong> Tình trạng: {aiResult.condition}
                {aiResult.material && <> · <strong>Chất liệu:</strong> {aiResult.material}</>}
                {aiResult.color && <> · <strong>Màu sắc:</strong> {aiResult.color}</>}
              </div>
            )}

            {/* Submit */}
            <div className="apf-submit-row">
              <button type="button" className="apf-btn-secondary" onClick={() => navigate(PATHS.adminProducts)}>
                Hủy bỏ
              </button>
              <button type="submit" className="apf-btn-primary" disabled={mutation.isPending || isUploading}>
                {mutation.isPending || isUploading ? 'Đang lưu...' : <><span>Đăng bán ngay</span> <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}
