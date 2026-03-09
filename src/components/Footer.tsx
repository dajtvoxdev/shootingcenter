import './Footer.css'

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-content">
        <div className="footer-main">
          <h2 className="footer-title">
            <span>Let's build</span>
            <span className="footer-title-gray">incredible work together</span>
          </h2>
          <div className="footer-info">
            <div className="footer-contact">
              <p className="footer-label">email</p>
              <a href="mailto:shootingteam@gmail.com" className="footer-email">shootingteam@gmail.com</a>
            </div>
            <div className="footer-social">
              <p className="footer-label">social</p>
              <div className="social-icons">
                <a href="#" className="social-icon" aria-label="Instagram">
                  <img src="/assets/images/social-instagram.png" alt="Instagram" />
                </a>
                <a href="#" className="social-icon" aria-label="Behance">
                  <img src="/assets/images/social-behance.png" alt="Behance" />
                </a>
                <a href="#" className="social-icon" aria-label="YouTube">
                  <img src="/assets/images/social-youtube.png" alt="YouTube" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-location-text">Base in Hanoi, Vietnam</p>
          <div className="footer-links">
            <a href="#" className="footer-link">Terms of service</a>
            <a href="#" className="footer-link">Privacy Policy</a>
          </div>
          <p className="footer-copyright">@2025 shooting team</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
