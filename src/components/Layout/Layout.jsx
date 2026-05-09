import { useRef, useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer'
import './Layout.css'

const Layout = () => {
  const location = useLocation()
  const mainRef = useRef(null)

  /**
   * El área de página vive en <main className="main-content"> con overflow-y: auto.
   * Sin esto, al cambiar de ruta se mantiene el scroll del main y parece que te “tiran” al footer.
   */
  useLayoutEffect(() => {
    const main = mainRef.current
    if (main) main.scrollTop = 0
    window.scrollTo(0, 0)
  }, [location.pathname, location.search])

  const marketingPaths = new Set(['/', '/login', '/register', '/auth/google/callback'])
  const hideSidebar = marketingPaths.has(location.pathname)

  return (
    <div className="layout">
      <Header />
      <div className="layout-content">
        {!hideSidebar && <Sidebar />}
        <main ref={mainRef} className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Layout
