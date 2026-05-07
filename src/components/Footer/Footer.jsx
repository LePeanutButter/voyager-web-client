import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <img src="/logo-alt.svg" alt="SmarTrip" className="footer-logo" />
            <p>Recomendaciones inteligentes, conexiones humanas y experiencias personalizadas en un solo producto.</p>
          </div>
          
          <div className="footer-section">
            <h4>Producto</h4>
            <ul>
              <li><Link to="/ai-assistant">Recomendaciones IA</Link></li>
              <li><Link to="/social">Comunidad</Link></li>
              <li><Link to="/travel-preferences">Perfil inteligente</Link></li>
              <li><Link to="/my-travels">Experiencias</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Compañía</h4>
            <ul>
              <li><Link to="/dashboard">Plataforma</Link></li>
              <li><Link to="/business-dashboard">Negocios</Link></li>
              <li><Link to="/profile">Cuenta</Link></li>
              <li><Link to="/register">Crear cuenta</Link></li>
            </ul>
          </div>
          
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2026 SmarTrip. Todos los derechos reservados.</p>
            <div className="footer-links">
              <Link to="/privacy">Politica de privacidad</Link>
              <Link to="/terms">Terminos</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
