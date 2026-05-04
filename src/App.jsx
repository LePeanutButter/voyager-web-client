import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import PrivateRoute from './components/PrivateRoute'

// Pages
import Home from './pages/Home/Home'
import Dashboard from './pages/Dashboard/Dashboard'
import AIAssistant from './pages/AIAssistant/AIAssistant'
import TravelPlanning from './pages/TravelPlanning/TravelPlanning'
import BusinessDashboard from './pages/BusinessDashboard/BusinessDashboard'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import GoogleCallbackPage from './pages/Auth/GoogleCallbackPage'
import ProfilePage from './pages/Profile/ProfilePage'
import TravelPreferencesPage from './pages/TravelPreferences/TravelPreferencesPage'
import Social from './pages/Social/Social'
import CreateTravelPlanPage from './pages/TravelPlanning/CreateTravelPlanPage'
import MyTravels from './pages/MyTravels/MyTravels'
import TravelDetails from './pages/TravelDetails/TravelDetails'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
                <Route path="auth/google/callback" element={<GoogleCallbackPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="ai-assistant" element={<AIAssistant />} />
                <Route path="travel-planning" element={<TravelPlanning />} />
                <Route path="business-dashboard" element={<BusinessDashboard />} />
                <Route path="social" element={<Social />} />
              </Route>

              {/* Private Routes (JWT token required) */}
              <Route element={<PrivateRoute />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="travel-preferences" element={<TravelPreferencesPage />} />
                <Route path="travel-plans/create" element={<CreateTravelPlanPage />} />
                <Route path="my-travels" element={<MyTravels />} />
                <Route path="travel-plans/:id" element={<TravelDetails />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
