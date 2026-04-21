import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/Auth/ProtectedRoute'

// Pages
import Home from './pages/Home/Home'
import Dashboard from './pages/Dashboard/Dashboard'
import AIAssistant from './pages/AIAssistant/AIAssistant'
import TravelPlanning from './pages/TravelPlanning/TravelPlanning'
import BusinessDashboard from './pages/BusinessDashboard/BusinessDashboard'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Profile from './pages/Profile/Profile'
import Social from './pages/Social/Social'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="ai-assistant" element={<AIAssistant />} />
                <Route path="travel-planning" element={<TravelPlanning />} />
                <Route path="business-dashboard" element={<BusinessDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="social" element={<Social />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
