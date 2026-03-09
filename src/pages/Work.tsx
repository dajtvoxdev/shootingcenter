import { useState } from 'react'
import '../App.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import ContactForm from '../components/ContactForm'

function Work() {
  const [showContactModal, setShowContactModal] = useState(false)

  return (
    <>
      <div className="homepage">
        <Navigation />

        {/* Work Page Content */}
        <section className="work-page">
          <div className="work-content">
            <h1 className="work-title">Our most recent work</h1>
            <p className="work-description">Vibrant visuals that tell powerful stories ✨ Projects from recent years captured across the globe.</p>
            <div className="projects-grid">
              <div className="project-card">
                <img src="/assets/images/work-project-1.png" alt="Project 1" className="project-image" />
                <div className="project-overlay">
                  <span className="project-tag">Photo/Video</span>
                  <div className="project-bottom">
                    <h4 className="project-name">campain name</h4>
                    <button className="project-button">View Project</button>
                  </div>
                </div>
              </div>
              <div className="project-card">
                <img src="/assets/images/work-project-2.png" alt="Project 2" className="project-image" />
                <div className="project-overlay">
                  <span className="project-tag">Photo/Video</span>
                  <div className="project-bottom">
                    <h4 className="project-name">campain name</h4>
                    <button className="project-button">View Project</button>
                  </div>
                </div>
              </div>
              <div className="project-card">
                <img src="/assets/images/work-project-3.png" alt="Project 3" className="project-image" />
                <div className="project-overlay">
                  <span className="project-tag">Photo/Video</span>
                  <div className="project-bottom">
                    <h4 className="project-name">campain name</h4>
                    <button className="project-button">View Project</button>
                  </div>
                </div>
              </div>
              <div className="project-card">
                <img src="/assets/images/work-project-4.png" alt="Project 4" className="project-image" />
                <div className="project-overlay">
                  <span className="project-tag">Photo/Video</span>
                  <div className="project-bottom">
                    <h4 className="project-name">campain name</h4>
                    <button className="project-button">View Project</button>
                  </div>
                </div>
              </div>
              <div className="project-card">
                <img src="/assets/images/work-project-5.png" alt="Project 5" className="project-image" />
                <div className="project-overlay">
                  <span className="project-tag">Photo/Video</span>
                  <div className="project-bottom">
                    <h4 className="project-name">campain name</h4>
                    <button className="project-button">View Project</button>
                  </div>
                </div>
              </div>
              <div className="project-card">
                <img src="/assets/images/work-project-6.png" alt="Project 6" className="project-image" />
                <div className="project-overlay">
                  <span className="project-tag">Photo/Video</span>
                  <div className="project-bottom">
                    <h4 className="project-name">campain name</h4>
                    <button className="project-button">View Project</button>
                  </div>
                </div>
              </div>
              <div className="project-card">
                <img src="/assets/images/work-project-7.png" alt="Project 7" className="project-image" />
                <div className="project-overlay">
                  <span className="project-tag">Photo/Video</span>
                  <div className="project-bottom">
                    <h4 className="project-name">campain name</h4>
                    <button className="project-button">View Project</button>
                  </div>
                </div>
              </div>
              <div className="project-card">
                <img src="/assets/images/work-project-8.png" alt="Project 8" className="project-image" />
                <div className="project-overlay">
                  <span className="project-tag">Photo/Video</span>
                  <div className="project-bottom">
                    <h4 className="project-name">campain name</h4>
                    <button className="project-button">View Project</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Let's Connect Section */}
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
      
      {/* Contact Modal */}
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
