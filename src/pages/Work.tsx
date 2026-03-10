import { useState } from 'react'
import '../App.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import ContactForm from '../components/ContactForm'

const workProjects = [
  { title: 'ME.AI25', image: '/assets/images/work-project-1.png' },
  { title: 'Giải Vô Địch Muay', image: '/assets/images/work-project-2.png' },
  { title: 'Cuộc Dạo Chơi', image: '/assets/images/work-project-3.svg' },
  { title: 'Mây Tre Đan Phú Vinh', image: '/assets/images/work-project-4.png' },
  { title: 'DÂU TẰM - DANCE', image: '/assets/images/work-project-5.png' },
  { title: 'Định Luật Bảo Toàn', image: '/assets/images/work-project-6.png' },
  { title: 'Mùa Hè Của Em', image: '/assets/images/work-project-7.svg' },
  { title: 'Wedding Khải - Lan', image: '/assets/images/work-project-8.png' }
]

function Work() {
  const [showContactModal, setShowContactModal] = useState(false)

  return (
    <>
      <div className="homepage">
        <Navigation />

        <section className="work-page">
          <div className="work-content">
            <h1 className="work-title">Our most recent work</h1>
            <p className="work-description">Vibrant visuals that tell powerful stories ✨ Projects from recent years captured across the globe.</p>
            <div className="projects-grid">
              {workProjects.map((project) => (
                <div key={project.title} className="project-card">
                  <img src={project.image} alt={project.title} className="project-image" />
                  <div className="project-overlay">
                    <span className="project-tag">Photo/Video</span>
                    <div className="project-bottom">
                      <h4 className="project-name">{project.title}</h4>
                      <button className="project-button">View Project</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lets-connect-section">
          <div className="lets-connect-content">
            <h2 className="lets-connect-subtitle">Like what you see?</h2>
            <h2 className="lets-connect-title">Let's connect</h2>
            <button
              className="lets-connect-button"
              onClick={() => setShowContactModal(true)}
            >
              <img src="/assets/images/telegram-icon.png" alt="Telegram" className="telegram-icon" />
              Email me
            </button>
          </div>
        </section>
      </div>

      {showContactModal && (
        <div className="contact-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="contact-modal-close"
              onClick={() => setShowContactModal(false)}
            >
              ×
            </button>
            <h2 className="contact-modal-title">Contact Us</h2>
            <ContactForm showInfo={false} />
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default Work
