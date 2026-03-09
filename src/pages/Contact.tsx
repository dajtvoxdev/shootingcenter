import '../App.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import ContactForm from '../components/ContactForm'

function Contact() {
  return (
    <>
      <div className="homepage">
        <Navigation />

        {/* Contact Page Content */}
        <section className="contact-page">
          <div className="contact-content">
            <h1 className="contact-title">Contact</h1>
            <p className="contact-subtitle">Fill out the form below.</p>
            
            <ContactForm showInfo={true} />
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  )
}

export default Contact
