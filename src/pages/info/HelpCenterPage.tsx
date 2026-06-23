import { useState } from 'react';

const faqs = [
  {
    question: 'Làm thế nào để đặt hàng?',
    answer:
      'Duyệt sản phẩm, thêm vào giỏ hàng, chọn phương thức thanh toán và hoàn tất đơn hàng.',
  },
  {
    question: 'Tôi có thể thanh toán bằng những phương thức nào?',
    answer:
      'TWINL hỗ trợ thanh toán qua QR Banking (SePay), VNPay và các ví điện tử phổ biến.',
  },
  {
    question: 'Đơn hàng của tôi ở đâu?',
    answer:
      'Vào mục Lịch sử đơn hàng trong tài khoản để theo dõi trạng thái đơn hàng theo thời gian thực.',
  },
  {
    question: 'Hệ thống ký quỹ là gì?',
    answer:
      'Tiền thanh toán sẽ được giữ an toàn cho đến khi bạn xác nhận đã nhận hàng thành công, đảm bảo quyền lợi cho cả hai bên.',
  },
  {
    question: 'Làm thế nào để trở thành người bán?',
    answer:
      'Đăng nhập, vào Dashboard của người bán và đăng tải sản phẩm của bạn.',
  },
  {
    question: 'Tôi cần hỗ trợ thêm thì làm thế nào?',
    answer:
      'Liên hệ với chúng tôi qua trang Liên hệ hoặc email twinl2hand@gmail.com.',
  },
];

export default function HelpCenterPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

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
          HỖ TRỢ
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
          Trung tâm trợ giúp
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
          Tìm câu trả lời cho những thắc mắc thường gặp về TWINL.
        </p>

        {/* Search hint */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '20px' }}>💬</span>
          <p style={{ margin: 0, fontSize: '14px', color: '#166534' }}>
            Không tìm thấy câu trả lời? Liên hệ chúng tôi qua{' '}
            <strong>twinl2hand@gmail.com</strong>
          </p>
        </div>

        {/* FAQ Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                borderBottom: i < faqs.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}
            >
              <button
                onClick={() => toggle(i)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '22px 32px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left',
                  gap: '16px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = '#f9fafb')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')
                }
              >
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: openIndex === i ? '#1a7a3e' : '#111827',
                    flex: 1,
                    transition: 'color 0.15s',
                  }}
                >
                  {faq.question}
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    color: '#1a7a3e',
                    fontWeight: 700,
                    transition: 'transform 0.25s',
                    transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                >
                  ▼
                </span>
              </button>

              {openIndex === i && (
                <div
                  style={{
                    padding: '0 32px 22px',
                    fontSize: '15px',
                    color: '#4b5563',
                    lineHeight: 1.75,
                    borderTop: '1px solid #f0fdf4',
                    background: '#fafffe',
                    animation: 'fadeIn 0.2s ease',
                  }}
                >
                  <p style={{ margin: '16px 0 0' }}>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
