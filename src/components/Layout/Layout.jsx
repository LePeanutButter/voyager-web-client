import { Outlet, useLocation } from 'react-router-dom'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer'
import './Layout.css'

const Layout = () => {
  const location = useLocation()
  const marketingPaths = new Set(['/', '/login', '/register', '/auth/google/callback'])
  const hideSidebar = marketingPaths.has(location.pathname)

  return (
    <div className="layout">
      <Header />
      <div className="layout-content">
        {!hideSidebar && <Sidebar />}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Layout
