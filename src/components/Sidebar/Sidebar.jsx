import { Link, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../../contexts/use-auth.js'
import { useAdaptiveUI } from '../../contexts/adaptive-ui-provider.jsx'
import { buildAdaptiveSidebarEntries } from '../../utils/adaptiveUiNav'
import {
  Home,
  Bot,
  Briefcase,
  Users,
  Settings,
  Calendar,
  Luggage,
  Compass,
  Star,
  UserCircle,
  Sparkles,
} from 'lucide-react'
import './Sidebar.css'

const ICON_BY_NAV_ID = {
  home: Home,
  discover: Compass,
  matching: Users,
  trips: Luggage,
  chat: Bot,
  bookmarks: Star,
  profile: UserCircle,
  preferences: Sparkles,
}

const DASHBOARD_PATH = '/dashboard'

const ICON_BY_PATH = {
  '/dashboard': Home,
  '/my-travels': Luggage,
  '/ai-assistant': Bot,
  '/social': Users,
  '/business-dashboard': Briefcase,
  '/calendar': Calendar,
  '/settings': Settings,
  '/profile': UserCircle,
  '/travel-preferences': Sparkles,
}

function pathIsActive(pathname, path) {
  if (pathname === path) return true
  if (path === DASHBOARD_PATH) return pathname === DASHBOARD_PATH
  return pathname.startsWith(`${path}/`)
}

function StaticSidebarNav({ menuItems, location, linkClassName = '' }) {
  return (
    <ul className="nav-list">
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = pathIsActive(location.pathname, item.path)
        return (
          <li key={`${item.path}-${item.navItemId || ''}`} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link ${linkClassName} ${isActive ? 'active' : ''}`.trim()}
              data-nav-item-id={item.navItemId}
              title={item.adaptationReason || undefined}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

StaticSidebarNav.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      navItemId: PropTypes.string,
      adaptationReason: PropTypes.string,
    })
  ).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
  linkClassName: PropTypes.string,
}

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()
  const { menuData } = useAdaptiveUI()
  const role = String(user?.role || '').toUpperCase()
  const canAccessBusiness = ['PROVIDER', 'BUSINESS', 'ADMIN'].includes(role)

  const staticMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Panel', navItemId: 'home' },
    { path: '/my-travels', icon: Luggage, label: 'Mis Viajes', navItemId: 'trips' },
    { path: '/ai-assistant', icon: Bot, label: 'Asistente IA', navItemId: 'chat' },
    ...(canAccessBusiness ? [{ path: '/business-dashboard', icon: Briefcase, label: 'Negocios' }] : []),
    { path: '/social', icon: Users, label: 'Comunidad', navItemId: 'matching' },
    { path: '/calendar', icon: Calendar, label: 'Calendario' },
    { path: '/settings', icon: Settings, label: 'Configuracion' },
  ]

  const adaptiveBuilt =
    user?.id && menuData ? buildAdaptiveSidebarEntries(menuData, { canAccessBusiness }) : null

  let mainNav = null
  let secondaryNav = null
  let fixedTail = []

  if (adaptiveBuilt && adaptiveBuilt.entries.length > 0) {
    const prim = adaptiveBuilt.entries.filter((e) => e.tier !== 'secondary')
    const sec = adaptiveBuilt.entries.filter((e) => e.tier === 'secondary')
    mainNav = prim.map((e) => ({
      path: e.path,
      label: e.label,
      icon: ICON_BY_NAV_ID[e.navItemId] || ICON_BY_PATH[e.path] || Home,
      navItemId: e.navItemId,
      adaptationReason: e.adaptationReason,
    }))
    secondaryNav = sec.map((e) => ({
      path: e.path,
      label: e.label,
      icon: ICON_BY_NAV_ID[e.navItemId] || ICON_BY_PATH[e.path] || Home,
      navItemId: e.navItemId,
      adaptationReason: e.adaptationReason,
    }))
    fixedTail = adaptiveBuilt.fixedTail.map((f) => ({
      ...f,
      icon: ICON_BY_PATH[f.path] || Settings,
    }))
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {mainNav ? (
          <>
            <StaticSidebarNav menuItems={mainNav} location={location} />
            {secondaryNav.length > 0 && (
              <>
                <p className="sidebar-nav-group-label">Mas</p>
                <ul className="nav-list">
                  {secondaryNav.map((item) => {
                    const Icon = item.icon
                    const isActive = pathIsActive(location.pathname, item.path)
                    return (
                      <li key={`${item.path}-sec-${item.navItemId}`} className="nav-item">
                        <Link
                          to={item.path}
                          className={`nav-link nav-link--secondary ${isActive ? 'active' : ''}`}
                          title={item.adaptationReason || undefined}
                          data-nav-item-id={item.navItemId}
                        >
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
            {fixedTail.length > 0 && (
              <>
                <p className="sidebar-nav-group-label">Tu cuenta</p>
                <ul className="nav-list">
                  {fixedTail.map((item) => {
                    const Icon = item.icon
                    const isActive = pathIsActive(location.pathname, item.path)
                    return (
                      <li key={item.path} className="nav-item">
                        <Link to={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </>
        ) : (
          <StaticSidebarNav menuItems={staticMenuItems} location={location} />
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="quick-actions">
          <h4>Acciones rapidas</h4>
          <Link to="/travel-plans/create" className="quick-action-btn">
            Planear nuevo viaje
          </Link>
          <Link to="/ai-assistant" className="quick-action-btn">
            Preguntar a IA
          </Link>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
