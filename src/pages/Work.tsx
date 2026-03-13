import { useState } from 'react'
import '../App.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import ContactForm from '../components/ContactForm'
import VideoModal from '../components/VideoModal'

const workProjects = [
  { title: 'ME.AI25', image: '/assets/images/work-project-1.png', videoUrl: 'https://youtu.be/dGgwqZhmJl4?si=vmNInISpPfwc7QQT' },
  { title: 'Giải Vô Địch Muay', image: '/assets/images/work-project-2.png', videoUrl: 'https://www.facebook.com/reel/1137882121340299' },
  { title: 'Cuộc Dạo Chơi', image: '/assets/images/work-project-3.svg', videoUrl: 'https://youtu.be/JGG1ZccdnC8?si=Chp0aFx5cEHBQrag' },
  { title: 'Mây Tre Đan Phú Vinh', image: '/assets/images/work-project-4.png', videoUrl: 'https://youtu.be/-krF5YuutFs?si=L2klskfSlOHE7Mg7' },
  { title: 'DÂU TẰM - DANCE', image: '/assets/images/work-project-5.png', videoUrl: 'https://youtu.be/9inFMPWSGXw?si=wyZqm6lZnYa0FulJ' },
  { title: 'Định Luật Bảo Toàn', image: '/assets/images/work-project-6.png', videoUrl: 'https://youtu.be/tiYeReSjedA?si=TP5yeFhPYn6USqti' },
  { title: 'Mùa Hè Củ Em', image: '/assets/images/work-project-7.svg', videoUrl: 'https://youtu.be/jR0FNFEg-dI?si=j5rrQVskEV8-vs0s' },
  { title: 'Wedding Khải - Lan', image: '/assets/images/work-project-8.png', videoUrl: 'https://youtu.be/rFI1p5F5n9Q?si=b1D2xN2T6Fuh7BTF' }
]

function Work() {
  const [showContactModal, setShowContactModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<{ title: string; videoUrl: string } | null>(null)

  const handleOpenVideo = (project: { title: string; videoUrl: string }) => {
    setSelectedProject(project)
    setShowVideoModal(true)
  }

  const handleCloseVideo = () => {
    setShowVideoModal(false)
    setSelectedProject(null)
  }

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
                      <button
                        className="project-button"
                        onClick={() => handleOpenVideo(project)}
                      >
                        View Project
                      </button>
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

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={handleCloseVideo}
        videoUrl={selectedProject?.videoUrl || ''}
        title={selectedProject?.title || ''}
      />

      <Footer />
    </>
  )
}

export default Work
