import { useState } from 'react';
import { useSelector } from 'react-redux';
import contactApi from '../../api/contact/contactApi';
import type { RootState } from '../../store';

export default function ReportBugPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Trung bình');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const severityLabel = severity === 'Nghiêm trọng' ? '🔴' : severity === 'Trung bình' ? '🟡' : '🟢';
      await contactApi.create({
        name: name || 'Người dùng ẩn danh',
        email: email || 'no-reply@twinl.vn',
        phone: phone || null,
        message: `[BÁO CÁO LỖI] ${severityLabel} Mức độ: ${severity}\n\nTiêu đề: ${title}\n\nMô tả chi tiết:\n${description}`,
      });
      setSubmitted(true);
      setTitle('');
      setDescription('');
      setSeverity('Trung bình');
      setTimeout(() => setSubmitted(false), 6000);
    } catch {
      setError('Gửi báo cáo thất bại. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    padding: '32px',
    border: '1px solid #e5e7eb',
    marginBottom: '24px',
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const accentBar: React.CSSProperties = {
    display: 'inline-block',
    width: '4px',
    height: '22px',
    background: '#1a7a3e',
    borderRadius: '4px',
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    background: '#fafafa',
  };

  const fieldGroup: React.CSSProperties = {
    marginBottom: '20px',
  };

  return (
    <div
      style={{
        background: '#f8fafc',
        minHeight: '100vh',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: '60px 24px',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <p
          style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#1a7a3e',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          HỖ TRỢ KỸ THUẬT
        </p>
        <h1
          style={{
            fontSize: '40px',
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 16px',
            lineHeight: 1.2,
          }}
        >
          Báo cáo lỗi
        </h1>
        <p
          style={{
            fontSize: '17px',
            color: '#6b7280',
            lineHeight: 1.7,
            marginBottom: '48px',
            maxWidth: '600px',
          }}
        >
          Giúp chúng tôi cải thiện TWINL bằng cách báo cáo các lỗi bạn gặp phải.
        </p>

        {/* Success Toast */}
        {submitted && (
          <div
            style={{
              background: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'slideDown 0.3s ease',
            }}
          >
            <span style={{ fontSize: '20px' }}>✅</span>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#166534' }}>
              Cảm ơn! Báo cáo của bạn đã được gửi thành công.
            </p>
          </div>
        )}

        {/* Contact Info Card */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>
            <span style={accentBar} />
            Liên hệ với chúng tôi
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px', marginTop: 0 }}>
            Bạn cũng có thể liên hệ trực tiếp qua các kênh bên dưới:
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Gmail */}
            <a
              href="mailto:twinl2hand@gmail.com"
              title="twinl2hand@gmail.com"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', textDecoration: 'none', color: '#dc2626', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fef2f2')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="#fff" stroke="#fca5a5" strokeWidth="1"/><path d="M2 6l10 7 10-7" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Gmail
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/people/TWINL/61590433408258/"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook TWINL"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', textDecoration: 'none', color: '#1d4ed8', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#dbeafe')}
              onMouseLeave={e => (e.currentTarget.style.background = '#eff6ff')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.532-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              Facebook
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@twinl2hand"
              target="_blank"
              rel="noopener noreferrer"
              title="TikTok @twinl2hand"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', textDecoration: 'none', color: '#111827', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#dcfce7')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f0fdf4')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#010101"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.84 4.84 0 0 1-1.01-.07z"/></svg>
              TikTok
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/twinl_official"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram @twinl_official"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '12px', textDecoration: 'none', color: '#7e22ce', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f3e8ff')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fdf4ff')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24"><defs><radialGradient id="ig-grad" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#ffd600"/><stop offset="50%" stopColor="#ff0069"/><stop offset="100%" stopColor="#6a00f4"/></radialGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig-grad)"/><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="#fff" strokeWidth="1.5"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" strokeWidth="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="#fff"/></svg>
              Instagram
            </a>
          </div>
        </div>

        {/* Bug Report Form */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>
            <span style={accentBar} />
            Gửi báo cáo lỗi
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Name + Email row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label htmlFor="bug-name" style={labelStyle}>
                  Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="bug-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ tên của bạn"
                  style={inputStyle}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = '#1a7a3e')}
                  onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = '#e5e7eb')}
                />
              </div>
              <div>
                <label htmlFor="bug-email" style={labelStyle}>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="bug-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email"
                  style={inputStyle}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = '#1a7a3e')}
                  onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = '#e5e7eb')}
                />
              </div>
            </div>

            {/* Phone */}
            <div style={fieldGroup}>
              <label htmlFor="bug-phone" style={labelStyle}>
                Số điện thoại <span style={{ color: '#9ca3af', fontWeight: 400 }}>(tùy chọn)</span>
              </label>
              <input
                id="bug-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại (tùy chọn)"
                style={inputStyle}
                onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = '#1a7a3e')}
                onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = '#e5e7eb')}
              />
            </div>

            <div style={fieldGroup}>
              <label htmlFor="bug-title" style={labelStyle}>
                Tiêu đề lỗi <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="bug-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Không thể thêm sản phẩm vào giỏ hàng"
                style={inputStyle}
                onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = '#1a7a3e')}
                onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = '#e5e7eb')}
              />
            </div>

            <div style={fieldGroup}>
              <label htmlFor="bug-desc" style={labelStyle}>
                Mô tả chi tiết <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="bug-desc"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả những gì đã xảy ra, các bước tái hiện lỗi và kết quả mong đợi..."
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = '#1a7a3e')}
                onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = '#e5e7eb')}
              />
            </div>

            <div style={fieldGroup}>
              <label htmlFor="bug-severity" style={labelStyle}>
                Mức độ nghiêm trọng
              </label>
              <select
                id="bug-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={(e) => ((e.target as HTMLSelectElement).style.borderColor = '#1a7a3e')}
                onBlur={(e) => ((e.target as HTMLSelectElement).style.borderColor = '#e5e7eb')}
              >
                <option value="Nghiêm trọng">🔴 Nghiêm trọng</option>
                <option value="Trung bình">🟡 Trung bình</option>
                <option value="Nhẹ">🟢 Nhẹ</option>
              </select>
            </div>

            {error && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', color: '#dc2626', fontSize: '14px' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? '#6b7280' : '#1a7a3e',
                color: '#ffffff',
                border: 'none',
                padding: '13px 32px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                transition: 'background 0.2s, transform 0.15s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: submitting ? 0.8 : 1,
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#166534';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1a7a3e';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }
              }}
            >
              {submitting ? (
                <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span> Đang gửi...</>
              ) : (
                <><span>📨</span> Gửi báo cáo</>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
