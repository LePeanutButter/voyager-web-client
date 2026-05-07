import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-provider.jsx'
import { ThemeProvider } from './contexts/theme-provider.jsx'
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
import TravelerChatPage from './pages/Social/TravelerChatPage'
import CreateTravelPlanPage from './pages/TravelPlanning/CreateTravelPlanPage'
import MyTravels from './pages/MyTravels/MyTravels'
import TravelDetails from './pages/TravelDetails/TravelDetails'
import PrivacyPolicyPage from './pages/Legal/PrivacyPolicyPage'
import TermsPage from './pages/Legal/TermsPage'
import CookiesPage from './pages/Legal/CookiesPage'
import CalendarPage from './pages/Calendar/CalendarPage'
import SettingsPage from './pages/Settings/SettingsPage'

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
              <Route path="privacy" element={<PrivacyPolicyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="cookies" element={<CookiesPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="ai-assistant" element={<AIAssistant />} />
                <Route path="travel-planning" element={<TravelPlanning />} />
                <Route path="social" element={<Social />} />
                <Route path="social/chat/:connectionId" element={<TravelerChatPage />} />
                <Route path="calendar" element={<CalendarPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['PROVIDER', 'BUSINESS', 'ADMIN']} />}>
                <Route path="business-dashboard" element={<BusinessDashboard />} />
              </Route>

              {/* Private Routes (JWT token required) */}
              <Route element={<PrivateRoute />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="travel-preferences" element={<TravelPreferencesPage />} />
                <Route path="travel-plans/create" element={<CreateTravelPlanPage />} />
                <Route path="my-travels" element={<MyTravels />} />
                <Route path="travel-plans/:id" element={<TravelDetails />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
