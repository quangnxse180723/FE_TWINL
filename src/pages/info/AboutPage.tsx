import { Link } from 'react-router-dom';

const styles = {
  page: {
    background: '#f8fafc',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: '60px 24px',
  } as React.CSSProperties,
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  } as React.CSSProperties,
  eyebrow: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '2px',
    color: '#1a7a3e',
    textTransform: 'uppercase' as const,
    marginBottom: '12px',
  } as React.CSSProperties,
  title: {
    fontSize: '40px',
    fontWeight: 800,
    color: '#111827',
    margin: '0 0 16px',
    lineHeight: 1.2,
  } as React.CSSProperties,
  subtitle: {
    fontSize: '17px',
    color: '#6b7280',
    lineHeight: 1.7,
    marginBottom: '48px',
    maxWidth: '600px',
  } as React.CSSProperties,
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    padding: '32px',
    border: '1px solid #e5e7eb',
    marginBottom: '24px',
  } as React.CSSProperties,
  cardTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,
  cardTitleAccent: {
    display: 'inline-block',
    width: '4px',
    height: '22px',
    background: '#1a7a3e',
    borderRadius: '4px',
  } as React.CSSProperties,
  bodyText: {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: 1.75,
  } as React.CSSProperties,
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '8px',
  } as React.CSSProperties,
  valueItem: {
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #f3f4f6',
  } as React.CSSProperties,
  valueIcon: {
    fontSize: '28px',
    marginBottom: '10px',
  } as React.CSSProperties,
  valueTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '6px',
  } as React.CSSProperties,
  valueDesc: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: 1.6,
  } as React.CSSProperties,
  contactText: {
    fontSize: '15px',
    color: '#4b5563',
    marginBottom: '20px',
    lineHeight: 1.7,
  } as React.CSSProperties,
  button: {
    display: 'inline-block',
    background: '#1a7a3e',
    color: '#ffffff',
    padding: '12px 28px',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '15px',
    textDecoration: 'none',
    transition: 'background 0.2s, transform 0.15s',
  } as React.CSSProperties,
};

export default function AboutPage() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <p style={styles.eyebrow}>VỀ CHÚNG TÔI</p>
        <h1 style={styles.title}>Câu chuyện của TWINL</h1>
        <p style={styles.subtitle}>
          TWINL là nền tảng mua bán thời trang secondhand uy tín, kết nối người mua và người bán
          trong cộng đồng thời trang Việt Nam.
        </p>

        {/* Mission */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span style={styles.cardTitleAccent} />
            Sứ mệnh
          </h2>
          <p style={styles.bodyText}>
            Tạo ra một nền tảng trao đổi thời trang bền vững, nơi mỗi món đồ đều có cơ hội tìm
            thấy chủ nhân mới. Chúng tôi tin rằng thời trang tốt không cần phải đắt tiền.
          </p>
        </div>

        {/* Core Values */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span style={styles.cardTitleAccent} />
            Giá trị cốt lõi
          </h2>
          <div style={styles.valuesGrid}>
            <div style={styles.valueItem}>
              <div style={styles.valueIcon}>🛡️</div>
              <div style={styles.valueTitle}>Uy tín & An toàn</div>
              <div style={styles.valueDesc}>
                Hệ thống ký quỹ bảo vệ cả người mua lẫn người bán
              </div>
            </div>
            <div style={styles.valueItem}>
              <div style={styles.valueIcon}>🌱</div>
              <div style={styles.valueTitle}>Bền vững</div>
              <div style={styles.valueDesc}>
                Kéo dài vòng đời sản phẩm, giảm thiểu lãng phí thời trang
              </div>
            </div>
            <div style={styles.valueItem}>
              <div style={styles.valueIcon}>🤝</div>
              <div style={styles.valueTitle}>Cộng đồng</div>
              <div style={styles.valueDesc}>
                Xây dựng cộng đồng thời trang lành mạnh và minh bạch
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span style={styles.cardTitleAccent} />
            Liên hệ với chúng tôi
          </h2>
          <p style={styles.contactText}>
            Bạn có câu hỏi hoặc muốn hợp tác cùng TWINL? Chúng tôi luôn sẵn sàng lắng nghe và
            hỗ trợ bạn.
          </p>
          <Link
            to="/contact"
            style={styles.button}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#15623200';
              (e.currentTarget as HTMLAnchorElement).style.background = '#166534';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#1a7a3e';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
            }}
          >
            Đến trang Liên hệ →
          </Link>
        </div>
      </div>
    </div>
  );
}
