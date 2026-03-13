import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import ContactForm from '../components/ContactForm'
import VideoModal from '../components/VideoModal'

const homeProjects = [
  {
    title: 'Đừng Đến - Short Film',
    image: '/assets/images/project-1.png',
    videoUrl: 'https://youtu.be/7nn6weUGU08?si=cvpZHbNY_HP2PFMu'
  },
  {
    title: 'Mùa Hè Củ Em - MV',
    image: '/assets/images/project-2.png',
    videoUrl: 'https://youtu.be/jR0FNFEg-dI?si=j5rrQVskEV8-vs0s'
  },
  {
    title: 'Giấy Trắng - Short Film',
    image: '/assets/images/project-3.png',
    videoUrl: 'https://youtu.be/ay8yMEFoNJw?si=PgS4L3UdYk31YYx9'
  },
  {
    title: 'Mây Tre Đan',
    image: '/assets/images/project-4.png',
    videoUrl: 'https://youtu.be/-krF5YuutFs?si=L2klskfSlOHE7Mg7'
  }
]

function Home() {
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

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <button className="btn-status">
                <div className="status-dot-outer">
                  <div className="status-dot-inner"></div>
                </div>
                <span>Available for Inquiries</span>
              </button>
              <h1 className="hero-title">
                <span className="title-line title-opacity">Shooting Center</span>
                <span className="title-line">production</span>
              </h1>
              <p className="hero-subtitle">
                Đội ngũ làm phim trẻ tại Hoà Lạc, luôn sẵn sàng để đương đầu với những thử thách mới
              </p>
              <div className="hero-buttons">
                <button
                  className="btn btn-black"
                  onClick={() => setShowContactModal(true)}
                >
                  Send us a message
                </button>
              </div>
            </div>
            <div className="hero-images">
              <img src="/assets/images/hero-image-1.png" alt="" className="hero-img hero-img-2" />
              <img src="/assets/images/hero-image-2.png" alt="" className="hero-img hero-img-1" />
              <img src="/assets/images/hero-image-3.png" alt="" className="hero-img hero-img-3" />
            </div>
          </div>
          <div className="hero-trusted-by">
            <p>Trusted by many</p>
            <div className="hero-trusted-logos">
              <img src="/assets/images/trusted-1.png" alt="Wacom" className="hero-trusted-logo" />
              <img src="/assets/images/trusted-2.png" alt="FPT Education" className="hero-trusted-logo" />
              <img src="/assets/images/trusted-3.png" alt="HSB" className="hero-trusted-logo" />
              <img src="/assets/images/trusted-4.png" alt="FMUC" className="hero-trusted-logo" />
              <img src="/assets/images/trusted-5.png" alt="FMUC" className="hero-trusted-logo" />
            </div>
          </div>
        </section>

        <div className="section-divider"></div>
        {/* Projects Section */}
        <section className="projects">
          <div className="projects-grid">
            {homeProjects.map((project) => (
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
          <div className="projects-footer">
            <Link to="/work" className="view-all-title-link">
              <h2 className="view-all-title">View all our project</h2>
            </Link>
          </div>
        </section>
        <div className="section-divider"></div>
        {/* Services Section */}
        <section className="services" id="service">
          <div className="services-content">
            <div className="services-header">
              <h2 className="services-title">
                <span className="title-gray">Service that</span>
                <span className="title-black">shape your story</span>
              </h2>
              <div className="services-right">
                <div className="service-item">
                  <div className="service-icon-circle">
                    <img src="/assets/images/icon-clapperboard.png" alt="" />
                  </div>
                  <div className="service-text">
                    <h3>Equipment</h3>
                  </div>
                </div>
                <div className="service-item">
                  <div className="service-icon-circle">
                    <img src="/assets/images/icon-video.png" alt="" />
                  </div>
                  <div className="service-text">
                    <h3>Cinematography/Directing</h3>
                  </div>
                </div>
                <div className="service-item">
                  <div className="service-icon-circle">
                    <img src="/assets/images/icon-laptop.png" alt="" />
                  </div>
                  <div className="service-text">
                    <h3>Video Editing&Look Building</h3>
                  </div>
                </div>
                <div className="service-item">
                  <div className="service-icon-circle">
                    <img src="/assets/images/icon-fantasy.png" alt="" />
                  </div>
                  <div className="service-text">
                    <h3>Photography&Retouching</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider"></div>

        {/* Team Section */}
        <section className="team" id="work">
          <h2 className="services-title">
            <span className="title-gray">Bring your idea into</span>
            <span className="title-black">visual storytelling</span>
          </h2>
          <div className="team-content">
            <div className="team-image">
              <img src="/assets/images/team.png" alt="Shooting Center team" className="team-image-placeholder" />
            </div>
            <div className="team-text">
              <p className="team-description">
                Đội ngũ Shooting Center được hình thành từ những sinh viên năng động của Đại học FPT
                <br /><br />
                Có chung niềm đam mê về truyền thông, công nghệ và khởi nghiệp sáng tạo.
                <br /><br />
                Mỗi thành viên đều đảm nhận một vai trò cụ thể, góp phần tạo nên sự cân bằng giữa tư duy kinh doanh – kỹ thuật – sáng tạo nội dung, giúp dự án vừa có tính thực tế, vừa có tiềm năng mở rộng lâu dài.
              </p>
            </div>
          </div>
          <h2 className="section-title team-title">OUR TEAM</h2>
          <p className="team-tagline">Filmmakers, Photographers, Creative</p>
        </section>
      </div>

      {/* Fixed Contact Us Button */}
      <button
        className="fixed-contact-button"
        onClick={() => setShowContactModal(true)}
      >
        <img src="/assets/images/icon-mail.png" alt="Mail" className="fixed-contact-icon" />
        Contact Us
      </button>

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

export default Home
