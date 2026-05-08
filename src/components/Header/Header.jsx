import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/use-auth.js'
import { useTheme } from '../../contexts/use-theme.js'
import { User, Menu } from 'lucide-react'
import './Header.css'

const Header = () => {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const logoSrc = theme === 'dark' ? '/logo-alt.png' : '/logo.png'

  const links = user
    ? [
        { to: '/dashboard', label: 'Inicio' },
        { to: '/ai-assistant', label: 'IA' },
        { to: '/social', label: 'Comunidad' },
        { to: '/my-travels', label: 'Experiencias' },
      ]
    : [
        { to: '/', label: 'Inicio' },
        { to: '/ai-assistant', label: 'Recomendaciones IA' },
        { to: '/social', label: 'Comunidad' },
      ]

  useEffect(() => {
    const onScroll = () => setIsScrolled(globalThis.scrollY > 8)
    onScroll()
    globalThis.addEventListener('scroll', onScroll)
    return () => globalThis.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-left">
          <button className="menu-toggle">
            <Menu size={24} />
          </button>
          <Link to="/" className="logo">
            <img src={logoSrc} alt="SmarTrip" className="logo-mark" />
          </Link>
        </div>
        
        <nav className="header-center">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-chip ${location.pathname === item.to ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="header-right">
          {user ? (
            <div className="user-menu">
              <button className="user-avatar" onClick={() => navigate('/profile')}>
                <User size={20} />
                <span>{user.firstName || user.username || 'Perfil'}</span>
              </button>
              <div className="user-dropdown">
                <Link to="/profile">Perfil</Link>
                <Link to="/my-travels">Mis Viajes</Link>
                <Link to="/travel-plans/create">Crear plan de viaje</Link>
                <Link to="/travel-preferences">Preferencias IA</Link>
                <button onClick={logout}>Cerrar sesion</button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Iniciar sesión</Link>
              <Link to="/register" className="btn btn-primary">Explorar recomendaciones</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
