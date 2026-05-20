import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import contactApi from '../../api/contact/contactApi'
import type { ContactRequest } from '../../types/contact'
import type { RootState } from '../../store'
import '../../styles/pages/contact.css'

const emptyForm: ContactRequest = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

export default function ContactPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const [form, setForm] = useState<ContactRequest>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.displayName || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }))
  }, [user])

  const handleChange = (field: keyof ContactRequest) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await contactApi.create(form)
      setSuccess('Tin nhắn đã được gửi. Chúng tôi sẽ phản hồi sớm nhất.')
      setForm((prev) => ({ ...prev, message: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi tin nhắn')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="contact">
      <div className="contact__hero">
        <h1>Liên hệ với chúng tôi</h1>
        <p>Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn.</p>
      </div>

      <div className="contact__layout">
        <div className="contact__form">
          <h2>Gửi tin nhắn</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Họ tên
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Nhập họ tên của bạn"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="Nhập địa chỉ email"
                required
              />
            </label>
            <label>
              Số điện thoại
              <input
                type="text"
                value={form.phone ?? ''}
                onChange={handleChange('phone')}
                placeholder="Nhập số điện thoại (tùy chọn)"
              />
            </label>
            <label>
              Tin nhắn
              <textarea
                rows={6}
                value={form.message}
                onChange={handleChange('message')}
                placeholder="Bạn cần hỗ trợ điều gì?"
                required
              />
            </label>
            {error ? <div className="contact__error">{error}</div> : null}
            {success ? <div className="contact__success">{success}</div> : null}
            <button type="submit" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </button>
          </form>
        </div>

        <aside className="contact__info">
          <div className="contact__card">
            <h3>Thông tin liên hệ</h3>
            <div className="contact__line">
              <span>Email hỗ trợ</span>
              <strong>support@twinl.com</strong>
            </div>
            <div className="contact__line">
              <span>Hotline</span>
              <strong>1800 123 456</strong>
            </div>
            <div className="contact__line">
              <span>Địa chỉ</span>
              <strong>123 Đường Thời Trang, Quận 1, TP. Hồ Chí Minh</strong>
            </div>
          </div>

          <div className="contact__card">
            <h3>Câu hỏi thường gặp</h3>
            <details open>
              <summary>Sản phẩm tại TWINL có chính hãng không?</summary>
              <p>Chúng tôi cam kết sản phẩm chính hãng, rõ nguồn gốc.</p>
            </details>
            <details>
              <summary>Sản phẩm 2hand tình trạng có mới không?</summary>
              <p>Mỗi sản phẩm đều được kiểm tra kỹ và mô tả tình trạng rõ ràng.</p>
            </details>
            <details>
              <summary>Làm sao để chọn size khi mua online?</summary>
              <p>Bạn có thể đối chiếu bằng size guide hoặc liên hệ tư vấn.</p>
            </details>
            <details>
              <summary>Bao lâu thì đơn hàng được giao?</summary>
              <p>Thời gian giao hàng 2-5 ngày làm việc tùy khu vực.</p>
            </details>
          </div>
        </aside>
      </div>

      <div className="contact__about">
        <div>
          <h3>Cửa hàng TWINL với bộ sưu tập streetwear và hypebeast</h3>
          <p>
            Quần áo là yếu tố không thể thiếu để tạo nên phong cách của mỗi người. Chúng mang
            lại sự tự tin, thoải mái và thể hiện cá tính riêng biệt.
          </p>
        </div>
        <div>
          <h4>Mỗi sản phẩm đều được đảm bảo</h4>
          <ul>
            <li>Chất lượng chuẩn, chính hãng</li>
            <li>Ngoại hình đẹp, tình trạng rõ ràng</li>
            <li>Độ bền cao</li>
            <li>Phong cách đúng chuẩn streetwear / hypebeast</li>
            <li>Trải nghiệm mua sắm an toàn</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
