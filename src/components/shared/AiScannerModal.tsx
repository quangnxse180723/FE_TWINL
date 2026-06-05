import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, UploadCloud, Bot, CheckCircle2, Search, Settings } from 'lucide-react'
import { PATHS } from '../../routes/paths'
import { API_BASE_URL } from '../../config/constants'
import { toast } from 'react-toastify'
import '../../styles/components/ai-scanner.css'

interface AiScannerModalProps {
  isOpen: boolean
  onClose: () => void
  directScanImageUrl?: string
}

export default function AiScannerModal({ isOpen, onClose, directScanImageUrl }: AiScannerModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('AI của TWINL đang phân tích chất liệu và thương hiệu...')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null)
      setIsScanning(false)
      setScanProgress(0)
    } else if (directScanImageUrl) {
      // Bắt đầu scan trực tiếp
      const initiateDirectScan = async () => {
        setSelectedImage(directScanImageUrl)
        setIsScanning(true)
        try {
          const res = await fetch(directScanImageUrl)
          const blob = await res.blob()
          const file = new File([blob], 'direct-image.jpg', { type: blob.type })
          await scanFile(file, directScanImageUrl)
        } catch (error) {
          toast.error('Không thể tải ảnh trực tiếp để quét.')
          setIsScanning(false)
        }
      }
      initiateDirectScan()
    }
  }, [isOpen, directScanImageUrl])

  useEffect(() => {
    if (isScanning) {
      const texts = [
        'AI của TWINL đang phân tích chất liệu và thương hiệu...',
        'Đang quét cấu trúc bề mặt vải...',
        'Đang trích xuất dữ liệu kiểu dáng thập niên...',
        'Đang xác thực tình trạng sản phẩm...',
      ]
      let idx = 0
      const interval = setInterval(() => {
        idx = (idx + 1) % texts.length
        setLoadingText(texts[idx])
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isScanning])

  const scanFile = async (file: File, imageUrlPreview: string) => {
    // Simulate progress bar
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) return 95
        return prev + 5
      })
    }, 300)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`${API_BASE_URL}/api/v1/ai/scan`, {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setScanProgress(100)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'API phân tích bị lỗi')
      }

      const data = await response.json()
      
      setTimeout(() => {
        onClose()
        navigate(PATHS.aiResult, { state: { aiResult: data, imagePreview: imageUrlPreview } })
      }, 1000)

    } catch (error: any) {
      clearInterval(progressInterval)
      toast.error(error.message || 'Quét ảnh thất bại, vui lòng thử lại sau.')
      setIsScanning(false)
      setSelectedImage(null)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const imageUrl = URL.createObjectURL(file)
      setSelectedImage(imageUrl)
      setIsScanning(true)
      await scanFile(file, imageUrl)
    }
  }

  if (!isOpen) return null

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-content" onClick={e => e.stopPropagation()}>
        <button className="ai-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {!isScanning && !selectedImage && (
          <div className="ai-upload-state">
            <h3 style={{ marginTop: 24, fontSize: 18, color: '#64748b' }}>Đang nạp ảnh vào hệ thống...</h3>
          </div>
        )}

        {isScanning && selectedImage && (
          <div className="ai-scanning-state">
            <div className="ai-scanning-image">
              <img src={selectedImage} alt="Scanning" />
              <div className="scanning-line"></div>
              <div className="scanning-markers"></div>
            </div>
            <div className="ai-scanning-info">
              <div className="ai-scanning-logo">
                <div className="icon-box">
                  <Bot size={28} />
                </div>
                <h4>TWINL AI</h4>
              </div>
              
              <div className="ai-scanning-text">
                {loadingText}
              </div>

              <div className="ai-scanning-steps">
                <div className={`ai-step ${scanProgress > 30 ? 'completed' : 'active'}`}>
                  <div className="ai-step-icon">
                    {scanProgress > 30 ? <CheckCircle2 size={16} /> : <Search size={16} />}
                  </div>
                  <span>Quét bề mặt da & chất liệu</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600 }}>
                    {scanProgress > 30 ? 'Hoàn tất' : 'Đang xử lý'}
                  </span>
                </div>
                
                <div className={`ai-step ${scanProgress > 70 ? 'completed' : (scanProgress > 30 ? 'active' : '')}`}>
                  <div className="ai-step-icon">
                    {scanProgress > 70 ? <CheckCircle2 size={16} /> : <Settings size={16} />}
                  </div>
                  <span>Nhận dạng kiểu dáng</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600 }}>
                    {scanProgress > 70 ? 'Hoàn tất' : (scanProgress > 30 ? 'Đang xử lý' : 'Chờ...')}
                  </span>
                </div>
              </div>

              <div className="ai-progress-bar">
                <div className="ai-progress-fill" style={{ width: `${scanProgress}%` }}></div>
              </div>
              <div className="ai-progress-text">{scanProgress}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
