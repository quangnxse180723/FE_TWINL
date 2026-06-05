import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Shield, AlertTriangle, Bot } from 'lucide-react'
import { PATHS } from '../../routes/paths'
import { API_BASE_URL } from '../../config/constants'
import { toast } from 'react-toastify'
import '../../styles/components/legit-check.css'

interface LegitCheckModalProps {
  isOpen: boolean
  onClose: () => void
  /** Mảng URL ảnh sản phẩm – nếu truyền vào sẽ tự động quét, không cần upload */
  productImageUrls?: string[]
}

const LOADING_TEXTS = [
  'Đang phân tích Logo và Font chữ trên Tag...',
  'Đang so sánh với cơ sở dữ liệu chính hãng...',
  'Đang kiểm tra đường kim mũi chỉ...',
  'Đang đánh giá tỷ lệ thiết kế...',
  'AI đang tổng hợp báo cáo kiểm định...',
]

export default function LegitCheckModal({ isOpen, onClose, productImageUrls }: LegitCheckModalProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0])
  const navigate = useNavigate()

  // Reset khi đóng
  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false)
      setScanProgress(0)
      setLoadingText(LOADING_TEXTS[0])
    }
  }, [isOpen])

  // Auto-scan khi mở với ảnh sản phẩm
  useEffect(() => {
    if (isOpen && productImageUrls && productImageUrls.length > 0) {
      runScan(productImageUrls)
    }
  }, [isOpen])

  const runScan = async (imageUrls: string[]) => {
    setIsScanning(true)
    setScanProgress(0)

    let textIdx = 0
    setLoadingText(LOADING_TEXTS[0])
    const textInterval = setInterval(() => {
      textIdx = (textIdx + 1) % LOADING_TEXTS.length
      setLoadingText(LOADING_TEXTS[textIdx])
    }, 2200)

    const progressInterval = setInterval(() => {
      setScanProgress(prev => prev >= 90 ? 90 : prev + 4)
    }, 400)

    try {
      // Lấy tối đa 3 ảnh từ URL, convert sang File
      const urls = imageUrls.slice(0, 3)
      const files = await Promise.all(
        urls.map(async (url, i) => {
          const res = await fetch(url)
          const blob = await res.blob()
          return new File([blob], `product-image-${i + 1}.jpg`, { type: blob.type || 'image/jpeg' })
        })
      )

      const formData = new FormData()
      files.forEach(file => formData.append('files', file))

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
      const previewImages: Record<string, string> = {}
      urls.forEach((url, i) => { previewImages[`img${i}`] = url })

      setTimeout(() => {
        onClose()
        navigate(PATHS.legitResult, { state: { legitResult: data, previewImages } })
      }, 800)

    } catch (error: any) {
      clearInterval(progressInterval)
      clearInterval(textInterval)
      toast.error(error.message || 'Kiểm định thất bại, vui lòng thử lại.')
      setIsScanning(false)
      setScanProgress(0)
      onClose()
    }
  }

  if (!isOpen) return null

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
            <p className="lc-header__subtitle">AI đang kiểm định ảnh sản phẩm trực tiếp</p>
          </div>
        </div>

        {/* Scanning state */}
        <div className="lc-scanning">
          <div className="lc-scanning__images">
            {(productImageUrls ?? []).slice(0, 3).map((src, i) => (
              <div key={i} className="lc-scanning__img-wrap">
                <img src={src} alt={`Ảnh ${i + 1}`} />
                <div className="lc-scanning__scan-line" />
              </div>
            ))}
          </div>
          <div className="lc-scanning__info">
            <div className="lc-scanning__bot">
              <Bot size={28} />
            </div>
            <h4 className="lc-scanning__title">TWINL AI đang kiểm định...</h4>
            <p className="lc-scanning__text">{loadingText}</p>
            <div className="lc-progress-bar">
              <div className="lc-progress-fill" style={{ width: `${scanProgress}%` }} />
            </div>
            <span className="lc-progress-pct">{scanProgress}%</span>
          </div>

          <div className="lc-notice" style={{ marginTop: 20 }}>
            <AlertTriangle size={14} />
            <span>Kết quả AI chỉ mang tính tham khảo. Không thể thay thế kiểm định vật lý chuyên nghiệp.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
