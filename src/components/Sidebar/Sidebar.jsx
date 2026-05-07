import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/use-auth.js'
import { 
  Home, 
  Bot, 
  MapPin, 
  Briefcase, 
  Users, 
  Settings,
  Calendar,
  Luggage
} from 'lucide-react'
import './Sidebar.css'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()
  const role = String(user?.role || '').toUpperCase()
  const canAccessBusiness = ['PROVIDER', 'BUSINESS', 'ADMIN'].includes(role)

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Panel' },
    { path: '/my-travels', icon: Luggage, label: 'Mis Viajes' },
    { path: '/travel-planning', icon: MapPin, label: 'Planificacion' },
    { path: '/ai-assistant', icon: Bot, label: 'Asistente IA' },
    ...(canAccessBusiness ? [{ path: '/business-dashboard', icon: Briefcase, label: 'Negocios' }] : []),
    { path: '/social', icon: Users, label: 'Comunidad' },
    { path: '/calendar', icon: Calendar, label: 'Calendario' },
    { path: '/settings', icon: Settings, label: 'Configuracion' },
  ]

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="quick-actions">
          <h4>Acciones rapidas</h4>
          <Link to="/travel-plans/create" className="quick-action-btn">Planear nuevo viaje</Link>
          <Link to="/ai-assistant" className="quick-action-btn">Preguntar a IA</Link>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
