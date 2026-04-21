import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Search, Bell, User, Menu, Globe } from 'lucide-react'
import './Header.css'

const Header = () => {
  const { user, logout } = useAuth()

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button className="menu-toggle">
            <Menu size={24} />
          </button>
          <Link to="/" className="logo">
            <Globe size={32} />
            <span>TourismAI</span>
          </Link>
        </div>
        
        <div className="header-center">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input type="text" placeholder="Search destinations, activities, or tips..." />
          </div>
        </div>
        
        <div className="header-right">
          <button className="icon-button">
            <Bell size={20} />
          </button>
          
          {user ? (
            <div className="user-menu">
              <button className="user-avatar">
                <User size={20} />
                <span>{user.name}</span>
              </button>
              <div className="user-dropdown">
                <Link to="/profile">Profile</Link>
                <Link to="/settings">Settings</Link>
                <button onClick={logout}>Logout</button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
