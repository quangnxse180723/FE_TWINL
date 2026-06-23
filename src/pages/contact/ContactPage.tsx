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
      setSuccess('Gửi tin nhắn thành công!')
      setForm((prev) => ({ ...prev, message: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi tin nhắn thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="contact">
      <div className="contact__hero">
        <h1>{'Liên hệ TWINL'}</h1>
        <p>{'Chúng tôi luôn ở đây để lắng nghe và hỗ trợ bạn'}</p>
      </div>

      <div className="contact__layout">
        <div className="contact__form">
          <h2>{'Gửi lời nhắn cho chúng tôi'}</h2>
          <form onSubmit={handleSubmit}>
            <label>
              {'Họ và tên'}
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder={'Nhập họ tên của bạn'}
                required
              />
            </label>
            <label>
              {'Email'}
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder={'Nhập địa chỉ email'}
                required
              />
            </label>
            <label>
              {'Số điện thoại'}
              <input
                type="text"
                value={form.phone ?? ''}
                onChange={handleChange('phone')}
                placeholder={'Nhập số điện thoại (tùy chọn)'}
              />
            </label>
            <label>
              {'Nội dung tin nhắn'}
              <textarea
                rows={6}
                value={form.message}
                onChange={handleChange('message')}
                placeholder={'Bạn cần hỗ trợ điều gì?'}
                required
              />
            </label>
            {error ? <div className="contact__error">{error}</div> : null}
            {success ? <div className="contact__success">{success}</div> : null}
            <button type="submit" disabled={submitting}>
              {submitting ? '...' : 'Gửi Tin Nhắn'}
            </button>
          </form>
        </div>

        <aside className="contact__info">
          <div className="contact__card">
            <h3>{'Thông Tin Liên Hệ'}</h3>
            <div className="contact__line">
              <span>{'Email Hỗ Trợ'}</span>
              <strong>twinl2hand@gmail.com</strong>
            </div>
            <div className="contact__line">
              <span>{'Hotline'}</span>
              <strong>0853443242</strong>
            </div>
            <div className="contact__line">
              <span>{'Địa chỉ'}</span>
              <strong>Vinhomes Grandpark</strong>
            </div>
          </div>

          <div className="contact__card">
            <h3>{'Câu Hỏi Thường Gặp'}</h3>
            <details open>
              <summary>{'Sản phẩm có chính hãng không?'}</summary>
              <p>{'Tất cả sản phẩm đều được kiểm định AI và chuyên gia 100%.'}</p>
            </details>
            <details>
              <summary>{'Tôi có thể trả hàng không?'}</summary>
              <p>{'Có, trong vòng 7 ngày nếu lỗi từ nhà sản xuất.'}</p>
            </details>
            <details>
              <summary>{'Phí ship như thế nào?'}</summary>
              <p>{'Miễn phí cho đơn hàng trên 500k.'}</p>
            </details>
            <details>
              <summary>{'Tôi có thể đến cửa hàng xem trực tiếp không?'}</summary>
              <p>{'Rất tiếc hiện tại chúng tôi chỉ bán online.'}</p>
            </details>
          </div>
        </aside>
      </div>

      <div className="contact__about">
        <div>
          <h3>{'Về TWINL'}</h3>
          <p>{'Nền tảng mua bán đồ secondhand đồ hiệu được kiểm định bằng AI.'}</p>
        </div>
        <div>
          <h4>{'Cam Kết'}</h4>
          <ul>
            <li>{'100% Chính hãng'}</li>
            <li>{'Bảo mật thông tin'}</li>
            <li>{'Thanh toán an toàn'}</li>
            <li>{'Hỗ trợ 24/7'}</li>
            <li>{'Giao hàng nhanh'}</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
