import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className={`nav-logo ${isActive('/') ? 'active' : ''}`} onClick={closeMobileMenu}>
          <img src="/assets/images/logo.png" alt="SCenter" className="logo-img" />
          <span className="logo-text">SCenter</span>
        </Link>
        <div className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/work" className={`nav-link ${isActive('/work') ? 'active' : ''}`} onClick={closeMobileMenu}>Work</Link>
          <Link to="/service" className={`nav-link ${isActive('/service') ? 'active' : ''}`} onClick={closeMobileMenu}>Service</Link>
          <Link to="/equipment" className={`nav-link ${isActive('/equipment') ? 'active' : ''}`} onClick={closeMobileMenu}>Equipment</Link>
        </div>
        <Link to="/contact" className={`contact-button ${isActive('/contact') ? 'active' : ''}`} onClick={closeMobileMenu}>Contact</Link>
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>
    </nav>
  )
}

export default Navigation
