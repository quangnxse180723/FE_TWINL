import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Shield, ShieldAlert, ShieldQuestion, AlertTriangle, CheckCircle2, ArrowLeft, ShoppingBag } from 'lucide-react'
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
    label: 'Rủi ro thấp',
    sublabel: 'Khả năng cao là chính hãng',
    className: 'legit-result--low',
    badgeClass: 'legit-badge--low',
    bgGradient: 'linear-gradient(135deg, #0f4c2a 0%, #1a7a40 100%)',
    Icon: Shield,
  },
  HIGH: {
    label: 'Rủi ro cao',
    sublabel: 'Nhiều dấu hiệu làm giả được phát hiện',
    className: 'legit-result--high',
    badgeClass: 'legit-badge--high',
    bgGradient: 'linear-gradient(135deg, #4a0d0d 0%, #8b2020 100%)',
    Icon: ShieldAlert,
  },
  UNCERTAIN: {
    label: 'Không đủ dữ liệu',
    sublabel: 'Cần thêm ảnh hoặc góc rõ hơn để phán đoán',
    className: 'legit-result--uncertain',
    badgeClass: 'legit-badge--uncertain',
    bgGradient: 'linear-gradient(135deg, #2d2d00 0%, #5a5200 100%)',
    Icon: ShieldQuestion,
  },
}

export default function LegitResultPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result: LegitCheckResult = state?.legitResult
  const previewImages: Record<string, string> = state?.previewImages || {}

  if (!result) {
    return (
      <div className="legit-result-empty">
        <ShieldQuestion size={60} />
        <p>Không có kết quả kiểm định nào.</p>
        <button onClick={() => navigate(PATHS.home)}>Về trang chủ</button>
      </div>
    )
  }

  const cfg = RISK_CONFIG[result.riskLevel] || RISK_CONFIG.UNCERTAIN

  return (
    <div className="legit-result">
      {/* Hero banner */}
      <div className="legit-result__hero" style={{ background: cfg.bgGradient }}>
        <div className="legit-result__hero-inner">
          <div className={`legit-result__icon-wrap ${cfg.className}`}>
            <cfg.Icon size={44} />
          </div>
          <div className="legit-result__hero-text">
            <p className="legit-result__brand">{result.brand || 'Không xác định thương hiệu'}</p>
            <h1 className="legit-result__verdict">{cfg.label}</h1>
            <p className="legit-result__sublabel">{cfg.sublabel}</p>
          </div>
        </div>
      </div>

      <div className="legit-result__body">
        {/* Image previews */}
        {Object.keys(previewImages).length > 0 && (
          <div className="legit-result__previews">
            {Object.entries(previewImages).map(([key, src]) => src && (
              <div key={key} className="legit-result__preview-img">
                <img src={src} alt={key} />
              </div>
            ))}
          </div>
        )}

        {/* Red Flags */}
        {result.redFlags && result.redFlags.length > 0 && (
          <div className="legit-result__section">
            <h3 className="legit-result__section-title">
              <AlertTriangle size={18} /> Điểm đáng ngờ phát hiện được
            </h3>
            <ul className="legit-result__red-flags">
              {result.redFlags.map((flag, i) => (
                <li key={i} className="legit-result__red-flag">
                  <AlertTriangle size={14} />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* No red flags */}
        {(!result.redFlags || result.redFlags.length === 0) && result.riskLevel === 'LOW' && (
          <div className="legit-result__section">
            <h3 className="legit-result__section-title">
              <CheckCircle2 size={18} /> Kết quả kiểm tra
            </h3>
            <div className="legit-result__clean">
              <CheckCircle2 size={32} />
              <p>Không phát hiện dấu hiệu làm giả đáng ngờ nào qua phân tích hình ảnh</p>
            </div>
          </div>
        )}

        {/* Advice */}
        <div className="legit-result__section">
          <h3 className="legit-result__section-title">
            <Shield size={18} /> Lời khuyên của chuyên gia AI
          </h3>
          <div className="legit-result__advice">
            <p>{result.advice}</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="legit-result__disclaimer">
          <AlertTriangle size={14} />
          <span>
            Kết quả kiểm định AI chỉ mang tính tham khảo, được dựa trên phân tích hình ảnh 2D và không thể thay thế kiểm định vật lý chuyên nghiệp.
            Người mua vẫn có <strong>48 giờ</strong> sau khi nhận hàng để xác nhận tình trạng thực tế.
          </span>
        </div>

        {/* Actions */}
        <div className="legit-result__actions">
          <button className="legit-result__back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Quay lại
          </button>
          <Link to={PATHS.home} className="legit-result__shop">
            <ShoppingBag size={18} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  )
}
