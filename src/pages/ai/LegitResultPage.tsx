import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ShieldAlert, CheckCircle2, ShoppingBag, AlertTriangle, HelpCircle, Info } from 'lucide-react'
import { PATHS } from '../../routes/paths'
import '../../styles/pages/legit-result.css'

interface LegitCheckResult {
  brand: string
  riskLevel: 'LOW' | 'HIGH' | 'UNCERTAIN'
  redFlags: string[]
  advice: string
  rawData?: string
}

const RISK_CONFIG = {
  LOW: {
    label: 'Không phát hiện rủi ro',
    sublabel: 'Sản phẩm có khả năng cao là chính hãng.',
    alertClass: 'legit-result__alert--low',
    Icon: CheckCircle2,
  },
  HIGH: {
    label: 'Phát hiện Rủi ro Cao',
    sublabel: 'Nhiều điểm sai lệch đã được tìm thấy. Vui lòng cẩn trọng.',
    alertClass: 'legit-result__alert--high',
    Icon: AlertTriangle,
  },
  UNCERTAIN: {
    label: 'Không đủ dữ liệu',
    sublabel: 'Cần thêm hình ảnh hoặc góc chụp rõ hơn để phân tích chính xác.',
    alertClass: 'legit-result__alert--uncertain',
    Icon: HelpCircle,
  },
}

export default function LegitResultPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result: LegitCheckResult = state?.legitResult
  const previewImagesObj: Record<string, string> = state?.previewImages || {}
  const previewImages = Object.values(previewImagesObj).filter(Boolean) as string[]
  const returnUrl = state?.returnUrl as string
  
  const [activeImage, setActiveImage] = useState(previewImages[0] || '')

  useEffect(() => {
    if (previewImages && previewImages.length > 0 && !activeImage) {
      setActiveImage(previewImages[0])
    }
  }, [previewImages, activeImage])

  if (!result) {
    return (
      <div className="legit-result-empty">
        <HelpCircle size={60} />
        <p>Không có kết quả kiểm định nào.</p>
        <button onClick={() => navigate(PATHS.home)}>Về trang chủ</button>
      </div>
    )
  }

  const cfg = RISK_CONFIG[result.riskLevel] || RISK_CONFIG.UNCERTAIN

  // Mock data for the right table (since it's not in the LegitCheckResult interface)
  // In a real scenario, this would come from the API response
  const brandValue = result.brand || 'Không thương hiệu'
  const materialValue = 'Vải Cotton'
  const styleValue = 'Áo mặc thường'
  const matchValue = result.riskLevel === 'HIGH' ? 'Thấp' : (result.riskLevel === 'LOW' ? 'Cao' : 'Trung bình')

  return (
    <div className="legit-result">
      <div className="legit-result__container">
        
        <h1 className="legit-result__title">Kết quả Đối soát</h1>

        <div className={`legit-result__alert ${cfg.alertClass}`}>
          <cfg.Icon size={24} className="legit-result__alert-icon" />
          <div className="legit-result__alert-content">
            <h4>{cfg.label}</h4>
            <p>{cfg.sublabel}</p>
          </div>
        </div>

        {/* Gallery */}
        <div className="legit-result__gallery">
          <div className="legit-result__thumbs">
            {previewImages.map((src, idx) => (
              <button 
                key={idx}
                type="button"
                className={`legit-result__thumb ${activeImage === src ? 'is-active' : ''}`}
                onClick={() => setActiveImage(src)}
              >
                <img src={src} alt={`Preview ${idx + 1}`} />
              </button>
            ))}
          </div>
          <div className="legit-result__main-image">
            {activeImage && <img src={activeImage} alt="Main view" />}
          </div>
        </div>

        <div className="legit-result__content-grid">
          
          <div className="legit-result__left">
            <h2 className="legit-result__section-title">Quan sát từ AI</h2>
            
            <div className="legit-result__flags">
              {result.redFlags && result.redFlags.length > 0 ? (
                result.redFlags.map((flag, idx) => (
                  <div key={idx} className="legit-result__flag">
                    <ShieldAlert size={18} />
                    <span>{flag}</span>
                  </div>
                ))
              ) : (
                <div className="legit-result__flag" style={{ borderColor: '#dcfce7', background: '#f0fdf4' }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <span style={{ color: '#16a34a' }}>Không phát hiện điểm đáng ngờ nào trong các bức ảnh bạn đã tải lên.</span>
                </div>
              )}
            </div>

            <div className="legit-result__advice-box">
              <div className="legit-result__advice-header">
                <Info size={16} />
                <span>Lời khuyên từ Chuyên gia AI</span>
              </div>
              <div className="legit-result__advice-text">
                {result.advice || 'Vui lòng kiểm tra kỹ lưỡng sản phẩm trước khi đưa ra quyết định mua.'}
              </div>
            </div>

            <div className="legit-result__disclaimer">
              <Info size={14} />
              <span>
                Kết quả kiểm định chỉ mang tính tham khảo, dựa trên phân tích hình ảnh 2D và không thể thay thế kiểm định trực tiếp. Người mua cơ sở 48 giờ sau khi nhận hàng để xác nhận tình trạng thực tế.
              </span>
            </div>
          </div>

          <div className="legit-result__right">
            <div className="legit-result__data-box">
              <h3 className="legit-result__data-title">Đối soát Dữ liệu</h3>
              
              <div className="legit-result__data-table">
                <div className="legit-result__data-row">
                  <span className="legit-result__data-label">THƯƠNG HIỆU KHAI BÁO</span>
                  <span className="legit-result__data-value">{brandValue}</span>
                </div>
                <div className="legit-result__data-row">
                  <span className="legit-result__data-label">CHẤT LIỆU PHÁT HIỆN</span>
                  <span className="legit-result__data-value">{result.riskLevel === 'HIGH' ? `≠ ${materialValue}` : `= ${materialValue}`}</span>
                </div>
                <div className="legit-result__data-row">
                  <span className="legit-result__data-label">PHÂN LOẠI PHONG CÁCH</span>
                  <span className="legit-result__data-value success">✓ {styleValue}</span>
                </div>
                <div className="legit-result__data-row">
                  <span className="legit-result__data-label">MỨC ĐỘ TRÙNG KHỚP GIÁ</span>
                  <span className={`legit-result__data-value ${result.riskLevel === 'HIGH' ? 'danger' : 'success'}`}>
                    {matchValue}
                  </span>
                </div>
              </div>
            </div>

            <Link to={returnUrl || PATHS.home} className="legit-result__shop-btn">
              <ShoppingBag size={18} />
              <span>Tiếp tục mua sắm</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  )
}