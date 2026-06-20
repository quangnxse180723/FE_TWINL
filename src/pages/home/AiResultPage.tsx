import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react'
import { PATHS } from '../../routes/paths'
import '../../styles/pages/ai-result.css'

interface AiScanData {
  brand: string;
  material: string;
  style: string;
  estimatedPrice: string;
}

export default function AiResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const aiResult = location.state?.aiResult as AiScanData
  const imagePreview = location.state?.imagePreview as string
  const returnUrl = location.state?.returnUrl as string

  // If no state, go home
  useEffect(() => {
    if (!aiResult || !imagePreview) {
      navigate(PATHS.home)
    }
  }, [aiResult, imagePreview, navigate])

  if (!aiResult || !imagePreview) return null

  return (
    <div className="ai-result-page">
      <div className="ai-result-header">
        <h1>Kết quả Đối soát AI</h1>
        <div className="ai-result-subtitle">
          <CheckCircle2 size={16} />
          <span>Đã hoàn tất phân tích hình ảnh của bạn</span>
        </div>
        <p className="ai-result-desc">
          Hệ thống đang so sánh hình ảnh thực tế với thông tin mô tả từ người bán để đảm bảo tính xác thực.
        </p>
      </div>

      <div className="ai-info-container">
        {/* Left: Image Preview */}
        <div className="ai-image-preview">
          <img src={imagePreview} alt="Uploaded" />
          
          {/* Overlay elements */}
          <div className="ai-focus-corners">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
          </div>
          
          <div className="ai-badge-overlay">
            <Sparkles size={14} />
            <span>PHÁT HIỆN TỰ ĐỘNG</span>
          </div>
        </div>

        {/* Right: AI Analysis Details */}
        <div className="ai-details-panel">
          
          {/* Confidence Alert */}
          <div className="ai-confidence-alert">
            <div className="ai-confidence-left">
              <ShieldCheck size={20} className="text-green-700" />
              <span>Mức độ tin cậy</span>
            </div>
            <div className="ai-confidence-right">
              98% Trùng khớp
            </div>
          </div>

          {/* Comparison Table */}
          <div className="ai-comparison-table">
            <div className="ai-table-header">
              <div className="col-seller">Thông tin từ người bán</div>
              <div className="col-ai">Kết quả AI quét được</div>
            </div>

            <div className="ai-table-row">
              <div className="col-seller">
                <span className="label">Thương hiệu</span>
                <span className="value">{aiResult.brand !== 'Không xác định' ? aiResult.brand : 'Amadus Club'}</span>
              </div>
              <div className="col-ai">
                <span className="label">AI Nhận diện</span>
                <div className="ai-value-wrapper">
                  <span className="value text-green-700">{aiResult.brand !== 'Không xác định' ? aiResult.brand : 'Amadus Club'}</span>
                  <CheckCircle2 size={18} className="text-green-700" />
                </div>
              </div>
            </div>

            <div className="ai-table-row">
              <div className="col-seller">
                <span className="label">Chất liệu</span>
                <span className="value">{aiResult.material || 'Nỉ bông'}</span>
              </div>
              <div className="col-ai">
                <span className="label">AI Nhận diện</span>
                <div className="ai-value-wrapper">
                  <span className="value text-green-700">{aiResult.material || 'Cotton blend'}</span>
                  <CheckCircle2 size={18} className="text-green-700" />
                </div>
              </div>
            </div>

            <div className="ai-table-row">
              <div className="col-seller">
                <span className="label">Kiểu dáng</span>
                <span className="value">{aiResult.style || 'Hoodie khóa kéo'}</span>
              </div>
              <div className="col-ai">
                <span className="label">AI Nhận diện</span>
                <div className="ai-value-wrapper">
                  <span className="value text-green-700">{aiResult.style || 'Zip-up Hoodie'}</span>
                  <CheckCircle2 size={18} className="text-green-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ai-action-buttons">
            <button className="btn-support" style={{ width: '100%', padding: '16px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '12px', fontWeight: 600, fontSize: '15px' }} onClick={() => navigate(returnUrl || PATHS.home)}>
              <span>Quay lại mua sắm</span>
            </button>
          </div>

          <div className="ai-footer-note">
            *Kết quả đối soát dựa trên thuật toán AI với độ chính xác cao.
          </div>
        </div>
      </div>
    </div>
  )
}