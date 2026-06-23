export default function ReturnPolicyPage() {
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
    marginBottom: '16px',
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

  const bodyText: React.CSSProperties = {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: 1.75,
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
          CHÍNH SÁCH
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
          Chính sách đổi trả
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
          Chúng tôi cam kết mang lại trải nghiệm mua sắm an tâm và minh bạch.
        </p>

        {/* Section 1: Conditions */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>
            <span style={accentBar} />
            Điều kiện đổi trả
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Sản phẩm nhận được khác mô tả',
              'Sản phẩm bị lỗi hoặc hư hỏng khi giao',
              'Sản phẩm sai màu sắc/kích cỡ so với đơn hàng',
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: '22px',
                    height: '22px',
                    background: '#dcfce7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#1a7a3e',
                    fontWeight: 700,
                    marginTop: '1px',
                  }}
                >
                  ✓
                </span>
                <span style={{ ...bodyText, margin: 0 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Timeline */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>
            <span style={accentBar} />
            Thời gian xử lý
          </h2>
          <p style={bodyText}>
            Yêu cầu đổi trả cần được gửi trong vòng{' '}
            <strong style={{ color: '#1a7a3e' }}>48 giờ</strong> sau khi nhận hàng. Chúng tôi sẽ
            xử lý trong <strong style={{ color: '#1a7a3e' }}>3–5 ngày làm việc</strong>.
          </p>
        </div>

        {/* Section 3: Process */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>
            <span style={accentBar} />
            Quy trình đổi trả
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
            {[
              'Gửi yêu cầu qua trang Liên hệ kèm ảnh sản phẩm.',
              'Chờ xác nhận từ đội hỗ trợ (1–2 ngày).',
              'Gửi trả sản phẩm và nhận hoàn tiền/đổi hàng.',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: '32px',
                    height: '32px',
                    background: '#1a7a3e',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  {i + 1}
                </div>
                <p style={{ ...bodyText, margin: '4px 0 0' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Warning */}
        <div
          style={{
            background: '#fefce8',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            padding: '32px',
            border: '1px solid #fef08a',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#92400e',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '20px' }}>⚠️</span>
            Lưu ý quan trọng
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: '#78350f',
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            Chính sách <strong>không áp dụng</strong> cho các trường hợp:{' '}
            <br />
            • Sản phẩm đã qua sử dụng sau khi nhận.
            <br />
            • Lý do cá nhân không thích sản phẩm.
          </p>
        </div>
      </div>
    </div>
  );
}
