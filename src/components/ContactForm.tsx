import { type FormEvent, useState } from 'react'
import '../App.css'
import { contactApi } from '../services/api'

interface ContactFormProps {
  showInfo?: boolean
}

function ContactForm({ showInfo = true }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitted(false)

    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      subject: String(formData.get('subject') || ''),
      message: String(formData.get('message') || '')
    }

    try {
      const result = await contactApi.submit(payload)
      if (result.success) {
        setSubmitted(true)
        form.reset()
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Contact error:', error)
      alert('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-form-container">
      {showInfo && (
        <div className="contact-info">
          <div className="contact-avatar"></div>
          <div className="contact-details">
            <p className="contact-name-email">
              ShootingTeam<br />
              shootingteam@gmail.com
            </p>
          </div>
        </div>
      )}

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            className="form-input" 
            placeholder=""
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            className="form-input" 
            placeholder=""
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject" className="form-label">Subject</label>
          <input 
            type="text" 
            id="subject" 
            name="subject" 
            className="form-input" 
            placeholder=""
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">Message</label>
          <textarea 
            id="message" 
            name="message" 
            className="form-textarea" 
            rows={5}
            placeholder=""
            required
          ></textarea>
        </div>

        <button type="submit" className="contact-submit-button" disabled={isSubmitting}>
          <img src="/assets/images/telegram-icon.png" alt="Telegram" className="telegram-icon" />
          {isSubmitting ? 'Đang gửi...' : 'Submit'}
        </button>

        {submitted && <p style={{ color: 'green', marginTop: 12 }}>Cảm ơn bạn đã liên hệ!</p>}
      </form>
    </div>
  )
}

export default ContactForm
