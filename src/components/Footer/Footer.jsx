import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>TourismAI Platform</h3>
            <p>Your intelligent travel companion for discovering amazing destinations and planning perfect trips.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/destinations">Popular Destinations</Link></li>
              <li><Link to="/activities">Activities</Link></li>
              <li><Link to="/travel-guides">Travel Guides</Link></li>
              <li><Link to="/deals">Travel Deals</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><Link to="/ai-assistant">AI Assistant</Link></li>
              <li><Link to="/travel-planning">Trip Planning</Link></li>
              <li><Link to="/business-dashboard">Business Portal</Link></li>
              <li><Link to="/social">Community</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact</h4>
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={16} />
                <span>support@tourismai.com</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>123 Travel St, Tourism City, TC 12345</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 TourismAI Platform. All rights reserved.</p>
            <div className="footer-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
