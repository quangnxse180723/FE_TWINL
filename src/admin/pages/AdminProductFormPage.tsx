import { useEffect, useRef, useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { adminProductsApi } from '../api/adminProductsApi'
import { categoriesApi } from '../../api/categories/categoriesApi'
import { colorsApi } from '../../api/colors/colorsApi'
import { PATHS } from '../../routes/paths'
import type { AdminProductPayload } from '../types'
import { API_BASE_URL } from '../../config/constants'
import { toast } from 'react-toastify'
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, Clock, Upload, ArrowRight } from 'lucide-react'
import '../../styles/pages/adminProductForm.css'

const emptyForm: AdminProductPayload = {
  name: '', description: '', price: 0, categoryId: 0,
  brand: '', gender: '', imageUrls: [], status: 'ACTIVE',
  style: '', stock: 0, sizes: [], colorIds: [],
}

interface ImageSlot {
  file: File
  previewUrl: string
  uploadedUrl?: string
  qualityStatus?: 'checking' | 'PASS' | 'WARN' | 'FAIL'
  qualityLabel?: string
}

interface AiAutoFillResult {
  name?: string; brand?: string; style?: string; gender?: string
  description?: string; estimatedPrice?: string; material?: string; condition?: string
  color?: string;
}

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
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [aiSuggested, setAiSuggested] = useState<Record<string, boolean>>({})
  const [aiResult, setAiResult] = useState<AiAutoFillResult>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    }
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

  const checkImageQuality = useCallback(async (slot: ImageSlot): Promise<Partial<ImageSlot>> => {
    const fd = new FormData()
    fd.append('file', slot.file)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/image-quality`, { method: 'POST', body: fd })
      if (!res.ok) return { qualityStatus: 'WARN', qualityLabel: 'Không thể kiểm tra' }
      const data = await res.json()
      const statusMap: Record<string, ImageSlot['qualityStatus']> = { PASS: 'PASS', WARN: 'WARN', FAIL: 'FAIL' }
      return {
        qualityStatus: statusMap[data.status] ?? 'WARN',
        qualityLabel: data.status === 'PASS' ? 'Đạt chuẩn' : data.status === 'WARN' ? 'Chấp nhận được' : 'Chất lượng kém',
      }
    } catch {
      return { qualityStatus: 'WARN', qualityLabel: 'Không thể kiểm tra' }
    }
  }, [])

  const handleFilesSelected = async (files: File[]) => {
    if (!files.length) return
    const totalAfter = imageSlots.length + files.length
    if (totalAfter > 6) {
      toast.warn('Tối đa 6 ảnh. Vui lòng xóa bớt ảnh trước.')
      return
    }

    const newSlots: ImageSlot[] = files.map(f => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
      qualityStatus: 'checking',
    }))
    setImageSlots(prev => [...prev, ...newSlots])
    setIsUploading(true)

    try {
      // Upload images to server
      const uploadedUrls = await adminProductsApi.uploadImages(files)
      // Check quality for each image concurrently
      const qualityResults = await Promise.all(newSlots.map(s => checkImageQuality(s)))

      setImageSlots(prev => {
        const updated = [...prev]
        const startIdx = updated.length - newSlots.length
        uploadedUrls.forEach((url, i) => {
          updated[startIdx + i] = { ...updated[startIdx + i], uploadedUrl: url, ...qualityResults[i] }
        })
        return updated
      })
      setForm(prev => ({ ...prev, imageUrls: [...(prev.imageUrls ?? []), ...uploadedUrls] }))
    } catch {
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại.')
      setImageSlots(prev => prev.slice(0, prev.length - newSlots.length))
    } finally {
      setIsUploading(false)
    }
  }

  const handleAutoFill = async () => {
    if (imageSlots.length === 0) {
      toast.warn('Vui lòng tải ít nhất 1 ảnh sản phẩm trước.')
      return
    }
    setIsAutoFilling(true)
    setAiSuggested({})
    try {
      const fd = new FormData()
      imageSlots.slice(0, 3).forEach(s => fd.append('files', s.file))
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/autofill`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error('AI trả về lỗi')
      const data: AiAutoFillResult = await res.json()
      setAiResult(data)

      // Typewriter for name and description
      if (data.name) setTwName(data.name)
      if (data.description) setTwDesc(data.description)

      // Instant fill for other fields
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.categoryId) { setFormError('Vui lòng chọn danh mục trước khi lưu.'); return }
    const uploadedUrls = imageSlots.filter(s => s.uploadedUrl).map(s => s.uploadedUrl!)
    if (uploadedUrls.length < 3) { toast.error('Vui lòng tải từ 3 đến 6 ảnh sản phẩm.'); return }
    mutation.mutate({
      ...form,
      imageUrls: uploadedUrls,
      colorIds,
      sizes: sizes.split(',').map(s => s.trim()).filter(Boolean),
    })
  }

  const removeSlot = (idx: number) => {
    const removed = imageSlots[idx]
    setImageSlots(prev => prev.filter((_, i) => i !== idx))
    if (removed.uploadedUrl) {
      setForm(prev => ({ ...prev, imageUrls: prev.imageUrls?.filter(u => u !== removed.uploadedUrl) }))
    }
  }

  const badgeIcon = (status?: ImageSlot['qualityStatus']) => {
    if (status === 'checking') return <Clock size={11} />
    if (status === 'PASS') return <CheckCircle2 size={11} />
    if (status === 'WARN') return <AlertTriangle size={11} />
    return <XCircle size={11} />
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
          <button type="submit" form="admin-product-form" className="admin-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <form id="admin-product-form" onSubmit={handleSubmit}>
        <div className="apf-layout">
          {/* ─── LEFT: Image Upload Panel ─── */}
          <div className="apf-upload-panel">
            <p className="apf-upload-panel__title">📸 Ảnh sản phẩm (3–6 ảnh)</p>

            {/* Dropzone */}
            {imageSlots.length < 6 && (
              <div className={`apf-dropzone ${isUploading ? 'apf-dropzone--active' : ''}`}>
                <input
                  ref={fileInputRef}
                  type="file" accept="image/*" multiple
                  onChange={e => { const files = Array.from(e.target.files ?? []); if (files.length) handleFilesSelected(files); e.target.value = '' }}
                  disabled={isUploading}
                />
                <span className="apf-dropzone__icon">☁️</span>
                <p className="apf-dropzone__label">{isUploading ? 'Đang tải lên...' : 'Kéo & thả ảnh vào đây'}</p>
                <p className="apf-dropzone__hint">JPG, PNG, WEBP – tối đa 10MB mỗi ảnh</p>
                <span className="apf-dropzone__btn">
                  <Upload size={14} style={{ display: 'inline', marginRight: 6 }} />
                  Chọn ảnh
                </span>
              </div>
            )}

            {/* Image grid with quality badges */}
            {imageSlots.length > 0 && (
              <div className="apf-upload-grid">
                {imageSlots.map((slot, idx) => (
                  <div key={idx} className="apf-upload-thumb">
                    <img src={slot.previewUrl} alt={`Ảnh ${idx + 1}`} />
                    {slot.qualityStatus && (
                      <span className={`apf-upload-thumb__badge apf-badge--${slot.qualityStatus === 'checking' ? 'checking' : slot.qualityStatus.toLowerCase()}`}>
                        {badgeIcon(slot.qualityStatus)}
                        {slot.qualityStatus === 'checking' ? 'Đang kiểm tra...' : slot.qualityLabel}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSlot(idx)}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 20, height: 20, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >
                      <XCircle size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Checklist guide */}
            <div className="apf-checklist">
              <p className="apf-checklist__title">
                <span>🛡️</span> Yêu cầu ảnh chất lượng cao
              </p>
              {[
                { text: 'Ánh sáng đủ, tự nhiên', ok: true },
                { text: 'Ảnh nét, không bị mờ rung', ok: true },
                { text: 'Sản phẩm chiếm phần lớn khung hình', ok: true },
                { text: 'Không ảnh mờ hoặc độ phân giải thấp', ok: false },
              ].map((item, i) => (
                <div key={i} className="apf-checklist__item">
                  <span className={item.ok ? 'apf-checklist__icon--ok' : 'apf-checklist__icon--fail'}>
                    {item.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  </span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* AI Auto-fill button */}
            <button
              type="button"
              className="apf-autofill-btn"
              onClick={handleAutoFill}
              disabled={isAutoFilling || imageSlots.length === 0 || isUploading}
            >
              <Sparkles size={18} className="apf-sparkle" />
              {isAutoFilling ? 'AI đang phân tích ảnh...' : 'Nhờ AI điền thông tin tự động'}
            </button>
          </div>

          {/* ─── RIGHT: Form Panel ─── */}
          <div className="apf-form-panel">
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
              <button type="submit" className="apf-btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Đang lưu...' : <><span>Đăng bán ngay</span> <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}
