import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import contactApi from '../../api/contact/contactApi'
import type { ContactRequest } from '../../types/contact'
import type { RootState } from '../../store'
import { useTranslation } from 'react-i18next'
import '../../styles/pages/contact.css'

const emptyForm: ContactRequest = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

export default function ContactPage() {
  const { t } = useTranslation()
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
      setSuccess(t('contact.success'))
      setForm((prev) => ({ ...prev, message: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('contact.failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="contact">
      <div className="contact__hero">
        <h1>{t('contact.title')}</h1>
        <p>{t('contact.desc')}</p>
      </div>

      <div className="contact__layout">
        <div className="contact__form">
          <h2>{t('contact.send_msg')}</h2>
          <form onSubmit={handleSubmit}>
            <label>
              {t('contact.name')}
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Nhập họ tên của bạn"
                required
              />
            </label>
            <label>
              {t('contact.email')}
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="Nhập địa chỉ email"
                required
              />
            </label>
            <label>
              {t('contact.phone')}
              <input
                type="text"
                value={form.phone ?? ''}
                onChange={handleChange('phone')}
                placeholder="Nhập số điện thoại (tùy chọn)"
              />
            </label>
            <label>
              {t('contact.message')}
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
              {submitting ? '...' : t('contact.send_btn')}
            </button>
          </form>
        </div>

        <aside className="contact__info">
          <div className="contact__card">
            <h3>{t('contact.info')}</h3>
            <div className="contact__line">
              <span>{t('contact.support_email')}</span>
              <strong>twinl2hand@gmail.com</strong>
            </div>
            <div className="contact__line">
              <span>{t('contact.hotline')}</span>
              <strong>0853443242</strong>
            </div>
            <div className="contact__line">
              <span>{t('contact.address')}</span>
              <strong>Vinhomes Grandpark</strong>
            </div>
          </div>

          <div className="contact__card">
            <h3>{t('contact.faq')}</h3>
            <details open>
              <summary>{t('contact.faq_q1')}</summary>
              <p>{t('contact.faq_a1')}</p>
            </details>
            <details>
              <summary>{t('contact.faq_q2')}</summary>
              <p>{t('contact.faq_a2')}</p>
            </details>
            <details>
              <summary>{t('contact.faq_q3')}</summary>
              <p>{t('contact.faq_a3')}</p>
            </details>
            <details>
              <summary>{t('contact.faq_q4')}</summary>
              <p>{t('contact.faq_a4')}</p>
            </details>
          </div>
        </aside>
      </div>

      <div className="contact__about">
        <div>
          <h3>{t('contact.about_title')}</h3>
          <p>{t('contact.about_desc')}</p>
        </div>
        <div>
          <h4>{t('contact.guarantee')}</h4>
          <ul>
            <li>{t('contact.g1')}</li>
            <li>{t('contact.g2')}</li>
            <li>{t('contact.g3')}</li>
            <li>{t('contact.g4')}</li>
            <li>{t('contact.g5')}</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
