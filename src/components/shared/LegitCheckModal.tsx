import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, Shield, AlertTriangle, Bot, Camera, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react'
import { PATHS } from '../../routes/paths'
import { API_BASE_URL } from '../../config/constants'
import { toast } from 'react-toastify'
import '../../styles/components/legit-check.css'

interface LegitCheckModalProps {
  isOpen: boolean
  onClose: () => void
  /** Nếu truyền productImageUrls sẽ bypass bước upload và scan thẳng (dùng từ ProductDetailPage) */
  productImageUrls?: string[]
}

// ── Định nghĩa 6 slot upload ──────────────────────────────────────
type SlotKey = 'front' | 'back' | 'tag' | 'opt1' | 'opt2' | 'opt3'

const SLOTS: { key: SlotKey; icon: string; title: string; hint: string; required: boolean }[] = [
  { key: 'front', icon: '👕', title: 'Mặt trước', hint: 'Bắt buộc', required: true },
  { key: 'back',  icon: '👕', title: 'Mặt sau', hint: 'Bắt buộc', required: true },
  { key: 'tag',   icon: '🏷️', title: 'Mác/Logo/Size', hint: 'Bắt buộc', required: true },
  { key: 'opt1',  icon: '📷', title: 'Ảnh phụ 1', hint: 'Tùy chọn', required: false },
  { key: 'opt2',  icon: '📷', title: 'Ảnh phụ 2', hint: 'Tùy chọn', required: false },
  { key: 'opt3',  icon: '📷', title: 'Ảnh phụ 3', hint: 'Tùy chọn', required: false },
]

const LOADING_TEXTS = [
  'Đang phân tích Logo và Font chữ trên Tag...',
  'Đang so sánh với cơ sở dữ liệu chính hãng...',
  'Đang kiểm tra đường kim mũi chỉ...',
  'Đang đánh giá tỷ lệ thiết kế...',
  'AI đang tổng hợp báo cáo kiểm định...',
]

type SlotState = {
  file: File | null
  preview: string | null   // object URL
  validating: boolean
  valid: boolean | null    // null = chưa kiểm tra
  errorMsg: string
}

const emptySlot = (): SlotState => ({
  file: null,
  preview: null,
  validating: false,
  valid: null,
  errorMsg: '',
})

export default function LegitCheckModal({ isOpen, onClose, productImageUrls }: LegitCheckModalProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // Step: 'upload' | 'scanning'
  const [step, setStep] = useState<'upload' | 'scanning'>('upload')
  const [slots, setSlots] = useState<Record<SlotKey, SlotState>>({
    front: emptySlot(), back: emptySlot(), tag: emptySlot(),
    opt1: emptySlot(), opt2: emptySlot(), opt3: emptySlot(),
  })
  const [scanProgress, setScanProgress] = useState(0)
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0])

  // Refs cho input[type=file]
  const fileInputRefs = useRef<Partial<Record<SlotKey, HTMLInputElement | null>>>({})

  // Reset khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setStep('upload')
      setSlots({ front: emptySlot(), back: emptySlot(), tag: emptySlot(), opt1: emptySlot(), opt2: emptySlot(), opt3: emptySlot() })
      setScanProgress(0)
    }
  }, [isOpen])

  // Auto-scan nếu được truyền ảnh từ ProductDetailPage
  useEffect(() => {
    if (isOpen && productImageUrls && productImageUrls.length > 0) {
      runScanFromUrls(productImageUrls)
    }
  }, [isOpen])

  // ── Validate một slot ngay sau khi user chọn ảnh ──────────────
  const handleFileChange = async (slotKey: SlotKey, file: File | null) => {
    if (!file) return

    const previewUrl = URL.createObjectURL(file)

    // Bắt đầu validate
    setSlots(prev => ({
      ...prev,
      [slotKey]: { file, preview: previewUrl, validating: true, valid: null, errorMsg: '' },
    }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('slotType', slotKey)

      const res = await fetch(`${API_BASE_URL}/api/v1/ai/validate-slot`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Validate lỗi')

      const data = await res.json()
      const isValid: boolean = data.valid === true
      const msg: string = data.message || ''

      setSlots(prev => ({
        ...prev,
        [slotKey]: { file, preview: previewUrl, validating: false, valid: isValid, errorMsg: isValid ? '' : msg },
      }))

      if (!isValid) {
        toast.warning(msg, { autoClose: 5000 })
      }
    } catch {
      // Nếu AI không khả dụng → vẫn cho upload
      setSlots(prev => ({
        ...prev,
        [slotKey]: { file, preview: previewUrl, validating: false, valid: true, errorMsg: '' },
      }))
    }
  }

  // ── Số slot đã upload hợp lệ ──────────────────────────────────
  const validRequiredSlotCount = [slots.front, slots.back, slots.tag].filter(s => s.file && s.valid !== false).length
  const totalValidSlotCount = Object.values(slots).filter(s => s.file && s.valid !== false).length

  // ── Bắt đầu kiểm định thật từ các file đã chọn ──────────────
  const handleStartScan = async () => {
    const files = SLOTS.map(s => slots[s.key].file).filter(Boolean) as File[]
    if (files.length < 1) return
    setStep('scanning')
    await runScanWithFiles(files)
  }

  const runScanWithFiles = async (files: File[]) => {
    setScanProgress(0)
    setLoadingText(LOADING_TEXTS[0])

    let textIdx = 0
    const textInterval = setInterval(() => {
      textIdx = (textIdx + 1) % LOADING_TEXTS.length
      setLoadingText(LOADING_TEXTS[textIdx])
    }, 2200)
    const progressInterval = setInterval(() => {
      setScanProgress(prev => (prev >= 90 ? 90 : prev + 4))
    }, 400)

    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))

      const response = await fetch(`${API_BASE_URL}/api/v1/ai/legit-check`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      clearInterval(textInterval)
      setScanProgress(100)

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.message || 'Lỗi kiểm định')
      }

      const data = await response.json()

      // Build preview map
      const previewImages: Record<string, string> = {}
      SLOTS.forEach(s => {
        if (slots[s.key].preview) previewImages[s.key] = slots[s.key].preview!
      })

      setTimeout(() => {
        onClose()
        navigate(PATHS.legitResult, { state: { legitResult: data, previewImages, returnUrl: location.pathname } })
      }, 800)

    } catch (error: any) {
      clearInterval(progressInterval)
      clearInterval(textInterval)
      toast.error(error.message || 'Kiểm định thất bại, vui lòng thử lại.')
      setStep('upload')
      setScanProgress(0)
    }
  }

  // ── Scan từ URL (auto-scan mode từ ProductDetailPage) ─────────
  const runScanFromUrls = async (imageUrls: string[]) => {
    setStep('scanning')
    setScanProgress(0)
    setLoadingText(LOADING_TEXTS[0])

    let textIdx = 0
    const textInterval = setInterval(() => {
      textIdx = (textIdx + 1) % LOADING_TEXTS.length
      setLoadingText(LOADING_TEXTS[textIdx])
    }, 2200)
    const progressInterval = setInterval(() => {
      setScanProgress(prev => (prev >= 90 ? 90 : prev + 4))
    }, 400)

    try {
      const urls = imageUrls.slice(0, 4)
      const files = await Promise.all(
        urls.map(async (url, i) => {
          const res = await fetch(url)
          const blob = await res.blob()
          return new File([blob], `product-${i + 1}.jpg`, { type: blob.type || 'image/jpeg' })
        })
      )

      const formData = new FormData()
      files.forEach(f => formData.append('files', f))

      const response = await fetch(`${API_BASE_URL}/api/v1/ai/legit-check`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      clearInterval(textInterval)
      setScanProgress(100)

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.message || 'Lỗi kiểm định')
      }

      const data = await response.json()
      const previewImagesMap: Record<string, string> = {}
      urls.forEach((url, i) => { previewImagesMap[`img${i}`] = url })

      setTimeout(() => {
        onClose()
        navigate(PATHS.legitResult, { state: { legitResult: data, previewImages: previewImagesMap, returnUrl: location.pathname } })
      }, 800)
    } catch (error: any) {
      clearInterval(progressInterval)
      clearInterval(textInterval)
      toast.error(error.message || 'Kiểm định thất bại.')
      setStep('upload')
      onClose()
    }
  }

  if (!isOpen) return null

  const isAutoScanMode = productImageUrls && productImageUrls.length > 0

  return (
    <div className="lc-overlay" onClick={onClose}>
      <div className="lc-modal" onClick={e => e.stopPropagation()}>
        <button className="lc-close" onClick={onClose}><X size={20} /></button>

        {/* Header */}
        <div className="lc-header">
          <div className="lc-header__icon">
            <Shield size={28} />
          </div>
          <div>
            <h2 className="lc-header__title">TWINL Legit Check</h2>
            <p className="lc-header__subtitle">
              {step === 'upload'
                ? 'Tải ảnh theo từng ô để AI kiểm định chính xác nhất'
                : 'AI đang phân tích hình ảnh sản phẩm...'}
            </p>
          </div>
        </div>

        {/* ── STEP 1: UPLOAD SLOTS ────────────────────────────────── */}
        {step === 'upload' && !isAutoScanMode && (
          <>
            <div className="lc-notice">
              <AlertTriangle size={14} />
              <span>
                Chụp rõ nét từng ô theo hướng dẫn. AI sẽ kiểm tra từng ảnh ngay khi bạn chọn.
              </span>
            </div>

            <div className="lc-slots">
              {SLOTS.map((slot, idx) => {
                const state = slots[slot.key]
                const isFilled = !!state.file
                const isValidating = state.validating
                const isValid = state.valid
                const isInvalid = state.valid === false

                return (
                  <div
                    key={slot.key}
                    className={`lc-slot ${isFilled ? 'lc-slot--filled' : ''} ${isInvalid ? 'lc-slot--invalid' : ''}`}
                  >
                    {/* Hidden file input */}
                    <input
                      ref={el => { fileInputRefs.current[slot.key] = el }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="lc-slot__input"
                      onChange={e => {
                        const f = e.target.files?.[0] ?? null
                        handleFileChange(slot.key, f)
                        // Reset input để có thể chọn lại cùng file
                        e.target.value = ''
                      }}
                    />

                    {/* Clickable preview area */}
                    <div
                      className="lc-slot__preview"
                      onClick={() => fileInputRefs.current[slot.key]?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && fileInputRefs.current[slot.key]?.click()}
                    >
                      {state.preview ? (
                        <>
                          <img src={state.preview} alt={slot.title} />

                          {/* Validating spinner overlay */}
                          {isValidating && (
                            <div className="lc-slot__validating">
                              <Loader2 size={22} className="lc-spin" />
                              <span>AI đang kiểm tra...</span>
                            </div>
                          )}

                          {/* Valid tick */}
                          {isValid && !isValidating && (
                            <div className="lc-slot__valid-badge">
                              <CheckCircle2 size={18} />
                            </div>
                          )}

                          {/* Invalid badge */}
                          {isInvalid && !isValidating && (
                            <div className="lc-slot__invalid-badge">
                              <AlertTriangle size={16} />
                            </div>
                          )}

                          {/* Hover overlay: click to re-upload */}
                          <div className="lc-slot__overlay">
                            <RotateCcw size={16} />
                            <span>Chụp lại</span>
                          </div>
                        </>
                      ) : (
                        <div className="lc-slot__empty">
                          <span className="lc-slot__empty-icon" style={{ fontSize: 28 }}>{slot.icon}</span>
                          <Camera size={16} className="lc-slot__camera" />
                        </div>
                      )}
                    </div>

                    {/* Label + status */}
                    <div className={`lc-slot__label ${isInvalid ? 'lc-slot__label--error' : ''}`}>
                      <span className="lc-slot__num">{idx + 1}</span>
                      <span>{slot.title}</span>
                      {isValid && !isValidating && (
                        <CheckCircle2 size={12} className="lc-slot__check" />
                      )}
                    </div>

                    {/* Error hint */}
                    {isInvalid && (
                      <p className="lc-slot__error-hint">{state.errorMsg}</p>
                    )}

                    {/* Slot hint */}
                    {!isFilled && (
                      <p className="lc-slot__hint">{slot.hint}</p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Progress indicator */}
            <div className="lc-upload-progress">
              <div className="lc-upload-progress__bar">
                <div
                  className="lc-upload-progress__fill"
                  style={{ width: `${(validRequiredSlotCount / 3) * 100}%` }}
                />
              </div>
              <span className="lc-upload-progress__text">
                {validRequiredSlotCount}/3 ảnh bắt buộc
                {validRequiredSlotCount >= 3 ? ' – Sẵn sàng kiểm định!' : ' – Cần tối thiểu 3 ảnh'}
              </span>
            </div>

            <button
              className="lc-btn"
              onClick={handleStartScan}
              disabled={validRequiredSlotCount < 3}
            >
              <Shield size={18} />
              {validRequiredSlotCount < 3
                ? `Cần thêm ${3 - validRequiredSlotCount} ảnh nữa`
                : `Bắt đầu Legit Check (${totalValidSlotCount} ảnh)`}
            </button>
          </>
        )}

        {/* ── STEP 2: SCANNING ───────────────────────────────────────── */}
        {(step === 'scanning' || isAutoScanMode) && (
          <div className="lc-scanning">
            {/* Show slot previews or product images */}
            <div className="lc-scanning__images">
              {isAutoScanMode
                ? (productImageUrls ?? []).slice(0, 4).map((src, i) => (
                    <div key={i} className="lc-scanning__img-wrap">
                      <img src={src} alt={`Ảnh ${i + 1}`} />
                      <div className="lc-scanning__scan-line" />
                    </div>
                  ))
                : SLOTS.filter(s => slots[s.key].preview).slice(0, 4).map(s => (
                    <div key={s.key} className="lc-scanning__img-wrap">
                      <img src={slots[s.key].preview!} alt={s.title} />
                      <div className="lc-scanning__scan-line" />
                    </div>
                  ))
              }
            </div>

            <div className="lc-scanning__info">
              <div className="lc-scanning__bot">
                <Bot size={28} />
              </div>
              <h4 className="lc-scanning__title">TWINL AI đang kiểm định...</h4>
              <p className="lc-scanning__text" key={loadingText}>{loadingText}</p>
              <div className="lc-progress-bar">
                <div className="lc-progress-fill" style={{ width: `${scanProgress}%` }} />
              </div>
              <span className="lc-progress-pct" translate="no">{scanProgress}%</span>
            </div>

            <div className="lc-notice" style={{ marginTop: 20 }}>
              <AlertTriangle size={14} />
              <span>Kết quả AI chỉ mang tính tham khảo. Không thể thay thế kiểm định vật lý chuyên nghiệp.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
