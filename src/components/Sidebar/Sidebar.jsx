import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Compass, 
  Bot, 
  MapPin, 
  Briefcase, 
  Users, 
  Settings,
  Calendar,
  Heart,
  Luggage
} from 'lucide-react'
import './Sidebar.css'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/my-travels', icon: Luggage, label: 'Mis Viajes' },
    { path: '/travel-planning', icon: MapPin, label: 'Travel Planning' },
    { path: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
    { path: '/business-dashboard', icon: Briefcase, label: 'Business' },
    { path: '/social', icon: Users, label: 'Community' },
    { path: '/favorites', icon: Heart, label: 'Favorites' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/settings', icon: Settings, label: 'Settings' },
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
          <h4>Quick Actions</h4>
          <button className="quick-action-btn">Plan New Trip</button>
          <button className="quick-action-btn">Ask AI Assistant</button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
