import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, Bot, CheckCircle2, Search, Settings } from 'lucide-react'
import { PATHS } from '../../routes/paths'
import { API_BASE_URL } from '../../config/constants'
import { toast } from 'react-toastify'
import '../../styles/components/ai-scanner.css'

interface AiScannerModalProps {
  isOpen: boolean
  onClose: () => void
  directScanImageUrls?: string[]
}

export default function AiScannerModal({ isOpen, onClose, directScanImageUrls }: AiScannerModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('AI cá»§a TWINL Ä‘ang phÃ¢n tÃ­ch cháº¥t liá»‡u vÃ  thÆ°Æ¡ng hiá»‡u...')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null)
      setIsScanning(false)
      setScanProgress(0)
    } else if (directScanImageUrls && directScanImageUrls.length > 0) {
      // Báº¯t Ä‘áº§u scan trá»±c tiáº¿p
      const initiateDirectScan = async () => {
        setSelectedImage(directScanImageUrls[0])
        setIsScanning(true)
        try {
          const filesToScan: File[] = []
          for (let i = 0; i < Math.min(directScanImageUrls.length, 6); i++) {
            const url = directScanImageUrls[i]
            const res = await fetch(url)
            const blob = await res.blob()
            filesToScan.push(new File([blob], `direct-image-${i}.jpg`, { type: blob.type }))
          }
          await scanFiles(filesToScan, directScanImageUrls[0])
        } catch (error) {
          toast.error('KhÃ´ng thá»ƒ táº£i áº£nh trá»±c tiáº¿p Ä‘á»ƒ quÃ©t.')
          setIsScanning(false)
        }
      }
      initiateDirectScan()
    }
  }, [isOpen, directScanImageUrls])

  useEffect(() => {
    if (isScanning && directScanImageUrls && directScanImageUrls.length > 1) {
      let imgIdx = 0
      const imgInterval = setInterval(() => {
        imgIdx = (imgIdx + 1) % directScanImageUrls.length
        setSelectedImage(directScanImageUrls[imgIdx])
      }, 1000)
      return () => clearInterval(imgInterval)
    }
  }, [isScanning, directScanImageUrls])

  useEffect(() => {
    if (isScanning) {
      const texts = [
        'AI cá»§a TWINL Ä‘ang phÃ¢n tÃ­ch toÃ n bá»™ gÃ³c Ä‘á»™ sáº£n pháº©m...',
        'Äang quÃ©t cáº¥u trÃºc bá» máº·t váº£i...',
        'Äang Ä‘á»‘i chiáº¿u hÃ¬nh áº£nh máº·t trÆ°á»›c vÃ  sau...',
        'Äang xÃ¡c thá»±c chi tiáº¿t mÃ¡c vÃ  logo...',
      ]
      let idx = 0
      const interval = setInterval(() => {
        idx = (idx + 1) % texts.length
        setLoadingText(texts[idx])
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isScanning])

  const scanFiles = async (files: File[], imageUrlPreview: string) => {
    // Simulate progress bar
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) return 95
        return prev + 5
      })
    }, 300)

    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      
      const response = await fetch(`${API_BASE_URL}/api/v1/ai/scan`, {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setScanProgress(100)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'API phÃ¢n tÃ­ch bá»‹ lá»—i')
      }

      const data = await response.json()
      
      setTimeout(() => {
        onClose()
        navigate(PATHS.aiResult, { state: { aiResult: data, imagePreview: imageUrlPreview, returnUrl: location.pathname } })
      }, 1000)

    } catch (error: any) {
      clearInterval(progressInterval)
      toast.error(error.message || 'QuÃ©t áº£nh tháº¥t báº¡i, vui lÃ²ng thá»­ láº¡i sau.')
      setIsScanning(false)
      setSelectedImage(null)
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
            <h3 style={{ marginTop: 24, fontSize: 18, color: '#64748b' }}>Äang náº¡p áº£nh vÃ o há»‡ thá»‘ng...</h3>
          </div>
        )}

        {isScanning && selectedImage && (
          <div className="ai-scanning-state">
            <div className="ai-scanning-image">
              <img src={selectedImage} alt="Scanning" style={{ transition: 'opacity 0.3s ease-in-out' }} />
              <div className="scanning-line"></div>
              <div className="scanning-markers"></div>
              {directScanImageUrls && directScanImageUrls.length > 1 && (
                <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, zIndex: 10 }}>
                  Äang quÃ©t {directScanImageUrls.length} áº£nh
                </div>
              )}
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
                  <span>QuÃ©t bá» máº·t da & cháº¥t liá»‡u</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600 }}>
                    {scanProgress > 30 ? 'HoÃ n táº¥t' : 'Äang xá»­ lÃ½'}
                  </span>
                </div>
                
                <div className={`ai-step ${scanProgress > 70 ? 'completed' : (scanProgress > 30 ? 'active' : '')}`}>
                  <div className="ai-step-icon">
                    {scanProgress > 70 ? <CheckCircle2 size={16} /> : <Settings size={16} />}
                  </div>
                  <span>Nháº­n dáº¡ng kiá»ƒu dÃ¡ng</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600 }}>
                    {scanProgress > 70 ? 'HoÃ n táº¥t' : (scanProgress > 30 ? 'Äang xá»­ lÃ½' : 'Chá»...')}
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